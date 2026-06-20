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

- [x] Import or mirror localized subtype labels.
- [x] Build Chinese rank titles with localized subtype labels.
- [x] Strip leading `的` after source-label removal.
- [x] Add a ClawHub-specific Chinese SEO intent map that mentions OpenClaw and distinguishes skill/plugin subtypes.
- [x] Verify ClawHub route shell title no longer contains untranslated subtype words.
- [x] Verify ClawHub route shell title no longer reuses one fixed `Skills 与 Plugins` tail.

### Task 2: ClawHub Active State

**Files:**
- Modify: `src/views/List.vue`

- [x] Add source-family normalization for `clawhub-skills` and `clawhub-plugins`.
- [x] Use normalized source comparison for top-strip tag active state.
- [x] Keep click behavior unchanged.

### Task 3: Auto Refresh State

**Files:**
- Modify: `src/App.vue`
- Modify: `src/components/Header.vue`

- [x] Include `list`, `list-locale`, `setting`, and `setting-locale` in refresh-control visibility.
- [x] Preserve `window.$nextAutoRefreshAt` when entering settings by storing remaining milliseconds.
- [x] Restore the target from frozen remaining time when leaving settings.
- [x] Avoid auto-resuming user manual pauses.

### Task 4: Verification

**Commands and checks:**
- [x] Run `pnpm build`.
- [x] Inspect `dist/rank/clawhub/index.html`, `dist/rank/clawhub/plugins-recommended/index.html`, and `dist/rank/clawhub/skills-installs/index.html`.
- [x] Use browser automation to verify category, rank detail, and settings routes.

### Latest Verification

- Production deployment `dpl_CwuVeFjksFyHUvGwzcbMgmy8NTLF` is aliased to `https://hot.wuaishare.cn` with visible build number `2606210407` and main asset `/assets/index-1a205e49.js`.
- `VERIFY=2606210407 AUDIT_TIMEOUT_MS=30000 pnpm audit:live` passed `25` production checks, including ClawHub OpenClaw route SEO, Bilibili default-to-popular SEO, concise Toutiao SEO, localized route shell metadata, sitemap/IndexNow discovery, AI route SEO, localized AI API labels, AI ranking endpoints, readable-title translation, zh-CN-to-target translation behavior, and model-term preservation.
- `VERIFY=2606210407 AUDIT_TIMEOUT_MS=30000 pnpm audit:subtypes` passed all configured/default subtype data checks for `139` cases, including Bilibili popular tabs, IT之家 day/week/month, DesignArena full-stack/front-end/quality/usage categories, OpenRouter, ClawHub, Arena AI, LLM Stats, AICPB, GitHub, Tianya, and the hardened retry path for transient upstream 5xx responses.
- Direct production API probes returned HTTP 200 for `bilibili?type=all`, `clawhub-skills`, and `clawhub?type=plugins-recommended&locale=ko`; the Korean ClawHub response labels were localized as `추천 플러그인`.
- Production raw HTML for `/rank/bilibili` contains `哔哩哔哩综合热门 - 全站热视频、UP主内容与流行视频趋势 | 吾爱热榜`, canonicalizes to `/rank/bilibili/all`, and includes route JSON-LD.
- Browser automation on production verified visible version `2606210407`, Bilibili card tabs `综合热门 / 每周必看 / 入站必刷 / 排行榜 / 全站音乐榜`, AI news title translation, model-name preservation, Korean header/subtype localization, and AcFun subtype menu/drag behavior.
- Codex in-app browser connection failed with `codex/sandbox-state-meta: missing field sandboxPolicy`; fallback Playwright automation on production verified:
  - `/category/general` header shows category nav, language, refresh countdown, theme, and settings controls.
  - `/setting` keeps refresh controls visible, freezes the countdown, and preserves `dailyhot:autoRefreshPause`.
  - Returning to `/category/general` resumes from the frozen remaining time instead of resetting to the full interval.
  - Category-page card drag changes visible order and persists the scoped order to `mainData.newsArr`.
  - At `1530x820`, the AcFun right-edge subtype menu stayed inside the viewport (`right=1505.875 <= 1530`) and subtype interaction emitted the `dailyhot:subtype-interaction` lock/unlock sequence instead of triggering card drag.
