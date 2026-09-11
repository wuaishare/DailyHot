import assert from "node:assert/strict";
import {
  applyTrendsSourceCatalog,
  canFallbackTrendsCatalogVariant,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  resolveTrendsCatalogVariant,
  subscribeTrendsSourceCatalog,
} from "../src/utils/sourceSubtypes.js";

const catalog = {
  sources: [
    {
      key: "weibo",
      defaultVariant: "hot",
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "hot", label: "热搜" },
            { key: "entertainment", label: "文娱榜" },
            { key: "life", label: "生活榜" },
            { key: "social", label: "社会榜" },
          ],
        },
      ],
    },
    {
      key: "google-trends",
      defaultVariant: "us",
      variantGroups: [
        {
          key: "ranking",
          label: "地区",
          options: [
            ["us", "美国"], ["jp", "日本"], ["gb", "英国"], ["kr", "韩国"], ["in", "印度"],
            ["de", "德国"], ["fr", "法国"], ["br", "巴西"], ["ca", "加拿大"], ["au", "澳大利亚"],
          ].map(([key, label]) => ({ key, label })),
        },
      ],
    },
  ],
};

assert.equal(applyTrendsSourceCatalog(catalog), 2);
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social"],
);
assert.equal(getDefaultSourceSubtype("weibo"), "hot");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "life" }), "life");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "invalid" }), null);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "entertainment"), false);

let catalogChangeCount = 0;
const unsubscribe = subscribeTrendsSourceCatalog(() => { catalogChangeCount += 1; });
const expandedCatalog = structuredClone(catalog);
const expandedWeibo = expandedCatalog.sources.find((source) => source.key === "weibo");
expandedWeibo.variantGroups[0].options.push(
  { key: "tech", label: "科技榜" },
  { key: "sports", label: "体育榜" },
  { key: "acg", label: "ACG榜" },
);
applyTrendsSourceCatalog(expandedCatalog);
assert.equal(catalogChangeCount, 1, "catalog subscribers must observe backend variant expansion");
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social", "tech", "sports", "acg"],
);
applyTrendsSourceCatalog(expandedCatalog);
assert.equal(catalogChangeCount, 1, "re-applying the same catalog must not emit a false change");
unsubscribe();
assert.deepEqual(
  getSourceSubtypeGroups("google-trends").flatMap((group) => group.items.map((item) => item.value)),
  ["us", "jp", "gb", "kr", "in", "de", "fr", "br", "ca", "au"],
);
assert.equal(getDefaultSourceSubtype("google-trends"), "us");
assert.equal(resolveTrendsCatalogVariant("google-trends", { type: "jp" }), "jp");
assert.equal(canFallbackTrendsCatalogVariant("google-trends", "jp"), false);
console.log("[trends-catalog-contract] dynamic projection and fail-closed fallback verified");
