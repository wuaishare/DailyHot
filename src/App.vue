<template>
  <Provider>
    <n-layout
      embedded
      :native-scrollbar="false"
      class="app-layout"
      :class="[
        store.headerFixed ? 'fixed' : null,
        store.compactMode ? 'compact' : null,
        headerExpanded ? 'header-expanded' : 'header-collapsed',
      ]"
    >
      <FloatingActions @update:back-top-show="backTopChange" />
      <Header
        :class="[{ expanded: headerExpanded, collapsed: !headerExpanded }]"
        @mouseenter="handleHeaderEnter"
        @mouseleave="handleHeaderLeave"
        @click="handleHeaderClick"
      />
      <main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <transition name="scale" mode="out-in">
              <component :is="Component" :key="router.currentRoute.value.fullPath" />
            </transition>
          </keep-alive>
        </router-view>
      </main>
      <Footer />
      <AnalyticsConsent />
      <SpeedInsights v-if="showSpeedInsights" />
    </n-layout>
  </Provider>
</template>

<script setup>
import { mainStore } from "@/store";
import Provider from "@/components/Provider.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import FloatingActions from "@/components/FloatingActions.vue";
import AnalyticsConsent from "@/components/AnalyticsConsent.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { useRouter } from "vue-router";
import { DATA_REFRESH_EVENT, requestDataRefresh } from "@/utils/dataRefresh";

const store = mainStore();
const router = useRouter();
const showSpeedInsights =
  import.meta.env.PROD &&
  (typeof window === "undefined" ||
    (window.location.hostname !== "127.0.0.1" &&
      window.location.hostname !== "localhost"));

const headerExpanded = ref(!store.headerCollapsed);
const collapseTimer = ref(null);
const autoRefreshTimer = ref(null);
const autoRefreshPausedByRoute = ref(false);
const routePausedRemainingMs = ref(null);
const lastAutoRefreshIntervalMs = ref(Number(store.autoRefreshInterval) * 1000);
let removeAutoRefreshRouteGuard = null;
const AUTO_REFRESH_PAUSE_KEY = "dailyhot:autoRefreshPause";
const settingRouteNames = new Set(["setting", "setting-locale"]);
const autoRefreshRouteNames = new Set([
  "home",
  "home-locale",
  "category",
  "category-locale",
  "list",
  "list-locale",
  "list-legacy",
  "wool-topic",
  "wool-topic-locale",
]);
const isSettingRoute = computed(
  () => {
    const currentRoute = router.currentRoute.value;
    const path = currentRoute?.path || "";
    return (
      settingRouteNames.has(currentRoute?.name) ||
      path === "/setting" ||
      /\/setting$/.test(path)
    );
  }
);
const isAutoRefreshRoute = computed(
  () => {
    const currentRoute = router.currentRoute.value;
    const path = currentRoute?.path || "/";
    return (
      autoRefreshRouteNames.has(currentRoute?.name) ||
      path === "/" ||
      /\/(category|rank|topic)(\/|$)/.test(path)
    );
  }
);

// 回顶按钮显隐
const backTopChange = (val) => {
  if (!store.headerCollapsed) return;
  if (!val) {
    headerExpanded.value = false;
  }
};

const handleHeaderEnter = () => {
  clearTimeout(collapseTimer.value);
  headerExpanded.value = true;
};

const handleHeaderLeave = () => {
  if (!store.headerCollapsed) return;
  clearTimeout(collapseTimer.value);
  collapseTimer.value = setTimeout(() => {
    headerExpanded.value = false;
  }, 200);
};

const handleHeaderClick = () => {
  if (!headerExpanded.value) {
    headerExpanded.value = true;
  }
};

// 点击页眉外区域时折叠
const handleOutsideClick = (e) => {
  if (!store.headerCollapsed) return;
  const path = e.composedPath ? e.composedPath() : [];
  const clickInsideHeader = path.some(
    (el) => el?.classList && el.classList.contains("app-header")
  );
  const clickOverlay = path.some(
    (el) =>
      el?.classList &&
      (el.classList.contains("n-popover") ||
        el.classList.contains("n-dropdown") ||
        el.classList.contains("n-popconfirm"))
  );
  if (!clickInsideHeader && !clickOverlay) {
    headerExpanded.value = false;
  }
};

const getAutoRefreshIntervalMs = () => {
  const seconds = Number(store.autoRefreshInterval);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
};

const normalizeRemainingMs = (value) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const isDocumentHidden = () =>
  typeof document !== "undefined" && document.visibilityState === "hidden";

const readStorageValue = (key) => {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.sessionStorage?.getItem(key) ??
      window.localStorage?.getItem(key) ??
      null
    );
  } catch {
    return null;
  }
};

const writeStorageValue = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    if (value === null || typeof value === "undefined") {
      window.sessionStorage?.removeItem(key);
      window.localStorage?.removeItem(key);
      return;
    }
    window.sessionStorage?.setItem(key, value);
    window.localStorage?.setItem(key, value);
  } catch {
    // Web storage may be blocked in private or restricted browser modes.
  }
};

const readPersistedPauseRemainingMs = () => {
  const rawValue = readStorageValue(AUTO_REFRESH_PAUSE_KEY);
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return normalizeRemainingMs(parsed?.remainingMs);
  } catch {
    return normalizeRemainingMs(rawValue);
  }
};

const writePersistedPauseRemainingMs = (remainingMs) => {
  const normalizedRemainingMs = normalizeRemainingMs(remainingMs);
  if (normalizedRemainingMs === null) {
    writeStorageValue(AUTO_REFRESH_PAUSE_KEY, null);
    return;
  }
  writeStorageValue(
    AUTO_REFRESH_PAUSE_KEY,
    JSON.stringify({
      remainingMs: normalizedRemainingMs,
      savedAt: Date.now(),
    })
  );
};

const writeAutoRefreshRemaining = (remainingMs) => {
  const normalizedRemainingMs = normalizeRemainingMs(remainingMs);
  store.autoRefreshRemainingMs = normalizedRemainingMs;
  if (typeof window !== "undefined") {
    window.$autoRefreshRemainingMs = normalizedRemainingMs;
    window.$nextAutoRefreshAt =
      normalizedRemainingMs === null ? null : Date.now() + normalizedRemainingMs;
  }
};

const clearRoutePauseState = () => {
  autoRefreshPausedByRoute.value = false;
  routePausedRemainingMs.value = null;
  store.autoRefreshRoutePaused = false;
  writeAutoRefreshRemaining(null);
  writePersistedPauseRemainingMs(null);
  if (typeof window !== "undefined") {
    window.$autoRefreshPausedByRoute = false;
  }
};

const clearAutoRefresh = ({ clearTarget = false } = {}) => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    clearTimeout(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
  if (typeof window !== "undefined") {
    window.$autoRefreshTimer = null;
    if (clearTarget) {
      window.$nextAutoRefreshAt = null;
    }
  }
};

const getPausedRemainingMs = () => {
  const candidates = [
    routePausedRemainingMs.value,
    store.autoRefreshRemainingMs,
    typeof window !== "undefined" ? window.$autoRefreshRemainingMs : null,
  ];
  for (const value of candidates) {
    if (value === null || typeof value === "undefined" || value === "") {
      continue;
    }
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }
  return null;
};

const freezeAutoRefreshForRoute = (forcedRemainingMs = null) => {
  clearAutoRefresh();
  if (typeof window === "undefined") return;
  const intervalMs = getAutoRefreshIntervalMs();
  const existingTarget = Number(window.$nextAutoRefreshAt);
  const pausedRemainingMs = getPausedRemainingMs();
  const remainingMs =
    forcedRemainingMs ??
    (autoRefreshPausedByRoute.value || store.autoRefreshRoutePaused
      ? pausedRemainingMs
      : null) ??
    (existingTarget ? Math.max(existingTarget - Date.now(), 0) : intervalMs);
  routePausedRemainingMs.value = remainingMs ?? intervalMs;
  autoRefreshPausedByRoute.value = true;
  store.autoRefreshRoutePaused = true;
  window.$autoRefreshPausedByRoute = true;
  writeAutoRefreshRemaining(routePausedRemainingMs.value);
  writePersistedPauseRemainingMs(routePausedRemainingMs.value);
};

const setupAutoRefresh = (preferredDelayMs = null) => {
  clearAutoRefresh();
  if (typeof window !== "undefined") {
    const intervalMs = getAutoRefreshIntervalMs();
    if (
      !store.autoRefreshEnabled ||
      store.autoRefreshPaused ||
      !isAutoRefreshRoute.value ||
      isDocumentHidden() ||
      intervalMs <= 0
    ) {
      window.$nextAutoRefreshAt = null;
      return;
    }
    let remainingMs =
      normalizeRemainingMs(preferredDelayMs) ??
      normalizeRemainingMs(store.autoRefreshRemainingMs) ??
      normalizeRemainingMs(window.$autoRefreshRemainingMs) ??
      readPersistedPauseRemainingMs() ??
      intervalMs;
    store.autoRefreshRoutePaused = false;
    window.$autoRefreshPausedByRoute = false;
    writeAutoRefreshRemaining(remainingMs);
    writePersistedPauseRemainingMs(null);

    let lastTickAt = Date.now();
    window.$autoRefreshTimer = autoRefreshTimer.value = setInterval(() => {
      const now = Date.now();
      remainingMs = Math.max(remainingMs - (now - lastTickAt), 0);
      lastTickAt = now;
      writeAutoRefreshRemaining(remainingMs);

      if (remainingMs <= 0) {
        requestDataRefresh({ reason: "auto", force: false });
        remainingMs = intervalMs;
        lastTickAt = Date.now();
        writeAutoRefreshRemaining(remainingMs);
      }
    }, 1000);
  }
};

const reconcileAutoRefresh = () => {
  const intervalMs = getAutoRefreshIntervalMs();
  const intervalChanged = intervalMs !== lastAutoRefreshIntervalMs.value;

  if (!store.autoRefreshEnabled || intervalMs <= 0) {
    clearAutoRefresh({ clearTarget: true });
    clearRoutePauseState();
    lastAutoRefreshIntervalMs.value = intervalMs;
    return;
  }

  if (store.autoRefreshPaused) {
    clearAutoRefresh({ clearTarget: true });
    clearRoutePauseState();
    lastAutoRefreshIntervalMs.value = intervalMs;
    return;
  }

  if (isSettingRoute.value) {
    freezeAutoRefreshForRoute(intervalChanged ? intervalMs : null);
    lastAutoRefreshIntervalMs.value = intervalMs;
    return;
  }

  const pausedRemainingMs =
    getPausedRemainingMs() ?? readPersistedPauseRemainingMs();
  const hasRoutePause =
    autoRefreshPausedByRoute.value ||
    store.autoRefreshRoutePaused ||
    pausedRemainingMs !== null;
  const resumedDelayMs = hasRoutePause
    ? pausedRemainingMs ?? intervalMs
    : null;
  clearRoutePauseState();
  setupAutoRefresh(intervalChanged ? intervalMs : resumedDelayMs);
  lastAutoRefreshIntervalMs.value = intervalMs;
};

const reconcileAutoRefreshAfterVisibilityChange = () => {
  if (isDocumentHidden()) {
    if (store.autoRefreshEnabled && !store.autoRefreshPaused && isAutoRefreshRoute.value) {
      freezeAutoRefreshForRoute();
    }
    return;
  }
  nextTick(reconcileAutoRefresh);
};

const handleFreezeAutoRefreshRoute = () => {
  if (store.autoRefreshEnabled && !store.autoRefreshPaused) {
    freezeAutoRefreshForRoute();
  }
};

// 默认折叠设置变化时同步状态
watch(
  () => store.headerCollapsed,
  (val) => {
    headerExpanded.value = !val;
  }
);

const handleDataRefreshRequest = (event) => {
  if (event?.detail?.reason !== "manual") return;
  const intervalMs = getAutoRefreshIntervalMs();
  if (
    store.autoRefreshEnabled &&
    !store.autoRefreshPaused &&
    isAutoRefreshRoute.value &&
    !isDocumentHidden() &&
    intervalMs > 0
  ) {
    setupAutoRefresh(intervalMs);
  }
};

watch(
  () => [
    store.autoRefreshEnabled,
    store.autoRefreshInterval,
    store.autoRefreshPaused,
    router.currentRoute.value?.name,
    router.currentRoute.value?.fullPath,
  ],
  reconcileAutoRefresh,
  { immediate: true }
);

onMounted(() => {
  removeAutoRefreshRouteGuard = router.afterEach(() => {
    nextTick(reconcileAutoRefresh);
  });
  reconcileAutoRefresh();
  store.checkNewsUpdate();
  if (typeof document !== "undefined") {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener(
      "visibilitychange",
      reconcileAutoRefreshAfterVisibilityChange
    );
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pageshow", reconcileAutoRefreshAfterVisibilityChange);
    window.addEventListener("popstate", reconcileAutoRefreshAfterVisibilityChange);
    window.addEventListener(DATA_REFRESH_EVENT, handleDataRefreshRequest);
    window.addEventListener(
      "dailyhot:freeze-auto-refresh-route",
      handleFreezeAutoRefreshRoute
    );
  }
  nextTick(() => {
    if (store.newsArr.length === 0) {
      store.newsArr = store.defaultNewsArr;
    }
    if (typeof document !== "undefined") {
      document.dispatchEvent(new Event("prerender-ready"));
    }
  });
});

onBeforeUnmount(() => {
  clearTimeout(collapseTimer.value);
  if (removeAutoRefreshRouteGuard) {
    removeAutoRefreshRouteGuard();
    removeAutoRefreshRouteGuard = null;
  }
  if (typeof document !== "undefined") {
    document.removeEventListener("click", handleOutsideClick);
    document.removeEventListener(
      "visibilitychange",
      reconcileAutoRefreshAfterVisibilityChange
    );
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("pageshow", reconcileAutoRefreshAfterVisibilityChange);
    window.removeEventListener("popstate", reconcileAutoRefreshAfterVisibilityChange);
    window.removeEventListener(DATA_REFRESH_EVENT, handleDataRefreshRequest);
    window.removeEventListener(
      "dailyhot:freeze-auto-refresh-route",
      handleFreezeAutoRefreshRoute
    );
  }
  clearAutoRefresh();
});
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100%;
  position: relative;

  &.fixed {
    :deep(.app-header) {
      width: 100%;
      margin: 0;
      position: absolute;
      z-index: 1200;
      top: 0;
      left: 0;
      box-sizing: border-box;
    }

    &.header-expanded {
      main {
        padding: 116px 5vw 0 5vw;
      }
    }

    &.header-collapsed {
      main {
        padding: 72px 5vw 0 5vw;
      }
    }
  }

  :deep(.n-scrollbar-rail) {
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 3;
  }

  main {
    padding: 24px 5vw 0;
    max-width: 1800px;
    margin: 0 auto;
    min-height: calc(100vh - 238px);
    transition: padding 0.25s ease;
  }
}

.app-layout.compact {
  &.fixed {
    &.header-expanded {
      main {
        padding: 98px 3vw 0 3vw;
      }
    }

    &.header-collapsed {
      main {
        padding: 56px 3vw 0 3vw;
      }
    }
  }

  main {
    padding: 14px 3vw 0;
    max-width: 1900px;
  }

  // 列表与卡片内容收紧
  :deep(.list .type) {
    margin-bottom: 8px;
  }

  :deep(.list .card) {
    margin-top: 12px;
    border-radius: 6px;
  }

  :deep(.list .card .n-card__content) {
    padding: 12px 16px;
  }

  :deep(.list .card .header) {
    height: 52px;
    grid-template-columns: 1fr 1.2fr 1fr;
  }

  :deep(.list .card .name .title) {
    font-size: 18px;
  }

  :deep(.list .card .name .subtitle) {
    font-size: 12px;
  }

  :deep(.list .card .all .n-list-item) {
    padding: 12px 12px;
  }

  :deep(.list .card .all .message) {
    margin-top: 8px;
  }

  :deep(.list .card .all .pagination) {
    margin: 12px 0;
  }

  // 页脚紧凑化
  :deep(footer) {
    padding: 0 3vw;
    margin-top: 12px;
    height: 80px;
  }

  // 设置页网格间距收紧
  :deep(.mews-group) {
    gap: 14px;
  }
}

// 路由跳转动画
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
