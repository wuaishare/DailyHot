import { getLocaleMeta, normalizeLocale } from "@/utils/locale";
import { getReadableTranslations } from "@/api";
import { translatePlainTexts } from "@/utils/translateEngine";

const READABLE_TRANSLATION_LOCALES = new Set(["en", "zh-TW", "ja", "ko"]);
const CLIENT_FIRST_TRANSLATION_LOCALES = new Set(["en", "zh-TW", "ja", "ko"]);

const translationCache = new Map();
const pendingCache = new Map();
const localeRequestPool = new Map();
const cacheKey = (locale, text) => `${locale}::${text}`;
const chunkTitles = (titles = [], size = 5) => {
  const chunks = [];
  for (let index = 0; index < titles.length; index += size) {
    chunks.push(titles.slice(index, index + size));
  }
  return chunks;
};
const toTranslatedMap = (entries = []) =>
  new Map(
    entries.filter(([original, translated]) => translated && translated !== original)
  );
const mergeTranslatedMap = (target, source) => {
  source.forEach((translated, original) => {
    if (!target.has(original)) {
      target.set(original, translated);
    }
  });
};

const getClientTranslatedMap = async (texts = [], locale) => {
  const clientMap = await translatePlainTexts(texts, locale);
  return toTranslatedMap([...clientMap.entries()]);
};

const getBackendTranslatedMap = async (texts = [], locale) => {
  const backendMap = new Map();
  const titleChunks = chunkTitles(texts);

  for (const titleChunk of titleChunks) {
    try {
      const response = await getReadableTranslations(titleChunk, locale);
      const data = Array.isArray(response?.data) ? response.data : [];
      const chunkMap = toTranslatedMap(
        data.map((item) => {
          const translated = String(item.translated || "").trim();
          return [item.original, translated];
        })
      );
      mergeTranslatedMap(backendMap, chunkMap);
    } catch (error) {
      console.warn("readable title backend translation failed", error);
    }
  }

  return backendMap;
};

const enqueueLocaleRequest = (locale, request) =>
  new Promise((resolve, reject) => {
    const pool =
      localeRequestPool.get(locale) || { active: 0, limit: 4, queue: [] };
    localeRequestPool.set(locale, pool);

    const run = () => {
      pool.active += 1;
      Promise.resolve()
        .then(request)
        .then(resolve, reject)
        .finally(() => {
          pool.active -= 1;
          const nextJob = pool.queue.shift();
          if (nextJob) {
            nextJob();
            return;
          }
          if (pool.active === 0) {
            localeRequestPool.delete(locale);
          }
        });
    };

    if (pool.active < pool.limit) {
      run();
      return;
    }

    pool.queue.push(run);
  });

const hasLatinSentence = (text = "") => {
  if (!/[A-Za-z]/.test(text)) return false;
  if (/^[A-Za-z0-9._/-]+$/.test(text)) return false;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return text.length >= 24 || wordCount >= 4;
};

const looksTranslatableSentence = (text = "", locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const value = String(text || "").trim();
  if (!value || normalizedLocale === "zh-CN") return false;

  const hasHan = /[\u3400-\u9fff]/.test(value);
  const hasKana = /[\u3040-\u30ff]/.test(value);
  const hasHangul = /[\uac00-\ud7af]/.test(value);

  if (normalizedLocale === "zh-TW") {
    return hasHan || hasLatinSentence(value);
  }
  if (normalizedLocale === "en") {
    return hasHan || hasKana || hasHangul;
  }
  if (normalizedLocale === "ja") {
    return (hasHan && !hasKana) || hasHangul || hasLatinSentence(value);
  }
  if (normalizedLocale === "ko") {
    return !hasHangul && (hasHan || hasKana || hasLatinSentence(value));
  }

  return hasHan || hasKana || hasHangul || hasLatinSentence(value);
};

export const shouldUseReadableTitleTranslation = (_sourceName, locale) =>
  READABLE_TRANSLATION_LOCALES.has(normalizeLocale(locale));

export const translateReadableTitles = async (titles = [], locale) => {
  const normalizedLocale = normalizeLocale(locale);
  const filtered = Array.from(
    new Set(
      titles
        .map((title) => String(title || "").trim())
        .filter((title) => title && looksTranslatableSentence(title, normalizedLocale))
    )
  );

  if (!filtered.length) return {};

  const ready = {};
  const missing = [];

  filtered.forEach((title) => {
    const key = cacheKey(normalizedLocale, title);
    if (translationCache.has(key)) {
      ready[title] = translationCache.get(key);
      return;
    }
    missing.push(title);
  });

  if (!missing.length) return ready;

  const batchKey = `${normalizedLocale}::${missing.join("\n")}`;
  if (!pendingCache.has(batchKey)) {
    pendingCache.set(
      batchKey,
      (async () => {
        if (!getLocaleMeta(normalizedLocale)?.translateJs) {
          return {
            success: false,
            map: new Map(),
          };
        }

        return await enqueueLocaleRequest(normalizedLocale, async () => {
          const translatedMap = new Map();
          const preferClient = CLIENT_FIRST_TRANSLATION_LOCALES.has(normalizedLocale);

          if (preferClient) {
            const clientMap = await getClientTranslatedMap(missing, normalizedLocale);
            mergeTranslatedMap(translatedMap, clientMap);
          }

          let unresolved = missing.filter((title) => !translatedMap.has(title));
          if (unresolved.length) {
            const backendMap = await getBackendTranslatedMap(unresolved, normalizedLocale);
            mergeTranslatedMap(translatedMap, backendMap);
          }

          unresolved = missing.filter((title) => !translatedMap.has(title));
          if (!preferClient && unresolved.length) {
            const clientMap = await getClientTranslatedMap(unresolved, normalizedLocale);
            mergeTranslatedMap(translatedMap, clientMap);
          }

          return {
            success: translatedMap.size > 0,
            map: translatedMap,
          };
        });
      })().finally(() => {
        pendingCache.delete(batchKey);
      })
    );
  }

  const translated = await pendingCache.get(batchKey);
  missing.forEach((title) => {
    const value = translated.map.get(title) || "";
    if (translated.success && value) {
      translationCache.set(cacheKey(normalizedLocale, title), value);
    }
    if (value) {
      ready[title] = value;
    }
  });

  return ready;
};

export const enhanceReadableResultTitles = async (
  result,
  locale,
  { offset = 0, limit = 20 } = {}
) => {
  const normalizedLocale = normalizeLocale(locale);
  if (!READABLE_TRANSLATION_LOCALES.has(normalizedLocale)) return result;
  if (!Array.isArray(result?.data) || !result.data.length) return result;

  const start = Math.max(0, Number(offset) || 0);
  const end = Math.min(
    result.data.length,
    start + Math.max(1, Number(limit) || result.data.length)
  );
  const scopedItems = result.data.slice(start, end);
  const sourceTexts = scopedItems.flatMap((item) => [
    String(item?.originalTitle || item?.title || "").trim(),
    String(item?.originalDesc || item?.desc || "").trim(),
  ]).filter((text) => looksTranslatableSentence(text, normalizedLocale));

  if (!sourceTexts.length) return result;

  const translatedMap = await translateReadableTitles(sourceTexts, normalizedLocale);
  if (!Object.keys(translatedMap).length) return result;

  let changed = false;
  const nextData = result.data.slice();
  scopedItems.forEach((item, index) => {
    const sourceTitle = String(item?.originalTitle || item?.title || "").trim();
    const sourceDesc = String(item?.originalDesc || item?.desc || "").trim();
    const translatedTitle = String(translatedMap[sourceTitle] || "").trim();
    const translatedDesc = String(translatedMap[sourceDesc] || "").trim();
    const nextItem = {
      ...item,
    };
    let itemChanged = false;

    if (translatedTitle && translatedTitle !== item?.title) {
      nextItem.originalTitle = item?.originalTitle || item?.title || sourceTitle;
      nextItem.title = translatedTitle;
      itemChanged = true;
    }

    if (translatedDesc && translatedDesc !== item?.desc) {
      nextItem.originalDesc = item?.originalDesc || item?.desc || sourceDesc;
      nextItem.desc = translatedDesc;
      itemChanged = true;
    }

    if (!itemChanged) return;
    changed = true;
    nextData[start + index] = nextItem;
  });

  return changed ? { ...result, data: nextData } : result;
};
