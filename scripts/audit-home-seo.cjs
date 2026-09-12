const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const expected = {
  title: "吾爱热榜 - 今日热榜、全网热搜与实时热点聚合",
  description:
    "吾爱热榜聚合微博、百度、知乎、抖音、B站、头条等平台今日热榜与实时热搜，支持分类浏览、榜单切换和自动刷新，一站掌握全网热点。",
  keywords:
    "吾爱热榜,今日热榜,全网热搜,全网热点,实时热点,热榜聚合,微博热搜,百度热搜,知乎热榜,抖音热榜,B站热榜,头条热榜",
  siteName: "吾爱热榜",
  alternateName: "今日热榜",
};

const html = fs.readFileSync(path.join(__dirname, "..", "dist", "index.html"), "utf8");
const text = (pattern, label) => {
  const match = html.match(pattern);
  assert.ok(match, `${label} is missing`);
  return match[1].trim();
};

assert.equal(text(/<title>([^<]+)<\/title>/i, "title"), expected.title);
assert.equal(text(/<meta\s+name="description"\s+content="([^"]+)"/i, "description"), expected.description);
assert.equal(text(/<meta\s+name="keywords"\s+content="([^"]+)"/i, "keywords"), expected.keywords);
assert.equal(text(/<meta\s+property="og:title"\s+content="([^"]+)"/i, "og:title"), expected.title);
assert.equal(text(/<meta\s+property="og:description"\s+content="([^"]+)"/i, "og:description"), expected.description);
assert.equal(text(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i, "og:site_name"), expected.siteName);
assert.equal(text(/<meta\s+name="twitter:title"\s+content="([^"]+)"/i, "twitter:title"), expected.title);
assert.equal(text(/<meta\s+name="twitter:description"\s+content="([^"]+)"/i, "twitter:description"), expected.description);

const jsonLdText = text(
  /<script\s+id="dailyhot-route-jsonld"\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  "homepage WebSite JSON-LD",
);
const jsonLd = JSON.parse(jsonLdText);
assert.equal(jsonLd["@type"], "WebSite");
assert.equal(jsonLd.name, expected.siteName);
assert.equal(jsonLd.alternateName, expected.alternateName);
assert.equal(jsonLd.headline, expected.title);
assert.equal(jsonLd.description, expected.description);
assert.equal(jsonLd.inLanguage, "zh-CN");
assert.ok(!html.includes("全网热点排行榜聚合、分类热榜与实时趋势追踪_吾爱分享网"));

const seoSource = fs.readFileSync(
  path.join(__dirname, "..", "src", "utils", "seo.js"),
  "utf8",
);
assert.match(seoSource, /setJsonLd\("dailyhot-route-jsonld", jsonLd\)/);
assert.doesNotMatch(seoSource, /setJsonLd\("page-schema", jsonLd\)/);

console.log("[home-seo-audit] homepage title, social metadata and WebSite identity are consistent");
