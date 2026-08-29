export const DEFAULT_LOCALE = "zh-CN";

export const SUPPORTED_LOCALES = [
  {
    code: "zh-CN",
    routePrefix: "",
    routeParam: "zh-cn",
    htmlLang: "zh-CN",
    translateJs: "chinese_simplified",
    flag: "/flags/cn.svg",
    label: "简体中文",
    shortLabel: "简中",
  },
  {
    code: "en",
    routePrefix: "/en",
    routeParam: "en",
    htmlLang: "en",
    translateJs: "english",
    flag: "/flags/us.svg",
    label: "English",
    shortLabel: "EN",
  },
  {
    code: "zh-TW",
    routePrefix: "/zh-tw",
    routeParam: "zh-tw",
    htmlLang: "zh-TW",
    translateJs: "chinese_traditional",
    flag: "/flags/tw.svg",
    label: "繁體中文",
    shortLabel: "繁中",
  },
  {
    code: "ja",
    routePrefix: "/ja",
    routeParam: "ja",
    htmlLang: "ja",
    translateJs: "japanese",
    flag: "/flags/jp.svg",
    label: "日本語",
    shortLabel: "JP",
  },
  {
    code: "ko",
    routePrefix: "/ko",
    routeParam: "ko",
    htmlLang: "ko",
    translateJs: "korean",
    flag: "/flags/kr.svg",
    label: "한국어",
    shortLabel: "KR",
  },
];

export const BUILTIN_CATEGORIES = [
  {
    id: "general",
    name: "综合",
    slug: "general",
    labels: {
      "zh-CN": "综合",
      en: "General",
      "zh-TW": "綜合",
      ja: "総合",
      ko: "종합",
    },
  },
  {
    id: "tech",
    name: "科技",
    slug: "tech",
    labels: {
      "zh-CN": "科技",
      en: "Tech",
      "zh-TW": "科技",
      ja: "テック",
      ko: "기술",
    },
  },
  {
    id: "finance",
    name: "财经",
    slug: "finance",
    labels: {
      "zh-CN": "财经",
      en: "Finance",
      "zh-TW": "財經",
      ja: "金融",
      ko: "금융",
    },
  },
  {
    id: "life",
    name: "生活",
    slug: "life",
    labels: {
      "zh-CN": "生活",
      en: "Life",
      "zh-TW": "生活",
      ja: "生活",
      ko: "생활",
    },
  },
  {
    id: "games",
    name: "游戏",
    slug: "games",
    labels: {
      "zh-CN": "游戏",
      en: "Games",
      "zh-TW": "遊戲",
      ja: "ゲーム",
      ko: "게임",
    },
  },
  {
    id: "community",
    name: "社区",
    slug: "community",
    labels: {
      "zh-CN": "社区",
      en: "Community",
      "zh-TW": "社群",
      ja: "コミュニティ",
      ko: "커뮤니티",
    },
  },
  {
    id: "ai",
    name: "AI",
    slug: "ai",
    labels: {
      "zh-CN": "AI",
      en: "AI",
      "zh-TW": "AI",
      ja: "AI",
      ko: "AI",
    },
  },
];

export const LOCALE_STORAGE_KEY = "dailyhot:locale";
