import { defineStore } from "pinia";

export const mainStore = defineStore("mainData", {
  state: () => {
    return {
      // 系统主题
      siteTheme: "light",
      siteThemeAuto: true,
      // 新闻类别（已分好类）
      defaultNewsArr: [
        {
          label: "抖音",
          name: "douyin",
          order: 0,
          show: true,
          category: "综合",
        },
        {
          label: "百度",
          name: "baidu",
          order: 1,
          show: true,
          category: "综合",
        },
        {
          label: "快手",
          name: "kuaishou",
          order: 2,
          show: true,
          category: "综合",
        },
        {
          label: "微博",
          name: "weibo",
          order: 3,
          show: true,
          category: "综合",
        },
        {
          label: "今日头条",
          name: "toutiao",
          order: 4,
          show: true,
          category: "综合",
        },
        {
          label: "腾讯新闻",
          name: "qq-news",
          order: 5,
          show: true,
          category: "综合",
        },
        {
          label: "网易新闻",
          name: "netease-news",
          order: 6,
          show: true,
          category: "综合",
        },
        {
          label: "新浪新闻",
          name: "sina-news",
          order: 7,
          show: true,
          category: "综合",
        },
        {
          label: "哔哩哔哩",
          name: "bilibili",
          order: 8,
          show: true,
          category: "综合",
        },
        {
          label: "知乎",
          name: "zhihu",
          order: 9,
          show: true,
          category: "综合",
        },
        {
          label: "百度贴吧",
          name: "tieba",
          order: 10,
          show: true,
          category: "社区",
        },
        {
          label: "什么值得买",
          name: "smzdm",
          order: 11,
          show: true,
          category: "生活",
        },
        {
          label: "澎湃新闻",
          name: "thepaper",
          order: 12,
          show: true,
          category: "综合",
        },
        {
          label: "新浪热榜",
          name: "sina",
          order: 13,
          show: true,
          category: "综合",
        },
        {
          label: "纽约时报",
          name: "nytimes",
          order: 14,
          show: true,
          category: "综合",
        },
        {
          label: "豆瓣讨论小组",
          name: "douban-group",
          order: 15,
          show: true,
          category: "生活",
        },
        {
          label: "豆瓣电影",
          name: "douban-movie",
          order: 16,
          show: true,
          category: "生活",
        },
        {
          label: "微信读书",
          name: "weread",
          order: 17,
          show: true,
          category: "生活",
        },
        {
          label: "CSDN",
          name: "csdn",
          order: 18,
          show: true,
          category: "科技",
        },
        {
          label: "36氪",
          name: "36kr",
          order: 19,
          show: true,
          category: "科技",
        },
        {
          label: "IT之家",
          name: "ithome",
          order: 20,
          show: true,
          category: "科技",
        },
        {
          label: "虎扑",
          name: "hupu",
          order: 21,
          show: true,
          category: "社区",
        },
        {
          label: "酷安",
          name: "coolapk",
          order: 22,
          show: true,
          category: "科技",
        },
        {
          label: "稀土掘金",
          name: "juejin",
          order: 23,
          show: true,
          category: "科技",
        },
        {
          label: "V2EX",
          name: "v2ex",
          order: 24,
          show: true,
          category: "社区",
        },
        {
          label: "GitHub 趋势",
          name: "github",
          order: 25,
          show: true,
          category: "科技",
        },
        {
          label: "游戏葡萄",
          name: "gameres",
          order: 26,
          show: true,
          category: "游戏",
        },
        {
          label: "游研社",
          name: "yystv",
          order: 27,
          show: true,
          category: "游戏",
        },
        {
          label: "米游社",
          name: "miyoushe",
          order: 28,
          show: true,
          category: "游戏",
        },
        {
          label: "原神",
          name: "genshin",
          order: 29,
          show: true,
          category: "游戏",
        },
        {
          label: "崩坏：星穹铁道",
          name: "starrail",
          order: 30,
          show: true,
          category: "游戏",
        },
        {
          label: "崩坏3",
          name: "honkai",
          order: 31,
          show: true,
          category: "游戏",
        },
        {
          label: "LOL",
          name: "lol",
          order: 32,
          show: true,
          category: "游戏",
        },
        {
          label: "虎嗅",
          name: "huxiu",
          order: 33,
          show: true,
          category: "科技",
          useApi2: true,
        },
        {
          label: "少数派",
          name: "sspai",
          order: 34,
          show: true,
          category: "科技",
        },
        {
          label: "数字尾巴",
          name: "dgtle",
          order: 35,
          show: true,
          category: "科技",
        },
        {
          label: "爱范儿",
          name: "ifanr",
          order: 36,
          show: true,
          category: "科技",
        },
        {
          label: "极客公园",
          name: "geekpark",
          order: 37,
          show: true,
          category: "科技",
        },
        {
          label: "果壳",
          name: "guokr",
          order: 38,
          show: true,
          category: "科技",
        },
        {
          label: "知乎日报",
          name: "zhihu-daily",
          order: 39,
          show: true,
          category: "综合",
        },
        {
          label: "AcFun",
          name: "acfun",
          order: 40,
          show: true,
          category: "综合",
        },
        {
          label: "NGA",
          name: "ngabbs",
          order: 41,
          show: true,
          category: "社区",
        },
        {
          label: "吾爱破解",
          name: "52pojie",
          order: 42,
          show: true,
          category: "社区",
          useApi2: true,
        },
        {
          label: "全球主机交流",
          name: "hostloc",
          order: 43,
          show: true,
          category: "社区",
        },
        {
          label: "天涯社区",
          name: "tianya",
          order: 44,
          show: true,
          category: "社区",
          useApi2: true,
        },
        {
          label: "LinuxDo",
          name: "linuxdo",
          order: 45,
          show: true,
          category: "社区",
        },
        {
          label: "Nodeseek",
          name: "nodeseek",
          order: 46,
          show: true,
          category: "社区",
        },
        {
          label: "水木社区",
          name: "newsmth",
          order: 47,
          show: true,
          category: "社区",
        },
        {
          label: "Product Hunt",
          name: "producthunt",
          order: 48,
          show: true,
          category: "科技",
        },
        {
          label: "Hacker News",
          name: "hackernews",
          order: 49,
          show: true,
          category: "科技",
        },
        {
          label: "HelloGitHub",
          name: "hellogithub",
          order: 50,
          show: true,
          category: "科技",
        },
        {
          label: "51CTO",
          name: "51cto",
          order: 51,
          show: true,
          category: "科技",
        },
        {
          label: "IT之家「喜加一」",
          name: "ithome-xijiayi",
          order: 52,
          show: true,
          category: "科技",
        },
        {
          label: "简书",
          name: "jianshu",
          order: 53,
          show: true,
          category: "生活",
          useApi2: true,
        },
        {
          label: "中央气象台",
          name: "weatheralarm",
          order: 54,
          show: true,
          category: "生活",
        },
        {
          label: "历史上的今天",
          name: "history",
          order: 55,
          show: true,
          category: "生活",
        },
        {
          label: "中国地震台",
          name: "earthquake",
          order: 56,
          show: true,
          category: "生活",
        },
        {
          label: "OpenRouter 排行榜",
          name: "openrouter-rankings",
          order: 57,
          show: false,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "Artificial Analysis",
          name: "artificialanalysis",
          order: 58,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "LMArena",
          name: "lmarena",
          order: 59,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "DesignArena",
          name: "designarena",
          order: 60,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "AICPB 榜单",
          name: "aicpb-rankings",
          order: 61,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "LLM Stats",
          name: "llm-stats",
          order: 62,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "Skills Rank",
          name: "skills-rank",
          order: 63,
          show: true,
          category: "AI",
          subtype: "排行榜",
        },
        {
          label: "OpenAI 官方新闻",
          name: "openai-news",
          order: 64,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "OpenAI Research",
          name: "openai-research",
          order: 65,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Anthropic 官方新闻",
          name: "anthropic-news",
          order: 66,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "DeepMind 官方博客",
          name: "deepmind-blog",
          order: 67,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Meta AI 官方动态",
          name: "meta-ai-blog",
          order: 68,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Hugging Face 博客",
          name: "huggingface-blog",
          order: 69,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Mistral 官方新闻",
          name: "mistral-news",
          order: 70,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Cohere 官方博客",
          name: "cohere-blog",
          order: 71,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Perplexity 博客",
          name: "perplexity-blog",
          order: 72,
          show: false,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "xAI 官方新闻",
          name: "xai-news",
          order: 73,
          show: false,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Hugging Face 模型",
          name: "hf-models",
          order: 74,
          show: true,
          category: "AI",
          subtype: "开源 / 论文",
        },
        {
          label: "Hugging Face 热门论文",
          name: "hf-papers",
          order: 75,
          show: true,
          category: "AI",
          subtype: "开源 / 论文",
        },
        {
          label: "Papers with Code",
          name: "paperswithcode",
          order: 76,
          show: true,
          category: "AI",
          subtype: "开源 / 论文",
        },
        {
          label: "Product Hunt AI",
          name: "producthunt-ai",
          order: 77,
          show: true,
          category: "AI",
          subtype: "产品发现",
        },
        {
          label: "Hacker News AI",
          name: "hackernews-ai",
          order: 78,
          show: true,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/LocalLLaMA",
          name: "reddit-localllama",
          order: 79,
          show: false,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/MachineLearning",
          name: "reddit-machinelearning",
          order: 80,
          show: false,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/artificial",
          name: "reddit-artificial",
          order: 81,
          show: false,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "新浪 AI 热榜",
          name: "sina-ai",
          order: 82,
          show: true,
          category: "AI",
          subtype: "官方资讯",
        },
      ],
      newsArr: [],
      // 链接跳转方式
      linkOpenType: "open",
      // 页头固定
      headerFixed: true,
      // 页头默认折叠
      headerCollapsed: true,
      // 紧凑模式
      compactMode: true,
      // 自动刷新
      autoRefreshEnabled: false,
      autoRefreshPaused: false,
      autoRefreshInterval: 1800,
      // 是否显示封面图片
      showImages: true,
      // 分类
      categoryEnabled: true,
      activeCategory: "全部",
      categories: [
        { id: "general", name: "综合", order: 0, builtin: true },
        { id: "tech", name: "科技", order: 1, builtin: true },
        { id: "life", name: "生活", order: 2, builtin: true },
        { id: "games", name: "游戏", order: 3, builtin: true },
        { id: "community", name: "社区", order: 4, builtin: true },
        { id: "ai", name: "AI", order: 5, builtin: true },
      ],
      // 失效的榜单源（临时标记，不持久化）
      unavailableSources: [],
      analyticsConsent: null,
      analyticsPromptDismissed: false,
      analyticsRecommendedOrder: [],
      // 时间数据
      timeData: null,
      // 字体大小
      listFontSize: 16,
    };
  },
  getters: {},
  actions: {
    ensureCategoriesForNews(list) {
      const fallback = "综合";
      return list.map((item) => ({
        ...item,
        category: item.category || fallback,
      }));
    },
    mergeNewsWithDefaults(list) {
      const defaultByName = new Map(
        this.defaultNewsArr.map((item) => [item.name, item])
      );
      return this.ensureCategoriesForNews(list).map((item) => ({
        ...(defaultByName.get(item.name) || {}),
        ...item,
      }));
    },
    dedupeNewsList(list) {
      const merged = this.mergeNewsWithDefaults(list);
      const byName = new Map();
      for (const item of merged) {
        if (!item?.name) continue;
        if (!byName.has(item.name)) {
          byName.set(item.name, item);
          continue;
        }
        const current = byName.get(item.name);
        byName.set(item.name, {
          ...current,
          ...item,
          label: item.label || current.label,
          order:
            typeof current.order === "number" ? current.order : item.order,
        });
      }
      return Array.from(byName.values());
    },
    addCategory(name) {
      if (!name) return false;
      const limit = 10;
      const exists = this.categories.some(
        (cat) => cat.name === name || cat.id === name
      );
      if (exists) return false;
      if (this.categories.length >= limit) {
        $message?.warning?.(`最多创建 ${limit} 个分类`);
        return false;
      }
      this.categories.push({
        id: `${Date.now()}`,
        name,
        order: this.categories.length,
        builtin: false,
      });
      return true;
    },
    removeCategory(id) {
      const cat = this.categories.find((c) => c.id === id);
      if (!cat || cat.builtin) return;
      this.categories = this.categories.filter((c) => c.id !== id);
      this.newsArr = this.newsArr.map((item) =>
        item.category === cat.name ? { ...item, category: "综合" } : item
      );
      if (this.activeCategory === cat.name) {
        this.activeCategory = "全部";
      }
    },
    renameCategory(id, newName) {
      if (!newName) return;
      const cat = this.categories.find((c) => c.id === id);
      if (!cat || cat.builtin) return;
      const oldName = cat.name;
      cat.name = newName;
      this.newsArr = this.newsArr.map((item) =>
        item.category === oldName ? { ...item, category: newName } : item
      );
    },
    setActiveCategory(name) {
      this.activeCategory = name;
    },
    setAnalyticsConsent(value) {
      this.analyticsConsent = value;
    },
    setAnalyticsPromptDismissed(value) {
      this.analyticsPromptDismissed = value;
    },
    setAnalyticsRecommendedOrder(list) {
      this.analyticsRecommendedOrder = Array.isArray(list) ? list : [];
    },
    // 更改系统主题
    setSiteTheme(val) {
      $message.info(`已切换至${val === "dark" ? "深色模式" : "浅色模式"}`, {
        showIcon: false,
      });
      this.siteTheme = val;
      this.siteThemeAuto = false;
    },
    // 标记榜单状态
    markUnavailable(name) {
      if (!name) return;
      if (!this.unavailableSources.includes(name)) {
        this.unavailableSources.push(name);
      }
    },
    markAvailable(name) {
      if (!name) return;
      this.unavailableSources = this.unavailableSources.filter(
        (item) => item !== name
      );
    },
    setSourceApi2(name, value = true) {
      if (!name) return;
      const target = this.newsArr.find((item) => item.name === name);
      if (!target) return;
      if (target.useApi2 !== value) {
        target.useApi2 = value;
      }
    },
    // 初始化默认榜单（SSR/预渲染也能有基础数据）
    ensureNewsList() {
      this.defaultNewsArr = this.ensureCategoriesForNews(this.defaultNewsArr);
      if (!this.newsArr || this.newsArr.length === 0) {
        this.newsArr = this.defaultNewsArr;
      } else {
        this.newsArr = this.dedupeNewsList(this.newsArr);
      }
    },
    // 检查更新
    checkNewsUpdate() {
      this.defaultNewsArr = this.ensureCategoriesForNews(this.defaultNewsArr);
      this.newsArr = this.dedupeNewsList(this.newsArr);
      if (typeof localStorage === "undefined") {
        this.ensureNewsList();
        return false;
      }
      const mainData = JSON.parse(localStorage.getItem("mainData"));
      let updatedNum = 0;
      if (!mainData) return false;
      console.log("列表尝试更新", this.defaultNewsArr, this.newsArr);
      // 执行比较并迁移
      if (this.newsArr.length > 0) {
        for (const newItem of this.defaultNewsArr) {
          const exists = this.newsArr.some((news) => newItem.name === news.name);
          if (!exists) {
            console.log("列表有更新：", newItem);
            updatedNum++;
            this.newsArr.push(newItem);
          }
        }
        this.newsArr = this.dedupeNewsList(this.newsArr);
        if (updatedNum) $message.success(`成功更新 ${updatedNum} 个榜单数据`);
      } else {
        console.log("列表无内容，写入默认");
        this.newsArr = this.defaultNewsArr;
      }
    },
  },
  persist: [
    {
      storage: localStorage,
      paths: [
        "siteTheme",
        "siteThemeAuto",
        "newsArr",
        "linkOpenType",
        "headerFixed",
        "headerCollapsed",
        "compactMode",
        "autoRefreshEnabled",
        "autoRefreshPaused",
        "autoRefreshInterval",
        "showImages",
        "categoryEnabled",
        "activeCategory",
        "categories",
        "listFontSize",
        "analyticsConsent",
        "analyticsPromptDismissed",
      ],
    },
  ],
});
