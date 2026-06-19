const STORAGE_PREFIX = "dailyhot:source-subtype:";

const SOURCE_SUBTYPE_GROUPS = {
  baidu: [
    {
      key: "default",
      label: "",
      items: [
        { label: "热搜", value: "realtime" },
        { label: "小说", value: "novel" },
        { label: "电影", value: "movie" },
        { label: "电视剧", value: "teleplay" },
        { label: "汽车", value: "car" },
        { label: "游戏", value: "game" },
      ],
    },
  ],
  hostloc: [
    {
      key: "default",
      label: "",
      items: [
        { label: "最新回复", value: "new" },
        { label: "最新发表", value: "newthread" },
      ],
    },
  ],
  tianya: [
    {
      key: "default",
      label: "",
      items: [
        { label: "首页", value: "index" },
        { label: "精品", value: "featured" },
      ],
    },
  ],
  linuxdo: [
    {
      key: "default",
      label: "",
      items: [
        { label: "日榜", value: "daily" },
        { label: "周榜", value: "weekly" },
      ],
    },
  ],
  "douban-movie": [
    {
      key: "cinema",
      label: "热映",
      items: [{ label: "热映", value: "movie_showing" }],
    },
    {
      key: "new",
      label: "新片榜",
      items: [{ label: "新片榜", value: "movie_hot" }],
    },
    {
      key: "movie",
      label: "电影",
      items: [
        { label: "热门", value: "movie_hot_gaia" },
        { label: "最新", value: "movie_latest" },
      ],
    },
    {
      key: "tv",
      label: "电视剧",
      items: [
        { label: "综合", value: "tv_hot" },
        { label: "国产剧", value: "tv_domestic" },
        { label: "综艺", value: "show_hot" },
        { label: "欧美剧", value: "tv_american" },
        { label: "日剧", value: "tv_japanese" },
        { label: "韩剧", value: "tv_korean" },
        { label: "动画", value: "tv_animation" },
        { label: "纪录片", value: "tv_documentary" },
      ],
    },
  ],
  designarena: [
    {
      key: "agentic",
      label: "Web Dev (Agentic)",
      items: [
        { label: "Full-Stack ELO", value: "fullstack" },
        { label: "Full-Stack Win Rate", value: "fullstack-win-rate" },
        { label: "Frontend ELO", value: "agon_webapps" },
        { label: "Frontend Win Rate", value: "agon_webapps-win-rate" },
      ],
    },
    {
      key: "quality",
      label: "Quality & Usage",
      items: [
        { label: "Fullstack App Quality", value: "fullstack-quality" },
        { label: "Backend Scores", value: "fullstack-backend" },
        { label: "Daily Usage", value: "daily-usage" },
        { label: "Real-World Reach", value: "real-world-reach" },
        { label: "Returning Users", value: "retention" },
        { label: "App Downloads", value: "downloads" },
      ],
    },
    {
      key: "code",
      label: "Code",
      items: [
        { label: "Website", value: "website" },
        { label: "Website Win Rate", value: "website-win-rate" },
        { label: "UI Component", value: "uicomponent" },
        { label: "Data Visualization", value: "dataviz" },
        { label: "Game Dev", value: "gamedev" },
        { label: "Agentic Game Dev", value: "agentic_gamedev" },
        { label: "Mobile App", value: "mobileapps" },
        { label: "Native App", value: "nativeapps" },
        { label: "3D Design", value: "3d" },
        { label: "SVG", value: "svg" },
        { label: "ASCII Art", value: "ascii" },
      ],
    },
    {
      key: "slides",
      label: "Slides",
      items: [
        { label: "Agentic Slides", value: "agon_slides" },
        { label: "Agentic HTML Slides", value: "agon_slides_html" },
        { label: "Slides", value: "slides" },
      ],
    },
    {
      key: "image",
      label: "Image",
      items: [
        { label: "Image", value: "image" },
        { label: "Image Editing", value: "imagetoimage" },
        { label: "Graphic Design", value: "graphicdesign" },
        { label: "Logo", value: "logo" },
      ],
    },
    {
      key: "video",
      label: "Video",
      items: [
        { label: "Video", value: "video" },
        { label: "Video Editing", value: "videotovideo" },
        { label: "Image to Video", value: "imagetovideo" },
        { label: "Multi to Video", value: "multitovideo" },
        { label: "Multimodal to Video", value: "multimodaltovideo" },
      ],
    },
    {
      key: "audio",
      label: "Audio",
      items: [
        { label: "TTS", value: "tts" },
      ],
    },
    {
      key: "builders",
      label: "Builders",
      items: [
        { label: "AI Builder", value: "builders" },
      ],
    },
  ],
  "arena-ai": [
    {
      key: "chat",
      label: "Chat",
      items: [
        { label: "综合", value: "text" },
        { label: "Agent", value: "agent" },
        { label: "Vision", value: "vision" },
        { label: "Document", value: "document" },
        { label: "Search", value: "search" },
      ],
    },
    {
      key: "code",
      label: "Code",
      items: [
        { label: "WebDev", value: "code-webdev" },
        { label: "HTML", value: "code-webdev-html" },
        { label: "React", value: "code-webdev-react" },
        { label: "Image to WebDev", value: "code-image-to-webdev" },
      ],
    },
    {
      key: "image",
      label: "Image",
      items: [
        { label: "Text to Image", value: "text-to-image" },
        { label: "Image Edit", value: "image-edit" },
      ],
    },
    {
      key: "video",
      label: "Video",
      items: [
        { label: "Text to Video", value: "text-to-video" },
        { label: "Image to Video", value: "image-to-video" },
        { label: "Video Edit", value: "video-edit" },
      ],
    },
  ],
  "artificialanalysis": [
    {
      key: "default",
      label: "",
      items: [
        { label: "模型榜", value: "models" },
        { label: "厂商榜", value: "providers" },
      ],
    },
  ],
  "aicpb-rankings": [
    {
      key: "global",
      label: "全球",
      items: [
        { label: "网站", value: "global-web" },
        { label: "App", value: "global-app" },
        { label: "云服务", value: "ai-cloud-web" },
      ],
    },
    {
      key: "segments",
      label: "细分",
      items: [
        { label: "中国", value: "china-web" },
        { label: "聊天", value: "chatbot-web" },
        { label: "搜索", value: "search-web" },
        { label: "Vibe Coding", value: "vibe-coding-web" },
        { label: "Agent", value: "agent-web" },
        { label: "Claw Agent", value: "openclaw-agent-web" },
        { label: "角色", value: "character-web" },
        { label: "图片生成", value: "image-generator-web" },
        { label: "图片编辑", value: "image-editor-web" },
        { label: "视频生成", value: "video-generator-web" },
        { label: "视频编辑", value: "video-editor-web" },
        { label: "PPT", value: "ppt-web" },
        { label: "音乐", value: "music-web" },
        { label: "会议", value: "meeting-web" },
      ],
    },
    {
      key: "growth",
      label: "增速",
      items: [
        { label: "全球增长", value: "global-growth-web" },
        { label: "中国增长", value: "china-growth-web" },
        { label: "Claw 增长", value: "openclaw-growth-web" },
        { label: "全球放缓", value: "global-slowdown-web" },
      ],
    },
  ],
  "llm-stats": [
    {
      key: "core",
      label: "综合",
      items: [
        { label: "总榜", value: "llm-leaderboard" },
        { label: "开源榜", value: "open-llm-leaderboard" },
      ],
    },
    {
      key: "scenario",
      label: "场景",
      items: [
        { label: "编程", value: "best-ai-for-coding" },
        { label: "写作", value: "best-ai-for-writing" },
        { label: "数学", value: "best-ai-for-math" },
        { label: "研究", value: "best-ai-for-research" },
        { label: "长上下文", value: "best-ai-for-long-context" },
        { label: "工具调用", value: "best-ai-for-tool-calling" },
        { label: "推理", value: "best-ai-for-reasoning" },
        { label: "图像生成", value: "best-ai-for-image-generation" },
        { label: "视频生成", value: "best-ai-for-video-generation" },
      ],
    },
  ],
  openai: [
    {
      key: "default",
      label: "",
      items: [
        { label: "官方新闻", value: "news" },
        { label: "官方研究", value: "research" },
      ],
    },
  ],
  huggingface: [
    {
      key: "default",
      label: "",
      items: [
        { label: "官方博客", value: "blog" },
        { label: "模型榜", value: "models" },
        { label: "论文榜", value: "papers" },
      ],
    },
  ],
  "openrouter-rankings": [
    {
      key: "usage",
      label: "热度",
      items: [
        { label: "模型周榜", value: "models-week" },
        { label: "厂商份额", value: "market-share" },
        { label: "工具调用", value: "tools" },
        { label: "多模态输入", value: "images" },
        { label: "图像输出", value: "image-output" },
      ],
    },
    {
      key: "ecosystem",
      label: "生态",
      items: [
        { label: "应用日榜", value: "apps-day" },
        { label: "应用周榜", value: "apps-week" },
        { label: "应用月榜", value: "apps-month" },
        { label: "性能榜", value: "performance" },
        { label: "AA 智能", value: "benchmarks-aa-intelligence" },
      ],
    },
    {
      key: "scene",
      label: "场景",
      items: [
        { label: "编程", value: "use-case-programming" },
        { label: "英文", value: "natural-language-english" },
        { label: "Python", value: "programming-language-python" },
        { label: "10K 上下文", value: "context-length-10k" },
      ],
    },
  ],
  github: [
    {
      key: "default",
      label: "",
      items: [
        { label: "日榜", value: "daily" },
        { label: "周榜", value: "weekly" },
        { label: "月榜", value: "monthly" },
      ],
    },
  ],
  clawhub: [
    {
      key: "skills",
      label: "Skills",
      items: [
        { label: "Recommended Skills", value: "skills-recommended" },
        { label: "Featured Skills", value: "skills-featured" },
        { label: "Most starred Skills", value: "skills-stars" },
        { label: "Most installed Skills", value: "skills-installs" },
        { label: "Recently updated Skills", value: "skills-updated" },
        { label: "Newest Skills", value: "skills-newest" },
        { label: "Skill Name Index", value: "skills-name" },
        { label: "MCP Tool Skills", value: "skills-mcp-tools" },
        { label: "Prompt Skills", value: "skills-prompts" },
        { label: "Workflow Skills", value: "skills-workflows" },
        { label: "Developer Tool Skills", value: "skills-dev-tools" },
        { label: "Data & API Skills", value: "skills-data" },
        { label: "Security Skills", value: "skills-security" },
        { label: "Automation Skills", value: "skills-automation" },
        { label: "Other Skills", value: "skills-other" },
      ],
    },
    {
      key: "plugins",
      label: "Plugins",
      items: [
        { label: "Recommended Plugins", value: "plugins-recommended" },
        { label: "Featured Plugins", value: "plugins-featured" },
        { label: "Most installed Plugins", value: "plugins-installs" },
        { label: "Recently updated Plugins", value: "plugins-updated" },
        { label: "Data & API Plugins", value: "plugins-data" },
      ],
    },
  ],
  "clawhub-skills": [
    {
      key: "sort",
      label: "榜单",
      items: [
        { label: "Recommended", value: "recommended" },
        { label: "Featured", value: "featured" },
        { label: "Most starred", value: "stars" },
        { label: "Most installed", value: "installs" },
        { label: "Recently updated", value: "updated" },
        { label: "Newest", value: "newest" },
        { label: "Name", value: "name" },
      ],
    },
    {
      key: "category",
      label: "分类",
      items: [
        { label: "MCP Tools", value: "mcp-tools" },
        { label: "Prompts", value: "prompts" },
        { label: "Workflows", value: "workflows" },
        { label: "Dev Tools", value: "dev-tools" },
        { label: "Data & APIs", value: "data" },
        { label: "Security", value: "security" },
        { label: "Automation", value: "automation" },
        { label: "Other", value: "other" },
      ],
    },
  ],
  "clawhub-plugins": [
    {
      key: "sort",
      label: "榜单",
      items: [
        { label: "Recommended", value: "recommended" },
        { label: "Featured", value: "featured" },
        { label: "Most installed", value: "installs" },
        { label: "Recently updated", value: "updated" },
      ],
    },
    {
      key: "category",
      label: "分类",
      items: [
        { label: "Data & APIs", value: "data" },
      ],
    },
  ],
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) return value[0] || null;
  return value ?? null;
};

export const getSourceSubtypeGroups = (sourceName) =>
  SOURCE_SUBTYPE_GROUPS[sourceName] || [];

export const getSourceSubtypeOptions = (sourceName) =>
  getSourceSubtypeGroups(sourceName).flatMap((group) => group.items || []);

export const getSourceSubtypeStorageKey = (sourceName) =>
  `${STORAGE_PREFIX}${sourceName}`;

export const readSourceSubtype = (sourceName) => {
  if (!sourceName || typeof localStorage === "undefined") return null;
  const stored = localStorage.getItem(getSourceSubtypeStorageKey(sourceName));
  return normalizeValue(stored);
};

export const persistSourceSubtype = (sourceName, subtype) => {
  if (!sourceName || typeof localStorage === "undefined") return;
  const key = getSourceSubtypeStorageKey(sourceName);
  if (!subtype) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.setItem(key, subtype);
};

export const resolveSourceSubtype = (options, preferredSubtype) => {
  const candidate = normalizeValue(preferredSubtype);
  if (!options.length) return null;
  if (candidate && options.some((item) => item.value === candidate)) {
    return candidate;
  }
  return options[0]?.value || null;
};

export const buildSourceSubtypeParams = (sourceName, subtype) => {
  const resolved = resolveSourceSubtype(
    getSourceSubtypeOptions(sourceName),
    subtype
  );
  if (!resolved) return {};
  return { type: resolved };
};
