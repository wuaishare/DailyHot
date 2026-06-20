const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const repoRoot = path.resolve(__dirname, "..");
const subtypeSourcePath = path.join(repoRoot, "src", "utils", "sourceSubtypes.js");
const siteUrl = (process.env.LIVE_SITE_URL || "https://hot.wuaishare.cn").replace(
  /\/+$/,
  ""
);
const verify = process.env.VERIFY || process.env.VITE_BUILD_NUMBER || "subtype-audit";
const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS || 20000);
const concurrency = Number(process.env.SUBTYPE_AUDIT_CONCURRENCY || 6);
const dataSourceEnv = process.env.SUBTYPE_DATA_SOURCES || "";

const DEFAULT_DATA_SOURCES = [
  "ithome",
  "designarena",
  "arena-ai",
  "artificialanalysis",
  "aicpb-rankings",
  "llm-stats",
  "openai",
  "huggingface",
  "openrouter-rankings",
  "clawhub",
  "github",
  "tianya",
];
const DEFAULT_SOURCE_CASES = ["sspai"];
const METADATA_OPTIONAL_SOURCES = new Set([
  "arena-ai",
  "artificialanalysis",
  "aicpb-rankings",
  "llm-stats",
  "openai",
  "huggingface",
  "openrouter-rankings",
  "clawhub",
  "clawhub-skills",
  "clawhub-plugins",
  "linuxdo",
]);
const API_PARAM_ALIASES = {
  nytimes: {
    area: "type",
  },
};
const IGNORED_API_PARAM_VALUES = {
  tianya: {
    type: new Set(["featured", "latest"]),
  },
};
const PLACEHOLDER_LABEL_PATTERN = /^(暂无|暫無|none|n\/a|-)?$/i;

const extractLiteral = (source, constName) => {
  const token = `const ${constName} =`;
  const start = source.indexOf(token);
  if (start < 0) throw new Error(`unable to find ${constName}`);

  let index = start + token.length;
  while (/\s/.test(source[index])) index += 1;

  const opener = source[index];
  const closer = { "{": "}", "[": "]" }[opener];
  if (!closer) throw new Error(`unsupported literal for ${constName}`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(index, cursor + 1);
    }
  }
  throw new Error(`unable to extract literal for ${constName}`);
};

const parseConstant = (source, constName) =>
  Function(`"use strict"; return (${extractLiteral(source, constName)});`)();

const withVerify = (requestPath) => {
  const url = new URL(`${siteUrl}${requestPath}`);
  if (verify) url.searchParams.set("verify", verify);
  return url;
};

const fetchJson = async (url, attempts = 2) => {
  let lastError;
  let lastResult;
  for (let index = 0; index < attempts; index += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "DailyHot subtype audit",
        },
        signal: controller.signal,
      });
      const text = await response.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {}
      lastResult = {
        status: response.status,
        json,
        text,
      };
      if (response.status < 500 && response.status !== 429) return lastResult;
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
    if (index < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  if (lastResult) return lastResult;
  throw lastError;
};

const flattenSubtypeOptions = (groups, sourceName = "") =>
  (groups[sourceName] || []).flatMap((group) =>
    (group.items || []).map((item) => ({
      source: sourceName,
      group: group.key,
      label: item.label,
      value: item.value,
      param: group.param || "type",
      apiValue: item.apiValue || item.value,
    }))
  );

const buildFrontendParamMap = (groups, sourceName) => {
  const map = new Map();
  flattenSubtypeOptions(groups, sourceName).forEach((item) => {
    if (!map.has(item.param)) map.set(item.param, new Set());
    map.get(item.param).add(String(item.apiValue));
  });
  return map;
};

const normalizeApiParams = (sourceName, params = {}) => {
  const aliases = API_PARAM_ALIASES[sourceName] || {};
  return Object.fromEntries(
    Object.entries(params).map(([param, meta]) => [aliases[param] || param, meta])
  );
};

const getApiParamKeys = (meta = {}) =>
  Object.entries(meta.type || {})
    .filter(([, label]) => !PLACEHOLDER_LABEL_PATTERN.test(String(label || "").trim()))
    .map(([key]) => String(key));

const getIgnoredApiParamValues = (sourceName, param) =>
  IGNORED_API_PARAM_VALUES[sourceName]?.[param] || new Set();

const getDataSources = (groups) => {
  if (dataSourceEnv.trim().toLowerCase() === "all") {
    return new Set(Object.keys(groups));
  }
  if (dataSourceEnv.trim()) {
    return new Set(
      dataSourceEnv
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }
  return new Set(DEFAULT_DATA_SOURCES);
};

const checkMetadata = async (groups, sourceName) => {
  const frontendParams = buildFrontendParamMap(groups, sourceName);
  if (!frontendParams.size) return [];

  const url = withVerify(`/api/${sourceName}`);
  url.searchParams.set("cache", "false");
  const result = await fetchJson(url.toString(), 2);
  if (result.status !== 200 || result.json?.code !== 200) {
    return [`${sourceName}: default API returned HTTP ${result.status}`];
  }

  const apiParams = normalizeApiParams(sourceName, result.json.params || {});
  const issues = [];
  for (const [param, configuredValues] of frontendParams.entries()) {
    const apiMeta = apiParams[param];
    if (!apiMeta?.type) {
      if (!METADATA_OPTIONAL_SOURCES.has(sourceName)) {
        issues.push(`${sourceName}: API params missing ${param}`);
      }
      continue;
    }
    const ignoredValues = getIgnoredApiParamValues(sourceName, param);
    const apiValues = new Set(
      getApiParamKeys(apiMeta).filter((value) => !ignoredValues.has(value))
    );
    const missingInFrontend = [...apiValues].filter((value) => !configuredValues.has(value));
    const staleFrontend = [...configuredValues].filter((value) => !apiValues.has(value));
    if (missingInFrontend.length || staleFrontend.length) {
      issues.push(
        `${sourceName}/${param}: missingFrontend=${
          missingInFrontend.join(",") || "-"
        } staleFrontend=${staleFrontend.join(",") || "-"}`
      );
    }
  }
  return issues;
};

const buildDataCases = (groups) => {
  const dataSources = getDataSources(groups);
  const cases = DEFAULT_SOURCE_CASES.map((source) => ({
    source,
    label: "default",
    param: "",
    apiValue: "",
  }));

  for (const source of dataSources) {
    flattenSubtypeOptions(groups, source).forEach((item) => cases.push(item));
  }
  return cases;
};

const checkDataCase = async (item) => {
  const url = withVerify(`/api/${item.source}`);
  url.searchParams.set("cache", "false");
  if (item.param) {
    url.searchParams.set(item.param, item.apiValue);
  }
  const result = await fetchJson(url.toString(), 3);
  const json = result.json || {};
  const total = Array.isArray(json.data) ? json.data.length : Number(json.total || 0);
  const ok = result.status === 200 && json.code === 200 && total > 0;
  return {
    ...item,
    ok,
    status: result.status,
    code: json.code,
    type: json.type || json.subtitle || "",
    total,
    message: json.message || (!result.json ? result.text.slice(0, 80) : ""),
  };
};

const runLimited = async (items, worker) => {
  let cursor = 0;
  const results = [];
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index]);
      }
    })
  );
  return results;
};

const main = async () => {
  const subtypeSource = fs.readFileSync(subtypeSourcePath, "utf8");
  const groups = parseConstant(subtypeSource, "SOURCE_SUBTYPE_GROUPS");
  const sources = Object.keys(groups);
  const failures = [];

  const duplicateIssues = [];
  sources.forEach((sourceName) => {
    const seen = new Set();
    flattenSubtypeOptions(groups, sourceName).forEach((item) => {
      const key = `${item.param}:${item.value}`;
      if (seen.has(key)) duplicateIssues.push(`${sourceName}: duplicate ${key}`);
      seen.add(key);
    });
  });
  duplicateIssues.forEach((issue) => failures.push(issue));

  console.log(`[subtypes] metadata compare for ${sources.length} configured sources`);
  const metadataResults = await runLimited(sources, (sourceName) =>
    checkMetadata(groups, sourceName)
  );
  metadataResults.flat().forEach((issue) => failures.push(issue));

  const dataCases = buildDataCases(groups);
  console.log(`[subtypes] data check for ${dataCases.length} configured/default cases`);
  const dataResults = await runLimited(dataCases, checkDataCase);
  dataResults.forEach((result) => {
    const route = result.param ? `${result.param}=${result.apiValue}` : "default";
    if (result.ok) {
      console.log(`PASS ${result.source} ${route} ${result.type} ${result.total}`);
      return;
    }
    failures.push(
      `${result.source} ${route}: HTTP ${result.status} code=${result.code} total=${
        result.total
      } ${result.message || ""}`.trim()
    );
  });

  if (failures.length) {
    console.error(`[subtypes] ${failures.length} issue(s)`);
    failures.forEach((issue) => console.error(`FAIL ${issue}`));
    process.exit(1);
  }
  console.log(`[subtypes] all checks passed for ${siteUrl}`);
};

main().catch((error) => {
  console.error("[subtypes] failed", error);
  process.exit(1);
});
