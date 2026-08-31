import { defineStore } from "pinia";
import { BUILTIN_CATEGORIES as SITE_BUILTIN_CATEGORIES } from "@/config/site-metadata.mjs";
import {
  MAX_CATEGORY_DEPTH,
  canMoveCategory,
  getCategoryByRef,
  getCategoryDepth,
  getSourceCategoryIds,
  normalizeCategoryTree,
  syncLegacyPrimaryCategory,
} from "@/utils/categoryTree";

const BUILTIN_CATEGORIES = SITE_BUILTIN_CATEGORIES.map((item, order) => ({
  ...item,
  order,
  parentId: null,
  builtin: true,
}));

const BUILTIN_CATEGORY_MIGRATIONS = {
  xueqiu: { from: "综合", to: "财经" },
  "ithome-xijiayi": { from: "科技", to: "羊毛" },
};

const BUILTIN_ORDER_MIGRATIONS = {
  "global-indexes": { from: 7.95, to: 7.45 },
  nyse: { from: 7.91, to: 19.5 },
  twse: { from: 7.92, to: 34.5 },
  nse: { from: 7.93, to: 49.5 },
};

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
          label: "雪球",
          name: "xueqiu",
          order: 7.5,
          show: true,
          category: "财经",
          subtype: "topics",
        },
        {
          label: "上交所",
          name: "sse",
          order: 7.6,
          show: true,
          category: "财经",
          subtype: "stock",
        },
        {
          label: "深交所",
          name: "szse",
          order: 7.7,
          show: true,
          category: "财经",
          subtype: "stock",
        },
        {
          label: "港交所",
          name: "hkex",
          order: 7.8,
          show: true,
          category: "财经",
        },
        {
          label: "Nasdaq",
          name: "nasdaq",
          order: 7.9,
          show: true,
          category: "财经",
        },
        {
          label: "NYSE",
          name: "nyse",
          order: 19.5,
          show: true,
          category: "财经",
        },
        {
          label: "台交所",
          name: "twse",
          order: 34.5,
          show: true,
          category: "财经",
        },
        {
          label: "NSE",
          name: "nse",
          order: 49.5,
          show: true,
          category: "财经",
        },
        {
          label: "澳交所",
          name: "asx",
          order: 56.5,
          show: true,
          category: "财经",
        },
        {
          label: "全球股指",
          name: "global-indexes",
          order: 7.45,
          show: true,
          category: "财经",
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
          categoryIds: ["life", "wool"],
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
          subtype: "日榜",
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
          label: "超级线报",
          name: "super-deals",
          order: 51.6,
          show: true,
          category: "羊毛",
          subtype: "latest",
        },
        {
          label: "0818团",
          name: "0818tuan",
          order: 51.7,
          show: true,
          category: "羊毛",
          subtype: "latest",
        },
        {
          label: "NodeLoc",
          name: "nodeloc-deals",
          order: 51.8,
          show: true,
          category: "羊毛",
          categoryIds: ["wool", "community"],
          subtype: "wool",
        },
        {
          label: "豆瓣羊毛",
          name: "douban-wool",
          order: 51.9,
          show: true,
          category: "羊毛",
          categoryIds: ["wool", "community"],
          subtype: "buy",
        },
        {
          label: "豆瓣宠物羊毛",
          name: "douban-pet-wool",
          order: 51.95,
          show: true,
          category: "羊毛",
          categoryIds: ["wool", "life"],
          subtype: "catlife",
        },
        {
          label: "IT之家「喜加一」",
          name: "ithome-xijiayi",
          order: 52,
          show: true,
          category: "羊毛",
          categoryIds: ["wool", "games"],
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
          label: "OpenRouter",
          name: "openrouter-rankings",
          order: 57,
          show: true,
          category: "AI",
          subtype: "模型周度热度榜",
        },
        {
          label: "Artificial Analysis",
          name: "artificialanalysis",
          order: 58,
          show: true,
          category: "AI",
          subtype: "模型综合评测榜",
        },
        {
          label: "Arena AI",
          name: "arena-ai",
          order: 59,
          show: true,
          category: "AI",
          subtype: "综合对话榜",
        },
        {
          label: "DesignArena",
          name: "designarena",
          order: 60,
          show: true,
          category: "AI",
          subtype: "Agentic 全栈应用模型榜",
        },
        {
          label: "AICPB",
          name: "aicpb-rankings",
          order: 61,
          show: true,
          category: "AI",
          subtype: "全球 AI 产品热度榜",
        },
        {
          label: "LLM Stats",
          name: "llm-stats",
          order: 62,
          show: true,
          category: "AI",
          subtype: "模型性能 / 价格榜",
        },
        {
          label: "Skills Rank",
          name: "skills-rank",
          order: 63,
          show: true,
          category: "AI",
          subtype: "Agent Skills 安装榜",
        },
        {
          label: "ClawHub",
          name: "clawhub",
          order: 64,
          show: true,
          category: "AI",
          subtype: "技能 / 插件",
        },
        {
          label: "OpenAI",
          name: "openai",
          order: 65,
          show: true,
          category: "AI",
          subtype: "官方新闻",
        },
        {
          label: "Anthropic",
          name: "anthropic-news",
          order: 66,
          show: true,
          category: "AI",
          subtype: "官方新闻",
        },
        {
          label: "DeepMind",
          name: "deepmind-blog",
          order: 67,
          show: true,
          category: "AI",
          subtype: "官方博客",
        },
        {
          label: "Meta AI",
          name: "meta-ai-blog",
          order: 68,
          show: true,
          category: "AI",
          subtype: "官方 AI 动态",
        },
        {
          label: "Mistral",
          name: "mistral-news",
          order: 69,
          show: true,
          category: "AI",
          subtype: "官方新闻",
        },
        {
          label: "Cohere",
          name: "cohere-blog",
          order: 70,
          show: true,
          category: "AI",
          subtype: "官方博客",
        },
        {
          label: "Perplexity",
          name: "perplexity-blog",
          order: 73,
          show: false,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "xAI",
          name: "xai-news",
          order: 74,
          show: false,
          category: "AI",
          subtype: "官方资讯",
        },
        {
          label: "Hugging Face",
          name: "huggingface",
          order: 74,
          show: true,
          category: "AI",
          subtype: "官方博客",
        },
        {
          label: "Papers with Code",
          name: "paperswithcode",
          order: 75,
          show: false,
          category: "AI",
          subtype: "论文代码镜像榜",
        },
        {
          label: "Product Hunt",
          name: "producthunt-ai",
          order: 76,
          show: true,
          category: "AI",
          subtype: "AI 新品发现",
        },
        {
          label: "Hacker News",
          name: "hackernews-ai",
          order: 77,
          show: true,
          category: "AI",
          subtype: "AI 热门讨论",
        },
        {
          label: "Reddit /r/LocalLLaMA",
          name: "reddit-localllama",
          order: 80,
          show: false,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/MachineLearning",
          name: "reddit-machinelearning",
          order: 81,
          show: false,
          category: "AI",
          subtype: "社区热议",
        },
        {
          label: "Reddit /r/artificial",
          name: "reddit-artificial",
          order: 82,
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
          subtype: "",
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
      autoRefreshRoutePaused: false,
      autoRefreshRemainingMs: null,
      autoRefreshInterval: 1800,
      // 是否显示封面图片
      showImages: true,
      // 分类
      categoryEnabled: true,
      activeCategory: "全部",
      categories: BUILTIN_CATEGORIES,
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
    ensureBuiltinCategories() {
      const current = normalizeCategoryTree(
        Array.isArray(this.categories) ? this.categories : [],
      );
      const mergedBuiltin = BUILTIN_CATEGORIES.map((builtin) => {
        const existing = current.find(
          (item) => item?.id === builtin.id || item?.name === builtin.name,
        );
        return {
          ...builtin,
          ...existing,
          id: builtin.id,
          name: builtin.name,
          slug: builtin.slug,
          parentId: null,
          order: Number.isFinite(Number(existing?.order))
            ? Number(existing.order)
            : builtin.order,
          builtin: true,
        };
      });
      const custom = current
        .filter(
          (item) =>
            item &&
            !BUILTIN_CATEGORIES.some(
              (builtin) => builtin.id === item.id || builtin.name === item.name,
            ),
        )
        .map((item, index) => ({
          ...item,
          order: Number.isFinite(Number(item.order))
            ? Number(item.order)
            : BUILTIN_CATEGORIES.length + index,
          builtin: false,
        }));
      this.categories = mergedBuiltin.concat(custom);
      if (
        this.activeCategory !== "全部" &&
        !this.categories.some((item) => item.name === this.activeCategory)
      ) {
        this.activeCategory = "全部";
      }
    },
    ensureCategoriesForNews(list) {
      const categories = this.categories || BUILTIN_CATEGORIES;
      return list.map((item) => syncLegacyPrimaryCategory(item, categories));
    },
    mergeNewsWithDefaults(list) {
      list = this.normalizeLegacySources(list);
      const defaultByName = new Map(
        this.defaultNewsArr.map((item) => [item.name, item]),
      );
      return this.ensureCategoriesForNews(list).map((item) => {
        const defaults = defaultByName.get(item.name) || {};
        const merged = {
          ...defaults,
          ...item,
        };
        if (
          !item.categoryIdsCustomized &&
          Array.isArray(defaults.categoryIds)
        ) {
          merged.categoryIds = [
            ...new Set([
              ...getSourceCategoryIds(item, this.categories),
              ...defaults.categoryIds,
            ]),
          ];
        }
        Object.assign(
          merged,
          syncLegacyPrimaryCategory(merged, this.categories),
        );
        if (defaults.label) {
          merged.label = defaults.label;
        }
        if (defaults.subtype) {
          merged.subtype = defaults.subtype;
        }
        const categoryMigration = BUILTIN_CATEGORY_MIGRATIONS[item.name];
        if (
          categoryMigration &&
          item.category === categoryMigration.from &&
          defaults.category === categoryMigration.to
        ) {
          merged.category = categoryMigration.to;
          const targetCategory = getCategoryByRef(
            this.categories,
            categoryMigration.to,
          );
          if (targetCategory && !merged.categoryIdsCustomized) {
            merged.categoryIds = [
              ...new Set([
                targetCategory.id,
                ...(Array.isArray(defaults.categoryIds)
                  ? defaults.categoryIds
                  : []),
              ]),
            ];
          }
        }
        const orderMigration = BUILTIN_ORDER_MIGRATIONS[item.name];
        if (
          orderMigration &&
          Number(item.order) === orderMigration.from &&
          Number(defaults.order) === orderMigration.to
        ) {
          merged.order = orderMigration.to;
        }
        if (item.name === "paperswithcode") {
          merged.show = false;
        }
        return merged;
      });
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
          order: typeof current.order === "number" ? current.order : item.order,
        });
      }
      return Array.from(byName.values());
    },
    normalizeLegacySources(list) {
      if (!Array.isArray(list) || !list.length) return list;
      const mergeGroup = (items, targetName, legacyNames) => {
        const targetDefault = this.defaultNewsArr.find(
          (item) => item.name === targetName,
        );
        if (!targetDefault) return items;
        const existingTarget = items.find((item) => item?.name === targetName);
        const legacyItems = items.filter((item) =>
          legacyNames.includes(item?.name),
        );
        if (!existingTarget && !legacyItems.length) {
          return items;
        }
        const keep = items.filter(
          (item) =>
            item?.name !== targetName && !legacyNames.includes(item?.name),
        );
        const sourceItems = [existingTarget, ...legacyItems].filter(Boolean);
        const merged = sourceItems.reduce(
          (acc, item) => ({
            ...acc,
            ...item,
            ...targetDefault,
            name: targetDefault.name,
            label: targetDefault.label,
            subtype: targetDefault.subtype,
            category: targetDefault.category,
            show: acc.show || item.show,
          }),
          { ...targetDefault, show: false },
        );
        const orders = sourceItems
          .map((item) => item.order)
          .filter((value) => typeof value === "number");
        if (orders.length) {
          merged.order = Math.min(...orders);
        }
        keep.push(merged);
        return keep;
      };

      let normalized = list;
      normalized = mergeGroup(normalized, "clawhub", [
        "clawhub-skills",
        "clawhub-plugins",
      ]);
      normalized = mergeGroup(normalized, "openai", [
        "openai-news",
        "openai-research",
      ]);
      normalized = mergeGroup(normalized, "arena-ai", ["lmarena"]);
      normalized = mergeGroup(normalized, "huggingface", [
        "huggingface-blog",
        "hf-models",
        "hf-papers",
      ]);
      return normalized;
    },
    addCategory(name, parentId = null) {
      const cleanName = String(name || "").trim();
      if (!cleanName) return false;
      const limit = 40;
      const exists = this.categories.some((cat) => cat.name === cleanName);
      if (exists) return false;
      if (this.categories.length >= limit) {
        $message?.warning?.(`最多创建 ${limit} 个分类`);
        return false;
      }
      const parent = parentId
        ? getCategoryByRef(this.categories, parentId)
        : null;
      if (
        parent &&
        getCategoryDepth(this.categories, parent.id) >= MAX_CATEGORY_DEPTH
      ) {
        $message?.warning?.(`最多支持 ${MAX_CATEGORY_DEPTH} 级分类`);
        return false;
      }
      const id = `custom-${Date.now()}`;
      this.categories.push({
        id,
        name: cleanName,
        slug: id,
        parentId: parent?.id || null,
        order: this.categories.length,
        builtin: false,
      });
      return id;
    },
    removeCategory(id) {
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return;
      const removed = new Set([cat.id]);
      let changed = true;
      while (changed) {
        changed = false;
        this.categories.forEach((item) => {
          if (
            item.parentId &&
            removed.has(item.parentId) &&
            !removed.has(item.id)
          ) {
            removed.add(item.id);
            changed = true;
          }
        });
      }
      const activeCategoryBeforeDelete = getCategoryByRef(
        this.categories,
        this.activeCategory,
      );
      this.categories = this.categories.filter((item) => !removed.has(item.id));
      this.newsArr = this.newsArr.map((item) => {
        const categoryIds = getSourceCategoryIds(item, this.categories).filter(
          (categoryId) => !removed.has(categoryId),
        );
        return syncLegacyPrimaryCategory(
          {
            ...item,
            categoryIds: categoryIds.length ? categoryIds : ["general"],
            categoryIdsCustomized: true,
          },
          this.categories,
        );
      });
      if (
        activeCategoryBeforeDelete &&
        removed.has(activeCategoryBeforeDelete.id)
      ) {
        this.activeCategory = "全部";
      }
    },
    renameCategory(id, newName) {
      const cleanName = String(newName || "").trim();
      if (!cleanName) return;
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return;
      cat.name = cleanName;
      this.newsArr = this.newsArr.map((item) =>
        syncLegacyPrimaryCategory(item, this.categories),
      );
    },
    moveCategory(id, parentId = null) {
      const cat = getCategoryByRef(this.categories, id);
      if (!cat || cat.builtin) return false;
      if (!canMoveCategory(this.categories, cat.id, parentId)) return false;
      const parent = parentId
        ? getCategoryByRef(this.categories, parentId)
        : null;
      cat.parentId = parent?.id || null;
      return true;
    },
    setSourceCategories(sourceName, categoryIds = []) {
      const target = this.newsArr.find((item) => item.name === sourceName);
      if (!target) return false;
      const valid = [...new Set(categoryIds.map(String))].filter((id) =>
        getCategoryByRef(this.categories, id),
      );
      Object.assign(
        target,
        syncLegacyPrimaryCategory(
          {
            ...target,
            categoryIds: valid.length ? valid : ["general"],
            categoryIdsCustomized: true,
          },
          this.categories,
        ),
      );
      return true;
    },
    reorderCategories(orderedIds = []) {
      const orderMap = new Map(
        orderedIds.map((id, index) => [String(id), index]),
      );
      this.categories = this.categories
        .map((item) => ({
          ...item,
          order: orderMap.has(String(item.id))
            ? orderMap.get(String(item.id))
            : item.order,
        }))
        .sort((a, b) => a.order - b.order);
    },
    setActiveCategory(name) {
      this.activeCategory = name;
    },
    reorderVisibleNews(orderedNames = [], scopedNames = orderedNames) {
      const scopedSet = new Set(scopedNames.filter(Boolean));
      const orderedItems = orderedNames
        .map((name) => this.newsArr.find((item) => item.name === name))
        .filter(Boolean);
      if (!scopedSet.size || !orderedItems.length) return;

      let scopedIndex = 0;
      this.newsArr = this.newsArr
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((item) =>
          scopedSet.has(item.name) ? orderedItems[scopedIndex++] || item : item,
        )
        .map((item, index) => ({
          ...item,
          order: index,
        }));
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
        (item) => item !== name,
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
      this.ensureBuiltinCategories();
      this.defaultNewsArr = this.ensureCategoriesForNews(this.defaultNewsArr);
      if (!this.newsArr || this.newsArr.length === 0) {
        this.newsArr = this.defaultNewsArr;
      } else {
        this.newsArr = this.dedupeNewsList(this.newsArr);
      }
    },
    // 检查更新
    checkNewsUpdate() {
      this.ensureBuiltinCategories();
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
          const exists = this.newsArr.some(
            (news) => newItem.name === news.name,
          );
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
