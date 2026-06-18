import { getLocaleMeta, normalizeLocale } from "@/utils/locale";
import { getReadableTranslations } from "@/api";

const READABLE_TRANSLATION_LOCALES = new Set(["zh-CN", "zh-TW"]);

const READABLE_TRANSLATION_SOURCES = new Set([
  "openai-news",
  "openai-research",
  "anthropic-news",
  "deepmind-blog",
  "meta-ai-blog",
  "huggingface-blog",
  "mistral-news",
  "cohere-blog",
  "hf-papers",
  "paperswithcode",
  "producthunt-ai",
  "hackernews-ai",
  "sina-ai",
  "perplexity-blog",
  "xai-news",
  "reddit-localllama",
  "reddit-machinelearning",
  "reddit-artificial",
]);

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

const looksTranslatableSentence = (text = "") => {
  if (!/[A-Za-z]/.test(text)) return false;
  if (/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(text)) return false;
  if (/^[A-Za-z0-9._/-]+$/.test(text)) return false;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return text.length >= 24 || wordCount >= 4;
};

export const shouldUseReadableTitleTranslation = (sourceName, locale) =>
  READABLE_TRANSLATION_LOCALES.has(normalizeLocale(locale)) &&
  READABLE_TRANSLATION_SOURCES.has(sourceName);

export const translateReadableTitles = async (titles = [], locale) => {
  const normalizedLocale = normalizeLocale(locale);
  const filtered = Array.from(
    new Set(
      titles
        .map((title) => String(title || "").trim())
        .filter((title) => title && looksTranslatableSentence(title))
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

            return {
              success: backendMap.size > 0,
              map: backendMap,
            };
          });
        } catch (error) {
          console.warn("readable title translation failed", error);
          return {
            success: false,
            map: new Map(),
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
