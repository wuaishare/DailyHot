# Quieter Primary Metric Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ranking primary metrics use theme-colored text as their only visual distinction.

**Architecture:** Keep the existing variant resolver, metric ordering and `is-primary` semantic state unchanged. Tighten the consumer audit, then remove primary-only badge decoration from the four Vue presentation surfaces while retaining their existing theme tokens.

**Tech Stack:** Vue 3, scoped SCSS/CSS, Node.js assertions, Vite

---

### Task 1: Guard the quieter visual contract

**Files:**
- Modify: `scripts/audit-ranking-meta-consumers.mjs`

- [ ] **Step 1: Add a failing style audit**

Extract the primary selector blocks for `CategoryStream`, `CategorySourceRail`, `HotList` and `List`, then reject primary-only badge properties:

```js
const assertColorOnlyPrimary = (name, source, selector) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `${name} must define ${selector}`);
  assert.match(match[1], /color\s*:/, `${name} primary metric must keep theme color`);
  assert.doesNotMatch(match[1], /(?:background|border|padding|font-weight)\s*:/);
};
```

- [ ] **Step 2: Run the audit and confirm it fails**

Run: `npm run audit:ranking-meta-consumers`

Expected: FAIL because the current primary styles include background, border, padding or extra font weight.

- [ ] **Step 3: Commit the red test**

```bash
git add scripts/audit-ranking-meta-consumers.mjs
git commit -m "测试：约束主指标仅使用文字色强调"
```

### Task 2: Remove primary-only badge decoration

**Files:**
- Modify: `src/components/CategoryStream.vue`
- Modify: `src/components/CategorySourceRail.vue`
- Modify: `src/components/HotList.vue`
- Modify: `src/views/List.vue`

- [ ] **Step 1: Reduce every primary rule to color only**

Keep each selector and theme token, but remove primary-only padding, border, border radius, background and font weight. Keep the value inheriting the same color without raising its weight:

```css
.category-stream__metric.is-primary {
  color: var(--category-stream-primary);
}

.category-stream__metric.is-primary strong {
  color: inherit;
}
```

Apply the equivalent rule to `.category-story-card__primary-metric`, `.preview-metric.is-primary` and `.ranking-metric.is-primary`. Remove the covered-card badge override from `CategorySourceRail`.

- [ ] **Step 2: Run focused audits**

Run: `npm run audit:ranking-meta-consumers && npm run audit:ranking-item-meta`

Expected: both audits pass.

- [ ] **Step 3: Commit the implementation**

```bash
git add src/components/CategoryStream.vue src/components/CategorySourceRail.vue src/components/HotList.vue src/views/List.vue
git commit -m "优化：将榜单主指标收敛为文字色强调"
```

### Task 3: Verify and publish

**Files:**
- Verify: `package.json`
- Verify: production ranking routes

- [ ] **Step 1: Run the complete build**

Run: `npm run build`

Expected: all prebuild audits, Vite build, PWA generation and SEO route audits pass.

- [ ] **Step 2: Inspect the final diff and privacy boundary**

Run: `git diff --check origin/main...HEAD`

Expected: no whitespace errors and no unrelated files.

- [ ] **Step 3: Push, merge and verify production**

Publish a focused PR, wait for exact-head checks, squash merge, fast-forward `main`, and verify `read-30d`, `like-14d`, `collect-30d` and `hot` in the Codex built-in browser. Computed primary styles must have the theme color while background and border match ordinary metrics; test light, dark and 390px layouts, then confirm the console is clean.
