import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const api = read("src/api/index.js");
const stream = read("src/components/CategoryStream.vue");
const rail = read("src/components/CategorySourceRail.vue");
const hotList = read("src/components/HotList.vue");
const list = read("src/views/List.vue");

assert.match(
  api,
  /variant:\s*feed\?\.variant\s*\|\|\s*["']{2}/,
  "normalized Trends results must preserve the API-returned variant",
);

for (const [name, source] of Object.entries({ stream, rail, hotList, list })) {
  assert.match(source, /getRankingItemMeta\(/, `${name} must use the shared ranking metadata resolver`);
  assert.match(
    source,
    /getRankingItemMeta\([\s\S]*?variant:/,
    `${name} must pass variant context to the shared resolver`,
  );
}

assert.match(
  stream,
  /:class="\{ 'is-primary': isXiaohongshuSourcePage && metric\.isPrimary && metric\.key !== 'hot' \}"/,
  "only non-heat primary metrics on the Xiaohongshu source detail page may receive theme emphasis",
);

assert.doesNotMatch(
  stream,
  /metric\.key === ['"]hot['"][\s\S]{0,180}is-primary/,
  "Xiaohongshu heat must stay visually neutral even when hot is the active variant",
);
assert.doesNotMatch(
  list,
  /:class="\{ 'is-primary': metric\.isPrimary \}"|&\.is-primary/,
  "legacy list view metrics must stay visually neutral",
);

assert.match(
  hotList,
  /promotePrimary:\s*false/,
  "HotList hover preview must preserve its neutral metadata contract",
);
assert.doesNotMatch(
  hotList,
  /\.preview-metric\.is-primary/,
  "HotList hover preview must not inherit card-level primary metric emphasis",
);

const primaryStyleBlock = (name, source, selector) => {
  const start = source.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${name} must define ${selector}`);
  const end = source.indexOf("}", start);
  assert.notEqual(end, -1, `${name} must close ${selector}`);
  return source.slice(start, end);
};

const streamPrimaryBlock = primaryStyleBlock(
  "CategoryStream",
  stream,
  ".category-stream__metric.is-primary",
);
assert.match(streamPrimaryBlock, /\bcolor\s*:/, "Xiaohongshu detail primary metric must keep theme color");
assert.doesNotMatch(
  streamPrimaryBlock,
  /\b(?:background(?:-color)?|border(?:-[\w-]+)?|padding(?:-[\w-]+)?|font-weight)\s*:/,
  "Xiaohongshu detail primary metric must use color as its only visual distinction",
);

const railPrimaryBlock = primaryStyleBlock(
  "CategorySourceRail",
  rail,
  ".category-story-card__primary-metric",
);
assert.match(railPrimaryBlock, /color:\s*inherit/, "card metrics must keep the default neutral text color");

assert.doesNotMatch(
  rail,
  /\.category-story-card\.has-cover \.category-story-card__primary-metric\s*\{/,
  "CategorySourceRail covered cards must not restore a primary metric badge",
);

assert.doesNotMatch(
  stream,
  /copy\.heat\s*\}\}\s*\{\{\s*formatCompactMetric\(entry\.hot/,
  "CategoryStream must not label every ranking value as heat",
);
assert.doesNotMatch(
  rail,
  /entry\.hot\s*\?\s*`\$\{copy\.heat\}/,
  "CategorySourceRail must not label every ranking value as heat",
);

assert.match(stream, /const isXiaohongshuSourcePage = computed\([\s\S]{0,180}props\.sourcePageSource === ["']xiaohongshu["']/, "Xiaohongshu metric emphasis must be scoped to its source detail page");
assert.match(stream, /XIAOHONGSHU_METRIC_ICONS = Object\.freeze\(\{[\s\S]{0,220}views: PreviewOpen[\s\S]{0,80}likes: Like[\s\S]{0,80}comments: Comment[\s\S]{0,80}collects: Star/, "Xiaohongshu engagement labels must use established IconPark glyphs");
assert.match(stream, /isXiaohongshuSourcePage && XIAOHONGSHU_METRIC_ICONS\[metric\.key\][\s\S]{0,260}:title="metric\.label"[\s\S]{0,160}:aria-label="metric\.label"/, "Xiaohongshu engagement icons must retain accessible text semantics");
assert.match(stream, /metric\.key === ['"]hot['"][\s\S]{0,240}<n-icon :component="Fire" \/>/, "CategoryStream heat metrics must use the established IconPark Fire icon");
assert.match(rail, /primaryMetric\.key === ['"]hot['"][\s\S]{0,300}<n-icon :component="Fire" \/>/, "CategorySourceRail heat metrics must use the established IconPark Fire icon");
assert.match(list, /metric\.key === ['"]hot['"][\s\S]{0,240}<n-icon :component="Fire" \/>/, "List heat metrics must use the established IconPark Fire icon");
assert.match(hotList, /preview-hot-icon[\s\S]{0,120}:component="Fire"/, "HotList preview heat must preserve the established IconPark Fire icon");
for (const [name, source] of Object.entries({ stream, rail, hotList, list })) {
  assert.doesNotMatch(source, /<UiGlyph[^>]*name="fire"/, `${name} must not replace the established heat icon with a custom UiGlyph fire`);
}

console.log("[ranking-meta-consumers] result variant, shared resolver and semantic primary states verified");
