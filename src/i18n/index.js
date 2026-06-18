import { createI18n } from "vue-i18n";
import { messages } from "./messages";
import { DEFAULT_LOCALE } from "@/config/site-metadata.mjs";

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});

export default i18n;
