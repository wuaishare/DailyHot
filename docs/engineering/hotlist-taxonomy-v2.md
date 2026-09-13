# DailyHot / 吾爱热榜 Taxonomy v2 与国内来源规划

状态：规划基线（2026-09-14）

## 1. 目标

后续扩源不再以 variant 数量为第一目标，而按以下优先级推进：

1. 国内高价值独立来源平台数量；
2. 用户高频娱乐休闲需求覆盖；
3. 已接平台的原生子榜完整度；
4. 海外来源以维护为主，不主动堆数量。

当前前端配置约 147 个 source row，Production Public API 为 78 个独立 source / 288 个 variants。两者不是同一口径。

## 2. 竞品调研结论

本轮重点参考：TopHub、rebang.today、tgmeng.com，并辅以其公开索引/历史页。

- TopHub：最适合做“来源平台发现”。公开索引可确认综合、科技、AI、娱乐、社区、购物、财经、影视、阅读等来源池；阅读包含微信读书、当当、七猫，影视包含豆瓣电影、猫眼。
- rebang.today：最适合参考“平台内部子榜”。例如虎扑直接细分步行街、NBA、游戏、数码、影视、娱乐、国际足球；同时覆盖小红书、爱奇艺、微信读书、游民星空等平台。
- 糖果梦：最适合参考“领域型分类”。其分类长期覆盖新闻、媒体、生活、社区、财经、体育、科技、设计、影音、游戏、健康、电视、教育、AI、期货等；游戏分类当前覆盖二十余个平台。

原则：竞品只用于发现来源与验证用户心智，不能直接复制其分类模型。## 3. 核心模型：分类树与榜单语义必须分离

不要把“来源平台”“内容领域”“榜单类型”“时间周期”混成一个分类字段。

### 3.1 内容分类树（最多三级）

负责回答：**这条榜单主要是什么内容？**

例如：

- 文娱 → 阅读 → 网络小说
- 文娱 → 影音 → 电影
- 体育 → 球类 → 篮球
- 科技 → 开发者 → 开源项目

### 3.2 来源平台（source/provider）

负责回答：**数据来自谁？**

例如：网易云音乐、QQ 音乐、起点中文网、TapTap、小红书、微博。

同一个来源可以拥有多个 variant，同一个来源的不同 variant 可以映射到不同内容分类。

### 3.3 榜单语义（rankingKind）

负责回答：**它按什么逻辑排名？**

建议统一枚举：`hot_search`、`hot_topic`、`popular`、`trending`、`sales`、`box_office`、`playback`、`reading`、`rating`、`new_release`、`free`、`discount`、`flash`、`feed`、`official_release`、`market_quote`、`index`、`schedule`。

### 3.4 时间窗口（period）

负责回答：**榜单覆盖什么时间？**

统一为：`realtime`、`day`、`week`、`month`、`all_time`。今日/本周/本月不再创建分类节点。## 4. Taxonomy v2：一级分类

`全部/综合` 不再是内容分类，而是 UI 聚合视图。建议一级分类固定为 11 个：

1. `hotspot` 热点
2. `news` 新闻
3. `tech` 科技
4. `ai` AI
5. `finance` 财经
6. `entertainment` 文娱
7. `games` 游戏
8. `sports` 体育
9. `life` 生活
10. `community` 社区
11. `deals` 优惠

说明：

- “热点”承接微博、抖音、小红书、百度热搜等跨领域平台信号，不再把它们硬塞进“综合”。
- “文娱”统一承接音乐、影视、阅读、小说、漫画、动漫、综艺、短剧。
- “优惠”替代内部语义过强的“羊毛”；前端仍可把“薅羊毛”保留为专题名。
- “AI”继续保持独立一级分类，因为当前已经形成成熟产品面与二级结构。
- “体育”从社区/综合中独立出来，避免虎扑、直播吧、懂球帝等长期混放。

## 5. 热点 / 新闻三级结构

### 热点 `hotspot`

- 社交热点 `hotspot-social`
  - 热搜词 `hotspot-social-search`
  - 热门话题 `hotspot-social-topic`
  - 短视频热点 `hotspot-social-video`
- 搜索趋势 `hotspot-search`
  - 搜索热度 `hotspot-search-trending`
  - 全网趋势 `hotspot-search-global`

### 新闻 `news`

- 综合新闻 `news-general`
  - 国内新闻 `news-general-domestic`
  - 国际新闻 `news-general-world`
- 时事社会 `news-current`
  - 社会民生 `news-current-society`
  - 政策公共事务 `news-current-public`
- 深度媒体 `news-depth`
  - 调查/深度 `news-depth-reporting`
  - 评论/观点 `news-depth-opinion`## 6. 科技 / AI / 财经三级结构

### 科技 `tech`

- 数码科技 `tech-digital`
  - 硬件设备 `tech-digital-hardware`
  - 软件应用 `tech-digital-software`
- 互联网产业 `tech-industry`
  - 创业商业 `tech-industry-startup`
  - 产品互联网 `tech-industry-product`
- 开发者 `tech-developer`
  - 编程开发 `tech-developer-programming`
  - 开源项目 `tech-developer-opensource`
  - 网络安全 `tech-developer-security`
- 科学 `tech-science`
  - 前沿科学 `tech-science-general`
  - 航空航天 `tech-science-space`
- 设计 `tech-design`
  - 产品设计 `tech-design-product`
  - 视觉建筑 `tech-design-visual`

### AI `ai`

沿用现有成熟二级结构：模型评测、产品生态、官方动态、研究社区、中文 AI 资讯；需要三级时再按模型/Agent/应用/论文等细分，不在本轮为了层级而强拆。

### 财经 `finance`

- 实时资讯 `finance-flash`
  - 7×24 快讯 `finance-flash-live`
  - 财经新闻 `finance-flash-news`
- 市场 `finance-market`
  - 股票热度 `finance-market-stocks`
  - 基金/理财 `finance-market-funds`
- 行情 `finance-quotes`
  - 全球股指 `finance-quotes-indexes`
  - 交易所行情 `finance-quotes-exchanges`
- 大宗商品 `finance-commodities`
  - 期货 `finance-commodities-futures`
  - 贵金属/能源 `finance-commodities-energy`## 7. 文娱 / 游戏 / 体育三级结构

### 文娱 `entertainment`

- 音乐 `entertainment-music`
  - 歌曲 `entertainment-music-songs`
  - 歌手/专辑 `entertainment-music-artists`
- 影音 `entertainment-video`
  - 电影 `entertainment-video-movie`
  - 电视剧 `entertainment-video-tv`
  - 综艺 `entertainment-video-variety`
  - 短剧 `entertainment-video-shortdrama`
  - 动画 `entertainment-video-animation`
- 阅读 `entertainment-reading`
  - 图书 `entertainment-reading-books`
  - 网络小说 `entertainment-reading-novels`
  - 漫画 `entertainment-reading-comics`

### 游戏 `games`

- 游戏榜单 `games-ranking`
  - PC/主机 `games-ranking-pc-console`
  - 手游 `games-ranking-mobile`
- 游戏内容 `games-content`
  - 资讯/评测 `games-content-news`
  - 产业/开发 `games-content-industry`
- 游戏社区 `games-community`
  - 玩家社区 `games-community-player`
  - 厂商社区 `games-community-official`
- 电竞 `games-esports`
  - 综合电竞 `games-esports-general`

游戏折扣不重复创建节点，主映射进入“优惠 → 游戏优惠”，可同时带 `games` secondary category。

### 体育 `sports`

- 综合体育 `sports-general`
- 足球 `sports-football`
- 篮球 `sports-basketball`
- 综合赛事 `sports-events`
- 其他运动 `sports-other`## 8. 生活 / 社区 / 优惠三级结构

### 生活 `life`

- 健康 `life-health`
  - 医疗健康 `life-health-medical`
  - 运动健身 `life-health-fitness`
- 教育 `life-education`
  - 学习考试 `life-education-study`
  - 知识科普 `life-education-knowledge`
- 汽车 `life-auto`
  - 汽车资讯 `life-auto-news`
  - 新车/用车 `life-auto-product`
- 出行旅行 `life-travel`
  - 旅行 `life-travel-tourism`
  - 交通出行 `life-travel-transport`
- 消费生活 `life-consumer`
  - 美食 `life-consumer-food`
  - 家居/消费 `life-consumer-home`
- 公共生活 `life-public`
  - 气象灾害 `life-public-weather`
  - 历史日历 `life-public-calendar`

### 社区 `community`

- 综合社区 `community-general`
- 问答讨论 `community-qa`
- 技术社区 `community-tech`
- 兴趣社区 `community-interest`

### 优惠 `deals`

- 综合优惠 `deals-general`
- 电商优惠 `deals-ecommerce`
- 数码软件 `deals-digital`
- 游戏优惠 `deals-games`
- 本地生活 `deals-local`

## 9. “综合”应降级为视图而不是分类

保留前端入口“综合/全部”，但它由多个分类聚合生成，不再作为 source 的真实 categoryId。

这能解决当前海外新闻、Google Trends、社交热榜、综合媒体全部塞进 `general/综合` 的问题，也避免以后新增来源继续污染分类树。## 10. Variant 级映射优先于 Source 级映射

`hotlist-taxonomy-v2-source-map.json` 只定义 source 默认归属。跨领域平台必须按 variant 覆盖。

典型映射：

| Source | Variant | 分类 |
| --- | --- | --- |
| 微博 | hot | 热点 → 社交热点 → 热搜词 |
| 微博 | entertainment | 文娱 |
| 微博 | tech | 科技 |
| 微博 | sports | 体育 → 综合体育 |
| 微博 | acg | 文娱 → 影音 → 动画 |
| 抖音 | hot / challenge | 热点 → 社交热点 → 短视频热点 |
| 抖音 | entertainment | 文娱 |
| 抖音 | society | 新闻 → 时事社会 → 社会民生 |
| B站 | music | 文娱 → 音乐 → 歌曲 |
| B站 | sports | 体育 → 综合体育 |
| B站 | auto | 生活 → 汽车 |
| B站 | knowledge | 生活 → 教育 → 知识科普 |
| 虎扑 | nba | 体育 → 篮球 |
| 虎扑 | soccer | 体育 → 足球 |
| 虎扑 | esports | 游戏 → 电竞 |
| 快手 | hot / search | 热点 → 社交热点 |
| 快手 | skit-must | 文娱 → 影音 → 短剧 |

同一个 source 可出现在多个分类页，但独立来源计数仍只算一次。

## 11. 现有来源迁移资产

已生成两份机器可读规划文件：

- `hotlist-taxonomy-v2-tree.json`：116 个分类节点，11 个一级分类，最大深度 3；
- `hotlist-taxonomy-v2-source-map.json`：现有 147/147 source 默认归类，missing=0、extra=0。

真正实施前再补 `variantCategoryOverrides`，并用审计脚本保证所有 Public variant 都有合法映射。## 12. 国内来源扩张优先级：先平台、后子榜

每个新平台第一阶段只接 1–2 个最具代表性的原生榜，先扩大独立 source 覆盖；达到足够来源广度后，再补平台内部 variants。

### P0-A 音乐平台

优先研究并接入：

1. 网易云音乐
2. QQ 音乐
3. 酷狗音乐
4. 酷我音乐

第一阶段优先找官方“热歌/飙升/流行”主榜，只选一个最稳定、用户价值最高的榜作为平台入口。随后再补新歌、原创、歌手等原生榜。

### P0-B 阅读 / 小说 / 漫画

优先研究并接入：

1. 起点中文网 / 起点女生网（竞品长期提供畅销榜）
2. 番茄小说
3. 七猫中文网（TopHub 来源池可确认）
4. 晋江文学城
5. 快看漫画
6. 哔哩哔哩漫画
7. 腾讯动漫

微信读书已经存在，先不优先堆其子榜。

### P0-C 游戏新来源

优先研究并接入：

1. TapTap
2. 游民星空
3. 3DMGAME
4. 机核 GCORES
5. A9VG
6. 游侠网
7. 游戏陀螺

糖果梦游戏分类当前覆盖二十余个平台，证明该领域存在足够大的来源池；我们的第一阶段只选国内用户高频且有稳定一手入口的平台。### P1 影音 / 体育 / 生活补齐

影音：猫眼、腾讯视频、爱奇艺、优酷；rebang.today 已有爱奇艺，糖果梦影音明确覆盖猫眼、腾讯视频、爱奇艺、优酷、百度影视。

体育：懂球帝、直播吧、新浪体育、网易体育、央视体育。虎扑已有，不把其更多子榜当作“新增来源”。

生活：优先健康、汽车、教育等用户日常高频平台，再考虑设计/电视等低频垂类。

### P1 国内资讯来源

第一财经、量子位可以技术接入，但排在娱乐休闲 P0 来源之后。

使用原则：只采标题、必要的短摘要、时间、来源、canonical URL，不抓取完整正文、正文图片或视频。来源条款风险单独记录，不再用“禁止转载”一句话直接把标题索引型数据永久判死。

## 13. 来源评分模型

新增 source 候选统一评分，避免凭个人兴趣随机扩源：

- 国内用户覆盖与品牌认知：30%
- 数据独特性 / 是否补足空白领域：20%
- 官方源稳定性与可维护性：20%
- 榜单原生性与指标质量：15%
- 实时性：10%
- 运维与复用风险：5%

同分时优先“新增独立平台”，而不是“现有平台新增第 N 个 variant”。

## 14. 不应复制竞品的做法

- 不把平台名直接当内容分类；
- 不把今日/本周/本月做成分类节点；
- 不把同一平台的几十个频道算成几十个独立来源；
- 不把资讯 feed、官方发布、搜索热词伪装成同一种“热榜”；
- 不因竞品存在某榜就默认该数据适合商业 Public API；
- 不为凑来源数量依赖长期不可控的第三方镜像。## 15. 实施顺序

Phase 1：只落 taxonomy 数据模型与迁移兼容层，不改用户默认排序；旧 category/name 继续兼容。

Phase 2：给现有 Public source/variant 建立完整映射审计，确保分类迁移前后没有来源消失。

Phase 3：前端切换到 v2 分类树；`全部/综合` 改为聚合视图；保留用户自定义分类和旧持久化数据迁移。

Phase 4：按 P0-A / P0-B / P0-C 新增音乐、阅读、游戏独立来源，每个平台先接一个主榜。

Phase 5：来源数量达到目标后，再按用户价值补网易云/QQ音乐、起点、TapTap 等内部原生 variants。## 16. 验收门禁

分类重构必须同时满足：

- 一级分类固定且语义互斥度足够高；
- 分类树深度不超过现有 `MAX_CATEGORY_DEPTH=3`；
- 147 个现有 source 默认映射完整；
- 所有 Public variant 有合法 category mapping；
- 跨域 source 由 variant override 精确覆盖；
- 分类迁移不得改变 source 独立计数；
- 老用户持久化分类/排序不能静默丢失；
- SEO category/rank route、sitemap、多语言标签全部通过审计；
- 新来源优先级遵循“国内、高频、独立平台、一手源”。

## 17. 调研基线

本轮竞品基线包括 TopHub、rebang.today、糖果梦热榜及其公开索引/历史页面。TopHub 用于来源发现，rebang 用于平台子榜参考，糖果梦用于领域分类参考。

本文档是后续分类与扩源的产品基线；在完成 taxonomy v2 实施前，不再新增零散分类节点。