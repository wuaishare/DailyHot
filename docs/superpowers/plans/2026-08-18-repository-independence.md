# DailyHot Repository Independence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the maintained DailyHot downstream to a `main`-based open-source project with clear upstream attribution, GitHub Issues, generic feedback providers, and a zero-downtime handoff path from Vercel `live` to `main`.

**Architecture:** Keep the GitHub fork relationship for provenance while making `main` the repository governance branch. Move feedback destination/provider settings into a pure configuration module with `off`, `quackback`, `github`, and `url` providers; the repository default is disabled, while the hosted 吾爱热榜 production injects Quackback settings through Vercel environment variables. Keep `live` untouched until Vercel is explicitly reconfigured.

**Tech Stack:** Vue 3, Vite, Node.js ESM, Git/GitHub CLI, Vercel, Quackback public widget.

---

### Task 1: Add a testable feedback configuration contract

**Files:**
- Create: `src/config/feedback.mjs`
- Create: `scripts/audit-feedback-config.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create a failing configuration audit**

Create `scripts/audit-feedback-config.mjs` with Node `assert/strict` cases that require:

```js
resolveFeedbackConfig({}).provider === "off";
resolveFeedbackConfig({}).enabled === false;
resolveFeedbackConfig({ VITE_FEEDBACK_PROVIDER: "quackback", VITE_FEEDBACK_URL: "https://feedback.example.com/" }).url === "https://feedback.example.com";
resolveFeedbackConfig({ VITE_FEEDBACK_PROVIDER: "github", VITE_FEEDBACK_URL: "https://github.com/example/repo/issues" }).provider === "github";
resolveFeedbackConfig({ VITE_FEEDBACK_PROVIDER: "url", VITE_FEEDBACK_URL: "javascript:alert(1)" }).enabled === false;
resolveFeedbackConfig({ VITE_FEEDBACK_PROVIDER: "invalid", VITE_FEEDBACK_URL: "https://example.com" }).provider === "off";
```

Run:

```bash
node scripts/audit-feedback-config.mjs
```

Expected: FAIL because `src/config/feedback.mjs` does not exist.

- [ ] **Step 2: Implement `src/config/feedback.mjs`**

Export:

```js
export const FEEDBACK_PROVIDERS = Object.freeze(["off", "quackback", "github", "url"]);
export const resolveFeedbackConfig = (env = {}) => { /* normalize provider/url/product metadata */ };
export const feedbackConfig = resolveFeedbackConfig(import.meta.env || {});
```

Rules:

- unknown/empty provider => `off`;
- `off` => disabled regardless of URL;
- non-off providers require an absolute `http:` or `https:` URL;
- remove trailing slash from normalized URL;
- product name defaults to `DailyHot`;
- product key defaults to `dailyhot`;
- expose `portalUrl` with a trailing slash for link usage.

- [ ] **Step 3: Add the audit script to `package.json`**

Add:

```json
"audit:feedback": "node scripts/audit-feedback-config.mjs"
```

Run:

```bash
npm run audit:feedback
```

Expected: PASS and print a feedback configuration audit success message.

- [ ] **Step 4: Commit**

```bash
git add src/config/feedback.mjs scripts/audit-feedback-config.mjs package.json package-lock.json
git commit -m "feat: make feedback provider configurable"
```

### Task 2: Generalize the runtime feedback action

**Files:**
- Modify: `src/components/FeedbackWidget.vue`
- Modify: `src/components/FloatingActions.vue`
- Modify: `src/components/Footer.vue`

- [ ] **Step 1: Replace hard-coded Quackback URLs in `FeedbackWidget.vue`**

Import `feedbackConfig` and remove literal `https://feedback.wuaishare.cn/` constants.

Behavior:

```js
if (feedbackConfig.provider === "quackback") {
  await ensureWidget();
  window.Quackback?.("metadata", buildMetadata());
  window.Quackback?.("open");
  return;
}
window.open(feedbackConfig.portalUrl, "_blank", "noopener,noreferrer");
```

Quackback SDK URL must be derived from the configured instance:

```js
`${feedbackConfig.url}/api/widget/sdk.js`
```

Quackback metadata must use:

```js
product: feedbackConfig.productName,
product_key: feedbackConfig.productKey,
```

Keep version/build/page/locale/viewport metadata non-secret.

- [ ] **Step 2: Hide feedback action when disabled**

In `FloatingActions.vue`, import `feedbackConfig` and render `FeedbackWidget` only when `feedbackConfig.enabled` is true. Keep back-to-top usable independently. Hide the group only while an embedded Quackback widget is actually open.

- [ ] **Step 3: Make Footer reuse the same configuration**

Remove the hard-coded feedback center URL. Include the Footer feedback link only when `feedbackConfig.enabled` is true, and use `feedbackConfig.portalUrl` for Quackback/GitHub/custom URL providers.

- [ ] **Step 4: Verify no Wuaishare feedback host remains in runtime source**

Run:

```bash
rg -n "feedback\.wuaishare\.cn" src package.json
```

Expected: no matches.

Run:

```bash
npm run audit:feedback
npm run build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/FeedbackWidget.vue src/components/FloatingActions.vue src/components/Footer.vue
git commit -m "refactor: decouple hosted feedback integration"
```

### Task 3: Document open-source configuration and project identity

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add neutral feedback defaults to `.env.example`**

Document:

```env
# Feedback integration: off | quackback | github | url
VITE_FEEDBACK_PROVIDER="off"
VITE_FEEDBACK_URL=""
VITE_FEEDBACK_PRODUCT_NAME="DailyHot"
VITE_FEEDBACK_PRODUCT_KEY="dailyhot"
```

Do not put `feedback.wuaishare.cn` in `.env.example`.

- [ ] **Step 2: Normalize package metadata**

Use standard metadata:

```json
"author": {
  "name": "吾爱分享网",
  "url": "https://www.wuaishare.cn/"
},
"homepage": "https://hot.wuaishare.cn/",
"repository": {
  "type": "git",
  "url": "https://github.com/wuaishare/DailyHot.git"
},
"bugs": {
  "url": "https://github.com/wuaishare/DailyHot/issues"
}
```

Remove the non-standard `github` field.

- [ ] **Step 3: Rewrite README project-status/feedback sections**

README must explicitly state:

- origin: `https://github.com/imsyy/DailyHot`;
- long-term independently maintained downstream edition;
- MIT license/provenance retained;
- hosted demo: `https://hot.wuaishare.cn/`;
- code/deployment bugs and feature requests: GitHub Issues;
- hosted product feedback: `https://feedback.wuaishare.cn/`;
- downstream deployments should configure their own feedback provider;
- `main` is the maintained branch;
- Vercel instructions describe the feedback environment variables without embedding production secrets.

- [ ] **Step 4: Verify metadata and docs**

Run:

```bash
node -e 'const p=require("./package.json"); if(!p.repository?.url || !p.bugs?.url || p.github) process.exit(1)'
rg -n "原始项目|独立维护|GitHub Issues|VITE_FEEDBACK_PROVIDER|反馈中心" README.md
```

Expected: package metadata assertion exits 0 and README contains all governance/configuration topics.

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md package.json package-lock.json
git commit -m "docs: establish independent maintenance workflow"
```

### Task 4: Add GitHub issue forms

**Files:**
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/ISSUE_TEMPLATE/config.yml`

- [ ] **Step 1: Create bug report issue form**

Require problem description, reproduction steps, expected behavior, actual behavior, deployment mode, version/build, browser/OS, and optional screenshots/logs. Include a confirmation that secrets/tokens have been removed.

- [ ] **Step 2: Create feature request issue form**

Require problem/use-case, proposed behavior, alternatives, and expected value/impact.

- [ ] **Step 3: Create issue chooser configuration**

Set `blank_issues_enabled: false` and add a contact link:

```yaml
contact_links:
  - name: 吾爱热榜产品反馈中心
    url: https://feedback.wuaishare.cn/
    about: 反馈 hot.wuaishare.cn 的内容、数据源、体验与产品建议。
```

- [ ] **Step 4: Validate YAML syntax**

Use Ruby/Python YAML if available, otherwise inspect through GitHub after push. At minimum run:

```bash
rg -n "name:|description:|body:|contact_links:" .github/ISSUE_TEMPLATE
```

Expected: both forms and chooser expose the required top-level keys.

- [ ] **Step 5: Commit**

```bash
git add .github/ISSUE_TEMPLATE
git commit -m "chore: add GitHub issue forms"
```

### Task 5: Verify the candidate `main` commit

**Files:**
- No new files.

- [ ] **Step 1: Run feedback audit**

```bash
npm run audit:feedback
```

Expected: PASS.

- [ ] **Step 2: Run full production build**

```bash
npm run build
```

Expected: Vite build and route-shell generation succeed.

- [ ] **Step 3: Scan for forbidden public feedback secrets/hard-coding**

```bash
rg -n "feedback\.wuaishare\.cn|QUACKBACK.*(TOKEN|SECRET|KEY)|DATABASE_URL|MCP.*TOKEN" src .env.example package.json
```

Expected: no Wuaishare feedback host in runtime/config defaults and no secrets. README/GitHub issue contact links are allowed to mention the hosted feedback center.

- [ ] **Step 4: Verify Git state and commit email**

```bash
git status --short
git log -5 --format='%h %ae %ce %s'
```

Expected: clean worktree and all new commits use GitHub noreply author/committer email.

### Task 6: Promote the candidate to `main` without touching production `live`

**Files:**
- Git references only.

- [ ] **Step 1: Re-read remote state before mutation**

```bash
git ls-remote --heads origin live main master
git status --short --branch
```

Expected: `live` still points at the original production baseline unless another actor updated it; if it changed, rebase candidate on the new `live` before continuing.

- [ ] **Step 2: Create the upstream provenance tag**

```bash
git tag -a upstream-imsyy-2024-11-05 8b91ad9d35f7dad3b0c2a0b671001a9de9873115 -m "Upstream imsyy/DailyHot baseline before independent maintenance"
git push origin upstream-imsyy-2024-11-05
```

Expected: tag exists remotely.

- [ ] **Step 3: Push candidate HEAD as `main`**

```bash
git push origin HEAD:refs/heads/main
```

Expected: remote `main` is created at candidate HEAD while `live` remains unchanged.

- [ ] **Step 4: Verify branch ancestry**

```bash
git merge-base --is-ancestor <current-live-sha> HEAD
git ls-remote --heads origin live main
```

Expected: current `live` is an ancestor of `main`, with different heads only because of the intended migration commits.

### Task 7: Switch GitHub governance to `main`

**Files:**
- GitHub repository settings only.

- [ ] **Step 1: Enable Issues**

```bash
gh repo edit wuaishare/DailyHot --enable-issues
```

- [ ] **Step 2: Change default branch**

```bash
gh repo edit wuaishare/DailyHot --default-branch main
```

- [ ] **Step 3: Read settings back**

```bash
gh repo view wuaishare/DailyHot --json defaultBranchRef,hasIssuesEnabled
```

Expected: default branch `main`, Issues enabled.

- [ ] **Step 4: Retire obsolete remote `master` after provenance tag exists**

```bash
git push origin --delete master
```

Do not delete `live`.

- [ ] **Step 5: Verify remote heads/tag**

```bash
git ls-remote --heads --tags origin main live master upstream-imsyy-2024-11-05
```

Expected: `main` and `live` exist, `master` does not, provenance tag exists.

### Task 8: Prepare Vercel production branch handoff

**Files:**
- Vercel project settings only.

- [ ] **Step 1: Discover authenticated Vercel control path**

Check whether `npx vercel whoami` succeeds and whether the linked project can be identified without exposing tokens.

- [ ] **Step 2: Configure production feedback environment if authenticated tooling supports it**

Set Production values only:

```text
VITE_FEEDBACK_PROVIDER=quackback
VITE_FEEDBACK_URL=https://feedback.wuaishare.cn
VITE_FEEDBACK_PRODUCT_NAME=吾爱热榜
VITE_FEEDBACK_PRODUCT_KEY=dailyhot
```

Never commit these hosted-instance values into `.env.example`.

- [ ] **Step 3: Switch Vercel Production Branch from `live` to `main` only after production env is ready**

If no authenticated programmatic control is available, leave `live` untouched and report the exact dashboard steps:

`Vercel Project → Settings → Environments → Production → Branch Tracking → main`

and add the four Production environment variables above before triggering the deployment.

- [ ] **Step 4: Production verification after Vercel switch**

Once switched, verify:

```bash
curl -fsS https://hot.wuaishare.cn/ | grep -E "v1\.4\.7|2608"
```

Then use browser-level verification to confirm feedback button is present, Quackback SDK remains lazy-loaded, and the widget points to `feedback.wuaishare.cn`.

Keep remote `live` until this verification passes.
