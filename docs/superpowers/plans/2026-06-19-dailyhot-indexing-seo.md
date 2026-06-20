# DailyHot Indexing SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve crawler discovery and webmaster submission for `hot.wuaishare.cn`.

**Architecture:** Keep static SEO generation in the existing Node scripts. Align sitemap and route shell source discovery, add localized home shells and hreflang alternates, then add an optional IndexNow submission script for post-deploy URL notification.

**Tech Stack:** Vue 3, Vite, Node.js build scripts, static HTML route shells, Google Search Console, Bing Webmaster Tools, IndexNow.

---

### Task 1: Webmaster Submission

**Files:**
- No repository file changes.

- [x] Submit `https://hot.wuaishare.cn/sitemap.xml` in Google Search Console.
- [x] Submit `https://hot.wuaishare.cn/sitemap.xml` in Bing Webmaster Tools.
- [x] Record observed submission state in the design document.

### Task 2: Route Shell Coverage

**Files:**
- Modify: `scripts/generate-route-shells.cjs`

- [x] Generate home route shells for every supported locale.
- [x] Use localized `seo.homeTitle`, `seo.homeDescription`, and `seo.homeKeywords`.
- [x] Add WebSite JSON-LD for home routes.
- [x] Extract rank sources only from `defaultNewsArr`.
- [x] Add `hreflang` alternates to generated route shells.

### Task 3: Sitemap Quality

**Files:**
- Modify: `scripts/generate-seo-files.js`

- [x] Add `xhtml:link` alternate entries for every localized URL group.
- [x] Add route-appropriate `changefreq` and `priority` values.
- [x] Keep sitemap host based on `VITE_SITE_URL`.
- [x] Keep noindex utility routes out of the sitemap.

### Task 4: IndexNow

**Files:**
- Create: `public/<indexnow-key>.txt`
- Create: `scripts/submit-indexnow.cjs`
- Modify: `package.json`

- [x] Add a public IndexNow key file at the site root.
- [x] Add a script that fetches the live sitemap, extracts same-host URLs, and submits them to IndexNow.
- [x] Add `submit:indexnow` to `package.json`.
- [x] Run the script after production deployment.

### Task 5: Verification

**Commands and checks:**
- [x] Run `pnpm build`.
- [x] Verify raw HTML for `/`, `/en/`, `/zh-tw/`, `/category/ai`, and `/rank/clawhub/plugins-recommended`.
- [x] Count sitemap URLs and compare with generated static shell count.
- [x] Deploy production.
- [x] Verify production `robots.txt`, `sitemap.xml`, and representative raw HTML.
- [x] Run `pnpm submit:indexnow`.

### Latest Verification

- `VERIFY=2606210310 AUDIT_TIMEOUT_MS=30000 pnpm audit:live` passed `21` checks for production, including localized home shells, route JSON-LD, `hreflang`, sitemap `xhtml:link`, `changefreq`, `priority`, and the IndexNow key file.
- `pnpm submit:indexnow -- --dry-run` found `1545` same-host URLs from the live sitemap and the production key file `https://hot.wuaishare.cn/45f2e0a6f5a34b8290c80c5e9d0f94ad.txt`.
