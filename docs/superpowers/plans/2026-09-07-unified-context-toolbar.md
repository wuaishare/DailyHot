# DailyHot Unified Context Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 把已经存在但分散在 Header、Home、List 与 Topic 页中的分类/专题/搜索/显示偏好能力收敛成一个共享上下文工具栏，并让分类页、单榜页、专题页统一使用可分享的 URL 搜索状态。

**Architecture:** 新建 route-aware `ContextToolbar.vue` 作为 App 级共享 shell。它只组织上下文导航、`?q=` 搜索与低频显示偏好；现有专题页的领域筛选/排序继续留在页面内部，行情专用排序继续留在 List。分类树仍由现有 `categoryTree.js` 和 store 驱动，单榜 source/variant 导航直接使用现有 locale / subtype 工具，不增加第二套状态真源。

**Tech Stack:** Vue 3 / Vue Router / Pinia / Naive UI / existing categoryTree + sourceSubtypes + locale helpers

---

### Task 1: Shared ContextToolbar shell

**Files:**
- Create: `src/components/ContextToolbar.vue`
- Modify: `src/App.vue`

- [x] **Step 1:** 新组件识别 home/category/list/topic 四类 route，设置 context label 与 capability。
- [x] **Step 2:** 分类上下文显示 ancestor breadcrumb、同级/子级快速切换；home 显示顶级分类。
- [x] **Step 3:** 单榜上下文显示所属分类、当前 source 与同分类 source 切换；有 subtype 时显示 variant 切换。
- [x] **Step 4:** 专题上下文嵌入现有 `TopicSwitcher`，删除 App 中独立的 persistent switcher 外壳。
- [x] **Step 5:** 右侧加入 scoped search，统一写入 `route.query.q`，保留其他 query；Esc 清空。
- [x] **Step 6:** Display Preferences popover 只开放已存在且持久化的 `compactMode` / `showImages`，不制造空的 View/Sort/Filter 控件。

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
  - `/category/ai?q=openai` 只保留匹配榜单且 toolbar 显示分类 context；
  - `/rank/github?q=skills` query 可刷新恢复，skills → ECC 软过滤不重复请求 provider，back 恢复 q；
  - `/topic/wool?q=京东` 复用专题既有 q 语义；
  - display preferences 切 compact/showImages 后本地持久化；
  - back/forward 恢复 context。
- [x] **Step 6:** exact-head build + diff check + staged diff 自审；PR / Vercel Preview / Squash Merge 作为 Return-to-Trunk 操作执行。
- [x] **Additional regression gate:** 抽出 `raceWithDelayedFallback`，增加 `npm run audit:fallback`；覆盖主源先成功、延迟备用接管、双失败，修复旧 `usedApi2` 未定义导致两个 HTTP 200 后外层 Promise 永久 pending 的缺陷。
