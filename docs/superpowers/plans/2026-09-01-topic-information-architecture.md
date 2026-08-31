# 专题一级信息架构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把羊毛与游戏折扣升级为一级专题入口，建立共享专题切换栏，并将游戏折扣从羊毛分类/专题中彻底解绑，同时压缩专题页首屏占高。

**Architecture:** 新增 `src/config/topics.js` 作为专题注册表，Header 与两个专题页面共享。保持既有 Vue Router 路由不变，分类解绑只修改 Source 分类元数据和羊毛专题数据过滤；页面筛选继续复用现有 AJAX refresh generation。

**Tech Stack:** Vue 3、Pinia、Vue Router、Naive UI、现有 i18n/SEO route-shell 生成器。

---

### Task 1: 建立共享专题注册表与切换组件

**Files:**
- Create: `src/config/topics.js`
- Create: `src/components/TopicSwitcher.vue`
- Modify: `src/views/WoolTopic.vue`
- Modify: `src/views/GameDealsTopic.vue`

- [ ] 创建只包含已上线 `wool`、`game-deals` 的 registry，包含 routeName、localeRouteName 和五语言 label。
- [ ] TopicSwitcher 根据当前 locale 生成对应路径，并对当前专题提供 `aria-current="page"`。
- [ ] 两个专题都在首屏顶部复用组件，移动端使用内部横向滚动。
- [ ] 运行 `npm run build`，确认 Vue 编译通过。
- [ ] 提交 `新增共享专题切换入口`。
### Task 2: Header 增加一级专题入口

**Files:**
- Modify: `src/components/Header.vue`
- Reuse: `src/config/topics.js`

- [ ] 桌面端在分类导航之外增加“专题”入口，点击显示羊毛/游戏折扣下拉，不把专题混成普通分类按钮。
- [ ] 移动端菜单增加“专题”分组与两个专题入口。
- [ ] 专题页也允许全局手动/自动 AJAX 刷新；补齐 `game-deals-topic(-locale)` 的刷新白名单。
- [ ] 切换语言时保持当前专题路由语义。
- [ ] 运行 build 与 i18n audit。
- [ ] 提交 `增加一级专题导航入口`。

### Task 3: 羊毛与游戏折扣正式解绑

**Files:**
- Modify: `src/store/index.js`
- Modify: `src/views/WoolTopic.vue`
- Modify: `src/config/site-metadata.mjs`
- Modify: `src/utils/seo.js`（仅在现有生成逻辑需要同步时）

- [ ] Steam、Epic、小黑盒、GG.deals、GOG 的 `categoryIds` 改为仅 `games`。
- [ ] IT之家喜加一 Source 归 `games`，避免整个游戏优惠源进入羊毛分类。
- [ ] 羊毛专题前端对旧/缓存 API 数据加防线，过滤游戏 Source 与 game intent。
- [ ] 羊毛五语言 SEO 删除 Steam/Epic/史低等游戏搜索意图；游戏专题 SEO 保持独立。
- [ ] 验证 `/category/wool` 不再出现游戏折扣卡，`/category/games` 仍完整。
- [ ] 提交 `拆分羊毛与游戏折扣内容边界`。
### Task 4: 压缩专题工作台首屏

**Files:**
- Modify: `src/views/WoolTopic.vue`
- Modify: `src/views/GameDealsTopic.vue`
- Modify: `src/components/TopicSwitcher.vue`

- [ ] 将游戏专题大 Hero 合并为 Topic Switcher + 标题/状态 + 现有工具栏，不再保留独立大块统计卡。
- [ ] 羊毛专题沿用同一节奏，搜索、数量、刷新与筛选尽量在两行内完成。
- [ ] 1440px 目标：首屏明显露出更多列表；390px 控件只在组件内部横滑，不造成 body 横向溢出。
- [ ] 保留 focus-visible、语义化 label 和键盘操作。
- [ ] 提交 `优化专题工作台紧凑布局`。

### Task 5: 全量质量门与生产验收

**Files:**
- Verify only

- [ ] `npm run audit:i18n`：PASS。
- [ ] `npm run build`：PASS，并确认 `/topic/wool` 与 `/topic/game-deals` 五语言 route shells 仍生成。
- [ ] `git diff --check`：PASS。
- [ ] 1440px / 390px 验证 Header 一级专题入口、专题切换、筛选、刷新、分类边界、无横向溢出、无 pageerror。
- [ ] 网络面板确认筛选/刷新 Document 请求增量为 0。
- [ ] push 分支/主线后等待 Vercel Production，再对公网重复关键路径验收。
