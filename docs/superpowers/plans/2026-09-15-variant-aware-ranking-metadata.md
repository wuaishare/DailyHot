# Variant-Aware Ranking Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ranking metadata reflect the active canonical variant, highlight its primary metric with the theme color, and expose valid secondary metrics consistently across DailyHot ranking surfaces.

**Architecture:** Preserve the API-returned `variant` in normalized ranking results, then route every ranking item through the existing `rankingItemMeta` utility with that result variant and the UI subtype as fallback. The utility owns canonical variant mapping, numeric validation, fallback to `item.hot`, localization, primary ordering, and semantic `isPrimary` flags; components only choose compact or complete rendering.

**Tech Stack:** Vue 3 Composition API, Vite, Naive UI theme variables, Node.js contract audits, SCSS, Vercel production deployment

---

## File map

- Modify `src/utils/rankingItemMeta.js`: own variant-to-primary mapping, localized heat label, metric fallback, ordering and semantic metadata.
- Modify `scripts/audit-ranking-item-meta.mjs`: executable behavior contract for all variants, fallbacks, zero values, invalid values and locales.
- Modify `src/api/index.js`: preserve the actual Trends `feed.variant` on normalized results.
- Create `scripts/audit-ranking-meta-consumers.mjs`: static contract for result propagation and the four Vue consumers.
- Modify `package.json`: run the new consumer contract during `prebuild` without changing Release `1.4.9`.
- Modify `src/components/CategoryStream.vue`: render primary, secondary and context metadata in the production source-page stream.
- Modify `src/components/CategorySourceRail.vue`: render only the resolved primary metric plus author in dense horizontal cards.
- Modify `src/components/HotList.vue`: pass variant context and style the primary metric in hover/focus previews.
- Modify `src/views/List.vue`: pass variant context and style the primary metric in the legacy detail list.
- Modify `docs/superpowers/specs/2026-09-15-variant-aware-ranking-metadata-design.md`: only if implementation uncovers a material contract correction.

### Task 1: Lock the metadata behavior contract

**Files:**
- Modify: `scripts/audit-ranking-item-meta.mjs`
- Test: `scripts/audit-ranking-item-meta.mjs`

- [ ] **Step 1: Write failing variant tests**

Add a complete sample and assertions for primary selection, ordering and fallback:

```js
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
  assert.equal(meta.primaryMetric?.key, primaryKey);
  assert.equal(meta.primaryMetric?.isPrimary, true);
  assert.equal(meta.metrics[0]?.key, primaryKey);
  assert.equal(meta.metrics.filter(({ isPrimary }) => isPrimary).length, 1);
}

const fallback = getRankingItemMeta(
  { hot: 321, metrics: { views: null, comments: 4 } },
  "zh-CN",
  { variant: "read-3d" },
);
assert.equal(fallback.primaryMetric?.key, "views");
assert.equal(fallback.primaryMetric?.numeric, 321);
assert.deepEqual(fallback.metrics.map(({ key }) => key), ["views", "comments"]);

const hotMeta = getRankingItemMeta({ hot: 99 }, "zh-CN", { variant: "hot" });
assert.equal(hotMeta.primaryMetric?.key, "hot");
assert.equal(hotMeta.primaryMetric?.label, "热度");
```

- [ ] **Step 2: Run the audit and confirm the intended failure**

Run: `npm run audit:ranking-item-meta`

Expected: FAIL because `getRankingItemMeta` does not accept variant context or expose `primaryMetric` / `isPrimary`.

- [ ] **Step 3: Add locale and invalid-value assertions**

Extend the existing locale loop to cover `hot`, and assert a zero-valued primary metric remains visible while invalid values remain excluded:

```js
for (const [locale, label] of [
  ["zh-CN", "热度"],
  ["zh-TW", "熱度"],
  ["en", "Heat"],
  ["ja", "注目度"],
  ["ko", "인기도"],
]) {
  const meta = getRankingItemMeta({ hot: 1 }, locale, { variant: "hot" });
  assert.equal(meta.primaryMetric?.label, label);
}

const zeroPrimary = getRankingItemMeta(
  { hot: 12, metrics: { likes: 0, views: -1, comments: Number.NaN } },
  "zh-CN",
  { variant: "like-3d" },
);
assert.equal(zeroPrimary.primaryMetric?.numeric, 0);
assert.deepEqual(zeroPrimary.metrics.map(({ key }) => key), ["likes"]);
```

- [ ] **Step 4: Keep the audit red until the utility implementation begins**

Run: `npm run audit:ranking-item-meta`

Expected: FAIL at the first new primary-metric assertion, proving the test detects the production bug.

### Task 2: Implement the centralized variant-aware resolver

**Files:**
- Modify: `src/utils/rankingItemMeta.js`
- Test: `scripts/audit-ranking-item-meta.mjs`

- [ ] **Step 1: Add localized heat labels and variant mapping**

Extend every `LABELS` entry with `hot`, then add a pure resolver:

```js
const PRIMARY_METRIC_PREFIXES = [
  ["read-", "views"],
  ["like-", "likes"],
  ["collect-", "collects"],
];

export const getRankingPrimaryMetricKey = (variant = "") => {
  const normalized = String(variant || "").trim().toLowerCase();
  return PRIMARY_METRIC_PREFIXES.find(([prefix]) => normalized.startsWith(prefix))?.[1] || "hot";
};
```

- [ ] **Step 2: Build a primary-first, de-duplicated metric list**

Change the signature to `getRankingItemMeta(item = {}, locale = "zh-CN", context = {})`. Use `context.variant`, resolve the primary key, take its value from `item.metrics[key]`, and fall back to `item.hot` only when the primary value is absent. Add remaining valid metrics once in the established order:

```js
const metricOrder = ["views", "likes", "comments", "collects"];
const primaryKey = getRankingPrimaryMetricKey(context?.variant);
const primaryNumeric = normalizeMetric(
  primaryKey === "hot" ? item?.hot : item?.metrics?.[primaryKey],
);
const fallbackNumeric = primaryKey === "hot" ? null : normalizeMetric(item?.hot);
const resolvedPrimaryNumeric = primaryNumeric ?? fallbackNumeric;
const primaryMetric = resolvedPrimaryNumeric === null
  ? null
  : buildMetric(primaryKey, resolvedPrimaryNumeric, labels, normalized, true);
const metrics = [
  ...(primaryMetric ? [primaryMetric] : []),
  ...metricOrder
    .filter((key) => key !== primaryKey)
    .flatMap((key) => {
      const numeric = normalizeMetric(item?.metrics?.[key]);
      return numeric === null ? [] : [buildMetric(key, numeric, labels, normalized, false)];
    }),
];
```

- [ ] **Step 3: Return the semantic primary fields**

Return `primaryMetricKey`, `primaryMetric`, `metrics`, `hasMetrics` and `hasContent` together with the existing context array. `hasContent` must remain true for author-only and primary-only items.

- [ ] **Step 4: Run the focused audit**

Run: `npm run audit:ranking-item-meta`

Expected: PASS and print a summary mentioning variant-aware primary metrics, localization and validation.

- [ ] **Step 5: Commit the behavior unit**

```bash
git add src/utils/rankingItemMeta.js scripts/audit-ranking-item-meta.mjs
git commit -m "修复：按榜单变体解析主指标" -m "变更：统一阅读、点赞、收藏与热度的主指标选择、回退和排序。\n验证：npm run audit:ranking-item-meta。\n回滚：撤销本提交可恢复原有通用指标列表。"
```

### Task 3: Preserve result variant and lock consumer wiring

**Files:**
- Modify: `src/api/index.js`
- Create: `scripts/audit-ranking-meta-consumers.mjs`
- Modify: `package.json`
- Test: `scripts/audit-ranking-meta-consumers.mjs`

- [ ] **Step 1: Write the failing static contract**

Create an audit that reads the API and four Vue files and asserts these exact responsibilities:

```js
import assert from "node:assert/strict";
import fs from "node:fs";

const api = fs.readFileSync("src/api/index.js", "utf8");
const stream = fs.readFileSync("src/components/CategoryStream.vue", "utf8");
const rail = fs.readFileSync("src/components/CategorySourceRail.vue", "utf8");
const hotList = fs.readFileSync("src/components/HotList.vue", "utf8");
const list = fs.readFileSync("src/views/List.vue", "utf8");

assert.match(api, /variant:\s*feed\?\.variant\s*\|\|\s*["']{2}/);
for (const [name, source] of Object.entries({ stream, rail, hotList, list })) {
  assert.match(source, /getRankingItemMeta\(/, `${name} must use the shared resolver`);
  assert.match(source, /variant:/, `${name} must pass variant context`);
}
for (const [name, source] of Object.entries({ stream, hotList, list })) {
  assert.match(source, /is-primary/, `${name} must render a semantic primary state`);
}
assert.doesNotMatch(stream, /copy\.heat\s*\}\}\s*\{\{\s*formatCompactMetric\(entry\.hot/);
assert.doesNotMatch(rail, /entry\.hot\s*\?\s*`\$\{copy\.heat\}/);
```

- [ ] **Step 2: Register and run the audit**

Add `"audit:ranking-meta-consumers": "node scripts/audit-ranking-meta-consumers.mjs"` and place it immediately after `audit:ranking-item-meta` in `prebuild`.

Run: `npm run audit:ranking-meta-consumers`

Expected: FAIL because the API drops `feed.variant`, stream/rail use hard-coded heat, and consumers do not pass variant context.

- [ ] **Step 3: Preserve the API-returned variant**

In `normalizeTrendsRankingResult`, add:

```js
variant: feed?.variant || "",
```

Do not mutate individual items and do not infer the variant from a localized ranking label.

- [ ] **Step 4: Keep the consumer audit red**

Run: `npm run audit:ranking-meta-consumers`

Expected: FAIL on the first component that has not yet adopted the shared resolver.

### Task 4: Adopt the resolver in all four ranking surfaces

**Files:**
- Modify: `src/components/CategoryStream.vue`
- Modify: `src/components/CategorySourceRail.vue`
- Modify: `src/components/HotList.vue`
- Modify: `src/views/List.vue`
- Test: `scripts/audit-ranking-meta-consumers.mjs`

- [ ] **Step 1: Wire `CategoryStream` with actual-result priority**

Import `getRankingItemMeta`. While constructing entries, resolve metadata with the returned result variant first and source subtype second:

```js
const rankingMeta = getRankingItemMeta(item, locale.value, {
  variant: result?.variant || sourceSubtypeFor(source.name),
});
```

Store `rankingMeta` on the entry and include its label/value/context in search matching.

- [ ] **Step 2: Replace hard-coded heat markup in `CategoryStream`**

Render primary-first metrics plus context:

```vue
<div v-if="showDescriptions && entry.rankingMeta?.hasContent" class="category-stream__meta">
  <span
    v-for="metric in entry.rankingMeta.metrics"
    :key="metric.key"
    class="category-stream__metric"
    :class="{ 'is-primary': metric.isPrimary }"
  >
    <span>{{ metric.label }}</span>
    <strong>{{ metric.value }}</strong>
  </span>
  <span
    v-for="meta in entry.rankingMeta.context"
    :key="meta.key"
    class="category-stream__context-meta"
  >{{ meta.label }} {{ meta.value }}</span>
</div>
```

Style `.is-primary` with `var(--category-stream-primary)`, `font-weight: 700`, and a subtle `color-mix` background/border. Use `flex-wrap: wrap`; keep secondary values readable but muted.

- [ ] **Step 3: Wire compact `CategorySourceRail`**

Import the resolver and attach metadata with:

```js
rankingMeta: getRankingItemMeta(item, locale.value, {
  variant: result?.variant || sourceSubtype(sourceName),
}),
```

Replace the hard-coded heat branch with `entry.rankingMeta?.primaryMetric`, showing its localized label/value plus author. Keep the compact card to one primary metric rather than rendering every secondary metric.

- [ ] **Step 4: Wire `HotList` preview**

Pass `hotListData.value?.variant || activeSubType.value` to `getRankingItemMeta`. Add `:class="{ 'is-primary': metric.isPrimary }"` to `.preview-metric`, then style it with `var(--n-primary-color, #ea444d)`, stronger weight and a subtle mixed border/background.

- [ ] **Step 5: Wire the legacy `List.vue`**

Pass `listData.value?.variant || listSubType.value` to the resolver and add the same semantic class to `.ranking-metric`. Use the Naive UI theme variable rather than a source-specific red.

- [ ] **Step 6: Run both focused audits**

Run:

```bash
npm run audit:ranking-item-meta
npm run audit:ranking-meta-consumers
```

Expected: both PASS. The consumer audit reports API variant preservation, shared parsing and semantic primary styling.

- [ ] **Step 7: Commit the integration slice**

```bash
git add package.json scripts/audit-ranking-meta-consumers.mjs src/api/index.js src/components/CategoryStream.vue src/components/CategorySourceRail.vue src/components/HotList.vue src/views/List.vue
git commit -m "修复：展示榜单对应主指标与辅助指标" -m "变更：四个榜单入口统一消费变体感知元数据，并用主题样式突出主指标。\n验证：npm run audit:ranking-item-meta；npm run audit:ranking-meta-consumers。\n回滚：撤销本提交可恢复原入口渲染，不影响接口兼容性。"
```

### Task 5: Full verification, PR and production acceptance

**Files:**
- Verify: all modified files
- Verify: production routes under `https://hot.wuaishare.cn/rank/xiaohongshu/*`

- [ ] **Step 1: Run repository quality checks**

Run:

```bash
git diff --check origin/main...HEAD
npm run build
git status --short --branch
```

Expected: no whitespace errors; every prebuild audit, Vite build, route-shell generation and SEO audit passes; only intentional files differ from `origin/main`.

- [ ] **Step 2: Review public-repository boundaries**

Run:

```bash
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- . ':!package-lock.json'
rg -n "token|secret|cookie|authorization|pgy|wpbetter" docs/superpowers src scripts package.json
```

Expected: the diff contains only neutral technical behavior and no credential, cookie, private strategy or proprietary implementation detail.

- [ ] **Step 3: Push and create one PR**

Push `codex/xhs-variant-aware-meta`, create a Chinese PR describing change, validation and rollback, and wait for the exact-head Vercel/CI checks to succeed before merge.

- [ ] **Step 4: Merge and Return-to-Trunk**

Squash merge the PR, verify PR state plus tree/patch equivalence, fast-forward canonical `main`, rerun relevant merged-main audits/build, delete the local and remote short-lived branch, and prune worktree metadata. Leave the unrelated pre-existing `codex/variant-runtime-state` branch untouched.

- [ ] **Step 5: Wait for production deployment**

Confirm the Vercel deployment for merged `main` reports success and the footer build number differs from the previous production build `2609150344`.

- [ ] **Step 6: Verify the four ranking families in the built-in browser**

Check representative routes:

```text
/rank/xiaohongshu/hot
/rank/xiaohongshu/read-30d
/rank/xiaohongshu/like-14d
/rank/xiaohongshu/collect-30d
```

Expected:

- hot shows 热度 as primary;
- read shows 阅读 first and emphasized;
- like shows 点赞 first and emphasized, never “热度 118.5万” for the primary value;
- collect shows 收藏 first and emphasized;
- valid secondary metrics remain visible and localized;
- author/published context appears where the surface design allows it;
- theme emphasis remains visible in light and dark modes and is not color-only;
- mobile viewport has no horizontal overflow.

- [ ] **Step 7: Re-run cover and console acceptance**

On `read-30d`, verify the first 15 inline images use the same-origin `/api/image-proxy`, are complete, and have positive natural dimensions. Open the first hover/focus preview and verify cover, context and the highlighted primary metric. Confirm the browser console contains no new errors or warnings.

- [ ] **Step 8: Close the cross-repository implementation record**

After production UI evidence is complete, update the existing backend implementation plan in `/Applications/ServBay/www/wpbetter.cn/.project-docs/plans/2026-09-15-trends-xiaohongshu-pgy-browser-runtime-implementation-plan.md` with the exact DailyHot PR, merged commit, production build, four-family metadata results, 15/15 cover result and console result. Deliver that docs-only change through its own governed backend PR and Return-to-Trunk cycle.
