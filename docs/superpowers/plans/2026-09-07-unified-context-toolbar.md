# DailyHot Unified Context Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 把已经存在但分散在 Header、Home、List 与 Topic 页中的分类/专题/搜索/显示偏好能力收敛成一个共享上下文工具栏，并让分类页、单榜页、专题页统一使用可分享的 URL 搜索状态。

**Architecture:** 新建 route-aware `ContextToolbar.vue` 作为 App 级共享 shell。它只组织上下文导航、`?q=` 搜索与低频显示偏好；现有专题页的领域筛选/排序继续留在页面内部，行情专用排序继续留在 List。分类树仍由现有 `categoryTree.js` 和 store 驱动，单榜 source/variant 导航直接使用现有 locale / subtype 工具，不增加第二套状态真源。

> **2026-09-07 V2 correction (supersedes conflicting Task 1 wording below):** Header exclusively owns level-1 categories. The shared Context Toolbar starts at level 2, so it is hidden on Home and must never repeat the Header's top-level categories. On a level-1 category page it shows only that category's available level-2 children; entering level 2 keeps sibling level-2 switching and reveals level 3 only when real children exist. No-child categories must not fall back to top-level siblings. Low-frequency local display preferences (compact layout, covers, font size) belong in the Context Toolbar popover and are distinct from the global Hotboard Manager gear. Desktop toolbar text should remain normal UI size (roughly 13–14px), not micro-label 10–11px. View/Filter/Sort controls are added only when they have real behavior; no no-op placeholders.

**Tech Stack:** Vue 3 / Vue Router / Pinia / Naive UI / existing categoryTree + sourceSubtypes + locale helpers

---

### Task 1: Shared ContextToolbar shell

**Files:**
- Create: `src/components/ContextToolbar.vue`
- Modify: `src/App.vue`

- [x] **Step 1:** 新组件识别 home/category/list/topic 四类 route，设置 context label 与 capability。
- [x] **Step 2:** Header 独占一级分类；Home 不渲染 ContextToolbar；一级分类页只显示真实二级，进入二级后保留同级二级切换，并仅在存在真实子级时按需展开三级；禁止无子级时 fallback 到一级兄弟分类。
- [x] **Step 3:** 单榜上下文显示所属分类、当前 source 与同分类 source 切换；有 subtype 时显示 variant 切换。
- [x] **Step 4:** 专题上下文嵌入现有 `TopicSwitcher`，删除 App 中独立的 persistent switcher 外壳。
- [x] **Step 5:** 右侧加入 scoped search，统一写入 `route.query.q`，保留其他 query；Esc 清空。
- [x] **Step 6:** Display Preferences popover 只开放已有且持久化的 `compactMode` / `showImages` / `listFontSize`，并与 Header 右上角全局 Hotboard Manager 齿轮保持层级分离；不制造空的 View/Sort/Filter 控件。

### Deferred capability contract

- **Timeline / cross-source feed is still part of the product direction**, but it requires a shared cross-source aggregation layer before UI admission. Current Home cards each own a lazy local `hotListData`; V2 must not simulate Timeline by mounting hidden cards or issuing browser-side N+1 source requests.
- View / Filter / Sort enter the shared toolbar only when the current route has a real implementation and state contract. Existing market-specific sort/direction controls remain where they already work until a shared capability model exists.
- Additional display fields such as time / author / summary remain a follow-up after field-coverage and presentation review; do not add switches that only affect a subset unpredictably.

### Task 2: Category page consumes shared context

**Files:**
- Modify: `src/views/Home.vue`

- [x] **Step 1:** 删除 Home 内重复的 category breadcrumb / children 导航。
- [x] **Step 2:** 读取 `route.query.q`，按当前 locale 的 source label、原始 name、category/subtype 过滤卡片。
- [x] **Step 3:** query 改变时保持 drag ordering contract，只过滤当前 scope，不改持久化 order。
- [x] **Step 4:** 空搜索结果使用现有 empty state，不清空用户配置。

### Task 3: Single-rank page consumes shared context

**Files:**
- Modify: `src/views/List.vue`

- [x] **Step 1:** 删除重复的两行 source rail 与通用 `SubtypeBar`；保留行情专用 direction/sort controls。
- [x] **Step 2:** `orderedListItems` 在既有 provider/native sort 后应用 `?q=` 搜索过滤，搜索 title/originalTitle/desc/author/hot。
- [x] **Step 3:** 搜索改变时 page reset 为 1；分页更新 query 时保留 `q` 与其他 query。
- [x] **Step 4:** source/subtype route 切换由 ContextToolbar 建立 canonical `buildRankPath`，List 继续只负责读取 route 并加载数据。
- [x] **Step 5:** 移除已无用途的 source-rail drag/resize 状态、事件与样式。

### Task 4: Verification

**Files:**
- Modify only if verification exposes real regressions.

- [x] **Step 1:** `node --check` 所有修改过的 JS helper/script；Vue 由 Vite compile gate。
- [x] **Step 2:** `npm run audit:i18n`
- [x] **Step 3:** `npm run audit:feedback`
- [x] **Step 4:** `npm run build`，必须生成完整 route shells。
- [x] **Step 5:** 本地 Vite 浏览器 smoke：
  - `/` 不渲染 ContextToolbar，一级分类只留在 Header；
  - `/category/general` 不再泄漏综合/科技/财经等一级兄弟分类；
  - `/category/finance` 只显示真实二级：全部 / 实时快讯 / 市场热度 / 全球股指 / 交易所；
  - `/category/finance-flash` 保留同级二级切换且正确激活实时快讯；不存在真实三级时不生成伪三级；
  - `/category/ai` 只显示 AI 的真实二级；
  - `/rank/baidu/realtime` 提供返回所属分类 + source + variant 切换；
  - `/topic/wool` 继续复用 TopicSwitcher；
  - `?q=` 搜索可刷新恢复，Esc 清空且保留当前上下文；
  - Display Preferences 的 compact/showImages/listFontSize 都是已有真实持久化能力；
  - 1440px / 2048px 桌面宽度无横向溢出、控件错位或异常换行。
- [x] **Step 6:** exact-head build + diff check + staged diff 自审；PR / Vercel Preview / Squash Merge 作为 Return-to-Trunk 操作执行。
- [x] **Additional regression gate:** 抽出 `raceWithDelayedFallback`，增加 `npm run audit:fallback`；覆盖主源先成功、延迟备用接管、双失败，修复旧 `usedApi2` 未定义导致两个 HTTP 200 后外层 Promise 永久 pending 的缺陷。
