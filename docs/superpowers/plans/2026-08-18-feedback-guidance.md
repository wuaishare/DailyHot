# Feedback Guidance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a generic, safe Quackback Widget feedback intro and use it in 吾爱热榜, while adding a product-neutral Portal welcome card and three truthful starter topics.

**Architecture:** Quackback's published widget SDK accepts an optional `feedbackIntro` object, normalizes it, and sends it to the iframe after `quackback:ready`. The iframe validates the payload again, stores it as local UI state, and renders a compact text-only intro above the native feedback form. DailyHot generates the intro from its existing i18n strings and `VITE_FEEDBACK_PRODUCT_NAME`; production content seeding is performed inside bt4 PostgreSQL without exposing credentials to either public repository.

**Tech Stack:** TypeScript, React, Quackback widget SDK, postMessage, Bun/Vitest, Vue 3, Vite, Vercel, PostgreSQL 18, Docker.

---

### Task 1: Quackback SDK accepts and safely forwards `feedbackIntro`

**Repository:** `/Users/jingchen/Github/quackback-v0132`

**Files:**
- Modify: `packages/widget/src/types.ts`
- Create: `packages/widget/src/core/feedback-intro.ts`
- Modify: `packages/widget/src/core/sdk.ts`
- Modify: `packages/widget/__tests__/sdk.test.ts`
- Create: `packages/widget/__tests__/feedback-intro.test.ts`

- [ ] **Step 1: Write failing normalizer tests**

Create tests asserting:

```ts
normalizeFeedbackIntro({
  title: '  Help us improve  ',
  description: '  Tell us what matters  ',
  items: [
    { label: 'Feature', description: 'New capabilities' },
    { label: '', description: 'drop me' },
  ],
})
```

returns trimmed text and drops the empty-label item; a blank title returns `null`; title/description/item values are truncated to 120/240/60/160 characters; more than four items are truncated to four.

- [ ] **Step 2: Run the normalizer test and confirm it fails**

Run:

```bash
bun test packages/widget/__tests__/feedback-intro.test.ts
```

Expected: FAIL because `normalizeFeedbackIntro` does not exist.

- [ ] **Step 3: Implement the public types and normalizer**

Add to `packages/widget/src/types.ts`:

```ts
export interface FeedbackIntroItem {
  label: string
  description?: string
}

export interface FeedbackIntro {
  title: string
  description?: string
  items?: FeedbackIntroItem[]
}
```

and add `feedbackIntro?: FeedbackIntro` to `InitOptions`.

Create `packages/widget/src/core/feedback-intro.ts` with constants and a pure `normalizeFeedbackIntro(input: unknown): FeedbackIntro | null` that implements the limits from the design and never interprets HTML.

- [ ] **Step 4: Make the normalizer tests pass**

Run:

```bash
bun test packages/widget/__tests__/feedback-intro.test.ts
```

Expected: PASS.

- [ ] **Step 5: Add failing SDK forwarding test**

Extend `packages/widget/__tests__/sdk.test.ts` so an init with:

```ts
feedbackIntro: {
  title: 'Help us improve',
  items: [{ label: 'Bug', description: 'Report a problem' }],
}
```

followed by `fireReady()` must call iframe `postMessage` with:

```ts
{
  type: 'quackback:feedback-intro',
  data: {
    title: 'Help us improve',
    items: [{ label: 'Bug', description: 'Report a problem' }],
  },
}
```

and a blank title must not send the message.

- [ ] **Step 6: Forward normalized intro on iframe ready**

In `packages/widget/src/core/sdk.ts`, normalize before mutating the active config and send `quackback:feedback-intro` after locale/identity initialization when the iframe emits `quackback:ready`.

- [ ] **Step 7: Run SDK tests**

Run:

```bash
bun test packages/widget/__tests__/feedback-intro.test.ts packages/widget/__tests__/sdk.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit SDK protocol**

```bash
git add packages/widget/src/types.ts packages/widget/src/core/feedback-intro.ts packages/widget/src/core/sdk.ts packages/widget/__tests__/feedback-intro.test.ts packages/widget/__tests__/sdk.test.ts
git commit -m "feat(widget): add feedback intro protocol"
```

### Task 2: Quackback iframe renders the intro above the native form

**Repository:** `/Users/jingchen/Github/quackback-v0132`

**Files:**
- Modify: `apps/web/src/lib/shared/widget/types.ts`
- Create: `apps/web/src/components/widget/feedback-intro.tsx`
- Create: `apps/web/src/components/widget/__tests__/feedback-intro.test.tsx`
- Modify: `apps/web/src/components/widget/widget-home-animated.tsx`
- Modify: `apps/web/src/routes/widget/index.tsx`

- [ ] **Step 1: Add failing component tests**

Test that `<FeedbackIntro />` renders title, description and item labels/descriptions as text; returns `null` for blank title; limits items to four; and a string such as `<img src=x onerror=alert(1)>` appears as literal text without creating an `img` node.

- [ ] **Step 2: Run the component test and confirm it fails**

```bash
bun test apps/web/src/components/widget/__tests__/feedback-intro.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement iframe-side type and validator**

Add `FeedbackIntro` / `FeedbackIntroItem` to `apps/web/src/lib/shared/widget/types.ts`, add a `quackback:feedback-intro` inbound message type, and create a small iframe-side normalizer in `feedback-intro.tsx` using the same hard limits as the SDK.

Render the intro as semantic text only:

```tsx
<section aria-label={intro.title} className="px-3 pt-3 pb-1.5">
  <h2 className="text-sm font-semibold">{intro.title}</h2>
  {intro.description && <p className="mt-1 text-xs text-muted-foreground">{intro.description}</p>}
  <div className="mt-2 space-y-1.5">...</div>
</section>
```

Items are informational rows, not buttons.

- [ ] **Step 4: Pass `feedbackIntro` into `WidgetHomeAnimated`**

Extend `WidgetHomeProps` with `feedbackIntro?: FeedbackIntro | null` and render `<FeedbackIntroView intro={feedbackIntro} />` immediately above the existing form card.

- [ ] **Step 5: Receive the SDK postMessage**

In `apps/web/src/routes/widget/index.tsx`, add `feedbackIntro` state. In the parent message listener, accept `quackback:feedback-intro`, normalize it, update state, and pass it to `<WidgetHome />`. Preserve all existing `quackback:open` behavior.

- [ ] **Step 6: Run focused iframe tests**

```bash
bun test apps/web/src/components/widget/__tests__/feedback-intro.test.tsx packages/widget/__tests__/feedback-intro.test.ts packages/widget/__tests__/sdk.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run Quackback typecheck/lint for changed surfaces**

```bash
bun run typecheck
bun run lint
```

Expected: exit 0.

- [ ] **Step 8: Commit iframe UI**

```bash
git add apps/web/src/lib/shared/widget/types.ts apps/web/src/components/widget/feedback-intro.tsx apps/web/src/components/widget/__tests__/feedback-intro.test.tsx apps/web/src/components/widget/widget-home-animated.tsx apps/web/src/routes/widget/index.tsx
git commit -m "feat(widget): render configurable feedback intro"
```

### Task 3: DailyHot sends product-aware localized feedback guidance

**Repository:** `/Users/jingchen/Github/DailyHot`

**Files:**
- Modify: `src/components/FeedbackWidget.vue`
- Modify: `src/i18n/messages.js`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `scripts/audit-feedback-config.mjs`

- [ ] **Step 1: Update i18n copy to product placeholders**

Change each `feedback.menuTitle` from hard-coded 吾爱热榜 wording to a product placeholder supported by vue-i18n, for example Simplified Chinese:

```js
menuTitle: "帮助 {productName} 变得更好",
menuDesc: "提交功能建议、问题反馈或体验优化，你的每一条反馈都会帮助我们决定接下来优先改进什么。",
```

Keep feature/bug/ux labels and descriptions; update English, Traditional Chinese, Japanese and Korean equivalents consistently.

- [ ] **Step 2: Send `feedbackIntro` during Quackback init**

In `FeedbackWidget.vue`, build:

```js
const buildFeedbackIntro = () => ({
  title: t("feedback.menuTitle", { productName: feedbackConfig.productName }),
  description: t("feedback.menuDesc"),
  items: [
    { label: t("feedback.feature"), description: t("feedback.featureDesc") },
    { label: t("feedback.bug"), description: t("feedback.bugDesc") },
    { label: t("feedback.ux"), description: t("feedback.uxDesc") },
  ],
});
```

and include `feedbackIntro: buildFeedbackIntro()` in the existing `Quackback("init", ...)` call. No new secret or hard-coded instance URL is introduced.

- [ ] **Step 3: Bump DailyHot to `1.4.9`**

Update `package.json` and root entries in `package-lock.json` from `1.4.8` to `1.4.9`.

- [ ] **Step 4: Run DailyHot safety/build checks**

```bash
npm run audit:feedback
npm run build
rg -n "feedback\.wuaishare\.cn|API_KEY|SECRET_KEY|MCP_TOKEN|DATABASE_URL" src package.json .env.example
```

Expected: audit/build pass; runtime source contains no fixed Quackback production host or management secret.

- [ ] **Step 5: Commit DailyHot integration**

```bash
git add src/components/FeedbackWidget.vue src/i18n/messages.js package.json package-lock.json
git commit -m "feat: add guided feedback intro"
```

### Task 4: Build and deploy the custom Quackback image safely

**Repositories:** local Quackback fork + bt4 deployment

- [ ] **Step 1: Push the maintained fork branch**

```bash
git push -u origin wuaishare/widget-feedback-intro
```

Verify the pushed branch is based on `v0.13.2` and contains only the intro feature commits.

- [ ] **Step 2: Capture production rollback evidence**

On bt4 record:

```bash
docker inspect quackback-app --format '{{.Config.Image}} {{.Image}}'
curl -fsS http://127.0.0.1:3220/api/health
```

and create a fresh logical backup:

```bash
/www/server/pgsql/bin/pg_dump -h 127.0.0.1 -p 5432 -U postgres -Fc -d quackback -f /www/backup/quackback/pre-feedback-intro-<timestamp>.dump
```

Validate it with `pg_restore -l`.

- [ ] **Step 3: Build a local production image from the fork**

Clone/pull `wuaishare/quackback` on bt4, checkout `wuaishare/widget-feedback-intro`, and build with the repository's production Dockerfile using tag:

```text
quackback-wuaishare:0.13.2-intro.1
```

- [ ] **Step 4: Replace only the app container**

Stop/rename the current `quackback-app` as a rollback container, then start the custom image with the exact same network, fixed IP `172.29.77.10`, port `127.0.0.1:3220`, env file, PostgreSQL URL, Redis URL and MinIO settings currently used by production.

- [ ] **Step 5: Verify deployment health before content changes**

```bash
curl -fsS http://127.0.0.1:3220/api/health
curl -fsS https://feedback.wuaishare.cn/api/health
```

Expected: both return `{"status":"ok"}` and container logs contain no migration/runtime failure.

### Task 5: Configure Portal welcome and seed the three boards

**Production data:** bt4 PostgreSQL `quackback`

- [ ] **Step 1: Update Portal Welcome Card transactionally**

Use one PostgreSQL transaction to merge this into `settings.portal_config` while preserving all existing keys:

```json
{
  "welcomeCard": {
    "enabled": true,
    "title": "欢迎来到吾爱产品反馈中心",
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "这里汇总我们各个产品的功能建议、问题反馈和体验改进。你可以提交新想法、为已有建议投票，并关注处理进展。"
            }
          ]
        }
      ]
    }
  }
}
```

Read it back after commit, then restart the Quackback app to invalidate cached settings.

- [ ] **Step 2: Insert starter topics only if absent**

Insert exactly one `published`, `open` post per board, authored by the existing admin principal, with `vote_count=0` and no rows inserted into `votes`. Use title existence + board slug as the idempotency guard.

Titles:

```text
你最希望吾爱热榜下一步增加哪个数据源或能力？
如果你遇到数据错误、加载失败或兼容性问题，请告诉我们具体页面和现象。
吾爱热榜有哪些 UI、交互或布局细节最影响你的使用体验？
```

Each row gets a small plain-text `content` and equivalent TipTap `content_json`, plus `widget_metadata={"source":"starter-topic","product_key":"dailyhot"}`.

- [ ] **Step 3: Verify seeded content**

Run a read-only query joining `posts` and `boards` to confirm exactly three `starter-topic` rows, each on the intended board with `vote_count=0` and `moderation_state='published'`.

### Task 6: Push DailyHot and run production browser acceptance

**Repository:** `/Users/jingchen/Github/DailyHot`

- [ ] **Step 1: Push `main`**

```bash
git push origin main
```

Wait until Vercel records the new commit as `target=production`, `branch=main`, `state=READY`.

- [ ] **Step 2: Verify production artifact/version**

Confirm `https://hot.wuaishare.cn/` serves `v1.4.9` with the new build number and still returns HTTP 200.

- [ ] **Step 3: Run real Chrome interaction acceptance**

Verify:

1. Before clicking feedback, there are zero Quackback SDK requests.
2. The 44×44 feedback action remains in the existing right-side floating group.
3. Clicking opens `https://feedback.wuaishare.cn/widget?...locale=zh-CN`.
4. The Widget visibly contains `帮助吾爱热榜变得更好`.
5. It visibly contains the three labels and descriptions for 功能建议 / 问题反馈 / 体验优化.
6. At least the three starter topics are visible under the relevant board/filter flow.
7. Closing the Widget restores the DailyHot floating action group.
8. Opening `https://feedback.wuaishare.cn/` shows `欢迎来到吾爱产品反馈中心`.

- [ ] **Step 4: Final regression checks**

Run:

```bash
npm run audit:feedback
npm run build
git status --short --branch
```

and in Quackback:

```bash
bun test packages/widget/__tests__/feedback-intro.test.ts packages/widget/__tests__/sdk.test.ts apps/web/src/components/widget/__tests__/feedback-intro.test.tsx
bun run typecheck
bun run lint
git status --short --branch
```

Expected: all checks pass and both source worktrees are clean after their intended commits.
