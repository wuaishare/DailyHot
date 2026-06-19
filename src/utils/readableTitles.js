import { getLocaleMeta, normalizeLocale } from "@/utils/locale";
import { getReadableTranslations } from "@/api";
import { translatePlainTexts } from "@/utils/translateEngine";

const READABLE_TRANSLATION_LOCALES = new Set(["en", "zh-TW", "ja", "ko"]);

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

        try {
          return await enqueueLocaleRequest(normalizedLocale, async () => {
            const backendMap = new Map();
            const titleChunks = chunkTitles(missing);

            for (const titleChunk of titleChunks) {
              const response = await getReadableTranslations(titleChunk, normalizedLocale);
              const data = Array.isArray(response?.data) ? response.data : [];
              const chunkMap = toTranslatedMap(
                data.map((item) => {
                  const translated = String(item.translated || "").trim();
                  return [item.original, translated];
                })
              );
              chunkMap.forEach((translated, original) => {
                backendMap.set(original, translated);
              });
            }

            const unresolved = missing.filter((title) => !backendMap.has(title));
            if (unresolved.length) {
              const clientMap = await translatePlainTexts(unresolved, normalizedLocale);
              const usableClientMap = toTranslatedMap([...clientMap.entries()]);
              usableClientMap.forEach((translated, original) => {
                backendMap.set(original, translated);
              });
            }

            return {
              success: backendMap.size > 0,
              map: backendMap,
            };
          });
        } catch (error) {
          console.warn("readable title translation failed", error);
          const clientMap = await translatePlainTexts(missing, normalizedLocale);
          const usableClientMap = toTranslatedMap([...clientMap.entries()]);
          return {
            success: usableClientMap.size > 0,
            map: usableClientMap,
          };
        }
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
  const sourceTitles = scopedItems
    .map((item) => String(item?.originalTitle || item?.title || "").trim())
    .filter((title) => looksTranslatableSentence(title, normalizedLocale));

  if (!sourceTitles.length) return result;

  const translatedMap = await translateReadableTitles(sourceTitles, normalizedLocale);
  if (!Object.keys(translatedMap).length) return result;

  let changed = false;
  const nextData = result.data.slice();
  scopedItems.forEach((item, index) => {
    const sourceTitle = String(item?.originalTitle || item?.title || "").trim();
    const translatedTitle = String(translatedMap[sourceTitle] || "").trim();
    if (!translatedTitle || translatedTitle === item?.title) return;
    changed = true;
    nextData[start + index] = {
      ...item,
      originalTitle: item?.originalTitle || item?.title || sourceTitle,
      title: translatedTitle,
    };
  });

  return changed ? { ...result, data: nextData } : result;
};
