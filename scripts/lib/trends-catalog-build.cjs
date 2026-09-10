const path = require("node:path");
const { pathToFileURL } = require("node:url");

const DEFAULT_CATALOG_URL = "https://api.wpbetter.cn/trends/public/v1/catalog";

const fetchCatalog = async () => {
  const url = String(process.env.TRENDS_PUBLIC_CATALOG_URL || DEFAULT_CATALOG_URL).trim();
  if (!url || process.env.TRENDS_CATALOG_BUILD_SYNC === "0") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.sources)) throw new Error("invalid catalog payload");
    return catalog;
  } finally {
    clearTimeout(timer);
  }
};

const projectSubtypeGroupsForBuild = async (staticGroups, label = "build") => {
  try {
    const catalog = await fetchCatalog();
    if (!catalog) return { groups: staticGroups, defaults: new Map(), projected: 0 };
    const modulePath = path.resolve(__dirname, "../../src/utils/trendsCatalogProjection.mjs");
    const { mergeProjectedSubtypeGroups, projectTrendsCatalog } = await import(
      pathToFileURL(modulePath).href
    );
    const projection = projectTrendsCatalog(catalog, staticGroups);
    console.log(
      `[${label}] projected ${projection.groupsBySource.size} compatible Trends catalog sources`,
    );
    return {
      groups: mergeProjectedSubtypeGroups(staticGroups, projection.groupsBySource),
      defaults: projection.defaultsBySource,
      projected: projection.groupsBySource.size,
    };
  } catch (error) {
    console.warn(`[${label}] Trends catalog unavailable; using static subtype fallback: ${error.message}`);
    return { groups: staticGroups, defaults: new Map(), projected: 0 };
  }
};

module.exports = { projectSubtypeGroupsForBuild };
