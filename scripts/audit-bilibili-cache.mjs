import assert from "node:assert/strict";
import fs from "node:fs";
import {
  BILIBILI_CACHE_TTL_MS,
  BILIBILI_STALE_TTL_MS,
  BILIBILI_CDN_FRESH_SECONDS,
  BILIBILI_CDN_STALE_SECONDS,
  resolveBilibiliCacheEntry,
} from "../api/_bilibili-cache.mjs";

const now = 10_000_000;
const value = { code: 200, data: [{ title: "cached" }], fromCache: false, stale: false };
const fresh = resolveBilibiliCacheEntry({ cachedAt: now - BILIBILI_CACHE_TTL_MS, value }, { now });
assert.equal(fresh?.freshness, "fresh");
assert.equal(fresh?.value.fromCache, true);
assert.equal(fresh?.value.stale, false);

const stale = resolveBilibiliCacheEntry(
  { cachedAt: now - BILIBILI_CACHE_TTL_MS - 1, value },
  { now, allowStale: true },
);
assert.equal(stale?.freshness, "stale");
assert.equal(stale?.value.fromCache, true);
assert.equal(stale?.value.stale, true);
assert.equal(resolveBilibiliCacheEntry({ cachedAt: now - BILIBILI_STALE_TTL_MS - 1, value }, { now, allowStale: true }), null);
assert.equal(resolveBilibiliCacheEntry({ cachedAt: now - BILIBILI_CACHE_TTL_MS - 1, value }, { now }), null);
assert.equal(resolveBilibiliCacheEntry({ cachedAt: now, value: { ...value, data: [] } }, { now }), null);
assert.equal(BILIBILI_CDN_FRESH_SECONDS, 120);
assert.equal(BILIBILI_CDN_STALE_SECONDS, 21600);
console.log("[bilibili-cache] fresh, stale, expiry and CDN policy verified");

const route = fs.readFileSync(new URL("../api/[...path].js", import.meta.url), "utf8");
assert.match(route, /const forceNoCache =[\s\S]*?req\.query\.cache/);
assert.match(route, /if \(!forceNoCache\) \{[\s\S]*?resolveBilibiliCacheEntry\(cached\)/);
assert.match(route, /if \(!forceNoCache\) \{[\s\S]*?resolveBilibiliCacheEntry\(cached, \{ allowStale: true \}\)/);
assert.match(route, /res\.setHeader\("cache-control", "no-store"\);[\s\S]*?forceNoCache \? "bypass" : "miss"/);
assert.match(route, /cache\.set\(type, \{ cachedAt: Date\.now\(\), value: response \}\)/);
assert.match(route, /response has no usable items/);
console.log("[bilibili-cache] route bypass, stale fallback and cache refresh contract verified");
