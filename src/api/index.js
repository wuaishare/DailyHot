import axios from "@/api/request";

/**
 * 获取热榜分类数据
 * @param {string} type 热榜分类名称
 * @param {boolean} isNew 是否拉取最新数据
 * @param {object} params 请求参数
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
