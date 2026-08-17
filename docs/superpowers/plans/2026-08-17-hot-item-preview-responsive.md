# Hot Item Preview Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 DailyHot 首页热点悬浮预览在横图、方图、竖图和图片失败场景下都保持紧凑、稳定、可读，并降低 Hover 事件抖动。

**Architecture:** 保留 `HotList.vue` 现有 Teleport Preview 架构，把图片“自然缩放尺寸”改为“基于自然比例选择展示 preset”。定位函数只消费最终展示 preset，从而让视觉尺寸、碰撞检测和失败回退一致。额外加入热度格式化，并去掉重复 mouse/pointer 进入事件。

**Tech Stack:** Vue 3 Composition API、SCSS、Vite、Naive UI

---

### Task 1: 将图片自然尺寸转换为稳定媒体预设

**Files:**
- Modify: `src/components/HotList.vue`

- [x] **Step 1: 用三档 preset 替代 150×150 自然比例缩放**

定义 portrait / square / landscape 三档展示尺寸，并让图片加载阶段只读取自然宽高与纵横比，返回最终媒体槽尺寸、Preview 宽度和 kind。

- [x] **Step 2: 统一 Preview 尺寸计算**

让 `estimatePreviewHeight()` 与 `positionPreview()` 使用 preset 的最终媒体槽尺寸；无图时继续使用纯文本宽度。

- [x] **Step 3: 保持图片错误回退的原 placement**

确认 `handlePreviewCoverError()` 在降级为纯文本后重新定位；没有摘要时关闭 Preview。

### Task 2: 收紧信息密度和 Hover 交互

**Files:**
- Modify: `src/components/HotList.vue`

- [x] **Step 1: 热度数字人类可读化**

纯数字按 `< 1万`、`万`、`亿` 格式化，最多保留一位小数并去掉无意义 `.0`；已有单位或文字的值原样输出。

- [x] **Step 2: 移除重复 mouseenter/mouseleave**

列表项保留 `pointerenter/pointerleave` 与 `focusin/focusout`，避免同一次桌面鼠标进入重复重置 180ms timer。

- [x] **Step 3: 去掉重复标题并拆分内容状态**

Preview 不再显示榜单标题。有摘要时显示摘要 + 热度 + 可选图片；无摘要但有图片时切换为紧凑“纯图片 + 热度”模式，宽度跟随媒体槽收缩；无摘要且无图时不显示。

### Task 3: 视觉和回归验证

**Files:**
- Modify: `src/components/HotList.vue`

- [x] **Step 1: 收敛 Preview 阴影和媒体槽样式**

保持现有设计语言，不新增高噪声装饰；使用更轻的阴影和稳定 media slot。

- [ ] **Step 2: 检查 diff**

运行：

```bash
git diff --check
git diff -- src/components/HotList.vue
```

预期：无 whitespace error，变更仅聚焦 Preview。

- [ ] **Step 3: 生产构建**

运行：

```bash
npm run build
```

预期：Vite build exit 0；允许项目已有 Sass legacy API、Browserslist 和 chunk-size warning。

- [ ] **Step 4: 提交并同步回 live**

使用 GitHub noreply 邮箱提交，在临时 allowed-root worktree 验证后 cherry-pick 回 `/Users/jingchen/Documents/GitHub/DailyHot` 的 `live` 分支，最后删除临时 worktree/branch。
