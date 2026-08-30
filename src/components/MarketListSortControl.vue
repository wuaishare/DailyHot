<template>
  <n-dropdown trigger="click" :options="options" @select="selectMode">
    <span class="market-sort-trigger" @click.stop>
      <n-button
        size="tiny"
        secondary
        strong
        :round="compact"
        :type="activeMode !== MARKET_SORT_MODES.RANK ? 'primary' : 'default'"
        :aria-label="`${t('hotList.marketSort')}：${activeLabel}`"
        :title="`${t('hotList.marketSort')}：${activeLabel}`"
      >
        <template #icon>
          <n-icon :component="SortOne" />
        </template>
        <span v-if="!compact">{{ t("hotList.marketSort") }}：{{ activeLabel }}</span>
        <span v-else-if="showStateLabel">{{ activeLabel }}</span>
      </n-button>
    </span>
  </n-dropdown>
</template>

<script setup>
import { SortOne } from "@icon-park/vue-next";
import { useI18n } from "vue-i18n";
import {
  MARKET_SORT_MODES,
  getMarketListActivityKind,
  marketListSortModes,
  readMarketListSortMode,
  saveMarketListSortMode,
} from "@/utils/marketListSort";

const props = defineProps({
  source: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: true,
  },
  showStateLabel: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({ useScope: "global" });

const activeMode = computed(() => {
  readMarketListSortMode(props.source);
  return marketListSortModes[props.source] || MARKET_SORT_MODES.RANK;
});

const activityLabel = computed(() =>
  getMarketListActivityKind(props.source) === "volume"
    ? t("hotList.marketSortVolume")
    : t("hotList.marketSortAmount")
);

const options = computed(() => [
  { key: MARKET_SORT_MODES.RANK, label: t("hotList.marketSortRank") },
  { key: MARKET_SORT_MODES.GAIN, label: t("hotList.marketSortGain") },
  { key: MARKET_SORT_MODES.LOSS, label: t("hotList.marketSortLoss") },
  { key: MARKET_SORT_MODES.ACTIVITY, label: activityLabel.value },
]);

const activeLabel = computed(
  () => options.value.find((item) => item.key === activeMode.value)?.label || t("hotList.marketSortRank")
);

const selectMode = (mode) => saveMarketListSortMode(props.source, mode);
</script>

<style scoped>
.market-sort-trigger {
  display: inline-flex;
}
</style>
