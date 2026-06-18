const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, "dist");
const indexHtmlPath = path.join(distDir, "index.html");
const seoSourcePath = path.join(repoRoot, "src", "utils", "seo.js");
const storeSourcePath = path.join(repoRoot, "src", "store", "index.js");
const subtypeSourcePath = path.join(repoRoot, "src", "utils", "sourceSubtypes.js");

const CATEGORY_ROUTES = [
  { name: "综合", slug: "general" },
  { name: "科技", slug: "tech" },
  { name: "生活", slug: "life" },
  { name: "游戏", slug: "games" },
  { name: "社区", slug: "community" },
  { name: "AI", slug: "ai" },
];

const normalizeSiteUrl = (value = "") => String(value).replace(/\/+$/, "");
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || "");
const brandNameZh = "吾爱热榜";

const ensureFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`required file not found: ${filePath}`);
  }
};

const extractLiteral = (source, constName) => {
  const marker = `const ${constName} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`unable to find constant ${constName}`);
  }

  let index = markerIndex + marker.length;
  while (index < source.length && /\s/.test(source[index])) {
    index += 1;
  }

  const opener = source[index];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : null;
  if (!closer) {
    throw new Error(`unsupported literal opener for ${constName}: ${opener}`);
  }

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }

    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(index, cursor + 1);
      }
    }
  }

  throw new Error(`unable to extract literal for ${constName}`);
};

const parseConstant = (source, constName) =>
  Function(`"use strict"; return (${extractLiteral(source, constName)});`)();

const trimTerminalPunctuation = (value = "") =>
  String(value)
    .trim()
    .replace(/[。！？!?,，；;：:]+$/gu, "");

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripLeadingPhrases = (value = "", phrases = []) =>
  phrases
    .filter(Boolean)
    .reduce(
      (result, phrase) =>
        result.replace(new RegExp(`^${escapeRegExp(String(phrase).trim())}[\\s·:：-]*`, "u"), ""),
      String(value).trim()
    )
    .trim();

const normalizeTitleLabel = (value = "") =>
  String(value)
    .replace(/\s*·\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const keywordTokensFrom = (value) =>
  Array.isArray(value)
    ? value.flatMap((item) => keywordTokensFrom(item))
    : String(value || "")
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);

const mergeKeywords = (...segments) =>
  [...new Set(segments.flatMap((segment) => keywordTokensFrom(segment)))].join(",");

const buildZhTitle = (main, detail) =>
  detail
    ? `${normalizeTitleLabel(main)} - ${detail} | ${brandNameZh}`
    : `${normalizeTitleLabel(main)} | ${brandNameZh}`;

const prettifySlug = (value = "") =>
  String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (token) => token.toUpperCase());

const getSubtypeLabelMap = (sourceText) => {
  const blockMatches = [...sourceText.matchAll(/"([^"]+)":\s*\[(.*?)\n\s*\],/gs)];
  const result = new Map();

  for (const [, sourceName, block] of blockMatches) {
    const subtypeMap = new Map();
    const itemMatches = [
      ...block.matchAll(/\{\s*label:\s*"([^"]+)",\s*value:\s*"([^"]+)"\s*\}/g),
    ];
    itemMatches.forEach(([, label, value]) => {
      subtypeMap.set(value, label);
    });
    result.set(sourceName, subtypeMap);
  }

  return result;
};

const getSourceNames = (storeText) => [
  ...new Set([...storeText.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1])),
];

const getSubtypeValues = (sourceText) => {
  const blockMatches = [...sourceText.matchAll(/"([^"]+)":\s*\[(.*?)\n\s*\],/gs)];
  const result = new Map();

  for (const [, sourceName, block] of blockMatches) {
    const values = [...block.matchAll(/value:\s*"([^"]+)"/g)].map((match) => match[1]);
    result.set(sourceName, values);
  }

  return result;
};

const ensureMetaTag = (html, matcher, replacement, insertBefore = "</head>") => {
  if (matcher.test(html)) {
    return html.replace(matcher, replacement);
  }
  return html.replace(insertBefore, `${replacement}\n  ${insertBefore}`);
};

const setHtmlMeta = (html, { title, description, keywords, canonical }) => {
  let next = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  next = ensureMetaTag(
    next,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );
  next = ensureMetaTag(
    next,
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/,
    `<meta name="keywords" content="${keywords}" />`
  );
  next = ensureMetaTag(
    next,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  next = ensureMetaTag(
    next,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  next = ensureMetaTag(
    next,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  next = ensureMetaTag(
    next,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  );

  if (canonical) {
    next = ensureMetaTag(
      next,
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonical}" />`
    );
    next = ensureMetaTag(
      next,
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canonical}" />`
    );
  }

  return next;
};

const buildAbsoluteUrl = (pathname) => {
  if (!siteUrl) return "";
  return `${siteUrl}${pathname}`;
};

function main() {
  ensureFile(indexHtmlPath);
  ensureFile(seoSourcePath);
  ensureFile(storeSourcePath);
  ensureFile(subtypeSourcePath);

  const template = fs.readFileSync(indexHtmlPath, "utf8");
  const seoSource = fs.readFileSync(seoSourcePath, "utf8");
  const storeSource = fs.readFileSync(storeSourcePath, "utf8");
  const subtypeSource = fs.readFileSync(subtypeSourcePath, "utf8");

  const categorySeoMap = parseConstant(seoSource, "CATEGORY_SEO_MAP");
  const listSeoMap = parseConstant(seoSource, "LIST_SEO_MAP");
  const sourceNames = getSourceNames(storeSource);
  const subtypeValues = getSubtypeValues(subtypeSource);
  const subtypeLabelMap = getSubtypeLabelMap(subtypeSource);

  const writeRouteShell = (pathname, meta) => {
    const outputPath = path.join(distDir, pathname.replace(/^\/+/, ""), "index.html");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, setHtmlMeta(template, meta));
  };

  CATEGORY_ROUTES.forEach((category) => {
    const meta = categorySeoMap[category.name];
    if (!meta) return;
    writeRouteShell(`/category/${category.slug}`, {
      title: buildZhTitle(meta.title, meta.titleTail),
      description: meta.description,
      keywords: mergeKeywords(meta.keywords, category.name, brandNameZh),
      canonical: buildAbsoluteUrl(`/category/${category.slug}`),
    });
  });

  sourceNames.forEach((sourceName) => {
    const meta = listSeoMap[sourceName] || listSeoMap.default || {};
    const sourceLabel = meta.label || prettifySlug(sourceName);
    const rawDescription = trimTerminalPunctuation(meta.description || "实时热榜与趋势榜");
    const baseIntent = stripLeadingPhrases(rawDescription, [sourceLabel]) || "实时热榜与趋势榜";

    writeRouteShell(`/rank/${sourceName}`, {
      title: buildZhTitle(sourceLabel, baseIntent),
      description: `${sourceLabel}页面，聚合${baseIntent}、对应平台最新数据与原站入口，支持实时浏览、榜单切换、分页跳转与一键直达。`,
      keywords: mergeKeywords(meta.keywords, sourceLabel, baseIntent, brandNameZh),
      canonical: buildAbsoluteUrl(`/rank/${sourceName}`),
    });

    (subtypeValues.get(sourceName) || []).forEach((subtypeValue) => {
      const subtypeLabel =
        subtypeLabelMap.get(sourceName)?.get(subtypeValue) || prettifySlug(subtypeValue);
      const titleLabel = normalizeTitleLabel(`${sourceLabel} ${subtypeLabel}`);
      const intent =
        stripLeadingPhrases(rawDescription, [sourceLabel, subtypeLabel]) || baseIntent;

      writeRouteShell(`/rank/${sourceName}/${subtypeValue}`, {
        title: buildZhTitle(titleLabel, intent),
        description: `${titleLabel}页面，聚合${intent}、对应平台最新数据与原站入口，支持实时浏览、榜单切换、分页跳转与一键直达。`,
        keywords: mergeKeywords(
          meta.keywords,
          sourceLabel,
          subtypeLabel,
          intent,
          titleLabel,
          brandNameZh
        ),
        canonical: buildAbsoluteUrl(`/rank/${sourceName}/${subtypeValue}`),
      });
    });
  });

  console.log(
    `[seo-shell] generated ${CATEGORY_ROUTES.length + sourceNames.length} base route shells and subtype detail shells`
  );
}

main();
