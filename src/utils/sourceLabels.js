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
  lmarena: {
    "zh-CN": "Arena AI",
    "zh-TW": "Arena AI",
    en: "Arena AI",
    ja: "Arena AI",
    ko: "Arena AI",
  },
  "arena-ai": { en: "Arena AI" },
  designarena: { en: "DesignArena" },
  "aicpb-rankings": { en: "AICPB Global AI Rankings" },
  "llm-stats": { en: "LLM Stats" },
  "skills-rank": { en: "Skills Rank" },
  openai: { en: "OpenAI" },
  "openai-news": { en: "OpenAI" },
  "openai-research": { en: "OpenAI" },
  "anthropic-news": { en: "Anthropic" },
  "deepmind-blog": { en: "DeepMind" },
  "meta-ai-blog": { en: "Meta AI" },
  huggingface: { en: "Hugging Face" },
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
  chat: {
    "zh-CN": "对话",
    "zh-TW": "對話",
    en: "Chat",
    ja: "対話",
    ko: "채팅",
  },
  code: {
    "zh-CN": "代码",
    "zh-TW": "程式",
    en: "Code",
    ja: "コード",
    ko: "코드",
  },
  image: {
    "zh-CN": "图像",
    "zh-TW": "圖像",
    en: "Image",
    ja: "画像",
    ko: "이미지",
  },
  video: {
    "zh-CN": "视频",
    "zh-TW": "影片",
    en: "Video",
    ja: "動画",
    ko: "비디오",
  },
  core: {
    "zh-CN": "综合",
    "zh-TW": "綜合",
    en: "Core",
    ja: "総合",
    ko: "종합",
  },
  scenario: {
    "zh-CN": "场景",
    "zh-TW": "場景",
    en: "Scenarios",
    ja: "シナリオ",
    ko: "시나리오",
  },
  global: {
    "zh-CN": "全球",
    "zh-TW": "全球",
    en: "Global",
    ja: "グローバル",
    ko: "글로벌",
  },
  segments: {
    "zh-CN": "细分",
    "zh-TW": "細分",
    en: "Segments",
    ja: "細分",
    ko: "세분",
  },
  growth: {
    "zh-CN": "增速",
    "zh-TW": "增速",
    en: "Growth",
    ja: "成長",
    ko: "성장",
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
  排行榜: {
    "zh-CN": "排行榜",
    "zh-TW": "排行榜",
    en: "Rankings",
    ja: "ランキング",
    ko: "랭킹",
  },
  "模型周度热度榜": {
    "zh-CN": "模型周度热度榜",
    "zh-TW": "模型週熱度榜",
    en: "Weekly Model Usage Rankings",
    ja: "週間モデル利用ランキング",
    ko: "주간 모델 사용량 랭킹",
  },
  "模型综合评测榜": {
    "zh-CN": "模型综合评测榜",
    "zh-TW": "模型綜合評測榜",
    en: "Model Evaluation Rankings",
    ja: "総合モデル評価ランキング",
    ko: "모델 종합 평가 랭킹",
  },
  "模型偏好对战榜": {
    "zh-CN": "模型偏好对战榜",
    "zh-TW": "模型偏好對戰榜",
    en: "Preference Battle Rankings",
    ja: "モデル対戦ランキング",
    ko: "선호도 배틀 랭킹",
  },
  "全球 AI 产品热度榜": {
    "zh-CN": "全球 AI 产品热度榜",
    "zh-TW": "全球 AI 產品熱度榜",
    en: "Global AI Product Rankings",
    ja: "世界AIプロダクト人気ランキング",
    ko: "글로벌 AI 제품 인기 랭킹",
  },
  "排行榜总榜": {
    "zh-CN": "排行榜总榜",
    "zh-TW": "排行榜總榜",
    en: "Overall Rankings",
    ja: "総合ランキング",
    ko: "종합 랭킹",
  },
  "模型性能 / 价格榜": {
    "zh-CN": "模型性能 / 价格榜",
    "zh-TW": "模型效能 / 價格榜",
    en: "Performance & Pricing Rankings",
    ja: "性能・価格ランキング",
    ko: "성능·가격 랭킹",
  },
  "Agent Skills 安装榜": {
    "zh-CN": "Agent Skills 安装榜",
    "zh-TW": "Agent Skills 安裝榜",
    en: "Agent Skills Install Rankings",
    ja: "Agent Skills インストールランキング",
    ko: "Agent Skills 설치 랭킹",
  },
  "技能 / 插件": {
    "zh-CN": "技能 / 插件",
    "zh-TW": "技能 / 外掛",
    en: "Skills / Plugins",
    ja: "スキル / プラグイン",
    ko: "스킬 / 플러그인",
  },
  官方资讯: {
    "zh-CN": "官方资讯",
    "zh-TW": "官方資訊",
    en: "Official Updates",
    ja: "公式情報",
    ko: "공식 업데이트",
  },
  官方新闻: {
    "zh-CN": "官方新闻",
    "zh-TW": "官方新聞",
    en: "Official News",
    ja: "公式ニュース",
    ko: "공식 뉴스",
  },
  "官方研究": {
    "zh-CN": "官方研究",
    "zh-TW": "官方研究",
    en: "Official Research",
    ja: "公式研究",
    ko: "공식 연구",
  },
  "官方研究更新": {
    "zh-CN": "官方研究",
    "zh-TW": "官方研究",
    en: "Official Research",
    ja: "公式研究",
    ko: "공식 연구",
  },
  官方博客: {
    "zh-CN": "官方博客",
    "zh-TW": "官方部落格",
    en: "Official Blog",
    ja: "公式ブログ",
    ko: "공식 블로그",
  },
  "官方 AI 动态": {
    "zh-CN": "官方 AI 动态",
    "zh-TW": "官方 AI 動態",
    en: "Official AI Updates",
    ja: "公式AIアップデート",
    ko: "공식 AI 업데이트",
  },
  "开源模型趋势榜": {
    "zh-CN": "开源模型趋势榜",
    "zh-TW": "開源模型趨勢榜",
    en: "Open Model Rankings",
    ja: "オープンモデル人気ランキング",
    ko: "오픈 모델 트렌드 랭킹",
  },
  "热门论文趋势榜": {
    "zh-CN": "热门论文趋势榜",
    "zh-TW": "熱門論文趨勢榜",
    en: "Trending Papers Rankings",
    ja: "注目論文ランキング",
    ko: "인기 논문 트렌드 랭킹",
  },
  日榜: {
    "zh-CN": "日榜",
    "zh-TW": "日榜",
    en: "Daily Rankings",
    ja: "日間ランキング",
    ko: "일간 랭킹",
  },
  周榜: {
    "zh-CN": "周榜",
    "zh-TW": "週榜",
    en: "Weekly Rankings",
    ja: "週間ランキング",
    ko: "주간 랭킹",
  },
  "开放模型总榜": {
    "zh-CN": "开放模型总榜",
    "zh-TW": "開放模型總榜",
    en: "Open Model Rankings",
    ja: "オープンモデル総合",
    ko: "오픈 모델 종합",
  },
  "编程能力榜": {
    "zh-CN": "编程能力榜",
    "zh-TW": "程式能力榜",
    en: "Coding Rankings",
    ja: "コーディングランキング",
    ko: "코딩 랭킹",
  },
  "写作能力榜": {
    "zh-CN": "写作能力榜",
    "zh-TW": "寫作能力榜",
    en: "Writing Rankings",
    ja: "ライティングランキング",
    ko: "글쓰기 랭킹",
  },
  "数学能力榜": {
    "zh-CN": "数学能力榜",
    "zh-TW": "數學能力榜",
    en: "Math Rankings",
    ja: "数学ランキング",
    ko: "수학 랭킹",
  },
  "研究能力榜": {
    "zh-CN": "研究能力榜",
    "zh-TW": "研究能力榜",
    en: "Research Rankings",
    ja: "研究ランキング",
    ko: "연구 랭킹",
  },
  "长上下文榜": {
    "zh-CN": "长上下文榜",
    "zh-TW": "長上下文榜",
    en: "Long Context Rankings",
    ja: "長文脈ランキング",
    ko: "롱컨텍스트 랭킹",
  },
  "工具调用榜": {
    "zh-CN": "工具调用榜",
    "zh-TW": "工具調用榜",
    en: "Tool Calling Rankings",
    ja: "ツール利用ランキング",
    ko: "툴콜링 랭킹",
  },
  "推理能力榜": {
    "zh-CN": "推理能力榜",
    "zh-TW": "推理能力榜",
    en: "Reasoning Rankings",
    ja: "推論ランキング",
    ko: "추론 랭킹",
  },
  "图像生成榜": {
    "zh-CN": "图像生成榜",
    "zh-TW": "圖像生成榜",
    en: "Image Generation Rankings",
    ja: "画像生成ランキング",
    ko: "이미지 생성 랭킹",
  },
  "视频生成榜": {
    "zh-CN": "视频生成榜",
    "zh-TW": "影片生成榜",
    en: "Video Generation Rankings",
    ja: "動画生成ランキング",
    ko: "비디오 생성 랭킹",
  },
  "模型厂商榜": {
    "zh-CN": "模型厂商榜",
    "zh-TW": "模型廠商榜",
    en: "Provider Rankings",
    ja: "プロバイダランキング",
    ko: "프로바이더 랭킹",
  },
  "全球网站热度榜": {
    "zh-CN": "全球网站热度榜",
    "zh-TW": "全球網站熱度榜",
    en: "Global Website Rankings",
    ja: "グローバルWebランキング",
    ko: "글로벌 웹 랭킹",
  },
  "全球 App 热度榜": {
    "zh-CN": "全球 App 热度榜",
    "zh-TW": "全球 App 熱度榜",
    en: "Global App Rankings",
    ja: "グローバルAppランキング",
    ko: "글로벌 앱 랭킹",
  },
  "中国 AI 热度榜": {
    "zh-CN": "中国 AI 热度榜",
    "zh-TW": "中國 AI 熱度榜",
    en: "China AI Rankings",
    ja: "中国AIランキング",
    ko: "중국 AI 랭킹",
  },
  "AI ChatBot 热度榜": {
    "zh-CN": "AI ChatBot 热度榜",
    "zh-TW": "AI ChatBot 熱度榜",
    en: "AI Chatbot Rankings",
    ja: "AIチャットボットランキング",
    ko: "AI 챗봇 랭킹",
  },
  "AI Search 热度榜": {
    "zh-CN": "AI Search 热度榜",
    "zh-TW": "AI Search 熱度榜",
    en: "AI Search Rankings",
    ja: "AI検索ランキング",
    ko: "AI 검색 랭킹",
  },
  "AI Vibe Coding 热度榜": {
    "zh-CN": "AI Vibe Coding 热度榜",
    "zh-TW": "AI Vibe Coding 熱度榜",
    en: "AI Vibe Coding Rankings",
    ja: "AI Vibe Codingランキング",
    ko: "AI Vibe Coding 랭킹",
  },
  "AI Agent 热度榜": {
    "zh-CN": "AI Agent 热度榜",
    "zh-TW": "AI Agent 熱度榜",
    en: "AI Agent Rankings",
    ja: "AIエージェントランキング",
    ko: "AI 에이전트 랭킹",
  },
  "Claw Agent 热度榜": {
    "zh-CN": "Claw Agent 热度榜",
    "zh-TW": "Claw Agent 熱度榜",
    en: "Claw Agent Rankings",
    ja: "Claw Agentランキング",
    ko: "Claw Agent 랭킹",
  },
  "AI Character 热度榜": {
    "zh-CN": "AI Character 热度榜",
    "zh-TW": "AI Character 熱度榜",
    en: "AI Character Rankings",
    ja: "AIキャラクターランキング",
    ko: "AI 캐릭터 랭킹",
  },
  "AI Image Generator 热度榜": {
    "zh-CN": "AI Image Generator 热度榜",
    "zh-TW": "AI Image Generator 熱度榜",
    en: "AI Image Generator Rankings",
    ja: "AI画像生成ランキング",
    ko: "AI 이미지 생성 랭킹",
  },
  "AI Image Editor 热度榜": {
    "zh-CN": "AI Image Editor 热度榜",
    "zh-TW": "AI Image Editor 熱度榜",
    en: "AI Image Editor Rankings",
    ja: "AI画像編集ランキング",
    ko: "AI 이미지 편집 랭킹",
  },
  "AI Video Generator 热度榜": {
    "zh-CN": "AI Video Generator 热度榜",
    "zh-TW": "AI Video Generator 熱度榜",
    en: "AI Video Generator Rankings",
    ja: "AI動画生成ランキング",
    ko: "AI 비디오 생성 랭킹",
  },
  "AI Video Editor 热度榜": {
    "zh-CN": "AI Video Editor 热度榜",
    "zh-TW": "AI Video Editor 熱度榜",
    en: "AI Video Editor Rankings",
    ja: "AI動画編集ランキング",
    ko: "AI 비디오 편집 랭킹",
  },
  "AI PPT 热度榜": {
    "zh-CN": "AI PPT 热度榜",
    "zh-TW": "AI PPT 熱度榜",
    en: "AI PPT Rankings",
    ja: "AIプレゼンランキング",
    ko: "AI PPT 랭킹",
  },
  "AI Music 热度榜": {
    "zh-CN": "AI Music 热度榜",
    "zh-TW": "AI Music 熱度榜",
    en: "AI Music Rankings",
    ja: "AI音楽ランキング",
    ko: "AI 음악 랭킹",
  },
  "AI Meeting 热度榜": {
    "zh-CN": "AI Meeting 热度榜",
    "zh-TW": "AI Meeting 熱度榜",
    en: "AI Meeting Rankings",
    ja: "AI会議ランキング",
    ko: "AI 미팅 랭킹",
  },
  "AI Cloud 热度榜": {
    "zh-CN": "AI Cloud 热度榜",
    "zh-TW": "AI Cloud 熱度榜",
    en: "AI Cloud Rankings",
    ja: "AIクラウドランキング",
    ko: "AI 클라우드 랭킹",
  },
  "全球增长榜": {
    "zh-CN": "全球增长榜",
    "zh-TW": "全球增長榜",
    en: "Global Growth Rankings",
    ja: "グローバル成長ランキング",
    ko: "글로벌 성장 랭킹",
  },
  "中国增长榜": {
    "zh-CN": "中国增长榜",
    "zh-TW": "中國增長榜",
    en: "China Growth Rankings",
    ja: "中国成長ランキング",
    ko: "중국 성장 랭킹",
  },
  "Claw 增长榜": {
    "zh-CN": "Claw 增长榜",
    "zh-TW": "Claw 增長榜",
    en: "Claw Growth Rankings",
    ja: "Claw成長ランキング",
    ko: "Claw 성장 랭킹",
  },
  "全球放缓榜": {
    "zh-CN": "全球放缓榜",
    "zh-TW": "全球放緩榜",
    en: "Global Slowdown Rankings",
    ja: "グローバル減速ランキング",
    ko: "글로벌 둔화 랭킹",
  },
  "综合对话榜": {
    "zh-CN": "综合对话榜",
    "zh-TW": "綜合對話榜",
    en: "Overall Chat Rankings",
    ja: "総合チャットランキング",
    ko: "종합 채팅 랭킹",
  },
  "Agent 对战榜": {
    "zh-CN": "Agent 对战榜",
    "zh-TW": "Agent 對戰榜",
    en: "Agent Rankings",
    ja: "Agentランキング",
    ko: "Agent 랭킹",
  },
  "WebDev 对战榜": {
    "zh-CN": "WebDev 对战榜",
    "zh-TW": "WebDev 對戰榜",
    en: "WebDev Rankings",
    ja: "WebDevランキング",
    ko: "WebDev 랭킹",
  },
  "HTML WebDev 榜": {
    "zh-CN": "HTML WebDev 榜",
    "zh-TW": "HTML WebDev 榜",
    en: "HTML WebDev Rankings",
    ja: "HTML WebDevランキング",
    ko: "HTML WebDev 랭킹",
  },
  "React WebDev 榜": {
    "zh-CN": "React WebDev 榜",
    "zh-TW": "React WebDev 榜",
    en: "React WebDev Rankings",
    ja: "React WebDevランキング",
    ko: "React WebDev 랭킹",
  },
  "Image to WebDev 榜": {
    "zh-CN": "Image to WebDev 榜",
    "zh-TW": "Image to WebDev 榜",
    en: "Image to WebDev Rankings",
    ja: "Image to WebDevランキング",
    ko: "Image to WebDev 랭킹",
  },
  "Text to Image 榜": {
    "zh-CN": "Text to Image 榜",
    "zh-TW": "Text to Image 榜",
    en: "Text to Image Rankings",
    ja: "Text to Imageランキング",
    ko: "Text to Image 랭킹",
  },
  "Image Edit 榜": {
    "zh-CN": "Image Edit 榜",
    "zh-TW": "Image Edit 榜",
    en: "Image Edit Rankings",
    ja: "Image Editランキング",
    ko: "Image Edit 랭킹",
  },
  "Text to Video 榜": {
    "zh-CN": "Text to Video 榜",
    "zh-TW": "Text to Video 榜",
    en: "Text to Video Rankings",
    ja: "Text to Videoランキング",
    ko: "Text to Video 랭킹",
  },
  "Image to Video 榜": {
    "zh-CN": "Image to Video 榜",
    "zh-TW": "Image to Video 榜",
    en: "Image to Video Rankings",
    ja: "Image to Videoランキング",
    ko: "Image to Video 랭킹",
  },
  "Video Edit 榜": {
    "zh-CN": "Video Edit 榜",
    "zh-TW": "Video Edit 榜",
    en: "Video Edit Rankings",
    ja: "Video Editランキング",
    ko: "Video Edit 랭킹",
  },
  "Vision 对战榜": {
    "zh-CN": "Vision 对战榜",
    "zh-TW": "Vision 對戰榜",
    en: "Vision Rankings",
    ja: "Visionランキング",
    ko: "Vision 랭킹",
  },
  "Document 对战榜": {
    "zh-CN": "Document 对战榜",
    "zh-TW": "Document 對戰榜",
    en: "Document Rankings",
    ja: "Documentランキング",
    ko: "Document 랭킹",
  },
  "Search 对战榜": {
    "zh-CN": "Search 对战榜",
    "zh-TW": "Search 對戰榜",
    en: "Search Rankings",
    ja: "Searchランキング",
    ko: "Search 랭킹",
  },
  "论文代码镜像榜": {
    "zh-CN": "论文代码镜像榜",
    "zh-TW": "論文程式碼鏡像榜",
    en: "Paper-Code Mirror Rankings",
    ja: "論文コードミラーランキング",
    ko: "논문·코드 미러 랭킹",
  },
  产品发现: {
    "zh-CN": "产品发现",
    "zh-TW": "產品發現",
    en: "Product Discovery",
    ja: "プロダクト発見",
    ko: "제품 발견",
  },
  "AI 新品发现": {
    "zh-CN": "AI 新品发现",
    "zh-TW": "AI 新品發現",
    en: "AI Product Discovery",
    ja: "AI新製品発見",
    ko: "AI 신제품 발견",
  },
  社区热议: {
    "zh-CN": "社区热议",
    "zh-TW": "社群熱議",
    en: "Community Discussions",
    ja: "コミュニティ議論",
    ko: "커뮤니티 토론",
  },
  "AI 热门讨论": {
    "zh-CN": "AI 热门讨论",
    "zh-TW": "AI 熱門討論",
    en: "AI Discussions",
    ja: "AI人気議論",
    ko: "AI 인기 토론",
  },
  "中文 AI 资讯热榜": {
    "zh-CN": "中文 AI 资讯热榜",
    "zh-TW": "中文 AI 資訊熱榜",
    en: "Chinese AI News Rankings",
    ja: "中国語AIニュースランキング",
    ko: "중국어 AI 뉴스 랭킹",
  },
  日榜: {
    "zh-CN": "日榜",
    "zh-TW": "日榜",
    en: "Daily",
    ja: "日次",
    ko: "일간",
  },
  周榜: {
    "zh-CN": "周榜",
    "zh-TW": "週榜",
    en: "Weekly",
    ja: "週間",
    ko: "주간",
  },
  月榜: {
    "zh-CN": "月榜",
    "zh-TW": "月榜",
    en: "Monthly",
    ja: "月間",
    ko: "월간",
  },
  Recommended: {
    "zh-CN": "推荐",
    "zh-TW": "推薦",
    en: "Recommended",
    ja: "おすすめ",
    ko: "추천",
  },
  "Recommended Skills": {
    "zh-CN": "推荐技能榜",
    "zh-TW": "推薦技能榜",
    en: "Recommended Skills",
    ja: "おすすめスキル",
    ko: "추천 스킬",
  },
  "Recommended Plugins": {
    "zh-CN": "推荐插件榜",
    "zh-TW": "推薦外掛榜",
    en: "Recommended Plugins",
    ja: "おすすめプラグイン",
    ko: "추천 플러그인",
  },
  Featured: {
    "zh-CN": "精选",
    "zh-TW": "精選",
    en: "Featured",
    ja: "注目",
    ko: "추천작",
  },
  "Featured Skills": {
    "zh-CN": "精选技能榜",
    "zh-TW": "精選技能榜",
    en: "Featured Skills",
    ja: "注目スキル",
    ko: "주요 스킬",
  },
  "Featured Plugins": {
    "zh-CN": "精选插件榜",
    "zh-TW": "精選外掛榜",
    en: "Featured Plugins",
    ja: "注目プラグイン",
    ko: "주요 플러그인",
  },
  "Most starred": {
    "zh-CN": "星标最多",
    "zh-TW": "星標最多",
    en: "Most starred",
    ja: "最多スター",
    ko: "최다 스타",
  },
  "Most starred Skills": {
    "zh-CN": "星标最多技能榜",
    "zh-TW": "星標最多技能榜",
    en: "Most starred Skills",
    ja: "スター最多スキル",
    ko: "스타 최다 스킬",
  },
  "Most installed": {
    "zh-CN": "安装最多",
    "zh-TW": "安裝最多",
    en: "Most installed",
    ja: "最多インストール",
    ko: "최다 설치",
  },
  "Most installed Skills": {
    "zh-CN": "安装最多技能榜",
    "zh-TW": "安裝最多技能榜",
    en: "Most installed Skills",
    ja: "インストール最多スキル",
    ko: "설치 최다 스킬",
  },
  "Most installed Plugins": {
    "zh-CN": "安装最多插件榜",
    "zh-TW": "安裝最多外掛榜",
    en: "Most installed Plugins",
    ja: "インストール最多プラグイン",
    ko: "설치 최다 플러그인",
  },
  "Recently updated": {
    "zh-CN": "最近更新",
    "zh-TW": "最近更新",
    en: "Recently updated",
    ja: "最近更新",
    ko: "최근 업데이트",
  },
  "Recently updated Skills": {
    "zh-CN": "最近更新技能榜",
    "zh-TW": "最近更新技能榜",
    en: "Recently updated Skills",
    ja: "最近更新スキル",
    ko: "최근 업데이트 스킬",
  },
  "Recently updated Plugins": {
    "zh-CN": "最近更新插件榜",
    "zh-TW": "最近更新外掛榜",
    en: "Recently updated Plugins",
    ja: "最近更新プラグイン",
    ko: "최근 업데이트 플러그인",
  },
  Newest: {
    "zh-CN": "最新发布",
    "zh-TW": "最新發布",
    en: "Newest",
    ja: "最新",
    ko: "최신",
  },
  "Newest Skills": {
    "zh-CN": "最新发布技能榜",
    "zh-TW": "最新發布技能榜",
    en: "Newest Skills",
    ja: "最新スキル",
    ko: "최신 스킬",
  },
  Name: {
    "zh-CN": "名称",
    "zh-TW": "名稱",
    en: "Name",
    ja: "名前",
    ko: "이름",
  },
  "Skill Name Index": {
    "zh-CN": "技能名称索引",
    "zh-TW": "技能名稱索引",
    en: "Skill Name Index",
    ja: "スキル名インデックス",
    ko: "스킬 이름 색인",
  },
  "MCP Tools": {
    "zh-CN": "MCP 工具",
    "zh-TW": "MCP 工具",
    en: "MCP Tools",
    ja: "MCP ツール",
    ko: "MCP 도구",
  },
  "MCP Tool Skills": {
    "zh-CN": "MCP 工具技能分类",
    "zh-TW": "MCP 工具技能分類",
    en: "MCP Tool Skills",
    ja: "MCP ツールスキル",
    ko: "MCP 도구 스킬",
  },
  Prompts: {
    "zh-CN": "提示词",
    "zh-TW": "提示詞",
    en: "Prompts",
    ja: "プロンプト",
    ko: "프롬프트",
  },
  "Prompt Skills": {
    "zh-CN": "提示词技能分类",
    "zh-TW": "提示詞技能分類",
    en: "Prompt Skills",
    ja: "プロンプトスキル",
    ko: "프롬프트 스킬",
  },
  Workflows: {
    "zh-CN": "工作流",
    "zh-TW": "工作流",
    en: "Workflows",
    ja: "ワークフロー",
    ko: "워크플로",
  },
  "Workflow Skills": {
    "zh-CN": "工作流技能分类",
    "zh-TW": "工作流技能分類",
    en: "Workflow Skills",
    ja: "ワークフロースキル",
    ko: "워크플로 스킬",
  },
  "Dev Tools": {
    "zh-CN": "开发工具",
    "zh-TW": "開發工具",
    en: "Dev Tools",
    ja: "開発ツール",
    ko: "개발 도구",
  },
  "Developer Tool Skills": {
    "zh-CN": "开发工具技能分类",
    "zh-TW": "開發工具技能分類",
    en: "Developer Tool Skills",
    ja: "開発ツールスキル",
    ko: "개발 도구 스킬",
  },
  "Data & APIs": {
    "zh-CN": "数据与 API",
    "zh-TW": "資料與 API",
    en: "Data & APIs",
    ja: "データと API",
    ko: "데이터와 API",
  },
  "Data & API Skills": {
    "zh-CN": "数据与 API 技能分类",
    "zh-TW": "資料與 API 技能分類",
    en: "Data & API Skills",
    ja: "データと API スキル",
    ko: "데이터와 API 스킬",
  },
  "Data & API Plugins": {
    "zh-CN": "数据与 API 插件分类",
    "zh-TW": "資料與 API 外掛分類",
    en: "Data & API Plugins",
    ja: "データと API プラグイン",
    ko: "데이터와 API 플러그인",
  },
  Security: {
    "zh-CN": "安全",
    "zh-TW": "安全",
    en: "Security",
    ja: "セキュリティ",
    ko: "보안",
  },
  "Security Skills": {
    "zh-CN": "安全技能分类",
    "zh-TW": "安全技能分類",
    en: "Security Skills",
    ja: "セキュリティスキル",
    ko: "보안 스킬",
  },
  Automation: {
    "zh-CN": "自动化",
    "zh-TW": "自動化",
    en: "Automation",
    ja: "自動化",
    ko: "자동화",
  },
  "Automation Skills": {
    "zh-CN": "自动化技能分类",
    "zh-TW": "自動化技能分類",
    en: "Automation Skills",
    ja: "自動化スキル",
    ko: "자동화 스킬",
  },
  Other: {
    "zh-CN": "其他",
    "zh-TW": "其他",
    en: "Other",
    ja: "その他",
    ko: "기타",
  },
  "Other Skills": {
    "zh-CN": "其他技能分类",
    "zh-TW": "其他技能分類",
    en: "Other Skills",
    ja: "その他のスキル",
    ko: "기타 스킬",
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

export const getSourceSubtitleLabel = (label = "", locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const override = SUBTYPE_LABEL_OVERRIDES[label];
  if (override?.[normalizedLocale]) {
    return override[normalizedLocale];
  }
  if (!label) return "";
  if (normalizedLocale === "zh-CN" || normalizedLocale === "zh-TW") {
    return label;
  }
  if (!containsNonLatin(label)) {
    return label;
  }
  return prettifySlug(label);
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
