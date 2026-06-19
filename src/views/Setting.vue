<template>
  <div class="setting">
    <div class="title">{{ t("settings.title") }}</div>
    <n-h6 prefix="bar"> {{ t("settings.baseSection") }} </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.theme") }}</n-text>
        </div>
        <n-select
          class="set"
          v-model:value="siteTheme"
          :options="themeOptions"
          @update:value="siteThemeAuto = false"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.themeAuto") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.themeAutoTip") }}
          </n-text>
        </div>
        <n-switch
          v-model:value="siteThemeAuto"
          :round="false"
          @update:value="themeAutoOpen"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.linkOpenType") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.linkOpenTypeTip") }}
          </n-text>
        </div>
        <n-select
          class="set"
          v-model:value="linkOpenType"
          :options="linkOptions"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.headerFixed") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.headerFixedTip") }}
          </n-text>
        </div>
        <n-switch v-model:value="headerFixed" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.headerCollapsed") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.headerCollapsedTip") }}
          </n-text>
        </div>
        <n-switch v-model:value="headerCollapsed" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.compactMode") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.compactModeTip") }}
          </n-text>
        </div>
        <n-switch v-model:value="compactMode" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top" style="flex-direction: column; align-items: flex-start">
        <div class="name">
          <n-text class="text">{{ t("settings.listFontSize") }}</n-text>
          <n-card
            class="tip"
            :style="{
              backgroundColor: 'var(--n-border-color)',
              margin: '12px 0',
            }"
          >
            <n-text :style="{ fontSize: listFontSize + 'px' }">
              {{ t("settings.listFontPreview") }}
            </n-text>
          </n-card>
        </div>

        <n-slider
          v-model:value="listFontSize"
          :tooltip="false"
          :max="20"
          :min="14"
          :step="1"
          :marks="listFontMarks"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.categoryEnabled") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.categoryEnabledTip") }}
          </n-text>
        </div>
        <n-space vertical align="end">
          <n-switch v-model:value="categoryEnabled" :round="false" />
        </n-space>
      </div>
    </n-card>
    <n-card class="set-item full">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.privacyControl") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.privacyControlTip") }}
          </n-text>
        </div>
        <n-space wrap>
          <n-tag type="success">
            {{ t("settings.analyticsRequiredTag") }}
          </n-tag>
          <n-button
            size="small"
            secondary
            strong
            @click="openConsentSettings"
          >
            {{ t("settings.manageAdPreferences") }}
          </n-button>
          <n-button
            v-if="isAnalyticsPanelVisible"
            size="small"
            tertiary
            @click="router.push(buildFixedLocalePath(locale, '/analytics'))"
          >
            {{ t("settings.viewAnalytics") }}
          </n-button>
        </n-space>
      </div>
    </n-card>
    <n-card class="set-item full">
      <div class="top" style="align-items: flex-start">
        <div class="name">
          <n-text class="text">{{ t("settings.categoryManagement") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.categoryManagementTip") }}
          </n-text>
        </div>
        <div class="categories">
          <div class="add">
            <n-input
              v-model:value="newCategory"
              size="small"
              :placeholder="t('settings.newCategoryPlaceholder')"
              style="width: 180px"
            />
            <n-button size="small" type="primary" @click="handleAddCategory">
              {{ t("settings.addCategory") }}
            </n-button>
          </div>
          <div class="list">
            <div
              class="cat-item"
              v-for="cat in store.categories.sort((a, b) => a.order - b.order)"
              :key="cat.id"
            >
              <n-input
                v-if="cat.builtin"
                size="small"
                disabled
                :value="getCategoryDisplayName(cat)"
              />
              <n-input
                v-else
                size="small"
                v-model:value="cat.name"
                @change="(val) => handleRenameCategory(cat.id, val)"
              />
              <n-button
                size="small"
                type="error"
                ghost
                :disabled="cat.builtin"
                @click="store.removeCategory(cat.id)"
              >
                {{ t("settings.deleteCategory") }}
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-card>
    <n-card class="set-item full">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.rankingOrder") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.rankingOrderTip") }}
          </n-text>
        </div>
        <n-space wrap>
          <n-popconfirm @positive-click="restoreDefaultOrder">
            <template #trigger>
              <n-button class="control" size="small">
                {{ t("settings.restoreDefaultOrder") }}
              </n-button>
            </template>
            {{ t("settings.restoreDefaultOrderConfirm") }}
          </n-popconfirm>
          <n-popconfirm @positive-click="restoreDefaultCategory">
            <template #trigger>
              <n-button class="control" size="small">
                {{ t("settings.restoreDefaultCategory") }}
              </n-button>
            </template>
            {{ t("settings.restoreDefaultCategoryConfirm") }}
          </n-popconfirm>
          <n-popconfirm @positive-click="restoreDefaultStatus">
            <template #trigger>
              <n-button class="control" size="small">
                {{ t("settings.restoreDefaultStatus") }}
              </n-button>
            </template>
            {{ t("settings.restoreDefaultStatusConfirm") }}
          </n-popconfirm>
        </n-space>
      </div>
      <draggable
        :list="newsArr"
        :animation="200"
        class="mews-group"
        item-key="order"
        @end="saveSoreData()"
      >
        <template #item="{ element }">
          <n-card
            class="item"
            embedded
            :content-style="{ display: 'flex', alignItems: 'center' }"
          >
            <div class="desc" :style="{ opacity: element.show ? null : 0.6 }">
              <img class="logo" :src="logoSrc(element.name)" alt="logo" @error="handleLogoError" />
              <n-text class="news-name" v-html="getSourceDisplayLabel(element)" />
              <n-tag
                size="small"
                type="warning"
                v-if="store.unavailableSources.includes(element.name)"
              >
                {{ t("settings.unavailable") }}
              </n-tag>
            </div>
            <n-select
              size="small"
              class="category-select"
              :options="categoryOptions"
              v-model:value="element.category"
              :placeholder="t('settings.categoryPlaceholder')"
              :disabled="!categoryEnabled"
            />
            <n-switch
              class="switch"
              :round="false"
              v-model:value="element.show"
              @update:value="saveSoreData(getSourceDisplayLabel(element), element.show)"
            />
          </n-card>
        </template>
      </draggable>
    </n-card>
    <n-h6 prefix="bar"> {{ t("settings.miscSection") }} </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.autoRefresh") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.autoRefreshTip") }}
          </n-text>
        </div>
        <div class="auto-refresh">
          <div class="time-inputs">
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.hour"
                :min="0"
                :max="23"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">{{ t("header.hour") }}</span>
            </div>
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.minute"
                :min="0"
                :max="59"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">{{ t("header.minute") }}</span>
            </div>
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.second"
                :min="0"
                :max="59"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">{{ t("header.second") }}</span>
            </div>
          </div>
          <n-switch v-model:value="autoRefreshEnabled" :round="false" />
        </div>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.showImages") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.showImagesTip") }}
          </n-text>
        </div>
        <n-switch v-model:value="showImages" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.clearCache") }}</n-text>
          <n-text class="tip" :depth="3">
            {{
              t("settings.clearCacheTip", {
                version: cacheVersion,
                url: "https://www.wuaishare.cn/",
              })
            }}
          </n-text>
        </div>
        <n-button @click="clearCache" type="warning" ghost>
          {{ t("settings.clearCacheAction") }}
        </n-button>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.importExport") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.importExportTip") }}
          </n-text>
        </div>
        <n-space>
          <n-button size="small" @click="exportSettings">
            {{ t("settings.exportSettings") }}
          </n-button>
          <n-button size="small" @click="triggerImport">
            {{ t("settings.importSettings") }}
          </n-button>
        </n-space>
        <input
          ref="importFileRef"
          type="file"
          accept="application/json,.json"
          style="display: none"
          @change="handleImportFile"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.resetAll") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.resetAllTip") }}
          </n-text>
        </div>
        <n-popconfirm @positive-click="reset">
          <template #trigger>
            <n-button type="warning">
              {{ t("settings.resetAllAction") }}
            </n-button>
          </template>
          {{ t("settings.resetAllConfirm") }}
        </n-popconfirm>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { clearAppCaches, getCacheVersion } from "@/utils/cache";
import { OPEN_CONSENT_EVENT } from "@/utils/analytics";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { useOsTheme } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";
import { buildFixedLocalePath, getCategoryLabel } from "@/utils/locale";
import { getSourceLabel } from "@/utils/sourceLabels";

const store = mainStore();
const osThemeRef = useOsTheme();
const router = useRouter();
const { t, locale } = useI18n({ useScope: "global" });
const {
  siteTheme,
  siteThemeAuto,
  newsArr,
  linkOpenType,
  headerFixed,
  headerCollapsed,
  compactMode,
  listFontSize,
  autoRefreshEnabled,
  autoRefreshInterval,
  showImages,
  categoryEnabled,
  activeCategory,
} = storeToRefs(store);
const categories = computed(() =>
  store.categories.slice().sort((a, b) => a.order - b.order)
);
const categoryOptions = computed(() =>
  categories.value.map((c) => ({
    label: getCategoryLabel(c.name, locale.value),
    value: c.name,
  }))
);
const newCategory = ref("");
const cacheVersion = ref(getCacheVersion());
const logoSrc = (name) => getSourceLogo(name, cacheVersion.value);
const getCategoryDisplayName = (category) =>
  category?.builtin
    ? getCategoryLabel(category.name, locale.value)
    : category?.name || "";
const getSourceDisplayLabel = (item) =>
  getSourceLabel(item?.name, locale.value, item?.label || item?.name);
const handleLogoError = (event) => {
  event.target.src = getSourceLogoFallback();
};
const importFileRef = ref(null);
const isAnalyticsPanelVisible = !import.meta.env.PROD;
const persistedKeys = [
  "siteTheme",
  "siteThemeAuto",
  "newsArr",
  "linkOpenType",
  "headerFixed",
  "headerCollapsed",
  "compactMode",
  "autoRefreshEnabled",
  "autoRefreshPaused",
  "autoRefreshInterval",
  "showImages",
  "categoryEnabled",
  "activeCategory",
  "categories",
  "listFontSize",
];

// 深浅模式
const themeOptions = computed(() => [
  {
    label: t("settings.themeLight"),
    value: "light",
  },
  {
    label: t("settings.themeDark"),
    value: "dark",
  },
]);

// 榜单跳转
const linkOptions = computed(() => [
  {
    label: t("settings.linkOpenNew"),
    value: "open",
  },
  {
    label: t("settings.linkOpenCurrent"),
    value: "href",
  },
]);

const listFontMarks = computed(() => ({
  14: t("settings.listFontSmall"),
  16: t("settings.listFontDefault"),
  20: t("settings.listFontLarge"),
}));

// 开启明暗自动跟随
const themeAutoOpen = (val) => {
  if (val) {
    siteTheme.value = osThemeRef.value;
  }
};

// 归一化顺序，保证 order 与当前展示一致
const normalizeOrder = () => {
  newsArr.value = newsArr.value.map((item, idx) => ({
    ...item,
    order: idx,
  }));
};

const restoreDefaultOrder = () => {
  const defaultOrder = store.defaultNewsArr
    .slice()
    .sort((a, b) => a.order - b.order);
  const defaultNames = new Set(defaultOrder.map((item) => item.name));
  const currentByName = new Map(
    newsArr.value.map((item) => [item.name, item])
  );
  const restored = defaultOrder.map((item, idx) => {
    const current = currentByName.get(item.name) || item;
    return { ...current, order: idx };
  });
  const extra = newsArr.value.filter((item) => !defaultNames.has(item.name));
  const extraWithOrder = extra.map((item, idx) => ({
    ...item,
    order: restored.length + idx,
  }));
  newsArr.value = restored.concat(extraWithOrder);
  $message.success(t("settings.restoreOrderSuccess"));
};

const restoreDefaultCategory = () => {
  const defaultCategoryMap = new Map(
    store.defaultNewsArr.map((item) => [item.name, item.category])
  );
  newsArr.value = newsArr.value.map((item) => ({
    ...item,
    category:
      defaultCategoryMap.get(item.name) || item.category || "综合",
  }));
  $message.success(t("settings.restoreCategorySuccess"));
};

const restoreDefaultStatus = () => {
  const defaultStatusMap = new Map(
    store.defaultNewsArr.map((item) => [item.name, item.show])
  );
  newsArr.value = newsArr.value.map((item) => ({
    ...item,
    show:
      typeof defaultStatusMap.get(item.name) === "boolean"
        ? defaultStatusMap.get(item.name)
        : item.show,
  }));
  $message.success(t("settings.restoreStatusSuccess"));
};

// 将排序结果写入
const saveSoreData = (name = null, open = false) => {
  normalizeOrder();
  $message.success(
    name
      ? t(open ? "settings.sourceEnabled" : "settings.sourceDisabled", {
          name,
        })
      : t("settings.sortSuccess")
  );
};

// 重置数据
const reset = () => {
  if (typeof $timeInterval !== "undefined") clearInterval($timeInterval);
  if (typeof $autoRefreshTimer !== "undefined") clearTimeout($autoRefreshTimer);
  localStorage.clear();
  location.reload();
};

const autoTime = reactive({
  hour: 0,
  minute: 30,
  second: 0,
});

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

const syncAutoTime = () => {
  const { h, m, s } = secondsToTime(Number(autoRefreshInterval.value));
  autoTime.hour = h;
  autoTime.minute = m;
  autoTime.second = s;
};

const applyAutoInterval = () => {
  const seconds = timeToSeconds(autoTime);
  if (seconds < 60) {
    $message.warning(t("settings.autoRefreshMinWarning"));
    return;
  }
  autoRefreshInterval.value = seconds;
};

const clearCache = async () => {
  await clearAppCaches();
  location.reload();
};

const exportSettings = () => {
  if (typeof localStorage === "undefined") return;
  const stored = localStorage.getItem("mainData");
  if (!stored) {
    $message.warning(t("settings.noSettingsToExport"));
    return;
  }
  let parsed = null;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    $message.error(t("settings.exportInvalidData"));
    return;
  }
  const payload = {
    version: 1,
    createdAt: new Date().toISOString(),
    data: parsed,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.href = url;
  link.download = `dailyhot-settings-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  $message.success(t("settings.exportSuccess"));
};

const triggerImport = () => {
  if (importFileRef.value) {
    importFileRef.value.click();
  }
};

const handleImportFile = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  let parsed = null;
  try {
    const content = await file.text();
    parsed = JSON.parse(content);
  } catch (error) {
    $message.error(t("settings.importInvalidFormat"));
    return;
  }
  const data = parsed?.data || parsed;
  if (!data || typeof data !== "object") {
    $message.error(t("settings.importInvalidData"));
    return;
  }
  const patch = {};
  persistedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      patch[key] = data[key];
    }
  });
  if (!Object.keys(patch).length) {
    $message.warning(t("settings.importNoUsableData"));
    return;
  }
  store.$patch(patch);
  store.ensureNewsList();
  await nextTick();
  store.checkNewsUpdate();
  $message.success(t("settings.importSuccess"));
};

const handleAddCategory = () => {
  if (!newCategory.value) return;
  const ok = store.addCategory(newCategory.value.trim());
  if (ok) {
    newCategory.value = "";
  }
};

const handleRenameCategory = (id, val) => {
  store.renameCategory(id, val);
};

const openConsentSettings = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
  }
};

watch(
  () => autoRefreshInterval.value,
  () => {
    syncAutoTime();
  },
  { immediate: true }
);

watch(
  () => categoryEnabled.value,
  (val) => {
    if (!val) {
      activeCategory.value = "全部";
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.setting {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  .title {
    margin-top: 20px;
    margin-bottom: 20px;
    font-size: 31px;
    font-weight: bold;
    grid-column: 1 / -1;
  }

  .n-h {
    padding-left: 16px;
    font-size: 20px;
    margin-left: 4px;
    grid-column: 1 / -1;
  }

  .set-item {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 0;

    &.full {
      grid-column: 1 / -1;
    }

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px 12px;

      .name {
        font-size: 18px;
        display: flex;
        flex-direction: column;

        .tip {
          font-size: 12px;
          border-radius: 8px;
        }
      }

      .set {
        max-width: 200px;
      }

      .category-select {
        min-width: 140px;
      }

      .auto-refresh {
        display: flex;
        align-items: center;
        gap: 12px;

        .time-inputs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;

          .time-item {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 150px;

            span {
              font-size: 12px;
            }

            :deep(.n-input-number) {
              width: 120px;
            }
          }
        }
      }

      .categories {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;

        .add {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .cat-item {
            display: flex;
            gap: 8px;
            align-items: center;
            max-width: 320px;
          }
        }
      }
    }

    .mews-group {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(5, minmax(0px, 1fr));
      gap: 24px;

      @media (max-width: 1666px) {
        grid-template-columns: repeat(4, minmax(0px, 1fr));
      }

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, minmax(0px, 1fr));
      }

      @media (max-width: 890px) {
        grid-template-columns: repeat(2, minmax(0px, 1fr));
      }

      @media (max-width: 620px) {
        grid-template-columns: repeat(1, minmax(0px, 1fr));
      }

      .item {
        cursor: pointer;

        .desc {
          display: flex;
          align-items: center;
          width: 100%;
          transition: all 0.3s;

          .logo {
            width: 40px;
            height: 40px;
            margin-right: 12px;
          }

          .news-name {
            font-size: 16px;
          }
        }

        .switch {
          margin-left: auto;
        }
      }
    }
  }
}
</style>
