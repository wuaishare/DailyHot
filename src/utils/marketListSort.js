import { reactive } from "vue";

const STORAGE_PREFIX = "dailyhot:market-sort:v1:";
const RANK_DIRECTION_STORAGE_PREFIX = "dailyhot:market-rank-direction:v1:";

export const MARKET_SORT_MODES = {
  RANK: "rank",
  GAIN: "gain",
  LOSS: "loss",
  ACTIVITY: "activity",
};

export const MARKET_RANK_DIRECTIONS = {
  NORMAL: "normal",
  REVERSE: "reverse",
};

const SORTABLE_SOURCES = new Set(["sse", "szse", "hkex", "nasdaq", "nyse", "twse", "nse"]);
const NATIVE_RANK_TYPES_BY_SOURCE = {
  sse: new Set(["stock", "stock-volume", "stock-gain", "stock-loss", "etf"]),
  szse: new Set([
    "stock",
    "stock-volume",
    "stock-trades",
    "stock-gain",
    "stock-loss",
    "stock-turnover",
    "etf",
  ]),
  hkex: new Set(["turnover", "volume", "gain", "loss"]),
  nasdaq: new Set(["dollar", "volume", "gain", "loss"]),
  nyse: new Set(["turnover", "volume", "gain", "loss"]),
  twse: new Set(["turnover", "volume", "gain", "loss"]),
  nse: new Set(["turnover", "volume", "gain", "loss"]),
};
const validModes = new Set(Object.values(MARKET_SORT_MODES));

export const marketListSortModes = reactive({});
export const marketRankDirections = reactive({});

export const isMarketListSortable = (source) => SORTABLE_SOURCES.has(String(source || ""));

export const isNativeMarketRanking = (source, subtype) => {
  const nativeTypes = NATIVE_RANK_TYPES_BY_SOURCE[String(source || "")];
  return nativeTypes?.has(String(subtype || "")) || false;
};

const getRankDirectionKey = (source, subtype) =>
  `${String(source || "")}:${String(subtype || "default")}`;

export const readMarketRankDirection = (source, subtype) => {
  const key = getRankDirectionKey(source, subtype);
  if (marketRankDirections[key]) return marketRankDirections[key];
  let direction = MARKET_RANK_DIRECTIONS.NORMAL;
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(`${RANK_DIRECTION_STORAGE_PREFIX}${key}`);
    if (Object.values(MARKET_RANK_DIRECTIONS).includes(stored)) direction = stored;
  }
  marketRankDirections[key] = direction;
  return direction;
};

export const saveMarketRankDirection = (source, subtype, direction) => {
  const key = getRankDirectionKey(source, subtype);
  const normalized = Object.values(MARKET_RANK_DIRECTIONS).includes(direction)
    ? direction
    : MARKET_RANK_DIRECTIONS.NORMAL;
  marketRankDirections[key] = normalized;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(`${RANK_DIRECTION_STORAGE_PREFIX}${key}`, normalized);
  }
  return normalized;
};

export const applyMarketRankDirection = (items = [], source, subtype) => {
  if (!isNativeMarketRanking(source, subtype)) return [...items];
  return readMarketRankDirection(source, subtype) === MARKET_RANK_DIRECTIONS.REVERSE
    ? [...items].reverse()
    : [...items];
};

export const getMarketListActivityKind = (source) =>
  String(source || "") === "nasdaq" ? "volume" : "amount";

export const readMarketListSortMode = (source) => {
  const name = String(source || "");
  if (!isMarketListSortable(name)) return MARKET_SORT_MODES.RANK;
  if (marketListSortModes[name]) return marketListSortModes[name];
  let mode = MARKET_SORT_MODES.RANK;
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${name}`);
    if (validModes.has(stored)) mode = stored;
  }
  marketListSortModes[name] = mode;
  return mode;
};

export const saveMarketListSortMode = (source, mode) => {
  const name = String(source || "");
  if (!isMarketListSortable(name)) return MARKET_SORT_MODES.RANK;
  const normalized = validModes.has(mode) ? mode : MARKET_SORT_MODES.RANK;
  marketListSortModes[name] = normalized;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(`${STORAGE_PREFIX}${name}`, normalized);
  }
  return normalized;
};

const getChangeRate = (item) => {
  const value = Number(item?.extra?.changeRate);
  return Number.isFinite(value) ? value : 0;
};

const getActivityValue = (item, source) => {
  const extra = item?.extra || {};
  const candidate =
    getMarketListActivityKind(source) === "volume"
      ? extra.volume ?? item?.hot
      : extra.amount ?? item?.hot ?? extra.volume;
  const value = Number(candidate);
  return Number.isFinite(value) ? value : 0;
};

export const applyMarketListSort = (
  items = [],
  source,
  mode = readMarketListSortMode(source)
) => {
  if (!isMarketListSortable(source) || mode === MARKET_SORT_MODES.RANK) {
    return [...items];
  }
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      let delta = 0;
      if (mode === MARKET_SORT_MODES.GAIN) {
        delta = getChangeRate(b.item) - getChangeRate(a.item);
      } else if (mode === MARKET_SORT_MODES.LOSS) {
        delta = getChangeRate(a.item) - getChangeRate(b.item);
      } else if (mode === MARKET_SORT_MODES.ACTIVITY) {
        delta = getActivityValue(b.item, source) - getActivityValue(a.item, source);
      }
      return delta || a.index - b.index;
    })
    .map(({ item }) => item);
};
