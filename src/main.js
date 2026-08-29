import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "@/router";
import { mainStore } from "@/store";
import i18n from "@/i18n";
import { ensureCacheVersion } from "@/utils/cache";
import { resolveInitialLocale, savePreferredLocale, setDocumentLanguage } from "@/utils/locale";
import { applyDynamicTranslation } from "@/utils/translateEngine";
import { registerSW } from "virtual:pwa-register";

// 全局样式
import "@/style/global.scss";

const registerAppServiceWorker = () => {
  if (typeof navigator === "undefined" || !navigator.serviceWorker) return;
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      registration?.update();
      if (registration && typeof window !== "undefined") {
        window.setInterval(() => registration.update(), 30 * 60 * 1000);
      }
    },
  });
};

(async () => {
  await ensureCacheVersion();

  const app = createApp(App);
  const initialLocale = resolveInitialLocale(
    typeof window !== "undefined" ? window.location.pathname : "/"
  );

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  i18n.global.locale.value = initialLocale;
  setDocumentLanguage(initialLocale);
  savePreferredLocale(initialLocale);
  app.use(i18n);

  // 预渲染/SSR 时需要默认榜单数据，避免首屏为空
  const store = mainStore();
  store.ensureNewsList();

  app.use(router);

  app.mount("#app");
  if (typeof window !== "undefined") {
    document.documentElement.dataset.dailyhotMounted = "1";
    try {
      sessionStorage.removeItem(`dailyhot:boot-retry:${window.location.pathname}`);
    } catch {
      // Boot recovery remains optional when session storage is unavailable.
    }
  }
  registerAppServiceWorker();

  if (typeof window !== "undefined") {
    const runTranslation = () => {
      window.setTimeout(() => {
        applyDynamicTranslation(i18n.global.locale.value);
      }, 400);
    };
    watch(
      () => i18n.global.locale.value,
      () => {
        runTranslation();
      },
      { immediate: true }
    );
    router.afterEach(() => {
      runTranslation();
    });
  }
})();
