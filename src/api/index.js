import axios from "@/api/request";

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
  const run = (useApi2) => getHotLists(type, isNew, params, { useApi2 });

  if (preferApi2 || !hasApi2) {
    const result = await run(preferApi2);
    return { result, usedApi2: preferApi2, usedFallback: false };
  }

  let primaryResult = null;
  try {
    primaryResult = await run(false);
    if (primaryResult?.code === 200) {
      return { result: primaryResult, usedApi2: false, usedFallback: false };
    }
  } catch (error) {
    primaryResult = null;
  }

  const fallbackResult = await run(true);
  return {
    result: fallbackResult,
    usedApi2: true,
    usedFallback: true,
    fallbackSuccess: fallbackResult?.code === 200,
  };
};
