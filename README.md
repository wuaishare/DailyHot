<div align="center">
<img alt="logo" height="120" src="./public/favicon.png" width="120"/>
<h2>今日热榜</h2>
<p>汇聚全网热点，热门尽览无余。吾爱分享网自用的二次开发版本。by www.wuaishare.cn</p>
<br />
<img src="./screenshots/main.jpg" style="border-radius: 16px" />
</div>


## 示例

> 这里是示例站点

- [今日热榜 - https://hot.wuaishare.cn/](https://hot.wuaishare.cn/)


## 部署

```bash
// 安装依赖
pnpm install

// 开发
pnpm dev

// 打包
pnpm build
```

## 环境变量

- `VITE_SITE_URL`：站点线上域名（用于生成 `sitemap.xml`/`robots.txt` 与 canonical），注意用完整域名（含 'https://'），不要带末尾 '/'。

## Vercel 部署

现已支持 Vercel 一键部署，无需服务器

> 请注意，需要修改环境变量中的 API 地址

![Powered by Vercel](./public/ico/powered-by-vercel.svg)
