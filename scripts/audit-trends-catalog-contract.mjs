import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {
  applyTrendsSourceCatalog,
  canFallbackTrendsCatalogVariant,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  getSourceSubtypeControlGroups,
  getSourceVariantOption,
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
    {
      key: "xiaohongshu",
      defaultVariant: "hot",
      variantSelectorEnabled: false,
      variantGroups: [
        {
          key: "ranking",
          label: "榜单",
          options: [
            { key: "hot", label: "实时热点", recommendedRefreshIntervalSeconds: 180 },
          ],
        },
      ],
    },
  ],
};

assert.equal(applyTrendsSourceCatalog(catalog), 3);
assert.deepEqual(
  getSourceSubtypeGroups("weibo").flatMap((group) => group.items.map((item) => item.value)),
  ["hot", "entertainment", "life", "social"],
);
assert.equal(getDefaultSourceSubtype("weibo"), "hot");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "life" }), "life");
assert.equal(resolveTrendsCatalogVariant("weibo", { type: "invalid" }), null);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("weibo", "entertainment"), false);
assert.deepEqual(getSourceSubtypeGroups("xiaohongshu"), []);
assert.equal(getDefaultSourceSubtype("xiaohongshu"), "hot");
assert.equal(getSourceVariantOption("xiaohongshu", "hot")?.recommendedRefreshIntervalSeconds, 180);
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", {}), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "hot" }), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "read-3d" }), null);
assert.equal(canFallbackTrendsCatalogVariant("xiaohongshu", "hot"), true);
assert.equal(canFallbackTrendsCatalogVariant("xiaohongshu", "read-3d"), false);

const pgyCatalog = structuredClone(catalog);
const pgyXiaohongshu = pgyCatalog.sources.find((source) => source.key === "xiaohongshu");
pgyXiaohongshu.variantSelectorEnabled = true;
pgyXiaohongshu.variantDimensions = [
  {
    key: "ranking",
    label: "榜单",
    options: [
      { key: "hot", label: "实时热点" },
      { key: "read", label: "阅读榜" },
      { key: "like", label: "点赞榜" },
      { key: "collect", label: "收藏榜" },
    ],
  },
  {
    key: "period",
    label: "时间",
    options: [
      { key: "3d", label: "近3日" },
      { key: "7d", label: "近7日" },
      { key: "14d", label: "近14日" },
      { key: "30d", label: "近30日" },
    ],
  },
];
pgyXiaohongshu.variantGroups[0].options = [
  { key: "hot", label: "实时热点", dimensionValues: { ranking: "hot" }, runtimeAvailability: "available" },
  ...["read", "like", "collect"].flatMap((ranking) =>
    ["3d", "7d", "14d", "30d"].map((period) => ({
      key: `${ranking}-${period}`,
      label: `${ranking}-${period}`,
      dimensionValues: { ranking, period },
      runtimeAvailability: "available",
    })),
  ),
];
applyTrendsSourceCatalog(pgyCatalog);
assert.deepEqual(
  getSourceSubtypeControlGroups("xiaohongshu", "hot").map((group) => ({
    key: group.key,
    values: group.items.map((item) => item.value),
  })),
  [{ key: "ranking", values: ["hot", "read-3d", "like-3d", "collect-3d"] }],
);
assert.deepEqual(
  getSourceSubtypeControlGroups("xiaohongshu", "read-7d").map((group) => ({
    key: group.key,
    values: group.items.map((item) => item.value),
  })),
  [
    { key: "ranking", values: ["hot", "read-7d", "like-7d", "collect-7d"] },
    { key: "period", values: ["read-3d", "read-7d", "read-14d", "read-30d"] },
  ],
);

const gatedPgyCatalog = structuredClone(pgyCatalog);
const gatedPgyXiaohongshu = gatedPgyCatalog.sources.find((source) => source.key === "xiaohongshu");
for (const option of gatedPgyXiaohongshu.variantGroups[0].options) {
  if (option.key !== "hot") option.runtimeAvailability = "requires_authorization";
}
applyTrendsSourceCatalog(gatedPgyCatalog);
assert.deepEqual(getSourceSubtypeGroups("xiaohongshu"), []);
assert.equal(getDefaultSourceSubtype("xiaohongshu"), "hot");
assert.equal(resolveTrendsCatalogVariant("xiaohongshu", { type: "read-3d" }), null);
assert.deepEqual(getSourceSubtypeControlGroups("xiaohongshu", "hot"), []);

applyTrendsSourceCatalog(pgyCatalog);

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
console.log("[trends-catalog-contract] dynamic projection, selector gating and fail-closed fallback verified");

const vueFiles = [];
const walkVueFiles = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkVueFiles(fullPath);
    else if (entry.isFile() && entry.name.endsWith(".vue")) vueFiles.push(fullPath);
  }
};
walkVueFiles(new URL("../src", import.meta.url).pathname);
const dynamicSubtypeGetterPattern = /getSourceSubtypeGroups\(|getSourceSubtypeOptions\(|getDefaultSourceSubtype\(|resolveTrendsCatalogVariant\(/;
const subtypeConsumers = vueFiles.filter((file) =>
  dynamicSubtypeGetterPattern.test(fs.readFileSync(file, "utf8")),
);
assert.ok(subtypeConsumers.length > 0, "expected at least one runtime subtype catalog consumer");
for (const file of subtypeConsumers) {
  const source = fs.readFileSync(file, "utf8");
  assert.match(
    source,
    /import\s*\{\s*useTrendsCatalogRevision\s*\}\s*from\s*["']@\/composables\/useTrendsCatalogRevision["']/,
    `${path.relative(process.cwd(), file)} reads the remote subtype catalog without importing the reactive catalog revision composable`,
  );
  assert.match(
    source,
    /useTrendsCatalogRevision\(\)/,
    `${path.relative(process.cwd(), file)} imports but does not activate the reactive catalog revision composable`,
  );
}
const revisionComposable = fs.readFileSync(
  new URL("../src/composables/useTrendsCatalogRevision.js", import.meta.url).pathname,
  "utf8",
);
assert.match(revisionComposable, /subscribeTrendsSourceCatalog/, "catalog revision composable must subscribe to remote catalog changes");
console.log(`[trends-catalog-contract] ${subtypeConsumers.length} runtime UI consumers use the reactive catalog revision contract`);
