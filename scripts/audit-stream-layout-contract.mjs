import fs from "node:fs";
import assert from "node:assert/strict";

const component = fs.readFileSync("src/components/CategoryStream.vue", "utf8");
const store = fs.readFileSync("src/store/index.js", "utf8");
const home = fs.readFileSync("src/views/Home.vue", "utf8");
const categoryRail = fs.readFileSync("src/components/CategorySourceRail.vue", "utf8");
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
assert.match(component, /\.category-stream__body \{[\s\S]{0,180}display: grid;/);
assert.match(component, /grid-template-columns: 280px minmax\(520px, 720px\) 280px;/);
assert.match(component, /\.category-stream__body \{[\s\S]{0,240}width: 100%;/);
assert.doesNotMatch(component, /\.category-stream__body \{[\s\S]{0,240}width: min\(100%, 1360px\)/);
assert.match(component, /--category-stream-primary/);
assert.match(component, /\.category-stream__toc-source\.active[\s\S]{0,220}var\(--category-stream-primary\)/);
assert.match(component, /\.category-stream__toc-child\.active[\s\S]{0,160}var\(--category-stream-primary\)/);

assert.match(home, /import CategorySourceRail from "@\/components\/CategorySourceRail\.vue"/);
assert.match(home, /<CategorySourceRail[\s\S]{0,160}:sources="scopedNews"/);
assert.doesNotMatch(home, /CategoryStream/);
assert.match(categoryRail, /grid-template-columns: 220px minmax\(0, 1fr\)/);
assert.match(categoryRail, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/);
assert.match(categoryRail, /closest\?\.\('\.n-scrollbar-container'\)/);
assert.match(categoryRail, /scrollHost\.addEventListener\('scroll', queueActiveSync/);
assert.match(categoryRail, /new IntersectionObserver/);
assert.match(categoryRail, /rootMargin: '800px 0px 800px 0px'/);
assert.match(categoryRail, /INITIAL_SOURCE_LOAD_COUNT = 5/);
assert.match(categoryRail, /overflow-x: auto/);
assert.match(categoryRail, /grid-auto-flow: column/);
assert.match(categoryRail, /category-story-card__cover/);
assert.match(categoryRail, /backdrop-filter: blur\(12px\) saturate\(1\.18\)/);
assert.match(store, /showStreamDescriptions: true/);
assert.match(store, /"showStreamDescriptions"/);

console.log("[stream-layout-contract] single-ranking three-column geometry and category TOC rail separation verified");
