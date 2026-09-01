import { getPublicAssetUrl } from "@/utils/publicAssets";

const SOURCE_LOGO_MAP = {
  "super-deals": "/logo/wool/super-deals.png",
  "0818tuan": "/logo/wool/0818tuan.png",
  "nodeloc-deals": "/logo/wool/nodeloc.png",
  "douban-wool": "/logo/douban-group.png",
  "douban-pet-wool": "/logo/douban-group.png",
  "steam-deals": "https://store.steampowered.com/favicon.ico",
  "epic-free-games": "/logo/game/epic.ico",
  "xiaoheihe-deals": "/logo/game/xiaoheihe.png",
  ggdeals: "https://gg.deals/favicon.ico",
  "gog-deals": "/logo/game/gog.ico",
  xueqiu: "/logo/xueqiu.png",
  sse: "https://www.sse.com.cn/favicon.ico",
  szse: "https://res.szse.cn/common/images/favicon.ico",
  hkex: "https://www.hkex.com.hk/assets/images/favicon.png",
  nasdaq: "https://www.nasdaq.com/sites/acquia.prod/files/favicon.ico",
  nyse: "/logo/market/nyse.gif",
  twse: "https://www.twse.com.tw/favicon.ico",
  nse: "https://www.nseindia.com/assets/images/favicon.ico",
  asx: "/logo/market/asx.png",
  "global-indexes": "/ico/favicon.png",
  "openrouter-rankings": "/logo/ai/openrouter-rankings.svg",
  artificialanalysis: "/logo/ai/artificialanalysis.png",
  lmarena: "/logo/ai/arena-ai.png",
  "arena-ai": "/logo/ai/arena-ai.png",
  designarena: "/logo/ai/designarena.png",
  "aicpb-rankings": "/logo/ai/aicpb-rankings.png",
  "llm-stats": "/logo/ai/llm-stats.svg",
  "skills-rank": "/logo/ai/skills-rank.svg",
  openai: "/logo/ai/openai-news.svg",
  "openai-news": "/logo/ai/openai-news.svg",
  "openai-research": "/logo/ai/openai-research.svg",
  "anthropic-news": "/logo/ai/anthropic-news.svg",
  "deepmind-blog": "/logo/ai/deepmind-blog.svg",
  "meta-ai-blog": "/logo/ai/meta-ai-blog.svg",
  huggingface: "/logo/ai/huggingface-blog.svg",
  "huggingface-blog": "/logo/ai/huggingface-blog.svg",
  "hf-models": "/logo/ai/hf-models.svg",
  "hf-papers": "/logo/ai/hf-papers.svg",
  paperswithcode: "/logo/ai/paperswithcode.svg",
  "mistral-news": "/logo/ai/mistral-news.svg",
  "cohere-blog": "/logo/ai/cohere-blog.svg",
  "perplexity-blog": "/logo/ai/perplexity-blog.svg",
  "xai-news": "/logo/ai/xai-news.svg",
  "reddit-localllama": "/logo/ai/reddit.png",
  "github-ai-trending": "/logo/github.png",
  "reddit-machinelearning": "/logo/ai/reddit.png",
  "reddit-artificial": "/logo/ai/reddit.png",
  clawhub: "/logo/ai/clawhub-icon.png",
  "clawhub-skills": "/logo/ai/clawhub-icon.png",
  "clawhub-plugins": "/logo/ai/clawhub-icon.png",
};

const SOURCE_LOGO_ALIAS_MAP = {
  "producthunt-ai": "producthunt",
  "hackernews-ai": "hackernews",
  "sina-ai": "sina",
};

export const getSourceLogo = (name) => {
  const path = SOURCE_LOGO_MAP[name]
    ? SOURCE_LOGO_MAP[name]
    : `/logo/${SOURCE_LOGO_ALIAS_MAP[name] || name}.png`;
  return getPublicAssetUrl(path);
};

export const getSourceLogoFallback = () =>
  getPublicAssetUrl("/ico/favicon.png");
