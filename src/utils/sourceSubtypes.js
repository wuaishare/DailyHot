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
        { label: "最新热门", value: "hot" },
        { label: "最新精华", value: "digest" },
      ],
    },
  ],
  tianya: [
    {
      key: "default",
      label: "",
      items: [
        { label: "首页", value: "index" },
        { label: "默认", value: "default" },
        { label: "排行", value: "rank" },
      ],
    },
  ],
  ithome: [
    {
      key: "period",
      label: "周期",
      items: [
        { label: "日榜", value: "day" },
        { label: "周榜", value: "week" },
        { label: "月榜", value: "month" },
        { label: "热评榜", value: "comments" },
      ],
    },
    {
      key: "feed",
      label: "资讯",
      items: [
        { label: "资讯热榜", value: "hot" },
        { label: "滚动新闻", value: "list" },
      ],
    },
  ],
  "sina-news": [
    {
      key: "rank",
      label: "榜单",
      items: [
        { label: "总排行", value: "1" },
        { label: "视频排行", value: "2" },
        { label: "图片排行", value: "3" },
        { label: "国内新闻", value: "4" },
        { label: "国际新闻", value: "5" },
        { label: "社会新闻", value: "6" },
        { label: "体育新闻", value: "7" },
        { label: "财经新闻", value: "8" },
        { label: "娱乐新闻", value: "9" },
        { label: "科技新闻", value: "10" },
        { label: "军事新闻", value: "11" },
      ],
    },
  ],
  bilibili: [
    {
      key: "popular",
      label: "热门",
      items: [
        { label: "综合热门", value: "all" },
        { label: "每周必看", value: "weekly" },
        { label: "入站必刷", value: "history" },
        { label: "排行榜", value: "rank" },
        { label: "全站音乐榜", value: "music" },
      ],
    },
  ],
  "super-deals": [
    {
      key: "feed",
      label: "",
      items: [
        { label: "最新线报", value: "latest" },
        { label: "1小时排行", value: "1h" },
        { label: "3小时排行", value: "3h" },
        { label: "6小时排行", value: "6h" },
      ],
    },
  ],
  "0818tuan": [
    {
      key: "feed",
      label: "",
      items: [
        { label: "最新线报", value: "latest" },
        { label: "长期优惠券", value: "coupon" },
      ],
    },
  ],
  "nodeloc-deals": [
    {
      key: "feed",
      label: "",
      items: [
        { label: "羊毛党", value: "wool" },
        { label: "优惠情报", value: "deals" },
      ],
    },
  ],
  "douban-wool": [
    {
      key: "feed",
      label: "",
      items: [
        { label: "买组", value: "buy" },
        { label: "拼组", value: "groupbuy" },
      ],
    },
  ],
  "douban-pet-wool": [
    {
      key: "feed",
      label: "",
      items: [
        { label: "爱猫生活", value: "catlife" },
        { label: "爱猫澡盆", value: "bathtub" },
        { label: "狗组", value: "dog" },
      ],
    },
  ],
  smzdm: [
    {
      key: "period",
      label: "周期",
      items: [
        { label: "今日热门", value: "1" },
        { label: "周热门", value: "7" },
        { label: "月热门", value: "30" },
      ],
    },
  ],
  sina: [
    {
      key: "rank",
      label: "榜单",
      items: [
        { label: "新浪热榜", value: "all" },
        { label: "热议榜", value: "hotcmnt" },
        { label: "视频热榜", value: "minivideo" },
        { label: "娱乐热榜", value: "ent" },
        { label: "AI热榜", value: "ai" },
        { label: "汽车热榜", value: "auto" },
        { label: "育儿热榜", value: "mother" },
        { label: "时尚热榜", value: "fashion" },
        { label: "旅游热榜", value: "travel" },
        { label: "ESG热榜", value: "esg" },
      ],
    },
  ],
  weread: [
    {
      key: "rank",
      label: "榜单",
      items: [
        { label: "飙升榜", value: "rising" },
        { label: "热搜榜", value: "hot_search" },
        { label: "新书榜", value: "newbook" },
        { label: "小说榜", value: "general_novel_rising" },
        { label: "总榜", value: "all" },
      ],
    },
  ],
  "36kr": [
    {
      key: "rank",
      label: "榜单",
      items: [
        { label: "人气榜", value: "hot" },
        { label: "视频榜", value: "video" },
        { label: "热议榜", value: "comment" },
        { label: "收藏榜", value: "collect" },
      ],
    },
  ],
  xueqiu: [
    {
      key: "rank",
      label: "榜单",
      param: "type",
      items: [
        { label: "热门话题", value: "topics" },
        { label: "热股榜", value: "stocks" },
        { label: "热门基金", value: "funds" },
      ],
    },
  ],
  sse: [
    {
      key: "rank",
      label: "榜单",
      param: "type",
      items: [
        { label: "成交额", value: "stock" },
        { label: "成交量", value: "stock-volume" },
        { label: "涨幅榜", value: "stock-gain" },
        { label: "跌幅榜", value: "stock-loss" },
        { label: "ETF成交额", value: "etf" },
      ],
    },
  ],
  szse: [
    {
      key: "rank",
      label: "榜单",
      param: "type",
      items: [
        { label: "成交额", value: "stock" },
        { label: "成交量", value: "stock-volume" },
        { label: "成交笔数", value: "stock-trades" },
        { label: "涨幅榜", value: "stock-gain" },
        { label: "跌幅榜", value: "stock-loss" },
        { label: "换手率", value: "stock-turnover" },
        { label: "ETF成交额", value: "etf" },
      ],
    },
  ],
  hkex: [
    {
      key: "rank",
      label: "榜单",
      param: "type",
      items: [
        { label: "成交额", value: "turnover" },
        { label: "成交量", value: "volume" },
        { label: "涨幅榜", value: "gain" },
        { label: "跌幅榜", value: "loss" },
      ],
    },
  ],
  nasdaq: [
    {
      key: "rank",
      label: "榜单",
      param: "type",
      items: [
        { label: "成交额", value: "dollar" },
        { label: "成交量", value: "volume" },
        { label: "涨幅榜", value: "gain" },
        { label: "跌幅榜", value: "loss" },
      ],
    },
  ],
  nyse: [
    { key: "rank", label: "榜单", param: "type", items: [
      { label: "成交额", value: "turnover" },
      { label: "成交量", value: "volume" },
      { label: "涨幅榜", value: "gain" },
      { label: "跌幅榜", value: "loss" },
    ] },
  ],
  twse: [
    { key: "rank", label: "榜单", param: "type", items: [
      { label: "成交额", value: "turnover" },
      { label: "成交量", value: "volume" },
      { label: "涨幅榜", value: "gain" },
      { label: "跌幅榜", value: "loss" },
    ] },
  ],
  nse: [
    { key: "rank", label: "榜单", param: "type", items: [
      { label: "成交额", value: "turnover" },
      { label: "成交量", value: "volume" },
      { label: "涨幅榜", value: "gain" },
      { label: "跌幅榜", value: "loss" },
    ] },
  ],
  asx: [
    { key: "rank", label: "榜单", param: "type", items: [
      { label: "成交额", value: "turnover" },
      { label: "成交量", value: "volume" },
      { label: "成交笔数", value: "trades" },
    ] },
  ],
  nytimes: [
    {
      key: "region",
      label: "地区",
      param: "type",
      items: [
        { label: "中文网", value: "china" },
        { label: "全球版", value: "global" },
      ],
    },
  ],
  hupu: [
    {
      key: "board",
      label: "板块",
      items: [
        { label: "主干道", value: "1" },
        { label: "恋爱区", value: "6" },
        { label: "校园区", value: "11" },
        { label: "历史区", value: "12" },
        { label: "摄影区", value: "612" },
      ],
    },
  ],
  juejin: [
    {
      key: "category",
      label: "分类",
      items: [
        { label: "综合", value: "1" },
        { label: "后端", value: "6809637769959178254" },
        { label: "前端", value: "6809637767543259144" },
        { label: "Android", value: "6809635626879549454" },
        { label: "iOS", value: "6809635626661445640" },
        { label: "人工智能", value: "6809637773935378440" },
        { label: "开发工具", value: "6809637771511070734" },
        { label: "代码人生", value: "6809637776263217160" },
        { label: "阅读", value: "6809637772874219534" },
      ],
    },
  ],
  v2ex: [
    {
      key: "topic",
      label: "主题",
      items: [
        { label: "最热主题", value: "hot" },
        { label: "最新主题", value: "latest" },
      ],
    },
  ],
  miyoushe: [
    {
      key: "news",
      label: "动态",
      items: [
        { label: "公告", value: "1" },
        { label: "活动", value: "2" },
        { label: "资讯", value: "3" },
      ],
    },
    {
      key: "game",
      label: "游戏",
      param: "game",
      items: [
        { label: "崩坏3", value: "game-honkai", apiValue: "1" },
        { label: "原神", value: "game-genshin", apiValue: "2" },
        { label: "崩坏学园2", value: "game-houkai2", apiValue: "3" },
        { label: "未定事件簿", value: "game-tears-of-themis", apiValue: "4" },
        { label: "大别野", value: "game-villa", apiValue: "5" },
        { label: "崩坏：星穹铁道", value: "game-starrail", apiValue: "6" },
        { label: "绝区零", value: "game-zenless", apiValue: "8" },
      ],
    },
  ],
  genshin: [
    {
      key: "news",
      label: "动态",
      items: [
        { label: "公告", value: "1" },
        { label: "活动", value: "2" },
        { label: "资讯", value: "3" },
      ],
    },
  ],
  starrail: [
    {
      key: "news",
      label: "动态",
      items: [
        { label: "公告", value: "1" },
        { label: "活动", value: "2" },
        { label: "资讯", value: "3" },
      ],
    },
  ],
  honkai: [
    {
      key: "news",
      label: "动态",
      items: [
        { label: "公告", value: "1" },
        { label: "活动", value: "2" },
        { label: "资讯", value: "3" },
      ],
    },
  ],
  acfun: [
    {
      key: "partition",
      label: "分区",
      items: [
        { label: "综合", value: "-1" },
        { label: "动画", value: "1" },
        { label: "音乐", value: "58" },
        { label: "游戏", value: "59" },
        { label: "娱乐", value: "60" },
        { label: "影视", value: "68" },
        { label: "体育", value: "69" },
        { label: "科技", value: "70" },
        { label: "舞蹈·偶像", value: "123" },
        { label: "鱼塘", value: "125" },
        { label: "番剧", value: "155" },
        { label: "生活", value: "201" },
      ],
    },
    {
      key: "range",
      label: "时间",
      param: "range",
      items: [
        { label: "今日", value: "DAY" },
        { label: "三日", value: "THREE_DAYS" },
        { label: "本周", value: "WEEK" },
      ],
    },
  ],
  "52pojie": [
    {
      key: "topic",
      label: "主题",
      items: [
        { label: "最新精华", value: "digest" },
        { label: "最新热门", value: "hot" },
        { label: "最新回复", value: "new" },
        { label: "最新发表", value: "newthread" },
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
      key: "core",
      label: "核心",
      items: [
        { label: "模型榜", value: "models" },
        { label: "API 提供商与端点榜", value: "providers" },
        { label: "编码智能体榜", value: "coding-agents" },
      ],
    },
    {
      key: "media",
      label: "媒体",
      items: [
        { label: "文生图榜", value: "text-to-image" },
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
  hellogithub: [
    {
      key: "sort",
      label: "榜单",
      param: "sort",
      items: [
        { label: "精选", value: "featured" },
        { label: "全部", value: "all" },
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

const AGGREGATE_SUBTYPE_SOURCES = ["clawhub"];

const normalizeValue = (value) => {
  if (Array.isArray(value)) return value[0] || null;
  return value ?? null;
};

export const getSourceSubtypeGroups = (sourceName) =>
  SOURCE_SUBTYPE_GROUPS[sourceName] || [];

export const getSourceSubtypeOptions = (sourceName) =>
  getSourceSubtypeGroups(sourceName).flatMap((group) => group.items || []);

export const getDefaultSourceSubtype = (sourceName) =>
  getSourceSubtypeOptions(sourceName)[0]?.value || null;

export const shouldCanonicalizeDefaultSubtype = (sourceName) =>
  Boolean(sourceName) &&
  !AGGREGATE_SUBTYPE_SOURCES.includes(sourceName) &&
  Boolean(getDefaultSourceSubtype(sourceName));

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
  const groups = getSourceSubtypeGroups(sourceName);
  const resolved = resolveSourceSubtype(
    groups.flatMap((group) => group.items || []),
    subtype
  );
  if (!resolved) return {};
  const group = groups.find((item) =>
    (item.items || []).some((option) => option.value === resolved)
  );
  const option = (group?.items || []).find((item) => item.value === resolved);
  return { [group?.param || "type"]: option?.apiValue || resolved };
};
