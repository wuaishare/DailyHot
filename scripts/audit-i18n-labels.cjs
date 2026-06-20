const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const sourceLabelsPath = path.join(repoRoot, "src", "utils", "sourceLabels.js");
const sourceSubtypesPath = path.join(repoRoot, "src", "utils", "sourceSubtypes.js");
const storePath = path.join(repoRoot, "src", "store", "index.js");
const locales = ["zh-CN", "en", "zh-TW", "ja", "ko"];

const read = (filePath) => fs.readFileSync(filePath, "utf8");

const extractLiteral = (source, token) => {
  const start = source.indexOf(token);
  if (start < 0) throw new Error(`unable to find ${token}`);

  let index = start + token.length;
  while (/\s/.test(source[index])) index += 1;

  const opener = source[index];
  const closer = { "{": "}", "[": "]" }[opener];
  if (!closer) throw new Error(`unsupported literal for ${token}`);

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
  throw new Error(`unable to extract literal for ${token}`);
};

const parseConstant = (source, constName) =>
  Function(`"use strict"; return (${extractLiteral(source, `const ${constName} =`)});`)();

const normalizeLabel = (value = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const containsHan = (value = "") => /[\u3400-\u9fff]/.test(String(value || ""));
const containsLatin = (value = "") => /[A-Za-z]/.test(String(value || ""));

const isAuditableEnglishPhrase = (value = "") => {
  const normalized = normalizeLabel(value);
  if (!containsLatin(normalized)) return false;
  const words = normalized.match(/[A-Za-z]+(?:[/-][A-Za-z]+)*/g) || [];
  if (words.length >= 2) return true;
  return /[&/()]/.test(normalized);
};

const needsLocaleAudit = (value = "") =>
  containsHan(value) || isAuditableEnglishPhrase(value);

const hasLocaleLabel = (map, key, locale) =>
  Boolean(map?.[normalizeLabel(key)]?.[locale]);

const addMissingLocaleIssues = ({
  issues,
  map,
  keys,
  label,
  context,
}) => {
  if (!needsLocaleAudit(label)) return;
  locales.forEach((locale) => {
    const hasAnyKey = keys.some((key) => hasLocaleLabel(map, key, locale));
    if (!hasAnyKey) {
      issues.push(`${context}: "${label}" missing ${locale}`);
    }
  });
};

const getConfiguredSources = (storeSource) =>
  [...storeSource.matchAll(/label:\s*"([^"]+)"\s*,\s*name:\s*"([^"]+)"/g)].map(
    (match) => ({ label: match[1], name: match[2] })
  );

const getConfiguredSubtitles = (storeSource) =>
  [...storeSource.matchAll(/subtype:\s*"([^"]+)"/g)].map((match) => match[1]);

const main = () => {
  const sourceLabelsSource = read(sourceLabelsPath);
  const sourceSubtypesSource = read(sourceSubtypesPath);
  const storeSource = read(storePath);

  const sourceLabelOverrides = parseConstant(
    sourceLabelsSource,
    "SOURCE_LABEL_OVERRIDES"
  );
  const sourceLabelLocalizations = parseConstant(
    sourceLabelsSource,
    "SOURCE_LABEL_LOCALIZATIONS"
  );
  Object.entries(sourceLabelLocalizations).forEach(([sourceName, labels]) => {
    sourceLabelOverrides[sourceName] = {
      ...(sourceLabelOverrides[sourceName] || {}),
      ...labels,
    };
  });

  const groupLabelOverrides = parseConstant(
    sourceLabelsSource,
    "GROUP_LABEL_OVERRIDES"
  );
  const subtypeLabelOverrides = parseConstant(
    sourceLabelsSource,
    "SUBTYPE_LABEL_OVERRIDES"
  );
  Object.assign(
    subtypeLabelOverrides,
    parseConstant(sourceLabelsSource, "COMMON_SUBTYPE_LABEL_OVERRIDES")
  );
  const sourceSubtypeGroups = parseConstant(
    sourceSubtypesSource,
    "SOURCE_SUBTYPE_GROUPS"
  );

  const issues = [];

  Object.entries(sourceSubtypeGroups).forEach(([sourceName, groups]) => {
    groups.forEach((group) => {
      const rawGroupLabel = normalizeLabel(group.label || "");
      const groupKey = normalizeLabel(
        group.key || rawGroupLabel || group.items?.[0]?.value || ""
      );
      addMissingLocaleIssues({
        issues,
        map: groupLabelOverrides,
        keys: [groupKey, rawGroupLabel],
        label: rawGroupLabel,
        context: `${sourceName} group ${groupKey || "(default)"}`,
      });

      (group.items || []).forEach((item) => {
        const rawItemLabel = normalizeLabel(item.label || "");
        const itemKey = normalizeLabel(item.value || rawItemLabel);
        addMissingLocaleIssues({
          issues,
          map: subtypeLabelOverrides,
          keys: [itemKey, rawItemLabel],
          label: rawItemLabel,
          context: `${sourceName} item ${itemKey || "(default)"}`,
        });
      });
    });
  });

  getConfiguredSources(storeSource).forEach(({ label, name }) => {
    addMissingLocaleIssues({
      issues,
      map: sourceLabelOverrides,
      keys: [name],
      label,
      context: `${name} source label`,
    });
  });

  getConfiguredSubtitles(storeSource).forEach((label) => {
    addMissingLocaleIssues({
      issues,
      map: subtypeLabelOverrides,
      keys: [label],
      label,
      context: `store subtitle`,
    });
  });

  if (issues.length) {
    console.error(`[i18n-labels] ${issues.length} missing localized labels`);
    issues.forEach((issue) => console.error(`FAIL ${issue}`));
    process.exit(1);
  }

  console.log(
    `[i18n-labels] checked source labels, source subtitles, and ${Object.keys(sourceSubtypeGroups).length} subtype groups for ${locales.join(", ")}`
  );
};

main();
