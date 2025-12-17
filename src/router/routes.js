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
  // 新闻列表
  {
    path: "/list",
    name: "list",
    meta: {
      title: "新闻列表",
      seoTitle: "热榜列表 - 今日热榜",
      description:
        "按平台查看实时热榜排行，覆盖微博、知乎、抖音、B站等热门站点，支持分页与快速跳转。",
      keywords:
        "热榜列表,热门榜单,实时排行,微博热搜,知乎热榜,抖音热榜,B站热榜",
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
    path: "/:pathMatch(.*)",
    redirect: "/404",
  },
];

export default routes;
