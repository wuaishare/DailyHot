import { getLocaleMeta, normalizeLocale } from "@/utils/locale";
import { getReadableTranslations } from "@/api";
import {
  protectTranslationTerms,
  translatePlainTexts,
} from "@/utils/translateEngine";

const READABLE_TRANSLATION_LOCALES = new Set(["zh-CN", "en", "zh-TW", "ja", "ko"]);
const CLIENT_FIRST_TRANSLATION_LOCALES = new Set(["zh-CN"]);
const ALLOW_CLIENT_READABLE_TRANSLATION = !import.meta.env.PROD;
const ENTITY_TITLE_SOURCE_NAMES = new Set([
  "openrouter-rankings",
  "artificialanalysis",
  "arena-ai",
  "lmarena",
  "designarena",
  "aicpb-rankings",
  "llm-stats",
  "skills-rank",
  "clawhub",
  "clawhub-skills",
  "clawhub-plugins",
  "hf-models",
  "producthunt-ai",
  "sse",
  "szse",
  "hkex",
  "nasdaq",
  "nyse",
  "twse",
  "nse",
  "asx",
  "global-indexes",
]);
const SOURCE_TEXT_NORMALIZER_NAMES = new Set(["anthropic-news"]);

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
const MODEL_NAME_MARKER_PATTERN =
  /\b(?:GPT|ChatGPT|Claude|Sonnet|Opus|Haiku|Fable|Mythos|Gemini|Gemma|DiffusionGemma|GLM|Llama|Grok|Qwen|DeepSeek|Mistral|Mixtral|Kimi|ERNIE|Hunyuan|Doubao|Phi|Command|Aya|DALL[·-]E|Sora)\b/i;
const SENTENCE_SIGNAL_PATTERN =
  /\b(?:a|an|the|to|for|with|without|in|on|from|by|and|or|how|why|what|new|updated|introducing|launching|using|improving|securing|unlocking|building|expanding|investing|powering|measuring|statement|research|program|community|grant|family|future|analytics|controls|safety|agents?|generation|translation|voice|natural|faster|multimodal|encoder|robotics|learning|impact)\b/i;
const ANTHROPIC_LABEL_PATTERN =
  "(?:Announcements|Announcement|Product|Research|Company|Policy|News|Engineering|Events|Event)";
const MONTH_NAME_PATTERN =
  "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*";
const ANTHROPIC_DATE_PATTERN = `${MONTH_NAME_PATTERN}\\s+\\d{1,2},\\s+\\d{4}`;
const ANTHROPIC_SUMMARY_START_PATTERN =
  /\b(?:We(?:'|’)re|We are|We|The full text|The US government|An upgrade|A national|Our|This|Anthropic opens|Anthropic announces|Learn|Read|Today)\b/;

const normalizeWhitespace = (value = "") =>
  String(value || "").replace(/\s+/g, " ").trim();

const normalizeAnthropicText = (value = "") =>
  normalizeWhitespace(
    String(value || "")
      .replace(new RegExp(`^(${ANTHROPIC_LABEL_PATTERN})(?=${MONTH_NAME_PATTERN})`, "i"), "$1 ")
      .replace(new RegExp(`^(${ANTHROPIC_LABEL_PATTERN})(?=[A-Z])`), "$1 ")
      .replace(new RegExp(`(${ANTHROPIC_DATE_PATTERN})(?=[A-Z])`, "gi"), "$1 ")
      .replace(/([a-z0-9)])(?=(?:We(?:'|’)re|The full text|An upgrade|Anthropic opens|Chris Olah)\b)/g, "$1 ")
      .replace(/([.!?])(?=[A-Z])/g, "$1 ")
  );

const stripAnthropicMetaPrefix = (value = "") =>
  normalizeWhitespace(
    normalizeAnthropicText(value)
      .replace(new RegExp(`^${ANTHROPIC_LABEL_PATTERN}(?:\\b|(?=[A-Z]))\\s*`), "")
      .replace(new RegExp(`^${ANTHROPIC_DATE_PATTERN}\\s*`, "i"), "")
  );

const splitAnthropicTitleAndDesc = (value = "") => {
  const body = stripAnthropicMetaPrefix(value);
  if (!body) return { title: "", desc: "" };
  const summaryMatch = body.match(ANTHROPIC_SUMMARY_START_PATTERN);
  if (!summaryMatch || summaryMatch.index <= 0) {
    return { title: body, desc: "" };
  }
  const title = normalizeWhitespace(body.slice(0, summaryMatch.index));
  const desc = normalizeWhitespace(body.slice(summaryMatch.index));
  return { title: title || body, desc };
};

const normalizeAnthropicItem = (item = {}) => {
  const rawTitle = normalizeWhitespace(item.originalTitle || item.title);
  const rawDesc = normalizeWhitespace(item.originalDesc || item.desc);
  const titleCandidate =
    rawTitle && !new RegExp(`^${ANTHROPIC_DATE_PATTERN}$`, "i").test(rawTitle)
      ? rawTitle
      : rawDesc;
  const parsedTitle = splitAnthropicTitleAndDesc(titleCandidate);
  const parsedDesc = splitAnthropicTitleAndDesc(rawDesc);
  const nextTitle = parsedTitle.title || parsedDesc.title || rawTitle;
  const nextDesc = parsedTitle.desc || parsedDesc.desc || parsedDesc.title || rawDesc;
  if (!nextTitle && !nextDesc) return item;

  const normalizedTitle = normalizeWhitespace(nextTitle);
  const normalizedDesc = normalizeWhitespace(nextDesc);
  const dedupedDesc = normalizedDesc && normalizedDesc !== normalizedTitle ? normalizedDesc : "";
  if (
    normalizedTitle === rawTitle &&
    dedupedDesc === rawDesc &&
    item.originalTitle &&
    item.originalDesc
  ) {
    return item;
  }

  return {
    ...item,
    originalTitle: normalizedTitle || rawTitle,
    originalDesc: dedupedDesc,
    title: normalizedTitle || item.title,
    desc: dedupedDesc,
  };
};

export const normalizeReadableSourceResult = (result, sourceName = "") => {
  if (!SOURCE_TEXT_NORMALIZER_NAMES.has(sourceName)) return result;
  if (!Array.isArray(result?.data) || !result.data.length) return result;
  let changed = false;
  const data = result.data.map((item) => {
    const nextItem = normalizeAnthropicItem(item);
    if (nextItem !== item) changed = true;
    return nextItem;
  });
  return changed ? { ...result, data } : result;
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
      const protectedItems = titleChunk.map((text) => protectTranslationTerms(text));
      const response = await getReadableTranslations(
        protectedItems.map((item) => item.protectedText),
        locale
      );
      const data = Array.isArray(response?.data) ? response.data : [];
      const chunkMap = toTranslatedMap(
        data.map((item, index) => {
          const original = titleChunk[index] || item.original;
          const protectedItem =
            protectedItems[index] || protectTranslationTerms(original);
          const translated = protectedItem
            .restore(String(item.translated || "").trim())
            .trim();
          return [original, translated];
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
  if (MODEL_NAME_MARKER_PATTERN.test(text) && !SENTENCE_SIGNAL_PATTERN.test(text)) {
    return false;
  }
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return text.length >= 18 || wordCount >= 2;
};

const looksTranslatableSentence = (text = "", locale = "zh-CN") => {
  const normalizedLocale = normalizeLocale(locale);
  const value = String(text || "").trim();
  if (!value) return false;

  const hasHan = /[\u3400-\u9fff]/.test(value);
  const hasKana = /[\u3040-\u30ff]/.test(value);
  const hasHangul = /[\uac00-\ud7af]/.test(value);

  if (normalizedLocale === "zh-CN") {
    return !hasHan && (hasKana || hasHangul || hasLatinSentence(value));
  }
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

const isEntityTitleSource = (sourceName, subtype) =>
  ENTITY_TITLE_SOURCE_NAMES.has(sourceName) ||
  (sourceName === "xueqiu" && ["stocks", "funds"].includes(String(subtype || "")));

export const shouldUseReadableTitleTranslation = (sourceName, locale, subtype) => {
  const normalizedLocale = normalizeLocale(locale);
  if (!READABLE_TRANSLATION_LOCALES.has(normalizedLocale)) return false;
  return !isEntityTitleSource(sourceName, subtype);
};

export const shouldProtectEntityTitleTranslation = (sourceName, subtype) =>
  isEntityTitleSource(sourceName, subtype);

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
          const preferClient =
            ALLOW_CLIENT_READABLE_TRANSLATION &&
            CLIENT_FIRST_TRANSLATION_LOCALES.has(normalizedLocale);

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
          if (
            ALLOW_CLIENT_READABLE_TRANSLATION &&
            !preferClient &&
            unresolved.length
          ) {
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
  { includeDescriptions = true, offset = 0, limit = 20, sourceName = "" } = {}
) => {
  const normalizedLocale = normalizeLocale(locale);
  if (!shouldUseReadableTitleTranslation(sourceName, normalizedLocale)) return result;
  const normalizedResult = normalizeReadableSourceResult(result, sourceName);
  if (!Array.isArray(normalizedResult?.data) || !normalizedResult.data.length) {
    return normalizedResult;
  }

  const start = Math.max(0, Number(offset) || 0);
  const end = Math.min(
    normalizedResult.data.length,
    start + Math.max(1, Number(limit) || normalizedResult.data.length)
  );
  const scopedItems = normalizedResult.data.slice(start, end);
  const sourceTexts = scopedItems.flatMap((item) => {
    const texts = [String(item?.originalTitle || item?.title || "").trim()];
    if (includeDescriptions) {
      texts.push(String(item?.originalDesc || item?.desc || "").trim());
    }
    return texts;
  }).filter((text) => looksTranslatableSentence(text, normalizedLocale));

  if (!sourceTexts.length) return normalizedResult;

  const translatedMap = await translateReadableTitles(sourceTexts, normalizedLocale);
  if (!Object.keys(translatedMap).length) return normalizedResult;

  let changed = false;
  const nextData = normalizedResult.data.slice();
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

  return changed ? { ...normalizedResult, data: nextData } : normalizedResult;
};
