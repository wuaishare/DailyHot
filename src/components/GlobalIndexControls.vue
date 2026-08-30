<template>
  <n-space class="global-index-controls" :size="6">
    <n-popover
      trigger="click"
      placement="top-end"
      :show-arrow="false"
      @update:show="handleSortShow"
    >
      <template #trigger>
        <span class="control-trigger" @click.stop>
          <n-button
            size="tiny"
            secondary
            strong
            round
            :aria-label="t('hotList.indexSort')"
            :title="t('hotList.indexSort')"
            :type="globalIndexSortMode !== GLOBAL_INDEX_SORT_MODES.GAIN ? 'primary' : 'default'"
          >
            <template #icon>
              <n-icon :component="SortOne" />
            </template>
          </n-button>
        </span>
      </template>
      <div class="preference-panel sort-panel" @click.stop>
        <div class="panel-heading">
          <strong>{{ t("hotList.indexSort") }}</strong>
          <span>{{ t("hotList.indexSortTip") }}</span>
        </div>
        <div class="sort-modes">
          <n-button
            v-for="option in sortOptions"
            :key="option.value"
            size="small"
            :type="globalIndexSortMode === option.value ? 'primary' : 'default'"
            :secondary="globalIndexSortMode !== option.value"
            @click.stop="selectSortMode(option.value)"
          >
            {{ option.label }}
          </n-button>
        </div>
        <template v-if="globalIndexSortMode === GLOBAL_INDEX_SORT_MODES.CUSTOM">
          <div class="custom-order-heading">
            {{ t("hotList.indexCustomOrderTip") }}
          </div>
          <draggable
            v-model="orderDraft"
            class="index-order-list"
            item-key="id"
            handle=".index-order-handle"
            :animation="160"
            :fallback-tolerance="6"
            :touch-start-threshold="6"
            @end="saveCustomOrder"
          >
            <template #item="{ element }">
              <div class="index-order-item">
                <span
                  class="index-order-handle"
                  role="button"
                  :aria-label="t('hotList.dragSort')"
                >
                  <n-icon :component="Drag" />
                </span>
                <span class="index-order-title">{{ element.title }}</span>
                <span class="index-order-code">{{ element.extra?.code }}</span>
              </div>
            </template>
          </draggable>
          <n-button size="tiny" quaternary class="panel-reset" @click.stop="restoreCustomOrder">
            {{ t("hotList.indexOrderReset") }}
          </n-button>
        </template>
      </div>
    </n-popover>

    <n-popover
      trigger="click"
      placement="top-end"
      :show-arrow="false"
    >
      <template #trigger>
        <span class="control-trigger" @click.stop>
          <n-button
            size="tiny"
            secondary
            strong
            round
            :aria-label="t('hotList.indexRegionFilter')"
            :title="t('hotList.indexRegionFilter')"
            :type="globalIndexExcludedRegions.length ? 'primary' : 'default'"
          >
            <template #icon>
              <n-icon :component="Filter" />
            </template>
          </n-button>
        </span>
      </template>
      <div class="preference-panel filter-panel" @click.stop>
        <div class="panel-heading">
          <strong>{{ t("hotList.indexRegionFilter") }}</strong>
          <span>{{ t("hotList.indexRegionFilterTip") }}</span>
        </div>
        <div class="filter-actions">
          <n-button size="tiny" secondary @click.stop="selectAllRegions">
            {{ t("hotList.indexRegionSelectAll") }}
          </n-button>
          <n-button size="tiny" secondary @click.stop="clearAllRegions">
            {{ t("hotList.indexRegionClearAll") }}
          </n-button>
        </div>
        <div class="region-list">
          <n-checkbox
            v-for="option in regionOptions"
            :key="option.code"
            class="region-option"
            :checked="!globalIndexExcludedRegions.includes(option.code)"
            @update:checked="(checked) => toggleRegion(option.code, checked)"
          >
            {{ option.label }}
          </n-checkbox>
        </div>
        <div class="filter-summary">
          {{ t("hotList.indexRegionSelected", { selected: selectedRegionCount, total: regionOptions.length }) }}
        </div>
      </div>
    </n-popover>
  </n-space>
</template>

<script setup>
import { Drag, Filter, SortOne } from "@icon-park/vue-next";
import draggable from "vuedraggable";
import { useI18n } from "vue-i18n";
import {
  GLOBAL_INDEX_SORT_MODES,
  applyGlobalIndexPreferences,
  globalIndexCustomOrder,
  globalIndexExcludedRegions,
  globalIndexSortMode,
  resetGlobalIndexOrder,
  saveGlobalIndexExcludedRegions,
  saveGlobalIndexOrder,
  saveGlobalIndexSortMode,
} from "@/utils/globalIndexOrder";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n({ useScope: "global" });
const orderDraft = ref([]);

const sortOptions = computed(() => [
  { value: GLOBAL_INDEX_SORT_MODES.GAIN, label: t("hotList.indexSortGain") },
  { value: GLOBAL_INDEX_SORT_MODES.IMPORTANCE, label: t("hotList.indexSortImportance") },
  { value: GLOBAL_INDEX_SORT_MODES.CUSTOM, label: t("hotList.indexSortCustom") },
]);

const regionCodeOrder = ["CN", "HK", "TW", "JP", "KR", "IN", "US", "UK", "FR", "DE", "EUROZONE"];
const regionOptions = computed(() => {
  const byCode = new Map();
  props.items.forEach((item) => {
    const code = String(item?.extra?.regionCode || "").trim();
    const label = String(item?.extra?.region || "").trim();
    if (code && label && !byCode.has(code)) byCode.set(code, label);
  });
  return [...byCode.entries()]
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => {
      const aRank = regionCodeOrder.indexOf(a.code);
      const bRank = regionCodeOrder.indexOf(b.code);
      return (aRank < 0 ? 999 : aRank) - (bRank < 0 ? 999 : bRank);
    });
});

const selectedRegionCount = computed(
  () => regionOptions.value.filter((item) => !globalIndexExcludedRegions.value.includes(item.code)).length
);

const syncOrderDraft = () => {
  orderDraft.value = applyGlobalIndexPreferences(props.items, {
    sortMode: GLOBAL_INDEX_SORT_MODES.CUSTOM,
    customIds: globalIndexCustomOrder.value,
    excludedRegions: [],
  }).map((item) => ({ ...item }));
};

const handleSortShow = (show) => {
  if (show) syncOrderDraft();
};

const selectSortMode = (mode) => {
  saveGlobalIndexSortMode(mode);
  if (mode === GLOBAL_INDEX_SORT_MODES.CUSTOM) syncOrderDraft();
};

const saveCustomOrder = () => {
  saveGlobalIndexOrder(orderDraft.value.map((item) => item?.id).filter(Boolean));
  saveGlobalIndexSortMode(GLOBAL_INDEX_SORT_MODES.CUSTOM);
  $message.success(t("hotList.indexOrderSaved"));
};

const restoreCustomOrder = () => {
  resetGlobalIndexOrder();
  saveGlobalIndexSortMode(GLOBAL_INDEX_SORT_MODES.IMPORTANCE);
  syncOrderDraft();
  $message.success(t("hotList.indexOrderResetDone"));
};

const toggleRegion = (code, checked) => {
  const excluded = new Set(globalIndexExcludedRegions.value);
  if (checked) excluded.delete(code);
  else excluded.add(code);
  saveGlobalIndexExcludedRegions([...excluded]);
};

const selectAllRegions = () => saveGlobalIndexExcludedRegions([]);
const clearAllRegions = () =>
  saveGlobalIndexExcludedRegions(regionOptions.value.map((item) => item.code));

watch(
  () => props.items.map((item) => item?.id).join("|"),
  () => syncOrderDraft()
);
</script>

<style lang="scss" scoped>
.global-index-controls {
  display: inline-flex;
  align-items: center;
}

.control-trigger {
  display: inline-flex;
}

.preference-panel {
  width: min(360px, calc(100vw - 32px));
  padding: 4px;
}

.panel-heading {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 10px;

  strong {
    font-size: 13px;
  }

  span {
    color: var(--n-text-color-3);
    font-size: 11px;
    line-height: 1.45;
  }
}

.sort-modes,
.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.custom-order-heading {
  margin: 12px 0 6px;
  color: var(--n-text-color-3);
  font-size: 11px;
}

.index-order-list {
  max-height: 330px;
  overflow-y: auto;
  padding-right: 4px;
}

.index-order-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-height: 32px;
  padding: 3px 4px;
  border-bottom: 1px solid var(--n-border-color);
}

.index-order-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: grab;
  touch-action: none;
  color: var(--n-text-color-3);
}

.index-order-title {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.index-order-code {
  color: var(--n-text-color-3);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.panel-reset {
  margin-top: 8px;
}

.filter-actions {
  margin-bottom: 10px;
}

.region-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 12px;
}

.region-option {
  min-width: 0;
  padding: 4px 2px;
  font-size: 12px;

  :deep(.n-checkbox__label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.filter-summary {
  margin-top: 8px;
  color: var(--n-text-color-3);
  font-size: 11px;
}
</style>
