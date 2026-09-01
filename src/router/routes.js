import {
  CHIGUA_TOPIC_METADATA,
  GAME_DEALS_TOPIC_METADATA,
  WOOL_TOPIC_METADATA,
} from "@/config/site-metadata.mjs";

const localePattern = ":lang(en|zh-tw|ja|ko)";

const routes = [
  // 首页
  {
    path: "/",
    name: "home",
    meta: {
      title: "首页",
      seoTitle: "今日热榜 - 全网热点聚合与多平台热榜实时更新_吾爱分享网",
      description:
        "今日热榜聚合微博、知乎、抖音、B站、头条等多平台热榜，一站式浏览全网热点。支持榜单筛选与排序、自动刷新和简洁高效的阅读体验。",
      keywords:
        "今日热榜,全网热点,热榜聚合,微博热搜,知乎热榜,抖音热榜,B站热榜,头条热榜,实时热点,榜单排行",
      jsonLd: ({ siteUrl, description }) => ({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "今日热榜",
        url: siteUrl || "/",
        description,
        inLanguage: "zh-CN",
      }),
    },
    component: () => import("@/views/Home.vue"),
  },
  {
    path: `/${localePattern}`,
    name: "home-locale",
    meta: {
      title: "首页",
      seoTitle: "今日热榜 - 全网热点聚合与多平台热榜实时更新_吾爱分享网",
      description:
        "今日热榜聚合微博、知乎、抖音、B站、头条等多平台热榜，一站式浏览全网热点。支持榜单筛选与排序、自动刷新和简洁高效的阅读体验。",
      keywords:
        "今日热榜,全网热点,热榜聚合,微博热搜,知乎热榜,抖音热榜,B站热榜,头条热榜,实时热点,榜单排行",
      jsonLd: ({ siteUrl, description }) => ({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "今日热榜",
        url: siteUrl || "/",
        description,
        inLanguage: "zh-CN",
      }),
    },
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/category/:categorySlug",
    name: "category",
    meta: {
      title: "分类热榜",
      seoTitle: "分类热榜 - 今日热榜",
      description: "按分类浏览实时热榜内容。",
      keywords: "分类热榜,实时热榜,热点分类",
    },
    component: () => import("@/views/Home.vue"),
  },
  {
    path: `/${localePattern}/category/:categorySlug`,
    name: "category-locale",
    meta: {
      title: "分类热榜",
      seoTitle: "分类热榜 - 今日热榜",
      description: "按分类浏览实时热榜内容。",
      keywords: "分类热榜,实时热榜,热点分类",
    },
    component: () => import("@/views/Home.vue"),
  },
  {
    path: "/topic/chigua",
    name: "chigua-topic",
    meta: {
      title: "全网热议事件雷达",
      seoTitle: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoTitle,
      description: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoDescription,
      keywords: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/ChiguaTopic.vue"),
  },
  {
    path: `/${localePattern}/topic/chigua`,
    name: "chigua-topic-locale",
    meta: {
      title: "全网热议事件雷达",
      seoTitle: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoTitle,
      description: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoDescription,
      keywords: ({ locale }) =>
        (CHIGUA_TOPIC_METADATA[locale] || CHIGUA_TOPIC_METADATA["zh-CN"])
          .seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/ChiguaTopic.vue"),
  },
  {
    path: "/topic/wool",
    name: "wool-topic",
    meta: {
      title: "实时羊毛专题",
      seoTitle: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"]).seoTitle,
      description: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"])
          .seoDescription,
      keywords: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"])
          .seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/WoolTopic.vue"),
  },
  {
    path: `/${localePattern}/topic/wool`,
    name: "wool-topic-locale",
    meta: {
      title: "实时羊毛专题",
      seoTitle: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"]).seoTitle,
      description: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"])
          .seoDescription,
      keywords: ({ locale }) =>
        (WOOL_TOPIC_METADATA[locale] || WOOL_TOPIC_METADATA["zh-CN"])
          .seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/WoolTopic.vue"),
  },
  {
    path: "/topic/game-deals",
    name: "game-deals-topic",
    meta: {
      title: "实时游戏优惠",
      seoTitle: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoTitle,
      description: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoDescription,
      keywords: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/GameDealsTopic.vue"),
  },
  {
    path: `/${localePattern}/topic/game-deals`,
    name: "game-deals-topic-locale",
    meta: {
      title: "实时游戏优惠",
      seoTitle: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoTitle,
      description: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoDescription,
      keywords: ({ locale }) =>
        (
          GAME_DEALS_TOPIC_METADATA[locale] ||
          GAME_DEALS_TOPIC_METADATA["zh-CN"]
        ).seoKeywords,
      jsonLd: ({ canonical, title, description }) => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        description,
        url: canonical,
      }),
    },
    component: () => import("@/views/GameDealsTopic.vue"),
  },
  // 新闻列表
  {
    path: "/list",
    name: "list-legacy",
    meta: {
      title: "新闻列表",
      seoTitle: "热榜列表 - 今日热榜",
      description:
        "按平台查看实时热榜排行，覆盖微博、知乎、抖音、B站等热门站点，支持分页与快速跳转。",
      keywords: "热榜列表,热门榜单,实时排行,微博热搜,知乎热榜,抖音热榜,B站热榜",
    },
    component: () => import("@/views/List.vue"),
  },
  {
    path: "/rank/:sourceSlug/:subtypeSlug?",
    name: "list",
    meta: {
      title: "新闻列表",
      seoTitle: "热榜列表 - 今日热榜",
      description:
        "按平台查看实时热榜排行，覆盖微博、知乎、抖音、B站等热门站点，支持分页与快速跳转。",
      keywords: "热榜列表,热门榜单,实时排行,微博热搜,知乎热榜,抖音热榜,B站热榜",
    },
    component: () => import("@/views/List.vue"),
  },
  {
    path: `/${localePattern}/rank/:sourceSlug/:subtypeSlug?`,
    name: "list-locale",
    meta: {
      title: "新闻列表",
      seoTitle: "热榜列表 - 今日热榜",
      description:
        "按平台查看实时热榜排行，覆盖微博、知乎、抖音、B站等热门站点，支持分页与快速跳转。",
      keywords: "热榜列表,热门榜单,实时排行,微博热搜,知乎热榜,抖音热榜,B站热榜",
    },
    component: () => import("@/views/List.vue"),
  },
  // 设置页
  {
    path: "/setting",
    name: "setting",
    meta: {
      title: "全局设置",
      seoTitle: "全局设置 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Setting.vue"),
  },
  {
    path: `/${localePattern}/setting`,
    name: "setting-locale",
    meta: {
      title: "全局设置",
      seoTitle: "全局设置 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Setting.vue"),
  },
  {
    path: "/analytics",
    name: "analytics",
    meta: {
      title: "数据统计",
      seoTitle: "数据统计 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Analytics.vue"),
  },
  {
    path: `/${localePattern}/analytics`,
    name: "analytics-locale",
    meta: {
      title: "数据统计",
      seoTitle: "数据统计 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Analytics.vue"),
  },
  {
    path: "/privacy",
    name: "privacy",
    meta: {
      title: "隐私说明",
      seoTitle: "隐私说明 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Privacy.vue"),
  },
  {
    path: `/${localePattern}/privacy`,
    name: "privacy-locale",
    meta: {
      title: "隐私说明",
      seoTitle: "隐私说明 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Privacy.vue"),
  },
  // 测试页面
  {
    path: "/test",
    name: "test",
    meta: {
      title: "test",
      seoTitle: "测试页面 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Test.vue"),
  },
  {
    path: `/${localePattern}/test`,
    name: "test-locale",
    meta: {
      title: "test",
      seoTitle: "测试页面 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/Test.vue"),
  },
  // 403
  {
    path: "/403",
    name: "403",
    meta: {
      title: "403",
      seoTitle: "403 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/403.vue"),
  },
  {
    path: `/${localePattern}/403`,
    name: "403-locale",
    meta: {
      title: "403",
      seoTitle: "403 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/403.vue"),
  },
  // 404
  {
    path: "/404",
    name: "404",
    meta: {
      title: "404",
      seoTitle: "404 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/404.vue"),
  },
  {
    path: `/${localePattern}/404`,
    name: "404-locale",
    meta: {
      title: "404",
      seoTitle: "404 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/404.vue"),
  },
  // 500
  {
    path: "/500",
    name: "500",
    meta: {
      title: "500",
      seoTitle: "500 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/500.vue"),
  },
  {
    path: `/${localePattern}/500`,
    name: "500-locale",
    meta: {
      title: "500",
      seoTitle: "500 - 今日热榜",
      robots: "noindex,nofollow",
    },
    component: () => import("@/views/500.vue"),
  },
  {
    path: "/:pathMatch(.*)",
    redirect: "/404",
  },
];

export default routes;
