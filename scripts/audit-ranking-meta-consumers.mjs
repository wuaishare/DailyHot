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

for (const [name, source] of Object.entries({ stream, list })) {
  assert.match(source, /is-primary/, `${name} must render a semantic primary metric state`);
}

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

for (const [name, source, selector] of [
  ["CategoryStream", stream, ".category-stream__metric.is-primary"],
  ["CategorySourceRail", rail, ".category-story-card__primary-metric"],
  ["List", list, "&.is-primary"],
]) {
  const block = primaryStyleBlock(name, source, selector);
  assert.match(block, /\bcolor\s*:/, `${name} primary metric must keep theme color`);
  assert.doesNotMatch(
    block,
    /\b(?:background(?:-color)?|border(?:-[\w-]+)?|padding(?:-[\w-]+)?|font-weight)\s*:/,
    `${name} primary metric must use color as its only visual distinction`,
  );
}

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

console.log("[ranking-meta-consumers] result variant, shared resolver and semantic primary states verified");
