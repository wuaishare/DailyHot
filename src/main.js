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

let updateServiceWorker = () => {};
const reloadOnceForServiceWorkerUpdate = () => {
  if (typeof window === "undefined") return;
  const marker = `sw-reload:${__APP_VERSION__.buildNumber}`;
  try {
    if (sessionStorage.getItem("DAILYHOT_SW_RELOAD") === marker) return;
    sessionStorage.setItem("DAILYHOT_SW_RELOAD", marker);
  } catch {
    // Service worker updates should still reload when session storage is blocked.
  }
  window.location.reload();
};

if (typeof navigator !== "undefined" && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    reloadOnceForServiceWorkerUpdate();
  });
}

updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateServiceWorker(true);
    reloadOnceForServiceWorkerUpdate();
  },
  onRegisteredSW(_swUrl, registration) {
    registration?.update();
    if (registration && typeof window !== "undefined") {
      window.setInterval(() => registration.update(), 30 * 60 * 1000);
    }
  },
});

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
