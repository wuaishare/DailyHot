<template>
  <div
    class="setting"
    :class="[{ embedded }, `is-${store.siteTheme}`]"
  >
    <div v-if="!embedded" class="title">{{ t("settings.title") }}</div>
    <n-h6 v-if="showsDisplay" id="settings-base" prefix="bar">
      {{ t("settings.baseSection") }}
    </n-h6>
    <n-card v-if="showsDisplay" class="set-item full appearance-setting">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.theme") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.themeModeTip") }}
          </n-text>
        </div>
        <div class="appearance-segmented" role="group" :aria-label="t('settings.theme')">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            type="button"
            :class="{ active: appearanceMode === option.value }"
            @click="setAppearanceMode(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </n-card>
    <n-card v-if="showsDisplay" class="set-item">
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
    <n-card v-if="showsDisplay" class="set-item">
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
    <n-card v-if="showsDisplay" class="set-item">
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
    <n-card v-if="showsDisplay" class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.showPinnedRankings") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.showPinnedRankingsTip") }}
          </n-text>
        </div>
        <n-switch v-model:value="showPinnedRankings" :round="false" />
      </div>
    </n-card>
    <n-card v-if="showsDisplay" class="set-item full view-memory-setting">
      <div class="view-memory-head">
        <div class="name">
          <n-text class="text">{{ t("settings.categoryView") }}</n-text>
          <n-text class="tip" :depth="3">
            {{ t("settings.viewHierarchyTip") }}
          </n-text>
        </div>
        <n-tag size="small" :bordered="false">
          {{ t("settings.globalViewCurrent", { mode: globalViewLabel }) }}
        </n-tag>
      </div>
      <div class="view-memory-flow" :aria-label="t('settings.viewHierarchyTip')">
        <span>{{ t("settings.viewLevelGlobal") }}</span>
        <i>→</i>
        <span>{{ t("settings.viewLevelOne") }}</span>
        <i>→</i>
        <span>{{ t("settings.viewLevelTwo") }}</span>
        <i>→</i>
        <span>{{ t("settings.viewLevelThree") }}</span>
      </div>
      <n-text class="view-memory-note" :depth="3">
        {{ t("settings.viewHierarchyNote") }}
      </n-text>
    </n-card>
    <n-card v-if="showsDisplay" class="set-item">
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
    <n-card v-if="showsDisplay" class="set-item">
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
    <n-card v-if="showsCategories" class="set-item full">
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
              v-for="cat in categories"
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
    <n-h6 v-if="showsMisc" id="settings-misc" prefix="bar">
      {{ t("settings.miscSection") }}
    </n-h6>
    <n-card v-if="showsMisc" class="set-item full">
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
          <n-button size="small" secondary strong @click="openConsentSettings">
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
    <n-card v-if="showsMisc" class="set-item">
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
    <n-card v-if="showsMisc" class="set-item">
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
    <n-card v-if="showsMisc" class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">{{ t("settings.clearCache") }}</n-text>
          <n-text class="tip" :depth="3">
            {{
              t("settings.clearCacheTip", {
                version: cacheVersion,
              })
            }}
          </n-text>
        </div>
        <n-button @click="clearCache" type="warning" ghost>
          {{ t("settings.clearCacheAction") }}
        </n-button>
      </div>
    </n-card>
    <n-card v-if="showsMisc" class="set-item">
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
    <n-card v-if="showsMisc" class="set-item">
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
import { useOsTheme } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { buildFixedLocalePath, getCategoryLabel } from "@/utils/locale";

const props = defineProps({
  embedded: { type: Boolean, default: false },
  section: {
    type: String,
    default: "all",
    validator: (value) =>
      ["all", "display", "categories", "misc"].includes(value),
  },
});
const embedded = computed(() => props.embedded);
const showsDisplay = computed(() =>
  ["all", "display"].includes(props.section),
);
const showsCategories = computed(() =>
  ["all", "categories"].includes(props.section),
);
const showsMisc = computed(() => ["all", "misc"].includes(props.section));
const store = mainStore();
const osThemeRef = useOsTheme();
const router = useRouter();
const { t, locale } = useI18n({ useScope: "global" });
const {
  siteTheme,
  siteThemeAuto,
  linkOpenType,
  headerFixed,
  compactMode,
  showPinnedRankings,
  categoryViewMode,
  listFontSize,
  autoRefreshEnabled,
  autoRefreshInterval,
  showImages,
  categoryEnabled,
  activeCategory,
} = storeToRefs(store);
const categories = computed(() =>
  store.categories.slice().sort((a, b) => a.order - b.order),
);
const newCategory = ref("");
const cacheVersion = ref(getCacheVersion());
const getCategoryDisplayName = (category) =>
  category?.builtin
    ? getCategoryLabel(category.name, locale.value)
    : category?.name || "";
const importFileRef = ref(null);
const isAnalyticsPanelVisible = !import.meta.env.PROD;
const persistedKeys = [
  "siteTheme",
  "siteThemeAuto",
  "newsArr",
  "linkOpenType",
  "headerFixed",
  "compactMode",
  "showPinnedRankings",
  "categoryViewMode",
  "categoryViewPerCategory",
  "categoryViewModes",
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
const appearanceMode = computed(() =>
  siteThemeAuto.value ? "auto" : siteTheme.value,
);
const themeOptions = computed(() => [
  {
    label: t("settings.themeAutoOption"),
    value: "auto",
  },
  {
    label: t("settings.themeLight"),
    value: "light",
  },
  {
    label: t("settings.themeDark"),
    value: "dark",
  },
]);
const setAppearanceMode = (mode) => {
  store.setAppearanceMode(mode, osThemeRef.value);
};
const globalViewLabel = computed(() =>
  categoryViewMode.value === "stream"
    ? t("settings.categoryViewStream")
    : t("settings.categoryViewCard"),
);

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
  { immediate: true },
);

watch(
  () => categoryEnabled.value,
  (val) => {
    if (!val) {
      activeCategory.value = "全部";
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.setting {
  --settings-panel: oklch(0.955 0.005 285);
  --settings-hover: oklch(0.935 0.006 285);
  --settings-text: oklch(0.27 0.008 285);
  --settings-muted: oklch(0.52 0.008 285);
  --settings-stroke: oklch(0.36 0.008 285 / 15%);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }

  &.is-dark {
    --settings-panel: oklch(0.235 0.009 285);
    --settings-hover: oklch(0.265 0.01 285);
    --settings-text: oklch(0.9 0.006 285);
    --settings-muted: oklch(0.67 0.008 285);
    --settings-stroke: oklch(0.86 0.006 285 / 13%);
  }

  &.embedded {
    padding: 2px;
    align-content: start;
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

      .appearance-segmented {
        display: grid;
        grid-template-columns: repeat(3, minmax(72px, 1fr));
        min-width: min(100%, 300px);
        overflow: hidden;
        border: 1px solid var(--n-border-color);
        border-radius: 10px;
        background: var(--n-action-color);

        button {
          appearance: none;
          min-height: 36px;
          padding: 0 14px;
          border: 0;
          border-right: 1px solid var(--n-border-color);
          background: transparent;
          color: var(--n-text-color-2);
          font: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;

          &:last-child {
            border-right: 0;
          }

          &:hover,
          &.active {
            color: var(--n-text-color);
            background: color-mix(
              in srgb,
              var(--n-primary-color) 12%,
              transparent
            );
          }

          &.active {
            box-shadow: inset 0 0 0 1px
              color-mix(in srgb, var(--n-primary-color) 68%, transparent);
          }
        }
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

    &.view-memory-setting {
      .view-memory-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .view-memory-flow {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 14px;
        overflow-x: auto;
        padding-bottom: 2px;

        span {
          flex: 0 0 auto;
          padding: 7px 10px;
          border: 1px solid var(--n-border-color);
          border-radius: 8px;
          background: var(--n-action-color);
          color: var(--n-text-color-2);
          font-size: 12px;
          font-weight: 600;
        }

        i {
          color: var(--n-text-color-3);
          font-size: 11px;
          font-style: normal;
        }
      }

      .view-memory-note {
        display: block;
        margin-top: 10px;
        font-size: 12px;
        line-height: 1.6;
      }
    }

  }
}
</style>
