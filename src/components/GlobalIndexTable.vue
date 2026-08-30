<template>
  <div class="global-index-table-wrap">
    <div class="global-index-table" role="table" :aria-label="t('globalIndexTable.ariaLabel')">
      <div class="table-row table-head" role="row">
        <div role="columnheader">{{ t("globalIndexTable.name") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.last") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.change") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.changeRate") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.high") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.low") }}</div>
        <div role="columnheader" class="numeric">{{ t("globalIndexTable.previousClose") }}</div>
        <div role="columnheader" class="time">{{ t("globalIndexTable.time") }}</div>
      </div>
      <a
        v-for="item in items"
        :key="item.id || item.url"
        class="table-row table-body-row"
        role="row"
        :href="item.url || item.mobileUrl"
        :target="linkTarget"
        rel="noopener noreferrer"
        :title="itemTitle(item)"
      >
        <div class="name-cell" role="cell">
          <strong>{{ item.title }}</strong>
          <span class="identity-row">
            <span class="index-code">{{ item.extra?.code }}</span>
            <span v-if="providerText(item)" class="provider-meta" :class="providerToneClass(item)">
              {{ providerText(item) }}
            </span>
          </span>
        </div>
        <div class="numeric primary-value" role="cell">{{ formatNumber(item.extra?.last) }}</div>
        <div class="numeric" :class="toneClass(item)" role="cell">{{ formatSigned(item.extra?.change) }}</div>
        <div class="numeric change-rate" :class="toneClass(item)" role="cell">{{ formatPercent(item.extra?.changeRate) }}</div>
        <div class="numeric" role="cell">{{ formatNumber(item.extra?.high) }}</div>
        <div class="numeric" role="cell">{{ formatNumber(item.extra?.low) }}</div>
        <div class="numeric" role="cell">{{ formatNumber(item.extra?.previousClose) }}</div>
        <div class="time" role="cell">{{ formatTimestamp(item.timestamp) }}</div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const props = defineProps({
  items: { type: Array, default: () => [] },
  linkTarget: { type: String, default: "_blank" },
});

const { locale, t } = useI18n({ useScope: "global" });

const formatter = (maximumFractionDigits = 2) =>
  new Intl.NumberFormat(locale.value || "zh-CN", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });

const formatNumber = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "—";
  return formatter(number >= 10000 ? 2 : 3).format(number);
};

const formatSigned = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const sign = number > 0 ? "+" : "";
  return `${sign}${formatter(Math.abs(number) >= 10000 ? 2 : 3).format(number)}`;
};

const formatPercent = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `${number > 0 ? "+" : ""}${number.toFixed(2)}%`;
};

const formatTimestamp = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "—";
  try {
    return new Intl.DateTimeFormat(locale.value || "zh-CN", {
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

const freshnessLabel = (value) => {
  if (value === "delayed") return t("globalIndexTable.delayed");
  if (value === "stale") return t("globalIndexTable.stale");
  if (value === "snapshot") return t("globalIndexTable.snapshot");
  return "";
};

const providerText = (item) => {
  const extra = item?.extra || {};
  const source = extra.sourceLabel || extra.primaryProvider || "";
  if (!source) return "";
  return [
    source,
    extra.sourceMode === "fallback" ? t("globalIndexTable.fallback") : "",
    freshnessLabel(extra.freshness),
  ]
    .filter(Boolean)
    .join(" · ");
};

const providerToneClass = (item) => {
  if (item?.extra?.sourceMode === "stale") return "is-stale";
  if (item?.extra?.sourceMode === "fallback") return "is-fallback";
  return "";
};

const itemTitle = (item) =>
  [item?.extra?.region, item?.title, item?.extra?.code, providerText(item)]
    .filter(Boolean)
    .join(" · ");
</script>

<style scoped>
.global-index-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.global-index-table {
  min-width: 920px;
  width: 100%;
  font-variant-numeric: tabular-nums;
}

.table-row {
  display: grid;
  grid-template-columns: minmax(190px, 1.7fr) repeat(6, minmax(86px, 0.8fr)) minmax(110px, 0.9fr);
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
  border-bottom: 1px solid var(--n-border-color);
  font-size: 12px;
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

.table-head > :first-child {
  position: sticky;
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

.identity-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.index-code {
  flex: 0 0 auto;
}

.provider-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.provider-meta.is-fallback,
.provider-meta.is-stale {
  font-weight: 600;
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
  .global-index-table {
    min-width: 860px;
  }

  .table-row {
    grid-template-columns: minmax(170px, 1.6fr) repeat(6, 82px) 104px;
    gap: 10px;
  }

  .table-body-row {
    padding-top: 11px;
    padding-bottom: 11px;
  }
}
</style>
