import { applyTrendsSourceCatalog } from "@/utils/sourceSubtypes";

const CACHE_KEY = "dailyhot:trends-source-catalog:v1";
const FRESH_MS = 60 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;
const DEFAULT_PUBLIC_API = import.meta.env.PROD
  ? "https://api.wpbetter.cn/trends/public/v1"
  : "";
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

const fetchCatalog = async () => {
  if (!PUBLIC_API) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1000);
  try {
    const response = await fetch(`${PUBLIC_API}/catalog`, {
      headers: { Accept: "application/json" },
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`trends_catalog_http_${response.status}`);
    const catalog = await response.json();
    if (!Array.isArray(catalog?.sources)) throw new Error("trends_catalog_invalid_payload");
    applyTrendsSourceCatalog(catalog);
    persistCatalog(catalog);
    return catalog;
  } finally {
    clearTimeout(timer);
  }
};

export const preloadTrendsSourceCatalog = async () => {
  const cached = cachedCatalog();
  const age = cached ? Date.now() - cached.storedAt : Number.POSITIVE_INFINITY;
  if (cached?.catalog && age <= STALE_MS) applyTrendsSourceCatalog(cached.catalog);
  if (cached?.catalog && age <= FRESH_MS) return cached.catalog;
  if (!loadingPromise) {
    loadingPromise = fetchCatalog()
      .catch((error) => {
        if (!cached?.catalog) console.warn("Trends source catalog unavailable", error);
        return cached?.catalog || null;
      })
      .finally(() => {
        loadingPromise = null;
      });
  }
  return loadingPromise;
};
