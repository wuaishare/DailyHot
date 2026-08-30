import { ref } from "vue";

const ORDER_STORAGE_KEY = "dailyhot:global-indexes:order:v1";
const SORT_STORAGE_KEY = "dailyhot:global-indexes:sort:v1";
const EXCLUDED_REGIONS_STORAGE_KEY = "dailyhot:global-indexes:regions:v1";

export const GLOBAL_INDEX_SORT_MODES = {
  GAIN: "gain",
  IMPORTANCE: "importance",
  CUSTOM: "custom",
};

export const GLOBAL_INDEX_IMPORTANCE_ORDER = [
  "deutsche-boerse-spx",
  "nasdaq-comp",
  "deutsche-boerse-dji",
  "nasdaq-ndx",
  "deutsche-boerse-rut",
  "sse-000300",
  "sse-000001",
  "hsi-hsi",
  "deutsche-boerse-n225",
  "deutsche-boerse-ftse100",
  "deutsche-boerse-dax",
  "stoxx-sx5e",
  "tmx-tsx",
  "asx-xjo",
  "nifty-nifty50",
  "bse-sensex",
  "krx-kospi",
  "twse-taiex",
  "deutsche-boerse-cac40",
  "deutsche-boerse-smi",
  "b3-ibov",
  "hsi-hstech",
  "szse-399001",
  "szse-399006",
  "deutsche-boerse-ibex35",
  "borsa-ftsemib",
  "krx-kospi200",
  "krx-kosdaq",
];

const uniqueIds = (ids = []) =>
  [...new Set(ids.map((id) => String(id || "").trim()).filter(Boolean))];

const safeReadArray = (key) => {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? uniqueIds(parsed) : [];
  } catch {
    return [];
  }
};

export const readGlobalIndexOrder = () => safeReadArray(ORDER_STORAGE_KEY);

export const readGlobalIndexSortMode = () => {
  if (typeof localStorage === "undefined") return GLOBAL_INDEX_SORT_MODES.IMPORTANCE;
  const stored = localStorage.getItem(SORT_STORAGE_KEY);
  if (Object.values(GLOBAL_INDEX_SORT_MODES).includes(stored)) return stored;
  // 兼容上一版已经保存过拖拽顺序的用户：已有自定义顺序时自动迁移到自定义模式。
  return readGlobalIndexOrder().length
    ? GLOBAL_INDEX_SORT_MODES.CUSTOM
    : GLOBAL_INDEX_SORT_MODES.IMPORTANCE;
};

export const readGlobalIndexExcludedRegions = () =>
  safeReadArray(EXCLUDED_REGIONS_STORAGE_KEY);

export const globalIndexCustomOrder = ref(readGlobalIndexOrder());
export const globalIndexSortMode = ref(readGlobalIndexSortMode());
export const globalIndexExcludedRegions = ref(readGlobalIndexExcludedRegions());

export const saveGlobalIndexOrder = (ids = []) => {
  const normalized = uniqueIds(ids);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(normalized));
  }
  globalIndexCustomOrder.value = normalized;
  return normalized;
};

export const resetGlobalIndexOrder = () => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(ORDER_STORAGE_KEY);
  }
  globalIndexCustomOrder.value = [];
};

export const saveGlobalIndexSortMode = (mode) => {
  const normalized = Object.values(GLOBAL_INDEX_SORT_MODES).includes(mode)
    ? mode
    : GLOBAL_INDEX_SORT_MODES.IMPORTANCE;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SORT_STORAGE_KEY, normalized);
  }
  globalIndexSortMode.value = normalized;
  return normalized;
};

export const saveGlobalIndexExcludedRegions = (regionCodes = []) => {
  const normalized = uniqueIds(regionCodes);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(EXCLUDED_REGIONS_STORAGE_KEY, JSON.stringify(normalized));
  }
  globalIndexExcludedRegions.value = normalized;
  return normalized;
};

const sortByImportance = (items = []) => {
  const rank = new Map(GLOBAL_INDEX_IMPORTANCE_ORDER.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const aRank = rank.has(a?.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bRank = rank.has(b?.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
};

const sortByGain = (items = []) => {
  const importanceRank = new Map(
    GLOBAL_INDEX_IMPORTANCE_ORDER.map((id, index) => [id, index])
  );
  return [...items].sort((a, b) => {
    const aGain = Number(a?.extra?.changeRate);
    const bGain = Number(b?.extra?.changeRate);
    const normalizedA = Number.isFinite(aGain) ? aGain : Number.NEGATIVE_INFINITY;
    const normalizedB = Number.isFinite(bGain) ? bGain : Number.NEGATIVE_INFINITY;
    if (normalizedB !== normalizedA) return normalizedB - normalizedA;
    return (
      (importanceRank.get(a?.id) ?? Number.MAX_SAFE_INTEGER) -
      (importanceRank.get(b?.id) ?? Number.MAX_SAFE_INTEGER)
    );
  });
};

const sortByCustom = (items = [], customIds = []) => {
  const importanceSorted = sortByImportance(items);
  const normalizedCustomIds = uniqueIds(customIds);
  if (!normalizedCustomIds.length) return importanceSorted;
  const itemById = new Map(importanceSorted.map((item) => [item?.id, item]));
  const ordered = normalizedCustomIds.map((id) => itemById.get(id)).filter(Boolean);
  const orderedIds = new Set(ordered.map((item) => item.id));
  return ordered.concat(importanceSorted.filter((item) => !orderedIds.has(item?.id)));
};

export const applyGlobalIndexPreferences = (
  items = [],
  {
    sortMode = globalIndexSortMode.value,
    customIds = globalIndexCustomOrder.value,
    excludedRegions = globalIndexExcludedRegions.value,
  } = {}
) => {
  const excluded = new Set(uniqueIds(excludedRegions));
  const filtered = items.filter((item) => {
    const regionCode = String(item?.extra?.regionCode || "").trim();
    return !regionCode || !excluded.has(regionCode);
  });

  if (sortMode === GLOBAL_INDEX_SORT_MODES.IMPORTANCE) {
    return sortByImportance(filtered);
  }
  if (sortMode === GLOBAL_INDEX_SORT_MODES.CUSTOM) {
    return sortByCustom(filtered, customIds);
  }
  return sortByGain(filtered);
};

// Backward-compatible helper used by older call sites while preferences migrate.
export const applyGlobalIndexOrder = (items = [], customIds = readGlobalIndexOrder()) =>
  sortByCustom(items, customIds);
