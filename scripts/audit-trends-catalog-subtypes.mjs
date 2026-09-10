import assert from "node:assert/strict";
import {
  applyTrendsSourceCatalog,
  canFallbackTrendsCatalogVariant,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  resolveTrendsCatalogVariant,
} from "../src/utils/sourceSubtypes.js";

const base = String(
  process.env.TRENDS_PUBLIC_API || "https://api.wpbetter.cn/trends/public/v1",
).replace(/\/$/, "");
const response = await fetch(`${base}/catalog`, {
  headers: { Accept: "application/json" },
});
assert.equal(response.ok, true, `catalog HTTP ${response.status}`);
const catalog = await response.json();
assert.ok(Array.isArray(catalog?.sources), "catalog must expose sources");

const projected = applyTrendsSourceCatalog(catalog);
assert.ok(projected > 0, "at least one source must be projected dynamically");

const weibo = getSourceSubtypeGroups("weibo");
assert.deepEqual(
  weibo.flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social"],
  "Weibo variants must come from the live Trends catalog",
);
assert.equal(getDefaultSourceSubtype("weibo"), "hot");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "life" }), "life");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "invalid" }), null);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "hot"), true);
assert.equal(
  canFallbackTrendsCatalogVariant("weibo", "entertainment"),
  false,
  "new catalog-only variants must not fall back to a legacy endpoint that serves another ranking",
);

assert.equal(
  getDefaultSourceSubtype("github"),
  "daily",
  "legacy alias sources must remain on their existing compatibility projection",
);

console.log(`[trends-catalog-subtypes] projected ${projected} compatible sources; Weibo 4 variants and fail-closed fallback verified`);
