<div align="center">
<img alt="logo" height="120" src="./public/favicon.png" width="120"/>
<h2>DailyHot 长期维护二次开发版 · 吾爱热榜</h2>
<p>汇聚全网热点，热门尽览无余。</p>
<p>在线示例：<a href="https://hot.wuaishare.cn/">吾爱热榜</a></p>
<img src="./screenshots/main.webp" style="border-radius: 16px" />
<img src="./screenshots/main2.webp" style="border-radius: 16px" />
</div>

## 项目说明与致谢

本项目最初基于 [imsyy/DailyHot](https://github.com/imsyy/DailyHot) 开发，保留原项目完整 Git 历史并继续遵循 MIT License。感谢原作者 **imsyy** 创建并开源 DailyHot。

截至 **2026-08-18**，原项目最近一次提交时间为 **2024-11-05**。本仓库现作为由 [吾爱分享网](https://www.wuaishare.cn/) 长期维护的二次开发版本独立演进，主开发分支为 **`main`**。由于已经加入大量数据源、AI 榜单、多语言、SEO、交互、可靠性与站点化能力，本版本不再承诺与原项目保持功能和配置完全兼容。

> GitHub 上仍保留 Fork 关系，用于清晰展示项目来源与尊重原作者；“独立维护”指本仓库拥有独立的开发路线、Issues、发布与部署流程，并不抹去上游来源。

## 反馈与贡献

- **源码 Bug、部署问题、兼容性问题、功能开发建议**：请使用 [GitHub Issues](https://github.com/wuaishare/DailyHot/issues)。
- **吾爱热榜线上站点的内容、数据源、产品体验与用户建议**：请使用 [吾爱热榜反馈中心](https://feedback.wuaishare.cn/)。
- 其他 Fork/部署默认**不会**连接吾爱热榜反馈中心；反馈能力由环境变量配置，可关闭、接入自己的 Quackback、GitHub Issues 或其他反馈页面。
- 提交公开 Issue 前请移除 Token、Cookie、密码、API Key 等敏感信息。

## 功能亮点

- 榜单可拖拽排序、显示开关、分类分配
- 分类管理与分类导航筛选
- 自动刷新与倒计时控制（支持暂停/继续）
- 设置导入导出，方便备份迁移
- 备用 API 自动回退，失败时自动切换并记住
- 多语言界面与动态内容翻译增强，当前内置 `简体中文 / English / 繁體中文 / 日本語 / 한국어`
- 多语言 SEO：支持 canonical、hreflang、语言前缀路由、分类页与榜单页静态路径
- 主题切换、紧凑模式、列表字体大小与跳转方式
- 热榜源有封面图数据且无防盗链时会自动显示新闻封面图（首页鼠标悬浮显示、列表页直接显示）
- 设置页面、列表页面布局优化
- 已同步对接 DailyHotApi 中的所有热榜接口

## 后续 AI 榜单方向

- 已在 `DailyHotApi` 的 README 中增补「AI 信息源扩展规划（2026-06）」并同步第一阶段接入状态。
- 当前 `AI` 一级分类已纳入前端来源清单的第一阶段来源包括：
  - Artificial Analysis
  - LMArena
  - DesignArena
  - AICPB 榜单
  - LLM Stats
  - Skills Rank
  - OpenRouter
  - ClawHub
  - OpenAI
  - OpenAI Research
  - Anthropic
  - DeepMind
  - Meta AI
  - Hugging Face 博客 / 模型 / 热门论文
  - Papers with Code
  - Mistral
  - Cohere
  - Product Hunt
  - Hacker News
  - 新浪 AI 热榜
- 当前仍在待攻坚来源：
  - Perplexity Blog
  - xAI News
  - Reddit 相关 AI 社区

- 说明：
  - `OpenRouter` 当前已切到公开前台榜单接口，支持模型周榜、厂商份额、应用榜、性能榜等多个官方子榜。
  - `ClawHub` 当前以前端只显示一个一级卡片，`Skills / Plugins` 作为其子分类组。
  - `ClawHub Plugins` 的 `Official only` / 多数官方分类接口当前在服务端直连场景下仍不稳定，因此前端只展示已验证可用的子类；后端预留已保留，后面官方稳定后可直接放开。

## 下一波高价值来源

- `Google AI / Google Developers AI`
  - 价值：Gemini、Vertex AI、A2A / Agent 生态、开发者能力更新快，适合补官方工程动态。
- `Microsoft AI / Azure AI / Microsoft Research`
  - 价值：Copilot、Phi、企业落地、研究与产品双线并行，实用性强。
- `NVIDIA Technical Blog / Research`
  - 价值：推理基础设施、GPU、TensorRT-LLM、NIM、Agent infra，偏工程实战。
- `Qwen / ModelScope`
  - 价值：中文 AI 圈一手模型、Agent、开源生态信息源。
- `LangChain / LangGraph Changelog`
  - 价值：Agent 应用层工具链更新频繁，适合面向实战用户。
- `vLLM / Ollama / Open WebUI`
  - 价值：开源推理与本地部署生态的高频必看源，适合补“能直接用”的 AI 工程内容。


## 部署

```bash
// 安装依赖
pnpm install

// 开发
pnpm dev

// 打包
pnpm build
// 构建时会预渲染 首页 / 榜单页，并生成 sitemap.xml 与 robots.txt
```

## 多语言与 SEO 路径

- 默认语言 `zh-CN` 使用根路径，如 `/`、`/category/ai`、`/rank/openrouter-rankings/models-week`
- 非默认语言使用语言前缀：
  - `/en/`
  - `/zh-tw/`
  - `/ja/`
  - `/ko/`
- 主要 SEO 路径：
  - 首页：`/:lang?/`
  - 分类页：`/:lang?/category/:categorySlug`
  - 榜单页：`/:lang?/rank/:sourceSlug/:subtypeSlug?`
- 旧版 `/list?type=xxx&subtype=yyy` 仍可访问，但会自动跳转到新的 SEO 友好路径。

## 环境变量

- `VITE_GLOBAL_API`：热榜 API 地址。
- `VITE_GLOBAL_API2`：备用热榜 API 地址（可选，主 API 失败会自动切换并记住）。
- `VITE_SITE_URL`：站点线上域名（用于生成 `sitemap.xml`/`robots.txt` 与 canonical），注意用完整域名（含 'https://'），不要带末尾 '/'。
- `VITE_ICP`：ICP 备案号（可选）。
- `VITE_DIR`：站点部署路径（如 `/` 或子目录路径）。
- `VITE_BUILD_NUMBER`：构建号覆盖值（可选；默认使用最近一次前端代码提交时间，用于 `v1.4.4 (构建号)` 展示与缓存刷新）。
- `VITE_CLARITY_PROJECT_ID`：Microsoft Clarity 项目 ID（可选；配合站点统计启用行为回放与点击热图）。
- `VITE_FEEDBACK_PROVIDER`：反馈入口提供方，可选 `off / quackback / github / url`；公开仓库默认 `off`。
- `VITE_FEEDBACK_URL`：反馈目标地址。Quackback 填实例根地址，GitHub 可填写仓库 Issues 地址，`url` 可填写其他 HTTPS 反馈页面。
- `VITE_FEEDBACK_PRODUCT_NAME`：发送到 Quackback 的产品名称（可选，默认 `DailyHot`）。
- `VITE_FEEDBACK_PRODUCT_KEY`：发送到 Quackback 的稳定产品标识（可选，默认 `dailyhot`）。
- `PRERENDER`：是否开启预渲染（默认关闭；本地需要预渲染时设置 `PRERENDER=true pnpm build`，Vercel 等 CI 若缺少 chromium 依赖请保持默认）。

例如接入自己的 Quackback：

```bash
VITE_FEEDBACK_PROVIDER="quackback"
VITE_FEEDBACK_URL="https://feedback.example.com"
VITE_FEEDBACK_PRODUCT_NAME="My DailyHot"
VITE_FEEDBACK_PRODUCT_KEY="dailyhot"
```

不配置这些变量时，反馈按钮与 Footer 反馈入口都不会显示。任何 Quackback 管理 API Key、MCP Token、OAuth Secret 或数据库凭据都不应放进前端环境变量。

## 缓存版本

展示版本来自 `package.json`，当前格式为 `v1.4.8 (YYMMDDHHMM)`；括号内版本号默认取最近一次前端代码提交时间，并统一按北京时间（Asia/Shanghai）格式化，例如 `2606102007`。这里的“代码提交”只统计 `src/`、`public/`、`api/`、`index.html`、`package.json`、`vercel.json`、`vite.config.js` 以及构建/SEO/部署相关脚本等实际影响站点产物的路径，不会因为单纯修改 `README` 说明文字而改变页脚版本。若本地或 CI 无法读取 Git 提交时间，则退回到构建当下的北京时间 `YYMMDDHHMM`，避免出现 `00.0000.000000`、UTC 前一天日期或时间戳样式的难读版本号。

## Vercel 部署

现已支持 Vercel 部署，无需自建前端服务器。长期维护主分支为 **`main`**；新部署建议将 Vercel Production Branch / Branch Tracking 指向 `main`。

> 请注意，需要按自己的部署修改 API、站点域名和可选反馈环境变量。公开仓库不会默认把用户反馈发送到吾爱热榜。

吾爱热榜线上实例使用 Quackback 作为用户反馈中心；其他部署者可以选择自己的 Quackback、GitHub Issues、任意 HTTPS 反馈页面，或者完全关闭该能力。

![Powered by Vercel](./public/ico/powered-by-vercel.svg)
