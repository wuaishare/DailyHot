import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "@/router";
import { mainStore } from "@/store";
import { ensureCacheVersion } from "@/utils/cache";

// 全局样式
import "@/style/global.scss";

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
