<template>
  <section class="ai-topic">
    <n-alert
      v-if="loadError"
      type="error"
      :show-icon="false"
      class="topic-alert"
    >
      {{ loadError }}
    </n-alert>
    <n-alert
      v-else-if="dashboard?.failedSourceCount"
      type="warning"
      :show-icon="false"
      class="topic-alert"
    >
      {{ copy.degraded }}
    </n-alert>

    <section class="topic-section">
      <div class="topic-workspace-header">
        <TopicSwitcher active-topic="ai" :locale="locale" />
        <div class="topic-workspace-summary">
          <div class="topic-workspace-title">
            <h1>{{ copy.title }}</h1>
            <p>{{ copy.description }}</p>
          </div>
          <div v-if="dashboard" class="hero-stats">
            <strong>{{ dashboard.total || data.length }}</strong>
            <span>{{ ui.events }}</span>
            <em>{{ dashboard.sourceCount }} {{ ui.sources }}</em>
          </div>
        </div>
      </div>

      <div class="event-toolbar">
        <div class="toolbar-primary">
          <div class="toolbar-title">
            <h2>{{ copy.feedTitle }}</h2>
            <span>{{ formatUpdated(result?.updateTime) }}</span>
          </div>
          <label class="topic-search">
            <span class="sr-only">{{ ui.search }}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
              />
            </svg>
            <input
              v-model.trim="searchQuery"
              type="search"
              :placeholder="ui.searchPlaceholder"
              @keydown.esc="searchQuery = ''"
            />
          </label>
          <div class="toolbar-filters" role="group" :aria-label="ui.filters">
            <CompactFilter
              v-model="activeCategory"
              :label="ui.category"
              :aria-label="ui.category"
              :options="categoryOptions"
              default-value="all"
            />
            <CompactFilter
              v-model="activeSource"
              :label="ui.source"
              :aria-label="ui.source"
              :options="sourceOptions"
              default-value="all"
            />
            <CompactFilter
              v-model="activeSort"
              :label="ui.sort"
              :aria-label="ui.sort"
              :options="sortOptions"
              :show-count="false"
              default-value="smart"
            />
            <CompactFilter
              v-model="pageSize"
              :label="ui.perPage"
              :aria-label="ui.perPage"
              :options="pageSizeOptions"
              :show-count="false"
              :default-value="30"
            />
            <button
              v-if="hasFilters"
              type="button"
              class="reset-filter"
              @click="resetFilters"
            >
              {{ ui.reset }}
            </button>
          </div>
          <div class="toolbar-actions">
            <div class="result-count">
              <strong>{{ filteredData.length }}</strong
              ><span>{{ ui.matches }}</span>
            </div>
            <button
              v-if="dashboard?.multiSourceCount"
              type="button"
              class="resonance-toggle"
              :class="{ active: activeConfirmed }"
              :aria-pressed="activeConfirmed"
              @click="activeConfirmed = !activeConfirmed"
            >
              {{ ui.resonance }} <span>{{ dashboard.multiSourceCount }}</span>
            </button>
            <n-button
              size="small"
              tertiary
              :loading="loading"
              @click="loadTopic(true)"
              >{{ ui.refresh }}</n-button
            >
          </div>
        </div>
      </div>

      <TopicLaneGrid
        v-if="featuredGroups.length"
        :lanes="featuredGroups"
        :aria-label="copy.feedTitle"
        @select="selectFeaturedLane"
      >
        <template #item="{ item }">
          <a
            class="ai-lane-item"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="item.cover || getSourceLogo(primarySource(item))"
              :alt="item.title"
              loading="lazy"
              @error="onImageError($event, item)"
            />
            <div>
              <strong>{{ item.title }}</strong>
              <p>
                <span>{{ sourceLabel(item) }}</span>
                <b v-if="signalIndependentSourceCount(item) > 1">
                  {{ signalIndependentSourceCount(item) }} {{ ui.sourcesShort }}
                </b>
                <em v-else-if="heatLabel(item)">{{ heatLabel(item) }}</em>
              </p>
            </div>
          </a>
        </template>
      </TopicLaneGrid>

      <div v-if="loading && !result" class="topic-loading">
        <n-skeleton text :repeat="9" />
      </div>
      <div
        v-else-if="filteredData.length"
        ref="eventListRef"
        class="event-list"
      >
        <article
          v-for="(item, index) in pagedData"
          :key="item.id"
          class="event-item"
          :class="signalRankClass(index)"
        >
          <span class="event-rank">{{
            String(pageStart + index + 1).padStart(2, "0")
          }}</span>
          <a
            class="event-cover"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
          >
            <img
              :src="item.cover || getSourceLogo(primarySource(item))"
              :alt="item.title"
              loading="lazy"
              @error="onImageError($event, item)"
            />
          </a>
          <div class="event-main">
            <div class="event-source-line">
              <img
                :src="getSourceLogo(primarySource(item))"
                :alt="sourceLabel(item)"
                @error="onLogoError"
              />
              <span>{{ sourceLabel(item) }}</span>
              <em
                v-if="signalIndependentSourceCount(item) > 1"
                :title="confirmationTitle(item)"
              >
                {{ signalIndependentSourceCount(item) }}
                {{ ui.sourceResonance }}
              </em>
            </div>
            <a
              class="event-title"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>{{ item.title }}</h3>
            </a>
            <p v-if="item.desc" class="event-desc">{{ item.desc }}</p>
            <div class="event-meta">
              <span class="category-pill">{{
                kindLabel(signalKind(item))
              }}</span>
              <strong v-if="heatLabel(item)">{{ heatLabel(item) }}</strong>
              <time
                v-if="item.timestamp"
                :title="formatFullTime(item.timestamp)"
                >{{ formatFreshness(item.timestamp) }}</time
              >
              <span
                v-for="confirmation in visibleConfirmations(item)"
                :key="`${item.id}-${confirmation.source}`"
                class="source-pill"
              >
                {{
                  getSourceLabel(
                    confirmation.source,
                    locale,
                    confirmation.sourceLabel || confirmation.source,
                  )
                }}
              </span>
            </div>
          </div>
          <a
            class="event-open"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ ui.open }}</a
          >
        </article>
        <div class="event-pagination">
          <span>{{ pageRangeText }}</span>
          <n-pagination
            v-if="pageCount > 1"
            v-model:page="currentPage"
            :page-count="pageCount"
            :page-slot="7"
            size="small"
            @update:page="handlePageChange"
          />
        </div>
      </div>
      <n-empty v-else :description="copy.empty" class="topic-empty" />
    </section>
  </section>
</template>

<script setup>
import CompactFilter from "@/components/CompactFilter.vue";
import TopicLaneGrid from "@/components/TopicLaneGrid.vue";
import TopicSwitcher from "@/components/TopicSwitcher.vue";
import { getHotListsWithFallback } from "@/api";
import { AI_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { useRoute } from "vue-router";

const route = useRoute();
const result = ref(null);
const loading = ref(false);
const loadError = ref("");
const searchQuery = ref(
  typeof route.query.q === "string" ? route.query.q.trim() : "",
);
const activeCategory = ref(
  typeof route.query.category === "string" ? route.query.category : "all",
);
const activeSource = ref(
  typeof route.query.source === "string" ? route.query.source : "all",
);
const activeSort = ref(
  ["smart", "resonance", "latest"].includes(route.query.sort)
    ? route.query.sort
    : "smart",
);
const activeConfirmed = ref(route.query.confirmed === "1");
const PAGE_SIZE_VALUES = [20, 30, 50, 100];
const routePage = Number.parseInt(String(route.query.page || "1"), 10);
const routePageSize = Number.parseInt(String(route.query.size || "30"), 10);
const currentPage = ref(
  Number.isFinite(routePage) && routePage > 0 ? routePage : 1,
);
const pageSize = ref(
  PAGE_SIZE_VALUES.includes(routePageSize) ? routePageSize : 30,
);
const eventListRef = ref(null);
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(
  () => AI_TOPIC_METADATA[locale.value] || AI_TOPIC_METADATA["zh-CN"],
);
const data = computed(() => result.value?.data || []);
const dashboard = computed(() => result.value?.dashboard || null);

const UI_COPY = {
  "zh-CN": {
    events: "条事件",
    sources: "个来源",
    search: "搜索 AI 事件",
    searchPlaceholder: "搜索模型、公司、项目、关键词…",
    matches: "条结果",
    resonance: "独立多源",
    refresh: "刷新",
    filters: "AI 事件筛选",
    perPage: "每页",
    category: "类型",
    source: "来源",
    sort: "排序",
    smart: "综合趋势",
    resonanceFirst: "多源优先",
    latest: "最新优先",
    reset: "清除筛选",
    all: "全部",
    sourcesShort: "个来源",
    sourceResonance: "源确认",
    open: "查看来源",
    starsToday: "Star 今日",
    points: "热度",
    featured: {
      major: "重大事件",
      model: "模型发布",
      breakout: "开发者爆火",
    },
    categories: {
      major: "重大事件",
      model: "模型",
      product: "产品",
      research: "研究",
      developer: "开发者",
      safety: "安全治理",
      business: "商业",
      other: "其它",
    },
  },
  en: {
    events: "events",
    sources: "sources",
    search: "Search AI events",
    searchPlaceholder: "Search models, companies, projects…",
    matches: "results",
    resonance: "Independent sources",
    refresh: "Refresh",
    filters: "AI event filters",
    perPage: "Per page",
    category: "Type",
    source: "Source",
    sort: "Sort",
    smart: "Trend score",
    resonanceFirst: "Multi-source first",
    latest: "Latest",
    reset: "Reset",
    all: "All",
    sourcesShort: "sources",
    sourceResonance: "sources",
    open: "Open source",
    starsToday: "stars today",
    points: "points",
    featured: {
      major: "Major event",
      model: "Model release",
      breakout: "Developer breakout",
    },
    categories: {
      major: "Major",
      model: "Model",
      product: "Product",
      research: "Research",
      developer: "Developer",
      safety: "Safety",
      business: "Business",
      other: "Other",
    },
  },
  "zh-TW": {
    events: "筆事件",
    sources: "個來源",
    search: "搜尋 AI 事件",
    searchPlaceholder: "搜尋模型、公司、專案、關鍵字…",
    matches: "筆結果",
    resonance: "獨立多源",
    refresh: "重新整理",
    filters: "AI 事件篩選",
    perPage: "每頁",
    category: "類型",
    source: "來源",
    sort: "排序",
    smart: "綜合趨勢",
    resonanceFirst: "多源優先",
    latest: "最新優先",
    reset: "清除篩選",
    all: "全部",
    sourcesShort: "個來源",
    sourceResonance: "來源確認",
    open: "查看來源",
    starsToday: "Star 今日",
    points: "熱度",
    featured: { major: "重大事件", model: "模型發布", breakout: "開發者爆紅" },
    categories: {
      major: "重大事件",
      model: "模型",
      product: "產品",
      research: "研究",
      developer: "開發者",
      safety: "安全治理",
      business: "商業",
      other: "其他",
    },
  },
  ja: {
    events: "件",
    sources: "情報源",
    search: "AIイベントを検索",
    searchPlaceholder: "モデル・企業・プロジェクトを検索…",
    matches: "件",
    resonance: "独立複数ソース",
    refresh: "更新",
    filters: "AIイベントフィルター",
    perPage: "件数",
    category: "種類",
    source: "情報源",
    sort: "並び順",
    smart: "総合トレンド",
    resonanceFirst: "複数ソース優先",
    latest: "新着順",
    reset: "解除",
    all: "すべて",
    sourcesShort: "情報源",
    sourceResonance: "情報源確認",
    open: "情報源を見る",
    starsToday: "Star 本日",
    points: "人気",
    featured: {
      major: "重大イベント",
      model: "モデル公開",
      breakout: "開発者急上昇",
    },
    categories: {
      major: "重大",
      model: "モデル",
      product: "プロダクト",
      research: "研究",
      developer: "開発者",
      safety: "安全",
      business: "ビジネス",
      other: "その他",
    },
  },
  ko: {
    events: "개 이벤트",
    sources: "개 출처",
    search: "AI 이벤트 검색",
    searchPlaceholder: "모델, 기업, 프로젝트 검색…",
    matches: "개 결과",
    resonance: "독립 다중 출처",
    refresh: "새로고침",
    filters: "AI 이벤트 필터",
    perPage: "페이지당",
    category: "유형",
    source: "출처",
    sort: "정렬",
    smart: "종합 트렌드",
    resonanceFirst: "다중 출처 우선",
    latest: "최신순",
    reset: "초기화",
    all: "전체",
    sourcesShort: "개 출처",
    sourceResonance: "출처 확인",
    open: "출처 보기",
    starsToday: "오늘 Star",
    points: "인기",
    featured: {
      major: "주요 사건",
      model: "모델 출시",
      breakout: "개발자 급상승",
    },
    categories: {
      major: "주요 사건",
      model: "모델",
      product: "제품",
      research: "연구",
      developer: "개발자",
      safety: "안전",
      business: "비즈니스",
      other: "기타",
    },
  },
};
const ui = computed(() => UI_COPY[locale.value] || UI_COPY["zh-CN"]);
const viewAllLabel = computed(() =>
  ({
    "zh-CN": "查看全部",
    en: "View all",
    "zh-TW": "查看全部",
    ja: "すべて見る",
    ko: "전체 보기",
  })[locale.value] || "查看全部",
);
const CATEGORY_ORDER = [
  "major",
  "model",
  "product",
  "research",
  "developer",
  "safety",
  "business",
  "other",
];
const signalMeta = (item) => item?.extra?.aiSignal || {};
const signalKind = (item) => signalMeta(item).kind || "other";
const signalScore = (item) => Number(signalMeta(item).score || 0);
const signalIndependentSourceCount = (item) =>
  Math.max(1, Number(signalMeta(item).independentSourceCount || 1));
const signalSources = (item) =>
  Array.isArray(signalMeta(item).sources)
    ? signalMeta(item).sources
    : [primarySource(item)];
const confirmations = (item) =>
  Array.isArray(signalMeta(item).confirmations)
    ? signalMeta(item).confirmations
    : [];
const primarySource = (item) =>
  signalMeta(item).primarySource ||
  confirmations(item)[0]?.source ||
  "openai-news";
const sourceLabel = (item) =>
  getSourceLabel(
    primarySource(item),
    locale.value,
    signalMeta(item).primarySourceLabel ||
      confirmations(item)[0]?.sourceLabel ||
      primarySource(item),
  );
const kindLabel = (kind) => ui.value.categories[kind] || kind;
const visibleConfirmations = (item) => confirmations(item).slice(0, 3);
const confirmationTitle = (item) =>
  confirmations(item)
    .map((entry) =>
      getSourceLabel(
        entry.source,
        locale.value,
        entry.sourceLabel || entry.source,
      ),
    )
    .join(" + ");
const textFor = (item) =>
  `${item.title || ""} ${item.desc || ""} ${confirmationTitle(item)}`.toLowerCase();

const BREAKOUT_SOURCES = new Set([
  "github-ai-trending",
  "reddit-localllama",
  "hackernews-ai",
  "producthunt-ai",
]);
const isBreakoutSignal = (item) =>
  primarySource(item) === "github-ai-trending" ||
  (BREAKOUT_SOURCES.has(primarySource(item)) && Number(item.hot || 0) > 0);
const breakoutCount = computed(
  () => data.value.filter((item) => isBreakoutSignal(item)).length,
);

const categoryOptions = computed(() => [
  { value: "all", label: ui.value.all, count: data.value.length },
  ...CATEGORY_ORDER.map((kind) => ({
    value: kind,
    label: kindLabel(kind),
    count: data.value.filter((item) => signalKind(item) === kind).length,
  })).filter((item) => item.count > 0),
  ...(breakoutCount.value
    ? [
        {
          value: "breakout",
          label: ui.value.featured.breakout,
          count: breakoutCount.value,
        },
      ]
    : []),
]);
const sourceOptions = computed(() => {
  const feeds = dashboard.value?.feeds || [];
  return [
    { value: "all", label: ui.value.all, count: data.value.length },
    ...feeds
      .filter((feed) => feed.count > 0)
      .map((feed) => ({
        value: feed.source,
        label: getSourceLabel(
          feed.source,
          locale.value,
          feed.label || feed.source,
        ),
        count: data.value.filter((item) =>
          signalSources(item).includes(feed.source),
        ).length,
      }))
      .filter((item) => item.count > 0),
  ];
});
const sortOptions = computed(() => [
  { value: "smart", label: ui.value.smart },
  { value: "resonance", label: ui.value.resonanceFirst },
  { value: "latest", label: ui.value.latest },
]);
const pageSizeOptions = computed(() =>
  PAGE_SIZE_VALUES.map((value) => ({ value, label: String(value) })),
);

const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const rows = data.value.filter((item) => {
    if (query && !textFor(item).includes(query)) return false;
    if (activeCategory.value === "breakout" && !isBreakoutSignal(item))
      return false;
    if (
      activeCategory.value !== "all" &&
      activeCategory.value !== "breakout" &&
      signalKind(item) !== activeCategory.value
    )
      return false;
    if (
      activeSource.value !== "all" &&
      !signalSources(item).includes(activeSource.value)
    )
      return false;
    if (activeConfirmed.value && signalIndependentSourceCount(item) < 2)
      return false;
    return true;
  });
  return rows.slice().sort((a, b) => {
    if (activeSort.value === "resonance")
      return (
        signalIndependentSourceCount(b) - signalIndependentSourceCount(a) ||
        signalScore(b) - signalScore(a)
      );
    if (activeSort.value === "latest")
      return (
        Number(b.timestamp || 0) - Number(a.timestamp || 0) ||
        signalScore(b) - signalScore(a)
      );
    return (
      signalScore(b) - signalScore(a) ||
      signalIndependentSourceCount(b) - signalIndependentSourceCount(a)
    );
  });
});
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value)),
);
const pageStart = computed(() => (currentPage.value - 1) * pageSize.value);
const signalRankClass = (index) => {
  const rank = pageStart.value + index + 1;
  return rank <= 3 ? ["is-top-signal", `is-top-${rank}`] : [];
};
const pagedData = computed(() =>
  filteredData.value.slice(pageStart.value, pageStart.value + pageSize.value),
);
const pageRangeText = computed(() => {
  if (!filteredData.value.length) return "0 / 0";
  const start = pageStart.value + 1;
  const end = Math.min(
    pageStart.value + pageSize.value,
    filteredData.value.length,
  );
  return `${start}–${end} / ${filteredData.value.length}`;
});
const handlePageChange = () => {
  nextTick(() => {
    eventListRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const FEATURED_LANE_LIMIT = 3;
const featuredGroups = computed(() => {
  const byScore = (items) =>
    items.slice().sort((a, b) => signalScore(b) - signalScore(a));
  const majorItems = byScore(
    data.value.filter((item) => signalKind(item) === "major"),
  );
  const modelItems = byScore(
    data.value.filter((item) => signalKind(item) === "model"),
  );
  const breakoutItems = data.value
    .filter((item) => isBreakoutSignal(item))
    .slice()
    .sort(
      (a, b) =>
        Number(b.hot || 0) - Number(a.hot || 0) ||
        signalScore(b) - signalScore(a),
    );
  return [
    {
      key: "major",
      label: ui.value.featured.major,
      count: majorItems.length,
      items: majorItems.slice(0, FEATURED_LANE_LIMIT),
      actionLabel: `${viewAllLabel.value} ${majorItems.length}`,
      filter: { category: "major" },
    },
    {
      key: "model",
      label: ui.value.featured.model,
      count: modelItems.length,
      items: modelItems.slice(0, FEATURED_LANE_LIMIT),
      actionLabel: `${viewAllLabel.value} ${modelItems.length}`,
      filter: { category: "model" },
    },
    {
      key: "breakout",
      label: ui.value.featured.breakout,
      count: breakoutItems.length,
      items: breakoutItems.slice(0, FEATURED_LANE_LIMIT),
      actionLabel: `${viewAllLabel.value} ${breakoutItems.length}`,
      filter: { category: "breakout" },
    },
  ].filter((group) => group.items.length);
});
const selectFeaturedLane = (lane) => {
  activeCategory.value = lane?.filter?.category || "all";
  activeSource.value = "all";
  activeSort.value = "smart";
  activeConfirmed.value = false;
  currentPage.value = 1;
  nextTick(() =>
    eventListRef.value?.scrollIntoView({ behavior: "smooth", block: "start" }),
  );
};
const hasFilters = computed(() =>
  Boolean(
    searchQuery.value ||
      activeCategory.value !== "all" ||
      activeSource.value !== "all" ||
      activeSort.value !== "smart" ||
      activeConfirmed.value,
  ),
);
const resetFilters = () => {
  searchQuery.value = "";
  activeCategory.value = "all";
  activeSource.value = "all";
  activeSort.value = "smart";
  activeConfirmed.value = false;
  currentPage.value = 1;
};

const formatCompactNumber = (value) => {
  const num = Number(value || 0);
  if (!num) return "";
  if (num >= 1000000)
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1000)
    return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return new Intl.NumberFormat(locale.value).format(num);
};
const heatLabel = (item) => {
  const num = Number(item?.hot || 0);
  if (!num) return "";
  if (primarySource(item) === "github-ai-trending")
    return `+${formatCompactNumber(num)} ${ui.value.starsToday}`;
  return `${formatCompactNumber(num)} ${ui.value.points}`;
};
const formatUpdated = (value) =>
  value
    ? new Intl.DateTimeFormat(locale.value, {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value))
    : "";
const formatFullTime = (value) =>
  new Date(Number(value)).toLocaleString(locale.value);
const formatFreshness = (value) => {
  const diff = Date.now() - Number(value || 0);
  if (!Number.isFinite(diff) || diff < 0) return "";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return ui.value.latest;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return new Intl.DateTimeFormat(locale.value, {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Number(value)));
};
const onLogoError = (event) => {
  if (event?.target) event.target.src = getSourceLogoFallback();
};
const onImageError = (event, item) => {
  if (event?.target) event.target.src = getSourceLogo(primarySource(item));
};

let querySyncTimer;
const syncQuery = () => {
  clearTimeout(querySyncTimer);
  querySyncTimer = setTimeout(() => {
    const query = {};
    if (searchQuery.value.trim()) query.q = searchQuery.value.trim();
    if (activeCategory.value !== "all") query.category = activeCategory.value;
    if (activeSource.value !== "all") query.source = activeSource.value;
    if (activeSort.value !== "smart") query.sort = activeSort.value;
    if (activeConfirmed.value) query.confirmed = "1";
    if (currentPage.value > 1) query.page = String(currentPage.value);
    if (pageSize.value !== 30) query.size = String(pageSize.value);
    const params = new URLSearchParams(query);
    const search = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${route.path}${search ? `?${search}` : ""}`,
    );
  }, 180);
};
watch(
  [
    searchQuery,
    activeCategory,
    activeSource,
    activeSort,
    activeConfirmed,
    currentPage,
    pageSize,
  ],
  syncQuery,
);
watch(
  [
    searchQuery,
    activeCategory,
    activeSource,
    activeSort,
    activeConfirmed,
    pageSize,
  ],
  () => {
    currentPage.value = 1;
  },
);
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});
watch(categoryOptions, (options) => {
  if (
    activeCategory.value !== "all" &&
    !options.some((item) => item.value === activeCategory.value)
  )
    activeCategory.value = "all";
});
watch(sourceOptions, (options) => {
  if (
    activeSource.value !== "all" &&
    !options.some((item) => item.value === activeSource.value)
  )
    activeSource.value = "all";
});

const loadTopic = async (force = false) => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await getHotListsWithFallback(
      "ai-topic",
      force,
      { locale: locale.value, translate_limit: 80 },
      { forceNoCache: force, timeout: 20000 },
    );
    if (response?.result?.code !== 200)
      throw new Error(response?.result?.message || "request failed");
    result.value = response.result;
  } catch (error) {
    loadError.value = error?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
};
const handleGlobalDataRefresh = (event) =>
  void loadTopic(Boolean(event?.detail?.force));
onMounted(() => {
  window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  void loadTopic(false);
});
onActivated(() => {
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
});
onDeactivated(() =>
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh),
);
onBeforeUnmount(() => {
  clearTimeout(querySyncTimer);
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
});
watch(locale, () => void loadTopic(false));
</script>

<style scoped>
.ai-topic {
  display: grid;
  gap: 14px;
  width: min(100%, 1240px);
  margin: 0 auto;
}
.topic-section {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 16px;
  background: var(--n-color, #fff);
}
.topic-alert {
  border-radius: 12px;
}
.topic-workspace-header {
  display: grid;
  gap: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
}
.topic-workspace-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.topic-workspace-title {
  min-width: 0;
}
.topic-workspace-title h1 {
  margin: 0;
  font-size: clamp(20px, 2vw, 26px);
  line-height: 1.2;
}
.topic-workspace-title p {
  max-width: 940px;
  margin: 4px 0 0;
  color: var(--n-text-color-3);
  font-size: 12px;
  line-height: 1.45;
}
.hero-stats {
  display: grid;
  min-width: 100px;
  justify-items: end;
}
.hero-stats strong {
  font-size: 28px;
  line-height: 1;
}
.hero-stats span,
.hero-stats em {
  color: var(--n-text-color-3);
  font-size: 11px;
  font-style: normal;
}
.event-toolbar {
  margin-bottom: 9px;
}
.toolbar-primary {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
.toolbar-title {
  display: flex;
  align-items: baseline;
  gap: 7px;
  flex: 0 0 auto;
  white-space: nowrap;
}
.toolbar-title h2 {
  margin: 0;
  font-size: 15px;
}
.toolbar-title span {
  color: var(--n-text-color-3);
  font-size: 10px;
}
.topic-search {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  flex: 0 1 220px;
  width: clamp(170px, 18vw, 230px);
  min-width: 150px;
  height: 30px;
  padding: 0 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
}
.topic-search:focus-within {
  border-color: var(--n-text-color-3);
}
.topic-search svg {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  color: var(--n-text-color-3);
}
.topic-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color);
  font: inherit;
  font-size: 11px;
}
.toolbar-filters {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
}
.toolbar-filters :deep(.compact-filter) {
  max-width: 150px;
}
.toolbar-filters :deep(.compact-filter:nth-child(2)) {
  max-width: 180px;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex: 0 0 auto;
  min-width: max-content;
  white-space: nowrap;
}
.result-count {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.result-count strong {
  font-size: 16px;
}
.result-count span {
  color: var(--n-text-color-3);
  font-size: 10px;
}
.resonance-toggle,
.reset-filter {
  min-height: 30px;
  padding: 0 8px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.resonance-toggle:hover,
.reset-filter:hover,
.resonance-toggle.active {
  border-color: currentColor;
  color: var(--n-text-color);
  background: var(--n-action-color);
}
@media (max-width: 1100px) and (min-width: 721px) {
  .toolbar-primary {
    flex-wrap: wrap;
  }
  .toolbar-filters {
    order: 3;
    flex-basis: 100%;
  }
}
.ai-lane-item {
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 7px 1px;
  border-bottom: 1px solid var(--n-border-color);
  color: inherit;
  text-decoration: none;
}
.ai-lane-item:last-child { border-bottom: 0; }
.ai-lane-item:hover strong, .ai-lane-item:focus-visible strong { text-decoration: underline; }
.ai-lane-item:focus-visible { outline: none; }
.ai-lane-item > img {
  width: 62px;
  height: 36px;
  border-radius: 5px;
  object-fit: cover;
  background: var(--n-color);
}
.ai-lane-item > div { min-width: 0; }
.ai-lane-item strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 1.35;
}
.ai-lane-item p {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin: 3px 0 0;
  color: var(--n-text-color-3);
  font-size: 9px;
  white-space: nowrap;
}
.ai-lane-item p span { overflow: hidden; text-overflow: ellipsis; }
.ai-lane-item p b, .ai-lane-item p em {
  flex: 0 0 auto;
  font-size: 9px;
  font-style: normal;
}
.ai-lane-item p b { color: var(--n-text-color); }
.event-list {
  display: grid;
}
.event-item {
  display: grid;
  grid-template-columns: 30px 96px minmax(0, 1fr) auto;
  gap: 11px;
  align-items: center;
  min-width: 0;
  padding: 11px 2px;
  border-top: 1px solid var(--n-border-color);
}
.event-rank {
  align-self: start;
  padding-top: 3px;
  color: var(--n-text-color-3);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.event-item.is-top-signal {
  margin-inline: -6px;
  padding-inline: 8px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--n-action-color) 78%, transparent);
}
.event-item.is-top-signal + .event-item {
  border-top-color: transparent;
}
.event-item.is-top-signal .event-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  color: var(--n-text-color);
  background: var(--n-color);
  font-size: 11px;
  font-weight: 800;
}
.event-item.is-top-signal .event-title h3 {
  font-size: 15px;
  font-weight: 700;
}
.event-item.is-top-1 {
  background: color-mix(
    in srgb,
    var(--n-action-color) 58%,
    rgba(99, 102, 241, 0.12)
  );
}
.event-cover {
  width: 96px;
  height: 54px;
  overflow: hidden;
  border-radius: 6px;
  background: var(--n-action-color);
}
.event-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.event-main {
  min-width: 0;
}
.event-source-line {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: var(--n-text-color-3);
  font-size: 10px;
}
.event-source-line img {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  object-fit: contain;
}
.event-source-line em {
  padding: 1px 5px;
  border: 1px solid var(--n-border-color);
  border-radius: 999px;
  color: var(--n-text-color);
  font-style: normal;
  white-space: nowrap;
}
.event-title {
  color: inherit;
  text-decoration: none;
}
.event-title h3 {
  margin: 4px 0 0;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 650;
}
.event-desc {
  display: -webkit-box;
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 11px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}
.event-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-top: 5px;
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 10px;
  white-space: nowrap;
}
.event-meta strong {
  color: var(--n-text-color);
  font-size: 11px;
}
.category-pill,
.source-pill {
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--n-action-color);
}
.category-pill {
  color: var(--n-text-color-2);
  font-weight: 600;
}
.source-pill {
  color: var(--n-text-color-3);
}
.event-open {
  min-width: 72px;
  padding: 6px 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  color: var(--n-text-color);
  font-size: 11px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}
.event-title:hover h3,
.event-open:hover {
  text-decoration: underline;
}
.event-list {
  scroll-margin-top: 74px;
}
.event-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 2px 2px;
  border-top: 1px solid var(--n-border-color);
  color: var(--n-text-color-3);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.topic-loading {
  padding: 10px 2px;
}
.topic-empty {
  padding: 44px 0;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 720px) {
  .ai-topic {
    gap: 10px;
  }
  .topic-section {
    padding: 13px;
    border-radius: 12px;
  }
  .topic-workspace-header {
    gap: 6px;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  .topic-workspace-summary {
    gap: 8px;
  }
  .topic-workspace-title h1 {
    font-size: 18px;
  }
  .topic-workspace-title p {
    display: -webkit-box;
    margin-top: 3px;
    overflow: hidden;
    font-size: 11px;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .hero-stats {
    min-width: 52px;
  }
  .hero-stats strong {
    font-size: 21px;
  }
  .hero-stats em {
    display: none;
  }
  .toolbar-primary {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
  .toolbar-title {
    display: none;
  }
  .topic-search {
    min-width: 0;
    max-width: none;
    height: 30px;
  }
  .toolbar-actions {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 4px;
  }
  .result-count {
    display: none;
  }
  .toolbar-filters {
    margin-right: -13px;
    padding-right: 13px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .toolbar-filters::-webkit-scrollbar {
    display: none;
  }
  .toolbar-filters :deep(.compact-filter) {
    max-width: 165px;
    flex: 0 0 auto;
  }
  .event-item {
    grid-template-columns: 24px 62px minmax(0, 1fr);
    gap: 8px;
    padding: 10px 0;
  }
  .event-cover {
    width: 62px;
    height: 36px;
  }
  .event-open {
    display: none;
  }
  .event-source-line em {
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .event-title h3 {
    font-size: 13px;
  }
  .event-desc {
    -webkit-line-clamp: 2;
  }
  .event-meta {
    gap: 5px;
  }
  .source-pill:nth-of-type(n + 4) {
    display: none;
  }
  .event-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    overflow-x: auto;
  }
}
</style>
