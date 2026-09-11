<template>
  <section v-if="visibleItems.length" class="trend-strip" :aria-label="copy.title">
    <header class="trend-strip__head">
      <div>
        <strong>{{ copy.title }}</strong>
        <span>{{ windowLabel }} · {{ total }} {{ copy.changed }}</span>
      </div>
      <small>{{ copy.subtitle }}</small>
    </header>
    <div class="trend-strip__rail">
      <a
        v-for="item in visibleItems"
        :key="item.id"
        class="trend-card"
        :href="item.url || '#'"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="trend-card__signal" :class="`is-${item.trend.signal}`">
          <b aria-hidden="true">{{ signalFor(item.trend.signal).icon }}</b>
          {{ signalFor(item.trend.signal).label }}
        </span>
        <strong>{{ item.title }}</strong>
        <small>
          <span>{{ sourceFor(item.trend) }}</span>
          <em>{{ metricFor(item.trend) }}</em>
        </small>
      </a>
    </div>
  </section>
</template>

<script setup>
import { getSourceLabel } from "@/utils/sourceLabels";

const props = defineProps({
  items: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  windowSeconds: { type: Number, default: 3600 },
  locale: { type: String, default: "zh-CN" },
});

const COPY = {
  "zh-CN": {
    title: "热度变化",
    subtitle: "同一榜单内比较，不跨平台硬比热度",
    changed: "条有明显变化",
    signals: {
      reentry: ["↺", "再次翻红"], breakthrough: ["↑", "冲到高位"],
      rising: ["↗", "正在升温"], falling: ["↘", "正在降温"], new: ["+", "新上榜"],
    },
    up: (n, rank) => `升 ${n} 位 · #${rank}`,
    down: (n, rank) => `降 ${n} 位 · #${rank}`,
    rank: (rank) => `当前 #${rank}`,
  },
  en: {
    title: "Heat movement", subtitle: "Compared within each board, never across platforms",
    changed: "notable changes",
    signals: { reentry: ["↺", "Back again"], breakthrough: ["↑", "Top breakthrough"], rising: ["↗", "Heating up"], falling: ["↘", "Cooling down"], new: ["+", "New entry"] },
    up: (n, rank) => `up ${n} · #${rank}`, down: (n, rank) => `down ${n} · #${rank}`, rank: (rank) => `now #${rank}`,
  },
  "zh-TW": {
    title: "熱度變化", subtitle: "只比較同一榜單內變化，不跨平台硬比熱度", changed: "筆明顯變化",
    signals: { reentry: ["↺", "再次翻紅"], breakthrough: ["↑", "衝到高位"], rising: ["↗", "正在升溫"], falling: ["↘", "正在降溫"], new: ["+", "新上榜"] },
    up: (n, rank) => `升 ${n} 位 · #${rank}`, down: (n, rank) => `降 ${n} 位 · #${rank}`, rank: (rank) => `目前 #${rank}`,
  },
  ja: {
    title: "注目度の変化", subtitle: "各ランキング内だけで比較し、平台間の熱度は直接比較しません", changed: "件の変化",
    signals: { reentry: ["↺", "再浮上"], breakthrough: ["↑", "上位到達"], rising: ["↗", "上昇中"], falling: ["↘", "下降中"], new: ["+", "新登場"] },
    up: (n, rank) => `${n}位上昇 · #${rank}`, down: (n, rank) => `${n}位下降 · #${rank}`, rank: (rank) => `現在 #${rank}`,
  },
  ko: {
    title: "열기 변화", subtitle: "각 랭킹 안에서만 비교하며 플랫폼 간 열기는 직접 비교하지 않습니다", changed: "건 변화",
    signals: { reentry: ["↺", "재진입"], breakthrough: ["↑", "상위권 진입"], rising: ["↗", "상승 중"], falling: ["↘", "하락 중"], new: ["+", "신규 진입"] },
    up: (n, rank) => `${n}계단 상승 · #${rank}`, down: (n, rank) => `${n}계단 하락 · #${rank}`, rank: (rank) => `현재 #${rank}`,
  },
};

const copy = computed(() => COPY[props.locale] || COPY["zh-CN"]);
const visibleItems = computed(() => props.items.slice(0, 6));
const windowLabel = computed(() => {
  const seconds = Number(props.windowSeconds || 3600);
  if (seconds === 3600) return props.locale === "en" ? "1h" : props.locale === "ja" ? "1時間" : props.locale === "ko" ? "1시간" : "近 1 小时";
  return `${Math.max(1, Math.round(seconds / 60))}m`;
});
const signalFor = (signal) => {
  const value = copy.value.signals[signal] || ["·", signal];
  return { icon: value[0], label: value[1] };
};
const sourceFor = (trend) => {
  const source = String(props.locale || "").startsWith("zh")
    ? trend?.sourceName || trend?.sourceKey || ""
    : getSourceLabel(trend?.sourceKey, props.locale, trend?.sourceName || trend?.sourceKey || "");
  return [source, trend?.variantLabel].filter(Boolean).join(" · ");
};
const metricFor = (trend) => {
  const delta = Number(trend?.rankDelta);
  const rank = Number(trend?.currentRank || 0);
  if (Number.isFinite(delta) && delta > 0) return copy.value.up(delta, rank);
  if (Number.isFinite(delta) && delta < 0) return copy.value.down(Math.abs(delta), rank);
  return copy.value.rank(rank);
};
</script>

<style scoped>
.trend-strip { display: grid; gap: 7px; margin: 0 0 10px; padding: 8px 9px; border: 1px solid var(--n-border-color); border-radius: 10px; background: var(--n-action-color, rgba(127, 127, 127, .035)); }
.trend-strip__head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; min-width: 0; }
.trend-strip__head > div { display: flex; align-items: baseline; gap: 7px; min-width: 0; }
.trend-strip__head strong { font-size: 12px; }
.trend-strip__head span, .trend-strip__head small { color: var(--n-text-color-3); font-size: 9px; }
.trend-strip__head small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trend-strip__rail { display: flex; gap: 6px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.trend-strip__rail::-webkit-scrollbar { display: none; }
.trend-card { flex: 1 0 178px; min-width: 0; max-width: 236px; padding: 7px 8px; border: 1px solid var(--n-border-color); border-radius: 8px; color: inherit; text-decoration: none; background: var(--n-color); }
.trend-card:hover, .trend-card:focus-visible { border-color: var(--n-text-color-3); outline: none; }
.trend-card__signal { display: inline-flex; align-items: center; gap: 3px; margin-bottom: 4px; font-size: 9px; font-weight: 700; }
.trend-card__signal b { font-size: 11px; }
.trend-card > strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; line-height: 1.35; }
.trend-card > small { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 4px; color: var(--n-text-color-3); font-size: 8px; }
.trend-card > small span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trend-card > small em { flex: 0 0 auto; color: var(--n-text-color-2); font-style: normal; }
@media (max-width: 720px) { .trend-strip { margin-right: -13px; border-right: 0; border-radius: 10px 0 0 10px; } .trend-strip__head { padding-right: 13px; } .trend-strip__head small { display: none; } .trend-strip__rail { padding-right: 13px; } .trend-card { flex-basis: 190px; } }
</style>
