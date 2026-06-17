const SOURCE_LOGO_MAP = {
  "openrouter-rankings": "/logo/ai/openrouter-rankings.svg",
  artificialanalysis: "/logo/ai/artificialanalysis.png",
  lmarena: "/logo/ai/lmarena.svg",
  designarena: "/logo/ai/designarena.png",
  "aicpb-rankings": "/logo/ai/aicpb-rankings.png",
  "llm-stats": "/logo/ai/llm-stats.svg",
  "skills-rank": "/logo/ai/skills-rank.svg",
  "openai-news": "/logo/ai/openai-news.svg",
  "openai-research": "/logo/ai/openai-research.svg",
  "anthropic-news": "/logo/ai/anthropic-news.svg",
  "deepmind-blog": "/logo/ai/deepmind-blog.svg",
  "meta-ai-blog": "/logo/ai/meta-ai-blog.svg",
  "huggingface-blog": "/logo/ai/huggingface-blog.svg",
  "hf-models": "/logo/ai/hf-models.svg",
  "hf-papers": "/logo/ai/hf-papers.svg",
  paperswithcode: "/logo/ai/paperswithcode.svg",
  "mistral-news": "/logo/ai/mistral-news.svg",
  "cohere-blog": "/logo/ai/cohere-blog.svg",
  "perplexity-blog": "/logo/ai/perplexity-blog.svg",
  "xai-news": "/logo/ai/xai-news.svg",
  "reddit-localllama": "/logo/ai/reddit.png",
  "reddit-machinelearning": "/logo/ai/reddit.png",
  "reddit-artificial": "/logo/ai/reddit.png",
  "clawhub-skills": "/logo/ai/clawhub-icon.png",
  "clawhub-plugins": "/logo/ai/clawhub-icon.png",
};

const SOURCE_LOGO_ALIAS_MAP = {
  "producthunt-ai": "producthunt",
  "hackernews-ai": "hackernews",
  "sina-ai": "sina",
};

export const getSourceLogo = (name, cacheVersion = "") => {
  const path = SOURCE_LOGO_MAP[name]
    ? SOURCE_LOGO_MAP[name]
    : `/logo/${SOURCE_LOGO_ALIAS_MAP[name] || name}.png`;
  return `${path}?v=${cacheVersion}`;
};

export const getSourceLogoFallback = () => "/ico/favicon.png";
