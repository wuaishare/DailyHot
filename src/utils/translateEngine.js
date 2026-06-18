import { getLocaleMeta } from "@/utils/locale";

const TRANSLATE_SCRIPT_ID = "dailyhot-translate-js";

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

    const result = await new Promise((resolve, reject) => {
      translate.js.transObject(
        { items: uniqueTexts },
        targetLanguage,
        resolve,
        reject
      );
    });

    const translatedItems = Array.isArray(result?.items) ? result.items : [];
    const mapped = new Map();
    uniqueTexts.forEach((text, index) => {
      const translated = String(translatedItems[index] || text).trim();
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
