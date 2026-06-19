const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, "dist");
const indexHtmlPath = path.join(distDir, "index.html");
const seoSourcePath = path.join(repoRoot, "src", "utils", "seo.js");
const storeSourcePath = path.join(repoRoot, "src", "store", "index.js");
const subtypeSourcePath = path.join(repoRoot, "src", "utils", "sourceSubtypes.js");
const sourceLabelsPath = path.join(repoRoot, "src", "utils", "sourceLabels.js");
const messagesPath = path.join(repoRoot, "src", "i18n", "messages.js");
const siteMetadataPath = path.join(repoRoot, "src", "config", "site-metadata.mjs");

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

const stripLeadingZhPossessive = (value = "") =>
  String(value)
    .trim()
    .replace(/^的[\s·:：-]*/u, "")
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

const appendZhPageSuffix = (label = "") =>
  /[A-Za-z0-9]$/u.test(String(label).trim())
    ? `${String(label).trim()} 页面`
    : `${String(label).trim()}页面`;

const joinZhVerbObject = (verb, object = "") =>
  /^[A-Za-z0-9]/u.test(String(object).trim())
    ? `${verb} ${String(object).trim()}`
    : `${verb}${String(object).trim()}`;

const getClawHubSubtypeSeoKey = (sourceName, subtypeValue) => {
  if (!subtypeValue) return "";
  if (sourceName === "clawhub") return subtypeValue;
  if (sourceName === "clawhub-skills") return `skills-${subtypeValue}`;
  if (sourceName === "clawhub-plugins") return `plugins-${subtypeValue}`;
  return "";
};

const getClawHubZhRouteSeo = ({
  sourceName,
  subtypeValue,
  clawHubZhBaseSeo,
  clawHubZhSubtypeSeo,
}) => {
  const baseSeo = clawHubZhBaseSeo?.[sourceName];
  if (!baseSeo) return null;

  const subtypeSeo = clawHubZhSubtypeSeo?.[
    getClawHubSubtypeSeoKey(sourceName, subtypeValue)
  ];
  if (subtypeSeo) {
    return {
      titleLabel: normalizeTitleLabel(`ClawHub ${subtypeSeo.titleSegment}`),
      intent: subtypeSeo.intent,
    };
  }

  return baseSeo;
};

const prettifySlug = (value = "") =>
  String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (token) => token.toUpperCase());

const getSubtypeLabelMap = (sourceSubtypeGroups) => {
  const result = new Map();

  for (const [sourceName, groups] of Object.entries(sourceSubtypeGroups)) {
    const subtypeMap = new Map();
    (groups || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        if (item?.value) {
          subtypeMap.set(item.value, item.label || "");
        }
      });
    });
    result.set(sourceName, subtypeMap);
  }

  return result;
};

const getLocalizedSubtypeLabel = (
  subtypeLabelOverrides,
  subtypeValue,
  rawLabel,
  locale = "zh-CN"
) => {
  const valueOverride = subtypeLabelOverrides[subtypeValue];
  const labelOverride = subtypeLabelOverrides[rawLabel];
  if (valueOverride?.[locale]) return valueOverride[locale];
  if (labelOverride?.[locale]) return labelOverride[locale];
  if (locale === "zh-CN" || locale === "zh-TW") {
    return rawLabel || prettifySlug(subtypeValue);
  }
  if (rawLabel && !/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(rawLabel)) {
    return rawLabel;
  }
  return prettifySlug(subtypeValue);
};

const getLocalizedSourceLabel = (
  sourceLabelOverrides,
  sourceName,
  fallbackLabel,
  locale = "zh-CN"
) => {
  const overrides = sourceLabelOverrides[sourceName] || null;
  if (overrides?.[locale]) return overrides[locale];
  if ((locale === "zh-CN" || locale === "zh-TW") && fallbackLabel) {
    return fallbackLabel;
  }
  if (overrides?.en) return overrides.en;
  if (fallbackLabel && !/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(fallbackLabel)) {
    return fallbackLabel;
  }
  return prettifySlug(sourceName || fallbackLabel || "rankings");
};

const getSourceNames = (storeText) => {
  const newsSectionMatch = storeText.match(
    /defaultNewsArr:\s*\[(.*?)\n\s*\],\n\s*newsArr:/s
  );
  const source = newsSectionMatch?.[1] || storeText;
  return [
    ...new Set([...source.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1])),
  ];
};

const getSubtypeValues = (sourceSubtypeGroups) => {
  const result = new Map();

  for (const [sourceName, groups] of Object.entries(sourceSubtypeGroups)) {
    const values = (groups || []).flatMap((group) =>
      (group.items || []).map((item) => item?.value).filter(Boolean)
    );
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

const interpolate = (template = "", values = {}) =>
  String(template).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");

const setRouteJsonLd = (html, jsonLd) => {
  if (!jsonLd) return html;
  const serialized = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
  const script = `<script id="dailyhot-route-jsonld" type="application/ld+json">${serialized}</script>`;
  return ensureMetaTag(
    html,
    /<script\s+id="dailyhot-route-jsonld"[\s\S]*?<\/script>/,
    script
  );
};

const setAlternateLinks = (html, alternateLinks = []) => {
  const withoutAlternates = html.replace(
    /\n?\s*<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*\/?>/g,
    ""
  );
  if (!alternateLinks.length) return withoutAlternates;

  const tags = alternateLinks
    .map(
      ({ hreflang, href }) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${href}" />`
    )
    .join("\n  ");
  const canonicalMatcher = /(<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>)/;
  if (canonicalMatcher.test(withoutAlternates)) {
    return withoutAlternates.replace(canonicalMatcher, `$1\n  ${tags}`);
  }
  return withoutAlternates.replace("</head>", `  ${tags}\n  </head>`);
};

const setHtmlMeta = (
  html,
  { title, description, keywords, canonical, htmlLang, alternateLinks, jsonLd }
) => {
  let next = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  if (htmlLang) {
    next = next.replace(/<html\s+lang="[^"]*"/, `<html lang="${htmlLang}"`);
  }
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

  next = setAlternateLinks(next, alternateLinks);
  next = setRouteJsonLd(next, jsonLd);
  return next;
};

const buildAbsoluteUrl = (pathname) => {
  if (!siteUrl) return "";
  return `${siteUrl}${pathname}`;
};

const withLocalePrefix = (localeMeta, pathname) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const prefix = localeMeta?.routePrefix || "";
  if (!prefix) return normalizedPath;
  return normalizedPath === "/" ? `${prefix}/` : `${prefix}${normalizedPath}`;
};

const buildAlternateLinks = (basePathname, supportedLocales) => {
  if (!siteUrl) return [];
  const defaultLocale = supportedLocales.find((locale) => !locale.routePrefix);
  const links = supportedLocales.map((localeMeta) => ({
    hreflang: localeMeta.htmlLang,
    href: buildAbsoluteUrl(withLocalePrefix(localeMeta, basePathname)),
  }));
  if (defaultLocale) {
    links.push({
      hreflang: "x-default",
      href: buildAbsoluteUrl(withLocalePrefix(defaultLocale, basePathname)),
    });
  }
  return links;
};

const getSeoMessages = (messages, locale) =>
  messages[locale]?.seo || messages["zh-CN"]?.seo || {};

const getSiteName = (messages, locale) =>
  messages[locale]?.common?.siteName || messages["zh-CN"]?.common?.siteName || brandNameZh;

const buildCollectionJsonLd = ({ title, description, canonical, htmlLang, listName }) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description,
  inLanguage: htmlLang || "zh-CN",
  url: canonical || undefined,
  mainEntity: {
    "@type": "ItemList",
    name: listName,
    itemListOrder: "Descending",
  },
});

const buildWebsiteJsonLd = ({ siteName, title, description, canonical, htmlLang }) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName || brandNameZh,
  alternateName: title,
  url: canonical || undefined,
  description,
  inLanguage: htmlLang || "zh-CN",
});

function main() {
  ensureFile(indexHtmlPath);
  ensureFile(seoSourcePath);
  ensureFile(storeSourcePath);
  ensureFile(subtypeSourcePath);
  ensureFile(sourceLabelsPath);
  ensureFile(messagesPath);
  ensureFile(siteMetadataPath);

  const template = fs.readFileSync(indexHtmlPath, "utf8");
  const seoSource = fs.readFileSync(seoSourcePath, "utf8");
  const storeSource = fs.readFileSync(storeSourcePath, "utf8");
  const subtypeSource = fs.readFileSync(subtypeSourcePath, "utf8");
  const sourceLabelsSource = fs.readFileSync(sourceLabelsPath, "utf8");
  const messagesSource = fs.readFileSync(messagesPath, "utf8");
  const siteMetadataSource = fs.readFileSync(siteMetadataPath, "utf8");

  const categorySeoMap = parseConstant(seoSource, "CATEGORY_SEO_MAP");
  const listSeoMap = parseConstant(seoSource, "LIST_SEO_MAP");
  const clawHubZhBaseSeo = parseConstant(seoSource, "CLAWHUB_ZH_BASE_SEO");
  const clawHubZhSubtypeSeo = parseConstant(seoSource, "CLAWHUB_ZH_SUBTYPE_SEO");
  const sourceSubtypeGroups = parseConstant(subtypeSource, "SOURCE_SUBTYPE_GROUPS");
  const sourceLabelOverrides = parseConstant(sourceLabelsSource, "SOURCE_LABEL_OVERRIDES");
  const subtypeLabelOverrides = parseConstant(sourceLabelsSource, "SUBTYPE_LABEL_OVERRIDES");
  const messages = parseConstant(messagesSource, "messages");
  const supportedLocales = parseConstant(siteMetadataSource, "SUPPORTED_LOCALES");
  const builtinCategories = parseConstant(siteMetadataSource, "BUILTIN_CATEGORIES");
  const sourceNames = getSourceNames(storeSource);
  const subtypeValues = getSubtypeValues(sourceSubtypeGroups);
  const subtypeLabelMap = getSubtypeLabelMap(sourceSubtypeGroups);
  const categoryConfigBySlug = new Map(
    builtinCategories.map((category) => [category.slug, category])
  );
  let writtenShellCount = 0;

  const writeRouteShell = (pathname, meta) => {
    const outputPath = path.join(distDir, pathname.replace(/^\/+/, ""), "index.html");
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, setHtmlMeta(template, meta));
    writtenShellCount += 1;
  };

  const buildHomeMeta = (localeMeta, pathname) => {
    const locale = localeMeta.code;
    const htmlLang = localeMeta.htmlLang;
    const seoMessages = getSeoMessages(messages, locale);
    const siteName = getSiteName(messages, locale);
    const title = seoMessages.homeTitle || `${siteName} - Hot Rankings`;
    const description =
      seoMessages.homeDescription ||
      "Browse cross-platform trending topics and real-time hot rankings.";
    const canonical = buildAbsoluteUrl(pathname);
    return {
      title,
      description,
      keywords: seoMessages.homeKeywords || siteName,
      canonical,
      htmlLang,
      alternateLinks: buildAlternateLinks("/", supportedLocales),
      jsonLd: buildWebsiteJsonLd({
        siteName,
        title,
        description,
        canonical,
        htmlLang,
      }),
    };
  };

  const buildCategoryMeta = (category, localeMeta, pathname) => {
    const locale = localeMeta.code;
    const canonical = buildAbsoluteUrl(pathname);
    const basePathname = `/category/${category.slug}`;
    const htmlLang = localeMeta.htmlLang;
    const categoryConfig = categoryConfigBySlug.get(category.slug);
    if (locale === "zh-CN") {
      const meta = categorySeoMap[category.name];
      if (!meta) return null;
      const title = buildZhTitle(meta.title, meta.titleTail);
      const description = meta.description;
      return {
        title,
        description,
        keywords: mergeKeywords(meta.keywords, category.name, brandNameZh),
        canonical,
        htmlLang,
        alternateLinks: buildAlternateLinks(basePathname, supportedLocales),
        jsonLd: buildCollectionJsonLd({
          title,
          description,
          canonical,
          htmlLang,
          listName: meta.title,
        }),
      };
    }
    const seoMessages = getSeoMessages(messages, locale);
    const categoryLabel = categoryConfig?.labels?.[locale] || category.name;
    const title = interpolate(seoMessages.categoryTitle, { category: categoryLabel });
    const description = interpolate(seoMessages.categoryDescription, {
      category: categoryLabel,
    });
    return {
      title,
      description,
      keywords: interpolate(seoMessages.categoryKeywords, { category: categoryLabel }),
      canonical,
      htmlLang,
      alternateLinks: buildAlternateLinks(basePathname, supportedLocales),
      jsonLd: buildCollectionJsonLd({
        title,
        description,
        canonical,
        htmlLang,
        listName: categoryLabel,
      }),
    };
  };

  const buildRankMeta = (sourceName, subtypeValue, localeMeta, pathname) => {
    const locale = localeMeta.code;
    const meta = listSeoMap[sourceName] || listSeoMap.default || {};
    const canonical = buildAbsoluteUrl(pathname);
    const basePathname = subtypeValue
      ? `/rank/${sourceName}/${subtypeValue}`
      : `/rank/${sourceName}`;
    const htmlLang = localeMeta.htmlLang;
    const rawSubtypeLabel = subtypeValue
      ? subtypeLabelMap.get(sourceName)?.get(subtypeValue) || ""
      : "";
    const subtypeLabel = subtypeValue
      ? getLocalizedSubtypeLabel(
          subtypeLabelOverrides,
          subtypeValue,
          rawSubtypeLabel,
          locale
        )
      : "";
    const sourceLabel =
      locale === "zh-CN"
        ? meta.label || prettifySlug(sourceName)
        : getLocalizedSourceLabel(
            sourceLabelOverrides,
            sourceName,
            meta.label,
            locale
          );

    if (locale !== "zh-CN") {
      const seoMessages = getSeoMessages(messages, locale);
      const siteName = getSiteName(messages, locale);
      const label = subtypeLabel ? `${sourceLabel} · ${subtypeLabel}` : sourceLabel;
      const title = `${label} - ${siteName}`;
      const description = subtypeLabel
        ? interpolate(seoMessages.sourceSubtypeDescription, {
            label: sourceLabel,
            subtype: subtypeLabel,
          })
        : interpolate(seoMessages.sourceDescription, { label: sourceLabel });
      const keywords = subtypeLabel
        ? interpolate(seoMessages.sourceSubtypeKeywords, {
            label: sourceLabel,
            subtype: subtypeLabel,
          })
        : interpolate(seoMessages.sourceKeywords, { label: sourceLabel });
      return {
        title,
        description,
        keywords,
        canonical,
        htmlLang,
        alternateLinks: buildAlternateLinks(basePathname, supportedLocales),
        jsonLd: buildCollectionJsonLd({
          title,
          description,
          canonical,
          htmlLang,
          listName: label,
        }),
      };
    }

    const rawDescription = trimTerminalPunctuation(meta.description || "实时热榜与趋势榜");
    const baseIntent =
      stripLeadingZhPossessive(stripLeadingPhrases(rawDescription, [sourceLabel])) ||
      "实时热榜与趋势榜";
    const zhRouteSeo = getClawHubZhRouteSeo({
      sourceName,
      subtypeValue,
      clawHubZhBaseSeo,
      clawHubZhSubtypeSeo,
    });
    const titleLabel =
      zhRouteSeo?.titleLabel ||
      (subtypeLabel ? normalizeTitleLabel(`${sourceLabel} ${subtypeLabel}`) : sourceLabel);
    const intent =
      zhRouteSeo?.intent ||
      (subtypeLabel
        ? stripLeadingZhPossessive(
            stripLeadingPhrases(rawDescription, [sourceLabel, subtypeLabel])
          ) || baseIntent
        : baseIntent);
    const listName = titleLabel;
    const title = buildZhTitle(titleLabel, intent);
    const description = `${appendZhPageSuffix(titleLabel)}，${joinZhVerbObject(
      "聚合",
      intent
    )}、对应平台最新数据与原站入口，支持实时浏览、榜单切换、分页跳转与一键直达。`;
    return {
      title,
      description,
      keywords: mergeKeywords(
        meta.keywords,
        sourceLabel,
        subtypeLabel,
        intent,
        titleLabel,
        brandNameZh
      ),
      canonical,
      htmlLang,
      alternateLinks: buildAlternateLinks(basePathname, supportedLocales),
      jsonLd: buildCollectionJsonLd({
        title,
        description,
        canonical,
        htmlLang,
        listName,
      }),
    };
  };

  supportedLocales.forEach((localeMeta) => {
    const homePathname = withLocalePrefix(localeMeta, "/");
    writeRouteShell(homePathname, buildHomeMeta(localeMeta, homePathname));

    CATEGORY_ROUTES.forEach((category) => {
      const pathname = withLocalePrefix(localeMeta, `/category/${category.slug}`);
      const meta = buildCategoryMeta(category, localeMeta, pathname);
      if (meta) writeRouteShell(pathname, meta);
    });

    sourceNames.forEach((sourceName) => {
      const basePathname = withLocalePrefix(localeMeta, `/rank/${sourceName}`);
      writeRouteShell(basePathname, buildRankMeta(sourceName, "", localeMeta, basePathname));

      (subtypeValues.get(sourceName) || []).forEach((subtypeValue) => {
        const pathname = withLocalePrefix(
          localeMeta,
          `/rank/${sourceName}/${subtypeValue}`
        );
        writeRouteShell(
          pathname,
          buildRankMeta(sourceName, subtypeValue, localeMeta, pathname)
        );
      });
    });
  });

  console.log(`[seo-shell] generated ${writtenShellCount} route shells`);
}

main();
