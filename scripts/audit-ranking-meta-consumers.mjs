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

for (const [name, source] of Object.entries({ stream, hotList, list })) {
  assert.match(source, /is-primary/, `${name} must render a semantic primary metric state`);
}

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
