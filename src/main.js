import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "@/router";
import { mainStore } from "@/store";

// 全局样式
import "@/style/global.scss";

const CACHE_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

const ensureCacheVersion = () => {
  if (typeof localStorage === "undefined") return;
  const saved = localStorage.getItem("CACHE_VERSION");
  if (saved !== CACHE_VERSION) {
    localStorage.clear();
    localStorage.setItem("CACHE_VERSION", CACHE_VERSION);
  }
};

ensureCacheVersion();

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// 预渲染/SSR 时需要默认榜单数据，避免首屏为空
const store = mainStore();
store.ensureNewsList();

app.use(router);

app.mount("#app");
