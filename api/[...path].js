export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

const readBody = async (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data || undefined));
    req.on("error", reject);
  });
};

const GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE = {
  "zh-CN": "zh-CN",
  en: "en",
  "zh-TW": "zh-TW",
  ja: "ja",
  ko: "ko",
};
const PROTECTED_TERM_PATTERN =
  /\b(?:GPT(?:-\d+(?:\.\d+)*)?|ChatGPT|Claude|Sonnet|Opus|Haiku|Fable|Mythos|Gemini|Gemma|DiffusionGemma|GLM|Llama|Grok|Qwen|DeepSeek|Mistral|Mixtral|Kimi|ERNIE|Hunyuan|Doubao|Yi|Phi|Command|Aya|Cohere|Anthropic|OpenAI|DeepMind|Hugging Face|OpenRouter|xAI|DALL[·-]E|Sora|Codex|Copilot|JDK)(?:\s+\d+(?:\.\d+)*)?|\b(?:AI|AGI|API|MCP|LLM)\b/g;
const READABLE_TRANSLATE_TIMEOUT_MS = 6000;
const READABLE_TRANSLATE_CONCURRENCY = 4;
const READABLE_TRANSLATE_MAX_TEXTS = 50;
const READABLE_TRANSLATE_MAX_CHARS = 500;
const PROXY_LOCAL_QUERY_PARAMS = new Set([
  "path",
  "verify",
  "browserVerify",
]);
const IMAGE_PROXY_ALLOWED_HOST_SUFFIXES = ["doubanio.com"];
const IMAGE_PROXY_MAX_BYTES = 8 * 1024 * 1024;
const IMAGE_PROXY_TIMEOUT_MS = 15000;
const PUBLIC_API_DEFAULT_FALLBACK_BASE_URL = "https://hotapi2.wuaishare.cn";
const PUBLIC_API_FALLBACK_BASE_URL =
  process.env.INTERNAL_API_FALLBACK_BASE_URL || PUBLIC_API_DEFAULT_FALLBACK_BASE_URL;
const PUBLIC_API_FALLBACK_PATHS = new Set([
  "artificialanalysis",
  "bilibili",
  "clawhub",
  "ithome",
  "openrouter-rankings",
  "weibo",
]);
const API_SUBTYPE_PATH_SOURCES = new Set([
  "artificialanalysis",
  "bilibili",
  "clawhub",
  "designarena",
  "ithome",
  "openrouter-rankings",
]);
const WEIBO_HOT_BAND_URL = "https://weibo.com/ajax/statuses/hot_band";
const WEIBO_WEB_BASE_URL = "https://weibo.com";
const WEIBO_SEARCH_BASE_URL = "https://s.weibo.com/weibo";
const WEIBO_CACHE_TTL_MS = 60 * 1000;
const WEIBO_DIRECT_FETCH_TIMEOUT_MS = 6000;
const WEIBO_ZHISOU_URL = "https://ai.s.weibo.com/api/wis/show.json";
const WEIBO_ZHISOU_CACHE_TTL_MS = 30 * 60 * 1000;
const WEIBO_ZHISOU_TIMEOUT_MS = 4500;
const WEIBO_ZHISOU_ENRICH_LIMIT = 5;
const WEIBO_ZHISOU_SUMMARY_MAX_LENGTH = 150;
const WEIBO_COMMON_HEADERS = {
  Accept: "application/json",
  Referer: `${WEIBO_WEB_BASE_URL}/hot/search`,
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 DailyHot/1.0",
};
const BILIBILI_API_BASE_URL = "https://api.bilibili.com";
const BILIBILI_WEB_BASE_URL = "https://www.bilibili.com";
const BILIBILI_RANK_REFERER = `${BILIBILI_WEB_BASE_URL}/v/popular/rank/all`;
const BILIBILI_TYPE_LABELS = {
  all: "综合热门",
  weekly: "每周必看",
  history: "入站必刷",
  rank: "排行榜",
  music: "全站音乐榜",
};
const BILIBILI_LINKS = {
  all: `${BILIBILI_WEB_BASE_URL}/v/popular/all`,
  weekly: `${BILIBILI_WEB_BASE_URL}/v/popular/weekly/`,
  history: `${BILIBILI_WEB_BASE_URL}/v/popular/history`,
  rank: `${BILIBILI_WEB_BASE_URL}/v/popular/rank/all`,
  music: `${BILIBILI_WEB_BASE_URL}/v/popular/music`,
};
const BILIBILI_COMMON_HEADERS = {
  Accept: "application/json",
  Referer: `${BILIBILI_WEB_BASE_URL}/`,
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 DailyHot/1.0",
  Cookie: "buvid3=00000000-0000-4000-8000-000000000000infoc",
};
const BILIBILI_DIRECT_FETCH_ATTEMPTS = 3;
const ITHOME_XCVTS_URL = "https://api.xcvts.cn/api/hotlist/ithome";
const ITHOME_OFFICIAL_RANK_URL = "https://m.ithome.com/rankm/";
const ITHOME_DIRECT_FETCH_TIMEOUT_MS = 6000;
const ITHOME_TYPE_LABELS = {
  day: "日榜",
  week: "周榜",
  comments: "热评榜",
  month: "月榜",
  hot: "资讯热榜",
  list: "滚动新闻",
};
const ITHOME_OFFICIAL_RANK_TYPES = {
  day: "day-rank",
  week: "week-rank",
  comments: "hot-comment-rank",
  month: "month-rank",
};
const ITHOME_CACHE_TTL_MS = 10 * 60 * 1000;
const DESIGNARENA_LEADERBOARD_URL =
  "https://www.designarena.ai/api/leaderboard";
const DESIGNARENA_JUDGE_SCORES_URL =
  "https://www.designarena.ai/api/leaderboard/judge-scores";
const DESIGNARENA_BASE_URL = "https://www.designarena.ai";
const DESIGNARENA_LEADERBOARD_TYPES = {
  fullstack: {
    title: "Agentic 全栈应用模型榜",
    category: "fullstack",
    arenaType: "agents",
    href: "/leaderboard/fullstack",
    metric: "elo",
    description: "DesignArena Agentic 全栈应用生成与后端能力模型排行",
  },
  "fullstack-win-rate": {
    title: "Agentic 全栈应用胜率榜",
    category: "fullstack",
    arenaType: "agents",
    href: "/leaderboard/fullstack",
    metric: "winRate",
    description: "DesignArena Agentic 全栈应用生成模型胜率排行",
  },
  agon_webapps: {
    title: "Agentic Frontend 模型榜",
    category: "agon_webapps",
    arenaType: "agents",
    href: "/leaderboard/webapps",
    metric: "elo",
    inputModality: "text",
    description: "DesignArena Agentic Frontend WebDev 模型排行榜",
  },
  "agon_webapps-win-rate": {
    title: "Agentic Frontend 胜率榜",
    category: "agon_webapps",
    arenaType: "agents",
    href: "/leaderboard/webapps",
    metric: "winRate",
    inputModality: "text",
    description: "DesignArena Agentic Frontend WebDev 模型胜率排行",
  },
  mobileapps: {
    title: "移动 App 模型榜",
    category: "mobileapps",
    arenaType: "agents",
    href: "/leaderboard/mobileapps",
    metric: "elo",
    description: "DesignArena 移动 App 生成与移动开发模型排行",
  },
  nativeapps: {
    title: "原生 App 模型榜",
    category: "nativeapps",
    arenaType: "agents",
    href: "/leaderboard/android",
    metric: "elo",
    description: "DesignArena 原生 App 生成与端侧应用开发模型排行",
  },
  agentic_gamedev: {
    title: "Agentic 游戏开发模型榜",
    category: "agentic_gamedev",
    arenaType: "agents",
    href: "/leaderboard/agentic-game-dev",
    metric: "elo",
    description: "DesignArena Agentic 游戏开发模型排行",
  },
  website: {
    title: "Website 模型榜",
    category: "website",
    arenaType: "models",
    href: "/leaderboard",
    metric: "elo",
    description: "DesignArena 网站生成与前端设计模型排行",
  },
  "website-win-rate": {
    title: "Website 胜率榜",
    category: "website",
    arenaType: "models",
    href: "/leaderboard",
    metric: "winRate",
    description: "DesignArena 网站生成与前端设计模型胜率排行",
  },
  uicomponent: {
    title: "UI Component 模型榜",
    category: "uicomponent",
    arenaType: "models",
    href: "/leaderboard",
    metric: "elo",
    description: "DesignArena UI 组件生成与界面设计模型排行",
  },
  dataviz: {
    title: "Data Visualization 模型榜",
    category: "dataviz",
    arenaType: "models",
    href: "/leaderboard",
    metric: "elo",
    description: "DesignArena 数据可视化与图表生成模型排行",
  },
  gamedev: {
    title: "Game Dev 模型榜",
    category: "gamedev",
    arenaType: "models",
    href: "/leaderboard/game-dev",
    metric: "elo",
    description: "DesignArena 游戏开发与互动场景生成模型排行",
  },
  "3d": {
    title: "3D Design 模型榜",
    category: "3d",
    arenaType: "models",
    href: "/leaderboard",
    metric: "elo",
    description: "DesignArena 3D 设计与空间生成模型排行",
  },
  svg: {
    title: "SVG 模型榜",
    category: "svg",
    arenaType: "models",
    href: "/leaderboard/svgs",
    metric: "elo",
    description: "DesignArena SVG 生成与矢量设计模型排行",
  },
  ascii: {
    title: "ASCII Art 模型榜",
    category: "ascii",
    arenaType: "models",
    href: "/leaderboard/ascii",
    metric: "elo",
    description: "DesignArena ASCII Art 生成模型排行",
  },
  agon_slides: {
    title: "Agentic Slides 模型榜",
    category: "agon_slides",
    arenaType: "agents",
    href: "/leaderboard/agentic-slides",
    metric: "elo",
    description: "DesignArena Agentic 演示文稿生成模型排行",
  },
  agon_slides_html: {
    title: "Agentic HTML Slides 模型榜",
    category: "agon_slides_html",
    arenaType: "agents",
    href: "/leaderboard/agentic-html-slides",
    metric: "elo",
    description: "DesignArena Agentic HTML 演示文稿生成模型排行",
  },
  slides: {
    title: "Slides 模型榜",
    category: "slides",
    arenaType: "models",
    href: "/leaderboard/slides",
    metric: "elo",
    description: "DesignArena 演示文稿与幻灯片生成模型排行",
  },
  image: {
    title: "Image Generation 模型榜",
    category: "image",
    arenaType: "models",
    href: "/leaderboard/image",
    metric: "elo",
    description: "DesignArena 图像生成与视觉创作模型排行",
  },
  imagetoimage: {
    title: "Image Editing 模型榜",
    category: "imagetoimage",
    arenaType: "models",
    href: "/leaderboard/image-to-image",
    metric: "elo",
    description: "DesignArena 图像编辑与图生图模型排行",
  },
  graphicdesign: {
    title: "Graphic Design 模型榜",
    category: "graphicdesign",
    arenaType: "models",
    href: "/leaderboard/graphic-design",
    metric: "elo",
    description: "DesignArena 平面设计与视觉创意模型排行",
  },
  logo: {
    title: "Logo 模型榜",
    category: "logo",
    arenaType: "models",
    href: "/leaderboard/logos",
    metric: "elo",
    description: "DesignArena Logo 生成与品牌视觉模型排行",
  },
  video: {
    title: "Video 模型榜",
    category: "video",
    arenaType: "models",
    href: "/leaderboard/video",
    metric: "elo",
    description: "DesignArena 视频生成与动态内容创作模型排行",
  },
  videotovideo: {
    title: "Video Editing 模型榜",
    category: "videotovideo",
    arenaType: "models",
    href: "/leaderboard/video-to-video",
    metric: "elo",
    description: "DesignArena 视频编辑与视频到视频模型排行",
  },
  imagetovideo: {
    title: "Image to Video 模型榜",
    category: "imagetovideo",
    arenaType: "models",
    href: "/leaderboard/image-to-video",
    metric: "elo",
    description: "DesignArena 图像转视频模型排行",
  },
  multitovideo: {
    title: "Multi to Video 模型榜",
    category: "multitovideo",
    arenaType: "models",
    href: "/leaderboard/multi-to-video",
    metric: "elo",
    description: "DesignArena 多输入视频生成模型排行",
  },
  multimodaltovideo: {
    title: "Multimodal to Video 模型榜",
    category: "multimodaltovideo",
    arenaType: "models",
    href: "/leaderboard/multimodal-to-video",
    metric: "elo",
    description: "DesignArena 多模态视频生成模型排行",
  },
  tts: {
    title: "TTS 模型榜",
    category: "tts",
    arenaType: "models",
    href: "/leaderboard/tts",
    metric: "elo",
    description: "DesignArena 文本转语音模型排行",
  },
  builders: {
    title: "AI Builder 榜",
    category: "website",
    arenaType: "builders",
    href: "/leaderboard/builder",
    metric: "elo",
    description: "DesignArena AI 应用构建器与建站工具排行",
  },
};
const DESIGNARENA_SIGNAL_TYPES = {
  "fullstack-quality": {
    title: "全栈应用质量榜",
    dataset: "judge_fullstack",
    metric: "avg_composite",
    description: "DesignArena 全栈应用质量综合评分榜",
    descBuilder: (item, value, labels) =>
      `${labels.composite} ${formatNumber(value, 2)} · ${labels.samples} ${formatInteger(item.scored_generations)}`,
  },
  "fullstack-backend": {
    title: "后端能力评分榜",
    dataset: "judge_fullstack",
    metric: "backendScore",
    description: "DesignArena 全栈应用后端能力评分榜",
    descBuilder: (item, value, labels) =>
      `${labels.backend} ${formatNumber(value, 2)} · API ${formatNumber(item.avg_api_functionality, 2)} · ${labels.auth} ${formatNumber(item.avg_auth_implementation, 2)} · ${labels.persistence} ${formatNumber(item.avg_e2e_persistence, 2)}`,
  },
  "real-world-reach": {
    title: "Real-World Reach 榜",
    dataset: "adoption",
    metric: "deviation",
    description: "DesignArena 模型生成应用真实用户触达表现榜",
    descBuilder: (item, value, labels) =>
      `${labels.reachDeviation} ${formatSignedPercent(value)} · ${labels.margin} ±${formatNumber(item.margin, 1)}%`,
  },
  "daily-usage": {
    title: "Daily Usage 榜",
    dataset: "dau_curves",
    metric: "deviation",
    description: "DesignArena 模型生成应用日活用户表现榜",
    descBuilder: (item, value, labels) =>
      `${labels.dailyUsageDeviation} ${formatSignedPercent(value)} · ${labels.margin} ±${formatNumber(item.margin, 1)}%`,
  },
  retention: {
    title: "Returning Users 榜",
    dataset: "retention",
    metric: "deviation",
    description: "DesignArena 模型生成应用回访用户表现榜",
    descBuilder: (item, value, labels) =>
      `${labels.retentionDeviation} ${formatSignedPercent(value)} · ${labels.returnRate} ${item.rate || 0}% · ${labels.margin} ±${formatNumber(item.margin, 1)}%`,
  },
  downloads: {
    title: "App Downloads 榜",
    dataset: "arena_downloads",
    metric: "deviation",
    description: "DesignArena 模型生成应用源码下载率表现榜",
    descBuilder: (item, value, labels) =>
      `${labels.downloadsDeviation} ${formatSignedPercent(value)} · ${labels.downloadRate} ${item.rate || 0}% · ${labels.margin} ±${formatNumber(item.margin, 1)}%`,
  },
};
const DESIGNARENA_RESPONSE_LOCALIZATIONS = {
  fullstack: {
    title: {
      "zh-CN": "Agentic 全栈应用模型榜",
      "zh-TW": "Agentic 全棧應用模型榜",
      en: "Agentic Full-Stack App Models",
      ja: "Agenticフルスタックアプリモデル",
      ko: "Agentic 풀스택 앱 모델",
    },
    description: {
      "zh-CN": "DesignArena Agentic 全栈应用生成与后端能力模型排行",
      "zh-TW": "DesignArena Agentic 全棧應用生成與後端能力模型排行",
      en: "DesignArena rankings for agentic full-stack app generation and backend capability.",
      ja: "DesignArenaのAgenticフルスタックアプリ生成とバックエンド能力ランキング。",
      ko: "DesignArena Agentic 풀스택 앱 생성 및 백엔드 역량 랭킹.",
    },
  },
  "fullstack-win-rate": {
    title: {
      "zh-CN": "Agentic 全栈应用胜率榜",
      "zh-TW": "Agentic 全棧應用勝率榜",
      en: "Agentic Full-Stack App Win Rate",
      ja: "Agenticフルスタックアプリ勝率",
      ko: "Agentic 풀스택 앱 승률",
    },
    description: {
      "zh-CN": "DesignArena Agentic 全栈应用生成模型胜率排行",
      "zh-TW": "DesignArena Agentic 全棧應用生成模型勝率排行",
      en: "DesignArena win-rate rankings for agentic full-stack app generation models.",
      ja: "DesignArenaのAgenticフルスタックアプリ生成モデル勝率ランキング。",
      ko: "DesignArena Agentic 풀스택 앱 생성 모델 승률 랭킹.",
    },
  },
  agon_webapps: {
    title: {
      "zh-CN": "Agentic 前端模型榜",
      "zh-TW": "Agentic 前端模型榜",
      en: "Agentic Frontend Models",
      ja: "Agenticフロントエンドモデル",
      ko: "Agentic 프론트엔드 모델",
    },
    description: {
      "zh-CN": "DesignArena Agentic 前端 WebDev 模型排行榜",
      "zh-TW": "DesignArena Agentic 前端 WebDev 模型排行榜",
      en: "DesignArena rankings for agentic frontend WebDev models.",
      ja: "DesignArenaのAgenticフロントエンドWebDevモデルランキング。",
      ko: "DesignArena Agentic 프론트엔드 WebDev 모델 랭킹.",
    },
  },
  "agon_webapps-win-rate": {
    title: {
      "zh-CN": "Agentic 前端胜率榜",
      "zh-TW": "Agentic 前端勝率榜",
      en: "Agentic Frontend Win Rate",
      ja: "Agenticフロントエンド勝率",
      ko: "Agentic 프론트엔드 승률",
    },
    description: {
      "zh-CN": "DesignArena Agentic 前端 WebDev 模型胜率排行",
      "zh-TW": "DesignArena Agentic 前端 WebDev 模型勝率排行",
      en: "DesignArena win-rate rankings for agentic frontend WebDev models.",
      ja: "DesignArenaのAgenticフロントエンドWebDevモデル勝率ランキング。",
      ko: "DesignArena Agentic 프론트엔드 WebDev 모델 승률 랭킹.",
    },
  },
  "fullstack-quality": {
    title: {
      "zh-CN": "全栈应用质量榜",
      "zh-TW": "全棧應用品質榜",
      en: "Fullstack App Quality",
      ja: "フルスタックアプリ品質",
      ko: "풀스택 앱 품질",
    },
    description: {
      "zh-CN": "DesignArena 全栈应用质量、数据建模与交互完成度评分排行",
      "zh-TW": "DesignArena 全棧應用品質、資料建模與互動完成度評分排行",
      en: "DesignArena quality rankings for full-stack app output, data modeling, and interaction completeness.",
      ja: "DesignArenaのフルスタックアプリ出力品質、データモデリング、インタラクション完成度ランキング。",
      ko: "DesignArena 풀스택 앱 출력 품질, 데이터 모델링, 상호작용 완성도 랭킹.",
    },
  },
  "fullstack-backend": {
    title: {
      "zh-CN": "后端能力评分榜",
      "zh-TW": "後端能力評分榜",
      en: "Backend Scores",
      ja: "バックエンドスコア",
      ko: "백엔드 점수",
    },
    description: {
      "zh-CN": "DesignArena 全栈应用后端能力、API、认证与持久化评分排行",
      "zh-TW": "DesignArena 全棧應用後端能力、API、認證與持久化評分排行",
      en: "DesignArena backend capability scores for full-stack apps, including APIs, auth, and persistence.",
      ja: "DesignArenaのフルスタックアプリにおけるバックエンド能力、API、認証、永続化スコアランキング。",
      ko: "DesignArena 풀스택 앱의 백엔드 역량, API, 인증, 지속성 점수 랭킹.",
    },
  },
  "real-world-reach": {
    title: {
      "zh-CN": "真实触达榜",
      "zh-TW": "真實觸達榜",
      en: "Real-World Reach",
      ja: "実利用リーチ",
      ko: "실사용 도달",
    },
  },
  "daily-usage": {
    title: {
      "zh-CN": "日活使用榜",
      "zh-TW": "日活使用榜",
      en: "Daily Usage",
      ja: "デイリー利用",
      ko: "일일 사용량",
    },
    description: {
      "zh-CN": "DesignArena 模型生成应用日活用户与真实使用表现排行",
      "zh-TW": "DesignArena 模型生成應用日活使用者與真實使用表現排行",
      en: "DesignArena rankings for daily active usage of model-generated apps.",
      ja: "DesignArenaのモデル生成アプリにおける日次アクティブ利用と実利用パフォーマンスランキング。",
      ko: "DesignArena 모델 생성 앱의 일일 활성 사용과 실제 사용 성과 랭킹.",
    },
  },
  retention: {
    title: {
      "zh-CN": "回访用户榜",
      "zh-TW": "回訪使用者榜",
      en: "Returning Users",
      ja: "リピート利用者",
      ko: "재방문 사용자",
    },
  },
  downloads: {
    title: {
      "zh-CN": "应用下载榜",
      "zh-TW": "應用下載榜",
      en: "App Downloads",
      ja: "アプリダウンロード",
      ko: "앱 다운로드",
    },
  },
  mobileapps: {
    title: {
      "zh-CN": "移动 App 模型榜",
      "zh-TW": "行動 App 模型榜",
      en: "Mobile App Model Rankings",
      ja: "モバイルAppモデルランキング",
      ko: "모바일 앱 모델 랭킹",
    },
  },
  nativeapps: {
    title: {
      "zh-CN": "原生 App 模型榜",
      "zh-TW": "原生 App 模型榜",
      en: "Native App Model Rankings",
      ja: "ネイティブAppモデルランキング",
      ko: "네이티브 앱 모델 랭킹",
    },
  },
  agentic_gamedev: {
    title: {
      "zh-CN": "Agentic 游戏开发模型榜",
      "zh-TW": "Agentic 遊戲開發模型榜",
      en: "Agentic Game Dev Model Rankings",
      ja: "Agenticゲーム開発モデルランキング",
      ko: "Agentic 게임 개발 모델 랭킹",
    },
  },
  website: {
    title: {
      "zh-CN": "网站模型榜",
      "zh-TW": "網站模型榜",
      en: "Website Model Rankings",
      ja: "Webサイトモデルランキング",
      ko: "웹사이트 모델 랭킹",
    },
  },
  "website-win-rate": {
    title: {
      "zh-CN": "网站胜率榜",
      "zh-TW": "網站勝率榜",
      en: "Website Win Rate Rankings",
      ja: "Webサイト勝率ランキング",
      ko: "웹사이트 승률 랭킹",
    },
  },
  uicomponent: {
    title: {
      "zh-CN": "UI 组件模型榜",
      "zh-TW": "UI 元件模型榜",
      en: "UI Component Model Rankings",
      ja: "UIコンポーネントモデルランキング",
      ko: "UI 컴포넌트 모델 랭킹",
    },
  },
  dataviz: {
    title: {
      "zh-CN": "数据可视化模型榜",
      "zh-TW": "資料視覺化模型榜",
      en: "Data Visualization Model Rankings",
      ja: "データ可視化モデルランキング",
      ko: "데이터 시각화 모델 랭킹",
    },
  },
  gamedev: {
    title: {
      "zh-CN": "游戏开发模型榜",
      "zh-TW": "遊戲開發模型榜",
      en: "Game Dev Model Rankings",
      ja: "ゲーム開発モデルランキング",
      ko: "게임 개발 모델 랭킹",
    },
  },
  "3d": {
    title: {
      "zh-CN": "3D 设计模型榜",
      "zh-TW": "3D 設計模型榜",
      en: "3D Design Model Rankings",
      ja: "3Dデザインモデルランキング",
      ko: "3D 디자인 모델 랭킹",
    },
  },
  svg: {
    title: {
      "zh-CN": "SVG 模型榜",
      "zh-TW": "SVG 模型榜",
      en: "SVG Model Rankings",
      ja: "SVGモデルランキング",
      ko: "SVG 모델 랭킹",
    },
  },
  ascii: {
    title: {
      "zh-CN": "ASCII Art 模型榜",
      "zh-TW": "ASCII Art 模型榜",
      en: "ASCII Art Model Rankings",
      ja: "ASCII Artモデルランキング",
      ko: "ASCII Art 모델 랭킹",
    },
  },
  agon_slides: {
    title: {
      "zh-CN": "Agentic 演示文稿模型榜",
      "zh-TW": "Agentic 簡報模型榜",
      en: "Agentic Slides Model Rankings",
      ja: "Agenticスライドモデルランキング",
      ko: "Agentic 슬라이드 모델 랭킹",
    },
  },
  agon_slides_html: {
    title: {
      "zh-CN": "Agentic HTML 演示文稿模型榜",
      "zh-TW": "Agentic HTML 簡報模型榜",
      en: "Agentic HTML Slides Model Rankings",
      ja: "Agentic HTMLスライドモデルランキング",
      ko: "Agentic HTML 슬라이드 모델 랭킹",
    },
  },
  slides: {
    title: {
      "zh-CN": "演示文稿模型榜",
      "zh-TW": "簡報模型榜",
      en: "Slides Model Rankings",
      ja: "スライドモデルランキング",
      ko: "슬라이드 모델 랭킹",
    },
  },
  image: {
    title: {
      "zh-CN": "图像生成模型榜",
      "zh-TW": "圖像生成模型榜",
      en: "Image Generation Model Rankings",
      ja: "画像生成モデルランキング",
      ko: "이미지 생성 모델 랭킹",
    },
  },
  imagetoimage: {
    title: {
      "zh-CN": "图像编辑模型榜",
      "zh-TW": "圖像編輯模型榜",
      en: "Image Editing Model Rankings",
      ja: "画像編集モデルランキング",
      ko: "이미지 편집 모델 랭킹",
    },
  },
  graphicdesign: {
    title: {
      "zh-CN": "平面设计模型榜",
      "zh-TW": "平面設計模型榜",
      en: "Graphic Design Model Rankings",
      ja: "グラフィックデザインモデルランキング",
      ko: "그래픽 디자인 모델 랭킹",
    },
  },
  logo: {
    title: {
      "zh-CN": "Logo 模型榜",
      "zh-TW": "Logo 模型榜",
      en: "Logo Model Rankings",
      ja: "Logoモデルランキング",
      ko: "Logo 모델 랭킹",
    },
  },
  video: {
    title: {
      "zh-CN": "视频生成模型榜",
      "zh-TW": "影片生成模型榜",
      en: "Video Model Rankings",
      ja: "動画生成モデルランキング",
      ko: "비디오 생성 모델 랭킹",
    },
  },
  videotovideo: {
    title: {
      "zh-CN": "视频编辑模型榜",
      "zh-TW": "影片編輯模型榜",
      en: "Video Editing Model Rankings",
      ja: "動画編集モデルランキング",
      ko: "비디오 편집 모델 랭킹",
    },
  },
  imagetovideo: {
    title: {
      "zh-CN": "图像转视频模型榜",
      "zh-TW": "圖像轉影片模型榜",
      en: "Image to Video Model Rankings",
      ja: "画像から動画モデルランキング",
      ko: "이미지 비디오 모델 랭킹",
    },
  },
  multitovideo: {
    title: {
      "zh-CN": "多输入转视频模型榜",
      "zh-TW": "多輸入轉影片模型榜",
      en: "Multi to Video Model Rankings",
      ja: "マルチ入力動画モデルランキング",
      ko: "멀티 입력 비디오 모델 랭킹",
    },
  },
  multimodaltovideo: {
    title: {
      "zh-CN": "多模态转视频模型榜",
      "zh-TW": "多模態轉影片模型榜",
      en: "Multimodal to Video Model Rankings",
      ja: "マルチモーダル動画モデルランキング",
      ko: "멀티모달 비디오 모델 랭킹",
    },
  },
  tts: {
    title: {
      "zh-CN": "TTS 模型榜",
      "zh-TW": "TTS 模型榜",
      en: "TTS Model Rankings",
      ja: "TTSモデルランキング",
      ko: "TTS 모델 랭킹",
    },
  },
  builders: {
    title: {
      "zh-CN": "AI 构建器榜",
      "zh-TW": "AI 建構器榜",
      en: "AI Builder Rankings",
      ja: "AIビルダーランキング",
      ko: "AI 빌더 랭킹",
    },
  },
};
const DESIGNARENA_PARAM_NAME_BY_LOCALE = {
  "zh-CN": "榜单分类",
  "zh-TW": "榜單分類",
  en: "Leaderboard Type",
  ja: "ランキング分類",
  ko: "랭킹 분류",
};
const getGenericDesignArenaDescription = (
  title = "DesignArena",
  locale = "zh-CN",
  fallback = ""
) => {
  if (locale === "zh-CN") return fallback || "DesignArena AI 模型排行榜";
  if (locale === "zh-TW") return `DesignArena ${title}。`;
  if (locale === "ja") return `DesignArenaの${title}。`;
  if (locale === "ko") return `DesignArena ${title}.`;
  return `DesignArena ${title}.`;
};
const DESIGNARENA_METRIC_LABELS = {
  "zh-CN": {
    winRate: "胜率",
    battles: "对战",
    composite: "综合",
    samples: "评分样本",
    backend: "后端",
    auth: "认证",
    persistence: "持久化",
    reachDeviation: "触达偏离",
    dailyUsageDeviation: "日活偏离",
    retentionDeviation: "回访偏离",
    returnRate: "回访率",
    downloadsDeviation: "下载偏离",
    downloadRate: "下载率",
    margin: "误差",
  },
  "zh-TW": {
    winRate: "勝率",
    battles: "對戰",
    composite: "綜合",
    samples: "評分樣本",
    backend: "後端",
    auth: "認證",
    persistence: "持久化",
    reachDeviation: "觸達偏離",
    dailyUsageDeviation: "日活偏離",
    retentionDeviation: "回訪偏離",
    returnRate: "回訪率",
    downloadsDeviation: "下載偏離",
    downloadRate: "下載率",
    margin: "誤差",
  },
  en: {
    winRate: "Win Rate",
    battles: "Battles",
    composite: "Composite",
    samples: "Samples",
    backend: "Backend",
    auth: "Auth",
    persistence: "Persistence",
    reachDeviation: "Reach Deviation",
    dailyUsageDeviation: "Daily Usage Deviation",
    retentionDeviation: "Retention Deviation",
    returnRate: "Return Rate",
    downloadsDeviation: "Download Deviation",
    downloadRate: "Download Rate",
    margin: "Margin",
  },
  ja: {
    winRate: "勝率",
    battles: "対戦",
    composite: "総合",
    samples: "評価サンプル",
    backend: "バックエンド",
    auth: "認証",
    persistence: "永続化",
    reachDeviation: "リーチ偏差",
    dailyUsageDeviation: "日次利用偏差",
    retentionDeviation: "再訪偏差",
    returnRate: "再訪率",
    downloadsDeviation: "ダウンロード偏差",
    downloadRate: "ダウンロード率",
    margin: "誤差",
  },
  ko: {
    winRate: "승률",
    battles: "대전",
    composite: "종합",
    samples: "평가 샘플",
    backend: "백엔드",
    auth: "인증",
    persistence: "지속성",
    reachDeviation: "도달 편차",
    dailyUsageDeviation: "일일 사용량 편차",
    retentionDeviation: "재방문 편차",
    returnRate: "재방문율",
    downloadsDeviation: "다운로드 편차",
    downloadRate: "다운로드율",
    margin: "오차",
  },
};

const normalizeReadableLocale = (locale = "") => {
  const value = String(locale || "").toLowerCase();
  if (value === "zh-tw" || value === "zh_tw" || value === "zh-hant") return "zh-TW";
  if (
    value === "zh-cn" ||
    value === "zh_cn" ||
    value === "zh-hans" ||
    value === "zh" ||
    value.startsWith("zh-cn")
  ) {
    return "zh-CN";
  }
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja") || value.startsWith("jp")) return "ja";
  if (value.startsWith("ko") || value.startsWith("kr")) return "ko";
  return "";
};

const parseGoogleTranslateResponse = (payload) => {
  const segments = Array.isArray(payload?.[0]) ? payload[0] : [];
  return segments
    .map((segment) => String(segment?.[0] || ""))
    .join("")
    .trim();
};

const protectTranslationTerms = (text = "") => {
  const terms = [];
  const protectedText = String(text || "").replace(PROTECTED_TERM_PATTERN, (term) => {
    const token = `DHTERM${terms.length}X`;
    terms.push([token, term]);
    return token;
  });
  const restore = (value = "") =>
    terms.reduce(
      (nextValue, [token, term]) => nextValue.replaceAll(token, term),
      String(value || "")
    );
  return { protectedText, restore };
};

const translateReadableText = async (text, locale) => {
  const targetLanguage = GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE[locale];
  if (!targetLanguage || !text) return "";
  const { protectedText, restore } = protectTranslationTerms(text);

  const controller =
    typeof AbortController === "undefined" ? null : new AbortController();
  const timeout = controller
    ? setTimeout(() => controller.abort(), READABLE_TRANSLATE_TIMEOUT_MS)
    : null;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", protectedText);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller?.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "DailyHot-Readable-Translate/1.0",
      },
    });
    if (!response.ok) return "";
    return restore(parseGoogleTranslateResponse(await response.json()));
  } catch {
    return "";
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const translateReadableTexts = async (texts = [], locale) => {
  const data = texts.map((text, id) => ({
    id,
    original: text,
    translated: text,
  }));
  let cursor = 0;

  const runWorker = async () => {
    while (cursor < data.length) {
      const index = cursor;
      cursor += 1;
      const item = data[index];
      const translated = await translateReadableText(item.original, locale);
      if (translated) {
        item.translated = translated;
      }
    }
  };

  const workerCount = Math.min(READABLE_TRANSLATE_CONCURRENCY, data.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return data;
};

const handleReadableTranslate = async (body, res) => {
  let payload;
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    res.status(400).json({ code: 400, message: "Invalid JSON body" });
    return true;
  }

  const locale = normalizeReadableLocale(payload.locale);
  const texts = Array.isArray(payload.texts)
    ? payload.texts
        .slice(0, READABLE_TRANSLATE_MAX_TEXTS)
        .map((text) => String(text || "").trim().slice(0, READABLE_TRANSLATE_MAX_CHARS))
        .filter(Boolean)
    : [];

  if (!locale || !texts.length) {
    res.status(200).json({
      code: 200,
      name: "readable-translate",
      title: "Readable Translate",
      type: "translation",
      total: texts.length,
      locale: locale || payload.locale || "",
      success: false,
      data: texts.map((text, id) => ({ id, original: text, translated: text })),
      fromCache: false,
      updateTime: new Date().toISOString(),
    });
    return true;
  }

  const data = await translateReadableTexts(texts, locale);
  res.status(200).json({
    code: 200,
    name: "readable-translate",
    title: "Readable Translate",
    type: "translation",
    total: data.length,
    locale,
    success: data.some((item) => item.translated && item.translated !== item.original),
    data,
    fromCache: false,
    updateTime: new Date().toISOString(),
  });
  return true;
};

const normalizeQueryValue = (value, fallback = "") => {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
};

const getIthomeType = (type = "") =>
  Object.prototype.hasOwnProperty.call(ITHOME_TYPE_LABELS, type) ? type : "day";

const fetchWithTimeout = async (url, options = {}, timeoutMs = ITHOME_DIRECT_FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const normalizePlainText = (value = "") =>
  String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const stripWeiboTopicMarks = (value = "") =>
  normalizePlainText(value).replace(/^#+|#+$/g, "").trim();

const formatWeiboHotNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  if (number >= 100000000) {
    return `${(number / 100000000)
      .toFixed(number >= 1000000000 ? 1 : 2)
      .replace(/\.0+$/, "")}亿`;
  }
  if (number >= 10000) {
    return `${(number / 10000)
      .toFixed(number >= 100000 ? 0 : 1)
      .replace(/\.0$/, "")}万`;
  }
  return String(Math.round(number));
};

const getWeiboCacheStore = () => {
  if (!globalThis.__dailyhotWeiboCache) {
    globalThis.__dailyhotWeiboCache = new Map();
  }
  return globalThis.__dailyhotWeiboCache;
};

const isWeiboPromotedItem = (item = {}) =>
  Boolean(item?.is_ad || item?.topic_ad || item?.ad_type || item?.promotion);

const buildWeiboTopicUrl = (item = {}, title = "") => {
  const url = new URL(WEIBO_SEARCH_BASE_URL);
  url.searchParams.set(
    "q",
    stripWeiboTopicMarks(item.word_scheme || item.word || item.note || title)
  );
  return url.toString();
};

const buildWeiboDescription = (item = {}) => {
  const parts = [];
  const addPart = (value) => {
    const text = normalizePlainText(value);
    if (!text || parts.includes(text)) return;
    parts.push(text);
  };

  const fieldTag = normalizePlainText(item.field_tag);
  const category = normalizePlainText(item.category);
  const detail = normalizePlainText(item.detail_tag?.content);
  const reason = normalizePlainText(item.reason_tag);
  const transparency = normalizePlainText(item.transparency_tag);
  const hot = formatWeiboHotNumber(item.num);

  addPart(fieldTag || (category ? `${category}领域` : ""));
  addPart(reason);
  if (detail && detail !== fieldTag) addPart(detail);
  if (transparency && !transparency.includes("[media_count]")) {
    addPart(transparency);
  }
  if (hot) addPart(`热度 ${hot}`);

  return parts.slice(0, 5).join(" · ");
};

const stripWeiboZhisouBlocks = (value = "") =>
  String(value || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```wbCustomBlock[\s\S]*?```/g, "")
    .replace(/<media-block>[\s\S]*?<\/media-block>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]+]\([^)]+\)/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const truncateWeiboZhisouSummary = (value = "") => {
  const text = stripWeiboZhisouBlocks(value);
  if (!text || /抱歉|服务繁忙|稍后/.test(text)) return "";
  const firstSentence =
    text.match(/^[\s\S]{20,}?[。！？](?=\s|$|[“”"'])/)?.[0] ||
    text.match(/^[\s\S]{20,}?[。！？]/)?.[0] ||
    text;
  const summary = firstSentence.trim();
  if (summary.length <= WEIBO_ZHISOU_SUMMARY_MAX_LENGTH) return summary;
  return `${summary.slice(0, WEIBO_ZHISOU_SUMMARY_MAX_LENGTH - 1)}…`;
};

const fetchWeiboZhisouSummary = async (title, { forceNoCache = false } = {}) => {
  const query = stripWeiboTopicMarks(title);
  if (!query) return "";
  const cache = getWeiboCacheStore();
  const cacheKey = `zhisou:${query}`;
  const cached = cache.get(cacheKey);
  if (
    !forceNoCache &&
    cached &&
    Date.now() - cached.cachedAt < WEIBO_ZHISOU_CACHE_TTL_MS
  ) {
    return cached.value;
  }

  const now = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    query,
    content_type: "loop",
    request_id: String(now),
    request_time: String(now),
    search_source: "",
    sid: "h5_ai_share",
    page_id: "",
    vstyle: "1",
    cot: "1",
    loop_num: "1",
    query_id: "",
  });
  const response = await fetchWithTimeout(
    WEIBO_ZHISOU_URL,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://m.s.weibo.com",
        Referer: "https://m.s.weibo.com/zhisou/zhisoushare/",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 DailyHot/1.0",
      },
      body,
    },
    WEIBO_ZHISOU_TIMEOUT_MS
  );
  if (!response.ok) throw new Error(`Weibo Zhisou ${response.status}`);
  const payload = await response.json();
  if (Number(payload?.status) !== 2 || !payload?.msg) {
    throw new Error(`Weibo Zhisou unavailable: ${payload?.status || "unknown"}`);
  }
  const summary = truncateWeiboZhisouSummary(payload.msg);
  if (!summary) throw new Error("Weibo Zhisou summary is empty");
  const value = summary;
  cache.set(cacheKey, { cachedAt: Date.now(), value });
  return value;
};

const getBilibiliType = (type = "") =>
  Object.prototype.hasOwnProperty.call(BILIBILI_TYPE_LABELS, type) ? type : "all";

const normalizeBilibiliImage = (value = "") =>
  String(value || "").replace(/^http:\/\//, "https://");

const formatBilibiliCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "";
  if (number >= 10000) return `${(number / 10000).toFixed(number >= 100000 ? 0 : 1)}万`;
  return String(Math.round(number));
};

const getBilibiliVideoUrl = (item = {}) => {
  if (item.redirect_url) return item.redirect_url;
  if (item.uri) return item.uri;
  if (item.short_link_v2) return item.short_link_v2;
  if (item.bvid) return `${BILIBILI_WEB_BASE_URL}/video/${item.bvid}`;
  if (item.aid) return `${BILIBILI_WEB_BASE_URL}/video/av${item.aid}`;
  return BILIBILI_WEB_BASE_URL;
};

const normalizeBilibiliItems = (items = []) =>
  items.map((item, index) => {
    const stat = item?.stat || {};
    const ownerName = item?.owner?.name || item?.author || "";
    const viewCount = formatBilibiliCount(stat.view);
    const danmakuCount = formatBilibiliCount(stat.danmaku);
    const descParts = [
      ownerName,
      item?.tname,
      viewCount ? `播放 ${viewCount}` : "",
      danmakuCount ? `弹幕 ${danmakuCount}` : "",
    ].filter(Boolean);
    const url = getBilibiliVideoUrl(item);
    return {
      id: String(item?.bvid || item?.aid || index + 1),
      title: decodeHtmlText(item?.title || ""),
      desc: descParts.join(" · "),
      hot: Number(stat.view) || Math.max(items.length - index, 0),
      timestamp: Number(item?.pubdate || item?.ctime)
        ? new Date(Number(item?.pubdate || item?.ctime) * 1000).toISOString()
        : new Date().toISOString(),
      url,
      mobileUrl: url,
      cover: normalizeBilibiliImage(item?.pic || item?.cover || ""),
    };
  });

const buildBilibiliResponse = ({ type, items, updateTime = new Date().toISOString() }) => ({
  code: 200,
  name: "bilibili",
  title: "哔哩哔哩",
  type: BILIBILI_TYPE_LABELS[type],
  subtitle: BILIBILI_TYPE_LABELS[type],
  description: "哔哩哔哩综合热门、每周必看、入站必刷、排行榜与全站音乐榜。",
  params: {
    type: {
      name: "榜单",
      type: BILIBILI_TYPE_LABELS,
    },
  },
  link: BILIBILI_LINKS[type] || BILIBILI_LINKS.all,
  total: items.length,
  fromCache: false,
  updateTime,
  data: normalizeBilibiliItems(items),
});

const fetchBilibiliJson = async (url, options = {}) => {
  let lastError;
  for (let attempt = 0; attempt < BILIBILI_DIRECT_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          ...BILIBILI_COMMON_HEADERS,
          ...(options.referer ? { Referer: options.referer } : {}),
        },
      });
      if (!response.ok) throw new Error(`Bilibili ${response.status}`);
      const payload = await response.json();
      if (payload?.code !== 0) {
        throw new Error(`Bilibili API code ${payload?.code ?? "unknown"}`);
      }
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < BILIBILI_DIRECT_FETCH_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
      }
    }
  }
  throw lastError;
};

const fetchBilibiliWeeklyItems = async () => {
  const listPayload = await fetchBilibiliJson(
    `${BILIBILI_API_BASE_URL}/x/web-interface/popular/series/list`
  );
  const latest = (listPayload?.data?.list || []).find((item) => Number(item?.status) === 2);
  const number = latest?.number || listPayload?.data?.list?.[0]?.number;
  if (!number) throw new Error("Bilibili weekly series number is missing");
  const payload = await fetchBilibiliJson(
    `${BILIBILI_API_BASE_URL}/x/web-interface/popular/series/one?number=${number}`
  );
  return {
    items: payload?.data?.list || [],
    updateTime: Number(payload?.data?.config?.etime)
      ? new Date(Number(payload.data.config.etime) * 1000).toISOString()
      : new Date().toISOString(),
  };
};

const fetchBilibiliItems = async (type) => {
  if (type === "weekly") return fetchBilibiliWeeklyItems();

  const urlMap = {
    all: `${BILIBILI_API_BASE_URL}/x/web-interface/popular?pn=1&ps=50`,
    history: `${BILIBILI_API_BASE_URL}/x/web-interface/popular/precious?page_size=50&page=1`,
    rank: `${BILIBILI_API_BASE_URL}/x/web-interface/ranking/v2?rid=0&type=all&web_location=333.934`,
    music: `${BILIBILI_API_BASE_URL}/x/web-interface/ranking/v2?rid=3&type=all&web_location=333.934`,
  };
  const payload = await fetchBilibiliJson(urlMap[type] || urlMap.all, {
    referer: type === "rank" || type === "music" ? BILIBILI_RANK_REFERER : undefined,
  });
  return {
    items: payload?.data?.list || [],
    updateTime: new Date().toISOString(),
  };
};

const handleBilibili = async (req, res) => {
  if (req.method !== "GET") return false;
  const type = getBilibiliType(normalizeQueryValue(req.query.type, "all"));
  try {
    const result = await fetchBilibiliItems(type);
    const response = buildBilibiliResponse({
      type,
      items: result.items,
      updateTime: result.updateTime,
    });
    res.status(200).json(response);
    return true;
  } catch (error) {
    console.warn("Bilibili direct fetch failed", error);
    return false;
  }
};

const enrichWeiboItemsWithZhisou = async (data, { forceNoCache = false } = {}) => {
  const targets = data.slice(0, WEIBO_ZHISOU_ENRICH_LIMIT);
  const results = await Promise.allSettled(
    targets.map((item) => fetchWeiboZhisouSummary(item.title, { forceNoCache }))
  );
  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      targets[index].desc = result.value;
    }
  });
};

const buildWeiboResponse = async ({
  items,
  updateTime,
  fromCache = false,
}) => {
  const timestamp = Date.parse(updateTime) || Date.now();
  const data = items
    .filter((item) => !isWeiboPromotedItem(item))
    .map((item, index) => {
      const title = stripWeiboTopicMarks(
        item?.note || item?.word || item?.word_scheme || ""
      );
      if (!title) return null;
      const url = buildWeiboTopicUrl(item, title);
      const desc = buildWeiboDescription(item) || title;
      return {
        id: String(item?.mid || item?.word_scheme || item?.word || index + 1),
        title,
        desc,
        hot: Number(item?.num) || Math.max(items.length - index, 0),
        timestamp,
        url,
        mobileUrl: url,
      };
    })
    .filter(Boolean);

  await enrichWeiboItemsWithZhisou(data);

  return {
    code: 200,
    name: "weibo",
    title: "微博",
    type: "微博热搜",
    subtitle: "热搜榜",
    description: "微博实时热搜榜，聚合话题领域、热度排名与讨论趋势。",
    link: `${WEIBO_WEB_BASE_URL}/hot/search`,
    total: data.length,
    fromCache,
    updateTime,
    data,
  };
};

const fetchWeiboHotBand = async ({ forceNoCache = false } = {}) => {
  const cache = getWeiboCacheStore();
  const cached = cache.get("hot-band");
  if (!forceNoCache && cached && Date.now() - cached.cachedAt < WEIBO_CACHE_TTL_MS) {
    return { ...cached.value, fromCache: true };
  }

  const response = await fetchWithTimeout(
    WEIBO_HOT_BAND_URL,
    {
      method: "GET",
      headers: WEIBO_COMMON_HEADERS,
    },
    WEIBO_DIRECT_FETCH_TIMEOUT_MS
  );
  if (!response.ok) throw new Error(`Weibo hot band ${response.status}`);
  const payload = await response.json();
  const items = Array.isArray(payload?.data?.band_list)
    ? payload.data.band_list
    : [];
  if (payload?.ok !== 1 || !items.length) {
    throw new Error("Weibo hot band response is invalid");
  }

  const result = await buildWeiboResponse({
    items,
    updateTime: new Date().toISOString(),
  });
  if (!result.data.length) {
    throw new Error("Weibo hot band response has no usable items");
  }
  cache.set("hot-band", { cachedAt: Date.now(), value: result });
  return result;
};

const handleWeibo = async (req, res) => {
  if (req.method !== "GET") return false;
  const forceNoCache =
    String(normalizeQueryValue(req.query.cache, "true")).toLowerCase() === "false";

  try {
    const result = await fetchWeiboHotBand({ forceNoCache });
    res.status(200).json(result);
    return true;
  } catch (error) {
    console.warn("Weibo direct fetch failed", error);
    return false;
  }
};

const getIthomeCacheStore = () => {
  if (!globalThis.__dailyhotIthomeCache) {
    globalThis.__dailyhotIthomeCache = new Map();
  }
  return globalThis.__dailyhotIthomeCache;
};

const parseChinaDateTime = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return new Date().toISOString();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const withTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
    ? normalized
    : `${normalized}+08:00`;
  const date = new Date(withTimezone);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const decodeHtmlText = (value = "") =>
  String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/\s+/g, " ")
    .trim();

const buildIthomeResponse = ({ type, data, updateTime, fromCache = false }) => {
  const timestamp = Date.parse(updateTime) || Date.now();
  return {
    code: 200,
    name: "ithome",
    title: "IT之家",
    type: `IT之家${ITHOME_TYPE_LABELS[type]}`,
    subtitle: ITHOME_TYPE_LABELS[type],
    description: "IT之家科技数码资讯、日榜、周榜、热评榜、月榜与滚动新闻聚合。",
    params: {
      type: {
        name: "榜单",
        type: ITHOME_TYPE_LABELS,
      },
    },
    link: type === "list" ? "https://www.ithome.com/" : ITHOME_OFFICIAL_RANK_URL,
    total: data.length,
    fromCache,
    updateTime,
    data: data.map((item, index) => {
      const url = item?.url || item?.link || ITHOME_OFFICIAL_RANK_URL;
      return {
        id: String(item?.id ?? index + 1),
        title: decodeHtmlText(item?.title || ""),
        desc: decodeHtmlText(item?.desc || ""),
        hot: Number(item?.hot) || Math.max(data.length - index, 0),
        timestamp,
        url,
        mobileUrl: url,
      };
    }),
  };
};

const normalizeIthomeXcvtsResponse = (payload, type) => {
  const updateTime = parseChinaDateTime(
    payload?.update_time || payload?.cache_time || payload?.time
  );
  const data = Array.isArray(payload?.data) ? payload.data : [];
  return buildIthomeResponse({
    type,
    updateTime,
    fromCache: true,
    data: data.map((item, index) => ({
      id: item?.id ?? index + 1,
      title: item?.title || "",
      desc: item?.category || "",
      hot: Math.max(data.length - index, 0),
      url: item?.link,
    })),
  });
};

const parseIthomeOfficialRankItems = (html, type) => {
  const rankType = ITHOME_OFFICIAL_RANK_TYPES[type];
  if (!rankType) return [];
  const marker = `<div class="rank-name" data-rank-type="${rankType}">`;
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return [];
  const boxIndex = html.indexOf('<div class="rank-box"', markerIndex);
  if (boxIndex < 0) return [];
  const contentIndex = html.indexOf(">", boxIndex) + 1;
  const nextMarkerIndex = html.indexOf('<div class="rank-name"', contentIndex);
  const section = html.slice(
    contentIndex,
    nextMarkerIndex > contentIndex ? nextMarkerIndex : undefined
  );
  const items = [];
  const itemPattern = /<div class="placeholder\b[\s\S]*?(?=<div class="placeholder\b|$)/g;
  for (const match of section.matchAll(itemPattern)) {
    const block = match[0];
    const id = block.match(/data-news-id="([^"]+)"/)?.[1];
    const url = block.match(/<a\s+href="([^"]+)"/)?.[1];
    const rank = block.match(/<span class="rank-num">([\s\S]*?)<\/span>/)?.[1];
    const title = block.match(/<p class="plc-title">([\s\S]*?)<\/p>/)?.[1];
    const time = block.match(/<span class="post-time">([\s\S]*?)<\/span>/)?.[1];
    const reviews = block.match(/<span class="review-num">([\s\S]*?)<\/span>/)?.[1];
    if (!title || !url) continue;
    items.push({
      id,
      title,
      desc: [time, reviews].map(decodeHtmlText).filter(Boolean).join(" · "),
      hot: Number(decodeHtmlText(rank)) || Math.max(20 - items.length, 1),
      url,
    });
  }
  return items;
};

const fetchIthomeOfficialRanking = async (type) => {
  const response = await fetchWithTimeout(ITHOME_OFFICIAL_RANK_URL, {
    method: "GET",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "DailyHot-ITHome/1.0",
    },
  });
  if (!response.ok) throw new Error(`ITHome official ${response.status}`);
  const html = await response.text();
  const data = parseIthomeOfficialRankItems(html, type);
  if (!data.length) throw new Error("ITHome official rank section is empty");
  return buildIthomeResponse({
    type,
    data,
    updateTime: new Date().toISOString(),
  });
};

const fetchIthomeXcvtsRanking = async (type) => {
  const cache = getIthomeCacheStore();
  const cached = cache.get(type);
  if (cached && Date.now() - cached.cachedAt < ITHOME_CACHE_TTL_MS) {
    return { ...cached.value, fromCache: true };
  }

  const targetUrl = new URL(ITHOME_XCVTS_URL);
  targetUrl.searchParams.set("type", type);
  const response = await fetchWithTimeout(targetUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": "DailyHot-ITHome/1.0",
    },
  });
  if (!response.ok) throw new Error(`ITHome xcvts ${response.status}`);
  const payload = await response.json();
  if (payload?.code !== 200 || !Array.isArray(payload?.data)) {
    throw new Error("ITHome xcvts response is invalid");
  }
  const result = normalizeIthomeXcvtsResponse(payload, type);
  cache.set(type, { cachedAt: Date.now(), value: result });
  return result;
};

const fetchIthomeRanking = async (type) => {
  const cache = getIthomeCacheStore();
  const cached = cache.get(type);
  if (cached && Date.now() - cached.cachedAt < ITHOME_CACHE_TTL_MS) {
    return { ...cached.value, fromCache: true };
  }

  if (ITHOME_OFFICIAL_RANK_TYPES[type]) {
    try {
      const result = await fetchIthomeOfficialRanking(type);
      cache.set(type, { cachedAt: Date.now(), value: result });
      return result;
    } catch (error) {
      if (!["day", "week", "month"].includes(type)) throw error;
      console.warn("ITHome official fetch failed", error);
    }
  }
  return fetchIthomeXcvtsRanking(type);
};

const handleIthome = async (req, res) => {
  if (req.method !== "GET") return false;
  const type = getIthomeType(normalizeQueryValue(req.query.type, "day"));

  try {
    const result = await fetchIthomeRanking(type);
    res.status(200).json(result);
    return true;
  } catch (error) {
    console.warn("ITHome direct fetch failed", error);
    return false;
  }
};

const CLAWHUB_TYPE_LABELS = {
  "skills-recommended": {
    "zh-CN": "推荐技能榜",
    "zh-TW": "推薦技能榜",
    en: "Recommended Skills",
    ja: "おすすめスキル",
    ko: "추천 스킬",
  },
  "skills-featured": {
    "zh-CN": "精选技能榜",
    "zh-TW": "精選技能榜",
    en: "Featured Skills",
    ja: "注目スキル",
    ko: "추천 선정 스킬",
  },
  "skills-stars": {
    "zh-CN": "星标最多技能榜",
    "zh-TW": "星標最多技能榜",
    en: "Most Starred Skills",
    ja: "スター最多スキル",
    ko: "별표 많은 스킬",
  },
  "skills-installs": {
    "zh-CN": "安装最多技能榜",
    "zh-TW": "安裝最多技能榜",
    en: "Most Installed Skills",
    ja: "インストール最多スキル",
    ko: "설치 많은 스킬",
  },
  "skills-updated": {
    "zh-CN": "最近更新技能榜",
    "zh-TW": "最近更新技能榜",
    en: "Recently Updated Skills",
    ja: "最近更新されたスキル",
    ko: "최근 업데이트된 스킬",
  },
  "skills-newest": {
    "zh-CN": "最新发布技能榜",
    "zh-TW": "最新發布技能榜",
    en: "Newest Skills",
    ja: "新着スキル",
    ko: "최신 스킬",
  },
  "skills-name": {
    "zh-CN": "技能名称索引",
    "zh-TW": "技能名稱索引",
    en: "Skill Name Index",
    ja: "スキル名索引",
    ko: "스킬 이름 색인",
  },
  "skills-mcp-tools": {
    "zh-CN": "MCP 工具技能榜",
    "zh-TW": "MCP 工具技能榜",
    en: "MCP Tool Skills",
    ja: "MCPツールスキル",
    ko: "MCP 도구 스킬",
  },
  "skills-prompts": {
    "zh-CN": "提示词技能榜",
    "zh-TW": "提示詞技能榜",
    en: "Prompt Skills",
    ja: "プロンプトスキル",
    ko: "프롬프트 스킬",
  },
  "skills-workflows": {
    "zh-CN": "工作流技能榜",
    "zh-TW": "工作流程技能榜",
    en: "Workflow Skills",
    ja: "ワークフロースキル",
    ko: "워크플로 스킬",
  },
  "skills-dev-tools": {
    "zh-CN": "开发工具技能榜",
    "zh-TW": "開發工具技能榜",
    en: "Developer Tool Skills",
    ja: "開発ツールスキル",
    ko: "개발 도구 스킬",
  },
  "skills-data": {
    "zh-CN": "数据与 API 技能榜",
    "zh-TW": "資料與 API 技能榜",
    en: "Data & API Skills",
    ja: "データ・APIスキル",
    ko: "데이터 및 API 스킬",
  },
  "skills-security": {
    "zh-CN": "安全技能榜",
    "zh-TW": "安全技能榜",
    en: "Security Skills",
    ja: "セキュリティスキル",
    ko: "보안 스킬",
  },
  "skills-automation": {
    "zh-CN": "自动化技能榜",
    "zh-TW": "自動化技能榜",
    en: "Automation Skills",
    ja: "自動化スキル",
    ko: "자동화 스킬",
  },
  "skills-other": {
    "zh-CN": "其他技能榜",
    "zh-TW": "其他技能榜",
    en: "Other Skills",
    ja: "その他のスキル",
    ko: "기타 스킬",
  },
  "plugins-recommended": {
    "zh-CN": "推荐插件榜",
    "zh-TW": "推薦外掛榜",
    en: "Recommended Plugins",
    ja: "おすすめプラグイン",
    ko: "추천 플러그인",
  },
  "plugins-featured": {
    "zh-CN": "精选插件榜",
    "zh-TW": "精選外掛榜",
    en: "Featured Plugins",
    ja: "注目プラグイン",
    ko: "추천 선정 플러그인",
  },
  "plugins-installs": {
    "zh-CN": "安装最多插件榜",
    "zh-TW": "安裝最多外掛榜",
    en: "Most Installed Plugins",
    ja: "インストール最多プラグイン",
    ko: "설치 많은 플러그인",
  },
  "plugins-updated": {
    "zh-CN": "最近更新插件榜",
    "zh-TW": "最近更新外掛榜",
    en: "Recently Updated Plugins",
    ja: "最近更新されたプラグイン",
    ko: "최근 업데이트된 플러그인",
  },
  "plugins-data": {
    "zh-CN": "数据与 API 插件榜",
    "zh-TW": "資料與 API 外掛榜",
    en: "Data & API Plugins",
    ja: "データ・APIプラグイン",
    ko: "데이터 및 API 플러그인",
  },
};

const CLAWHUB_DESCRIPTION_LABELS = {
  skills: {
    "zh-CN": "ClawHub 的 OpenClaw技能推荐、安装、星标与分类榜单。",
    "zh-TW": "ClawHub 的 OpenClaw技能推薦、安裝、星標與分類榜單。",
    en: "ClawHub rankings for OpenClaw skills, installs, stars, and categories.",
    ja: "OpenClawスキルのおすすめ、インストール、スター、カテゴリを集約するClawHubランキング。",
    ko: "OpenClaw 스킬의 추천, 설치, 별표, 분류를 모은 ClawHub 랭킹입니다.",
  },
  plugins: {
    "zh-CN": "ClawHub 的 OpenClaw插件推荐、精选、安装与分类榜单。",
    "zh-TW": "ClawHub 的 OpenClaw外掛推薦、精選、安裝與分類榜單。",
    en: "ClawHub rankings for OpenClaw plugins, featured tools, installs, and categories.",
    ja: "OpenClawプラグインのおすすめ、注目、インストール、カテゴリを集約するClawHubランキング。",
    ko: "OpenClaw 플러그인의 추천, 선정, 설치, 분류를 모은 ClawHub 랭킹입니다.",
  },
};

const CLAWHUB_DESC_TERMS = {
  "zh-CN": {
    codePlugin: "代码插件",
    bundlePlugin: "组合插件",
    install: "安装",
    downloads: "下载",
    official: "官方",
    star: "星标",
  },
  "zh-TW": {
    codePlugin: "程式碼外掛",
    bundlePlugin: "組合外掛",
    install: "安裝",
    downloads: "下載",
    official: "官方",
    star: "星標",
  },
  en: {
    codePlugin: "Code Plugin",
    bundlePlugin: "Bundle Plugin",
    install: "Installs",
    downloads: "Downloads",
    official: "Official",
    star: "Stars",
  },
  ja: {
    codePlugin: "コードプラグイン",
    bundlePlugin: "バンドルプラグイン",
    install: "インストール",
    downloads: "ダウンロード",
    official: "公式",
    star: "スター",
  },
  ko: {
    codePlugin: "코드 플러그인",
    bundlePlugin: "번들 플러그인",
    install: "설치",
    downloads: "다운로드",
    official: "공식",
    star: "별표",
  },
};

const getClawHubKind = (type = "", result = {}) => {
  const normalizedType = String(type || "").toLowerCase();
  if (normalizedType.startsWith("plugins")) return "plugins";
  if (normalizedType.startsWith("skills")) return "skills";
  const text = `${result?.type || ""} ${result?.description || ""}`;
  return /plugin|插件|外掛/i.test(text) ? "plugins" : "skills";
};

const localizeClawHubDesc = (desc = "", locale = "zh-CN") => {
  const labels = CLAWHUB_DESC_TERMS[locale] || CLAWHUB_DESC_TERMS["zh-CN"];
  return String(desc || "")
    .replace(/\bCode Plugin\b/g, labels.codePlugin)
    .replace(/\bBundle Plugin\b/g, labels.bundlePlugin)
    .replace(/安装/g, labels.install)
    .replace(/安裝/g, labels.install)
    .replace(/下載/g, labels.downloads)
    .replace(/下载/g, labels.downloads)
    .replace(/官方/g, labels.official)
    .replace(/\bStar\b/g, labels.star);
};

const localizeClawHubProxyResult = (result, locale = "zh-CN", type = "") => {
  if (!result || typeof result !== "object" || result.name !== "clawhub") return result;
  const normalizedLocale = locale || "zh-CN";
  const selectedType = type || "";
  const kind = getClawHubKind(selectedType, result);
  const localizedType =
    CLAWHUB_TYPE_LABELS[selectedType]?.[normalizedLocale] ||
    localizeClawHubDesc(result.type || result.subtitle || "", normalizedLocale);
  const description =
    CLAWHUB_DESCRIPTION_LABELS[kind]?.[normalizedLocale] ||
    result.description ||
    "";
  return {
    ...result,
    type: localizedType || result.type,
    subtitle: localizedType || result.subtitle,
    description,
    data: Array.isArray(result.data)
      ? result.data.map((item) => ({
          ...item,
          desc: localizeClawHubDesc(item?.desc || "", normalizedLocale),
          noAutoTranslate: true,
        }))
      : result.data,
  };
};

const sendLocalizedClawHubUnavailable = (req, res, message, typeOverride = "") => {
  const locale =
    normalizeReadableLocale(normalizeQueryValue(req.query.locale, "zh-CN")) ||
    "zh-CN";
  const type = typeOverride || normalizeQueryValue(req.query.type, "");
  res.status(502).json(
    localizeClawHubProxyResult(
      {
        code: 502,
        name: "clawhub",
        title: "ClawHub",
        type: "",
        subtitle: "",
        description: "",
        message,
        data: [],
        total: 0,
        fromCache: false,
        updateTime: new Date().toISOString(),
      },
      locale,
      type
    )
  );
};

function formatNumber(value, digits = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toFixed(digits);
}

function formatInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return String(Math.round(number));
}

function formatSignedPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0.0%";
  return `${number > 0 ? "+" : ""}${number.toFixed(1)}%`;
}

const absoluteDesignArenaUrl = (href = "/leaderboard") =>
  href.startsWith("http")
    ? href
    : `${DESIGNARENA_BASE_URL}${href.startsWith("/") ? href : `/${href}`}`;

const getLocalizedDesignArenaMeta = (type, meta = {}, locale = "zh-CN") => {
  const localized = DESIGNARENA_RESPONSE_LOCALIZATIONS[type] || {};
  const title = localized.title?.[locale] || meta.title;
  return {
    ...meta,
    title,
    description:
      localized.description?.[locale] ||
      getGenericDesignArenaDescription(title, locale, meta.description),
  };
};

const getDesignArenaTypeParams = (locale = "zh-CN") =>
  Object.fromEntries(
    [
      ...Object.entries(DESIGNARENA_LEADERBOARD_TYPES),
      ...Object.entries(DESIGNARENA_SIGNAL_TYPES),
    ].map(([key, meta]) => [
      key,
      getLocalizedDesignArenaMeta(key, meta, locale).title,
    ])
  );

const getDesignArenaBackendScore = (item = {}) => {
  const fields = [
    "avg_schema_design",
    "avg_data_seeding",
    "avg_api_functionality",
    "avg_auth_implementation",
    "avg_crud_operations",
    "avg_e2e_persistence",
    "avg_error_handling",
  ];
  const values = fields
    .map((field) => Number(item[field]))
    .filter((value) => Number.isFinite(value));
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const getSignalMetricValue = (item = {}, metric = "") => {
  if (metric === "backendScore") return getDesignArenaBackendScore(item);
  const value = Number(item[metric]);
  return Number.isFinite(value) ? value : 0;
};

const getDesignArenaMetricLabels = (locale = "zh-CN") =>
  DESIGNARENA_METRIC_LABELS[locale] || DESIGNARENA_METRIC_LABELS["zh-CN"];

const normalizeDesignArenaLeaderboardData = (items = [], meta = {}, locale = "zh-CN") => {
  const metric = meta.metric === "winRate" ? "winRate" : "elo";
  const url = absoluteDesignArenaUrl(meta.href);
  const labels = getDesignArenaMetricLabels(locale);
  return items
    .slice()
    .sort((a, b) => Number(b[metric] || 0) - Number(a[metric] || 0))
    .map((item) => {
      const modelName = String(item.modelId || item.model || item.id || "").trim();
      const elo = Number(item.elo || 0);
      const winRate = Number(item.winRate || 0);
      const battles = Number(item.battles || 0);
      return {
        id: modelName,
        title: modelName,
        originalTitle: modelName,
        desc: `ELO ${formatInteger(elo)} · ${labels.winRate} ${formatNumber(winRate, 1)}% · ${labels.battles} ${formatInteger(battles)}`,
        hot: metric === "winRate" ? Number(winRate.toFixed(1)) : Math.round(elo),
        url,
        mobileUrl: url,
        noAutoTranslate: true,
      };
    });
};

const normalizeDesignArenaSignalData = (items = [], meta = {}, locale = "zh-CN") => {
  const url = absoluteDesignArenaUrl("/leaderboard");
  const labels = getDesignArenaMetricLabels(locale);
  return items
    .slice()
    .map((item) => ({
      item,
      value: getSignalMetricValue(item, meta.metric),
    }))
    .sort((a, b) => b.value - a.value)
    .map(({ item, value }) => {
      const modelName = String(item.model_id || item.modelId || item.model || "").trim();
      return {
        id: modelName,
        title: modelName,
        originalTitle: modelName,
        desc: meta.descBuilder ? meta.descBuilder(item, value, labels) : String(value),
        hot: Number(value.toFixed(2)),
        url,
        mobileUrl: url,
        noAutoTranslate: true,
      };
    });
};

const buildDesignArenaResponse = ({ type, meta, data, updateTime, locale }) => {
  const localizedMeta = getLocalizedDesignArenaMeta(type, meta, locale);
  return {
    code: 200,
    name: "designarena",
    title: "DesignArena",
    type: localizedMeta.title,
    description: localizedMeta.description || "DesignArena AI 模型排行榜",
    link: absoluteDesignArenaUrl(meta.href || "/leaderboard"),
    params: {
      type: {
        name:
          DESIGNARENA_PARAM_NAME_BY_LOCALE[locale] ||
          DESIGNARENA_PARAM_NAME_BY_LOCALE.en,
        type: getDesignArenaTypeParams(locale),
      },
    },
    subtype: localizedMeta.title,
    total: data.length,
    fromCache: false,
    updateTime: updateTime || new Date().toISOString(),
    data,
    selectedType: type,
  };
};

const fetchDesignArenaLeaderboard = async (type, meta, locale = "zh-CN") => {
  const response = await fetch(DESIGNARENA_LEADERBOARD_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: DESIGNARENA_BASE_URL,
      Referer: `${DESIGNARENA_BASE_URL}/leaderboard`,
      "User-Agent": "DailyHot-DesignArena/1.0",
    },
    body: JSON.stringify({
      category: meta.category,
      arenaType: meta.arenaType,
      ...(meta.inputModality ? { inputModality: meta.inputModality } : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`DesignArena leaderboard ${response.status}`);
  }
  const payload = await response.json();
  if (!payload?.success || !Array.isArray(payload.data)) {
    throw new Error("DesignArena leaderboard response is invalid");
  }
  return buildDesignArenaResponse({
    type,
    meta,
    data: normalizeDesignArenaLeaderboardData(payload.data, meta, locale),
    updateTime: payload.timestamp || new Date().toISOString(),
    locale,
  });
};

const fetchDesignArenaSignals = async (type, meta, locale = "zh-CN") => {
  const response = await fetch(DESIGNARENA_JUDGE_SCORES_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Referer: `${DESIGNARENA_BASE_URL}/leaderboard`,
      "User-Agent": "DailyHot-DesignArena/1.0",
    },
  });
  if (!response.ok) {
    throw new Error(`DesignArena judge scores ${response.status}`);
  }
  const payload = await response.json();
  const items = Array.isArray(payload?.[meta.dataset]) ? payload[meta.dataset] : [];
  if (!items.length) {
    throw new Error("DesignArena signal response is empty");
  }
  return buildDesignArenaResponse({
    type,
    meta,
    data: normalizeDesignArenaSignalData(items, meta, locale),
    locale,
  });
};

const handleDesignArena = async (req, res) => {
  if (req.method !== "GET") return false;
  const type = normalizeQueryValue(req.query.type, "fullstack");
  const locale = normalizeReadableLocale(normalizeQueryValue(req.query.locale, "zh-CN")) || "zh-CN";
  const leaderboardMeta = DESIGNARENA_LEADERBOARD_TYPES[type];
  const signalMeta = DESIGNARENA_SIGNAL_TYPES[type];
  if (!leaderboardMeta && !signalMeta) return false;

  try {
    const result = leaderboardMeta
      ? await fetchDesignArenaLeaderboard(type, leaderboardMeta, locale)
      : await fetchDesignArenaSignals(type, signalMeta, locale);
    res.status(200).json(result);
    return true;
  } catch (error) {
    console.warn("DesignArena direct fetch failed", error);
    res.status(502).json({
      code: 502,
      name: "designarena",
      title: "DesignArena",
      type:
        getLocalizedDesignArenaMeta(
          type,
          leaderboardMeta || signalMeta || {},
          locale
        )?.title || "DesignArena",
      total: 0,
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
      message: "DesignArena upstream unavailable",
    });
    return true;
  }
};

const ARTIFICIALANALYSIS_BASE_URL = "https://artificialanalysis.ai";
const ARTIFICIALANALYSIS_PROXY_URL = `${PUBLIC_API_FALLBACK_BASE_URL}/artificialanalysis`;
const ARTIFICIALANALYSIS_TIMEOUT_MS = 20000;
const ARTIFICIALANALYSIS_PARAM_NAME_BY_LOCALE = {
  "zh-CN": "榜单",
  "zh-TW": "榜單",
  en: "Type",
  ja: "タイプ",
  ko: "유형",
};
const ARTIFICIALANALYSIS_DESC_LABELS = {
  "zh-CN": {
    index: "Index",
    cost: "单任务成本",
    time: "平均时长",
    top: "官方 FAQ Top 5",
    context: "上下文",
    blendPrice: "混合价",
    speed: "速度",
    firstChunk: "首包",
    totalResponse: "总响应",
  },
  "zh-TW": {
    index: "Index",
    cost: "單任務成本",
    time: "平均時長",
    top: "官方 FAQ Top 5",
    context: "上下文",
    blendPrice: "混合價",
    speed: "速度",
    firstChunk: "首包",
    totalResponse: "總響應",
  },
  en: {
    index: "Index",
    cost: "Cost / task",
    time: "Time / task",
    top: "Official FAQ Top 5",
    context: "Context",
    blendPrice: "Blended price",
    speed: "Speed",
    firstChunk: "First chunk",
    totalResponse: "Total response",
  },
  ja: {
    index: "Index",
    cost: "タスク単価",
    time: "平均時間",
    top: "公式FAQ Top 5",
    context: "コンテキスト",
    blendPrice: "混合価格",
    speed: "速度",
    firstChunk: "初回チャンク",
    totalResponse: "総応答",
  },
  ko: {
    index: "Index",
    cost: "작업당 비용",
    time: "평균 시간",
    top: "공식 FAQ Top 5",
    context: "컨텍스트",
    blendPrice: "혼합 가격",
    speed: "속도",
    firstChunk: "첫 청크",
    totalResponse: "총 응답",
  },
};
const ARTIFICIALANALYSIS_TYPE_META = {
  models: {
    source: "proxy",
    path: "/leaderboards/models",
    title: {
      "zh-CN": "模型综合评测榜",
      "zh-TW": "模型綜合評測榜",
      en: "Models",
      ja: "モデル総合評価",
      ko: "모델 종합 평가",
    },
    description: {
      "zh-CN": "Artificial Analysis 大模型能力、价格与速度综合排行榜。",
      "zh-TW": "Artificial Analysis 大模型能力、價格與速度綜合排行榜。",
      en: "Artificial Analysis rankings for model intelligence, price, and speed.",
      ja: "Artificial Analysisのモデル性能、価格、速度ランキング。",
      ko: "Artificial Analysis의 모델 성능, 가격, 속도 랭킹.",
    },
  },
  providers: {
    source: "html",
    path: "/leaderboards/providers",
    title: {
      "zh-CN": "API 提供商与端点榜",
      "zh-TW": "API 提供商與端點榜",
      en: "API Providers & Endpoints",
      ja: "APIプロバイダとエンドポイント",
      ko: "API 프로바이더 및 엔드포인트",
    },
    description: {
      "zh-CN": "Artificial Analysis LLM API 提供商与模型端点价格、速度、首包延迟与总响应时长对比榜。",
      "zh-TW": "Artificial Analysis LLM API 提供商與模型端點價格、速度、首包延遲與總響應時長對比榜。",
      en: "Artificial Analysis comparisons of LLM API provider endpoints across price, speed, first chunk latency, and total response time.",
      ja: "Artificial AnalysisのLLM APIプロバイダ端点を価格、速度、初回応答遅延、総応答時間で比較するランキング。",
      ko: "Artificial Analysis의 LLM API 프로바이더 엔드포인트를 가격, 속도, 첫 응답 지연, 총 응답 시간으로 비교한 랭킹.",
    },
  },
  "coding-agents": {
    source: "html",
    path: "/agents/coding-agents",
    title: {
      "zh-CN": "编码智能体榜",
      "zh-TW": "編碼智慧體榜",
      en: "Coding Agents",
      ja: "コーディングエージェント",
      ko: "코딩 에이전트",
    },
    description: {
      "zh-CN": "Artificial Analysis 编码智能体任务通过率、成本与执行时长排行榜。",
      "zh-TW": "Artificial Analysis 編碼智慧體任務通過率、成本與執行時長排行榜。",
      en: "Artificial Analysis coding agent rankings across benchmark performance, cost, and execution time.",
      ja: "Artificial Analysisのコーディングエージェントをベンチマーク成績、コスト、実行時間で比較するランキング。",
      ko: "Artificial Analysis 코딩 에이전트를 벤치마크 성능, 비용, 실행 시간으로 비교한 랭킹.",
    },
  },
  "text-to-image": {
    source: "html",
    path: "/image/leaderboard/text-to-image",
    title: {
      "zh-CN": "文生图榜",
      "zh-TW": "文生圖榜",
      en: "Text to Image",
      ja: "テキスト画像",
      ko: "텍스트 투 이미지",
    },
    description: {
      "zh-CN": "Artificial Analysis 文生图模型 Elo 与图像生成价格排行榜。",
      "zh-TW": "Artificial Analysis 文生圖模型 Elo 與圖像生成價格排行榜。",
      en: "Artificial Analysis text-to-image rankings across Elo and image generation pricing.",
      ja: "Artificial Analysisのテキスト画像モデルをEloと生成価格で比較するランキング。",
      ko: "Artificial Analysis 텍스트 투 이미지 모델의 Elo와 생성 가격 랭킹.",
    },
  },
};
const ARTIFICIALANALYSIS_PROVIDER_LABEL_BY_PATH = {
  "/providers/amazon_bedrock": "Amazon Bedrock",
  "/providers/azure": "Microsoft Azure",
};

const absoluteArtificialAnalysisUrl = (path = "/") =>
  path.startsWith("http")
    ? path
    : `${ARTIFICIALANALYSIS_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const getArtificialAnalysisMeta = (type = "models", locale = "zh-CN") => {
  const normalizedLocale = normalizeReadableLocale(locale) || "zh-CN";
  const meta = ARTIFICIALANALYSIS_TYPE_META[type] || ARTIFICIALANALYSIS_TYPE_META.models;
  return {
    ...meta,
    title: meta.title?.[normalizedLocale] || meta.title?.en || meta.title?.["zh-CN"] || "",
    description:
      meta.description?.[normalizedLocale] ||
      meta.description?.en ||
      meta.description?.["zh-CN"] ||
      "",
  };
};

const getArtificialAnalysisTypeParams = (locale = "zh-CN") =>
  Object.fromEntries(
    Object.keys(ARTIFICIALANALYSIS_TYPE_META).map((type) => [
      type,
      getArtificialAnalysisMeta(type, locale).title,
    ])
  );

const localizeArtificialAnalysisResult = (result, type, locale = "zh-CN") => {
  const normalizedLocale = normalizeReadableLocale(locale) || "zh-CN";
  const meta = getArtificialAnalysisMeta(type, normalizedLocale);
  const data = Array.isArray(result?.data)
    ? result.data.map((item) => ({
        ...item,
        title: String(item?.title || "").trim(),
        originalTitle: item?.originalTitle || String(item?.title || "").trim(),
        noAutoTranslate: true,
      }))
    : [];
  return {
    ...result,
    code: 200,
    name: "artificialanalysis",
    title: "Artificial Analysis",
    type: meta.title,
    subtitle: meta.title,
    description: meta.description,
    link: absoluteArtificialAnalysisUrl(meta.path),
    params: {
      type: {
        name:
          ARTIFICIALANALYSIS_PARAM_NAME_BY_LOCALE[normalizedLocale] ||
          ARTIFICIALANALYSIS_PARAM_NAME_BY_LOCALE.en,
        type: getArtificialAnalysisTypeParams(normalizedLocale),
      },
    },
    selectedType: type,
    total: result?.total || data.length,
    data,
  };
};

const fetchArtificialAnalysisProxyResult = async (type, locale = "zh-CN") => {
  const url = new URL(ARTIFICIALANALYSIS_PROXY_URL);
  url.searchParams.set("type", type);
  url.searchParams.set("locale", locale);
  const response = await fetchWithTimeout(
    url.toString(),
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "DailyHot-ArtificialAnalysis/1.0",
      },
    },
    ARTIFICIALANALYSIS_TIMEOUT_MS
  );
  if (!response.ok) {
    throw new Error(`ArtificialAnalysis proxy ${response.status}`);
  }
  const payload = await response.json();
  if (payload?.code !== 200 || !Array.isArray(payload?.data)) {
    throw new Error("ArtificialAnalysis proxy response is invalid");
  }
  return localizeArtificialAnalysisResult(payload, type, locale);
};

const buildArtificialAnalysisResponse = ({ type, locale = "zh-CN", data = [], updateTime }) => {
  const normalizedLocale = normalizeReadableLocale(locale) || "zh-CN";
  const meta = getArtificialAnalysisMeta(type, normalizedLocale);
  return {
    code: 200,
    name: "artificialanalysis",
    title: "Artificial Analysis",
    type: meta.title,
    subtitle: meta.title,
    description: meta.description,
    link: absoluteArtificialAnalysisUrl(meta.path),
    params: {
      type: {
        name:
          ARTIFICIALANALYSIS_PARAM_NAME_BY_LOCALE[normalizedLocale] ||
          ARTIFICIALANALYSIS_PARAM_NAME_BY_LOCALE.en,
        type: getArtificialAnalysisTypeParams(normalizedLocale),
      },
    },
    selectedType: type,
    total: data.length,
    fromCache: false,
    updateTime: updateTime || new Date().toISOString(),
    data,
  };
};

const decodeArtificialAnalysisHtml = (value = "") =>
  String(value || "")
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const formatArtificialAnalysisDuration = (seconds, locale = "zh-CN") => {
  const minutes = Number(seconds) / 60;
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  const rounded = minutes >= 10 ? minutes.toFixed(1) : minutes.toFixed(1);
  if (locale === "zh-CN" || locale === "zh-TW") return `${rounded}分钟`;
  if (locale === "ja") return `${rounded}分`;
  if (locale === "ko") return `${rounded}분`;
  return `${rounded}m`;
};

const extractArtificialAnalysisCodingAgents = (html = "", locale = "zh-CN") => {
  const labels =
    ARTIFICIALANALYSIS_DESC_LABELS[normalizeReadableLocale(locale) || "zh-CN"] ||
    ARTIFICIALANALYSIS_DESC_LABELS["zh-CN"];
  const normalizedHtml = String(html || "").replace(/\\"/g, "\"");
  const regex =
    /displayLabel":"([^"]+)"[\s\S]*?indexScore":([0-9.]+)[\s\S]*?costUsd":([0-9.]+)[\s\S]*?agentWallTimeSec":([0-9.]+)/g;
  const map = new Map();
  let match;
  while ((match = regex.exec(normalizedHtml))) {
    const title = decodeArtificialAnalysisHtml(match[1]).trim();
    if (!title || map.has(title)) continue;
    const score = Number(match[2]) * 100;
    const cost = Number(match[3]);
    const duration = Number(match[4]);
    map.set(title, {
      id: title,
      title,
      originalTitle: title,
      desc: `${labels.index} ${formatNumber(score, 1)} · ${labels.cost} $${formatNumber(cost, 2)} · ${labels.time} ${formatArtificialAnalysisDuration(duration, locale)}`,
      hot: Number(score.toFixed(1)),
      url: absoluteArtificialAnalysisUrl("/agents/coding-agents"),
      mobileUrl: absoluteArtificialAnalysisUrl("/agents/coding-agents"),
      noAutoTranslate: true,
    });
  }
  return [...map.values()]
    .sort((a, b) => Number(b.hot || 0) - Number(a.hot || 0))
    .slice(0, 10);
};

const extractArtificialAnalysisTextToImage = (html = "", locale = "zh-CN") => {
  const labels =
    ARTIFICIALANALYSIS_DESC_LABELS[normalizeReadableLocale(locale) || "zh-CN"] ||
    ARTIFICIALANALYSIS_DESC_LABELS["zh-CN"];
  const faqMatch = html.match(
    /The top Text to Image models by Elo rating are:\s*([\s\S]*?)\s*Rankings are based on blind user votes/i
  );
  if (!faqMatch) return [];
  const content = decodeArtificialAnalysisHtml(faqMatch[1]);
  const entryRegex = /\d+\.\s+(.+?)\s+\(Elo\s+([0-9,]+)\)/g;
  const rows = [];
  let match;
  while ((match = entryRegex.exec(content)) && rows.length < 5) {
    const title = String(match[1] || "").trim();
    const elo = Number(String(match[2] || "").replace(/,/g, ""));
    if (!title || !Number.isFinite(elo)) continue;
    rows.push({
      id: title,
      title,
      originalTitle: title,
      desc: `ELO ${formatInteger(elo)} · ${labels.top}`,
      hot: elo,
      url: absoluteArtificialAnalysisUrl("/image/leaderboard/text-to-image"),
      mobileUrl: absoluteArtificialAnalysisUrl("/image/leaderboard/text-to-image"),
      noAutoTranslate: true,
    });
  }
  return rows;
};

const extractArtificialAnalysisProviders = async (html = "", locale = "zh-CN") => {
  const labels =
    ARTIFICIALANALYSIS_DESC_LABELS[normalizeReadableLocale(locale) || "zh-CN"] ||
    ARTIFICIALANALYSIS_DESC_LABELS["zh-CN"];
  const normalizedHtml = String(html || "");
  const startRegex =
    /\\"name\\":\\"([^\\]+)\\",\\"short_name\\":\\"([^\\]+)\\",\\"model_label\\":\\"([^\\]+)\\",\\"host_label\\":\\"([^\\]+)\\"/g;
  const modelStartRegex = /\\"model\\":\{/g;
  let nextModelMatch = modelStartRegex.exec(normalizedHtml);
  let currentModelStart = -1;
  const modelInfoCache = new Map();
  const getModelInfo = (modelStart, modelEnd) => {
    if (modelInfoCache.has(modelStart)) return modelInfoCache.get(modelStart);
    const modelChunk =
      modelStart >= 0 ? normalizedHtml.slice(modelStart, modelEnd) : "";
    const info = {
      deprecated:
        modelChunk.match(/\\"deprecated\\":(true|false)/)?.[1] === "true",
      intelligence: Number(
        modelChunk.match(/\\"intelligence_index\\":([0-9.]+)/)?.[1] ||
          modelChunk.match(/\\"estimated_intelligence_index\\":([0-9.]+)/)?.[1]
      ),
    };
    modelInfoCache.set(modelStart, info);
    return info;
  };
  const seen = new Set();
  const rows = [];
  let match;
  while ((match = startRegex.exec(normalizedHtml))) {
    const modelLabel = decodeArtificialAnalysisHtml(match[3]).trim();
    const hostLabel = decodeArtificialAnalysisHtml(match[4]).trim();
    const chunkStart = Math.max(0, match.index);
    while (nextModelMatch && nextModelMatch.index < chunkStart) {
      currentModelStart = nextModelMatch.index;
      nextModelMatch = modelStartRegex.exec(normalizedHtml);
    }
    const modelInfo = getModelInfo(currentModelStart, chunkStart);
    if (modelInfo.deprecated) continue;
    const chunkEnd = Math.min(normalizedHtml.length, chunkStart + 16000);
    const chunk = normalizedHtml.slice(chunkStart, chunkEnd);
    const hostPath = decodeArtificialAnalysisHtml(
      chunk.match(/\\"hosts_url\\":\\"([^\\]+)\\"/)?.[1] || ""
    ).trim();
    if (!modelLabel || !hostLabel || !hostPath) continue;
    const key = `${hostLabel}::${modelLabel}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const contextWindow = decodeArtificialAnalysisHtml(
      chunk.match(/\\"context_window_formatted\\":\\"([^\\]+)\\"/)?.[1] || ""
    ).trim();
    const price = Number(chunk.match(/\\"price_1m_blended_7_2_1\\":([0-9.]+)/)?.[1]);
    const speed = Number(chunk.match(/\\"median_output_speed\\":([0-9.]+)/)?.[1]);
    const firstChunk = Number(
      chunk.match(/\\"timescaleData\\":\{[\s\S]*?\\"median_time_to_first_chunk\\":([0-9.]+)/)?.[1] ||
        chunk.match(/\\"median_time_to_first_chunk\\":([0-9.]+)/)?.[1]
    );
    const totalTime = Number(
      chunk.match(
        /\\"prompt_length_type\\":\\"long\\"[\s\S]*?\\"median_end_to_end_response_time\\":([0-9.]+)/
      )?.[1]
    );
    const providerTitle = ARTIFICIALANALYSIS_PROVIDER_LABEL_BY_PATH[hostPath] || hostLabel;
    const title = `${providerTitle} · ${modelLabel}`;
    rows.push({
      id: key,
      title,
      originalTitle: title,
      desc: `${labels.context} ${contextWindow} · ${labels.blendPrice} $${formatNumber(price, price < 1 ? 3 : 2)}/1M · ${labels.speed} ${formatNumber(speed, 1)} tok/s · ${labels.firstChunk} ${formatNumber(firstChunk, 2)}s · ${labels.totalResponse} ${formatNumber(totalTime, 2)}s`,
      hot: Number.isFinite(speed) ? Number(speed.toFixed(1)) : 0,
      url: absoluteArtificialAnalysisUrl(hostPath),
      mobileUrl: absoluteArtificialAnalysisUrl(hostPath),
      noAutoTranslate: true,
      _sortIntelligence: Number.isFinite(modelInfo.intelligence)
        ? modelInfo.intelligence
        : -Infinity,
      _sortOriginalIndex: rows.length,
    });
  }
  return rows
    .sort(
      (a, b) =>
        b._sortIntelligence - a._sortIntelligence ||
        a._sortOriginalIndex - b._sortOriginalIndex
    )
    .map(({ _sortIntelligence, _sortOriginalIndex, ...item }) => item);
};

const fetchArtificialAnalysisHtml = async (path = "/") => {
  const response = await fetchWithTimeout(
    absoluteArtificialAnalysisUrl(path),
    {
      headers: {
        Accept: "text/html",
        "User-Agent": "DailyHot-ArtificialAnalysis/1.0",
      },
    },
    ARTIFICIALANALYSIS_TIMEOUT_MS
  );
  if (!response.ok) {
    throw new Error(`ArtificialAnalysis html ${response.status}`);
  }
  return await response.text();
};

const handleArtificialAnalysis = async (req, res) => {
  if (req.method !== "GET") return false;
  const type = normalizeQueryValue(req.query.type, "models");
  const locale = normalizeReadableLocale(normalizeQueryValue(req.query.locale, "zh-CN")) || "zh-CN";
  const meta = ARTIFICIALANALYSIS_TYPE_META[type];
  if (!meta) return false;

  try {
    const result =
      meta.source === "proxy"
        ? await fetchArtificialAnalysisProxyResult(type, locale)
        : buildArtificialAnalysisResponse({
            type,
            locale,
            data:
              type === "providers"
                ? await extractArtificialAnalysisProviders(
                    await fetchArtificialAnalysisHtml(meta.path),
                    locale
                  )
                : type === "coding-agents"
                ? extractArtificialAnalysisCodingAgents(
                    await fetchArtificialAnalysisHtml(meta.path),
                    locale
                  )
                : extractArtificialAnalysisTextToImage(
                    await fetchArtificialAnalysisHtml(meta.path),
                    locale
                  ),
          });
    if (!Array.isArray(result.data) || !result.data.length) {
      throw new Error(`ArtificialAnalysis ${type} returned empty data`);
    }
    res.status(200).json(result);
    return true;
  } catch (error) {
    console.warn("ArtificialAnalysis direct fetch failed", error);
    res.status(502).json({
      ...buildArtificialAnalysisResponse({
        type,
        locale,
        data: [],
      }),
      code: 502,
      message: "ArtificialAnalysis upstream unavailable",
    });
    return true;
  }
};

const buildProxyTargetUrl = (baseUrl, pathValue, query) => {
  const targetUrl = new URL(`${baseUrl.replace(/\/+$/, "")}/${pathValue}`);

  Object.entries(query).forEach(([key, value]) => {
    if (PROXY_LOCAL_QUERY_PARAMS.has(key)) return;
    if (Array.isArray(value)) {
      value.forEach((item) => targetUrl.searchParams.append(key, item));
      return;
    }
    if (typeof value === "string") {
      targetUrl.searchParams.set(key, value);
    }
  });

  return targetUrl;
};

const normalizeApiRoute = (pathValue = "", query = {}) => {
  const segments = String(pathValue || "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length < 2) {
    return { pathValue, query };
  }

  const [source, ...subtypeSegments] = segments;
  if (!API_SUBTYPE_PATH_SOURCES.has(source)) {
    return { pathValue, query };
  }

  const subtypeFromPath = subtypeSegments.join("/");
  return {
    pathValue: source,
    query: {
      ...query,
      type: normalizeQueryValue(query.type, subtypeFromPath),
    },
  };
};

const redirectToPublicApiFallback = (pathValue, query, res) => {
  const redirectUrl = buildProxyTargetUrl(
    PUBLIC_API_DEFAULT_FALLBACK_BASE_URL,
    pathValue,
    query
  );
  res.status(307);
  res.setHeader("location", redirectUrl.toString());
  res.send("");
};

const getProxyBaseUrlCandidates = (pathValue, baseUrl) => {
  const candidates = [baseUrl];
  if (PUBLIC_API_FALLBACK_PATHS.has(pathValue) && PUBLIC_API_FALLBACK_BASE_URL) {
    candidates.push(PUBLIC_API_FALLBACK_BASE_URL);
    candidates.push(PUBLIC_API_DEFAULT_FALLBACK_BASE_URL);
  }
  return [...new Set(candidates.map((url) => url?.replace(/\/+$/, "")).filter(Boolean))];
};

const fetchProxyTarget = async ({ targetUrl, req, body, proxyToken }) => {
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Accept: "application/json",
      "Content-Type": req.headers["content-type"] || "application/json",
      Authorization: req.headers.authorization || "",
      "User-Agent": "DailyHot-Internal-Proxy/1.0",
      ...(proxyToken ? { "X-Internal-Proxy-Token": proxyToken } : {}),
    },
    body,
  });
  const contentType = response.headers.get("content-type") || "application/json";
  const text = await response.text();
  return { response, contentType, text };
};

const getImageProxyTarget = (rawUrl = "") => {
  const target = new URL(rawUrl);
  if (target.protocol !== "https:") {
    throw new Error("Only HTTPS image URLs are supported");
  }
  const host = target.hostname.toLowerCase();
  const isAllowed = IMAGE_PROXY_ALLOWED_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
  if (!isAllowed) {
    throw new Error("Image host is not allowed");
  }
  if (/^img\d+\.doubanio\.com$/.test(host)) {
    target.hostname = "img3.doubanio.com";
  }
  return target;
};

const getImageProxyReferer = (target) => {
  const host = target.hostname.toLowerCase();
  if (host === "doubanio.com" || host.endsWith(".doubanio.com")) {
    return "https://movie.douban.com/";
  }
  return `${target.origin}/`;
};

const handleImageProxy = async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.status(405).json({ code: 405, message: "Method not allowed" });
    return;
  }

  let target;
  try {
    target = getImageProxyTarget(normalizeQueryValue(req.query.url, ""));
  } catch {
    res.status(400).json({ code: 400, message: "Invalid image URL" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_PROXY_TIMEOUT_MS);
  try {
    const response = await fetch(target, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        Referer: getImageProxyReferer(target),
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 DailyHot/1.0",
      },
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || 0);

    if (!response.ok) {
      res.status(response.status).json({
        code: response.status,
        message: "Image upstream unavailable",
      });
      return;
    }
    if (!contentType.toLowerCase().startsWith("image/")) {
      res.status(415).json({ code: 415, message: "Unsupported image content" });
      return;
    }
    if (contentLength > IMAGE_PROXY_MAX_BYTES) {
      res.status(413).json({ code: 413, message: "Image is too large" });
      return;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    if (imageBuffer.length > IMAGE_PROXY_MAX_BYTES) {
      res.status(413).json({ code: 413, message: "Image is too large" });
      return;
    }

    res.status(200);
    res.setHeader("content-type", contentType);
    res.setHeader("cache-control", "public, max-age=86400, s-maxage=604800");
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-length", String(imageBuffer.length));
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.send(imageBuffer);
  } catch {
    res.status(502).json({ code: 502, message: "Image proxy unavailable" });
  } finally {
    clearTimeout(timeout);
  }
};

const getLegacyClawHubAggregateType = (pathValue, rawType = "") => {
  const value = normalizeQueryValue(rawType, "").toLowerCase();
  if (pathValue === "clawhub-skills") {
    if (!value) return "skills-recommended";
    if (value.startsWith("skills-")) return value;
    return `skills-${value}`;
  }
  if (pathValue === "clawhub-plugins") {
    if (!value) return "plugins-recommended";
    if (value.startsWith("plugins-")) return value;
    return `plugins-${value}`;
  }
  return "";
};

const handleLegacyClawHub = async ({
  req,
  res,
  body,
  pathValue,
  baseUrl,
  proxyToken,
  hasProxyConfig,
}) => {
  const type = getLegacyClawHubAggregateType(pathValue, req.query.type);
  const query = {
    ...req.query,
    type,
  };
  const proxyBaseUrlCandidates = hasProxyConfig
    ? getProxyBaseUrlCandidates("clawhub", baseUrl)
    : getProxyBaseUrlCandidates("clawhub", PUBLIC_API_FALLBACK_BASE_URL);
  let proxyResult;

  for (const candidateBaseUrl of proxyBaseUrlCandidates) {
    try {
      const result = await fetchProxyTarget({
        targetUrl: buildProxyTargetUrl(candidateBaseUrl, "clawhub", query),
        req,
        body,
        proxyToken,
      });
      if (result.contentType.includes("application/json") && result.response.ok) {
        proxyResult = result;
        break;
      }
    } catch {
      // Try the next configured ClawHub proxy target.
    }
  }

  if (!proxyResult) {
    sendLocalizedClawHubUnavailable(
      req,
      res,
      "ClawHub legacy upstream unavailable",
      type
    );
    return;
  }

  const locale =
    normalizeReadableLocale(normalizeQueryValue(req.query.locale, "zh-CN")) ||
    "zh-CN";
  try {
    res.status(proxyResult.response.status);
    res.setHeader("content-type", proxyResult.contentType);
    res.send(
      JSON.stringify(localizeClawHubProxyResult(JSON.parse(proxyResult.text), locale, type))
    );
  } catch {
    sendLocalizedClawHubUnavailable(
      req,
      res,
      "ClawHub legacy upstream returned invalid JSON",
      type
    );
  }
};

export default async function handler(req, res) {
  const queryPath = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const requestPath = new URL(req.url, "https://hot.wuaishare.cn").pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/+/, "");
  let pathValue = queryPath || requestPath;
  const normalizedRoute = normalizeApiRoute(pathValue, req.query);
  pathValue = normalizedRoute.pathValue;
  req.query = normalizedRoute.query;

  if (
    pathValue === "analytics" &&
    req.method === "GET" &&
    !req.headers.authorization
  ) {
    res.status(200).json({
      code: 200,
      name: "analytics",
      title: "Analytics",
      type: "dashboard",
      total: 0,
      updateTime: new Date().toISOString(),
      fromCache: false,
      data: [],
      message: "Unauthorized",
    });
    return;
  }

  const body = await readBody(req);

  if (pathValue === "readable-translate" && req.method === "POST") {
    const handled = await handleReadableTranslate(body, res);
    if (handled) return;
  }

  if (pathValue === "image-proxy") {
    await handleImageProxy(req, res);
    return;
  }

  if (pathValue === "weibo") {
    const handled = await handleWeibo(req, res);
    if (handled) return;
  }

  if (pathValue === "bilibili") {
    const handled = await handleBilibili(req, res);
    if (handled) return;
    const type = getBilibiliType(normalizeQueryValue(req.query.type, "all"));
    res.status(502).json({
      code: 502,
      name: "bilibili",
      title: "哔哩哔哩",
      type: BILIBILI_TYPE_LABELS[type],
      subtitle: BILIBILI_TYPE_LABELS[type],
      message: "Bilibili direct API unavailable",
      data: [],
      total: 0,
      fromCache: false,
      updateTime: new Date().toISOString(),
    });
    return;
  }

  if (pathValue === "ithome") {
    const handled = await handleIthome(req, res);
    if (handled) return;
  }

  if (pathValue === "designarena") {
    const handled = await handleDesignArena(req, res);
    if (handled) return;
  }

  if (pathValue === "artificialanalysis") {
    const handled = await handleArtificialAnalysis(req, res);
    if (handled) return;
  }

  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  const proxyToken = process.env.INTERNAL_PROXY_TOKEN;
  const hasProxyConfig = Boolean(baseUrl && proxyToken);

  if (pathValue === "clawhub-skills" || pathValue === "clawhub-plugins") {
    await handleLegacyClawHub({
      req,
      res,
      body,
      pathValue,
      baseUrl,
      proxyToken,
      hasProxyConfig,
    });
    return;
  }

  if (!hasProxyConfig && !PUBLIC_API_FALLBACK_PATHS.has(pathValue)) {
    res.status(500).json({ code: 500, message: "API proxy is not configured" });
    return;
  }

  const proxyBaseUrlCandidates = hasProxyConfig
    ? getProxyBaseUrlCandidates(pathValue, baseUrl)
    : getProxyBaseUrlCandidates(pathValue, PUBLIC_API_FALLBACK_BASE_URL);
  let proxyResult;

  for (const candidateBaseUrl of proxyBaseUrlCandidates) {
    try {
      const result = await fetchProxyTarget({
        targetUrl: buildProxyTargetUrl(candidateBaseUrl, pathValue, req.query),
        req,
        body,
        proxyToken,
      });
      const isJson = result.contentType.includes("application/json");
      const shouldTryNext =
        PUBLIC_API_FALLBACK_PATHS.has(pathValue) &&
        proxyBaseUrlCandidates[proxyBaseUrlCandidates.length - 1] !== candidateBaseUrl &&
        (!isJson || !result.response.ok);

      if (!shouldTryNext) {
        proxyResult = result;
        break;
      }
    } catch {
      // Try the public fallback below for supported ranking sources.
    }
  }

  if (!proxyResult) {
    if (pathValue === "clawhub") {
      sendLocalizedClawHubUnavailable(req, res, "ClawHub upstream unavailable");
      return;
    }
    if (PUBLIC_API_FALLBACK_PATHS.has(pathValue)) {
      redirectToPublicApiFallback(pathValue, req.query, res);
      return;
    }
    res.status(502).json({
      code: 502,
      message: "API proxy upstream unavailable",
    });
    return;
  }

  const { response, contentType, text } = proxyResult;
  if (!contentType.includes("application/json")) {
    if (pathValue === "clawhub") {
      sendLocalizedClawHubUnavailable(
        req,
        res,
        "ClawHub upstream returned non-JSON response"
      );
      return;
    }
    if (PUBLIC_API_FALLBACK_PATHS.has(pathValue)) {
      redirectToPublicApiFallback(pathValue, req.query, res);
      return;
    }
    res.status(502).json({
      code: 502,
      message: "API proxy upstream returned non-JSON response",
    });
    return;
  }
  res.status(response.status);
  res.setHeader("content-type", contentType);
  if (pathValue === "clawhub") {
    try {
      const locale =
        normalizeReadableLocale(normalizeQueryValue(req.query.locale, "zh-CN")) ||
        "zh-CN";
      const type = normalizeQueryValue(req.query.type, "");
      res.send(JSON.stringify(localizeClawHubProxyResult(JSON.parse(text), locale, type)));
      return;
    } catch {}
  }
  res.send(text);
}
