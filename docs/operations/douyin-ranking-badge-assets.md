# 抖音热榜徽标静态备份

> 快照日期：2026-09-10

DailyHot 为抖音原生热榜徽标保留一份静态灾备，但正常渲染始终优先使用抖音上游 `iconUrl`。只有浏览器确认远程徽标加载失败时，才回退到 DailyHot 自己的静态资产；本地备份也失败时再退化为文字标签。

## 边界

- 商业 Trends API 只传递徽标元数据与原始 `iconUrl`，不承担图片托管或回源流量。
- 灾备资产由 DailyHot/Vercel 静态 CDN 承担，仅在远程资源失败时使用。
- fallback 仅识别抖音官方 `/hotspot_detail_page/` 或 `/ies/douyin/hot_spot/` 资源路径，避免与其他平台相同 `sourceCode` 误匹配。
- 文件目录：`public/ico/ranking-badges/douyin/`。
- 当前备份 code：`1,2,3,4,5,6,7,8,9,10,11,12,13,15,16,17,20,202,203,204,205`。
- `6.gif` 是抖音 App/Lynx 当前的 48×48「直播」动态徽标，其余当前备份为 PNG。

静态 PNG 的当前上游基址为 `https://lf3-static.bytednsdoc.com/obj/eden-cn/vjl_avo_upfbvk/ljhwZthlaukjlkulzlp/hotspot_detail_page/{code}.png`；直播 GIF 当前上游地址为 `https://lf-dy-sourcecdn-tos.bytegecko.com/obj/byte-gurd-source/ies/douyin/hot_spot/fe_lynx_hot_list/resource/images/icon_tag_live.71b8d7f6.gif`。

刷新备份前应先核对上游 label/code 语义，再替换文件；不要仅因 URL 变化就改变 `sourceCode` 语义。