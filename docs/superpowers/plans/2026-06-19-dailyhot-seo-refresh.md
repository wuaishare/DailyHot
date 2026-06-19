# DailyHot SEO Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix rank SEO label translation, ClawHub active state, and route-aware auto-refresh countdown behavior.

**Architecture:** Reuse existing subtype label localization for runtime SEO and mirror it in the static shell generator. Keep refresh scheduling centralized in `App.vue`, while `Header.vue` displays controls and countdown on all relevant routes. Keep source active matching local to `List.vue`.

**Tech Stack:** Vue 3, Pinia, Vue Router, Vite, Node build scripts.

---

### Task 1: SEO Labels

**Files:**
- Modify: `src/utils/seo.js`
- Modify: `scripts/generate-route-shells.cjs`

- [ ] Import or mirror localized subtype labels.
- [ ] Build Chinese rank titles with localized subtype labels.
- [ ] Strip leading `的` after source-label removal.
- [ ] Verify ClawHub route shell title no longer contains untranslated subtype words.

### Task 2: ClawHub Active State

**Files:**
- Modify: `src/views/List.vue`

- [ ] Add source-family normalization for `clawhub-skills` and `clawhub-plugins`.
- [ ] Use normalized source comparison for top-strip tag active state.
- [ ] Keep click behavior unchanged.

### Task 3: Auto Refresh State

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/Header.vue`

- [ ] Include `list`, `list-locale`, `setting`, and `setting-locale` in refresh-control visibility.
- [ ] Preserve `window.$nextAutoRefreshAt` when entering settings by storing remaining milliseconds.
- [ ] Restore the target from frozen remaining time when leaving settings.
- [ ] Avoid auto-resuming user manual pauses.

### Task 4: Verification

**Commands and checks:**
- [ ] Run `pnpm build`.
- [ ] Inspect `dist/rank/clawhub/plugins-recommended/index.html`.
- [ ] Use the Codex in-app browser to verify category, rank detail, and settings routes.
