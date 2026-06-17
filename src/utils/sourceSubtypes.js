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
      key: "frontend",
      label: "前端",
      items: [
        { label: "Website", value: "website" },
        { label: "UI Component", value: "uicomponent" },
        { label: "DataViz", value: "dataviz" },
        { label: "SVG", value: "svg" },
      ],
    },
    {
      key: "creative",
      label: "创意",
      items: [
        { label: "Game Dev", value: "gamedev" },
        { label: "3D", value: "3d" },
        { label: "Slides", value: "slides" },
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
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
