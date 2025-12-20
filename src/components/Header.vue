<template>
  <n-card :bordered="false" class="app-header" content-style="padding: 0">
    <section>
      <div class="logo" @click="router.push('/')">
        <img src="/ico/favicon.png" alt="logo" />
        <div class="name">
          <n-text>今日热榜</n-text>
          <n-text :depth="3">汇聚全网热点，热门尽览无余_吾爱分享网</n-text>
        </div>
      </div>
      <div v-if="!store.categoryEnabled">
        <div class="current-time" v-if="store.timeData">
          <n-text class="time">{{ store.timeData.time.text }}</n-text>
          <n-text class="date" :depth="3">
            {{
              store.timeData.lunar.GanZhiYear +
              "年 " +
              store.timeData.lunar.text +
              " " +
              store.timeData.time.weekday
            }}
          </n-text>
        </div>
        <div class="current-time" v-else>
          <n-text class="time">时间获取中</n-text>
        </div>
      </div>
      <div v-else class="category-select">
        <div v-if="isSettingPage" class="category-back">
          <n-button size="small" type="primary" strong @click="router.push('/')">
            返回首页
          </n-button>
        </div>
        <div v-else-if="!isSmallScreen" class="category-nav">
          <n-space align="center" justify="center" wrap>
            <n-button
              v-for="cat in categoryNavOptions"
              :key="cat.value"
              size="small"
              text
              strong
              :type="cat.value === activeCategoryLocal ? 'primary' : 'default'"
              class="cat-btn"
              @click="activeCategoryLocal = cat.value"
            >
              {{ cat.label }}
            </n-button>
          </n-space>
        </div>
        <n-select
          v-else
          v-model:value="activeCategoryLocal"
          :options="categoryOptions"
          size="large"
          placeholder="选择分类"
        />
      </div>
      <div class="controls">
        <n-space justify="end">
          <n-popover
            v-if="showRefresh"
            trigger="hover"
            placement="bottom"
            :show-arrow="false"
            style="max-width: 320px"
          >
            <template #trigger>
              <n-button secondary strong round>
                <template #icon>
                  <n-icon :component="Refresh" />
                </template>
                <span v-if="countdownText" class="countdown">{{ countdownText }}</span>
              </n-button>
            </template>
            <div class="refresh-panel" @click.stop>
              <div class="panel-header">
                <n-text>刷新控制</n-text>
                <n-text depth="3" v-if="countdownText">下次：{{ countdownText }}</n-text>
              </div>
              <n-button block type="primary" dashed @click="manualRefresh">
                <template #icon>
                  <n-icon :component="Refresh" />
                </template>
                立即刷新
              </n-button>
              <div class="auto-row">
              <n-space align="center" justify="space-between">
                <n-space align="center">
                  <n-switch
                    size="small"
                    v-model:value="autoEnabled"
                    @update:value="toggleAutoRefresh"
                  />
                  <n-text>自动刷新</n-text>
                </n-space>
                <n-button text size="small" @click="togglePause" :disabled="!store.autoRefreshEnabled">
                  {{ store.autoRefreshPaused ? "继续" : "暂停" }}
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
                  <span class="unit">时</span>
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
                  <span class="unit">分</span>
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
                  <span class="unit">秒</span>
                </div>
              </div>
                <n-text depth="3" class="tip">
                  默认 0时30分0秒，最少 60 秒。开启后图标右侧显示倒计时。
                </n-text>
              </div>
            </div>
          </n-popover>
          <n-popover>
            <template #trigger>
              <n-button
                secondary
                strong
                round
                @click="
                  store.setSiteTheme(
                    store.siteTheme === 'light' ? 'dark' : 'light'
                  )
                "
              >
                <template #icon>
                  <n-icon
                    :component="store.siteTheme === 'light' ? Moon : SunOne"
                  />
                </template>
              </n-button>
            </template>
            {{ store.siteTheme === "light" ? "深色模式" : "浅色模式" }}
          </n-popover>
          <n-popover>
            <template #trigger>
              <n-button secondary strong round @click="router.push('/setting')">
                <template #icon>
                  <n-icon :component="SettingTwo" />
                </template>
              </n-button>
            </template>
            全局设置
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
          <n-button secondary strong round @click.stop="toggleMobileMenu">
            <template #icon>
              <n-icon :component="HamburgerButton" />
            </template>
          </n-button>
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
import { mainStore } from "@/store";
import { NText, NIcon } from "naive-ui";
import { useRouter } from "vue-router";

const router = useRouter();
const store = mainStore();
const timeInterval = ref(null);
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
const isSettingPage = computed(
  () => router.currentRoute.value?.name === "setting"
);
const activeCategoryLocal = computed({
  get() {
    return store.activeCategory;
  },
  set(val) {
    store.setActiveCategory(val);
  },
});
const categoryOptions = computed(() => {
  const base = store.categories
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ label: c.name, value: c.name }));
  return [{ label: "全部", value: "全部" }, ...base];
});
const categoryNavOptions = computed(() => categoryOptions.value);

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
          store.timeData ? store.timeData.time.text : "时间获取失败",
      }),
      h(
        NText,
        { depth: 3, style: "font-size: 12px" },
        {
          default: () =>
            store.timeData
              ? store.timeData.lunar.GanZhiYear +
                "年 " +
                store.timeData.lunar.text +
                " " +
                store.timeData.time.weekday
              : "日期获取失败",
        }
      ),
    ]
  );
};

// 移动端菜单
const menuOptions = [
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
    label: "刷新页面",
    key: "refresh",
    icon: () => {
      return h(NIcon, null, {
        default: () => h(Refresh),
      });
    },
  },
  {
    label: () => {
      return h(NText, null, {
        default: () => (store.siteTheme === "light" ? "深色模式" : "浅色模式"),
      });
    },
    key: "changeTheme",
    icon: () => {
      return h(NIcon, null, {
        default: () => (store.siteTheme === "light" ? h(Moon) : h(SunOne)),
      });
    },
  },
  {
    label: "全局设置",
    key: "setting",
    icon: () => {
      return h(NIcon, null, {
        default: () => h(SettingTwo),
      });
    },
  },
];

// 移动端下拉菜单点击事件
const menuOptionsSelect = (val) => {
  if (val === "refresh") {
    manualRefresh();
  } else if (val === "changeTheme") {
    store.setSiteTheme(store.siteTheme === "light" ? "dark" : "light");
  } else if (val === "setting") {
    router.push("/setting");
  }
  mobileMenuOpen.value = false;
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};

const manualRefresh = () => {
  router.go(0);
  if (typeof window !== "undefined" && store.autoRefreshEnabled && !store.autoRefreshPaused) {
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
    $message.warning("自动刷新最少 60 秒");
    return;
  }
  store.autoRefreshInterval = seconds;
  if (typeof window !== "undefined" && store.autoRefreshEnabled && !store.autoRefreshPaused) {
    window.$nextAutoRefreshAt = Date.now() + seconds * 1000;
  }
};

const formatCountdown = (remainMs) => {
  const totalSeconds = Math.max(Math.floor(remainMs / 1000), 0);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}时${m}分${s}秒`;
};

const updateCountdown = () => {
  if (
    typeof window === "undefined" ||
    !store.autoRefreshEnabled ||
    store.autoRefreshPaused
  ) {
    countdownText.value = "";
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
    countdownText.value = "刷新中...";
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
  isSmallScreen.value = window.innerWidth <= 960;
};

watch(
  () => [
    store.autoRefreshEnabled,
    store.autoRefreshPaused,
    store.autoRefreshInterval,
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
    const isHome = val.path === "/";
    showRefresh.value = isHome ? true : false;
  }
);

onMounted(() => {
  window.$timeInterval = timeInterval.value = setInterval(() => {
    store.timeData = getCurrentTime();
  }, 1000);
  showRefresh.value = router.currentRoute.value?.path === "/" ? true : false;
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
  z-index: 2;
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
    justify-content: center;
    padding: 8px 0;
    :deep(.n-select) {
      min-width: 240px;
    }
    .category-back {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .category-nav {
      display: flex;
      justify-content: center;
      width: 100%;
      .cat-btn {
        font-weight: 700;
        font-size: 18px;
      }
    }
  }

  .mobile {
    display: none;
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
    .category-select {
      .category-nav .cat-btn {
        font-size: 16px;
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
</style>
