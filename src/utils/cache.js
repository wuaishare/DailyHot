const APP_VERSION = __APP_VERSION__;
// 只在缓存机制本身发生不兼容变化时升级。日常构建号变化不再触发全站清缓存。
const CACHE_SCHEMA_VERSION = "2";
const CACHE_SCHEMA_STORAGE_KEY = "dailyhot:cache-schema";
const LEGACY_BUILD_CACHE_KEY = "CACHE_VERSION";

export const getCacheVersion = () => CACHE_SCHEMA_VERSION;
export const getDisplayVersion = () => APP_VERSION.version;
export const getProductVersion = () => APP_VERSION.productVersion;
export const getBuildNumber = () => APP_VERSION.buildNumber;
export const getBuildVersion = () => APP_VERSION.buildVersion;

export const clearAppCaches = async () => {
  try {
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
  } catch (err) {
    console.warn("clearAppCaches failed", err);
  }
};

export const ensureCacheVersion = async () => {
  try {
    if (typeof localStorage === "undefined") return;
    const savedSchema = localStorage.getItem(CACHE_SCHEMA_STORAGE_KEY);

    // 从旧的“构建号即缓存版本”机制迁移时保留已有缓存，避免升级本身造成一次全站冷启动。
    if (!savedSchema) {
      localStorage.setItem(CACHE_SCHEMA_STORAGE_KEY, CACHE_SCHEMA_VERSION);
      localStorage.removeItem(LEGACY_BUILD_CACHE_KEY);
      return;
    }

    if (savedSchema !== CACHE_SCHEMA_VERSION) {
      await clearAppCaches();
      localStorage.setItem(CACHE_SCHEMA_STORAGE_KEY, CACHE_SCHEMA_VERSION);
    }
    localStorage.removeItem(LEGACY_BUILD_CACHE_KEY);
  } catch (err) {
    console.warn("ensureCacheVersion failed", err);
  }
};
