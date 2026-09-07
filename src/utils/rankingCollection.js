import { getHotListsWithFallback } from "@/api";

const resultCache = new Map();
const pendingRequests = new Map();

const DEFAULT_TTL_MS = 45_000;

const stableValue = (value) => {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .filter((key) => key !== "translate_nonce")
    .sort()
    .reduce((output, key) => {
      output[key] = stableValue(value[key]);
      return output;
    }, {});
};

const buildCacheKey = (source, params = {}, options = {}) =>
  JSON.stringify({
    source,
    params: stableValue(params),
    useApi2: Boolean(options.useApi2),
  });

const isSuccessfulResponse = (response) =>
  response?.result?.code === 200 &&
  Array.isArray(response?.result?.data);

export const clearRankingCollection = (source = "") => {
  if (!source) {
    resultCache.clear();
    pendingRequests.clear();
    return;
  }
  const prefix = `{"source":"${source}"`;
  [...resultCache.keys()]
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => resultCache.delete(key));
  [...pendingRequests.keys()]
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => pendingRequests.delete(key));
};

export const getSharedRanking = async (
  source,
  isNew = false,
  params = {},
  options = {},
) => {
  const cacheKey = buildCacheKey(source, params, options);
  const fresh = Boolean(isNew || options.forceNoCache);
  const now = Date.now();
  const cached = resultCache.get(cacheKey);

  if (!fresh && cached && cached.expiresAt > now) {
    return cached.response;
  }

  const pendingKey = `${cacheKey}::fresh=${fresh ? 1 : 0}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }

  const request = getHotListsWithFallback(source, isNew, params, options)
    .then((response) => {
      if (isSuccessfulResponse(response)) {
        resultCache.set(cacheKey, {
          response,
          expiresAt:
            Date.now() +
            Math.max(
              1_000,
              Number(options.collectionTtlMs) || DEFAULT_TTL_MS,
            ),
        });
      }
      return response;
    })
    .finally(() => {
      pendingRequests.delete(pendingKey);
    });

  pendingRequests.set(pendingKey, request);
  return request;
};

export const getRankingCollectionStats = () => ({
  cached: resultCache.size,
  pending: pendingRequests.size,
});
