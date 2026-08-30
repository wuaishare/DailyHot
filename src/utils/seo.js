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
import {
  getDefaultSourceSubtype,
  getSourceSubtypeOptions,
  shouldCanonicalizeDefaultSubtype,
} from "@/utils/sourceSubtypes";
import {
  getSourceDisplayLabel as getLocalizedSourceDisplayLabel,
  getSourceLabel as getLocalizedSourceLabel,
  getSubtypeLabel as getLocalizedSubtypeLabel,
} from "@/utils/sourceLabels";

const DEFAULT_SEO = {
  title: "吾爱热榜 - 全网热点排行榜聚合与实时趋势追踪",
  description:
    "吾爱热榜聚合微博、知乎、抖音、B站、头条、新闻站与垂直社区热榜，支持分类浏览、榜单切换、自动刷新与多语言阅读，帮助你一站式掌握全网热点。",
  keywords:
    "吾爱热榜,今日热榜,全网热点,热榜聚合,微博热搜,知乎热榜,抖音热榜,B站热榜,头条热榜,实时热点,榜单排行",
  ogImage: "/ico/favicon.png",
  siteName: "吾爱热榜",
  locale: "zh_CN",
};

const SEO_BRAND_NAME_ZH = "吾爱热榜";

const CATEGORY_SEO_MAP = {
  "综合": {
    title: "综合热榜",
    titleTail: "微博、知乎、抖音、头条与新闻站全网热点聚合",
    description:
      "综合热榜聚合微博热搜、知乎热榜、抖音热榜、百度热搜、腾讯新闻、网易新闻等多平台实时热点，适合一站式追踪全网焦点、突发资讯与大众话题。",
    keywords: [
      "综合热榜",
      "全网热点",
      "微博热搜",
      "知乎热榜",
      "抖音热榜",
      "百度热搜",
      "新闻热榜",
      "实时热点",
    ],
  },
  "科技": {
    title: "科技热榜",
    titleTail: "科技新闻、数码资讯与开发者趋势聚合",
    description:
      "科技热榜聚合 36氪、IT之家、少数派、CSDN、掘金、GitHub 趋势、酷安等平台内容，覆盖科技新闻、数码资讯、开源项目、编程实践与开发者社区热点。",
    keywords: [
      "科技热榜",
      "科技新闻",
      "数码资讯",
      "开发者社区",
      "GitHub 趋势",
      "开源项目",
      "CSDN 热榜",
      "掘金热榜",
    ],
  },
  "财经": {
    title: "财经热榜",
    titleTail: "股票、ETF、证券市场与投资话题趋势聚合",
    description:
      "财经热榜聚合雪球投资话题、热股与热门基金，并汇总沪深港、台湾、印度、纽约证券交易所、Nasdaq 市场榜单及全球股指，覆盖A股、港股、美股、中国台湾、日本、韩国、印度、加拿大、澳大利亚、巴西、瑞士、西班牙、意大利、英国、法国、德国与欧元区市场、ETF及证券市场趋势。",
    keywords: [
      "财经热榜",
      "股票成交额榜",
      "ETF成交额榜",
      "上海证券交易所",
      "深圳证券交易所",
      "香港交易所",
      "港股成交额榜",
      "Nasdaq",
      "纽约证券交易所",
      "台湾证券交易所",
      "印度国家证券交易所",
      "NYSE",
      "TWSE",
      "NSE India",
      "美股活跃榜",
      "全球股指",
      "上证指数",
      "恒生指数",
      "纳斯达克指数",
      "雪球热门话题",
      "雪球热股榜",
      "雪球热门基金",
      "A股热榜",
      "证券市场",
      "投资热点",
    ],
  },
  "生活": {
    title: "生活热榜",
    titleTail: "消费、阅读、影视与生活方式热点聚合",
    description:
      "生活热榜聚合什么值得买、微信读书、豆瓣电影、豆瓣小组、纽约时报、中央气象台等内容，覆盖消费决策、热门书影音、天气与日常生活方式话题。",
    keywords: [
      "生活热榜",
      "消费热点",
      "微信读书热榜",
      "豆瓣电影热榜",
      "什么值得买",
      "生活方式",
      "阅读榜单",
      "影视热榜",
    ],
  },
  "游戏": {
    title: "游戏热榜",
    titleTail: "游戏资讯、官方公告与玩家社区讨论聚合",
    description:
      "游戏热榜聚合游戏葡萄、游研社、米游社、原神、崩坏：星穹铁道、英雄联盟等热门榜单，覆盖游戏资讯、官方动态、版本公告与玩家讨论热点。",
    keywords: [
      "游戏热榜",
      "游戏资讯",
      "玩家社区",
      "米游社",
      "原神热榜",
      "星穹铁道热榜",
      "英雄联盟热榜",
      "游戏公告",
    ],
  },
  "社区": {
    title: "社区热榜",
    titleTail: "论坛热议、社区热帖与开发者讨论聚合",
    description:
      "社区热榜聚合百度贴吧、V2EX、NGA、吾爱破解、天涯、Nodeseek 等平台热门帖子，帮助你快速掌握论坛热议、社区热帖与圈层讨论动态。",
    keywords: [
      "社区热榜",
      "论坛热议",
      "V2EX 热榜",
      "百度贴吧",
      "NGA 热帖",
      "吾爱破解",
      "Nodeseek",
      "社区讨论",
    ],
  },
  AI: {
    title: "AI 热榜",
    titleTail: "AI 模型排行榜、AI 资讯与热门工具榜单聚合",
    description:
      "AI 热榜聚合 OpenRouter、Artificial Analysis、Arena AI、LLM Stats、OpenAI、Anthropic、Hugging Face、Product Hunt 等平台，覆盖模型排行、官方动态、论文趋势与 AI 产品发现。",
    keywords: [
      "AI热榜",
      "AI排行榜",
      "大模型排行榜",
      "AI资讯",
      "OpenRouter",
      "OpenAI",
      "Hugging Face",
      "AI产品",
    ],
  },
};

const CATEGORY_LOCALE_SEO_MAP = {
  "财经": {
    en: {
      title: "Finance Rankings - Stocks, ETFs, market activity, and investor topics | DailyHot",
      description:
        "Finance Rankings combine Xueqiu investor topics, hot stocks and popular funds with official Shanghai, Shenzhen, Hong Kong and Nasdaq market activity rankings plus major global market indexes across Asia, India, the U.S. and Europe.",
      keywords:
        "finance rankings,global market indexes,Shanghai Composite,CSI 300,Hang Seng Index,Hang Seng TECH,Nasdaq Composite,Nasdaq-100,NIFTY 50,SENSEX,stock turnover,ETF turnover,HKEX,Nasdaq,Xueqiu,DailyHot",
    },
    "zh-TW": {
      title: "財經熱榜 - 股票、ETF、證券市場與投資話題趨勢聚合 | 吾愛熱榜",
      description:
        "財經熱榜彙整雪球投資話題、熱門股票與熱門基金，以及上海、深圳、香港交易所、Nasdaq 官方市場活躍榜與全球主要指數，涵蓋A股、港股、美股、印度、歐洲、ETF與證券市場趨勢。",
      keywords:
        "財經熱榜,股票成交額榜,ETF成交額榜,上海證券交易所,深圳證券交易所,香港交易所,Nasdaq,NIFTY 50,SENSEX,美股,港股,雪球熱門股票,熱門基金,A股熱榜,證券市場,吾愛熱榜",
    },
    ja: {
      title: "金融ランキング - 株式、ETF、市場活況、投資トピックの集約 | DailyHot",
      description:
        "金融ランキングは Xueqiu の投資トピック、人気株、人気ファンドと、上海・深圳・香港取引所、Nasdaq の公式市場アクティビティ、インドを含む世界主要株価指数を集約します。",
      keywords:
        "金融ランキング,株式売買代金,ETF売買代金,上海証券取引所,深圳証券取引所,香港取引所,Nasdaq,NIFTY 50,SENSEX,米国株,香港株,Xueqiu,人気ファンド,A株,DailyHot",
    },
    ko: {
      title: "금융 랭킹 - 주식, ETF, 시장 거래대금, 투자 이슈 | DailyHot",
      description:
        "금융 랭킹은 Xueqiu 투자 이슈·인기 종목·인기 펀드와 상하이·선전·홍콩거래소, Nasdaq 공식 시장 활동 및 인도를 포함한 글로벌 주요 지수를 함께 제공합니다.",
      keywords:
        "금융 랭킹,주식 거래대금,ETF 거래대금,상하이증권거래소,선전증권거래소,홍콩거래소,Nasdaq,NIFTY 50,SENSEX,미국 주식,홍콩 주식,Xueqiu,인기 펀드,A주,DailyHot",
    },
  },
  AI: {
    en: {
      title: "AI Hot Rankings - AI model leaderboards, AI news, and tool trends | DailyHot",
      description:
        "AI Hot Rankings aggregate OpenRouter, Artificial Analysis, Arena AI, DesignArena, LLM Stats, OpenAI, Anthropic, Hugging Face, Product Hunt, and Hacker News to track model rankings, official AI updates, research trends, and AI product discovery.",
      keywords:
        "AI rankings,AI model leaderboard,OpenRouter,Artificial Analysis,Arena AI,DesignArena,LLM Stats,OpenAI,Anthropic,Hugging Face,AI news,AI tools,DailyHot",
    },
    "zh-TW": {
      title: "AI熱榜 - AI模型排行榜、AI資訊與熱門工具榜單聚合 | 吾愛熱榜",
      description:
        "AI熱榜彙整 OpenRouter、Artificial Analysis、Arena AI、DesignArena、LLM Stats、OpenAI、Anthropic、Hugging Face、Product Hunt 與 Hacker News，追蹤模型排行、官方AI動態、研究趨勢與AI產品發現。",
      keywords:
        "AI熱榜,AI模型排行榜,OpenRouter,Artificial Analysis,Arena AI,DesignArena,LLM Stats,OpenAI,Anthropic,Hugging Face,AI資訊,AI工具,吾愛熱榜",
    },
    ja: {
      title: "AIランキング - AIモデル評価、AIニュース、人気ツール動向の集約 | DailyHot",
      description:
        "AIランキングは OpenRouter、Artificial Analysis、Arena AI、DesignArena、LLM Stats、OpenAI、Anthropic、Hugging Face、Product Hunt、Hacker News を集約し、モデル順位、公式AIニュース、研究動向、AIプロダクト発見を追跡します。",
      keywords:
        "AIランキング,AIモデルランキング,OpenRouter,Artificial Analysis,Arena AI,DesignArena,LLM Stats,OpenAI,Anthropic,Hugging Face,AIニュース,AIツール,DailyHot",
    },
    ko: {
      title: "AI 랭킹 - AI 모델 순위, AI 뉴스, 인기 도구 트렌드 | DailyHot",
      description:
        "AI 랭킹은 OpenRouter, Artificial Analysis, Arena AI, DesignArena, LLM Stats, OpenAI, Anthropic, Hugging Face, Product Hunt, Hacker News를 모아 모델 순위, 공식 AI 소식, 연구 동향, AI 제품 발견을 추적합니다.",
      keywords:
        "AI 랭킹,AI 모델 순위,OpenRouter,Artificial Analysis,Arena AI,DesignArena,LLM Stats,OpenAI,Anthropic,Hugging Face,AI 뉴스,AI 도구,DailyHot",
    },
  },
};

const trimTerminalPunctuation = (value = "") =>
  String(value)
    .trim()
    .replace(/[。！？!?,，；;：:]+$/gu, "");

const escapeRegExp = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const stripLeadingPhrases = (value = "", phrases = []) =>
  phrases
    .filter(Boolean)
    .reduce(
      (result, phrase) =>
        result.replace(new RegExp(`^${escapeRegExp(String(phrase).trim())}[\\s·:：-]*`, "u"), ""),
      String(value).trim()
    )
    .trim();

const stripLeadingZhPossessive = (value = "") =>
  String(value)
    .trim()
    .replace(/^的[\s·:：-]*/u, "")
    .trim();

const stripLeadingZhIntentVerb = (value = "") =>
  String(value)
    .trim()
    .replace(
      /^(?:聚合|追踪|收录|覆盖|精选|汇总|关注|发现|整理|展示|呈现)[\s，,、]*/u,
      ""
    )
    .trim();

const normalizeZhIntent = (value = "") =>
  stripLeadingZhIntentVerb(stripLeadingZhPossessive(value));

const normalizeTitleLabel = (value = "") =>
  String(value)
    .replace(/\s*·\s*/g, " ")
    .replace(/\s+/g, " ")
    .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/gu, "$1$2")
    .trim();

const keywordTokensFrom = (value) =>
  Array.isArray(value)
    ? value.flatMap((item) => keywordTokensFrom(item))
    : String(value || "")
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);

const mergeKeywords = (...segments) =>
  [...new Set(segments.flatMap((segment) => keywordTokensFrom(segment)))].join(",");

const buildZhTitle = (main, detail) =>
  detail
    ? `${normalizeTitleLabel(main)} - ${detail} | ${SEO_BRAND_NAME_ZH}`
    : `${normalizeTitleLabel(main)} | ${SEO_BRAND_NAME_ZH}`;

const appendZhPageSuffix = (label = "") =>
  /[A-Za-z0-9]$/u.test(String(label).trim())
    ? `${String(label).trim()} 页面`
    : `${String(label).trim()}页面`;

const joinZhVerbObject = (verb, object = "") =>
  /^[A-Za-z0-9]/u.test(String(object).trim())
    ? `${verb} ${String(object).trim()}`
    : `${verb}${String(object).trim()}`;

const CLAWHUB_ZH_BASE_SEO = {
  clawhub: {
    titleLabel: "ClawHub",
    intent: "OpenClaw技能与插件聚合榜单入口",
  },
  "clawhub-skills": {
    titleLabel: "ClawHub 技能",
    intent: "OpenClaw技能推荐、安装、星标与分类榜单",
  },
  "clawhub-plugins": {
    titleLabel: "ClawHub 插件",
    intent: "OpenClaw插件推荐、精选、安装与分类榜单",
  },
};

const CLAWHUB_ZH_SUBTYPE_SEO = {
  "skills-recommended": {
    titleSegment: "推荐技能榜",
    intent: "OpenClaw技能推荐与精选方案榜单",
  },
  "skills-featured": {
    titleSegment: "精选技能榜",
    intent: "OpenClaw精选技能与高质量方案榜单",
  },
  "skills-stars": {
    titleSegment: "星标最多技能榜",
    intent: "OpenClaw技能星标热度与社区关注排行",
  },
  "skills-installs": {
    titleSegment: "安装最多技能榜",
    intent: "OpenClaw技能安装量与流行度排行",
  },
  "skills-updated": {
    titleSegment: "最近更新技能榜",
    intent: "OpenClaw技能更新动态与维护活跃榜单",
  },
  "skills-newest": {
    titleSegment: "最新发布技能榜",
    intent: "OpenClaw新发布技能与生态新增榜单",
  },
  "skills-name": {
    titleSegment: "技能名称索引",
    intent: "OpenClaw技能名称索引与快速查找入口",
  },
  "skills-mcp-tools": {
    titleSegment: "MCP 工具技能分类",
    intent: "OpenClaw MCP工具技能分类与工具生态榜单",
  },
  "skills-prompts": {
    titleSegment: "提示词技能分类",
    intent: "OpenClaw提示词技能分类与提示工程资源榜单",
  },
  "skills-workflows": {
    titleSegment: "工作流技能分类",
    intent: "OpenClaw工作流技能分类与自动化流程榜单",
  },
  "skills-dev-tools": {
    titleSegment: "开发工具技能分类",
    intent: "OpenClaw开发工具技能分类与工程效率榜单",
  },
  "skills-data": {
    titleSegment: "数据与 API 技能分类",
    intent: "OpenClaw数据与API技能分类和集成资源榜单",
  },
  "skills-security": {
    titleSegment: "安全技能分类",
    intent: "OpenClaw安全技能分类与风险防护工具榜单",
  },
  "skills-automation": {
    titleSegment: "自动化技能分类",
    intent: "OpenClaw自动化技能分类与任务执行工具榜单",
  },
  "skills-other": {
    titleSegment: "其他技能分类",
    intent: "OpenClaw其他技能分类与补充生态资源榜单",
  },
  "plugins-recommended": {
    titleSegment: "推荐插件榜",
    intent: "OpenClaw插件推荐与工具生态榜单",
  },
  "plugins-featured": {
    titleSegment: "精选插件榜",
    intent: "OpenClaw精选插件与高质量扩展榜单",
  },
  "plugins-installs": {
    titleSegment: "安装最多插件榜",
    intent: "OpenClaw插件安装量与流行度排行",
  },
  "plugins-updated": {
    titleSegment: "最近更新插件榜",
    intent: "OpenClaw插件更新动态与维护活跃榜单",
  },
  "plugins-data": {
    titleSegment: "数据与 API 插件分类",
    intent: "OpenClaw数据与API插件分类和集成资源榜单",
  },
};

const DESIGNARENA_ZH_SUBTYPE_SEO = {
  fullstack: {
    titleSegment: "Agentic 全栈应用模型榜",
    intent: "Agentic全栈应用生成、后端能力与完整产品化模型排行",
  },
  "fullstack-win-rate": {
    titleSegment: "Agentic 全栈应用胜率榜",
    intent: "Agentic全栈应用生成模型胜率排行",
  },
  agon_webapps: {
    titleSegment: "Agentic 前端模型榜",
    intent: "Agentic前端与React应用生成模型排行",
  },
  "agon_webapps-win-rate": {
    titleSegment: "Agentic 前端胜率榜",
    intent: "Agentic前端与React应用生成模型胜率排行",
  },
  "fullstack-quality": {
    titleSegment: "全栈应用质量榜",
    intent: "全栈应用质量、数据建模与交互完成度评分排行",
  },
  "fullstack-backend": {
    titleSegment: "后端能力评分榜",
    intent: "全栈应用后端能力、API、认证与持久化评分排行",
  },
  "daily-usage": {
    titleSegment: "日活使用榜",
    intent: "模型生成应用日活用户与真实使用表现排行",
  },
  "real-world-reach": {
    titleSegment: "真实触达榜",
    intent: "模型生成应用真实用户触达与传播表现排行",
  },
  retention: {
    titleSegment: "回访用户榜",
    intent: "模型生成应用用户回访率与留存表现排行",
  },
  downloads: {
    titleSegment: "应用下载榜",
    intent: "模型生成应用源码下载率与保存价值排行",
  },
  website: {
    titleSegment: "Website 模型榜",
    intent: "WebDev网站生成与前端设计模型排行",
  },
  "website-win-rate": {
    titleSegment: "Website 胜率榜",
    intent: "WebDev网站生成与前端设计模型胜率排行",
  },
  uicomponent: {
    titleSegment: "UI 组件模型榜",
    intent: "UI组件生成与界面设计模型排行",
  },
  dataviz: {
    titleSegment: "数据可视化模型榜",
    intent: "数据可视化与图表生成模型排行",
  },
  svg: {
    titleSegment: "SVG 模型榜",
    intent: "SVG生成与矢量设计模型排行",
  },
  gamedev: {
    titleSegment: "游戏开发模型榜",
    intent: "游戏开发与互动场景生成模型排行",
  },
  agentic_gamedev: {
    titleSegment: "Agentic 游戏开发模型榜",
    intent: "Agentic游戏开发与可交互玩法生成模型排行",
  },
  mobileapps: {
    titleSegment: "移动 App 模型榜",
    intent: "移动App生成与移动端应用开发模型排行",
  },
  nativeapps: {
    titleSegment: "原生 App 模型榜",
    intent: "原生App生成与端侧应用开发模型排行",
  },
  "3d": {
    titleSegment: "3D 设计模型榜",
    intent: "3D设计与空间生成模型排行",
  },
  ascii: {
    titleSegment: "ASCII Art 模型榜",
    intent: "ASCII Art字符画与文本视觉生成模型排行",
  },
  agon_slides: {
    titleSegment: "Agentic 演示文稿模型榜",
    intent: "Agentic演示文稿与幻灯片生成模型排行",
  },
  agon_slides_html: {
    titleSegment: "Agentic HTML 演示文稿模型榜",
    intent: "Agentic HTML演示文稿与网页幻灯片生成模型排行",
  },
  slides: {
    titleSegment: "演示文稿模型榜",
    intent: "演示文稿与幻灯片生成模型排行",
  },
  image: {
    titleSegment: "图像生成模型榜",
    intent: "图像生成与视觉创作模型排行",
  },
  imagetoimage: {
    titleSegment: "图像编辑模型榜",
    intent: "图像编辑、图生图与视觉修改模型排行",
  },
  graphicdesign: {
    titleSegment: "平面设计模型榜",
    intent: "平面设计与视觉创意生成模型排行",
  },
  logo: {
    titleSegment: "Logo 模型榜",
    intent: "Logo生成与品牌视觉设计模型排行",
  },
  video: {
    titleSegment: "视频生成模型榜",
    intent: "视频生成与动态内容创作模型排行",
  },
  videotovideo: {
    titleSegment: "视频编辑模型榜",
    intent: "视频编辑、视频重绘与视频到视频模型排行",
  },
  imagetovideo: {
    titleSegment: "图像转视频模型榜",
    intent: "图像转视频与动态镜头生成模型排行",
  },
  multitovideo: {
    titleSegment: "多输入转视频模型榜",
    intent: "多输入视频生成与复合素材转视频模型排行",
  },
  multimodaltovideo: {
    titleSegment: "多模态转视频模型榜",
    intent: "多模态视频生成与图文音视频综合生成模型排行",
  },
  tts: {
    titleSegment: "TTS 模型榜",
    intent: "文本转语音与音频生成模型排行",
  },
  builders: {
    titleSegment: "AI 构建器榜",
    intent: "AI应用构建器、建站工具与产品化能力排行",
  },
};

const ITHOME_ZH_SUBTYPE_SEO = {
  day: {
    titleSegment: "日榜",
    intent: "今日科技数码热点、IT新闻与热门资讯排行",
  },
  week: {
    titleSegment: "周榜",
    intent: "本周科技数码热点、行业新闻与热门资讯排行",
  },
  month: {
    titleSegment: "月榜",
    intent: "本月科技数码热点、行业新闻与热门资讯排行",
  },
  comments: {
    titleSegment: "热评榜",
    intent: "高互动评论话题、科技争议与热门讨论排行",
  },
  hot: {
    titleSegment: "资讯热榜",
    intent: "资讯热度、科技新闻与数码产品动态排行",
  },
  list: {
    titleSegment: "滚动新闻",
    intent: "滚动新闻、科技快讯与数码新品动态",
  },
};

const BILIBILI_ZH_SUBTYPE_SEO = {
  all: {
    titleSegment: "综合热门",
    intent: "全站热视频、UP主内容与流行视频趋势",
  },
  weekly: {
    titleSegment: "每周必看",
    intent: "哔哩哔哩每周必看精选视频与高质量内容推荐",
  },
  history: {
    titleSegment: "入站必刷",
    intent: "哔哩哔哩入站必刷经典视频与宝藏内容合集",
  },
  rank: {
    titleSegment: "排行榜",
    intent: "哔哩哔哩全站视频排行榜、播放热度与内容趋势",
  },
  music: {
    titleSegment: "全站音乐榜",
    intent: "哔哩哔哩全站音乐视频排行、翻唱演奏与热门音乐内容",
  },
};

const ARTIFICIALANALYSIS_ZH_SUBTYPE_SEO = {
  providers: {
    titleSegment: "API 提供商与端点榜",
    intent: "LLM API 提供商、模型端点、价格、速度与首包延迟对比",
  },
  "coding-agents": {
    titleSegment: "编码智能体榜",
    intent: "AI 编码智能体基准、任务通过率、成本与执行时长排行",
  },
  "text-to-image": {
    titleSegment: "文生图榜",
    intent: "AI 文生图模型 Elo、样本量与图像生成价格排行",
  },
};

const getClawHubSubtypeSeoKey = (sourceKey, subtypeSlug) => {
  if (!subtypeSlug) return "";
  if (sourceKey === "clawhub") return subtypeSlug;
  if (sourceKey === "clawhub-skills") return `skills-${subtypeSlug}`;
  if (sourceKey === "clawhub-plugins") return `plugins-${subtypeSlug}`;
  return "";
};

const getClawHubZhRouteSeo = ({ sourceKey, subtypeSlug }) => {
  const baseSeo = CLAWHUB_ZH_BASE_SEO[sourceKey];
  if (!baseSeo) return null;

  const subtypeSeo = CLAWHUB_ZH_SUBTYPE_SEO[
    getClawHubSubtypeSeoKey(sourceKey, subtypeSlug)
  ];
  if (subtypeSeo) {
    return {
      titleLabel: normalizeTitleLabel(`ClawHub ${subtypeSeo.titleSegment}`),
      intent: subtypeSeo.intent,
    };
  }

  return baseSeo;
};

const getDesignArenaZhRouteSeo = ({ sourceKey, subtypeSlug }) => {
  if (sourceKey !== "designarena" || !subtypeSlug) return null;
  const subtypeSeo = DESIGNARENA_ZH_SUBTYPE_SEO[subtypeSlug];
  if (!subtypeSeo) return null;

  return {
    titleLabel: normalizeTitleLabel(`DesignArena ${subtypeSeo.titleSegment}`),
    intent: subtypeSeo.intent,
  };
};

const getIthomeZhRouteSeo = ({ sourceKey, subtypeSlug }) => {
  if (sourceKey !== "ithome" || !subtypeSlug) return null;
  const subtypeSeo = ITHOME_ZH_SUBTYPE_SEO[subtypeSlug];
  if (!subtypeSeo) return null;

  return {
    titleLabel: normalizeTitleLabel(`IT之家${subtypeSeo.titleSegment}`),
    intent: subtypeSeo.intent,
  };
};

const getBilibiliZhRouteSeo = ({ sourceKey, subtypeSlug }) => {
  if (sourceKey !== "bilibili" || !subtypeSlug) return null;
  const subtypeSeo = BILIBILI_ZH_SUBTYPE_SEO[subtypeSlug];
  if (!subtypeSeo) return null;

  return {
    titleLabel: normalizeTitleLabel(`哔哩哔哩${subtypeSeo.titleSegment}`),
    intent: subtypeSeo.intent,
  };
};

const getArtificialAnalysisZhRouteSeo = ({ sourceKey, subtypeSlug }) => {
  if (sourceKey !== "artificialanalysis" || !subtypeSlug) return null;
  const subtypeSeo = ARTIFICIALANALYSIS_ZH_SUBTYPE_SEO[subtypeSlug];
  if (!subtypeSeo) return null;

  return {
    titleLabel: normalizeTitleLabel(`Artificial Analysis ${subtypeSeo.titleSegment}`),
    intent: subtypeSeo.intent,
  };
};

const getZhRouteSeo = ({ sourceKey, subtypeSlug }) =>
  getClawHubZhRouteSeo({ sourceKey, subtypeSlug }) ||
  getDesignArenaZhRouteSeo({ sourceKey, subtypeSlug }) ||
  getIthomeZhRouteSeo({ sourceKey, subtypeSlug }) ||
  getBilibiliZhRouteSeo({ sourceKey, subtypeSlug }) ||
  getArtificialAnalysisZhRouteSeo({ sourceKey, subtypeSlug });

const buildZhListIntent = ({
  sourceLabel,
  subtypeLabel,
  meta,
}) => {
  const rawDescription = trimTerminalPunctuation(meta?.description || "");
  const stripped = normalizeZhIntent(
    stripLeadingPhrases(rawDescription, [sourceLabel, subtypeLabel])
  );
  return stripped || "实时热榜与趋势榜";
};

const LIST_SEO_MAP = {
  weibo: {
    label: "微博热搜",
    keywords: "微博热搜,微博热榜,热搜榜",
    description: "微博实时热搜榜单，追踪全网热门话题与趋势。",
  },
  xueqiu: {
    label: "雪球",
    keywords: "雪球热门话题,雪球热股榜,雪球热门基金,财经热点,投资话题,证券市场热点",
    description: "聚合雪球热门投资话题、全球热股榜与热门基金，覆盖股票行情、基金长期收益与投资社区关注焦点。",
  },
  sse: {
    label: "上海证券交易所",
    keywords: "上海证券交易所,上交所,沪市股票成交额榜,沪市股票成交量榜,沪市股票涨幅榜,沪市股票跌幅榜,沪市ETF成交额榜,A股行情,证券市场",
    description: "上海证券交易所官方全市场行情排行，覆盖沪市股票成交额、成交量、涨幅、跌幅 Top20，并提供官方 ETF 成交额排行。",
  },
  szse: {
    label: "深圳证券交易所",
    keywords: "深圳证券交易所,深交所,深市股票成交额榜,深市股票成交量榜,深市股票涨幅榜,深市股票跌幅榜,成交笔数榜,换手率榜,深市ETF成交额榜,A股行情,证券市场",
    description: "深圳证券交易所官方指标排名，覆盖深市股票成交额、成交量、成交笔数、涨幅、跌幅、换手率 Top20，并提供官方 ETF 成交额排行。",
  },
  hkex: {
    label: "香港交易所",
    keywords: "香港交易所,港交所,HKEX,港股成交额榜,港股成交量榜,港股涨幅榜,港股跌幅榜,主板,GEM,香港股票,证券市场",
    description: "基于香港交易所官方日行情和最新股票代码分配规则，提供港股主板及 GEM 证券成交额、成交量、涨幅与跌幅 Top20。",
  },
  nasdaq: {
    label: "Nasdaq",
    keywords: "Nasdaq,Nasdaq most active,美股成交额活跃榜,美股成交量榜,美股涨幅榜,美股跌幅榜,NVDA,美股热榜,美国股市",
    description: "汇总 Nasdaq 官方美元成交额活跃榜，并基于官方股票筛选器全市场行情提供成交量、涨幅与跌幅 Top20。",
  },
  nyse: {
    label: "纽约证券交易所",
    keywords: "纽约证券交易所,NYSE,NYSE成交额榜,NYSE成交量榜,NYSE涨幅榜,NYSE跌幅榜,美股行情,美国股市",
    description: "聚合 NYSE 上市股票行情，提供成交额、成交量、涨幅与跌幅 Top20，并明确标注 Nasdaq Stock Screener 行情数据来源。",
  },
  twse: {
    label: "台湾证券交易所",
    keywords: "台湾证券交易所,TWSE,台股成交额榜,台股成交量榜,台股涨幅榜,台股跌幅榜,台湾股票",
    description: "基于台湾证券交易所官方 OpenAPI 全市场日行情，提供台股成交额、成交量、涨幅与跌幅 Top20。",
  },
  nse: {
    label: "印度国家证券交易所",
    keywords: "印度国家证券交易所,NSE India,NSE成交额榜,NSE成交量榜,NSE涨幅榜,NSE跌幅榜,印度股票",
    description: "基于印度国家证券交易所官方市场分析接口，提供 NSE 股票成交额、成交量、涨幅与跌幅 Top20。",
  },
  asx: {
    label: "澳大利亚证券交易所",
    keywords: "澳大利亚证券交易所,ASX,澳股成交额榜,澳股成交量榜,澳股成交笔数榜,澳大利亚股票",
    description: "基于澳大利亚证券交易所官方每日 Top20 报告，提供澳股成交额、成交量与成交笔数排行。",
  },
  "global-indexes": {
    label: "全球股指",
    keywords: "全球股指,全球指数,上证指数,沪深300,深证成指,创业板指,恒生指数,恒生科技指数,台湾加权指数,TAIEX,标普500,S&P 500,SPX,道琼斯指数,Dow Jones,罗素2000,Russell 2000,纳斯达克综合指数,Nasdaq 100,日经225,Nikkei 225,KOSPI,KOSPI 200,KOSDAQ,NIFTY 50,SENSEX,S&P TSX,TSX Composite,S&P ASX 200,ASX 200,Ibovespa,SMI,IBEX 35,FTSE MIB,富时100,FTSE 100,CAC 40,DAX,EURO STOXX 50",
    description: "聚合中国大陆、中国香港、中国台湾、日本、韩国、印度、加拿大、澳大利亚、巴西、美国、瑞士、西班牙、意大利、英国、法国、德国与欧元区主要股票指数行情，覆盖标普500、道琼斯、纳斯达克、日经225、KOSPI、NIFTY 50、SENSEX、S&P/TSX Composite、S&P/ASX 200、Ibovespa、SMI、IBEX 35、FTSE MIB、FTSE 100、CAC 40、DAX、EURO STOXX 50 等全球核心市场基准。"
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
    keywords: "B站热榜,哔哩哔哩热门,综合热门,每周必看,入站必刷,视频排行榜",
    description: "哔哩哔哩综合热门、每周必看、入站必刷、排行榜与全站音乐榜聚合。",
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
  nytimes: {
    label: "纽约时报",
    keywords: "纽约时报,纽约时报中文网,纽约时报全球版,国际新闻",
    description: "纽约时报中文网与全球版新闻榜单，覆盖国际时事、商业、科技与文化报道。",
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
  acfun: {
    label: "AcFun 排行榜",
    keywords: "AcFun,AcFun 排行榜,视频热榜,弹幕视频",
    description: "AcFun 视频排行榜，覆盖综合、动画、游戏、科技、番剧等分区与时间热度。",
  },
  miyoushe: {
    label: "米游社热榜",
    keywords: "米游社,米游社公告,米哈游游戏资讯,原神,崩坏星穹铁道,绝区零",
    description: "米游社官方动态榜单，覆盖米哈游游戏公告、活动、资讯与社区更新。",
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
    label: "OpenRouter",
    keywords: "OpenRouter,AI 模型热度,模型使用趋势",
    description: "OpenRouter 模型使用热度与调用趋势榜。",
  },
  artificialanalysis: {
    label: "Artificial Analysis 排行榜",
    keywords: "Artificial Analysis,AI 排行榜,模型评测",
    description: "Artificial Analysis 模型、API 提供商与专项 AI 榜单入口。",
  },
  lmarena: {
    label: "Arena AI 排行榜",
    keywords: "Arena AI,AI 对战榜,模型竞技场,多模态排行榜",
    description: "Arena AI 多模态、Agent、WebDev、图像与视频对战排行榜。",
  },
  "arena-ai": {
    label: "Arena AI 排行榜",
    keywords: "Arena AI,AI 对战榜,模型竞技场,多模态排行榜",
    description: "Arena AI 多模态、Agent、WebDev、图像与视频对战排行榜。",
  },
  designarena: {
    label: "DesignArena",
    keywords: "DesignArena,AI 设计榜单,Agentic WebDev,Full-Stack模型榜,AI创意生成榜,Daily Usage",
    description: "DesignArena AI 模型与应用生成榜单入口。",
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
  openai: {
    label: "OpenAI",
    keywords: "OpenAI,OpenAI 新闻,OpenAI Research,OpenAI 官方动态",
    description: "OpenAI 官方新闻与研究更新聚合榜单。",
  },
  "openai-news": {
    label: "OpenAI",
    keywords: "OpenAI,OpenAI 新闻,OpenAI 更新,OpenAI 博客",
    description: "OpenAI 官方新闻与产品发布动态。",
  },
  "openai-research": {
    label: "OpenAI",
    keywords: "OpenAI,OpenAI Research,OpenAI 研究动态,AI 官方研究",
    description: "OpenAI 官方研究与技术发布更新。",
  },
  "anthropic-news": {
    label: "Anthropic",
    keywords: "Anthropic,Claude 更新,Anthropic 博客",
    description: "Anthropic 官方新闻、Claude 更新与发布动态。",
  },
  "deepmind-blog": {
    label: "DeepMind",
    keywords: "DeepMind 博客,Google DeepMind,AI 研究更新",
    description: "Google DeepMind 官方博客与研究更新。",
  },
  "meta-ai-blog": {
    label: "Meta AI",
    keywords: "Meta AI,Meta Llama,Meta 官方 AI 动态",
    description: "Meta 官方 AI 动态与 Llama 相关新闻更新。",
  },
  huggingface: {
    label: "Hugging Face",
    keywords: "Hugging Face,官方博客,模型趋势,热门论文",
    description: "Hugging Face 官方博客、模型趋势与热门论文聚合榜单。",
  },
  "huggingface-blog": {
    label: "Hugging Face",
    keywords: "Hugging Face 博客,AI 开源,模型生态",
    description: "Hugging Face 官方博客与模型生态更新。",
  },
  "mistral-news": {
    label: "Mistral",
    keywords: "Mistral 新闻,Mistral AI,模型更新",
    description: "Mistral 官方产品与模型更新动态。",
  },
  "cohere-blog": {
    label: "Cohere",
    keywords: "Cohere 博客,Cohere AI,企业 AI",
    description: "Cohere 官方博客、研究与产品更新。",
  },
  "hf-models": {
    label: "Hugging Face",
    keywords: "Hugging Face 模型,模型趋势,开源模型",
    description: "Hugging Face 模型趋势榜，观察热门开源模型。",
  },
  "hf-papers": {
    label: "Hugging Face",
    keywords: "Hugging Face 热门论文,AI 论文趋势,热门论文",
    description: "Hugging Face 热门论文趋势榜。",
  },
  paperswithcode: {
    label: "Papers with Code",
    keywords: "Papers with Code,热门论文,论文代码,镜像榜",
    description: "Papers with Code 论文代码镜像榜，当前由 Hugging Face Trending Papers 承载。",
  },
  "producthunt-ai": {
    label: "Product Hunt",
    keywords: "Product Hunt AI,AI 产品发现,AI 新品",
    description: "Product Hunt 中与 AI 相关的产品发现流。",
  },
  "hackernews-ai": {
    label: "Hacker News",
    keywords: "Hacker News AI,AI 社区热议,技术讨论",
    description: "Hacker News 中与 AI 相关的热门讨论。",
  },
  "clawhub-skills": {
    label: "ClawHub 技能",
    keywords: "ClawHub 技能,OpenClaw技能,AI 技能榜,Agent Skills",
    description: "ClawHub 的 OpenClaw技能推荐、安装、星标与分类榜单。",
  },
  clawhub: {
    label: "ClawHub",
    keywords: "ClawHub,OpenClaw,OpenClaw技能,OpenClaw插件,AI 技能与插件榜",
    description: "ClawHub 的 OpenClaw技能与插件聚合榜单入口。",
  },
  "clawhub-plugins": {
    label: "ClawHub 插件",
    keywords: "ClawHub 插件,OpenClaw插件,AI 插件榜,Agent 插件",
    description: "ClawHub 的 OpenClaw插件推荐、精选、安装与分类榜单。",
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
  const fallbackLabel = LIST_SEO_MAP[typeKey]?.label || "";
  return getLocalizedSourceLabel(typeKey, locale, fallbackLabel);
};

const getSubtypeLabel = (sourceSlug, subtypeSlug, locale = "zh-CN") => {
  if (!sourceSlug || !subtypeSlug) return "";
  const subtype = getSourceSubtypeOptions(sourceSlug).find(
    (item) => item.value === subtypeSlug
  );
  const rawLabel = subtype?.label || "";
  const normalizedLocale = normalizeLocale(locale);
  if (!rawLabel) return prettifySlug(subtypeSlug);
  const localizedLabel = getLocalizedSubtypeLabel(subtype, normalizedLocale);
  return localizedLabel || prettifySlug(subtypeSlug);
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
  const categoryMeta = CATEGORY_SEO_MAP[rawCategoryName];
  if (locale === "zh-CN" && categoryMeta) {
    const title = buildZhTitle(categoryMeta.title, categoryMeta.titleTail);
    const description = categoryMeta.description;
    const keywords = mergeKeywords(
      categoryMeta.keywords,
      rawCategoryName,
      categoryName,
      SEO_BRAND_NAME_ZH
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
          name: categoryMeta.title,
          itemListOrder: "Descending",
        },
      },
    };
  }
  const localizedCategoryMeta = CATEGORY_LOCALE_SEO_MAP[rawCategoryName]?.[locale];
  if (localizedCategoryMeta) {
    const { title, description, keywords } = localizedCategoryMeta;
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
  }
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
  const sourceDisplayLabel =
    getLocalizedSourceDisplayLabel(sourceKey, locale, sourceLabel) || sourceLabel;
  const sourceSeoLabel =
    locale === "zh-CN" && meta?.label ? meta.label : sourceLabel;
  const subtypeSlug = Array.isArray(route?.params?.subtypeSlug)
    ? route.params.subtypeSlug[0]
    : route?.params?.subtypeSlug;
  const effectiveSubtypeSlug =
    subtypeSlug ||
    (shouldCanonicalizeDefaultSubtype(sourceKey)
      ? getDefaultSourceSubtype(sourceKey)
      : "");
  const subtypeLabel = getSubtypeLabel(sourceKey, effectiveSubtypeSlug, locale);
  const label = subtypeLabel
    ? `${sourceDisplayLabel} · ${subtypeLabel}`
    : sourceSeoLabel;
  const descriptionLabel = subtypeLabel ? sourceDisplayLabel : sourceSeoLabel;
  const defaultTitleLabel = normalizeTitleLabel(
    subtypeLabel ? `${sourceDisplayLabel} ${subtypeLabel}` : sourceSeoLabel
  );
  const zhRouteSeo =
    locale === "zh-CN"
      ? getZhRouteSeo({ sourceKey, subtypeSlug: effectiveSubtypeSlug })
      : null;
  const titleLabel = zhRouteSeo?.titleLabel || defaultTitleLabel;
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
            label: descriptionLabel,
            subtype: subtypeLabel,
          },
          { locale }
        )
      : locale === "zh-CN" && meta.description
        ? meta.description
        : i18n.global.t("seo.sourceDescription", { label: descriptionLabel }, { locale });
  const keywords =
    subtypeLabel
      ? i18n.global.t(
          "seo.sourceSubtypeKeywords",
          {
            label: descriptionLabel,
            subtype: subtypeLabel,
          },
          { locale }
        )
      : locale === "zh-CN" && meta.keywords
        ? meta.keywords
        : i18n.global.t("seo.sourceKeywords", { label: descriptionLabel }, { locale });
  const localizedSiteName = i18n.global.t("common.siteName", {}, { locale });
  const zhIntent =
    zhRouteSeo?.intent ||
    buildZhListIntent({
      sourceLabel: sourceSeoLabel,
      subtypeLabel,
      meta,
    });
  const listName = locale === "zh-CN" ? titleLabel : label;
  const title =
    locale === "zh-CN"
      ? buildZhTitle(titleLabel, zhIntent)
      : `${label} - ${localizedSiteName}`;
  const finalDescription =
    locale === "zh-CN"
      ? `${appendZhPageSuffix(titleLabel)}，${joinZhVerbObject(
          "聚合",
          zhIntent
        )}、对应平台最新数据与原站入口，支持实时浏览、榜单切换、分页跳转与一键直达。`
      : description || localizedDefaultDescription;
  const finalKeywords =
    locale === "zh-CN"
      ? mergeKeywords(
          keywords,
          sourceDisplayLabel,
          sourceLabel,
          subtypeLabel,
          zhIntent,
          titleLabel,
          SEO_BRAND_NAME_ZH
        )
      : keywords || localizedDefaultKeywords;

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
        name: listName,
        itemListOrder: "Descending",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: listName,
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
    : buildAbsoluteUrl(buildLocalePathFromRoute(route, locale), siteUrl);
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
  const isListRoute = ["list", "list-locale", "list-legacy"].includes(route?.name);
  const isHomeRoute = ["home", "home-locale"].includes(route?.name);

  const title =
    listSeo?.title ||
    categorySeo?.title ||
    pageSeo?.title ||
    (isHomeRoute ? localizedHomeTitle : null) ||
    (isListRoute ? localizedListTitle : null) ||
    resolveValue(meta.seoTitle || meta.title, context) ||
    localizedHomeTitle ||
    DEFAULT_SEO.title;
  const description =
    listSeo?.description ||
    categorySeo?.description ||
    pageSeo?.description ||
    (isHomeRoute ? localizedHomeDescription : null) ||
    (isListRoute ? localizedListDescription : null) ||
    resolveValue(meta.description, context) ||
    localizedHomeDescription ||
    DEFAULT_SEO.description;
  const keywords =
    listSeo?.keywords ||
    categorySeo?.keywords ||
    (isHomeRoute ? localizedHomeKeywords : null) ||
    (isListRoute ? localizedListKeywords : null) ||
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
