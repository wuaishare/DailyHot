import { applyTrendsSourceCatalog } from "@/utils/sourceSubtypes";

const CACHE_KEY = "dailyhot:trends-source-catalog:v2";
const STALE_MS = 24 * 60 * 60 * 1000;
const REVALIDATE_MS = 5 * 60 * 1000;
const DEFAULT_DIRECTORY_API = import.meta.env.PROD
  ? "https://api.wpbetter.cn/trends"
  : "";
const DEFAULT_PUBLIC_API = import.meta.env.PROD
  ? "https://api.wpbetter.cn/trends/public/v1"
  : "";
const DIRECTORY_API = String(
  import.meta.env.VITE_TRENDS_DIRECTORY_API || DEFAULT_DIRECTORY_API,
).replace(/\/$/, "");
const PUBLIC_API = String(
  import.meta.env.VITE_TRENDS_PUBLIC_API || DEFAULT_PUBLIC_API,
).replace(/\/$/, "");

let loadingPromise = null;

const cachedCatalog = () => {
  if (typeof localStorage === "undefined") return null;
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!cached?.catalog || !Number.isFinite(cached?.storedAt)) return null;
    return cached;
  } catch {
    return null;
  }
};

const persistCatalog = (catalog) => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ storedAt: Date.now(), catalog }));
  } catch {
    // Catalog persistence is an optimization only.
  }
};

const fetchJsonCatalog = async (url) => {
  if (!url) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2200);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("trends_catalog_http_" + response.status);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.sources)) throw new Error("trends_catalog_invalid_payload");
    return catalog;
  } finally {
    clearTimeout(timer);
  }
};

const mergeDirectoryAndPublicCatalog = (directoryCatalog, publicCatalog) => {
  const baseCatalog = directoryCatalog || publicCatalog;
  if (!baseCatalog) return null;
  const cached = cachedCatalog()?.catalog;
  const publicKeys = publicCatalog
    ? new Set(publicCatalog.sources.map((source) => source.key))
    : new Set(
        (cached?.sources || [])
          .filter((source) => source?.publicAvailable !== false)
          .map((source) => source.key),
      );
  const assumePublic = !directoryCatalog && Boolean(publicCatalog);
  return {
    ...baseCatalog,
    sources: baseCatalog.sources.map((source) => ({
      ...source,
      publicAvailable: assumePublic || publicKeys.has(source.key),
    })),
  };
};

const fetchCatalog = async () => {
  if (!PUBLIC_API && !DIRECTORY_API) return null;
  const [directoryResult, publicResult] = await Promise.allSettled([
    fetchJsonCatalog(DIRECTORY_API ? DIRECTORY_API + "/catalog.json" : ""),
    fetchJsonCatalog(PUBLIC_API ? PUBLIC_API + "/catalog" : ""),
  ]);
  const directoryCatalog =
    directoryResult.status === "fulfilled" ? directoryResult.value : null;
  const publicCatalog =
    publicResult.status === "fulfilled" ? publicResult.value : null;
  const catalog = mergeDirectoryAndPublicCatalog(directoryCatalog, publicCatalog);
  if (!catalog) {
    throw directoryResult.reason || publicResult.reason || new Error("trends_catalog_unavailable");
  }
  applyTrendsSourceCatalog(catalog);
  persistCatalog(catalog);
  return catalog;
};

const revalidateCatalog = (fallbackCatalog = null) => {
  if (!loadingPromise) {
    loadingPromise = fetchCatalog()
      .catch((error) => {
        if (!fallbackCatalog) console.warn("Trends source catalog unavailable", error);
        return fallbackCatalog;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }
  return loadingPromise;
};

export const preloadTrendsSourceCatalog = async () => {
  const cached = cachedCatalog();
  const age = cached ? Date.now() - cached.storedAt : Number.POSITIVE_INFINITY;
  const fallbackCatalog = cached?.catalog && age <= STALE_MS ? cached.catalog : null;
  if (fallbackCatalog) {
    applyTrendsSourceCatalog(fallbackCatalog);
    void revalidateCatalog(fallbackCatalog);
    return fallbackCatalog;
  }
  return revalidateCatalog(null);
};

export const startTrendsSourceCatalogRevalidation = () => {
  if (typeof window === "undefined") return () => {};
  const refresh = () => {
    void revalidateCatalog(cachedCatalog()?.catalog || null);
  };
  const timer = window.setInterval(refresh, REVALIDATE_MS);
  const onFocus = () => refresh();
  const onVisibility = () => {
    if (document.visibilityState === "visible") refresh();
  };
  window.addEventListener("focus", onFocus);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onFocus);
    document.removeEventListener("visibilitychange", onVisibility);
  };
};
