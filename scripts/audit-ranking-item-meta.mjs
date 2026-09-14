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

for (const [locale, label] of [
  ["zh-CN", "阅读"], ["zh-TW", "閱讀"], ["en", "Views"], ["ja", "閲覧"], ["ko", "조회"],
]) {
  const meta = getRankingItemMeta({ metrics: { views: 1 } }, locale);
  assert.equal(meta.metrics[0]?.label, label, `${locale} metric label must stay localized`);
}

console.log("[ranking-item-meta] timestamp priority, localized metadata and metric validation verified");
