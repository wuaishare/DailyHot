import assert from "node:assert/strict";
import {
  applyTrendsSourceCatalog,
  canFallbackTrendsCatalogVariant,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  resolveTrendsCatalogVariant,
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
  ],
};

assert.equal(applyTrendsSourceCatalog(catalog), 1);
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social"],
);
assert.equal(getDefaultSourceSubtype("weibo"), "hot");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "life" }), "life");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "invalid" }), null);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "entertainment"), false);
console.log("[trends-catalog-contract] dynamic projection and fail-closed fallback verified");
