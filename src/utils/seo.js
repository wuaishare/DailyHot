import i18n from "@/i18n";
import {
  buildLocalePathFromRoute,
  getCategoryLabel,
  getCategoryNameBySlug,
  getLocaleFromRoute,
  getLocaleMeta,
  getSourceNameBySlug,
  getSupportedLocales,
  normalizeLocale,
} from "@/utils/locale";
import { getSourceSubtypeOptions } from "@/utils/sourceSubtypes";

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
  "openrouter-rankings": {
    label: "OpenRouter 排行榜",
    keywords: "OpenRouter 排行榜,AI 模型热度,模型使用趋势",
    description: "OpenRouter 模型使用热度与调用趋势排行榜。",
  },
  artificialanalysis: {
    label: "Artificial Analysis 排行榜",
    keywords: "Artificial Analysis,AI 排行榜,模型评测",
    description: "Artificial Analysis 模型能力、价格与速度综合排行榜。",
  },
  lmarena: {
    label: "LMArena 排行榜",
    keywords: "LMArena,大模型排行榜,模型对战榜",
    description: "LMArena 文本模型对战与用户投票排行榜。",
  },
  designarena: {
    label: "DesignArena 排行榜",
    keywords: "DesignArena,AI 设计榜单,前端模型排行榜",
    description: "DesignArena 前端、设计与创意类 AI 模型排行榜。",
  },
  "aicpb-rankings": {
    label: "AICPB 全球 AI 排行榜",
    keywords: "AICPB,全球 AI 排行榜,AI 产品榜单",
    description: "AICPB 全球 AI 产品与网站热度排行榜。",
  },
  "llm-stats": {
    label: "LLM Stats 排行榜",
    keywords: "LLM Stats,大模型比较,AI 模型榜单",
    description: "LLM Stats 模型能力、速度与价格排行榜。",
  },
  "skills-rank": {
    label: "Skills Rank 排行榜",
    keywords: "Skills Rank,Agent Skills,安装量榜单",
    description: "Skills Rank 展示 Agent Skills 安装量与流行度排行。",
  },
  "openai-news": {
    label: "OpenAI 官方新闻",
    keywords: "OpenAI 官方新闻,OpenAI 更新,OpenAI 博客",
    description: "OpenAI 官方新闻与产品发布动态。",
  },
  "openai-research": {
    label: "OpenAI Research",
    keywords: "OpenAI Research,OpenAI 研究动态,AI 官方研究",
    description: "OpenAI Research 官方研究与技术发布更新。",
  },
  "anthropic-news": {
    label: "Anthropic 官方新闻",
    keywords: "Anthropic 官方新闻,Claude 更新,Anthropic 博客",
    description: "Anthropic 官方新闻、Claude 更新与发布动态。",
  },
  "deepmind-blog": {
    label: "DeepMind 官方博客",
    keywords: "DeepMind 博客,Google DeepMind,AI 研究更新",
    description: "Google DeepMind 官方博客与研究更新。",
  },
  "meta-ai-blog": {
    label: "Meta AI 官方动态",
    keywords: "Meta AI,Meta Llama,Meta 官方 AI 动态",
    description: "Meta 官方 AI 动态与 Llama 相关新闻更新。",
  },
  "huggingface-blog": {
    label: "Hugging Face 官方博客",
    keywords: "Hugging Face 博客,AI 开源,模型生态",
    description: "Hugging Face 官方博客与模型生态更新。",
  },
  "mistral-news": {
    label: "Mistral 官方新闻",
    keywords: "Mistral 新闻,Mistral AI,模型更新",
    description: "Mistral 官方产品与模型更新动态。",
  },
  "cohere-blog": {
    label: "Cohere 官方博客",
    keywords: "Cohere 博客,Cohere AI,企业 AI",
    description: "Cohere 官方博客、研究与产品更新。",
  },
  "hf-models": {
    label: "Hugging Face 模型趋势",
    keywords: "Hugging Face 模型,模型趋势,开源模型",
    description: "Hugging Face 模型趋势榜，观察热门开源模型。",
  },
  "hf-papers": {
    label: "Hugging Face 热门论文",
    keywords: "Hugging Face 热门论文,AI 论文趋势,热门论文",
    description: "Hugging Face 热门论文趋势榜。",
  },
  paperswithcode: {
    label: "Papers with Code",
    keywords: "Papers with Code,热门论文,论文代码",
    description: "Papers with Code 热门论文与代码趋势，当前由 Hugging Face Trending Papers 承载。",
  },
  "producthunt-ai": {
    label: "Product Hunt AI",
    keywords: "Product Hunt AI,AI 产品发现,AI 新品",
    description: "Product Hunt 中与 AI 相关的产品发现流。",
  },
  "hackernews-ai": {
    label: "Hacker News AI",
    keywords: "Hacker News AI,AI 社区热议,技术讨论",
    description: "Hacker News 中与 AI 相关的热门讨论。",
  },
  "clawhub-skills": {
    label: "ClawHub Skills",
    keywords: "ClawHub Skills,AI 技能榜,Agent Skills",
    description: "ClawHub Skills 推荐、安装、星标与分类榜单。",
  },
  clawhub: {
    label: "ClawHub",
    keywords: "ClawHub,AI 技能与插件榜,Agent Skills,Agent Plugins",
    description: "ClawHub 的 Skills 与 Plugins 聚合榜单入口。",
  },
  "clawhub-plugins": {
    label: "ClawHub Plugins",
    keywords: "ClawHub Plugins,AI 插件榜,Agent 插件",
    description: "ClawHub Plugins 推荐、精选、官方与分类榜单。",
  },
  "sina-ai": {
    label: "新浪 AI 热榜",
    keywords: "新浪 AI 热榜,AI 资讯,中文 AI 热点",
    description: "新浪 AI 热榜，补充中文 AI 资讯视角。",
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

const SOURCE_LABEL_OVERRIDES = {
  weibo: { en: "Weibo Hot Search" },
  zhihu: { en: "Zhihu Hot List" },
  douyin: { en: "Douyin Hot List" },
  bilibili: { en: "Bilibili Trending" },
  toutiao: { en: "Toutiao Hot List" },
  baidu: { en: "Baidu Hot Search" },
  kuaishou: { en: "Kuaishou Trending" },
  "36kr": { en: "36Kr Trending" },
  "qq-news": { en: "Tencent News Trending" },
  "netease-news": { en: "Netease News Trending" },
  "sina-news": { en: "Sina News Trending" },
  ithome: { en: "ITHome Trending" },
  sspai: { en: "SSPAI Trending" },
  thepaper: { en: "The Paper Trending" },
  tieba: { en: "Baidu Tieba Trending" },
  smzdm: { en: "SMZDM Trending" },
  nytimes: { en: "The New York Times" },
  "douban-group": { en: "Douban Groups" },
  "douban-movie": { en: "Douban Movies & TV" },
  weread: { en: "WeRead Trending" },
  csdn: { en: "CSDN Trending" },
  juejin: { en: "Juejin Trending" },
  hupu: { en: "Hupu Trending" },
  coolapk: { en: "Coolapk Trending" },
  v2ex: { en: "V2EX Trending" },
  github: { en: "GitHub Trending" },
  gameres: { en: "GameRes Trending" },
  yystv: { en: "Yystv Trending" },
  miyoushe: { en: "Miyoushe Trending" },
  genshin: { en: "Genshin Impact" },
  starrail: { en: "Honkai: Star Rail" },
  honkai: { en: "Honkai Impact 3rd" },
  lol: { en: "League of Legends" },
  huxiu: { en: "Huxiu Trending" },
  sina: { en: "Sina Hot List" },
  tianya: { en: "Tianya Curated" },
  ngabbs: { en: "NGA Trending" },
  hellogithub: { en: "HelloGitHub Trending" },
  jianshu: { en: "Jianshu Trending" },
  "zhihu-daily": { en: "Zhihu Daily" },
  "openrouter-rankings": { en: "OpenRouter Rankings" },
  artificialanalysis: { en: "Artificial Analysis" },
  lmarena: { en: "LMArena" },
  designarena: { en: "DesignArena" },
  "aicpb-rankings": { en: "AICPB Global AI Rankings" },
  "llm-stats": { en: "LLM Stats" },
  "skills-rank": { en: "Skills Rank" },
  "openai-news": { en: "OpenAI News" },
  "openai-research": { en: "OpenAI Research" },
  "anthropic-news": { en: "Anthropic News" },
  "deepmind-blog": { en: "DeepMind Blog" },
  "meta-ai-blog": { en: "Meta AI" },
  "huggingface-blog": { en: "Hugging Face Blog" },
  "mistral-news": { en: "Mistral News" },
  "cohere-blog": { en: "Cohere Blog" },
  "hf-models": { en: "Hugging Face Models" },
  "hf-papers": { en: "Hugging Face Papers" },
  paperswithcode: { en: "Papers with Code" },
  "producthunt-ai": { en: "Product Hunt AI" },
  "hackernews-ai": { en: "Hacker News AI" },
  "clawhub-skills": { en: "ClawHub Skills" },
  clawhub: { en: "ClawHub" },
  "clawhub-plugins": { en: "ClawHub Plugins" },
  "sina-ai": { en: "Sina AI" },
  default: { en: "Cross-platform Rankings" },
};

const SYSTEM_ROUTE_SEO_KEY_MAP = {
  setting: "setting",
  "setting-locale": "setting",
  analytics: "analytics",
  "analytics-locale": "analytics",
  privacy: "privacy",
  "privacy-locale": "privacy",
  test: "test",
  "test-locale": "test",
  403: "forbidden",
  "403-locale": "forbidden",
  404: "notFound",
  "404-locale": "notFound",
  500: "serverError",
  "500-locale": "serverError",
};

const containsNonLatin = (value = "") => /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(value);

const titleCaseToken = (token = "") =>
  token
    .split(" ")
    .filter(Boolean)
    .map((part) =>
      /^[A-Z0-9]+$/.test(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");

const prettifySlug = (value = "") =>
  titleCaseToken(
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

const getSourceLabel = (typeKey, locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const overrides = SOURCE_LABEL_OVERRIDES[typeKey] || SOURCE_LABEL_OVERRIDES.default;
  if (overrides?.[normalizedLocale]) return overrides[normalizedLocale];
  if (normalizedLocale === "zh-CN" && LIST_SEO_MAP[typeKey]?.label) {
    return LIST_SEO_MAP[typeKey].label;
  }
  if (normalizedLocale === "zh-TW" && LIST_SEO_MAP[typeKey]?.label) {
    return LIST_SEO_MAP[typeKey].label;
  }
  if (overrides?.en) return overrides.en;
  if (LIST_SEO_MAP[typeKey]?.label && !containsNonLatin(LIST_SEO_MAP[typeKey].label)) {
    return LIST_SEO_MAP[typeKey].label;
  }
  return prettifySlug(typeKey || "rankings");
};

const getSubtypeLabel = (sourceSlug, subtypeSlug, locale = "zh-CN") => {
  if (!sourceSlug || !subtypeSlug) return "";
  const subtype = getSourceSubtypeOptions(sourceSlug).find(
    (item) => item.value === subtypeSlug
  );
  const rawLabel = subtype?.label || "";
  const normalizedLocale = normalizeLocale(locale);
  if (!rawLabel) return prettifySlug(subtypeSlug);
  if (normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") {
    return rawLabel;
  }
  if (!containsNonLatin(rawLabel)) return rawLabel;
  return prettifySlug(subtypeSlug);
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

const setAlternateLinks = (route, siteUrl) => {
  const existing = document.head.querySelectorAll('link[data-i18n-alt="true"]');
  existing.forEach((item) => item.remove());
  if (!siteUrl) return;
  const locales = getSupportedLocales();
  locales.forEach((item) => {
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", item.htmlLang);
    link.setAttribute(
      "href",
      buildAbsoluteUrl(buildLocalePathFromRoute(route, item.code), siteUrl)
    );
    link.setAttribute("data-i18n-alt", "true");
    document.head.appendChild(link);
  });
  const xDefault = document.createElement("link");
  xDefault.setAttribute("rel", "alternate");
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.setAttribute(
    "href",
    buildAbsoluteUrl(buildLocalePathFromRoute(route, "zh-CN"), siteUrl)
  );
  xDefault.setAttribute("data-i18n-alt", "true");
  document.head.appendChild(xDefault);
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

const getPageSeo = (route, locale) => {
  const pageKey = SYSTEM_ROUTE_SEO_KEY_MAP[route?.name];
  if (!pageKey) return null;
  return {
    title: i18n.global.t(`seo.${pageKey}Title`, {}, { locale }),
    description: i18n.global.t(`seo.${pageKey}Description`, {}, { locale }),
  };
};

const getHomeJsonLd = (siteUrl, title, description, locale) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: i18n.global.t("common.siteName", {}, { locale }) || DEFAULT_SEO.siteName,
  url: siteUrl || "/",
  description,
  inLanguage: getLocaleMeta(locale)?.htmlLang || "zh-CN",
  headline: title,
});

const getCategorySeo = (route, canonical) => {
  const locale = getLocaleFromRoute(route);
  const rawCategoryName = route?.params?.categorySlug
    ? getCategoryNameBySlug(route.params.categorySlug)
    : "";
  const categoryName = rawCategoryName
    ? getCategoryLabel(rawCategoryName, locale)
    : "";
  if (!categoryName) return null;
  const title = i18n.global.t(
    "seo.categoryTitle",
    { category: categoryName },
    { locale }
  );
  const description = i18n.global.t(
    "seo.categoryDescription",
    { category: categoryName },
    { locale }
  );
  const keywords = i18n.global.t(
    "seo.categoryKeywords",
    { category: categoryName },
    { locale }
  );
  return {
    title,
    description,
    keywords,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      inLanguage: getLocaleMeta(locale)?.htmlLang || "zh-CN",
      url: canonical,
      mainEntity: {
        "@type": "ItemList",
        name: categoryName,
        itemListOrder: "Descending",
      },
    },
  };
};

const getListSeo = (route, siteUrl, canonical) => {
  const locale = getLocaleFromRoute(route);
  const typeParam =
    route?.query?.type ||
    route?.params?.type ||
    getSourceNameBySlug(route?.params?.sourceSlug);
  const typeKey = Array.isArray(typeParam) ? typeParam?.[0] : typeParam;
  const sourceKey = typeKey || "default";
  const meta = LIST_SEO_MAP[sourceKey] || LIST_SEO_MAP.default;
  const sourceLabel = getSourceLabel(sourceKey, locale);
  const subtypeSlug = Array.isArray(route?.params?.subtypeSlug)
    ? route.params.subtypeSlug[0]
    : route?.params?.subtypeSlug;
  const subtypeLabel = getSubtypeLabel(sourceKey, subtypeSlug, locale);
  const label = subtypeLabel ? `${sourceLabel} · ${subtypeLabel}` : sourceLabel;
  const localizedDefaultTitle = i18n.global.t("seo.listTitle", {}, { locale });
  const localizedDefaultDescription = i18n.global.t(
    "seo.listDescription",
    {},
    { locale }
  );
  const localizedDefaultKeywords = i18n.global.t(
    "seo.listKeywords",
    {},
    { locale }
  );
  const description =
    subtypeLabel
      ? i18n.global.t(
          "seo.sourceSubtypeDescription",
          {
            label: sourceLabel,
            subtype: subtypeLabel,
          },
          { locale }
        )
      : locale === "zh-CN" && meta.description
        ? meta.description
        : i18n.global.t("seo.sourceDescription", { label: sourceLabel }, { locale });
  const keywords =
    subtypeLabel
      ? i18n.global.t(
          "seo.sourceSubtypeKeywords",
          {
            label: sourceLabel,
            subtype: subtypeLabel,
          },
          { locale }
        )
      : locale === "zh-CN" && meta.keywords
        ? meta.keywords
        : i18n.global.t("seo.sourceKeywords", { label: sourceLabel }, { locale });
  const localizedSiteName = i18n.global.t("common.siteName", {}, { locale });
  const title =
    locale === "zh-CN"
      ? `${label} - 今日热榜_吾爱分享网`
      : `${label} - ${localizedSiteName}`;
  const finalDescription = description || localizedDefaultDescription;
  const finalKeywords = keywords || localizedDefaultKeywords;

  return {
    title,
    description: finalDescription,
    keywords: finalKeywords,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: finalDescription,
      inLanguage: getLocaleMeta(locale)?.htmlLang || "zh-CN",
      url: canonical,
      isPartOf: siteUrl || undefined,
      mainEntity: {
        "@type": "ItemList",
        name: label,
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
  const locale = normalizeLocale(getLocaleFromRoute(route));
  const meta = route?.meta || {};
  const siteUrl = getSiteUrl();
  const canonical = meta.canonical
    ? buildAbsoluteUrl(meta.canonical, siteUrl)
    : buildAbsoluteUrl(route?.fullPath || route?.path || "/", siteUrl);
  const context = { route, siteUrl, canonical, locale };

  const listSeo = ["list", "list-locale", "list-legacy"].includes(route?.name)
    ? getListSeo(route, siteUrl, canonical)
    : null;
  const categorySeo = ["category", "category-locale"].includes(route?.name)
    ? getCategorySeo(route, canonical)
    : null;
  const pageSeo = getPageSeo(route, locale);
  const localizedHomeTitle = i18n.global.t("seo.homeTitle", {}, { locale });
  const localizedHomeDescription = i18n.global.t(
    "seo.homeDescription",
    {},
    { locale }
  );
  const localizedHomeKeywords = i18n.global.t("seo.homeKeywords", {}, { locale });
  const localizedListTitle = i18n.global.t("seo.listTitle", {}, { locale });
  const localizedListDescription = i18n.global.t(
    "seo.listDescription",
    {},
    { locale }
  );
  const localizedListKeywords = i18n.global.t("seo.listKeywords", {}, { locale });
  const isLocaleRoute = locale !== "zh-CN";
  const isListRoute = ["list", "list-locale", "list-legacy"].includes(route?.name);
  const isHomeRoute = ["home", "home-locale"].includes(route?.name);

  const title =
    listSeo?.title ||
    categorySeo?.title ||
    pageSeo?.title ||
    (isLocaleRoute && isHomeRoute ? localizedHomeTitle : null) ||
    (isLocaleRoute && isListRoute ? localizedListTitle : null) ||
    resolveValue(meta.seoTitle || meta.title, context) ||
    localizedHomeTitle ||
    DEFAULT_SEO.title;
  const description =
    listSeo?.description ||
    categorySeo?.description ||
    pageSeo?.description ||
    (isLocaleRoute && isHomeRoute ? localizedHomeDescription : null) ||
    (isLocaleRoute && isListRoute ? localizedListDescription : null) ||
    resolveValue(meta.description, context) ||
    localizedHomeDescription ||
    DEFAULT_SEO.description;
  const keywords =
    listSeo?.keywords ||
    categorySeo?.keywords ||
    (isLocaleRoute && isHomeRoute ? localizedHomeKeywords : null) ||
    (isLocaleRoute && isListRoute ? localizedListKeywords : null) ||
    resolveValue(meta.keywords, context) ||
    localizedHomeKeywords ||
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
  setMetaTag("property", "og:site_name", i18n.global.t("common.siteName", {}, { locale }) || DEFAULT_SEO.siteName);
  setMetaTag(
    "property",
    "og:locale",
    (getLocaleMeta(locale)?.htmlLang || DEFAULT_SEO.locale).replace("-", "_")
  );

  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);

  setLinkTag("canonical", canonical);
  setAlternateLinks(route, siteUrl);

  const jsonLd =
    listSeo?.jsonLd ||
    categorySeo?.jsonLd ||
    (isHomeRoute ? getHomeJsonLd(siteUrl, title, description, locale) : null) ||
    (typeof meta.jsonLd === "function"
      ? meta.jsonLd({ siteUrl, canonical, title, description, route })
      : meta.jsonLd);
  setJsonLd("page-schema", jsonLd);
};
