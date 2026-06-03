const DEFAULT_SEO = {
  title: "今日热榜 - 全网热点聚合与多平台热榜实时更新",
  description:
    "今日热榜聚合微博、知乎、抖音、B站、头条等多平台热榜，一站式浏览全网热点。支持榜单筛选与排序、自动刷新和简洁高效的阅读体验。",
  keywords:
    "今日热榜,全网热点,热榜聚合,微博热搜,知乎热榜,抖音热榜,B站热榜,头条热榜,实时热点,榜单排行",
  ogImage: "/ico/favicon.png",
  siteName: "今日热榜",
  locale: "zh_CN",
};

const LIST_SEO_MAP = {
  weibo: {
    label: "微博热搜",
    keywords: "微博热搜,微博热榜,热搜榜",
    description: "微博实时热搜榜单，追踪全网热门话题与趋势。",
  },
  zhihu: {
    label: "知乎热榜",
    keywords: "知乎热榜,知乎热搜,知乎热门",
    description: "知乎热榜及时更新，收录最受关注的问答与讨论。",
  },
  douyin: {
    label: "抖音热榜",
    keywords: "抖音热榜,抖音热搜,短视频热门",
    description: "抖音热榜追踪实时短视频热点，发现全网流行内容。",
  },
  bilibili: {
    label: "B站热榜",
    keywords: "B站热榜,哔哩哔哩热门,视频热榜",
    description: "哔哩哔哩热门榜单，聚合全站高热度视频与话题。",
  },
  toutiao: {
    label: "今日头条热榜",
    keywords: "今日头条热榜,头条热搜,头条热点",
    description: "今日头条热榜聚合时事热点与资讯趋势，实时更新。",
  },
  baidu: {
    label: "百度热搜",
    keywords: "百度热搜,百度热榜,搜索热度",
    description: "百度热搜榜单，收录当前全网热议与搜索高频关键词。",
  },
  "36kr": {
    label: "36氪热榜",
    keywords: "36氪热榜,创投热点,科技资讯",
    description: "36氪热榜追踪创投与科技领域的热门资讯与趋势。",
  },
  "qq-news": {
    label: "腾讯新闻热榜",
    keywords: "腾讯新闻热榜,新闻热度,热门资讯",
    description: "腾讯新闻实时热榜，聚合当下高关注度资讯内容。",
  },
  ithome: {
    label: "IT之家热榜",
    keywords: "IT之家热榜,科技新闻,数码热点",
    description: "IT之家科技数码热榜，覆盖新品、评测与行业动态。",
  },
  sspai: {
    label: "少数派热榜",
    keywords: "少数派热榜,效率工具,数码生活",
    description: "少数派热门文章榜，精选效率、工具与数码生活内容。",
  },
  thepaper: {
    label: "澎湃新闻热榜",
    keywords: "澎湃新闻热榜,时政热点,社会新闻",
    description: "澎湃新闻热门榜单，关注时政、社会与深度报道。",
  },
  tieba: {
    label: "百度贴吧热议",
    keywords: "贴吧热议,贴吧热榜,百度贴吧",
    description: "百度贴吧热议榜，汇总社区热门话题与讨论。",
  },
  juejin: {
    label: "掘金热榜",
    keywords: "掘金热榜,前端热点,开发者社区",
    description: "掘金热门文章榜，面向开发者的技术热点与实践。",
  },
  "douban-movie": {
    label: "豆瓣电影与剧集热榜",
    keywords: "豆瓣电影榜单,豆瓣电视剧榜单,热门电影,热门剧集",
    description: "豆瓣电影与剧集热榜，覆盖热映电影、热门电影、热门电视剧、综艺、动画与纪录片。",
  },
  "douban-group": {
    label: "豆瓣小组热帖",
    keywords: "豆瓣小组热帖,豆瓣热榜,社区讨论",
    description: "豆瓣小组热门帖文，聚合社区内的热门讨论。",
  },
  tianya: {
    label: "天涯社区精华帖",
    keywords: "天涯社区,天涯荟萃,天涯神帖,社区精华帖",
    description: "天涯社区官方恢复开放的天涯荟萃与精华帖榜单。",
  },
  ngabbs: {
    label: "NGA 热帖",
    keywords: "NGA 热帖,NGA 热榜,游戏论坛热点",
    description: "NGA 论坛热门帖子，涵盖游戏资讯与玩家讨论。",
  },
  hellogithub: {
    label: "HelloGitHub 热榜",
    keywords: "HelloGitHub 热榜,开源项目,GitHub 热门",
    description: "HelloGitHub 热门项目推荐，发现精选开源资源。",
  },
  jianshu: {
    label: "简书热榜",
    keywords: "简书热榜,简书热门文章,写作平台",
    description: "简书热门文章榜单，收录高热度写作与故事。",
  },
  "zhihu-daily": {
    label: "知乎日报",
    keywords: "知乎日报,知乎日报热榜,每日精选",
    description: "知乎日报精选内容，快速浏览每日热门文章。",
  },
  genshin: {
    label: "原神热榜",
    keywords: "原神热榜,游戏热搜,原神资讯",
    description: "原神相关热门内容与讨论，及时掌握游戏资讯。",
  },
  starrail: {
    label: "崩坏：星穹铁道热榜",
    keywords: "星穹铁道热榜,崩坏星轨,游戏热点",
    description: "崩坏：星穹铁道热门内容，追踪活动与攻略讨论。",
  },
  lol: {
    label: "英雄联盟热榜",
    keywords: "LOL热榜,英雄联盟热点,赛事资讯",
    description: "英雄联盟热门榜单，覆盖赛事资讯与社区讨论。",
  },
  "netease-news": {
    label: "网易新闻热榜",
    keywords: "网易新闻热榜,新闻热点,资讯排行",
    description: "网易新闻热点榜，聚合当下高关注度新闻。",
  },
  weread: {
    label: "微信读书热榜",
    keywords: "微信读书热榜,阅读榜单,热门书籍",
    description: "微信读书热门书籍榜，发现当下高热度的阅读内容。",
  },
  default: {
    label: "全平台热榜",
    keywords: "全网热点,热榜聚合,实时热榜",
    description: "全平台热门榜单实时聚合，快速浏览全网趋势。",
  },
};

const normalizeSiteUrl = (url) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return normalizeSiteUrl(envUrl);
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

const ensureMetaTag = (attr, name) => {
  const selector = `meta[${attr}="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  return tag;
};

const setMetaTag = (attr, name, content) => {
  if (!content) return;
  const tag = ensureMetaTag(attr, name);
  tag.setAttribute("content", content);
};

const setLinkTag = (rel, href) => {
  if (!href) return;
  const selector = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

const setJsonLd = (id, data) => {
  const selector = `script#${id}`;
  const existing = document.head.querySelector(selector);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const script = existing || document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
};

const buildAbsoluteUrl = (path, siteUrl) => {
  if (!path) return "";
  if (!siteUrl) return path;
  try {
    return new URL(path, siteUrl).toString();
  } catch (error) {
    return path;
  }
};

const resolveValue = (val, ctx) => {
  return typeof val === "function" ? val(ctx) : val;
};

const getListSeo = (route, siteUrl, canonical) => {
  const typeParam = route?.query?.type || route?.params?.type;
  const typeKey = Array.isArray(typeParam) ? typeParam?.[0] : typeParam;
  const meta = (typeKey && LIST_SEO_MAP[typeKey]) || LIST_SEO_MAP.default;
  const label = meta.label || "热门榜单";
  const description =
    meta.description ||
    `${label}实时更新，覆盖当下高热度内容，支持分页与快速跳转。`;
  const keywords =
    meta.keywords || `${label},热门榜单,实时热榜,全网热点,今日热榜`;
  const title = `${label} - 今日热榜_吾爱分享网`;

  return {
    title,
    description,
    keywords,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${label} - 今日热榜`,
      description,
      inLanguage: "zh-CN",
      url: canonical,
      isPartOf: siteUrl || undefined,
      mainEntity: {
        "@type": "ItemList",
        name: `${label}榜单`,
        itemListOrder: "Descending",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: label,
            url: canonical,
          },
        ],
      },
    },
  };
};

export const applySeoMeta = (route) => {
  if (typeof document === "undefined") return;
  const meta = route?.meta || {};
  const siteUrl = getSiteUrl();
  const canonical = meta.canonical
    ? buildAbsoluteUrl(meta.canonical, siteUrl)
    : buildAbsoluteUrl(route?.fullPath || route?.path || "/", siteUrl);
  const context = { route, siteUrl, canonical };

  const listSeo = route?.name === "list" ? getListSeo(route, siteUrl, canonical) : null;

  const title =
    listSeo?.title ||
    resolveValue(meta.seoTitle || meta.title, context) ||
    DEFAULT_SEO.title;
  const description =
    listSeo?.description ||
    resolveValue(meta.description, context) ||
    DEFAULT_SEO.description;
  const keywords =
    listSeo?.keywords ||
    resolveValue(meta.keywords, context) ||
    DEFAULT_SEO.keywords;
  const robots = resolveValue(meta.robots, context) || "index,follow";
  const ogType = resolveValue(meta.ogType, context) || "website";
  const ogImage = buildAbsoluteUrl(
    resolveValue(meta.ogImage, context) || DEFAULT_SEO.ogImage,
    siteUrl
  );

  document.title = title;
  setMetaTag("name", "description", description);
  setMetaTag("name", "keywords", keywords);
  setMetaTag("name", "robots", robots);

  setMetaTag("property", "og:type", ogType);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:url", canonical);
  setMetaTag("property", "og:image", ogImage);
  setMetaTag("property", "og:site_name", DEFAULT_SEO.siteName);
  setMetaTag("property", "og:locale", DEFAULT_SEO.locale);

  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);

  setLinkTag("canonical", canonical);

  const jsonLd =
    listSeo?.jsonLd ||
    (typeof meta.jsonLd === "function"
      ? meta.jsonLd({ siteUrl, canonical, title, description, route })
      : meta.jsonLd);
  setJsonLd("page-schema", jsonLd);
};
