<template>
  <div class="market-quote-table-wrap">
    <div class="market-quote-table" role="table" :aria-label="ariaLabel">
      <div class="table-row table-head" role="row">
        <div role="columnheader">{{ t("globalIndexTable.name") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.last") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.changeRate") }}</div>
        <div role="columnheader" class="numeric">{{ metricHeader }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.previousClose") }}</div>
        <div role="columnheader" class="time">{{ t("globalIndexTable.time") }}</div>
      </div>
      <a
        v-for="(item, index) in items"
        :key="item.id || item.url || index"
        class="table-row table-body-row"
        role="row"
        :href="item.url || item.mobileUrl"
        :target="linkTarget"
        rel="noopener noreferrer nofollow"
        :title="itemTitle(item)"
        @click="$emit('item-click', item, index)"
      >
        <div class="name-cell" role="cell">
          <strong>{{ item.displayTitle || item.title }}</strong>
          <span>{{ item.extra?.code }}</span>
        </div>        <div class="numeric primary-value" role="cell">{{ quoteFor(item)?.price || "—" }}</div>
        <div class="numeric change-rate" :class="toneClass(item)" role="cell">
          {{ quoteFor(item)?.change || "—" }}
        </div>
        <div class="numeric" role="cell">{{ quoteFor(item)?.metric || "—" }}</div>
        <div class="numeric" role="cell">{{ formatPreviousClose(item) }}</div>
        <div class="time" role="cell">{{ formatTimestamp(item.timestamp) }}</div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { getMarketQuoteView } from "@/utils/marketQuote";

const props = defineProps({
  items: { type: Array, default: () => [] },
  linkTarget: { type: String, default: "_blank" },
  ariaLabel: { type: String, default: "" },
});

defineEmits(["item-click"]);

const { locale, t } = useI18n({ useScope: "global" });

const quoteFor = (item) => item?.marketQuote || getMarketQuoteView(item, locale.value);const metricHeader = computed(() => quoteFor(props.items[0])?.metricLabel || "—");

const currencyPrefix = (item) => {
  const currency = String(item?.extra?.currency || "").toUpperCase();
  if (currency === "HKD") return "HK$";
  if (currency === "USD") return "$";
  if (currency === "CNY") return "CN¥";
  if (currency === "TWD") return "NT$";
  if (currency === "INR") return "₹";
  if (currency === "AUD") return "A$";
  return "";
};

const formatPreviousClose = (item) => {
  const value = Number(item?.extra?.previousClose);
  if (!Number.isFinite(value) || value <= 0) return "—";
  try {
    return `${currencyPrefix(item)}${new Intl.NumberFormat(locale.value || "zh-CN", {
      maximumFractionDigits: 3,
    }).format(value)}`;
  } catch {
    return `${currencyPrefix(item)}${value}`;
  }
};

const formatTimestamp = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "—";
  try {    return new Intl.DateTimeFormat(locale.value || "zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
  } catch {
    return "—";
  }
};

const toneClass = (item) => {
  const rate = Number(item?.extra?.changeRate);
  if (!Number.isFinite(rate) || rate === 0) return "is-flat";
  const redUp = item?.extra?.colorConvention !== "greenUp";
  const positive = rate > 0;
  return positive === redUp ? "is-red" : "is-green";
};

const itemTitle = (item) =>
  [item?.displayTitle || item?.title, item?.extra?.code, quoteFor(item)?.change]
    .filter(Boolean)
    .join(" · ");
</script>

<style scoped>.market-quote-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.market-quote-table {
  min-width: 760px;
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.table-row {
  display: grid;
  grid-template-columns: minmax(200px, 1.7fr) repeat(4, minmax(100px, 0.8fr)) minmax(112px, 0.9fr);
  gap: 12px;
  align-items: center;
}

.table-head {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 14px;
  color: var(--n-text-color-3);
  background: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);  font-size: 12px;
  font-weight: 600;
}

.table-body-row {
  padding: 13px 14px;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--n-border-color);
  transition: background-color 0.16s ease;
}

.table-body-row:hover {
  background: var(--n-merged-color-hover, rgba(128, 128, 128, 0.06));
}

.name-cell {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--n-color);
}

.table-head > :first-child {  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--n-color);
}

.table-body-row:hover .name-cell {
  background: var(--n-merged-color-hover, var(--n-color));
}

.name-cell strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.name-cell span,
.time {
  color: var(--n-text-color-3);
  font-size: 12px;
}

.numeric {
  text-align: right;
}

.primary-value,
.change-rate {
  font-weight: 600;
}
.is-red { color: #f0444f; }
.is-green { color: #0aa35c; }
.is-flat { color: var(--n-text-color-2); }

@media (max-width: 740px) {
  .market-quote-table {
    min-width: 720px;
  }

  .table-row {
    grid-template-columns: minmax(170px, 1.5fr) repeat(4, 92px) 104px;
    gap: 10px;
  }
}
</style>