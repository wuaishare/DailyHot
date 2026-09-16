export const BILIBILI_CACHE_TTL_MS = 2 * 60 * 1000;
export const BILIBILI_STALE_TTL_MS = 6 * 60 * 60 * 1000;
export const BILIBILI_CDN_FRESH_SECONDS = 120;
export const BILIBILI_CDN_STALE_SECONDS = 6 * 60 * 60;

export const resolveBilibiliCacheEntry = (
  entry,
  { now = Date.now(), allowStale = false } = {},
) => {
  if (!entry?.value?.data?.length || !Number.isFinite(entry.cachedAt)) return null;
  const age = Math.max(0, now - entry.cachedAt);
  if (age <= BILIBILI_CACHE_TTL_MS) {
    return { value: { ...entry.value, fromCache: true, stale: false }, freshness: "fresh" };
  }
  if (allowStale && age <= BILIBILI_STALE_TTL_MS) {
    return { value: { ...entry.value, fromCache: true, stale: true }, freshness: "stale" };
  }
  return null;
};
