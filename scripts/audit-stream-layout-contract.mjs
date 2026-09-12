import fs from "node:fs";
import assert from "node:assert/strict";

const component = fs.readFileSync("src/components/CategoryStream.vue", "utf8");
const store = fs.readFileSync("src/store/index.js", "utf8");
const template = component.split("<script setup>")[0];

assert.match(template, /category-stream__source-rail/);
assert.match(template, /category-stream__toc/);
assert.match(template, /category-stream__toc-children/);
assert.match(template, /sourceNavigationPathFor\(source\)/);
assert.match(template, /sourceVariantPathFor\(source\.name, item\.value\)/);
assert.match(template, /category-stream__main/);
assert.match(template, /category-stream__controls/);
assert.match(template, /v-if="!sourcePageMode"[\s\S]{0,900}copy\.rankRange/);
assert.match(template, /v-for="entry in pagedEntries"/);
assert.match(template, /category-stream__media is-cover/);
assert.match(template, /category-stream__media is-logo/);
assert.doesNotMatch(template, /category-stream__cover/);

assert.match(component, /if \(sourcePageMode\.value\) \{[\s\S]{0,250}props\.sourcePageSource/);
assert.match(component, /!sourcePageMode\.value &&[\s\S]{0,100}!isPinned/);
assert.match(component, /const minimalMode = computed\(\(\) => !showImages\.value && !showDescriptions\.value\)/);
assert.match(component, /const PAGE_SIZE_VALUES = \[20, 30, 50, 100\]/);
assert.match(component, /getSourceSubtypeGroups/);
assert.match(component, /sourceFilterValue/);
assert.match(component, /sourcePageMode\.value \? props\.sourcePageSource : ""/);
assert.match(store, /showStreamDescriptions: true/);
assert.match(store, /"showStreamDescriptions"/);

console.log("[stream-layout-contract] three-column layout, source-page rank independence, pagination and minimal mode verified");
