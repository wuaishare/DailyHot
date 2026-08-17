# 吾爱热榜反馈引导与 Quackback 通用 Intro 设计

## 背景

吾爱热榜从自定义三分类反馈菜单切换到 Quackback 原生 Widget 后，减少了一次点击并统一了反馈体验，但也丢失了原先最有价值的一层“反馈动机与分类教育”。当前 Widget 在没有反馈内容时主要显示输入框、“热门想法”和空状态，首次用户不知道为什么值得反馈、可以反馈什么，也缺少可模仿的已有内容。

## 目标

1. 在不增加额外点击的前提下，在 Quackback Feedback 页输入框上方提供轻量、长期可见的反馈引导。
2. Quackback 本身不硬编码“吾爱热榜”，而提供可选、通用、纯文本的 `feedbackIntro` SDK 能力。
3. DailyHot 通过现有 `VITE_FEEDBACK_PRODUCT_NAME` 与 i18n 生成自己的引导文案，并在初始化 Quackback 时传入。
4. 完整 Portal 使用“吾爱产品反馈中心”的产品中立 Welcome Card，为后续更多产品接入留空间。
5. 三个吾爱热榜 Board 各有一条真实的启动话题，消除冷启动空状态并给用户提供投票/评论/模仿提交的参照。
6. 保持公开仓库安全边界：不新增 API Key、OAuth Secret、数据库凭据或任何管理级 Secret。

## 非目标

- 不恢复旧版“点击反馈 → 三分类菜单 → 再打开 Widget”的两段式交互。
- 不把 Changelog 当作欢迎公告使用。
- 不为了本功能改造 Quackback Admin 的整体信息架构或后台中文化。
- 不让 DailyHot 的公开仓库绑定到固定 Quackback 实例；Quackback Provider 仍由环境变量决定。

## 方案

### 1. Quackback SDK：可选 `feedbackIntro`

扩展 `Quackback("init", options)`：

```ts
interface FeedbackIntroItem {
  label: string
  description?: string
}

interface FeedbackIntro {
  title: string
  description?: string
  items?: FeedbackIntroItem[]
}

interface InitOptions {
  // existing fields...
  feedbackIntro?: FeedbackIntro
}
```

默认不传即完全不显示，不改变现有集成行为。

SDK 在 `quackback:ready` 后通过 `postMessage` 向 iframe 发送已规范化的 `feedbackIntro`。不通过 URL query 承载，避免长 URL、编码复杂度和泄露不必要上下文。

运行时限制：

- `title`: trim 后最多 120 字符；为空则整个 Intro 关闭。
- `description`: 最多 240 字符。
- `items`: 最多 4 项。
- `item.label`: 最多 60 字符；空 label 丢弃。
- `item.description`: 最多 160 字符。
- 所有字段只作为 React 文本节点渲染，不支持 HTML/Markdown。

### 2. Quackback Widget：紧凑引导块

Feedback 页在原生输入框上方渲染 Intro：

- 标题：中等强调，例如“帮助吾爱热榜变得更好”。
- 描述：一行或两行弱化文本，说明反馈用途。
- Items：最多 4 条紧凑说明行，显示 label + description；它们是说明，不是可点击分类按钮。
- Intro 始终显示，包括已有热门反馈时；用户展开表单后仍保留，保证反馈动机不会因内容增长而消失。
- 不改变现有 Board 选择、搜索、提交、投票与空状态逻辑。

### 3. DailyHot：产品化 i18n 与通用配置

DailyHot 不再维护旧菜单 UI，但复用已有多语言反馈文案的价值。`FeedbackWidget.vue` 在 Quackback `init` 时传入：

```js
feedbackIntro: {
  title: t("feedback.menuTitle", { productName: feedbackConfig.productName }),
  description: t("feedback.menuDesc"),
  items: [
    { label: t("feedback.feature"), description: t("feedback.featureDesc") },
    { label: t("feedback.bug"), description: t("feedback.bugDesc") },
    { label: t("feedback.ux"), description: t("feedback.uxDesc") },
  ],
}
```

可见品牌名称由 `VITE_FEEDBACK_PRODUCT_NAME` 注入。公开仓库默认 Provider 仍为 `off`，Fork 用户不会连接吾爱分享的 Quackback。

简体中文生产文案：

- 标题：`帮助吾爱热榜变得更好`
- 描述：`提交功能建议、问题反馈或体验优化，你的每一条反馈都会帮助我们决定接下来优先改进什么。`
- 功能建议：`新功能、数据源和产品能力建议`
- 问题反馈：`Bug、数据错误、兼容性和性能问题`
- 体验优化：`UI、交互、布局和细节优化建议`

英语、繁中、日语、韩语沿用现有对应翻译并补齐新版描述含义。

### 4. Portal Welcome Card

完整 `feedback.wuaishare.cn` Portal 开启 Welcome Card，使用产品中立文案：

**标题**：`欢迎来到吾爱产品反馈中心`

**正文**：`这里汇总我们各个产品的功能建议、问题反馈和体验改进。你可以提交新想法、为已有建议投票，并关注处理进展。`

该内容属于 Portal 品牌与介绍，不塞进 Changelog。

### 5. 三条启动话题

为三个吾爱热榜 Board 各创建一条公开话题：

- 功能建议：`你最希望吾爱热榜下一步增加哪个数据源或能力？`
- 问题反馈：`如果你遇到数据错误、加载失败或兼容性问题，请告诉我们具体页面和现象。`
- 体验优化：`吾爱热榜有哪些 UI、交互或布局细节最影响你的使用体验？`

正文补充一句简短说明，鼓励投票/评论/给出复现信息，但不伪造用户反馈或投票数。

## 部署与版本策略

- Quackback：在 `wuaishare/quackback` Fork 上从 `v0.13.2` 建立维护分支，构建 `0.13.2-wuaishare.1` 自托管镜像；旧 `quackback-app-v0.9.5` 与升级前数据库备份继续保留，当前 `0.13.2` 容器配置也先保留快照。
- DailyHot：作为用户可见交互能力升级一个 patch 版本，并通过 `main` 自动部署到 Vercel Production。
- Portal Welcome Card 与启动话题在 Quackback 新镜像健康后写入，完成后刷新设置缓存/重启应用。

## 安全边界

- `feedbackIntro` 是公开 UI 文案，不是 Secret。
- SDK 对输入做长度与条数限制；iframe 端再次规范化，防止绕过 SDK 的恶意 `postMessage`。
- 只渲染文本节点，不支持任意 HTML/Markdown。
- iframe 仅接受来自 `window.parent` 的消息；不新增跨域管理 API。
- DailyHot 不持有 Quackback 管理 API Key、MCP Token 或数据库凭据。
- 生产数据库/配置写入只在 bt4 内部执行，不把数据层凭据加入 Git/Vercel。

## 验收标准

1. 未传 `feedbackIntro` 的 Quackback 集成无视觉/行为变化。
2. 传入 Intro 后，Feedback 页输入框上方始终出现标题、描述和三条说明。
3. 超长/空值/多余 items 被稳定裁剪或忽略，不能注入 HTML。
4. 吾爱热榜首屏仍不加载 Quackback SDK；点击反馈后才懒加载。
5. 生产 Widget 显示简体中文“帮助吾爱热榜变得更好”及三类说明。
6. 完整 Portal 显示“欢迎来到吾爱产品反馈中心” Welcome Card。
7. 三个 Board 各出现一条启动话题，不再全部为空。
8. Quackback `/api/health`、吾爱热榜首页和反馈入口均返回正常；真实 Chrome 完成打开 → 查看 Intro → 关闭 → 按钮恢复闭环。
9. DailyHot 与 Quackback 仓库均无新增 Secret，工作区最终干净。
