const STORAGE_PREFIX = "dailyhot:source-subtype:";

const SOURCE_SUBTYPE_OPTIONS = {
  baidu: [
    { label: "热搜", value: "realtime" },
    { label: "小说", value: "novel" },
    { label: "电影", value: "movie" },
    { label: "电视剧", value: "teleplay" },
    { label: "汽车", value: "car" },
    { label: "游戏", value: "game" },
  ],
  hostloc: [
    { label: "最新回复", value: "new" },
    { label: "最新发表", value: "newthread" },
  ],
  "douban-movie": [
    { label: "影院热映", value: "movie_showing" },
    { label: "热门电影", value: "movie_hot_gaia" },
    { label: "新片榜", value: "movie_hot" },
    { label: "最新电影", value: "movie_latest" },
    { label: "热门电视剧", value: "tv_hot" },
    { label: "国产剧", value: "tv_domestic" },
    { label: "综艺", value: "show_hot" },
    { label: "欧美剧", value: "tv_american" },
    { label: "日剧", value: "tv_japanese" },
    { label: "韩剧", value: "tv_korean" },
    { label: "动画", value: "tv_animation" },
    { label: "纪录片", value: "tv_documentary" },
  ],
};

const normalizeValue = (value) => {
  if (Array.isArray(value)) return value[0] || null;
  return value ?? null;
};

export const getSourceSubtypeOptions = (sourceName) =>
  SOURCE_SUBTYPE_OPTIONS[sourceName] || [];

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
