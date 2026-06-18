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
  "openrouter-rankings": { en: "OpenRouter Rankings" },
  artificialanalysis: { en: "Artificial Analysis" },
  lmarena: { en: "LMArena" },
  designarena: { en: "DesignArena" },
  "aicpb-rankings": { en: "AICPB Global AI Rankings" },
  "llm-stats": { en: "LLM Stats" },
  "skills-rank": { en: "Skills Rank" },
  "openai-news": { en: "OpenAI News" },
  "openai-research": { en: "OpenAI Research" },
  "anthropic-news": { en: "Anthropic News" },
  "deepmind-blog": { en: "DeepMind Blog" },
  "meta-ai-blog": { en: "Meta AI" },
  "huggingface-blog": { en: "Hugging Face Blog" },
  "mistral-news": { en: "Mistral News" },
  "cohere-blog": { en: "Cohere Blog" },
  "hf-models": { en: "Hugging Face Models" },
  "hf-papers": { en: "Hugging Face Papers" },
  paperswithcode: { en: "Papers with Code" },
  "producthunt-ai": { en: "Product Hunt AI" },
  "hackernews-ai": { en: "Hacker News AI" },
  "clawhub-skills": { en: "ClawHub Skills" },
  clawhub: { en: "ClawHub" },
  "clawhub-plugins": { en: "ClawHub Plugins" },
  "sina-ai": { en: "Sina AI" },
};

const GROUP_LABEL_OVERRIDES = {
  usage: { en: "Usage" },
  ecosystem: { en: "Ecosystem" },
  scene: { en: "Use Cases" },
  frontend: { en: "Frontend" },
  creative: { en: "Creative" },
  skills: { en: "Skills" },
  plugins: { en: "Plugins" },
  sort: { en: "Rankings" },
  category: { en: "Categories" },
  default: { en: "Latest" },
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
  if (normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") {
    return rawLabel || getSubtypeLabel(group?.items?.[0], locale);
  }
  const override = GROUP_LABEL_OVERRIDES[groupKey];
  if (override?.[normalizedLocale]) return override[normalizedLocale];
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
