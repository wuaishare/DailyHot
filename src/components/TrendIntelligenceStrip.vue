<template>
  <section v-if="data" class="trend-intelligence" :aria-label="copy.title">
    <header class="trend-intelligence__head">
      <div>
        <span class="trend-intelligence__eyebrow">{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
      </div>
      <p>
        <span v-if="sourceLabel">{{ sourceLabel }}</span>
        <span>{{ windowLabel }}</span>
        <span v-if="denseLabel">{{ denseLabel }}</span>
        <span :class="`is-${qualityGrade}`">{{ qualityLabel }}</span>
      </p>
    </header>

    <div class="trend-intelligence__signals">
      <div
        v-for="signal in signalStats"
        :key="signal.key"
        class="trend-intelligence__signal"
      >
        <span>{{ signal.label }}</span>
        <strong>{{ signal.count }}</strong>
      </div>
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
    eyebrow: "DETERMINISTIC SIGNALS",
    title: "趋势智能",
    quality: "证据",
    dense: "近期密集证据",
    labels: {
      accelerating: "加速",
      decelerating: "减速",
      volatility: "波动",
      positiveMomentum: "正向动量",
      currentPeaks: "当前峰值",
      reentries: "重入",
    },
  },
  en: {
    eyebrow: "DETERMINISTIC SIGNALS",
    title: "Trend Intelligence",
    quality: "Evidence",
    dense: "dense recent evidence",
    labels: {
      accelerating: "Accelerating",
      decelerating: "Decelerating",
      volatility: "Volatility",
      positiveMomentum: "Momentum",
      currentPeaks: "At peak",
      reentries: "Re-entry",
    },
  },
  "zh-TW": {
    eyebrow: "DETERMINISTIC SIGNALS",
    title: "趨勢智能",
    quality: "證據",
    dense: "近期密集證據",
    labels: {
      accelerating: "加速",
      decelerating: "減速",
      volatility: "波動",
      positiveMomentum: "正向動量",
      currentPeaks: "目前峰值",
      reentries: "重入",
    },
  },  ja: {
    eyebrow: "DETERMINISTIC SIGNALS",
    title: "トレンドインテリジェンス",
    quality: "証拠",
    dense: "直近の高密度証拠",
    labels: {
      accelerating: "加速",
      decelerating: "減速",
      volatility: "変動",
      positiveMomentum: "上昇勢い",
      currentPeaks: "ピーク",
      reentries: "再浮上",
    },
  },
  ko: {
    eyebrow: "DETERMINISTIC SIGNALS",
    title: "트렌드 인텔리전스",
    quality: "근거",
    dense: "최근 고밀도 근거",
    labels: {
      accelerating: "가속",
      decelerating: "감속",
      volatility: "변동",
      positiveMomentum: "상승 모멘텀",
      currentPeaks: "현재 정점",
      reentries: "재진입",
    },
  },
};

const copy = computed(() => COPY[props.locale] || COPY["zh-CN"]);
const signals = computed(() => props.data?.signals || {});
const signalStats = computed(() =>
  [
    "accelerating",
    "decelerating",
    "volatility",
    "positiveMomentum",
    "currentPeaks",
    "reentries",
  ].map((key) => ({
    key,
    label: copy.value.labels[key],
    count: Array.isArray(signals.value[key]) ? signals.value[key].length : 0,
  })),
);const qualityGrade = computed(() => props.data?.evidenceQuality?.grade || "unknown");
const qualityLabel = computed(
  () => `${copy.value.quality} · ${qualityGrade.value}`,
);
const windowLabel = computed(() => props.data?.window?.key || "24h");
const denseLabel = computed(() => {
  const selected = Number(props.data?.window?.denseTailObservationCount || 0);
  const total = Number(props.data?.window?.denseTailTotalObservationCount || 0);
  if (!selected && !total) return "";
  return `${copy.value.dense} ${selected}/${total}`;
});
</script>

<style scoped>
.trend-intelligence {
  display: grid;
  gap: 10px;
  margin: 2px 0 12px;
  padding: 11px 12px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 82%, transparent);
  border-radius: 12px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--n-primary-color) 7%, transparent), transparent 48%),
    var(--n-action-color, rgba(127, 127, 127, 0.04));
}
.trend-intelligence__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.trend-intelligence__head > div {
  display: grid;
  gap: 2px;
}
.trend-intelligence__eyebrow {
  color: var(--n-text-color-3);
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.12em;
}
.trend-intelligence__head strong {
  color: var(--n-text-color);
  font-size: 13px;
  font-weight: 760;
}
.trend-intelligence__head p {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
  margin: 0;
  color: var(--n-text-color-3);
  font-size: 9px;
}
.trend-intelligence__head p span {
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--n-color);
}
.trend-intelligence__head p .is-high {
  color: var(--n-success-color, #18a058);
}
.trend-intelligence__head p .is-medium {
  color: var(--n-warning-color, #f0a020);
}.trend-intelligence__signals {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 6px;
}
.trend-intelligence__signal {
  display: flex;
  min-width: 0;
  align-items: baseline;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 8px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 68%, transparent);
  border-radius: 9px;
  background: color-mix(in srgb, var(--n-color) 78%, transparent);
}
.trend-intelligence__signal span {
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.trend-intelligence__signal strong {
  flex: 0 0 auto;
  color: var(--n-text-color);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 900px) {
  .trend-intelligence__signals {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 560px) {
  .trend-intelligence__head {
    align-items: flex-start;
    flex-direction: column;
  }
  .trend-intelligence__head p {
    justify-content: flex-start;
  }
  .trend-intelligence__signals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
