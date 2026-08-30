<template>
  <n-card
    :bordered="false"
    class="app-header"
    :class="{ 'tablet-compact': isTabletScreen }"
    content-style="padding: 0"
  >
    <section>
      <div class="logo" @click="router.push(buildHomePath(locale))">
        <img :src="siteLogoUrl" alt="logo" />
        <div class="name">
          <n-text>{{ t("common.siteName") }}</n-text>
          <n-text :depth="3">{{ t("common.siteTagline") }}</n-text>
        </div>
      </div>
      <div v-if="!store.categoryEnabled">
        <div class="current-time" v-if="store.timeData">
          <n-text class="time">{{ store.timeData.time.text }}</n-text>
          <n-text class="date" :depth="3">
            {{ currentDateText }}
          </n-text>
        </div>
        <div class="current-time" v-else>
          <n-text class="time">{{ t("common.loadingTime") }}</n-text>
        </div>
      </div>
      <div v-else class="category-select">
        <div v-if="isSettingPage" class="category-back">
          <div class="category-hit-area" @click="goHome">
            <n-button size="small" type="primary" strong @click.stop="goHome">
              {{ t("common.backHome") }}
            </n-button>
          </div>
        </div>
        <div v-else-if="!isSmallScreen" class="category-nav">
          <n-space align="center" justify="center" wrap>
            <div
              v-for="cat in categoryNavOptions"
              :key="cat.value"
              class="category-hit-area"
              @click="selectCategory(cat.value)"
            >
              <n-button
                size="small"
                text
                strong
                :type="cat.value === activeCategoryLocal ? 'primary' : 'default'"
                class="cat-btn"
                @click.stop="selectCategory(cat.value)"
              >
                {{ cat.label }}
              </n-button>
            </div>
          </n-space>
        </div>
        <n-select
          v-else
          v-model:value="activeCategoryLocal"
          :options="categoryOptions"
          size="large"
          :placeholder="t('common.selectCategory')"
        />
      </div>
      <div class="controls">
        <n-space justify="end">
          <n-dropdown
            trigger="click"
            :options="languageOptions"
            @select="switchLocale"
          >
            <div class="control-hit-area">
              <n-button class="header-control-btn" secondary strong round>
                <template #icon>
                  <img
                    class="locale-trigger-flag"
                    :src="currentLocaleMeta.flag"
                    :alt="currentLocaleMeta.label"
                    :style="localeFlagStyle"
                  />
                </template>
                <span v-if="!isSmallScreen">{{ currentLocaleMeta.shortLabel }}</span>
              </n-button>
            </div>
          </n-dropdown>
          <n-popover
            v-if="showRefresh"
            trigger="hover"
            placement="bottom"
            :show-arrow="false"
            style="max-width: 320px"
          >
            <template #trigger>
              <div class="control-hit-area">
                <n-button
                  class="header-control-btn"
                  secondary
                  strong
                  round
                  :aria-label="refreshButtonLabel"
                  :title="refreshButtonLabel"
                >
                  <template #icon>
                    <n-icon :component="Refresh" />
                  </template>
                  <span v-if="countdownText && !isSmallScreen" class="countdown">{{ countdownText }}</span>
                </n-button>
              </div>
            </template>
            <div class="refresh-panel" @click.stop>
              <div class="panel-header">
                <n-text>{{ t("header.refreshControl") }}</n-text>
                <n-text depth="3" v-if="countdownText">{{ t("header.nextRefresh") }}: {{ countdownText }}</n-text>
              </div>
              <n-button
                block
                type="primary"
                dashed
                :disabled="!canManualRefresh"
                @click="manualRefresh"
              >
                <template #icon>
                  <n-icon :component="Refresh" />
                </template>
                {{ t("header.refreshNow") }}
              </n-button>
              <div class="auto-row">
              <n-space align="center" justify="space-between">
                <n-space align="center">
                  <n-switch
                    size="small"
                    v-model:value="autoEnabled"
                    @update:value="toggleAutoRefresh"
                  />
                  <n-text>{{ t("header.autoRefresh") }}</n-text>
                </n-space>
                <n-button text size="small" @click="togglePause" :disabled="!store.autoRefreshEnabled">
                  {{ store.autoRefreshPaused ? t("header.resume") : t("header.pause") }}
                </n-button>
              </n-space>
              <div class="time-inputs">
                <div class="time-item">
                  <n-input-number
                    size="small"
                    v-model:value="timeForm.hour"
                    :min="0"
                    :max="23"
                    button-placement="both"
                    @update:value="applyAutoInterval"
                  />
                  <span class="unit">{{ t("header.hour") }}</span>
                </div>
                <div class="time-item">
                  <n-input-number
                    size="small"
                    v-model:value="timeForm.minute"
                    :min="0"
                    :max="59"
                    button-placement="both"
                    @update:value="applyAutoInterval"
                  />
                  <span class="unit">{{ t("header.minute") }}</span>
                </div>
                <div class="time-item">
                  <n-input-number
                    size="small"
                    v-model:value="timeForm.second"
                    :min="0"
                    :max="59"
                    button-placement="both"
                    @update:value="applyAutoInterval"
                  />
                  <span class="unit">{{ t("header.second") }}</span>
                </div>
              </div>
                <n-text depth="3" class="tip">
                  {{ t("header.refreshTip") }}
                </n-text>
              </div>
            </div>
          </n-popover>
          <n-popover>
            <template #trigger>
              <div class="control-hit-area" @click="toggleTheme">
                <n-button
                  class="header-control-btn"
                  secondary
                  strong
                  round
                  :aria-label="themeToggleLabel"
                  :title="themeToggleLabel"
                  @click.stop="toggleTheme"
                >
                  <template #icon>
                    <n-icon
                      :component="store.siteTheme === 'light' ? Moon : SunOne"
                    />
                  </template>
                </n-button>
              </div>
            </template>
            {{ store.siteTheme === "light" ? t("common.darkMode") : t("common.lightMode") }}
          </n-popover>
          <n-popover>
            <template #trigger>
              <div class="control-hit-area" @click="goSetting">
                <n-button
                  class="header-control-btn"
                  secondary
                  strong
                  round
                  :aria-label="t('common.settings')"
                  :title="t('common.settings')"
                  @click.stop="goSetting"
                >
                  <template #icon>
                    <n-icon :component="SettingTwo" />
                  </template>
                </n-button>
              </div>
            </template>
            {{ t("common.settings") }}
          </n-popover>
        </n-space>
      </div>
      <div class="mobile">
        <n-dropdown
          :options="menuOptions"
          size="large"
          trigger="manual"
          :show="mobileMenuOpen"
          placement="bottom-end"
          @clickoutside="closeMobileMenu"
          @select="menuOptionsSelect"
        >
          <div
            class="mobile-trigger"
            @click.stop="toggleMobileMenu"
            @touchstart.stop.prevent="toggleMobileMenu"
          >
            <n-button secondary strong round>
              <template #icon>
                <n-icon :component="HamburgerButton" />
              </template>
            </n-button>
          </div>
        </n-dropdown>
      </div>
    </section>
  </n-card>
</template>

<script setup>
import {
  SunOne,
  Moon,
  Refresh,
  SettingTwo,
  HamburgerButton,
} from "@icon-park/vue-next";
import { getCurrentTime } from "@/utils/getTime.js";
import { getPublicAssetUrl } from "@/utils/publicAssets";
import { mainStore } from "@/store";
import { NText, NIcon } from "naive-ui";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { h } from "vue";
import {
  buildCategoryPath,
  buildFixedLocalePath,
  buildHomePath,
  buildLocalePathFromRoute,
  getCategoryLabel,
  getCategoryNameBySlug,
  getCategorySlugByName,
  getLocaleFromRoute,
  getSupportedLocales,
  savePreferredLocale,
} from "@/utils/locale";

const router = useRouter();
const route = useRoute();
const store = mainStore();
const { t, locale } = useI18n({ useScope: "global" });
const timeInterval = ref(null);
const siteLogoUrl = getPublicAssetUrl("/ico/favicon.png");
const showRefresh = ref(false);
const countdownText = ref("");
const countdownTimer = ref(null);
const autoEnabled = ref(store.autoRefreshEnabled);
const mobileMenuOpen = ref(false);
const timeForm = reactive({
  hour: 0,
  minute: 30,
  second: 0,
});
const isSmallScreen = ref(false);
const isTabletScreen = ref(false);
const isSettingPage = computed(
  () => ["setting", "setting-locale"].includes(router.currentRoute.value?.name)
);
const isRefreshEnabledRoute = (routeName) =>
  [
    "home",
    "home-locale",
    "category",
    "category-locale",
    "list",
    "list-locale",
    "list-legacy",
    "setting",
    "setting-locale",
  ].includes(routeName);
const currentLocaleMeta = computed(
  () =>
    getSupportedLocales().find((item) => item.code === locale.value) ||
    getSupportedLocales()[0]
);
const refreshButtonLabel = computed(() =>
  countdownText.value
    ? `${t("header.refreshPage")} ${countdownText.value}`
    : t("header.refreshPage")
);
const canManualRefresh = computed(
  () => showRefresh.value && !isSettingPage.value
);
const themeToggleLabel = computed(() =>
  store.siteTheme === "light" ? t("common.darkMode") : t("common.lightMode")
);
const toggleTheme = () => {
  store.setSiteTheme(store.siteTheme === "light" ? "dark" : "light");
};
const buildCalendarDate = (timeData) => {
  if (!timeData?.time) return null;
  return new Date(
    Number(timeData.time.year),
    Number(timeData.time.month) - 1,
    Number(timeData.time.day),
    Number(timeData.time.hour),
    Number(timeData.time.minute),
    Number(timeData.time.second)
  );
};
const formatHeaderDate = (timeData) => {
  if (!timeData) return t("header.dateLoadFailed");
  if (locale.value === "zh-CN") {
    return `${timeData.lunar.GanZhiYear}年 ${timeData.lunar.text} ${timeData.time.weekday}`;
  }
  const currentDate = buildCalendarDate(timeData);
  if (!currentDate || Number.isNaN(currentDate.getTime())) {
    return t("header.dateLoadFailed");
  }
  const targetLocale = currentLocaleMeta.value.htmlLang || locale.value;
  return new Intl.DateTimeFormat(targetLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentDate);
};
const currentDateText = computed(() => formatHeaderDate(store.timeData));
const activeCategoryLocal = computed({
  get() {
    return store.activeCategory;
  },
  set(val) {
    store.setActiveCategory(val);
    const targetPath =
      val === "全部"
        ? buildHomePath(locale.value)
        : buildCategoryPath(locale.value, getCategorySlugByName(val));
    if (router.currentRoute.value.fullPath !== targetPath) {
      router.push(targetPath);
    }
  },
});
const selectCategory = (value) => {
  activeCategoryLocal.value = value;
};
const goHome = () => {
  router.push(buildHomePath(locale.value));
};
const availableCategorySet = computed(() => {
  const availableNews = store.newsArr.filter((item) => item.show);
  return new Set(availableNews.map((item) => item.category || "综合"));
});
const categoryOptions = computed(() => {
  const base = store.categories
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((cat) => availableCategorySet.value.has(cat.name))
    .map((c) => ({ label: getCategoryLabel(c.name, locale.value), value: c.name }));
  return [{ label: t("categories.all"), value: "全部" }, ...base];
});
const categoryNavOptions = computed(() => categoryOptions.value);
const languageOptions = computed(() =>
  getSupportedLocales().map((item) => ({
    key: item.code,
    label: () =>
      h(
        "div",
        { class: "locale-option", style: localeOptionStyle },
        [
          h("img", {
            class: "locale-option-flag",
            src: item.flag,
            alt: item.label,
            style: localeFlagStyle,
          }),
          h(
            "span",
            { class: "locale-option-label", style: localeOptionLabelStyle },
            item.label
          ),
        ]
      ),
  }))
);
const localeOptionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "124px",
  maxWidth: "100%",
  whiteSpace: "nowrap",
};
const localeOptionLabelStyle = {
  display: "inline-block",
  lineHeight: "1.25",
};
const localeFlagStyle = {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: "0",
  display: "block",
};

const switchLocale = (nextLocale) => {
  locale.value = nextLocale;
  savePreferredLocale(nextLocale);
  const target = buildLocalePathFromRoute(route, nextLocale);
  if (router.currentRoute.value.fullPath !== target) {
    router.push(target);
  }
};

watchEffect(() => {
  if (!store.categoryEnabled) return;
  const values = categoryOptions.value.map((opt) => opt.value);
  if (!values.length) return;
  if (!values.includes(store.activeCategory)) {
    const next = values[0] || "全部";
    if (store.activeCategory !== next) {
      store.setActiveCategory(next);
    }
  }
});

// 移动端时间模块
const timeRender = () => {
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "6px 18px",
      },
    },
    [
      h(NText, null, {
        default: () =>
          store.timeData ? store.timeData.time.text : t("header.timeLoadFailed"),
      }),
      h(
        NText,
        { depth: 3, style: "font-size: 12px" },
        {
          default: () => formatHeaderDate(store.timeData),
        }
      ),
    ]
  );
};

// 移动端菜单
const menuOptions = computed(() => [
  {
    key: "header",
    type: "render",
    render: timeRender,
  },
  {
    key: "header-divider",
    type: "divider",
  },
  {
    label: countdownText.value
      ? `${t("header.refreshPage")} ${countdownText.value}`
      : t("header.refreshPage"),
    key: "refresh",
    disabled: !canManualRefresh.value,
    icon: () => {
      return h(NIcon, null, {
        default: () => h(Refresh),
      });
    },
  },
  {
    key: "locale-divider",
    type: "divider",
  },
  ...getSupportedLocales().map((item) => ({
    label: item.label,
    key: `locale:${item.code}`,
  })),
  {
    label: () =>
      h(NText, null, {
        default: () =>
          store.siteTheme === "light"
            ? t("common.darkMode")
            : t("common.lightMode"),
      }),
    key: "changeTheme",
    icon: () => {
      return h(NIcon, null, {
        default: () => (store.siteTheme === "light" ? h(Moon) : h(SunOne)),
      });
    },
  },
  {
    label: t("common.settings"),
    key: "setting",
    icon: () => {
      return h(NIcon, null, {
        default: () => h(SettingTwo),
      });
    },
  },
]);

// 移动端下拉菜单点击事件
const menuOptionsSelect = (val) => {
  if (val === "refresh") {
    manualRefresh();
  } else if (String(val).startsWith("locale:")) {
    switchLocale(String(val).replace("locale:", ""));
  } else if (val === "changeTheme") {
    store.setSiteTheme(store.siteTheme === "light" ? "dark" : "light");
  } else if (val === "setting") {
    goSetting();
  }
  mobileMenuOpen.value = false;
};

const goSetting = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("dailyhot:freeze-auto-refresh-route"));
  }
  router.push(buildFixedLocalePath(locale.value, "/setting"));
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const manualRefresh = () => {
  if (!canManualRefresh.value) return;
  router.go(0);
  if (
    typeof window !== "undefined" &&
    store.autoRefreshEnabled &&
    !store.autoRefreshPaused &&
    !window.$autoRefreshPausedByRoute
  ) {
    const seconds = Number(store.autoRefreshInterval);
    if (seconds > 0) {
      window.$nextAutoRefreshAt = Date.now() + seconds * 1000;
    }
  }
};

const toggleAutoRefresh = (val) => {
  store.autoRefreshEnabled = val;
  if (!val) {
    store.autoRefreshPaused = false;
  }
};

const togglePause = () => {
  if (!store.autoRefreshEnabled) return;
  store.autoRefreshPaused = !store.autoRefreshPaused;
};

const secondsToTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.max(seconds % 60, 0);
  return { h, m, s };
};

const timeToSeconds = (time) => {
  const h = Number(time.hour) || 0;
  const m = Number(time.minute) || 0;
  const s = Number(time.second) || 0;
  return h * 3600 + m * 60 + s;
};

const syncTimeForm = () => {
  const { h, m, s } = secondsToTime(Number(store.autoRefreshInterval));
  timeForm.hour = h;
  timeForm.minute = m;
  timeForm.second = s;
};

const applyAutoInterval = () => {
  const seconds = timeToSeconds(timeForm);
  if (seconds < 60) {
    $message.warning(t("header.refreshMinWarning"));
    return;
  }
  store.autoRefreshInterval = seconds;
  if (
    typeof window !== "undefined" &&
    store.autoRefreshEnabled &&
    !store.autoRefreshPaused
  ) {
    if (store.autoRefreshRoutePaused || window.$autoRefreshPausedByRoute) {
      store.autoRefreshRemainingMs = seconds * 1000;
      window.$autoRefreshRemainingMs = seconds * 1000;
      window.$nextAutoRefreshAt = null;
      return;
    }
    window.$nextAutoRefreshAt = Date.now() + seconds * 1000;
  }
};

const formatCountdown = (remainMs) => {
  const totalSeconds = Math.max(Math.floor(remainMs / 1000), 0);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const separator = locale.value === "en" ? " " : "";
  return [
    `${h}${t("header.hour")}`,
    `${m}${t("header.minute")}`,
    `${s}${t("header.second")}`,
  ].join(separator);
};

const normalizeRemainingMs = (value) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const getSyncedAutoRefreshRemainingMs = () =>
  normalizeRemainingMs(store.autoRefreshRemainingMs) ??
  normalizeRemainingMs(window.$autoRefreshRemainingMs);

const updateCountdown = () => {
  if (typeof window === "undefined" || !store.autoRefreshEnabled) {
    countdownText.value = "";
    return;
  }
  if (store.autoRefreshRoutePaused || window.$autoRefreshPausedByRoute) {
    const remainingMs = getSyncedAutoRefreshRemainingMs();
    countdownText.value =
      Number.isFinite(remainingMs) && remainingMs >= 0
        ? formatCountdown(remainingMs)
        : "";
    return;
  }
  if (store.autoRefreshPaused) {
    countdownText.value = "";
    return;
  }
  const syncedRemainingMs = getSyncedAutoRefreshRemainingMs();
  if (syncedRemainingMs !== null) {
    countdownText.value = formatCountdown(syncedRemainingMs);
    return;
  }
  const target = window.$nextAutoRefreshAt;
  const intervalSeconds = Number(store.autoRefreshInterval);
  if (!target && intervalSeconds > 0) {
    window.$nextAutoRefreshAt = Date.now() + intervalSeconds * 1000;
  }
  const nextTime = window.$nextAutoRefreshAt;
  if (!nextTime) {
    countdownText.value = "";
    return;
  }
  const remain = nextTime - Date.now();
  if (remain <= 0) {
    countdownText.value = t("header.refreshInProgress");
    return;
  }
  countdownText.value = formatCountdown(remain);
};

const setupCountdown = () => {
  clearInterval(countdownTimer.value);
  if (typeof window === "undefined") return;
  countdownTimer.value = setInterval(updateCountdown, 1000);
  updateCountdown();
};

const updateScreen = () => {
  if (typeof window === "undefined") return;
  const width = window.innerWidth;
  const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches === true;
  const hasTouch = Number(window.navigator?.maxTouchPoints || 0) > 0;
  const tabletCompact = width > 768 && width <= 1180 && (hasCoarsePointer || hasTouch);

  isTabletScreen.value = tabletCompact;
  isSmallScreen.value = width <= 768 || tabletCompact;
};

watch(
  () => [
    store.autoRefreshEnabled,
    store.autoRefreshPaused,
    store.autoRefreshRoutePaused,
    store.autoRefreshRemainingMs,
    store.autoRefreshInterval,
    router.currentRoute.value?.name,
    locale.value,
  ],
  () => {
    autoEnabled.value = store.autoRefreshEnabled;
    syncTimeForm();
    setupCountdown();
  },
  { immediate: true }
);

// 监听路由参数变化
watch(
  () => router.currentRoute.value,
  (val) => {
    const categoryName = getCategoryNameBySlug(val.params?.categorySlug);
    store.setActiveCategory(categoryName || "全部");
    locale.value = getLocaleFromRoute(val);
    showRefresh.value = isRefreshEnabledRoute(val?.name);
  },
  { immediate: true }
);

onMounted(() => {
  window.$timeInterval = timeInterval.value = setInterval(() => {
    store.timeData = getCurrentTime();
  }, 1000);
  const categoryName = getCategoryNameBySlug(router.currentRoute.value?.params?.categorySlug);
  store.setActiveCategory(categoryName || "全部");
  locale.value = getLocaleFromRoute(router.currentRoute.value);
  showRefresh.value = isRefreshEnabledRoute(router.currentRoute.value?.name);
  syncTimeForm();
  setupCountdown();
  updateScreen();
  window.addEventListener("resize", updateScreen);
});

onBeforeUnmount(() => {
  clearInterval(timeInterval.value);
  clearInterval(countdownTimer.value);
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateScreen);
  }
});
</script>

<style lang="scss" scoped>
.app-header {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 16px 5vw;
  min-height: 72px;
  z-index: 1200;
  isolation: isolate;
  top: 0;
  background-color: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
  transition: all 0.25s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);

  &.collapsed {
    padding: 0 5vw;
    min-height: 39px;
    cursor: pointer;
    box-shadow: none;
    section {
      column-gap: 8px;
    }
  }

  section {
    width: 100%;
    max-width: 1800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    justify-content: space-between;
    column-gap: 12px;
    transition: all 0.2s ease;
  }

  .logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    img {
      width: 45px;
      height: 45px;
      margin-right: 11px;
      transition: all 0.3s;
    }
    .name {
      display: flex;
      flex-direction: column;
      span {
        &:nth-of-type(1) {
          font-size: 20px;
          font-weight: bold;
          transition: all 0.3s;
        }
        &:nth-of-type(2) {
          font-size: 12px;
        }
      }
    }
  }

  .current-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    .time {
      font-size: 18px;
      font-weight: 600;
    }
    .date {
      font-size: 12px;
    }
  }

  .controls {
    display: flex;
    justify-content: flex-end;
    align-self: stretch;
    :deep(.n-space) {
      min-height: 56px;
      align-items: stretch !important;
    }
    :deep(.n-space > div) {
      display: flex;
      align-items: stretch;
    }
    .control-hit-area {
      display: flex;
      align-items: stretch;
      cursor: pointer;
    }
    :deep(.header-control-btn) {
      height: 100%;
    }
    .countdown {
      margin-left: 3px;
      font-size: 12px;
    }
    .refresh-panel {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 260px;
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .auto-row {
        padding: 4px 0;
        border-top: 1px solid var(--n-border-color);
      }
      .time-inputs {
        display: flex;
        flex-direction: row;
        gap: 10px;
        width: 100%;
        flex-wrap: nowrap;
        .time-item {
          display: flex;
          align-items: center;
          gap: 6px;
          .unit {
            font-size: 12px;
            line-height: 1;
          }
          :deep(.n-input-number) {
            width: 120px;
          }
        }
      }
      .tip {
        font-size: 12px;
      }
    }
  }

  .category-select {
    display: flex;
    align-self: stretch;
    justify-content: center;
    padding: 0;
    :deep(.n-select) {
      min-width: 240px;
    }
    .category-back {
      display: flex;
      justify-content: center;
      align-items: stretch;
      width: 100%;
    }
    .category-nav {
      display: flex;
      align-items: stretch;
      justify-content: center;
      width: 100%;
      :deep(.n-space) {
        min-height: 56px;
        align-items: stretch !important;
      }
      :deep(.n-space > div) {
        display: flex;
        align-items: stretch;
      }
      .category-hit-area {
        min-height: 56px;
      }
      .cat-btn {
        height: 100%;
        padding: 0 2px;
        font-weight: 700;
        font-size: 18px;
      }
    }
    .category-hit-area {
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      cursor: pointer;
    }
  }

  &.expanded {
    .controls {
      .control-hit-area {
        margin-block: -16px;
        padding-block: 16px;
      }
    }
    .category-select {
      .category-hit-area {
        margin-block: -16px;
        padding-block: 16px;
      }
    }
  }

  .mobile {
    display: none;
    .mobile-trigger {
      display: inline-flex;
    }
  }

  &.collapsed {
    .logo {
      img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
      .name {
        span {
          &:nth-of-type(1) {
            font-size: 16px;
          }
          &:nth-of-type(2) {
            display: none;
          }
        }
      }
    }
    .current-time {
      .time {
        font-size: 14px;
      }
      .date {
        display: none;
      }
    }
    :deep(.controls .n-button),
    :deep(.mobile .n-button) {
      transform: scale(0.88);
    }
    .controls {
      :deep(.n-space) {
        min-height: 39px;
      }
      .control-hit-area {
        margin: 0;
        padding: 0;
      }
      :deep(.header-control-btn) {
        height: 34px;
      }
    }
    .category-select {
      .category-nav .category-hit-area {
        min-height: 39px;
      }
      .category-nav .cat-btn {
        font-size: 16px;
      }
      .category-nav :deep(.n-space) {
        min-height: 39px;
      }
    }
  }

  &.tablet-compact {
    padding: 12px 4vw;

    &.collapsed {
      padding: 0 4vw;
      min-height: 48px;
    }

    section {
      grid-template-columns: minmax(150px, 1fr) minmax(220px, 1fr) auto;
      column-gap: 10px;
    }

    .category-select {
      min-width: 0;

      :deep(.n-select) {
        width: 100%;
        min-width: 0;
        max-width: 260px;
      }
    }

    .controls {
      :deep(.n-space) {
        min-height: 48px;
        flex-wrap: nowrap !important;
        gap: 8px !important;
      }

      :deep(.header-control-btn) {
        min-width: 44px;
        height: 48px;
        padding-inline: 13px;
      }
    }

    &.expanded {
      .controls .control-hit-area,
      .category-select .category-hit-area {
        margin-block: -12px;
        padding-block: 12px;
      }
    }
  }

  @media (max-width: 768px) {
    section {
      display: flex;
    }
    .logo {
      img {
        width: 40px;
        height: 40px;
      }
      .name {
        span {
          &:nth-of-type(1) {
            font-size: 18px;
          }
        }
      }
    }
    .current-time,
    .controls {
      display: none;
    }
    .mobile {
      display: block;
    }
  }
}

.locale-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 124px;
  max-width: 100%;
  white-space: nowrap;
}

.locale-option-label {
  display: inline-block;
  line-height: 1.25;
}

.locale-option-flag,
.locale-trigger-flag {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}
</style>
