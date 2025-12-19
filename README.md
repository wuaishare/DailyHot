<div align="center">
<img alt="logo" height="120" src="./public/favicon.png" width="120"/>
<h2>今日热榜</h2>
<p>汇聚全网热点，热门尽览无余。吾爱分享网二次开发+自用版本。by www.wuaishare.cn</p>
<br />
<img src="./screenshots/main.webp" style="border-radius: 16px" />
<img src="./screenshots/main2.webp" style="border-radius: 16px" />
</div>


## 示例

> 这里是示例站点

- [今日热榜 - https://hot.wuaishare.cn/](https://hot.wuaishare.cn/)

## 功能亮点

- 榜单可拖拽排序、显示开关、分类分配
- 分类管理与分类导航筛选
- 自动刷新与倒计时控制（支持暂停/继续）
- 设置导入导出，方便备份迁移
- 备用 API 自动回退，失败时自动切换并记住
- 主题切换、紧凑模式、列表字体大小与跳转方式
- 热榜源有封面图数据且无防盗链时会自动显示新闻封面图（首页鼠标悬浮显示、列表页直接显示）
- 设置页面、列表页面布局优化


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

## 环境变量

- `VITE_GLOBAL_API`：热榜 API 地址。
- `VITE_GLOBAL_API2`：备用热榜 API 地址（可选，主 API 失败会自动切换并记住）。
- `VITE_SITE_URL`：站点线上域名（用于生成 `sitemap.xml`/`robots.txt` 与 canonical），注意用完整域名（含 'https://'），不要带末尾 '/'。
- `VITE_ICP`：ICP 备案号（可选）。
- `VITE_DIR`：站点部署路径（如 `/` 或子目录路径）。
- `PRERENDER`：是否开启预渲染（默认关闭；本地需要预渲染时设置 `PRERENDER=true pnpm build`，Vercel 等 CI 若缺少 chromium 依赖请保持默认）。

## 缓存版本

如需手动更新缓存版本号，可在 `src/utils/cache.js` 中修改 `CACHE_VERSION`，版本号变更会触发缓存清理并刷新。

## Vercel 部署

现已支持 Vercel 一键部署，无需服务器

> 请注意，需要修改环境变量中的 API 地址

![Powered by Vercel](./public/ico/powered-by-vercel.svg)
