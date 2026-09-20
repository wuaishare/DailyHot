import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import {
  applyTrendsSourceCatalog,
  canFallbackTrendsCatalogVariant,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  getTrendsCatalogSources,
  hasTrendsCatalogSource,
  hasTrendsPublicCatalogSource,
  getSourceSubtypeControlGroups,
  getSourceVariantOption,
  resolveTrendsCatalogVariant,
  subscribeTrendsSourceCatalog,
} from "../src/utils/sourceSubtypes.js";

const recentTrendsFrontendSources = [
  "apple-app-store",
  "apple-podcasts",
  "autohome-sales",
  "antutu-rankings",
  "zol-phone-rankings",
  "zol-tech-rankings",
  "bilibili-live",
  "huya-video-rankings",
  "bilibili-ai-arena",
  "bilibili-game-rankings",
  "bilibili-manga",
  "china-film-boxoffice",
  "chrome-web-store",
  "greasy-fork",
  "douyin-live",
  "fanqie-books",
  "hongguo-rank",
  "iqiyi-rank",
  "jjwxc-books",
  "kuaikan-comics",
  "kugou-music",
  "kuwo-music",
  "lanren-audio",
  "ludashi-rankings",
  "maoer-drama",
  "netease-music",
  "oppo-app-store",
  "pconline-rankings",
  "qidian-books",
  "qimao-books",
  "qingting-audio",
  "qq-music",
  "taptap-games",
  "xiaomi-app-store",
  "yingyongbao-store",
  "youku-rank",
  "lol-top-canyon",
  "modeldial-radar",
];

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
      key: "modeldial-radar",
      name: "ModelDial Radar",
      category: "ai",
      priorityTier: "B",
      rankingLabel: "AI Coding 模型实测榜",
      defaultVariant: "",
      variantSelectorEnabled: false,
      variantGroups: [],
      publicAvailable: true,
    },
    {
      key: "bilibili-ai-arena",
      name: "B站 AI 无限竞技场",
      category: "ai",
      priorityTier: "A",
      rankingLabel: "模型竞技榜",
      defaultVariant: "",
      variantSelectorEnabled: false,
      variantGroups: [],
      publicAvailable: false,
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
            { key: "hot", label: "热搜", recommendedRefreshIntervalSeconds: 180 },
          ],
        },
      ],
    },
  ],
};

assert.equal(applyTrendsSourceCatalog(catalog), 3);
assert.equal(hasTrendsCatalogSource("modeldial-radar"), true);
assert.deepEqual(
  getTrendsCatalogSources().find((source) => source.key === "modeldial-radar"),
  {
    key: "modeldial-radar",
    name: "ModelDial Radar",
    category: "ai",
    priorityTier: "B",
    rankingLabel: "AI Coding 模型实测榜",
    defaultVariant: "",
    publicAvailable: true,
  },
);
assert.equal(hasTrendsPublicCatalogSource("modeldial-radar"), true);
assert.equal(hasTrendsCatalogSource("bilibili-ai-arena"), true);
assert.equal(hasTrendsPublicCatalogSource("bilibili-ai-arena"), false);
assert.equal(hasTrendsPublicCatalogSource("not-in-catalog"), false);
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
      { key: "hot", label: "热搜" },
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
  { key: "hot", label: "热搜", dimensionValues: { ranking: "hot" }, runtimeAvailability: "available" },
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
const storeSource = fs.readFileSync(new URL("../src/store/index.js", import.meta.url).pathname, "utf8");
const sourceLogosSource = fs.readFileSync(new URL("../src/utils/sourceLogos.js", import.meta.url).pathname, "utf8");
for (const sourceKey of recentTrendsFrontendSources) {
  assert.ok(
    storeSource.includes(`"${sourceKey}"`),
    `recent Trends source ${sourceKey} must have curated frontend presentation metadata`,
  );
  assert.ok(
    sourceLogosSource.includes(`"${sourceKey}"`),
    `recent Trends source ${sourceKey} must have an explicit frontend logo mapping`,
  );
}
assert.match(storeSource, /syncTrendsCatalogSources\(\)/, "main store must merge newly admitted catalog sources");
assert.match(storeSource, /priorityTier === ["']A["'] \|\| source\.priorityTier === ["']B["']/, "catalog auto-discovery must stay limited to Tier A/B sources");
const apiSource = fs.readFileSync(new URL("../src/api/index.js", import.meta.url).pathname, "utf8");
assert.match(apiSource, /TRENDS_READ_SOURCES\.has\(type\) \|\| hasTrendsPublicCatalogSource\(type\)/, "only Public Catalog sources may automatically use the Trends anonymous read path");
const catalogLoaderSource = fs.readFileSync(new URL("../src/api/trendsCatalog.js", import.meta.url).pathname, "utf8");
assert.match(catalogLoaderSource, /DIRECTORY_API/, "frontend catalog loader must consume the full Trends directory");
assert.match(catalogLoaderSource, /publicAvailable/, "frontend catalog loader must preserve Public admission separately from directory discovery");
console.log(`[trends-catalog-contract] ${subtypeConsumers.length} runtime UI consumers use the reactive catalog revision contract`);
