import { normalizeLocale } from "@/utils/locale";

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
  "openrouter-rankings": { en: "OpenRouter" },
  artificialanalysis: { en: "Artificial Analysis" },
  lmarena: { en: "LMArena" },
  designarena: { en: "DesignArena" },
  "aicpb-rankings": { en: "AICPB Global AI Rankings" },
  "llm-stats": { en: "LLM Stats" },
  "skills-rank": { en: "Skills Rank" },
  "openai-news": { en: "OpenAI" },
  "openai-research": { en: "OpenAI" },
  "anthropic-news": { en: "Anthropic" },
  "deepmind-blog": { en: "DeepMind" },
  "meta-ai-blog": { en: "Meta AI" },
  "huggingface-blog": { en: "Hugging Face" },
  "mistral-news": { en: "Mistral" },
  "cohere-blog": { en: "Cohere" },
  "hf-models": { en: "Hugging Face" },
  "hf-papers": { en: "Hugging Face" },
  paperswithcode: { en: "Papers with Code" },
  "producthunt-ai": { en: "Product Hunt" },
  "hackernews-ai": { en: "Hacker News" },
  "clawhub-skills": { en: "ClawHub Skills" },
  clawhub: { en: "ClawHub" },
  "clawhub-plugins": { en: "ClawHub Plugins" },
  "sina-ai": { en: "Sina AI" },
};

const GROUP_LABEL_OVERRIDES = {
  usage: {
    "zh-CN": "热度",
    "zh-TW": "熱度",
    en: "Usage",
    ja: "利用状況",
    ko: "사용량",
  },
  ecosystem: {
    "zh-CN": "生态",
    "zh-TW": "生態",
    en: "Ecosystem",
    ja: "エコシステム",
    ko: "생태계",
  },
  scene: {
    "zh-CN": "场景",
    "zh-TW": "場景",
    en: "Use Cases",
    ja: "ユースケース",
    ko: "활용 장면",
  },
  frontend: {
    "zh-CN": "前端",
    "zh-TW": "前端",
    en: "Frontend",
    ja: "フロントエンド",
    ko: "프론트엔드",
  },
  creative: {
    "zh-CN": "创意",
    "zh-TW": "創意",
    en: "Creative",
    ja: "クリエイティブ",
    ko: "크리에이티브",
  },
  skills: {
    "zh-CN": "技能",
    "zh-TW": "技能",
    en: "Skills",
    ja: "スキル",
    ko: "스킬",
  },
  plugins: {
    "zh-CN": "插件",
    "zh-TW": "外掛",
    en: "Plugins",
    ja: "プラグイン",
    ko: "플러그인",
  },
  sort: {
    "zh-CN": "榜单",
    "zh-TW": "榜單",
    en: "Rankings",
    ja: "ランキング",
    ko: "랭킹",
  },
  category: {
    "zh-CN": "分类",
    "zh-TW": "分類",
    en: "Categories",
    ja: "カテゴリ",
    ko: "분류",
  },
  default: {
    "zh-CN": "最新",
    "zh-TW": "最新",
    en: "Latest",
    ja: "最新",
    ko: "최신",
  },
};

const SUBTYPE_LABEL_OVERRIDES = {
  Recommended: {
    "zh-CN": "推荐",
    "zh-TW": "推薦",
    en: "Recommended",
    ja: "おすすめ",
    ko: "추천",
  },
  Featured: {
    "zh-CN": "精选",
    "zh-TW": "精選",
    en: "Featured",
    ja: "注目",
    ko: "추천작",
  },
  "Most starred": {
    "zh-CN": "星标最多",
    "zh-TW": "星標最多",
    en: "Most starred",
    ja: "最多スター",
    ko: "최다 스타",
  },
  "Most installed": {
    "zh-CN": "安装最多",
    "zh-TW": "安裝最多",
    en: "Most installed",
    ja: "最多インストール",
    ko: "최다 설치",
  },
  "Recently updated": {
    "zh-CN": "最近更新",
    "zh-TW": "最近更新",
    en: "Recently updated",
    ja: "最近更新",
    ko: "최근 업데이트",
  },
  Newest: {
    "zh-CN": "最新发布",
    "zh-TW": "最新發布",
    en: "Newest",
    ja: "最新",
    ko: "최신",
  },
  Name: {
    "zh-CN": "名称",
    "zh-TW": "名稱",
    en: "Name",
    ja: "名前",
    ko: "이름",
  },
  "MCP Tools": {
    "zh-CN": "MCP 工具",
    "zh-TW": "MCP 工具",
    en: "MCP Tools",
    ja: "MCP ツール",
    ko: "MCP 도구",
  },
  Prompts: {
    "zh-CN": "提示词",
    "zh-TW": "提示詞",
    en: "Prompts",
    ja: "プロンプト",
    ko: "프롬프트",
  },
  Workflows: {
    "zh-CN": "工作流",
    "zh-TW": "工作流",
    en: "Workflows",
    ja: "ワークフロー",
    ko: "워크플로",
  },
  "Dev Tools": {
    "zh-CN": "开发工具",
    "zh-TW": "開發工具",
    en: "Dev Tools",
    ja: "開発ツール",
    ko: "개발 도구",
  },
  "Data & APIs": {
    "zh-CN": "数据与 API",
    "zh-TW": "資料與 API",
    en: "Data & APIs",
    ja: "データと API",
    ko: "데이터와 API",
  },
  Security: {
    "zh-CN": "安全",
    "zh-TW": "安全",
    en: "Security",
    ja: "セキュリティ",
    ko: "보안",
  },
  Automation: {
    "zh-CN": "自动化",
    "zh-TW": "自動化",
    en: "Automation",
    ja: "自動化",
    ko: "자동화",
  },
  Other: {
    "zh-CN": "其他",
    "zh-TW": "其他",
    en: "Other",
    ja: "その他",
    ko: "기타",
  },
  Website: {
    "zh-CN": "网站",
    "zh-TW": "網站",
    en: "Website",
    ja: "Webサイト",
    ko: "웹사이트",
  },
  "UI Component": {
    "zh-CN": "UI 组件",
    "zh-TW": "UI 元件",
    en: "UI Component",
    ja: "UI コンポーネント",
    ko: "UI 컴포넌트",
  },
  DataViz: {
    "zh-CN": "数据可视化",
    "zh-TW": "資料視覺化",
    en: "DataViz",
    ja: "データ可視化",
    ko: "데이터 시각화",
  },
  SVG: {
    "zh-CN": "SVG",
    "zh-TW": "SVG",
    en: "SVG",
    ja: "SVG",
    ko: "SVG",
  },
  "Game Dev": {
    "zh-CN": "游戏开发",
    "zh-TW": "遊戲開發",
    en: "Game Dev",
    ja: "ゲーム開発",
    ko: "게임 개발",
  },
  "3D": {
    "zh-CN": "3D",
    "zh-TW": "3D",
    en: "3D",
    ja: "3D",
    ko: "3D",
  },
  Slides: {
    "zh-CN": "演示文稿",
    "zh-TW": "簡報",
    en: "Slides",
    ja: "スライド",
    ko: "슬라이드",
  },
  Image: {
    "zh-CN": "图像",
    "zh-TW": "圖像",
    en: "Image",
    ja: "画像",
    ko: "이미지",
  },
  Video: {
    "zh-CN": "视频",
    "zh-TW": "影片",
    en: "Video",
    ja: "動画",
    ko: "비디오",
  },
};

const containsNonLatin = (value = "") =>
  /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/.test(value);

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

export const prettifySlug = (value = "") =>
  titleCaseToken(
    String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

export const getSourceLabel = (
  sourceName,
  locale = "zh-CN",
  fallbackLabel = "",
) => {
  const normalizedLocale = normalizeLocale(locale);
  const overrides = SOURCE_LABEL_OVERRIDES[sourceName] || null;
  if (overrides?.[normalizedLocale]) return overrides[normalizedLocale];
  if ((normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") && fallbackLabel) {
    return fallbackLabel;
  }
  if (overrides?.en) return overrides.en;
  if (fallbackLabel && !containsNonLatin(fallbackLabel)) return fallbackLabel;
  return prettifySlug(sourceName || fallbackLabel || "rankings");
};

export const getSubtypeLabel = (item, locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const rawLabel = item?.label || "";
  const fallbackKey = item?.value || rawLabel;
  const override =
    SUBTYPE_LABEL_OVERRIDES[fallbackKey] || SUBTYPE_LABEL_OVERRIDES[rawLabel];
  if (override?.[normalizedLocale]) {
    return override[normalizedLocale];
  }
  if (!fallbackKey) return "";
  if (normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") {
    return rawLabel || prettifySlug(fallbackKey);
  }
  if (rawLabel && !containsNonLatin(rawLabel)) return rawLabel;
  return prettifySlug(fallbackKey);
};

export const getSubtypeGroupLabel = (group, locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const rawLabel = group?.label || "";
  const groupKey = group?.key || rawLabel || group?.items?.[0]?.value || "";
  const override = GROUP_LABEL_OVERRIDES[groupKey];
  if (override?.[normalizedLocale]) return override[normalizedLocale];
  const rawOverride = GROUP_LABEL_OVERRIDES[rawLabel];
  if (rawOverride?.[normalizedLocale]) return rawOverride[normalizedLocale];
  if (normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") {
    return rawLabel || getSubtypeLabel(group?.items?.[0], locale);
  }
  if (rawLabel && !containsNonLatin(rawLabel)) return rawLabel;
  return prettifySlug(groupKey);
};

export const localizeSubtypeGroups = (groups = [], locale = "zh-CN") =>
  groups.map((group) => ({
    ...group,
    label: getSubtypeGroupLabel(group, locale),
    items: (group.items || []).map((item) => ({
      ...item,
      label: getSubtypeLabel(item, locale),
    })),
  }));
