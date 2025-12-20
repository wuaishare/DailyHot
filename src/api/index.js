import axios from "@/api/request";

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * 获取热榜分类数据
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
 * @param {object} options 额外选项
 * @returns
 */
export const getHotLists = (type, isNew = false, params, options = {}) => {
  const useApi2 = options?.useApi2;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const apiBase = import.meta.env.VITE_GLOBAL_API;
  const apiBase2 = import.meta.env.VITE_GLOBAL_API2;
  return axios({
    method: "GET",
    url: `/${type}`,
    baseURL: useApi2 ? apiBase2 || apiBase : undefined,
    params: {
      cache: !isNew,
      ...params,
    },
    timeout,
  });
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
  options = {}
) => {
  const hasApi2 = Boolean(import.meta.env.VITE_GLOBAL_API2);
  const preferApi2 = Boolean(options?.useApi2);
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const run = (useApi2) =>
    getHotLists(type, isNew, params, { useApi2, timeout });

  if (preferApi2 || !hasApi2) {
    const result = await run(preferApi2);
    return { result, usedApi2: preferApi2, usedFallback: false };
  }

  const createAttempt = (useApi2) =>
    run(useApi2).then((result) => {
      if (result?.code === 200) {
        return { result, usedApi2, usedFallback: useApi2 };
      }
      const error = new Error(result?.message || "request failed");
      error.result = result;
      error.usedApi2 = useApi2;
      throw error;
    });

  const primaryAttempt = createAttempt(false);
  const fallbackAttempt = createAttempt(true);

  try {
    const success = await Promise.any([primaryAttempt, fallbackAttempt]);
    return {
      result: success.result,
      usedApi2: success.usedApi2,
      usedFallback: success.usedFallback,
      fallbackSuccess: success.usedApi2,
    };
  } catch (error) {
    const errors = error?.errors || [];
    const primaryError = errors.find((item) => item?.usedApi2 === false);
    const fallbackError = errors.find((item) => item?.usedApi2 === true);
    const chosenError = primaryError || fallbackError || {};
    const result =
      chosenError.result || {
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
  }
};
