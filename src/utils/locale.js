import {
  BUILTIN_CATEGORIES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
} from "@/config/site-metadata.mjs";
import {
  getDefaultSourceSubtype,
  shouldCanonicalizeDefaultSubtype,
} from "@/utils/sourceSubtypes";

const ROUTE_LOCALE_MAP = new Map(
  SUPPORTED_LOCALES.map((item) => [item.routeParam, item.code]),
);

const CODE_LOCALE_MAP = new Map(
  SUPPORTED_LOCALES.map((item) => [item.code, item]),
);

const CATEGORY_NAME_TO_META = new Map(
  BUILTIN_CATEGORIES.map((item) => [item.name, item]),
);

const CATEGORY_ID_TO_META = new Map(
  BUILTIN_CATEGORIES.map((item) => [item.id, item]),
);

const SOURCE_SLUG_ALIAS_MAP = {
  lmarena: "arena-ai",
};

const normalizeSourceSlug = (slug = "") =>
  SOURCE_SLUG_ALIAS_MAP[slug] || slug || null;

export const getSupportedLocales = () => SUPPORTED_LOCALES.slice();

export const getLocaleMeta = (locale = DEFAULT_LOCALE) =>
  CODE_LOCALE_MAP.get(locale) || CODE_LOCALE_MAP.get(DEFAULT_LOCALE);

export const normalizeLocale = (input) => {
  if (!input) return DEFAULT_LOCALE;
  if (CODE_LOCALE_MAP.has(input)) return input;
  const normalized = String(input).toLowerCase();
  if (ROUTE_LOCALE_MAP.has(normalized)) return ROUTE_LOCALE_MAP.get(normalized);
  if (normalized.startsWith("zh")) return DEFAULT_LOCALE;
  if (normalized.startsWith("en")) return "en";
  if (normalized.startsWith("ja")) return "ja";
  if (normalized.startsWith("ko")) return "ko";
  return DEFAULT_LOCALE;
};

export const getLocaleFromRoute = (route) =>
  normalizeLocale(route?.params?.lang || DEFAULT_LOCALE);

export const getRoutePrefix = (locale) =>
  getLocaleMeta(locale)?.routePrefix || "";

export const withLocalePrefix = (locale, path = "/") => {
  const prefix = getRoutePrefix(locale);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!prefix) return normalizedPath;
  return normalizedPath === "/" ? `${prefix}/` : `${prefix}${normalizedPath}`;
};

export const stripLocalePrefix = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const matched = SUPPORTED_LOCALES.find(
    (item) =>
      item.routePrefix &&
      (normalizedPath === item.routePrefix ||
        normalizedPath.startsWith(`${item.routePrefix}/`)),
  );
  if (!matched) return normalizedPath;
  const next = normalizedPath.slice(matched.routePrefix.length);
  return next || "/";
};

export const savePreferredLocale = (locale) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOCALE_STORAGE_KEY, normalizeLocale(locale));
};

export const getPreferredLocale = () => {
  if (typeof localStorage === "undefined") return null;
  return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY) || "");
};

export const getBrowserLocale = () =>
  typeof navigator === "undefined"
    ? DEFAULT_LOCALE
    : normalizeLocale(navigator.language);

export const resolveInitialLocale = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const matched = SUPPORTED_LOCALES.find(
    (item) =>
      item.routePrefix &&
      (normalizedPath === item.routePrefix ||
        normalizedPath.startsWith(`${item.routePrefix}/`)),
  );
  if (matched) return matched.code;
  return getPreferredLocale() || getBrowserLocale() || DEFAULT_LOCALE;
};

export const setDocumentLanguage = (locale) => {
  if (typeof document === "undefined") return;
  const meta = getLocaleMeta(locale);
  if (meta?.htmlLang) {
    document.documentElement.lang = meta.htmlLang;
  }
};

export const getCategoryMetaByName = (name, categories = BUILTIN_CATEGORIES) =>
  categories.find((item) => item.name === name) ||
  CATEGORY_NAME_TO_META.get(name) ||
  null;

export const getCategoryMetaById = (id, categories = BUILTIN_CATEGORIES) =>
  categories.find((item) => item.id === id) ||
  CATEGORY_ID_TO_META.get(id) ||
  null;

export const getCategorySlugByName = (
  name,
  categories = BUILTIN_CATEGORIES,
) => {
  const meta = getCategoryMetaByName(name, categories);
  return meta?.slug || null;
};

export const getCategoryNameBySlug = (
  slug,
  categories = BUILTIN_CATEGORIES,
) => {
  const meta =
    categories.find((item) => item.slug === slug) ||
    BUILTIN_CATEGORIES.find((item) => item.slug === slug);
  return meta?.name || null;
};

export const getSourceSlug = (name) => normalizeSourceSlug(name);

export const getSourceNameBySlug = (slug) => normalizeSourceSlug(slug);

export const buildHomePath = (locale = DEFAULT_LOCALE) =>
  withLocalePrefix(locale, "/");

export const buildCategoryPath = (
  locale = DEFAULT_LOCALE,
  categorySlug = "",
) =>
  categorySlug
    ? withLocalePrefix(locale, `/category/${categorySlug}`)
    : buildHomePath(locale);

export const buildRankPath = (
  locale = DEFAULT_LOCALE,
  sourceSlug = "",
  subtypeSlug = "",
) => {
  const safeSourceSlug = normalizeSourceSlug(sourceSlug) || "";
  const safeSubtypeSlug = subtypeSlug || "";
  const path = safeSubtypeSlug
    ? `/rank/${safeSourceSlug}/${safeSubtypeSlug}`
    : `/rank/${safeSourceSlug}`;
  return withLocalePrefix(locale, path);
};

export const buildFixedLocalePath = (locale = DEFAULT_LOCALE, path = "/") =>
  withLocalePrefix(locale, path);

export const buildLocalePathFromRoute = (route, locale = DEFAULT_LOCALE) => {
  const normalizedLocale = normalizeLocale(locale);
  const pathWithoutLocale = stripLocalePrefix(route?.path || "/");
  const sourceSlug = route?.params?.sourceSlug;
  const subtypeSlug = route?.params?.subtypeSlug;
  const categorySlug = route?.params?.categorySlug;
  if (sourceSlug) {
    const normalizedSourceSlug = getSourceNameBySlug(
      Array.isArray(sourceSlug) ? sourceSlug[0] : sourceSlug,
    );
    const routeSubtypeSlug = Array.isArray(subtypeSlug)
      ? subtypeSlug[0]
      : subtypeSlug;
    const effectiveSubtypeSlug =
      routeSubtypeSlug ||
      (shouldCanonicalizeDefaultSubtype(normalizedSourceSlug)
        ? getDefaultSourceSubtype(normalizedSourceSlug)
        : "");
    return buildRankPath(
      normalizedLocale,
      normalizedSourceSlug,
      effectiveSubtypeSlug,
    );
  }
  if (categorySlug) {
    return buildCategoryPath(normalizedLocale, categorySlug);
  }
  if (
    pathWithoutLocale === "/setting" ||
    pathWithoutLocale === "/privacy" ||
    pathWithoutLocale === "/analytics" ||
    pathWithoutLocale === "/topic/wool" ||
    pathWithoutLocale === "/test" ||
    pathWithoutLocale === "/403" ||
    pathWithoutLocale === "/404" ||
    pathWithoutLocale === "/500"
  ) {
    return buildFixedLocalePath(normalizedLocale, pathWithoutLocale);
  }
  return buildHomePath(normalizedLocale);
};

export const getCategoryLabel = (category, locale = DEFAULT_LOCALE) => {
  if (!category) return "";
  if (category === "全部") {
    const messages = {
      "zh-CN": "全部",
      en: "All",
      "zh-TW": "全部",
      ja: "すべて",
      ko: "전체",
    };
    return messages[normalizeLocale(locale)] || messages[DEFAULT_LOCALE];
  }
  const meta = getCategoryMetaByName(category) || getCategoryMetaById(category);
  return meta?.labels?.[normalizeLocale(locale)] || meta?.name || category;
};
