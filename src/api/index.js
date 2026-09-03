import axios from "@/api/request";
import { getAdminToken } from "@/utils/adminAuth";

const DEFAULT_FALLBACK_DELAY_MS = 1200;
const API2_ONLY_SOURCES = new Set(["tianya"]);
const SAME_ORIGIN_API_SOURCES = new Set([
  "artificialanalysis",
  "bilibili",
  "designarena",
  "ithome",
  "clawhub",
  "openrouter-rankings",
  "weibo",
  "wool-topic",
  "game-deals-topic",
  "chigua-topic",
  "ai-topic",
]);
const DIRECT_PUBLIC_API_SOURCES = new Set([
  "super-deals",
  "0818tuan",
  "nodeloc-deals",
  "douban-wool",
  "douban-pet-wool",
  "ithome-xijiayi",
  "steam-deals",
  "epic-free-games",
  "xiaoheihe-deals",
  "ggdeals",
  "gog-deals",
  "xueqiu",
  "sse",
  "szse",
  "hkex",
  "nasdaq",
  "nyse",
  "twse",
  "nse",
  "asx",
  "global-indexes",
  "cls",
  "eastmoney-flash",
  "jin10",
  "tonghuashun",
  "wallstreetcn",
  "sina-finance-flash",
  "yicai-flash",
  "qbitai-ai",
  "paperswithcode",
  "bbc-world",
  "guardian-world",
  "techcrunch",
  "theverge",
  "arstechnica",
  "lobsters",
  "nhk-news",
  "hatena-hot",
  "google-trends",
  "devto",
  "aljazeera",
  "npr-news",
  "dw-news",
  "france24-fr",
  "lemonde",
  "elpais",
  "yonhap",
  "nasa-news",
  "nature-news",
  "arxiv-ai",
  "timesofindia",
  "marketwatch",
  "krebsonsecurity",
  "thehackernews",
  "google-security",
  "who-news",
  "sciencenews",
  "smashing",
  "dezeen",
  "github-blog",
  "stackoverflow-blog",
  "infoq",
  "eurogamer",
  "cbc-news",
  "abc-au-news",
  "rnz-news",
  "wired",
]);
const PUBLIC_API2_BASE =
  import.meta.env.VITE_GLOBAL_API2 ||
  (import.meta.env.PROD ? "https://hotapi2.wuaishare.cn" : "");
const appApiBase = import.meta.env.VITE_GLOBAL_API;
const analyticsApiBases = import.meta.env.PROD
  ? ["/api", import.meta.env.VITE_GLOBAL_API].filter(Boolean)
  : [import.meta.env.VITE_GLOBAL_API2, import.meta.env.VITE_GLOBAL_API].filter(
      Boolean,
    );

const DEFAULT_TRENDS_PUBLIC_API = import.meta.env.PROD
  ? "https://api.wpbetter.cn/trends/public/v1"
  : "";
const DEFAULT_TRENDS_SHADOW_SOURCES = import.meta.env.PROD
  ? "ithome,weibo,baidu,github,zhihu,bilibili,36kr,douyin,kuaishou,qq-news,sina-news,netease-news,thepaper,tieba,hupu,smzdm,juejin,huxiu,sspai,geekpark,52pojie,51cto,csdn,dgtle,nodeseek,v2ex,hackernews,guokr,hellogithub,producthunt,newsmth,ngabbs,zhihu-daily,acfun,history,earthquake,weatheralarm,yystv,sina,douban-group,gameres,ithome-xijiayi,nytimes"
  : "";
const TRENDS_PUBLIC_API = String(
  import.meta.env.VITE_TRENDS_PUBLIC_API || DEFAULT_TRENDS_PUBLIC_API,
).replace(/\/$/, "");
const TRENDS_SHADOW_SOURCES = new Set(
  String(
    import.meta.env.VITE_TRENDS_SHADOW_SOURCES ||
      DEFAULT_TRENDS_SHADOW_SOURCES,
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const DEFAULT_TRENDS_READ_SOURCES = import.meta.env.PROD ? "github,36kr,baidu,zhihu,bilibili,weibo,ithome,douyin,kuaishou,qq-news,sina-news,thepaper,netease-news,tieba,smzdm,juejin,huxiu,sspai,geekpark,ifanr,52pojie,51cto,csdn,dgtle,v2ex,nodeseek,hackernews,guokr,hellogithub,newsmth,ngabbs,zhihu-daily,producthunt,history,earthquake,weatheralarm,yystv,sina,douban-group,gameres,ithome-xijiayi,nytimes,acfun" : "";
const TRENDS_READ_SOURCES = new Set(
  String(import.meta.env.VITE_TRENDS_READ_SOURCES || DEFAULT_TRENDS_READ_SOURCES)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const TRENDS_SHADOW_DEFAULT_VARIANTS = {
  ithome: ["day", "day"],
  baidu: ["realtime", "realtime"],
  github: ["daily", "day"],
  bilibili: ["all", "popular"],
  "sina-news": ["1", "all"],
  hupu: ["1", "main"],
  "52pojie": ["digest", "digest"],
  hostloc: ["new", "new"],
  v2ex: ["hot", "hot"],
  smzdm: ["1", "day"],
  juejin: ["1", ""],
  hellogithub: { param: "sort", legacyDefault: "featured", trendsVariant: "featured" },
  sina: ["all", "all"],
  nytimes: ["china", "china"],
  acfun: { legacyParams: { type: "-1", range: "DAY" }, trendsVariant: "all-day" },
  "36kr": ["hot", "hot"],
};
const trendsShadowSeen = new Set();

const normalizeShadowText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const countOrderedShadowOverlap = (leftItems, rightItems, selector) => {
  const left = leftItems.map(selector).filter(Boolean);
  const right = rightItems.map(selector).filter(Boolean);
  const dp = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      dp[i][j] = left[i - 1] === right[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[left.length][right.length];
};

const getTrendsShadowVariant = (source, params = {}) => {
  const mapping = TRENDS_SHADOW_DEFAULT_VARIANTS[source];
  if (!mapping) return params?.type ? null : undefined;
  if (Array.isArray(mapping)) {
    const [legacyDefault, trendsVariant] = mapping;
    const legacyVariant = String(params?.type || legacyDefault);
    return legacyVariant === legacyDefault ? trendsVariant : null;
  }
  if (mapping.legacyParams) {
    const matchesDefaultParams = Object.entries(mapping.legacyParams).every(
      ([param, legacyDefault]) => String(params?.[param] ?? legacyDefault) === String(legacyDefault),
    );
    return matchesDefaultParams ? mapping.trendsVariant : null;
  }
  const { param = "type", legacyDefault, trendsVariant } = mapping;
  const legacyVariant = String(params?.[param] ?? legacyDefault);
  return legacyVariant === legacyDefault ? trendsVariant : null;
};

const normalizeTrendsRankingResult = (payload) => {
  const feed = payload?.data || {};
  const source = feed?.source || {};
  const items = Array.isArray(feed?.items) ? feed.items : [];
  const updateTime = feed?.updatedAt || payload?.observation?.observedAt || new Date().toISOString();
  return {
    code: 200,
    name: source?.key || "",
    title: source?.name || source?.key || "",
    type: feed?.rankingLabel || source?.rankingLabel || "",
    subtitle: feed?.rankingLabel || source?.rankingLabel || "",
    total: items.length,
    fromCache: true,
    updateTime,
    centralized: true,
    observationId: payload?.observation?.id || null,
    data: items.map((item, index) => ({
      ...item,
      id: item?.id || item?.url || `${source?.key || "item"}-${index + 1}`,
      desc: item?.desc || item?.summary || "",
      timestamp: item?.timestamp || Date.parse(updateTime) || Date.now(),
    })),
  };
};

const requestTrendsRanking = async (source, params = {}) => {
  if (!TRENDS_PUBLIC_API) throw new Error("trends_public_api_unavailable");
  const variant = getTrendsShadowVariant(source, params);
  if (variant === null) throw new Error("trends_variant_not_enabled");
  const url = new URL(`${TRENDS_PUBLIC_API}/rankings/${encodeURIComponent(source)}`);
  url.searchParams.set("limit", "100");
  if (variant) url.searchParams.set("variant", variant);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`trends_http_${response.status}`);
    const payload = await response.json();
    if (!payload?.data?.source || !Array.isArray(payload?.data?.items)) {
      throw new Error("trends_invalid_payload");
    }
    return normalizeTrendsRankingResult(payload);
  } finally {
    clearTimeout(timer);
  }
};

const compareTrendsShadow = (legacyResult, trendsPayload) => {
  const legacyItems = Array.isArray(legacyResult?.data) ? legacyResult.data : [];
  const trendsItems = Array.isArray(trendsPayload?.data?.items) ? trendsPayload.data.items : [];
  const topN = Math.min(10, legacyItems.length, trendsItems.length);
  const legacyTop = legacyItems.slice(0, topN);
  const trendsTop = trendsItems.slice(0, topN);
  let positionalTitleMatches = 0;
  let positionalUrlMatches = 0;
  for (let index = 0; index < topN; index += 1) {
    if (normalizeShadowText(legacyTop[index]?.title) === normalizeShadowText(trendsTop[index]?.title)) {
      positionalTitleMatches += 1;
    }
    if (String(legacyTop[index]?.url || "") === String(trendsTop[index]?.url || "")) {
      positionalUrlMatches += 1;
    }
  }
  const legacyTitles = new Set(legacyTop.map((item) => normalizeShadowText(item?.title)).filter(Boolean));
  const trendsTitles = new Set(trendsTop.map((item) => normalizeShadowText(item?.title)).filter(Boolean));
  const titleSetOverlap = [...legacyTitles].filter((title) => trendsTitles.has(title)).length;
  const legacyUrls = new Set(legacyTop.map((item) => String(item?.url || "")).filter(Boolean));
  const trendsUrls = new Set(trendsTop.map((item) => String(item?.url || "")).filter(Boolean));
  const urlSetOverlap = [...legacyUrls].filter((url) => trendsUrls.has(url)).length;
  const legacyUpdatedAt = Date.parse(legacyResult?.updateTime || "");
  const trendsObservedAt = Date.parse(trendsPayload?.observation?.observedAt || "");
  return {
    legacyCount: legacyItems.length,
    trendsCount: trendsItems.length,
    topN,
    positionalTitleMatches,
    positionalUrlMatches,
    titleSetOverlap,
    urlSetOverlap,
    orderedTitleOverlap: countOrderedShadowOverlap(
      legacyTop,
      trendsTop,
      (item) => normalizeShadowText(item?.title),
    ),
    orderedUrlOverlap: countOrderedShadowOverlap(
      legacyTop,
      trendsTop,
      (item) => String(item?.url || ""),
    ),
    observationId: trendsPayload?.observation?.id || null,
    freshnessDeltaMs:
      Number.isFinite(legacyUpdatedAt) && Number.isFinite(trendsObservedAt)
        ? trendsObservedAt - legacyUpdatedAt
        : null,
  };
};

const runTrendsShadowRead = async (source, params, legacyResult) => {
  if (!TRENDS_PUBLIC_API || !TRENDS_SHADOW_SOURCES.has(source)) return;
  const variant = getTrendsShadowVariant(source, params);
  if (variant === null) return;
  const dedupeKey = `${source}:${variant || "default"}:${legacyResult?.updateTime || ""}`;
  if (trendsShadowSeen.has(dedupeKey)) return;
  trendsShadowSeen.add(dedupeKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  const startedAt = performance.now();
  try {
    const url = new URL(`${TRENDS_PUBLIC_API}/rankings/${encodeURIComponent(source)}`);
    const legacyCount = Array.isArray(legacyResult?.data) ? legacyResult.data.length : 0;
    url.searchParams.set("limit", String(Math.min(100, Math.max(50, legacyCount))));
    if (variant) url.searchParams.set("variant", variant);
    const response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`trends_http_${response.status}`);
    const payload = await response.json();
    const comparison = compareTrendsShadow(legacyResult, payload);
    void requestAnalytics({
      method: "POST",
      url: "/analytics",
      data: {
        event: "trends_shadow_compare",
        source,
        meta: {
          ...comparison,
          variant: variant || "",
          latencyMs: Math.round(performance.now() - startedAt),
        },
      },
    }).catch(() => {});
  } catch (error) {
    await requestAnalytics({
      method: "POST",
      url: "/analytics",
      data: {
        event: "trends_shadow_error",
        source,
        meta: {
          variant: variant || "",
          kind: error?.name === "AbortError" ? "timeout" : "request_failed",
        },
      },
    }).catch(() => {});
  } finally {
    clearTimeout(timer);
  }
};

const withTrendsShadow = (source, params, payload) => {
  if (payload?.result?.code === 200) {
    void runTrendsShadowRead(source, params, payload.result);
  }
  return payload;
};

const requestAnalytics = async (config) => {
  let lastError;
  for (const baseURL of analyticsApiBases) {
    try {
      return await axios({
        ...config,
        baseURL,
        silent: true,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

/**
 * 获取热榜分类数据
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
 * @param {object} options 额外选项
 * @returns
 */
export const getHotLists = (type, isNew = false, params, options = {}) => {
  const forceSameOrigin = Boolean(options?.forceSameOrigin);
  const useDirectPublicApi =
    DIRECT_PUBLIC_API_SOURCES.has(type) && !forceSameOrigin;
  const useSameOriginApi = forceSameOrigin || SAME_ORIGIN_API_SOURCES.has(type);
  const useApi2 =
    useDirectPublicApi ||
    (!useSameOriginApi && (options?.useApi2 || API2_ONLY_SOURCES.has(type)));
  const apiBase = appApiBase;
  const apiBase2 = useDirectPublicApi
    ? PUBLIC_API2_BASE
    : import.meta.env.VITE_GLOBAL_API2;
  const timeout = options?.timeout;
  const forceNoCache = Boolean(options?.forceNoCache);
  const silent = Boolean(options?.silent);
  return axios({
    method: "GET",
    url: `/${type}`,
    baseURL: useSameOriginApi
      ? "/api"
      : useApi2
        ? apiBase2 || apiBase
        : undefined,
    params: {
      cache: forceNoCache ? false : !isNew,
      ...params,
    },
    ...(timeout ? { timeout } : {}),
    ...(silent ? { silent: true } : {}),
  });
};

export const sendAnalyticsEvent = (payload) =>
  requestAnalytics({
    method: "POST",
    url: "/analytics",
    data: payload,
  });

export const getAnalyticsDashboard = (days = 30) =>
  requestAnalytics({
    method: "GET",
    url: "/analytics",
    params: { days },
    headers: getAdminToken()
      ? {
          Authorization: `Bearer ${getAdminToken()}`,
        }
      : {},
  });

export const getReadableTranslations = async (texts = [], locale = "zh-CN") => {
  const apiBases = import.meta.env.PROD
    ? [PUBLIC_API2_BASE, "/api"]
    : [undefined];
  let lastError;
  for (const baseURL of apiBases) {
    try {
      return await axios({
        method: "POST",
        url: "/readable-translate",
        ...(baseURL ? { baseURL } : {}),
        params: {
          cache: false,
        },
        data: {
          texts,
          locale,
        },
        silent: true,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

/**
 * 获取热榜数据（主 API 失败时自动尝试备用 API）
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
 * @param {object} options 额外选项
 * @returns {Promise<{result: any, usedApi2: boolean, usedFallback: boolean, fallbackSuccess?: boolean}>}
 */
export const getHotListsWithFallback = async (
  type,
  isNew = false,
  params,
  options = {},
) => {
  if (TRENDS_READ_SOURCES.has(type)) {
    const startedAt = performance.now();
    try {
      const result = await requestTrendsRanking(type, params);
      void requestAnalytics({
        method: "POST",
        url: "/analytics",
        data: {
          event: "trends_read_success",
          source: type,
          meta: {
            observationId: result.observationId,
            itemCount: result.total,
            latencyMs: Math.round(performance.now() - startedAt),
          },
        },
      }).catch(() => {});
      return {
        result,
        usedApi2: false,
        usedFallback: false,
        fallbackSuccess: false,
        usedTrends: true,
      };
    } catch (error) {
      void requestAnalytics({
        method: "POST",
        url: "/analytics",
        data: {
          event: "trends_read_fallback",
          source: type,
          meta: {
            kind: error?.message || "request_failed",
            latencyMs: Math.round(performance.now() - startedAt),
          },
        },
      }).catch(() => {});
    }
  }
  const useDirectPublicApi = DIRECT_PUBLIC_API_SOURCES.has(type);
  const useSameOriginApi = SAME_ORIGIN_API_SOURCES.has(type);

  if (useDirectPublicApi) {
    try {
      const result = await getHotLists(type, isNew, params, {
        timeout: options?.timeout,
        forceNoCache: Boolean(options?.forceNoCache),
        silent: true,
      });
      return withTrendsShadow(type, params, {
        result,
        usedApi2: true,
        usedFallback: false,
        fallbackSuccess: false,
      });
    } catch (primaryError) {
      try {
        const result = await getHotLists(type, isNew, params, {
          timeout: options?.timeout,
          forceNoCache: Boolean(options?.forceNoCache),
          forceSameOrigin: true,
          silent: true,
        });
        return withTrendsShadow(type, params, {
          result,
          usedApi2: false,
          usedFallback: true,
          fallbackSuccess: true,
        });
      } catch {
        throw primaryError;
      }
    }
  }

  const hasApi2 =
    Boolean(import.meta.env.VITE_GLOBAL_API2) && !useSameOriginApi;
  const preferApi2 = Boolean(
    !useSameOriginApi && (options?.useApi2 || API2_ONLY_SOURCES.has(type)),
  );
  const disableFallback = Boolean(options?.disableFallback || useSameOriginApi);
  const timeout = options?.timeout;
  const forceNoCache = Boolean(options?.forceNoCache);
  const fallbackDelay = options?.fallbackDelay ?? DEFAULT_FALLBACK_DELAY_MS;
  const run = (useApi2, runOptions = {}) =>
    getHotLists(type, isNew, params, {
      useApi2,
      timeout,
      forceNoCache,
      ...runOptions,
    });

  if (preferApi2 || !hasApi2 || disableFallback) {
    const useApi2 = preferApi2 && !disableFallback;
    const result = await run(useApi2);
    return withTrendsShadow(type, params, { result, usedApi2: useApi2, usedFallback: false });
  }

  const createAttempt = (useApi2) =>
    run(useApi2, { silent: true }).then((result) => {
      if (result?.code === 200) {
        return { result, usedApi2 };
      }
      const error = new Error(result?.message || "request failed");
      error.result = result;
      error.usedApi2 = useApi2;
      throw error;
    });

  return new Promise((resolve) => {
    let finished = false;
    let fallbackStarted = false;
    const errors = [];

    const finish = (payload) => {
      if (finished) return;
      finished = true;
      resolve(withTrendsShadow(type, params, payload));
    };

    const buildFailure = (primaryError, fallbackError) => {
      const chosenError = primaryError || fallbackError || {};
      const result = chosenError.result || {
        code: 500,
        title: "请求失败",
        message: "请稍后再试",
      };
      return {
        result,
        usedApi2: Boolean(fallbackError),
        usedFallback: true,
        fallbackSuccess: false,
      };
    };

    const recordError = (error) => {
      errors.push(error);
      const primaryError = errors.find((item) => item?.usedApi2 === false);
      const fallbackError = errors.find((item) => item?.usedApi2 === true);
      if (primaryError && fallbackError) {
        finish(buildFailure(primaryError, fallbackError));
      }
    };

    const startFallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      createAttempt(true)
        .then((success) => {
          finish({
            result: success.result,
            usedApi2: true,
            usedFallback: true,
            fallbackSuccess: true,
          });
        })
        .catch((error) => {
          recordError(error);
        });
    };

    const fallbackTimer = setTimeout(() => {
      if (!finished) {
        startFallback();
      }
    }, fallbackDelay);

    createAttempt(false)
      .then((success) => {
        clearTimeout(fallbackTimer);
        finish({
          result: success.result,
          usedApi2: false,
          usedFallback: false,
          fallbackSuccess: false,
        });
      })
      .catch((error) => {
        clearTimeout(fallbackTimer);
        recordError(error);
        startFallback();
      });
  });
};
