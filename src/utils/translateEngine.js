import { getLocaleMeta, normalizeLocale } from "@/utils/locale";

const TRANSLATE_SCRIPT_ID = "dailyhot-translate-js";
const TRANSLATE_REQUEST_TIMEOUT_MS = 8000;
const GOOGLE_TRANSLATE_TIMEOUT_MS = 6000;
const CLIENT_TRANSLATE_CONCURRENCY = 4;
const GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE = {
  "zh-CN": "zh-CN",
  en: "en",
  "zh-TW": "zh-TW",
  ja: "ja",
  ko: "ko",
};
const PROTECTED_TERM_PATTERN =
  /\b(?:GPT(?:-\d+(?:\.\d+)*)?|ChatGPT|Claude|Sonnet|Opus|Haiku|Fable|Mythos|Gemini|Gemma|DiffusionGemma|GLM|Llama|Grok|Qwen|DeepSeek|Mistral|Mixtral|Kimi|ERNIE|Hunyuan|Doubao|Yi|Phi|Command|Aya|Cohere|Anthropic|OpenAI|DeepMind|Hugging Face|OpenRouter|xAI|DALL[·-]E|Sora|Codex|Copilot|JDK)(?:\s+\d+(?:\.\d+)*)?|\b(?:AI|AGI|API|MCP|LLM)\b/g;

let translateLoadPromise = null;

const getTranslate = () =>
  typeof window !== "undefined" ? window.translate : null;

const configureTranslate = (translate) => {
  translate.service.use("client.edge");
  translate.selectLanguageTag.show = false;
  translate.selectLanguageTag.languages =
    "chinese_simplified,english,chinese_traditional,japanese,korean";
  translate.ignore.class = Array.from(
    new Set([
      ...(translate.ignore.class || []),
      "language-switcher",
      "flag-icon",
      "locale-option",
      "no-auto-translate",
      "n-icon",
      "n-avatar",
    ]),
  );
};

const buildFallbackTranslationMap = (texts = []) =>
  new Map(texts.map((text) => [text, text]));

const parseGoogleTranslateResponse = (payload) => {
  const segments = Array.isArray(payload?.[0]) ? payload[0] : [];
  return segments
    .map((segment) => String(segment?.[0] || ""))
    .join("")
    .trim();
};

const protectTranslationTerms = (text = "") => {
  const terms = [];
  const protectedText = String(text || "").replace(PROTECTED_TERM_PATTERN, (term) => {
    const token = `DHTERM${terms.length}X`;
    terms.push([token, term]);
    return token;
  });
  const restore = (value = "") =>
    terms.reduce(
      (nextValue, [token, term]) => nextValue.replaceAll(token, term),
      String(value || "")
    );
  return { protectedText, restore };
};

const fetchGoogleTranslation = async (text, locale) => {
  if (typeof fetch !== "function") return "";
  const targetLanguage =
    GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE[normalizeLocale(locale)];
  if (!targetLanguage) return "";
  const { protectedText, restore } = protectTranslationTerms(text);

  const controller =
    typeof AbortController === "undefined" ? null : new AbortController();
  const timeout = controller
    ? window.setTimeout(() => controller.abort(), GOOGLE_TRANSLATE_TIMEOUT_MS)
    : null;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", protectedText);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller?.signal,
    });
    if (!response.ok) return "";
    return restore(parseGoogleTranslateResponse(await response.json()));
  } catch {
    return "";
  } finally {
    if (timeout) window.clearTimeout(timeout);
  }
};

const translatePlainTextsWithGoogle = async (texts = [], locale) => {
  const mapped = buildFallbackTranslationMap(texts);
  let cursor = 0;

  const runWorker = async () => {
    while (cursor < texts.length) {
      const index = cursor;
      cursor += 1;
      const original = texts[index];
      const translated = await fetchGoogleTranslation(original, locale);
      if (translated && translated !== original) {
        mapped.set(original, translated);
      }
    }
  };

  const workerCount = Math.min(CLIENT_TRANSLATE_CONCURRENCY, texts.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return mapped;
};

export const ensureTranslateJs = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (getTranslate()) return Promise.resolve(getTranslate());
  if (translateLoadPromise) return translateLoadPromise;

  translateLoadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TRANSLATE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(getTranslate()), {
        once: true,
      });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TRANSLATE_SCRIPT_ID;
    script.src = "/vendor/translate.js";
    script.async = true;
    script.onload = () => resolve(getTranslate());
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return translateLoadPromise;
};

export const translatePlainTexts = async (texts = [], locale) => {
  if (typeof window === "undefined") return buildFallbackTranslationMap(texts);
  const uniqueTexts = Array.from(
    new Set(
      texts
        .map((text) => String(text || "").trim())
        .filter(Boolean)
    )
  );
  if (!uniqueTexts.length) {
    return new Map();
  }

  const googleMap = await translatePlainTextsWithGoogle(uniqueTexts, locale);
  if (
    [...googleMap.entries()].some(
      ([original, translated]) => translated !== original
    )
  ) {
    return googleMap;
  }

  const targetLanguage = getLocaleMeta(locale)?.translateJs;
  if (!targetLanguage) {
    return buildFallbackTranslationMap(uniqueTexts);
  }

  try {
    const translate = await ensureTranslateJs();
    if (!translate?.js?.transObject) {
      return buildFallbackTranslationMap(uniqueTexts);
    }

    configureTranslate(translate);

    const protectedItems = uniqueTexts.map((text) => protectTranslationTerms(text));
    const result = await new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error("translate.js request timed out"));
      }, TRANSLATE_REQUEST_TIMEOUT_MS);
      const finish = (callback) => (value) => {
        window.clearTimeout(timer);
        callback(value);
      };
      translate.js.transObject(
        { items: protectedItems.map((item) => item.protectedText) },
        targetLanguage,
        finish(resolve),
        finish(reject)
      );
    });

    const translatedItems = Array.isArray(result?.items) ? result.items : [];
    const mapped = new Map();
    uniqueTexts.forEach((text, index) => {
      const translated = protectedItems[index]
        .restore(String(translatedItems[index] || protectedItems[index].protectedText))
        .trim();
      mapped.set(text, translated || text);
    });
    return mapped;
  } catch {
    return buildFallbackTranslationMap(uniqueTexts);
  }
};

export const applyDynamicTranslation = async (locale) => {
  if (typeof window === "undefined") return;
  const targetLanguage = getLocaleMeta(locale)?.translateJs || "chinese_simplified";
  const existingTranslate = getTranslate();

  if (targetLanguage === "chinese_simplified") {
    if (!existingTranslate) return;
    configureTranslate(existingTranslate);
    const main = document.querySelector("main");
    if (main) {
      existingTranslate.setDocuments([main]);
    }
    existingTranslate.listener.reset?.();
    existingTranslate.language.setLocal("chinese_simplified");
    existingTranslate.changeLanguage("chinese_simplified");
    return;
  }

  const translate = await ensureTranslateJs();
  if (!translate) return;

  configureTranslate(translate);
  translate.language.setLocal("chinese_simplified");
  const main = document.querySelector("main");
  if (main) {
    translate.setDocuments([main]);
  }
  translate.listener.start();

  if (translate.executeNumber > 0) {
    translate.changeLanguage(targetLanguage);
    return;
  }

  translate.language.setDefaultTo(targetLanguage);
  translate.execute();
};
