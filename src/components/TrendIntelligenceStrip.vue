<template>
  <section v-if="sections.length" class="trend-pulse" :aria-label="copy.title">
    <header class="trend-pulse__head">
      <div>
        <strong>{{ copy.title }}</strong>
        <span>{{ copy.subtitle }}</span>
      </div>
      <p>
        <span v-if="sourceLabel">{{ sourceLabel }}</span>
        <span>{{ windowLabel }}</span>
        <span :class="'is-' + qualityGrade">{{ qualityLabel }}</span>
      </p>
    </header>

    <div class="trend-pulse__grid">
      <section
        v-for="section in sections"
        :key="section.key"
        class="trend-pulse__group"
      >
        <header>
          <span>{{ section.icon }}</span>
          <strong>{{ section.label }}</strong>
        </header>
        <a
          v-for="item in section.items"
          :key="section.key + '-' + (item.itemKey || item.title)"
          class="trend-pulse__item"
          :href="item.url || '#'"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="trend-pulse__title">{{ item.title }}</span>
          <small>{{ metricFor(section.key, item) }}</small>
        </a>
      </section>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, default: null },
  locale: { type: String, default: "zh-CN" },
  sourceLabel: { type: String, default: "" },
});

const COPY = {
  "zh-CN": {
    title: "热度变化",
    subtitle: "看看什么正在升温、冲顶、降温或重新上榜",
    quality: { high: "数据完整", medium: "数据较完整", low: "数据有限", unknown: "数据状态未知" },
    groups: {
      warming: { label: "正在升温", icon: "↗" },
      peak: { label: "冲到高位", icon: "↑" },
      cooling: { label: "正在降温", icon: "↘" },
      reentry: { label: "再次翻红", icon: "↺" },
    },
    rankUp: (n, rank) => "升 " + n + " 位 · 当前 #" + rank,
    rankDown: (n, rank) => "降 " + n + " 位 · 当前 #" + rank,
    currentRank: (rank) => "当前 #" + rank,
    peakHold: (rank, duration) => "当前 #" + rank + " · 高位持续 " + duration,
    reentry: (duration, rank) => "离榜 " + duration + " 后重回 · 当前 #" + rank,
  },
  en: {
    title: "Heat movement",
    subtitle: "See what is rising, peaking, cooling or returning",
    quality: { high: "complete data", medium: "mostly complete", low: "limited data", unknown: "unknown coverage" },
    groups: {
      warming: { label: "Heating up", icon: "↗" },
      peak: { label: "Near the top", icon: "↑" },
      cooling: { label: "Cooling down", icon: "↘" },
      reentry: { label: "Back again", icon: "↺" },
    },
    rankUp: (n, rank) => "up " + n + " · now #" + rank,
    rankDown: (n, rank) => "down " + n + " · now #" + rank,
    currentRank: (rank) => "now #" + rank,
    peakHold: (rank, duration) => "now #" + rank + " · high for " + duration,
    reentry: (duration, rank) => "back after " + duration + " · now #" + rank,
  },
  "zh-TW": {
    title: "熱度變化",
    subtitle: "看看什麼正在升溫、衝頂、降溫或重新上榜",
    quality: { high: "資料完整", medium: "資料較完整", low: "資料有限", unknown: "資料狀態未知" },
    groups: {
      warming: { label: "正在升溫", icon: "↗" },
      peak: { label: "衝到高位", icon: "↑" },
      cooling: { label: "正在降溫", icon: "↘" },
      reentry: { label: "再次翻紅", icon: "↺" },
    },
    rankUp: (n, rank) => "升 " + n + " 位 · 目前 #" + rank,
    rankDown: (n, rank) => "降 " + n + " 位 · 目前 #" + rank,
    currentRank: (rank) => "目前 #" + rank,
    peakHold: (rank, duration) => "目前 #" + rank + " · 高位持續 " + duration,
    reentry: (duration, rank) => "離榜 " + duration + " 後重回 · 目前 #" + rank,
  },
  ja: {
    title: "注目度の変化",
    subtitle: "上昇・上位到達・下降・再浮上をひと目で確認",
    quality: { high: "データ良好", medium: "データ概ね良好", low: "データ限定", unknown: "データ状態不明" },
    groups: {
      warming: { label: "上昇中", icon: "↗" },
      peak: { label: "上位到達", icon: "↑" },
      cooling: { label: "下降中", icon: "↘" },
      reentry: { label: "再浮上", icon: "↺" },
    },
    rankUp: (n, rank) => n + "位上昇 · 現在 #" + rank,
    rankDown: (n, rank) => n + "位下降 · 現在 #" + rank,
    currentRank: (rank) => "現在 #" + rank,
    peakHold: (rank, duration) => "現在 #" + rank + " · 上位 " + duration,
    reentry: (duration, rank) => duration + "ぶりに再登場 · 現在 #" + rank,
  },
  ko: {
    title: "열기 변화",
    subtitle: "상승·상위권·하락·재진입 흐름을 한눈에 확인",
    quality: { high: "데이터 양호", medium: "데이터 대체로 양호", low: "데이터 제한", unknown: "데이터 상태 알 수 없음" },
    groups: {
      warming: { label: "상승 중", icon: "↗" },
      peak: { label: "상위권", icon: "↑" },
      cooling: { label: "하락 중", icon: "↘" },
      reentry: { label: "재진입", icon: "↺" },
    },
    rankUp: (n, rank) => n + "계단 상승 · 현재 #" + rank,
    rankDown: (n, rank) => n + "계단 하락 · 현재 #" + rank,
    currentRank: (rank) => "현재 #" + rank,
    peakHold: (rank, duration) => "현재 #" + rank + " · 상위권 " + duration,
    reentry: (duration, rank) => duration + " 뒤 재진입 · 현재 #" + rank,
  },
};

const copy = computed(() => COPY[props.locale] || COPY["zh-CN"]);
const signals = computed(() => props.data?.signals || {});
const windowLabel = computed(() => props.data?.window?.key || "24h");
const qualityGrade = computed(() => props.data?.evidenceQuality?.grade || "unknown");
const qualityLabel = computed(
  () => copy.value.quality[qualityGrade.value] || copy.value.quality.unknown,
);

const take = (key, count = 2) =>
  (Array.isArray(signals.value[key]) ? signals.value[key] : []).slice(0, count);

const sections = computed(() => {
  const candidates = [
    {
      key: "warming",
      ...copy.value.groups.warming,
      items: take("positiveMomentum").length
        ? take("positiveMomentum")
        : take("fastestRisers"),
    },
    {
      key: "peak",
      ...copy.value.groups.peak,
      items: take("currentPeaks").length
        ? take("currentPeaks")
        : take("sustainedPeaks"),
    },
    {
      key: "cooling",
      ...copy.value.groups.cooling,
      items: take("negativeMomentum").length
        ? take("negativeMomentum")
        : take("decelerating"),
    },
    {
      key: "reentry",
      ...copy.value.groups.reentry,
      items: take("reentries"),
    },
  ];
  return candidates.filter((section) => section.items.length);
});

const formatDuration = (seconds) => {
  const value = Number(seconds || 0);
  if (!value) return props.locale === "en" ? "a while" : "一段时间";
  if (value < 3600) {
    const minutes = Math.max(1, Math.round(value / 60));
    if (props.locale === "en") return minutes + "m";
    if (props.locale === "ja") return minutes + "分";
    if (props.locale === "ko") return minutes + "분";
    return minutes + " 分钟";
  }
  const hours = Math.max(1, Math.round(value / 3600));
  if (props.locale === "en") return hours + "h";
  if (props.locale === "ja") return hours + "時間";
  if (props.locale === "ko") return hours + "시간";
  return hours + " 小时";
};

const metricFor = (key, item) => {
  const rank = Number(item?.currentRank || item?.bestRank || 0);
  const delta = Number(item?.rankDelta || 0);
  if (key === "warming") {
    return delta > 0
      ? copy.value.rankUp(delta, rank)
      : copy.value.currentRank(rank);
  }
  if (key === "cooling") {
    return delta < 0
      ? copy.value.rankDown(Math.abs(delta), rank)
      : copy.value.currentRank(rank);
  }
  if (key === "peak") {
    return item?.peakHoldSpanSeconds
      ? copy.value.peakHold(rank, formatDuration(item.peakHoldSpanSeconds))
      : copy.value.currentRank(rank);
  }
  if (key === "reentry") {
    return copy.value.reentry(formatDuration(item?.absenceSpanSeconds), rank);
  }
  return copy.value.currentRank(rank);
};
</script>

<style scoped>
.trend-pulse {
  display: grid;
  gap: 10px;
  margin: 2px 0 12px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 82%, transparent);
  border-radius: 12px;
  background: var(--n-action-color, rgba(127, 127, 127, 0.04));
}
.trend-pulse__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}
.trend-pulse__head > div {
  display: grid;
  gap: 2px;
}
.trend-pulse__head strong {
  color: var(--n-text-color);
  font-size: 13px;
  font-weight: 760;
}
.trend-pulse__head > div > span {
  color: var(--n-text-color-3);
  font-size: 10px;
}
.trend-pulse__head p {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
  margin: 0;
  color: var(--n-text-color-3);
  font-size: 9px;
}
.trend-pulse__head p span {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--n-color);
}
.trend-pulse__head p .is-high {
  color: var(--n-success-color, #18a058);
}
.trend-pulse__head p .is-medium {
  color: var(--n-warning-color, #f0a020);
}
.trend-pulse__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
}
.trend-pulse__group {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
  padding: 8px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 68%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--n-color) 84%, transparent);
}
.trend-pulse__group > header {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--n-text-color-2);
}
.trend-pulse__group > header > span {
  color: var(--n-primary-color);
  font-size: 13px;
  font-weight: 800;
}
.trend-pulse__group > header strong {
  font-size: 10px;
  font-weight: 760;
}
.trend-pulse__item {
  display: grid;
  gap: 2px;
  min-width: 0;
  padding-top: 5px;
  border-top: 1px solid color-mix(in srgb, var(--n-border-color) 52%, transparent);
  text-decoration: none;
}
.trend-pulse__title {
  overflow: hidden;
  color: var(--n-text-color);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.trend-pulse__item small {
  color: var(--n-text-color-3);
  font-size: 9px;
}
.trend-pulse__item:hover .trend-pulse__title {
  color: var(--n-primary-color);
}

@media (max-width: 900px) {
  .trend-pulse__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .trend-pulse__head {
    align-items: flex-start;
    flex-direction: column;
  }
  .trend-pulse__head p {
    justify-content: flex-start;
  }
  .trend-pulse__grid {
    grid-template-columns: 1fr;
  }
}
</style>
