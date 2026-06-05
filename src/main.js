import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "@/router";
import { mainStore } from "@/store";
import { ensureCacheVersion } from "@/utils/cache";
import { registerSW } from "virtual:pwa-register";

// 全局样式
import "@/style/global.scss";

let updateServiceWorker = () => {};
updateServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateServiceWorker(true);
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

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);

  // 预渲染/SSR 时需要默认榜单数据，避免首屏为空
  const store = mainStore();
  store.ensureNewsList();

  app.use(router);

  app.mount("#app");
})();
