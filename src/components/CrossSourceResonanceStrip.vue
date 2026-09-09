<template>
  <section v-if="events.length" class="resonance-strip" :aria-label="copy.title">
    <header class="resonance-strip__head">
      <div>
        <strong>{{ copy.title }}</strong>
        <span>{{ copy.subtitle }}</span>
      </div>
      <p>{{ copy.verified }}</p>
    </header>

    <div class="resonance-strip__grid">
      <a
        v-for="event in events"
        :key="event.eventKey"
        class="resonance-card"
        :href="primaryUrl(event)"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="resonance-card__title">
          <strong>{{ event.title }}</strong>
          <span>{{ event.sourceCount }} {{ copy.platforms }}</span>
        </div>
        <p>
          <span v-if="event.firstSourceName">
            {{ copy.first }} {{ event.firstSourceName }}
          </span>
          <span v-if="event.propagationEvidenceComplete">
            {{ formatPropagation(event.propagationSpanSeconds) }}
          </span>
          <span v-if="event.bestRank">
            {{ copy.bestRank }} #{{ event.bestRank }}
          </span>
        </p>
        <div class="resonance-card__sources">
          <span
            v-for="source in event.sources.slice(0, 4)"
            :key="source.sourceKey"
          >
            {{ source.sourceName || source.sourceKey }}
            <small>#{{ source.rank }}</small>
          </span>
        </div>
      </a>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, default: null },
  locale: { type: String, default: "zh-CN" },
});

const COPY = {
  "zh-CN": {
    title: "跨平台传播",
    subtitle: "这些热点已在多个平台出现，看看从哪儿先起、多久扩散",
    verified: "中央历史证据核验",
    platforms: "个平台",
    first: "首发",
    spread: "扩散",
    bestRank: "最佳",
    minutes: (value) => value + " 分钟扩散",
    hours: (value) => value + " 小时扩散",
    instant: "几乎同步出现",
  },
  en: {
    title: "Cross-platform spread",
    subtitle: "See where a story appeared first and how quickly it spread",
    verified: "verified against central history",
    platforms: "platforms",
    first: "First",
    spread: "Spread",
    bestRank: "Best",
    minutes: (value) => value + "m spread",
    hours: (value) => value + "h spread",
    instant: "appeared almost simultaneously",
  },
  "zh-TW": {
    title: "跨平台傳播",
    subtitle: "這些熱點已在多個平台出現，看看從哪裡先起、多久擴散",
    verified: "中央歷史證據核驗",
    platforms: "個平台",
    first: "首發",
    spread: "擴散",
    bestRank: "最佳",
    minutes: (value) => value + " 分鐘擴散",
    hours: (value) => value + " 小時擴散",
    instant: "幾乎同步出現",
  },
  ja: {
    title: "クロスプラットフォーム拡散",
    subtitle: "どこで先に現れ、どれくらいで広がったかを確認",
    verified: "中央履歴データで検証",
    platforms: "プラットフォーム",
    first: "最初",
    spread: "拡散",
    bestRank: "最高",
    minutes: (value) => value + "分で拡散",
    hours: (value) => value + "時間で拡散",
    instant: "ほぼ同時に登場",
  },
  ko: {
    title: "플랫폼 간 확산",
    subtitle: "어디서 먼저 나타났고 얼마나 빨리 퍼졌는지 확인",
    verified: "중앙 이력 데이터로 검증",
    platforms: "개 플랫폼",
    first: "최초",
    spread: "확산",
    bestRank: "최고",
    minutes: (value) => value + "분 내 확산",
    hours: (value) => value + "시간 내 확산",
    instant: "거의 동시에 등장",
  },
};

const copy = computed(() => COPY[props.locale] || COPY["zh-CN"]);
const events = computed(() =>
  (Array.isArray(props.data?.events) ? props.data.events : [])
    .filter((event) => Number(event?.sourceCount || 0) >= 2)
    .slice(0, 4),
);

const primaryUrl = (event) =>
  event?.sources?.find((source) => source?.url)?.url || "#";

const formatPropagation = (seconds) => {
  const value = Number(seconds || 0);
  if (value <= 60) return copy.value.instant;
  if (value < 3600) {
    return copy.value.minutes(Math.max(1, Math.round(value / 60)));
  }
  const hours = Math.max(1, Math.round((value / 3600) * 10) / 10);
  return copy.value.hours(hours);
};
</script>

<style scoped>
.resonance-strip {
  display: grid;
  gap: 10px;
  margin: 2px 0 12px;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--n-primary-color) 18%, var(--n-border-color));
  border-radius: 12px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--n-primary-color) 6%, transparent), transparent 46%),
    var(--n-action-color, rgba(127, 127, 127, 0.04));
}
.resonance-strip__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.resonance-strip__head > div {
  display: grid;
  gap: 2px;
}
.resonance-strip__head strong {
  color: var(--n-text-color);
  font-size: 13px;
  font-weight: 760;
}
.resonance-strip__head span,
.resonance-strip__head p {
  margin: 0;
  color: var(--n-text-color-3);
  font-size: 10px;
}
.resonance-strip__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.resonance-card {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 68%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--n-color) 86%, transparent);
  text-decoration: none;
}
.resonance-card__title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.resonance-card__title strong {
  overflow: hidden;
  color: var(--n-text-color);
  font-size: 11px;
  font-weight: 680;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.resonance-card__title > span {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--n-primary-color) 10%, transparent);
  color: var(--n-primary-color);
  font-size: 9px;
  font-weight: 700;
}
.resonance-card > p {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin: 0;
  color: var(--n-text-color-3);
  font-size: 9px;
}
.resonance-card__sources {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.resonance-card__sources span {
  padding: 2px 5px;
  border-radius: 999px;
  background: var(--n-action-color);
  color: var(--n-text-color-2);
  font-size: 9px;
}
.resonance-card__sources small {
  margin-left: 2px;
  color: var(--n-text-color-3);
  font-size: inherit;
}
.resonance-card:hover {
  border-color: color-mix(in srgb, var(--n-primary-color) 35%, var(--n-border-color));
}
.resonance-card:hover .resonance-card__title strong {
  color: var(--n-primary-color);
}

@media (max-width: 720px) {
  .resonance-strip__head {
    align-items: flex-start;
    flex-direction: column;
  }
  .resonance-strip__grid {
    grid-template-columns: 1fr;
  }
}
</style>
