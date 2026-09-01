import { buildFixedLocalePath, normalizeLocale } from "@/utils/locale";

export const GAME_DEAL_SOURCE_IDS = [
  "ithome-xijiayi",
  "steam-deals",
  "epic-free-games",
  "xiaoheihe-deals",
  "ggdeals",
  "gog-deals",
];

export const TOPIC_REGISTRY = [
  {
    id: "chigua",
    path: "/topic/chigua",
    routeNames: ["chigua-topic", "chigua-topic-locale"],
    labels: {
      "zh-CN": "吃瓜",
      en: "Hot Events",
      "zh-TW": "熱議",
      ja: "話題",
      ko: "화제",
    },
  },
  {
    id: "wool",
    path: "/topic/wool",
    routeNames: ["wool-topic", "wool-topic-locale"],
    labels: {
      "zh-CN": "羊毛",
      en: "Deals",
      "zh-TW": "優惠",
      ja: "お得情報",
      ko: "혜택",
    },
  },
  {
    id: "game-deals",
    path: "/topic/game-deals",
    routeNames: ["game-deals-topic", "game-deals-topic-locale"],
    labels: {
      "zh-CN": "游戏折扣",
      en: "Game Deals",
      "zh-TW": "遊戲折扣",
      ja: "ゲームセール",
      ko: "게임 할인",
    },
  },
];
export const TOPIC_NAV_LABELS = {
  "zh-CN": "专题",
  en: "Topics",
  "zh-TW": "專題",
  ja: "特集",
  ko: "주제",
};

export const getTopicLabel = (topic, locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  return topic?.labels?.[normalizedLocale] || topic?.labels?.["zh-CN"] || "";
};

export const getTopicNavLabel = (locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  return TOPIC_NAV_LABELS[normalizedLocale] || TOPIC_NAV_LABELS["zh-CN"];
};

export const buildTopicPath = (topic, locale = "zh-CN") =>
  buildFixedLocalePath(locale, topic?.path || "/topic/wool");

export const getTopicByRouteName = (routeName) =>
  TOPIC_REGISTRY.find((topic) => topic.routeNames.includes(routeName)) || null;
