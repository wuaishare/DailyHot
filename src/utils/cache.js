const CACHE_VERSION = "1.4.3";

export const getCacheVersion = () => CACHE_VERSION;

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
    const saved = localStorage.getItem("CACHE_VERSION");
    if (!saved) {
      localStorage.setItem("CACHE_VERSION", CACHE_VERSION);
      return;
    }
    if (saved !== CACHE_VERSION) {
      await clearAppCaches();
      localStorage.setItem("CACHE_VERSION", CACHE_VERSION);
      window.location.reload();
    }
  } catch (err) {
    console.warn("ensureCacheVersion failed", err);
  }
};
