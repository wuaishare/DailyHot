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
    description:
      "聚合红包、优惠券、外卖/闪购券、打车券、免单赠品与免费额度，优先展示当前仍值得行动的高信噪消费福利。",
    highlights: "来源精选",
    feedTitle: "实时机会",
    method:
      "排序综合来源可信度、时效与行动信号；不同平台原始热度不直接横向比较。",
    degraded: "部分来源暂时不可用，当前仍展示其余来源的最新机会。",
    empty: "当前筛选暂无机会",
    open: "查看机会",
    all: "全部",
    intents: {
      free: "免费 / 限免",
      red_packet: "红包",
      coupon: "优惠券",
      delivery: "外卖 / 闪购券",
      ride: "打车券",
      giveaway: "抽奖 / 赠送",
      ai: "AI 额度",
      deal: "其它优惠",
    },
    seoTitle: "实时羊毛专题 - 红包、优惠券、外卖闪购券与打车券 | 吾爱热榜",
    seoDescription:
      "实时羊毛专题聚合超级线报、豆瓣、0818团与 NodeLoc 等高时效消费福利，覆盖红包、优惠券、外卖/闪购券、打车券、免单赠品、抽奖与免费额度。",
    seoKeywords:
      "羊毛专题,实时羊毛,红包,优惠券,外卖券,闪购券,打车券,免单,免费福利,抽奖,免费额度,超级线报,豆瓣羊毛,豆瓣宠物羊毛,0818团,NodeLoc",
  },
  en: {
    eyebrow: "Live Opportunities",
    title: "Deals worth claiming right now",
    description:
      "A high-signal feed of red packets, coupons, delivery and instant-retail vouchers, ride coupons, freebies, giveaways and free AI credits.",
    highlights: "Source Highlights",
    feedTitle: "Live Opportunities",
    method:
      "Ranking combines source reliability, freshness and action signals; raw popularity values across platforms are not compared directly.",
    degraded:
      "Some sources are temporarily unavailable. Latest opportunities from the remaining sources are still shown.",
    empty: "No opportunities match this filter right now.",
    open: "View offer",
    all: "All",
    intents: {
      free: "Free / Limited",
      red_packet: "Red Packets",
      coupon: "Coupons",
      delivery: "Delivery / Instant Retail",
      ride: "Ride Coupons",
      giveaway: "Giveaways",
      ai: "AI Credits",
      deal: "Other Deals",
    },
    seoTitle:
      "Live Deals & Freebies - Red Packets, Coupons, Delivery & Ride Vouchers | DailyHot",
    seoDescription:
      "Live consumer deals from Super Deals, Douban, 0818 and NodeLoc, covering red packets, coupons, delivery and instant-retail vouchers, ride coupons, freebies, giveaways and AI credits.",
    seoKeywords:
      "live deals,red packets,coupons,delivery vouchers,instant retail vouchers,ride coupons,freebies,giveaways,free AI credits,Super Deals,Douban,0818,NodeLoc,DailyHot",
  },
  "zh-TW": {
    eyebrow: "即時機會",
    title: "現在值得馬上領、搶、用的優惠",
    description:
      "彙整紅包、優惠券、外賣/閃購券、叫車券、免單贈品與免費額度，優先顯示目前仍值得行動的高訊噪消費優惠。",
    highlights: "來源精選",
    feedTitle: "即時機會",
    method:
      "排序綜合來源可信度、時效與行動訊號；不同平台原始熱度不直接橫向比較。",
    degraded: "部分來源暫時無法使用，目前仍顯示其他來源的最新機會。",
    empty: "目前篩選沒有可用機會",
    open: "查看機會",
    all: "全部",
    intents: {
      free: "免費 / 限免",
      red_packet: "紅包",
      coupon: "優惠券",
      delivery: "外賣 / 閃購券",
      ride: "叫車券",
      giveaway: "抽獎 / 贈送",
      ai: "AI 額度",
      deal: "其他優惠",
    },
    seoTitle: "即時優惠專題 - 紅包、優惠券、外賣閃購券與叫車券 | 吾愛熱榜",
    seoDescription:
      "即時優惠專題彙整超級線報、豆瓣、0818團與 NodeLoc 等高時效消費福利，涵蓋紅包、優惠券、外賣/閃購券、叫車券、免單贈品、抽獎與免費額度。",
    seoKeywords:
      "即時優惠,紅包,優惠券,外賣券,閃購券,叫車券,免單,免費福利,抽獎,免費額度,超級線報,豆瓣優惠,0818團,NodeLoc,吾愛熱榜",
  },
  ja: {
    eyebrow: "リアルタイム特典",
    title: "今すぐ受け取りたいお得情報",
    description:
      "紅包、クーポン、デリバリー/即時小売クーポン、配車クーポン、無料特典、抽選、無料AIクレジットをまとめ、今すぐ使う価値のある情報を優先します。",
    highlights: "情報源ピックアップ",
    feedTitle: "リアルタイム特典",
    method:
      "情報源の信頼度・新しさ・行動シグナルで順位付けし、異なるプラットフォームの生の人気値は直接比較しません。",
    degraded:
      "一部の情報源が一時利用できません。利用可能な情報源の最新情報を表示しています。",
    empty: "この条件に一致する情報はありません",
    open: "詳細を見る",
    all: "すべて",
    intents: {
      free: "無料 / 期間限定",
      red_packet: "紅包",
      coupon: "クーポン",
      delivery: "デリバリー / 即時小売",
      ride: "配車クーポン",
      giveaway: "抽選 / プレゼント",
      ai: "AIクレジット",
      deal: "その他",
    },
    seoTitle:
      "リアルタイムお得情報 - 紅包・クーポン・デリバリー・配車特典 | DailyHot",
    seoDescription:
      "Super Deals、Douban、0818、NodeLoc などから、紅包、クーポン、デリバリー/即時小売、配車、無料特典、抽選、AIクレジットをまとめます。",
    seoKeywords:
      "お得情報,紅包,クーポン,デリバリークーポン,即時小売,配車クーポン,無料特典,抽選,AIクレジット,Douban,0818,NodeLoc,DailyHot",
  },
  ko: {
    eyebrow: "실시간 혜택",
    title: "지금 바로 챙길 만한 혜택",
    description:
      "홍바오, 쿠폰, 배달/즉시소매 쿠폰, 택시 쿠폰, 무료 혜택, 경품, 무료 AI 크레딧을 모아 지금 바로 쓸 가치가 높은 정보를 우선합니다.",
    highlights: "출처별 추천",
    feedTitle: "실시간 혜택",
    method:
      "출처 신뢰도, 최신성, 행동 신호를 함께 반영하며 플랫폼 간 원시 인기 수치를 직접 비교하지 않습니다.",
    degraded:
      "일부 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 혜택을 계속 표시합니다.",
    empty: "현재 조건에 맞는 혜택이 없습니다",
    open: "혜택 보기",
    all: "전체",
    intents: {
      free: "무료 / 한정",
      red_packet: "홍바오",
      coupon: "쿠폰",
      delivery: "배달 / 즉시소매",
      ride: "택시 쿠폰",
      giveaway: "경품 / 증정",
      ai: "AI 크레딧",
      deal: "기타 혜택",
    },
    seoTitle: "실시간 혜택 - 홍바오·쿠폰·배달·택시 혜택 | DailyHot",
    seoDescription:
      "Super Deals, Douban, 0818, NodeLoc 등의 홍바오, 쿠폰, 배달/즉시소매 쿠폰, 택시 쿠폰, 무료 혜택, 경품, AI 크레딧을 한곳에서 확인합니다.",
    seoKeywords:
      "실시간 혜택,홍바오,쿠폰,배달 쿠폰,즉시소매,택시 쿠폰,무료 혜택,경품,AI 크레딧,Douban,0818,NodeLoc,DailyHot",
  },
};

export const GAME_DEALS_TOPIC_METADATA = {
  "zh-CN": {
    title: "实时游戏优惠与史低",
    description:
      "聚合 Steam、Epic、GOG、小黑盒、GG.deals 与 IT之家喜加一，优先展示免费领取、新史低、史低、90%+ 高折扣和 30 元以内的高价值游戏机会。",
    feedTitle: "游戏优惠雷达",
    open: "查看游戏优惠",
    empty: "当前筛选暂无游戏优惠",
    seoTitle: "实时游戏优惠与史低 - Steam 特惠、Epic 免费游戏 | 吾爱热榜",
    seoDescription:
      "实时聚合 Steam 特惠、Epic 免费游戏、GOG 折扣、小黑盒史低、GG.deals 与 IT之家喜加一，追踪免费领取、新史低、90%+ 折扣和 10/30 元低价游戏。",
    seoKeywords:
      "游戏优惠,游戏史低,Steam特惠,Epic免费游戏,GOG游戏折扣,小黑盒游戏折扣,GG.deals,喜加一,90%折扣,10元游戏,30元游戏,限时免费",
  },
  en: {
    title: "Live Game Deals & Historical Lows",
    description:
      "Track Steam, Epic, GOG, Xiaoheihe, GG.deals and ITHome for free games, new historical lows, 90%+ discounts and high-value games under CNY 30.",
    feedTitle: "Game Deal Radar",
    open: "View game deals",
    empty: "No game deals match this filter.",
    seoTitle:
      "Live Game Deals & Historical Lows - Steam Sales, Epic Free Games | DailyHot",
    seoDescription:
      "Track Steam sales, Epic free games, GOG deals, Xiaoheihe historical lows, GG.deals and ITHome for free games, deep discounts and low-price offers.",
    seoKeywords:
      "game deals,historical low,Steam sales,Epic free games,GOG deals,Xiaoheihe,GG.deals,free games,90% discount,cheap PC games,DailyHot",
  },
  "zh-TW": {
    title: "即時遊戲優惠與史低",
    description:
      "彙整 Steam、Epic、GOG、小黑盒、GG.deals 與 IT之家喜加一，優先顯示免費領取、新史低、史低、90%+ 折扣與 30 元以內高價值遊戲。",
    feedTitle: "遊戲優惠雷達",
    open: "查看遊戲優惠",
    empty: "目前篩選沒有遊戲優惠",
    seoTitle: "即時遊戲優惠與史低 - Steam 特惠、Epic 免費遊戲 | 吾愛熱榜",
    seoDescription:
      "即時追蹤 Steam 特惠、Epic 免費遊戲、GOG 折扣、小黑盒史低、GG.deals 與 IT之家喜加一，涵蓋免費、新史低、90%+ 折扣與低價遊戲。",
    seoKeywords:
      "遊戲優惠,遊戲史低,Steam特惠,Epic免費遊戲,GOG遊戲折扣,小黑盒遊戲折扣,GG.deals,喜加一,90%折扣,低價遊戲,吾愛熱榜",
  },
  ja: {
    title: "リアルタイムゲームセール・史上最安",
    description:
      "Steam、Epic、GOG、Xiaoheihe、GG.deals、ITHome を集約し、無料配布、新たな史上最安、90%以上の割引、30元以下の高価値ゲームを優先表示します。",
    feedTitle: "ゲームセールレーダー",
    open: "ゲームセールを見る",
    empty: "条件に一致するゲームセールはありません",
    seoTitle: "ゲームセール・史上最安 - Steamセール、Epic無料ゲーム | DailyHot",
    seoDescription:
      "Steamセール、Epic無料ゲーム、GOGセール、Xiaoheihe史上最安、GG.deals、ITHomeをリアルタイム集約し、無料配布や大幅割引を追跡します。",
    seoKeywords:
      "ゲームセール,史上最安,Steamセール,Epic無料ゲーム,GOGセール,Xiaoheihe,GG.deals,無料配布,90%オフ,格安ゲーム,DailyHot",
  },
  ko: {
    title: "실시간 게임 할인·역대 최저가",
    description:
      "Steam, Epic, GOG, Xiaoheihe, GG.deals, ITHome을 모아 무료 배포, 신규 역대 최저가, 90%+ 할인, 30위안 이하 고가치 게임을 우선 제공합니다.",
    feedTitle: "게임 할인 레이더",
    open: "게임 할인 보기",
    empty: "조건에 맞는 게임 할인이 없습니다",
    seoTitle: "게임 할인·역대 최저가 - Steam 할인, Epic 무료 게임 | DailyHot",
    seoDescription:
      "Steam 할인, Epic 무료 게임, GOG 할인, Xiaoheihe 역대 최저가, GG.deals, ITHome을 실시간으로 모아 무료 배포와 초특가를 추적합니다.",
    seoKeywords:
      "게임 할인,역대 최저가,Steam 할인,Epic 무료 게임,GOG 할인,Xiaoheihe,GG.deals,무료 배포,90% 할인,저가 게임,DailyHot",
  },
};

export const AI_TOPIC_METADATA = {
  "zh-CN": {
    title: "AI 热点与趋势雷达",
    description:
      "聚合 OpenAI、Anthropic、Google DeepMind、Hugging Face、量子位等中外 AI 信号，并结合 GitHub Trending、Hacker News 与 LocalLLaMA，优先呈现今日焦点、模型与产品动态、开发者快速升温项目及独立多源确认。",
    feedTitle: "AI 实时雷达",
    empty: "当前筛选暂无 AI 事件",
    degraded: "部分 AI 来源暂时不可用，当前仍展示其余来源的最新事件。",
    seoTitle: "AI 热点专题 - 大模型发布、AI重大事件与爆火项目 | 吾爱热榜",
    seoDescription:
      "实时聚合 OpenAI、Anthropic、Google DeepMind、Meta AI、Hugging Face、Hacker News、Reddit、Product Hunt 与 GitHub Trending，追踪 AI 重大事件、大模型发布、开发者爆火项目和多源共振趋势。",
    seoKeywords:
      "AI热点,AI重大事件,大模型发布,AI新闻,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,AI爆火项目,AI趋势",
  },
  en: {
    title: "AI Trends & Signal Radar",
    description:
      "Track official AI releases, specialist media, GitHub Trending, Hacker News, LocalLLaMA and other high-signal sources, prioritizing today’s focus, model and product moves, developer momentum and independently confirmed events.",
    feedTitle: "Live AI Radar",
    empty: "No AI events match this filter.",
    degraded:
      "Some AI sources are temporarily unavailable. Events from the remaining sources are still shown.",
    seoTitle:
      "AI Trends - Major Model Releases, AI Events & Breakout Projects | DailyHot",
    seoDescription:
      "Track major AI events, model releases, developer breakouts and cross-source signals across OpenAI, Anthropic, DeepMind, Meta AI, Hugging Face, Hacker News, Reddit, Product Hunt and GitHub Trending.",
    seoKeywords:
      "AI trends,AI news,major AI events,model releases,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,AI projects,DailyHot",
  },
  "zh-TW": {
    title: "AI 熱點與趨勢雷達",
    description:
      "彙整官方 AI 發布、專業媒體、GitHub Trending、Hacker News、LocalLLaMA 等高訊號來源，優先呈現今日焦點、模型與產品動態、開發者熱度與獨立多源確認。",
    feedTitle: "AI 即時雷達",
    empty: "目前篩選沒有 AI 事件",
    degraded: "部分 AI 來源暫時無法使用，目前仍顯示其他來源的最新事件。",
    seoTitle: "AI 熱點專題 - 大模型發布、重大事件與爆紅專案 | 吾愛熱榜",
    seoDescription:
      "即時追蹤 AI 重大事件、大模型發布、開發者爆紅專案與多源共振趨勢。",
    seoKeywords:
      "AI熱點,AI重大事件,大模型發布,AI新聞,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,吾愛熱榜",
  },
  ja: {
    title: "AIトレンド・シグナルレーダー",
    description:
      "AI公式発表、専門メディア、GitHub Trending、Hacker News、LocalLLaMA などの高シグナル情報源を横断し、今日の注目、モデル・製品動向、開発者の熱量、独立した複数ソース確認を優先します。",
    feedTitle: "AIリアルタイムレーダー",
    empty: "条件に一致するAIイベントはありません",
    degraded:
      "一部のAI情報源が一時利用できません。利用可能な情報源の最新イベントを表示しています。",
    seoTitle:
      "AIトレンド - 主要モデル公開・重大イベント・急上昇プロジェクト | DailyHot",
    seoDescription:
      "主要AIイベント、モデル公開、開発者コミュニティで急上昇するプロジェクト、複数ソースの共振を追跡します。",
    seoKeywords:
      "AIトレンド,AIニュース,モデル公開,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,DailyHot",
  },
  ko: {
    title: "AI 트렌드·시그널 레이더",
    description:
      "AI 공식 발표, 전문 미디어, GitHub Trending, Hacker News, LocalLLaMA 등 신호가 강한 출처를 모아 오늘의 핵심 이슈, 모델·제품 동향, 개발자 열기와 독립 다중 출처 확인을 우선합니다.",
    feedTitle: "AI 실시간 레이더",
    empty: "현재 조건에 맞는 AI 이벤트가 없습니다",
    degraded:
      "일부 AI 출처를 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 이벤트를 표시합니다.",
    seoTitle: "AI 트렌드 - 주요 모델 출시·AI 사건·급상승 프로젝트 | DailyHot",
    seoDescription:
      "주요 AI 사건, 모델 출시, 개발자 급상승 프로젝트, 독립 다중 출처 신호를 실시간으로 추적합니다.",
    seoKeywords:
      "AI 트렌드,AI 뉴스,모델 출시,OpenAI,Anthropic,Claude,Gemini,DeepSeek,GitHub AI Trending,LocalLLaMA,Hugging Face,DailyHot",
  },
};

export const CHIGUA_TOPIC_METADATA = {
  "zh-CN": {
    title: "全网热议事件雷达",
    description:
      "聚合微博、知乎、抖音、百度、头条、快手、B站与虎扑公开热榜，将同一事件跨平台合并，优先展示多平台共同升温的高价值热点。",
    feedTitle: "实时热议",
    empty: "当前筛选暂无热议事件",
    degraded: "部分平台暂时不可用，当前仍展示其余平台的最新热议事件。",
    seoTitle: "吃瓜热榜 - 全网热议事件与多平台热点共振 | 吾爱热榜",
    seoDescription:
      "聚合微博热搜、知乎热榜、抖音热点、百度热搜、今日头条、快手、B站与虎扑，将同一热点跨平台聚类，快速发现全网共同升温的热议事件。",
    seoKeywords:
      "吃瓜热榜,全网热点,热议事件,微博热搜,知乎热榜,抖音热点,百度热搜,今日头条,快手热榜,B站热榜,虎扑热帖,多平台热点",
  },
  en: {
    title: "Cross-platform Hot Event Radar",
    description:
      "Cluster public trending lists from Weibo, Zhihu, Douyin, Baidu, Toutiao, Kuaishou, Bilibili and Hupu, prioritizing events gaining attention across multiple platforms.",
    feedTitle: "Live Hot Events",
    empty: "No hot events match this filter.",
    degraded:
      "Some platforms are temporarily unavailable. Events from the remaining sources are still shown.",
    seoTitle: "Hot Event Radar - Cross-platform Trending Topics | DailyHot",
    seoDescription:
      "Track and cluster trending topics from major Chinese platforms to identify events gaining attention across multiple sources.",
    seoKeywords:
      "hot events,trending topics,Weibo,Zhihu,Douyin,Baidu,Toutiao,Kuaishou,Bilibili,Hupu,cross-platform trends,DailyHot",
  },
  "zh-TW": {
    title: "全網熱議事件雷達",
    description:
      "彙整微博、知乎、抖音、百度、頭條、快手、B站與虎撲公開熱榜，將同一事件跨平台合併，優先顯示多平台共同升溫的熱門事件。",
    feedTitle: "即時熱議",
    empty: "目前篩選沒有熱議事件",
    degraded: "部分平台暫時無法使用，目前仍顯示其他平台的最新熱議事件。",
    seoTitle: "全網熱議事件 - 多平台熱門話題共振 | 吾愛熱榜",
    seoDescription:
      "彙整微博、知乎、抖音、百度、頭條、快手、B站與虎撲熱榜，跨平台聚類同一事件。",
    seoKeywords:
      "全網熱議,熱門事件,微博熱搜,知乎熱榜,抖音熱點,百度熱搜,多平台熱榜,吾愛熱榜",
  },
  ja: {
    title: "クロスプラットフォーム話題レーダー",
    description:
      "Weibo、Zhihu、Douyin、Baidu、Toutiao、Kuaishou、Bilibili、Hupu の公開ランキングをまとめ、同じ出来事を横断的に統合します。",
    feedTitle: "リアルタイム話題",
    empty: "条件に一致する話題はありません",
    degraded:
      "一部プラットフォームが一時利用できません。利用可能な情報源の話題を表示しています。",
    seoTitle: "話題レーダー - 中国主要プラットフォームのトレンド | DailyHot",
    seoDescription:
      "中国主要プラットフォームのトレンドを横断集約し、複数サービスで同時に盛り上がる出来事を追跡します。",
    seoKeywords:
      "トレンド,話題,Weibo,Zhihu,Douyin,Baidu,Bilibili,中国SNS,DailyHot",
  },
  ko: {
    title: "플랫폼 통합 화제 레이더",
    description:
      "Weibo, Zhihu, Douyin, Baidu, Toutiao, Kuaishou, Bilibili, Hupu 공개 인기 목록을 묶어 같은 사건을 통합하고 여러 플랫폼에서 동시에 뜨는 이슈를 우선합니다.",
    feedTitle: "실시간 화제",
    empty: "현재 조건에 맞는 화제가 없습니다",
    degraded:
      "일부 플랫폼을 일시적으로 사용할 수 없습니다. 나머지 출처의 최신 화제를 표시합니다.",
    seoTitle: "화제 레이더 - 중국 주요 플랫폼 실시간 트렌드 | DailyHot",
    seoDescription:
      "중국 주요 플랫폼의 인기 주제를 묶어 여러 서비스에서 동시에 상승하는 사건을 추적합니다.",
    seoKeywords:
      "실시간 화제,트렌드,Weibo,Zhihu,Douyin,Baidu,Bilibili,중국 SNS,DailyHot",
  },
};
