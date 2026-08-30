const STORAGE_KEY = "dailyhot:global-indexes:order:v1";

export const GLOBAL_INDEX_DEFAULT_ORDER = [
  "deutsche-boerse-spx",
  "nasdaq-comp",
  "deutsche-boerse-dji",
  "nasdaq-ndx",
  "sse-000001",
  "sse-000300",
  "hsi-hsi",
  "deutsche-boerse-n225",
  "deutsche-boerse-ftse100",
  "deutsche-boerse-dax",
  "stoxx-sx5e",
  "nifty-nifty50",
  "bse-sensex",
  "twse-taiex",
  "krx-kospi",
  "deutsche-boerse-rut",
  "deutsche-boerse-cac40",
  "hsi-hstech",
  "szse-399001",
  "szse-399006",
  "krx-kospi200",
  "krx-kosdaq",
];

const uniqueIds = (ids = []) =>
  [...new Set(ids.map((id) => String(id || "").trim()).filter(Boolean))];

export const readGlobalIndexOrder = () => {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? uniqueIds(parsed) : [];
  } catch {
    return [];
  }
};

export const saveGlobalIndexOrder = (ids = []) => {
  const normalized = uniqueIds(ids);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
};

export const resetGlobalIndexOrder = () => {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const applyGlobalIndexOrder = (items = [], customIds = readGlobalIndexOrder()) => {
  const defaultRank = new Map(GLOBAL_INDEX_DEFAULT_ORDER.map((id, index) => [id, index]));
  const defaultSorted = [...items].sort((a, b) => {
    const aRank = defaultRank.has(a?.id) ? defaultRank.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bRank = defaultRank.has(b?.id) ? defaultRank.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });

  const normalizedCustomIds = uniqueIds(customIds);
  if (!normalizedCustomIds.length) return defaultSorted;

  const itemById = new Map(defaultSorted.map((item) => [item?.id, item]));
  const ordered = normalizedCustomIds.map((id) => itemById.get(id)).filter(Boolean);
  const orderedIds = new Set(ordered.map((item) => item.id));
  return ordered.concat(defaultSorted.filter((item) => !orderedIds.has(item?.id)));
};
