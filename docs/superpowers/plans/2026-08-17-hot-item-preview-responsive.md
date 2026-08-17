# Hot Item Preview Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 DailyHot 首页热点悬浮预览按“有摘要”和“纯媒体”两类信息状态自动选择最合适的图片尺寸与排版，既能看清封面又不制造空白或重复信息。

**Architecture:** 保留 `HotList.vue` 现有 Teleport Preview 架构，在 portrait / square / landscape 媒体预设中同时维护 detail 与 media-only 两套展示尺寸。定位函数消费当前状态的最终宽高；有摘要走图文/纯文本布局，无摘要有图走零内边距媒体卡并把热度覆盖到图片上，无摘要无图不创建 Preview。

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

### Task 3: 完善状态驱动的媒体布局

**Files:**
- Modify: `src/components/HotList.vue`

- [ ] **Step 1: 为三类图片增加 detail / media-only 双尺寸**

`portrait` 使用 detail 96×128 / media-only 168×224；`square` 使用 112×112 / 200×200；`landscape` 使用 148×96 / 240×144。定位宽高必须从当前状态使用的实际媒体槽计算。

- [ ] **Step 2: 将无摘要模式改为零内边距媒体卡**

无摘要且有图时，Preview 外层 `padding: 0`，图片填满卡片；有热度时使用绝对定位的左下角 Overlay 胶囊，不增加卡片高度；无热度时只显示图片。

- [ ] **Step 3: 明确无摘要无图片不显示**

保持 `hasPreviewContent()` 只把摘要或可用图片视为增量内容，确保“只有热度”不会创建 Preview。图片失败且没有摘要时继续直接关闭。

### Task 4: 视觉和回归验证

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
