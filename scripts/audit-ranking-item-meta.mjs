import assert from "node:assert/strict";
import {
  formatRankingPublishedAt,
  getRankingItemMeta,
  getRankingItemTimestamp,
} from "../src/utils/rankingItemMeta.js";

const publishedAt = "2026-09-14T01:02:03.000Z";
const publishedMs = Date.parse(publishedAt);
const updateTime = "2026-09-14T02:00:00.000Z";

assert.equal(
  getRankingItemTimestamp({ timestamp: 123, publishedAt }, updateTime),
  123,
  "provider timestamp must keep priority",
);
assert.equal(
  getRankingItemTimestamp({ publishedAt }, updateTime),
  publishedMs,
  "publishedAt must drive normalized item timestamp",
);
assert.equal(
  getRankingItemTimestamp({ publishedAt: "invalid" }, updateTime),
  Date.parse(updateTime),
  "invalid publishedAt must fall back to ranking update time",
);
const sample = {
  author: "示例作者",
  publishedAt,
  metrics: { views: 0, likes: 1200, comments: 34, collects: -1 },
};
const zhMeta = getRankingItemMeta(sample, "zh-CN");
assert.equal(zhMeta.hasContent, true);
assert.equal(zhMeta.hasMetrics, true);
assert.deepEqual(
  zhMeta.metrics.map(({ key, numeric }) => [key, numeric]),
  [["views", 0], ["likes", 1200], ["comments", 34]],
  "zero metrics must be preserved and invalid negative metrics dropped",
);
assert.equal(zhMeta.context[0]?.label, "作者");
assert.equal(formatRankingPublishedAt("invalid", "zh-CN"), "");

const completeSample = {
  hot: 900,
  metrics: { views: 4000, likes: 1200, comments: 34, collects: 88 },
};

for (const [variant, primaryKey] of [
  ["read-30d", "views"],
  ["like-14d", "likes"],
  ["collect-7d", "collects"],
]) {
  const meta = getRankingItemMeta(completeSample, "zh-CN", { variant });
  assert.equal(meta.primaryMetric?.key, primaryKey, `${variant} must select ${primaryKey}`);
  assert.equal(meta.primaryMetric?.isPrimary, true, `${variant} primary metric must be semantic`);
  assert.equal(meta.metrics[0]?.key, primaryKey, `${variant} primary metric must render first`);
  assert.equal(
    meta.metrics.filter(({ isPrimary }) => isPrimary).length,
    1,
    `${variant} must expose exactly one primary metric`,
  );
}

const fallback = getRankingItemMeta(
  { hot: 321, metrics: { views: null, comments: 4 } },
  "zh-CN",
  { variant: "read-3d" },
);
assert.equal(fallback.primaryMetric?.key, "views");
assert.equal(fallback.primaryMetric?.numeric, 321);
assert.deepEqual(
  fallback.metrics.map(({ key }) => key),
  ["views", "comments"],
  "variant-labelled hot fallback must stay primary without duplication",
);

const zeroPrimary = getRankingItemMeta(
  { hot: 12, metrics: { likes: 0, views: -1, comments: Number.NaN } },
  "zh-CN",
  { variant: "like-3d" },
);
assert.equal(zeroPrimary.primaryMetric?.numeric, 0, "a real zero primary value must be preserved");
assert.deepEqual(
  zeroPrimary.metrics.map(({ key }) => key),
  ["likes"],
  "invalid secondary metrics must remain excluded",
);

for (const [locale, label] of [
  ["zh-CN", "阅读"], ["zh-TW", "閱讀"], ["en", "Views"], ["ja", "閲覧"], ["ko", "조회"],
]) {
  const meta = getRankingItemMeta({ metrics: { views: 1 } }, locale);
  assert.equal(meta.metrics[0]?.label, label, `${locale} metric label must stay localized`);
}

for (const [locale, label] of [
  ["zh-CN", "热度"], ["zh-TW", "熱度"], ["en", "Heat"], ["ja", "注目度"], ["ko", "인기도"],
]) {
  const meta = getRankingItemMeta({ hot: 1 }, locale, { variant: "hot" });
  assert.equal(meta.primaryMetric?.label, label, `${locale} heat label must stay localized`);
}

console.log("[ranking-item-meta] variant-aware primary metrics, timestamp priority, localization and validation verified");
