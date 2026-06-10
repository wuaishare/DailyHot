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
      <n-back-top :visibility-height="2" @update:show="backTopChange" />
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
      <SpeedInsights />
    </n-layout>
  </Provider>
</template>

<script setup>
import { mainStore } from "@/store";
import Provider from "@/components/Provider.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import AnalyticsConsent from "@/components/AnalyticsConsent.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { useRouter } from "vue-router";

const store = mainStore();
const router = useRouter();

const headerExpanded = ref(!store.headerCollapsed);
const collapseTimer = ref(null);
const autoRefreshTimer = ref(null);
const autoRefreshPausedByRoute = ref(false);
const isSettingRoute = computed(
  () => router.currentRoute.value?.name === "setting"
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

const clearAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value);
    autoRefreshTimer.value = null;
  }
  if (typeof window !== "undefined") {
    window.$autoRefreshTimer = null;
  }
};

const setupAutoRefresh = () => {
  clearAutoRefresh();
  if (!store.autoRefreshEnabled || store.autoRefreshPaused) {
    if (typeof window !== "undefined") {
      window.$nextAutoRefreshAt = null;
    }
    return;
  }
  const intervalSeconds = Number(store.autoRefreshInterval);
  if (!intervalSeconds || intervalSeconds <= 0) {
    if (typeof window !== "undefined") {
      window.$nextAutoRefreshAt = null;
    }
    return;
  }
  if (typeof window !== "undefined") {
    window.$nextAutoRefreshAt = Date.now() + intervalSeconds * 1000;
    window.$autoRefreshTimer = autoRefreshTimer.value = setInterval(() => {
      router.go(0);
      window.$nextAutoRefreshAt = Date.now() + intervalSeconds * 1000;
    }, intervalSeconds * 1000);
  }
};

// 默认折叠设置变化时同步状态
watch(
  () => store.headerCollapsed,
  (val) => {
    headerExpanded.value = !val;
  }
);

watch(
  () => [store.autoRefreshEnabled, store.autoRefreshInterval, store.autoRefreshPaused],
  () => {
    setupAutoRefresh();
  },
  { immediate: true }
);

watch(
  () => [isSettingRoute.value, store.autoRefreshEnabled],
  () => {
    if (isSettingRoute.value) {
      if (store.autoRefreshEnabled && !store.autoRefreshPaused) {
        store.autoRefreshPaused = true;
        autoRefreshPausedByRoute.value = true;
      }
      return;
    }
    if (autoRefreshPausedByRoute.value) {
      store.autoRefreshPaused = false;
      autoRefreshPausedByRoute.value = false;
    }
  },
  { immediate: true }
);

onMounted(() => {
  store.checkNewsUpdate();
  if (typeof document !== "undefined") {
    document.addEventListener("click", handleOutsideClick);
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
  if (typeof document !== "undefined") {
    document.removeEventListener("click", handleOutsideClick);
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
      z-index: 2;
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
