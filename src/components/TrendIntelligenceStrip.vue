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
        :class="`is-${item.trend.signal}`"
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
    title: "榜位趋势",
    subtitle: "仅比较同一榜单约 1 小时前后的名次，不跨平台混算",
    changed: "条显著榜位变化",
    signals: {
      reentry: ["↺", "重新上榜"], breakthrough: ["↑", "进入前十"],
      rising: ["↗", "榜位上升"], falling: ["↘", "榜位下降"], new: ["+", "新上榜"],
    },
    support: (n) => `${n}个平台同向`,
    rank: (rank) => `当前 #${rank}`,
  },
  en: {
    title: "Ranking movement", subtitle: "Same-board ranks about 1h apart; no cross-platform heat mixing",
    changed: "material rank changes",
    signals: { reentry: ["↺", "Re-entered"], breakthrough: ["↑", "Entered top 10"], rising: ["↗", "Rank up"], falling: ["↘", "Rank down"], new: ["+", "New entry"] },
    support: (n) => `${n} sources aligned`, rank: (rank) => `now #${rank}`,
  },
  "zh-TW": {
    title: "榜位趨勢", subtitle: "僅比較同一榜單約 1 小時前後的名次，不跨平台混算", changed: "筆顯著榜位變化",
    signals: { reentry: ["↺", "重新上榜"], breakthrough: ["↑", "進入前十"], rising: ["↗", "榜位上升"], falling: ["↘", "榜位下降"], new: ["+", "新上榜"] },
    support: (n) => `${n}個平台同向`, rank: (rank) => `目前 #${rank}`,
  },
  ja: {
    title: "順位トレンド", subtitle: "同じランキングの約1時間前後だけを比較し、プラットフォーム間の熱度は混在させません", changed: "件の有意な順位変動",
    signals: { reentry: ["↺", "再ランクイン"], breakthrough: ["↑", "トップ10入り"], rising: ["↗", "順位上昇"], falling: ["↘", "順位下降"], new: ["+", "新規ランクイン"] },
    support: (n) => `${n}プラットフォーム同方向`, rank: (rank) => `現在 #${rank}`,
  },
  ko: {
    title: "순위 추세", subtitle: "같은 랭킹의 약 1시간 전후 순위만 비교하며 플랫폼 간 열기는 혼합하지 않습니다", changed: "건의 유의미한 순위 변화",
    signals: { reentry: ["↺", "재진입"], breakthrough: ["↑", "TOP 10 진입"], rising: ["↗", "순위 상승"], falling: ["↘", "순위 하락"], new: ["+", "신규 진입"] },
    support: (n) => `${n}개 플랫폼 동일 방향`, rank: (rank) => `현재 #${rank}`,
  },
};

const copy = computed(() => COPY[props.locale] || COPY["zh-CN"]);
const visibleItems = computed(() => props.items.slice(0, 6));
const windowLabel = computed(() => {
  const seconds = Number(props.windowSeconds || 3600);
  if (seconds === 3600) return props.locale === "en" ? "~1h" : props.locale === "ja" ? "約1時間" : props.locale === "ko" ? "약 1시간" : props.locale === "zh-TW" ? "約 1 小時" : "约 1 小时";
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
  const supportCount = Number(trend?.supportingSourceCount || 0);
  const support = supportCount > 1 ? copy.value.support(supportCount) : "";
  return [source, trend?.variantLabel, support].filter(Boolean).join(" · ");
};
const metricFor = (trend) => {
  const rank = Number(trend?.currentRank || 0);
  const baselineRank = Number(trend?.baselineRank || 0);
  if (
    !["reentry", "new"].includes(trend?.signal) &&
    Number.isFinite(baselineRank) && baselineRank > 0 &&
    Number.isFinite(rank) && rank > 0
  ) return `#${baselineRank} → #${rank}`;
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

.trend-card__signal {
  padding: 2px 5px;
  border-radius: 999px;
  border: 1px solid transparent;
}
.trend-card.is-breakthrough { --trend-tone: #e5484d; }
.trend-card.is-rising { --trend-tone: #d97706; }
.trend-card.is-reentry { --trend-tone: #7c5ce7; }
.trend-card.is-new { --trend-tone: #18a058; }
.trend-card.is-falling { --trend-tone: #5f7892; }
.trend-card[class*="is-"] .trend-card__signal {
  border-color: color-mix(in srgb, var(--trend-tone) 30%, transparent);
  background: color-mix(in srgb, var(--trend-tone) 10%, transparent);
  color: var(--trend-tone);
}
.trend-card[class*="is-"] > small em {
  color: var(--trend-tone);
  font-weight: 700;
}
@media (max-width: 720px) { .trend-strip { margin-right: -13px; border-right: 0; border-radius: 10px 0 0 10px; } .trend-strip__head { padding-right: 13px; } .trend-strip__head small { display: none; } .trend-strip__rail { padding-right: 13px; } .trend-card { flex-basis: 190px; } }
</style>
