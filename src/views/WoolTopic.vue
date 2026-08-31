<template>
  <section class="wool-topic">
    <header class="topic-hero">
      <div>
        <p class="topic-eyebrow">{{ copy.eyebrow }}</p>
        <h1>{{ copy.title }}</h1>
        <p class="topic-description">{{ copy.description }}</p>
      </div>
      <div class="topic-status" v-if="dashboard">
        <strong>{{ data.length }}</strong>
        <span>{{ copy.feedTitle }}</span>
      </div>
    </header>

    <n-alert v-if="loadError" type="error" :show-icon="false" class="topic-alert">
      {{ loadError }}
    </n-alert>
    <n-alert v-else-if="dashboard?.failedCount" type="warning" :show-icon="false" class="topic-alert">
      {{ copy.degraded }}
    </n-alert>

    <section v-if="highlights.length" class="topic-section">
      <div class="section-heading">
        <h2>{{ copy.highlights }}</h2>
        <span>{{ formatUpdated(result?.updateTime) }}</span>
      </div>
      <div class="highlight-grid">
        <article v-for="item in highlights" :key="`highlight-${item.id}`" class="highlight-card">
          <div class="highlight-source">
            <img :src="getSourceLogo(item.source)" :alt="sourceLabel(item)" @error="onLogoError" />
            <span>{{ sourceLabel(item) }}</span>
            <em>{{ subtypeLabel(item) }}</em>
          </div>
          <a :href="item.url" target="_blank" rel="noopener noreferrer" class="highlight-title">
            {{ item.title }}
          </a>
          <div class="highlight-meta">
            <span class="intent-pill">{{ intentLabel(item.intent) }}</span>
            <time>{{ formatItemTime(item.timestamp) }}</time>
          </div>
        </article>
      </div>
    </section>

    <section class="topic-section feed-section">
      <div class="section-heading section-heading--feed">
        <div>
          <h2>{{ copy.feedTitle }}</h2>
          <p>{{ copy.method }}</p>
        </div>
        <n-button size="small" tertiary :loading="loading" @click="loadTopic(true)">
          {{ refreshLabel }}
        </n-button>
      </div>

      <div class="intent-filter" role="tablist" :aria-label="copy.feedTitle">
        <button
          v-for="option in intentOptions"
          :key="option.value"
          type="button"
          class="intent-button"
          :class="{ active: activeIntent === option.value }"
          :aria-selected="activeIntent === option.value"
          @click="activeIntent = option.value"
        >
          {{ option.label }}
          <span v-if="option.count !== null">{{ option.count }}</span>
        </button>
      </div>

      <div v-if="loading && !result" class="topic-loading">
        <n-skeleton text :repeat="8" />
      </div>
      <div v-else-if="filteredData.length" class="opportunity-list">
        <a
          v-for="(item, index) in filteredData"
          :key="item.id"
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
          class="opportunity-item"
        >
          <span class="opportunity-rank">{{ String(index + 1).padStart(2, '0') }}</span>
          <div class="opportunity-main">
            <div class="opportunity-source">
              <img :src="getSourceLogo(item.source)" :alt="sourceLabel(item)" @error="onLogoError" />
              <span>{{ sourceLabel(item) }}</span>
              <em>{{ subtypeLabel(item) }}</em>
            </div>
            <h3>{{ item.title }}</h3>
            <p v-if="item.desc && locale === 'zh-CN'" class="opportunity-desc">{{ item.desc }}</p>
            <div class="opportunity-meta">
              <span class="intent-pill">{{ intentLabel(item.intent) }}</span>
              <time>{{ formatItemTime(item.timestamp) }}</time>
              <span v-if="item.extra?.platform">{{ item.extra.platform }}</span>
            </div>
          </div>
          <span class="opportunity-open">{{ copy.open }}</span>
        </a>
      </div>
      <n-empty v-else :description="copy.empty" class="topic-empty" />
    </section>
  </section>
</template>

<script setup>
import { getHotListsWithFallback } from "@/api";
import { WOOL_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel, getSourceSubtitleLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { enhanceReadableResultTitles } from "@/utils/readableTitles";
import { useRoute } from "vue-router";

const route = useRoute();
const result = ref(null);
const loading = ref(false);
const loadError = ref("");
const activeIntent = ref("all");
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(() => WOOL_TOPIC_METADATA[locale.value] || WOOL_TOPIC_METADATA["zh-CN"]);
const data = computed(() => result.value?.data || []);const dashboard = computed(() => result.value?.dashboard || null);
const highlights = computed(() => dashboard.value?.sourceHighlights || []);
const getIntentItems = (intent) => {
  if (intent === "all") return data.value;
  const matches = data.value.filter((item) => item.intent === intent);
  const seen = new Set(matches.map((item) => String(item.id)));
  highlights.value.forEach((item) => {
    if (item.intent === intent && !seen.has(String(item.id))) {
      matches.push(item);
      seen.add(String(item.id));
    }
  });
  return matches;
};
const filteredData = computed(() => getIntentItems(activeIntent.value));
const intentOptions = computed(() => [
  { value: "all", label: copy.value.all, count: data.value.length },
  ...Object.entries(copy.value.intents).map(([value, label]) => ({
    value,
    label,
    count: getIntentItems(value).length,
  })),
]);
const refreshLabels = {
  "zh-CN": "刷新",
  en: "Refresh",
  "zh-TW": "重新整理",
  ja: "更新",
  ko: "새로고침",
};
const refreshLabel = computed(() => refreshLabels[locale.value] || refreshLabels["zh-CN"]);

const sourceLabel = (item) =>
  getSourceLabel(item?.source, locale.value, item?.sourceLabel || item?.source || "");
const subtypeLabel = (item) => getSourceSubtitleLabel(item?.sourceSubtype || "", locale.value);
const intentLabel = (intent) => copy.value.intents?.[intent] || copy.value.intents.deal;
const formatItemTime = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat(locale.value, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};const formatUpdated = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale.value, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
const onLogoError = (event) => {
  if (event?.target) event.target.src = getSourceLogoFallback();
};

const loadTopic = async (force = false) => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await getHotListsWithFallback(
      "wool-topic",
      force,
      { locale: locale.value, translate_limit: 60 },
      { forceNoCache: force }
    );
    if (response?.result?.code !== 200) {
      throw new Error(response?.result?.message || "request failed");
    }
    const rawResult = response.result;
    result.value = rawResult;
    loading.value = false;
    const enhanced = await enhanceReadableResultTitles(rawResult, locale.value, {
      includeDescriptions: false,
      limit: 60,
      sourceName: "wool-topic",
    });
    const translatedById = new Map((enhanced?.data || []).map((item) => [String(item.id), item]));
    if (enhanced?.dashboard?.sourceHighlights) {
      enhanced.dashboard = {
        ...enhanced.dashboard,
        sourceHighlights: enhanced.dashboard.sourceHighlights.map((item) => ({
          ...item,
          title: translatedById.get(String(item.id))?.title || item.title,
        })),
      };
    }
    result.value = enhanced;
  } catch (error) {
    loadError.value = error?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
};

watch(locale, () => loadTopic(false));
onMounted(() => loadTopic(false));
</script>
<style scoped>
.wool-topic {
  --wool-section-gap: 14px;
  --wool-section-padding: 16px;
  --wool-card-gap: 10px;
  --wool-card-padding: 12px;
  --wool-list-padding-y: 11px;
  display: grid;
  gap: var(--wool-section-gap);
}
.topic-hero,
.topic-section {
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  background: var(--n-color, #fff);
  border-radius: 16px;
}
.topic-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 20px;
}
.topic-eyebrow {
  margin: 0 0 5px;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.topic-hero h1 {
  margin: 0;
  font-size: clamp(24px, 2.5vw, 32px);
  line-height: 1.2;
}
.topic-description {
  max-width: 860px;
  margin: 7px 0 0;
  color: var(--n-text-color-2, #555);
  font-size: 13px;
  line-height: 1.55;
}
.topic-status {
  min-width: 76px;
  text-align: right;
}
.topic-status strong {
  display: block;
  font-size: 28px;
  line-height: 1;
}
.topic-status span {
  display: block;
  margin-top: 5px;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
}
.topic-alert {
  margin: -8px 0 0;
}
.topic-section {
  min-width: 0;
  padding: var(--wool-section-padding);
}
.section-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.section-heading h2 {
  margin: 0;
  font-size: 16px;
}
.section-heading > span,
.section-heading p {
  margin: 0;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
}
.section-heading--feed {
  align-items: flex-start;
}
.section-heading--feed p {
  margin-top: 4px;
  line-height: 1.5;
}
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--wool-card-gap);
}
.highlight-card {
  min-width: 0;
  padding: var(--wool-card-padding);
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.16));
  border-radius: 10px;
}
.highlight-source,
.opportunity-source {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
}
.highlight-source img,
.opportunity-source img {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 4px;
  object-fit: cover;
}
.highlight-source span,
.opportunity-source span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--n-text-color, #222);
  font-weight: 650;
}
.highlight-source em,
.opportunity-source em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: normal;
}
.highlight-title {
  display: -webkit-box;
  min-height: 42px;
  margin-top: 9px;
  overflow: hidden;
  color: var(--n-text-color, #222);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.highlight-meta,
.opportunity-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
}
.intent-pill {
  display: inline-flex;
  align-items: center;
  min-height: 21px;
  padding: 0 7px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.16));
  border-radius: 999px;
  background: color-mix(in srgb, var(--n-color, #fff) 90%, var(--n-text-color, #222) 10%);
  color: var(--n-text-color-2, #555);
  font-size: 10px;
  font-weight: 650;
}
.intent-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 9px;
}
.intent-button {
  appearance: none;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.2));
  border-radius: 999px;
  background: transparent;
  color: var(--n-text-color-2, #555);
  cursor: pointer;
}
.intent-button span {
  margin-left: 6px;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
}
.intent-button:hover,
.intent-button.active {
  border-color: currentColor;
  color: var(--n-text-color, #222);
}
.intent-button:focus-visible,
.highlight-title:focus-visible,
.opportunity-item:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.opportunity-list {
  overflow: hidden;
  border-top: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.16));
}
.opportunity-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: var(--wool-list-padding-y) 2px;
  border-bottom: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.13));
  color: inherit;
  text-decoration: none;
}
.opportunity-item:last-child {
  border-bottom: 0;
}
.opportunity-item:hover h3 {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.opportunity-rank {
  color: var(--n-text-color-3, #777);
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}
.opportunity-main {
  min-width: 0;
}
.opportunity-main h3 {
  margin: 5px 0 0;
  color: var(--n-text-color, #222);
  font-size: 15px;
  line-height: 1.45;
}
.opportunity-desc {
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  color: var(--n-text-color-2, #555);
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.opportunity-open {
  padding-left: 12px;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
  white-space: nowrap;
}
.topic-loading,
.topic-empty {
  padding: 24px 0;
}
@media (max-width: 1280px) {
  .highlight-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 980px) {
  .highlight-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .highlight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .wool-topic {
    --wool-section-gap: 10px;
    --wool-section-padding: 13px;
    --wool-card-gap: 8px;
    --wool-card-padding: 11px;
    --wool-list-padding-y: 10px;
  }
  .topic-hero,
  .topic-section {
    border-radius: 12px;
  }
  .topic-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 14px;
  }
  .topic-eyebrow {
    display: none;
  }
  .topic-hero h1 {
    font-size: 18px;
    line-height: 1.3;
  }
  .topic-status {
    min-width: 44px;
  }
  .topic-status strong {
    font-size: 22px;
  }
  .topic-description {
    display: -webkit-box;
    margin-top: 4px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .highlight-grid {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(220px, 78vw);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline proximity;
    scrollbar-width: none;
  }
  .highlight-grid::-webkit-scrollbar {
    display: none;
  }
  .highlight-card {
    scroll-snap-align: start;
  }
  .highlight-title {
    min-height: 42px;
  }
  .section-heading--feed {
    align-items: center;
    gap: 8px;
  }
  .section-heading--feed p {
    display: none;
  }
  .intent-filter {
    flex-wrap: nowrap;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
  }
  .intent-filter::-webkit-scrollbar {
    display: none;
  }
  .intent-button {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  .opportunity-item {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 8px;
    padding: var(--wool-list-padding-y) 0;
  }
  .opportunity-open {
    display: none;
  }
  .opportunity-main h3 {
    font-size: 14px;
  }
  .opportunity-desc {
    -webkit-line-clamp: 2;
  }
}
</style>