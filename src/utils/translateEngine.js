import { getLocaleMeta } from "@/utils/locale";

const TRANSLATE_SCRIPT_ID = "dailyhot-translate-js";

let translateLoadPromise = null;

const getTranslate = () =>
  typeof window !== "undefined" ? window.translate : null;

const configureTranslate = (translate) => {
  translate.service.use("client.edge");
  translate.listener.start();
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

export const applyDynamicTranslation = async (locale) => {
  if (typeof window === "undefined") return;
  const translate = await ensureTranslateJs();
  if (!translate) return;

  configureTranslate(translate);
  translate.language.setLocal("chinese_simplified");
  const targetLanguage = getLocaleMeta(locale)?.translateJs || "chinese_simplified";
  const main = document.querySelector("main");
  if (main) {
    translate.setDocuments([main]);
  }

  if (targetLanguage === "chinese_simplified") {
    translate.changeLanguage("chinese_simplified");
    return;
  }

  if (translate.executeNumber > 0) {
    translate.changeLanguage(targetLanguage);
    return;
  }

  translate.language.setDefaultTo(targetLanguage);
  translate.execute();
};
