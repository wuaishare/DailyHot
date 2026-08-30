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
    id: "wool",
    name: "羊毛",
    slug: "wool",
    labels: {
      "zh-CN": "羊毛",
      en: "Deals",
      "zh-TW": "優惠",
      ja: "お得",
      ko: "혜택",
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

export const WOOL_TOPIC_METADATA = {
  "zh-CN": {
    eyebrow: "实时机会",
    title: "现在值得马上领、抢、用的羊毛",
    description: "聚合优惠券、限免、抽奖、免费额度和游戏免费领取，优先展示当前仍值得行动的高信噪机会。",
    highlights: "来源精选",
    feedTitle: "实时机会",
    method: "排序综合来源可信度、时效与行动信号；不同平台原始热度不直接横向比较。",
    degraded: "部分来源暂时不可用，当前仍展示其余来源的最新机会。",
    empty: "当前筛选暂无机会",
    open: "查看机会",
    all: "全部",
    intents: { free: "免费 / 限免", coupon: "优惠券", giveaway: "抽奖 / 赠送", ai: "AI 额度", game: "游戏限免", deal: "其它优惠" },
    seoTitle: "实时羊毛专题 - 限免、优惠券、抽奖与免费额度 | 吾爱热榜",
    seoDescription: "实时羊毛专题聚合超级线报、0818团、NodeLoc 与 IT之家喜加一的高时效福利，覆盖限免、优惠券、抽奖、免费额度与游戏免费领取。",
    seoKeywords: "羊毛专题,实时羊毛,优惠券,限免,免费福利,抽奖,免费额度,超级线报,0818团,NodeLoc,喜加一",
  },
  en: {
    eyebrow: "Live Opportunities", title: "Deals worth claiming right now", description: "A high-signal feed of coupons, freebies, giveaways, free AI credits and free games that are still worth acting on.", highlights: "Source Highlights", feedTitle: "Live Opportunities", method: "Ranking combines source reliability, freshness and action signals; raw popularity values across platforms are not compared directly.", degraded: "Some sources are temporarily unavailable. Latest opportunities from the remaining sources are still shown.", empty: "No opportunities match this filter right now.", open: "View offer", all: "All", intents: { free: "Free / Limited", coupon: "Coupons", giveaway: "Giveaways", ai: "AI Credits", game: "Free Games", deal: "Other Deals" }, seoTitle: "Live Deals & Freebies - Coupons, Giveaways and Free AI Credits | DailyHot", seoDescription: "Live deals from Super Deals, 0818, NodeLoc and ITHome, covering coupons, freebies, giveaways, free AI credits and free games.", seoKeywords: "live deals,freebies,coupons,giveaways,free AI credits,free games,Super Deals,0818,NodeLoc,DailyHot",
  },
  "zh-TW": {
    eyebrow: "即時機會", title: "現在值得馬上領、搶、用的優惠", description: "彙整優惠券、限免、抽獎、免費額度與遊戲免費領取，優先顯示目前仍值得行動的高訊噪機會。", highlights: "來源精選", feedTitle: "即時機會", method: "排序綜合來源可信度、時效與行動訊號；不同平台原始熱度不直接橫向比較。", degraded: "部分來源暫時無法使用，目前仍顯示其他來源的最新機會。", empty: "目前篩選沒有可用機會", open: "查看機會", all: "全部", intents: { free: "免費 / 限免", coupon: "優惠券", giveaway: "抽獎 / 贈送", ai: "AI 額度", game: "遊戲限免", deal: "其他優惠" }, seoTitle: "即時優惠專題 - 限免、優惠券、抽獎與免費額度 | 吾愛熱榜", seoDescription: "即時優惠專題彙整超級線報、0818團、NodeLoc 與 IT之家喜加一的高時效福利。", seoKeywords: "即時優惠,限免,優惠券,抽獎,免費額度,超級線報,0818團,NodeLoc,喜加一,吾愛熱榜",
  },
  ja: {
    eyebrow: "リアルタイム特典", title: "今すぐ受け取りたいお得情報", description: "クーポン、無料配布、抽選、無料AIクレジット、無料ゲームをまとめ、今すぐ行動する価値のある情報を優先します。", highlights: "情報源ピックアップ", feedTitle: "リアルタイム特典", method: "情報源の信頼度・新しさ・行動シグナルで順位付けし、異なるプラットフォームの生の人気値は直接比較しません。", degraded: "一部の情報源が一時利用できません。利用可能な情報源の最新情報を表示しています。", empty: "この条件に一致する情報はありません", open: "詳細を見る", all: "すべて", intents: { free: "無料 / 期間限定", coupon: "クーポン", giveaway: "抽選 / プレゼント", ai: "AIクレジット", game: "無料ゲーム", deal: "その他" }, seoTitle: "リアルタイムお得情報 - 無料配布・クーポン・抽選・AIクレジット | DailyHot", seoDescription: "スーパーお得情報、0818、NodeLoc、ITHomeから高鮮度のお得情報をまとめます。", seoKeywords: "お得情報,無料配布,クーポン,抽選,AIクレジット,無料ゲーム,0818,NodeLoc,DailyHot",
  },
  ko: {
    eyebrow: "실시간 혜택", title: "지금 바로 챙길 만한 혜택", description: "쿠폰, 무료 배포, 경품, 무료 AI 크레딧, 무료 게임을 모아 지금 행동할 가치가 높은 정보를 우선합니다.", highlights: "출처별 추천", feedTitle: "실시간 혜택", method: "출처 신뢰도, 최신성, 행동 신호를 함께 반영하며 플랫폼 간 원시 인기 수치를 직접 비교하지 않습니다.", degraded: "일부 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 혜택을 계속 표시합니다.", empty: "현재 조건에 맞는 혜택이 없습니다", open: "혜택 보기", all: "전체", intents: { free: "무료 / 한정", coupon: "쿠폰", giveaway: "경품 / 증정", ai: "AI 크레딧", game: "무료 게임", deal: "기타 혜택" }, seoTitle: "실시간 혜택 - 무료 배포·쿠폰·경품·AI 크레딧 | DailyHot", seoDescription: "Super Deals, 0818, NodeLoc, ITHome의 최신 쿠폰, 무료 배포, 경품, AI 크레딧, 무료 게임을 한곳에서 확인합니다.", seoKeywords: "실시간 혜택,무료 배포,쿠폰,경품,AI 크레딧,무료 게임,0818,NodeLoc,DailyHot",
  },
};
