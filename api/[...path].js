export const config = {
  runtime: "nodejs",
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
const DESIGNARENA_LEADERBOARD_URL =
  "https://www.designarena.ai/api/leaderboard";
const DESIGNARENA_JUDGE_SCORES_URL =
  "https://www.designarena.ai/api/leaderboard/judge-scores";
const DESIGNARENA_BASE_URL = "https://www.designarena.ai";
const DESIGNARENA_LEADERBOARD_TYPES = {
  fullstack: {
    title: "Full-Stack WebDev 模型榜",
    category: "fullstack",
    arenaType: "agents",
    href: "/leaderboard/fullstack",
    metric: "elo",
    description: "DesignArena Agentic Full-Stack WebDev 模型排行榜",
  },
  "fullstack-win-rate": {
    title: "Full-Stack WebDev 胜率榜",
    category: "fullstack",
    arenaType: "agents",
    href: "/leaderboard/fullstack",
    metric: "winRate",
    description: "DesignArena Agentic Full-Stack WebDev 模型胜率排行",
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
    title: "Fullstack App Quality 榜",
    dataset: "judge_fullstack",
    metric: "avg_composite",
    description: "DesignArena Fullstack App 质量综合评分榜",
    descBuilder: (item, value, labels) =>
      `${labels.composite} ${formatNumber(value, 2)} · ${labels.samples} ${formatInteger(item.scored_generations)}`,
  },
  "fullstack-backend": {
    title: "Backend Scores 榜",
    dataset: "judge_fullstack",
    metric: "backendScore",
    description: "DesignArena Fullstack App 后端能力评分榜",
    descBuilder: (item, value, labels) =>
      `${labels.backend} ${formatNumber(value, 2)} · API ${formatNumber(item.avg_api_functionality, 2)} · Auth ${formatNumber(item.avg_auth_implementation, 2)} · ${labels.persistence} ${formatNumber(item.avg_e2e_persistence, 2)}`,
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
const DESIGNARENA_METRIC_LABELS = {
  "zh-CN": {
    winRate: "胜率",
    battles: "对战",
    composite: "综合",
    samples: "评分样本",
    backend: "后端",
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

const getDesignArenaTypeParams = () =>
  Object.fromEntries(
    [
      ...Object.entries(DESIGNARENA_LEADERBOARD_TYPES),
      ...Object.entries(DESIGNARENA_SIGNAL_TYPES),
    ].map(([key, meta]) => [key, meta.title])
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

const buildDesignArenaResponse = ({ type, meta, data, updateTime }) => ({
  code: 200,
  name: "designarena",
  title: "DesignArena",
  type: meta.title,
  description: meta.description || "DesignArena AI 模型排行榜",
  link: absoluteDesignArenaUrl(meta.href || "/leaderboard"),
  params: {
    type: {
      name: "榜单分类",
      type: getDesignArenaTypeParams(),
    },
  },
  subtype: meta.title,
  total: data.length,
  fromCache: false,
  updateTime: updateTime || new Date().toISOString(),
  data,
  selectedType: type,
});

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
      type: (leaderboardMeta || signalMeta)?.title || "DesignArena",
      total: 0,
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
      message: "DesignArena upstream unavailable",
    });
    return true;
  }
};

export default async function handler(req, res) {
  const queryPath = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const requestPath = new URL(req.url, "https://hot.wuaishare.cn").pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/+/, "");
  const pathValue = queryPath || requestPath;

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

  if (pathValue === "designarena") {
    const handled = await handleDesignArena(req, res);
    if (handled) return;
  }

  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  const proxyToken = process.env.INTERNAL_PROXY_TOKEN;

  if (!baseUrl || !proxyToken) {
    res.status(500).json({ code: 500, message: "API proxy is not configured" });
    return;
  }

  const targetUrl = new URL(`${baseUrl.replace(/\/+$/, "")}/${pathValue}`);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return;
    if (Array.isArray(value)) {
      value.forEach((item) => targetUrl.searchParams.append(key, item));
      return;
    }
    if (typeof value === "string") {
      targetUrl.searchParams.set(key, value);
    }
  });

  let response;
  try {
    response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: "application/json",
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: req.headers.authorization || "",
        "User-Agent": "DailyHot-Internal-Proxy/1.0",
        "X-Internal-Proxy-Token": proxyToken,
      },
      body,
    });
  } catch (error) {
    res.status(502).json({
      code: 502,
      message: "API proxy upstream unavailable",
    });
    return;
  }

  const contentType = response.headers.get("content-type") || "application/json";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    res.status(502).json({
      code: 502,
      message: "API proxy upstream returned non-JSON response",
    });
    return;
  }
  res.status(response.status);
  res.setHeader("content-type", contentType);
  res.send(text);
}
