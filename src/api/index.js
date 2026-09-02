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

export const getReadableTranslations = (texts = [], locale = "zh-CN") =>
  axios({
    method: "POST",
    url: "/readable-translate",
    baseURL: import.meta.env.PROD ? "/api" : undefined,
    params: {
      cache: false,
    },
    data: {
      texts,
      locale,
    },
    silent: true,
  });

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
  const useDirectPublicApi = DIRECT_PUBLIC_API_SOURCES.has(type);
  const useSameOriginApi = SAME_ORIGIN_API_SOURCES.has(type);

  if (useDirectPublicApi) {
    try {
      const result = await getHotLists(type, isNew, params, {
        timeout: options?.timeout,
        forceNoCache: Boolean(options?.forceNoCache),
        silent: true,
      });
      return {
        result,
        usedApi2: true,
        usedFallback: false,
        fallbackSuccess: false,
      };
    } catch (primaryError) {
      try {
        const result = await getHotLists(type, isNew, params, {
          timeout: options?.timeout,
          forceNoCache: Boolean(options?.forceNoCache),
          forceSameOrigin: true,
          silent: true,
        });
        return {
          result,
          usedApi2: false,
          usedFallback: true,
          fallbackSuccess: true,
        };
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
    return { result, usedApi2: useApi2, usedFallback: false };
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
      resolve(payload);
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
