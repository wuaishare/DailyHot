<template>
  <section class="chigua-topic">
    <n-alert
      v-if="loadError"
      type="error"
      :show-icon="false"
      class="topic-alert"
    >
      {{ loadError }}
    </n-alert>
    <n-alert
      v-else-if="showDegradedWarning"
      type="warning"
      :show-icon="false"
      class="topic-alert"
    >
      {{ copy.degraded }}
    </n-alert>

    <section class="topic-section">
      <div class="topic-workspace-header">
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
              <path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />
            </svg>
            <input
              v-model.trim="searchQuery"
              type="search"
              :placeholder="ui.searchPlaceholder"
              @keydown.esc="searchQuery = ''"
            />
          </label>
          <div class="toolbar-filters" role="group" :aria-label="ui.filters">
            <CompactFilter v-model="activeCategory" :label="ui.category" :aria-label="ui.category" :options="categoryOptions" />
            <CompactFilter v-model="activeSource" :label="ui.source" :aria-label="ui.source" :options="sourceOptions" />
            <CompactFilter v-model="activeSort" :label="ui.sort" :aria-label="ui.sort" :options="sortOptions" :show-count="false" />
            <button v-if="hasFilters" type="button" class="reset-filter" @click="resetFilters">{{ ui.reset }}</button>
          </div>
          <div class="toolbar-actions">
            <div class="result-count"><strong>{{ filteredData.length }}</strong><span>{{ ui.matches }}</span></div>
            <button
              v-if="resonanceMatchCount"
              type="button"
              class="resonance-toggle"
              :class="{ active: activeConfirmed }"
              :aria-pressed="activeConfirmed"
              @click="activeConfirmed = !activeConfirmed"
            >{{ ui.resonance }} <span>{{ resonanceMatchCount }}</span></button>
            <n-button size="small" tertiary :loading="loading" @click="loadTopic(true)">{{ ui.refresh }}</n-button>
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
            class="event-lane-item"
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
                <b v-if="eventSourceCount(item) > 1">{{ eventSourceCount(item) }} {{ ui.platforms }}</b>
                <em v-else-if="item.hot">{{ formatHot(item.hot) }}</em>
              </p>
            </div>
          </a>
        </template>
      </TopicLaneGrid>

      <div v-if="loading && !result" class="topic-loading">
        <n-skeleton text :repeat="9" />
      </div>
      <div v-else-if="filteredData.length" ref="eventListRef" class="event-list">
        <article
          v-for="(item, index) in pagedData"
          :key="item.id"
          class="event-item"
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
                v-if="isResonanceItem(item)"
                :title="confirmationTitle(item)"
              >
                {{ effectiveResonanceSourceCount(item) }} {{ ui.platformResonance }}
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
                categoryLabel(eventCategory(item))
              }}</span>
              <strong v-if="item.hot">{{ formatHot(item.hot) }}</strong>
              <time
                v-if="item.timestamp"
                :title="formatFullTime(item.timestamp)"
                >{{ formatFreshness(item.timestamp) }}</time
              >
              <span
                v-for="confirmation in visibleConfirmations(item)"
                :key="`${item.id}-${confirmation.source}-${confirmation.variant || 'default'}`"
                class="source-pill"
              >
                {{ evidenceLabel(confirmation, { includeRole: true }) }}
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
          <div class="event-pagination__meta">
            <span>{{ pageRangeText }}</span>
            <CompactFilter
              v-model="pageSize"
              :label="ui.perPage"
              :aria-label="ui.perPage"
              :options="pageSizeOptions"
              :show-count="false"
              :default-value="30"
            />
          </div>
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
import { getTopicFeed } from "@/api";
import { CHIGUA_TOPIC_METADATA } from "@/config/site-metadata.mjs";
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
const currentPage = ref(Number.isFinite(routePage) && routePage > 0 ? routePage : 1);
const pageSize = ref(PAGE_SIZE_VALUES.includes(routePageSize) ? routePageSize : 30);
const eventListRef = ref(null);
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(
  () => CHIGUA_TOPIC_METADATA[locale.value] || CHIGUA_TOPIC_METADATA["zh-CN"],
);
const data = computed(() => result.value?.data || []);
const dashboard = computed(() => result.value?.dashboard || null);
const failedSourceCount = computed(() =>
  Number(dashboard.value?.failedSourceCount || 0),
);
const showDegradedWarning = computed(() => failedSourceCount.value > 0);

const UI_COPY = {
  "zh-CN": {
    events: "条事件",
    sources: "个核心榜单",
    source: "核心榜单",
    corroboration: "佐证",
    support: "支撑",
    search: "搜索事件",
    searchPlaceholder: "搜索人物、事件、关键词…",
    matches: "条结果",
    resonance: "多平台共振",
    refresh: "刷新",
    filters: "吃瓜事件筛选",
    perPage: "每页",
    category: "分类",
    sort: "排序",
    smart: "吃瓜热度",
    resonanceFirst: "共振优先",
    latest: "最新优先",
    reset: "清除筛选",
    all: "全部",
    platforms: "个平台",
    platformResonance: "平台共振",
    open: "查看事件",
    featured: {
      resonance: "多平台共振",
      gossip: "明星八卦",
      celebrity: "明星动态",
      filmTv: "影视剧",
      variety: "综艺",
    },
    categories: {
      gossip: "明星八卦",
      celebrity: "明星艺人",
      "film-tv": "影视剧",
      variety: "综艺",
      music: "音乐",
      creator: "网红主播",
      other: "其他娱乐",
    },
  },
  en: {
    events: "events",
    sources: "core boards",
    source: "Core board",
    corroboration: "corroboration",
    support: "support",
    search: "Search events",
    searchPlaceholder: "Search people, events or keywords…",
    matches: "results",
    resonance: "Cross-platform",
    refresh: "Refresh",
    filters: "Entertainment filters",
    perPage: "Per page",
    category: "Category",
    sort: "Sort",
    smart: "Buzz score",
    resonanceFirst: "Resonance first",
    latest: "Latest",
    reset: "Reset",
    all: "All",
    platforms: "platforms",
    platformResonance: "platforms",
    open: "View event",
    featured: {
      resonance: "Cross-platform",
      gossip: "Celebrity Gossip",
      celebrity: "Celebrities",
      filmTv: "Film & TV",
      variety: "Variety",
    },
    categories: {
      gossip: "Celebrity Gossip",
      celebrity: "Celebrities",
      "film-tv": "Film & TV",
      variety: "Variety",
      music: "Music",
      creator: "Creators & Streamers",
      other: "Other Entertainment",
    },
  },
  "zh-TW": {
    events: "筆事件",
    sources: "個核心榜單",
    source: "核心榜單",
    corroboration: "佐證",
    support: "支撐",
    search: "搜尋事件",
    searchPlaceholder: "搜尋人物、事件、關鍵字…",
    matches: "筆結果",
    resonance: "多平台共振",
    refresh: "重新整理",
    filters: "吃瓜事件篩選",
    perPage: "每頁",
    category: "分類",
    sort: "排序",
    smart: "吃瓜熱度",
    resonanceFirst: "共振優先",
    latest: "最新優先",
    reset: "清除篩選",
    all: "全部",
    platforms: "個平台",
    platformResonance: "平台共振",
    open: "查看事件",
    featured: {
      resonance: "多平台共振",
      gossip: "明星八卦",
      celebrity: "明星動態",
      filmTv: "影視劇",
      variety: "綜藝",
    },
    categories: {
      gossip: "明星八卦",
      celebrity: "明星藝人",
      "film-tv": "影視劇",
      variety: "綜藝",
      music: "音樂",
      creator: "網紅主播",
      other: "其他娛樂",
    },
  },
  ja: {
    events: "件",
    sources: "主要ランキング",
    source: "主要ランキング",
    corroboration: "補強",
    support: "補助",
    search: "話題を検索",
    searchPlaceholder: "人物・出来事・キーワードを検索…",
    matches: "件",
    resonance: "複数平台",
    refresh: "更新",
    filters: "エンタメフィルター",
    perPage: "件数",
    category: "分類",
    sort: "並び順",
    smart: "話題度",
    resonanceFirst: "共振優先",
    latest: "新着順",
    reset: "解除",
    all: "すべて",
    platforms: "平台",
    platformResonance: "平台共振",
    open: "イベントを見る",
    featured: {
      resonance: "複数プラットフォーム",
      gossip: "芸能ゴシップ",
      celebrity: "芸能人",
      filmTv: "映画・ドラマ",
      variety: "バラエティ",
    },
    categories: {
      gossip: "芸能ゴシップ",
      celebrity: "芸能人",
      "film-tv": "映画・ドラマ",
      variety: "バラエティ",
      music: "音楽",
      creator: "配信者・クリエイター",
      other: "その他エンタメ",
    },
  },
  ko: {
    events: "개 이슈",
    sources: "개 핵심 랭킹",
    source: "핵심 랭킹",
    corroboration: "보강",
    support: "지원",
    search: "이슈 검색",
    searchPlaceholder: "인물, 사건, 키워드 검색…",
    matches: "개 결과",
    resonance: "다중 플랫폼",
    refresh: "새로고침",
    filters: "엔터테인먼트 필터",
    perPage: "페이지당",
    category: "분류",
    sort: "정렬",
    smart: "화제 점수",
    resonanceFirst: "공명 우선",
    latest: "최신순",
    reset: "초기화",
    all: "전체",
    platforms: "플랫폼",
    platformResonance: "플랫폼 공명",
    open: "이벤트 보기",
    featured: {
      resonance: "다중 플랫폼",
      gossip: "연예 가십",
      celebrity: "연예인",
      filmTv: "영화·드라마",
      variety: "예능",
    },
    categories: {
      gossip: "연예 가십",
      celebrity: "연예인",
      "film-tv": "영화·드라마",
      variety: "예능",
      music: "음악",
      creator: "크리에이터·스트리머",
      other: "기타 엔터테인먼트",
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
  "gossip",
  "celebrity",
  "film-tv",
  "variety",
  "music",
  "creator",
  "other",
];
const eventMeta = (item) => item?.extra?.hotEvent || {};
const eventCategory = (item) => eventMeta(item).category || "other";
const eventScore = (item) => Number(eventMeta(item).score || 0);
const eventSourceCount = (item) => Number(eventMeta(item).sourceCount || 1);
const eventSources = (item) =>
  Array.isArray(eventMeta(item).sources)
    ? eventMeta(item).sources
    : [primarySource(item)];
const confirmations = (item) =>
  Array.isArray(eventMeta(item).confirmations)
    ? eventMeta(item).confirmations
    : [];
const evidenceKey = (entry) =>
  `${entry?.source || ""}::${entry?.variant || ""}`;
const sourceNameForEvidence = (entry) => {
  const canonical = String(entry?.sourceLabel || "").trim();
  if (locale.value === "zh-CN" && canonical) return canonical;
  return getSourceLabel(
    entry?.source,
    locale.value,
    canonical || entry?.source || "",
  );
};
const evidenceLabel = (entry, { includeRole = false } = {}) => {
  const source = sourceNameForEvidence(entry);
  const variant = String(entry?.variantLabel || "").trim();
  const role =
    entry?.role === "corroboration"
      ? ui.value.corroboration
      : entry?.role === "support"
        ? ui.value.support
        : "";
  return [source, variant, includeRole ? role : ""].filter(Boolean).join(" · ");
};
const primarySource = (item) =>
  confirmations(item)[0]?.source || eventSources(item)[0] || "douyin";
const sourceLabel = (item) =>
  confirmations(item)[0]
    ? evidenceLabel(confirmations(item)[0])
    : getSourceLabel(primarySource(item), locale.value, primarySource(item));
const categoryLabel = (category) => ui.value.categories[category] || category;
const visibleConfirmations = (item) => confirmations(item).slice(1, 5);
const confirmationTitle = (item) =>
  confirmations(item)
    .map((entry) => evidenceLabel(entry, { includeRole: true }))
    .join(" + ");
const coreEvidenceKeys = (item) =>
  confirmations(item)
    .filter((entry) => entry.role === "primary" || entry.role === "support")
    .map(evidenceKey);
const textFor = (item) =>
  `${item.title || ""} ${item.desc || ""} ${confirmationTitle(item)}`.toLowerCase();
const isResonanceItem = (item) => eventSourceCount(item) > 1;
const effectiveResonanceSourceCount = (item) => eventSourceCount(item);
const resonanceMatchCount = computed(
  () => data.value.filter((item) => isResonanceItem(item)).length,
);

const categoryOptions = computed(() => [
  { value: "all", label: ui.value.all, count: data.value.length },
  ...CATEGORY_ORDER.map((category) => ({
    value: category,
    label: categoryLabel(category),
    count: data.value.filter((item) => eventCategory(item) === category).length,
  })).filter((item) => item.count > 0),
]);
const sourceOptions = computed(() => {
  const evidence = new Map();
  for (const item of data.value) {
    const seen = new Set();
    for (const entry of confirmations(item)) {
      if (entry.role !== "primary" && entry.role !== "support") continue;
      const key = evidenceKey(entry);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const current = evidence.get(key) || { entry, count: 0 };
      current.count += 1;
      evidence.set(key, current);
    }
  }
  const options = [...evidence.entries()]
    .map(([value, current]) => ({
      value,
      label: evidenceLabel(current.entry),
      count: current.count,
      status: "ok",
      detail:
        current.entry.role === "support" ? ui.value.support : current.entry.variantLabel || "",
    }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
  return [
    {
      value: "all",
      label: ui.value.all,
      count: data.value.length,
      status: failedSourceCount.value ? "partial" : "ok",
      detail: failedSourceCount.value ? copy.value.degraded : formatUpdated(result.value?.updateTime),
    },
    ...options,
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
    if (
      activeCategory.value !== "all" &&
      eventCategory(item) !== activeCategory.value
    )
      return false;
    if (
      activeSource.value !== "all" &&
      !coreEvidenceKeys(item).includes(activeSource.value)
    )
      return false;
    if (activeConfirmed.value && !isResonanceItem(item)) return false;
    return true;
  });
  return rows.slice().sort((a, b) => {
    if (activeSort.value === "resonance")
      return (
        effectiveResonanceSourceCount(b) - effectiveResonanceSourceCount(a) ||
        eventScore(b) - eventScore(a)
      );
    if (activeSort.value === "latest")
      return (
        Number(b.timestamp || 0) - Number(a.timestamp || 0) ||
        eventScore(b) - eventScore(a)
      );
    return (
      eventScore(b) - eventScore(a) ||
      effectiveResonanceSourceCount(b) - effectiveResonanceSourceCount(a)
    );
  });
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value)),
);
const pageStart = computed(() => (currentPage.value - 1) * pageSize.value);
const pagedData = computed(() =>
  filteredData.value.slice(pageStart.value, pageStart.value + pageSize.value),
);
const pageRangeText = computed(() => {
  if (!filteredData.value.length) return "0 / 0";
  const start = pageStart.value + 1;
  const end = Math.min(pageStart.value + pageSize.value, filteredData.value.length);
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
    items.slice().sort(
      (a, b) =>
        effectiveResonanceSourceCount(b) - effectiveResonanceSourceCount(a) ||
        eventScore(b) - eventScore(a),
    );
  const lane = (key, category) => {
    const items = byScore(data.value.filter((item) => eventCategory(item) === category));
    return {
      key,
      label: ui.value.featured[key],
      count: items.length,
      items: items.slice(0, FEATURED_LANE_LIMIT),
      actionLabel: `${viewAllLabel.value} ${items.length}`,
      filter: { category },
    };
  };
  return [
    lane("gossip", "gossip"),
    lane("celebrity", "celebrity"),
    lane("filmTv", "film-tv"),
    lane("variety", "variety"),
  ].filter((group) => group.items.length);
});
const selectFeaturedLane = (lane) => {
  activeSource.value = "all";
  activeSort.value = "smart";
  activeCategory.value = lane?.filter?.category || "all";
  activeConfirmed.value = Boolean(lane?.filter?.confirmed);
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

const formatHot = (value) => {
  const num = Number(value || 0);
  if (!num) return "";
  if (num >= 100000000)
    return `${(num / 100000000).toFixed(1).replace(/\.0$/, "")}亿`;
  if (num >= 10000)
    return `${(num / 10000).toFixed(num >= 100000 ? 0 : 1).replace(/\.0$/, "")}万`;
  return new Intl.NumberFormat(locale.value).format(num);
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
  [searchQuery, activeCategory, activeSource, activeSort, activeConfirmed, pageSize],
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

const normalizeTopicFeed = (feed) => {
  const targets = Array.isArray(feed?.coverage?.targets) ? feed.coverage.targets : [];
  const events = Array.isArray(feed?.events) ? feed.events : [];
  const groupedFeeds = new Map();
  for (const target of targets) {
    const key = String(target?.sourceKey || "").trim();
    if (!key) continue;
    const current = groupedFeeds.get(key) || {
      source: key,
      label: target.sourceName || key,
      status: "ok",
      count: 0,
      variants: [],
    };
    current.count += Number(target.itemCount || 0);
    if (target.variantLabel && !current.variants.includes(target.variantLabel)) current.variants.push(target.variantLabel);
    if (target.status !== "active") current.status = target.status || "empty";
    groupedFeeds.set(key, current);
  }
  const data = events.map((event, index) => {
    const sources = Array.isArray(event.sources) ? event.sources : [];
    const primary = sources[0] || {};
    const sourceKeys = [...new Set(sources.map((source) => source.sourceKey).filter(Boolean))];
    const confirmations = sources.map((source) => ({
      source: source.sourceKey,
      sourceLabel: source.sourceName || source.sourceKey,
      variant: source.variant,
      variantLabel: source.variantLabel,
      role: source.role,
      rank: source.rank,
      url: source.url,
    }));
    return {
      id: event.eventKey || `chigua-${index + 1}`,
      title: event.title,
      url: primary.url || "#",
      mobileUrl: primary.mobileUrl || primary.url || "#",
      cover: primary.cover || "",
      hot: primary.hot,
      timestamp: Date.parse(event.lastSeenAt || feed.generatedAt || "") || Date.now(),
      badges: primary.badges || [],
      extra: {
        hotEvent: {
          category: event.subtype || "other",
          score: Number(event.score || 0),
          sourceCount: Number(event.sourceCount || sourceKeys.length || 1),
          sources: sourceKeys,
          confirmations,
          bestRank: event.bestRank,
          currentWaveStartedAt: event.currentWaveStartedAt,
        },
      },
    };
  });
  return {
    code: 200,
    name: "chigua-topic",
    title: feed?.topic?.label || "吃瓜",
    type: "娱乐热点追踪",
    description: feed?.topic?.description || "",
    total: data.length,
    updateTime: feed?.generatedAt || new Date().toISOString(),
    data,
    dashboard: {
      sourceCount: targets.filter(
        (target) =>
          target.status === "active" &&
          (target.role === "primary" || target.role === "support"),
      ).length,
      failedSourceCount: targets.filter((target) => target.status === "failed").length,
      total: data.length,
      multiSourceCount: Number(feed?.coverage?.multiSourceEventCount || 0),
      feeds: [...groupedFeeds.values()],
    },
  };
};

const loadTopic = async (force = false) => {
  loading.value = true;
  loadError.value = "";
  try {
    const feed = await getTopicFeed("chigua", { limit: 160, maxRank: 80, minSources: 1, force });
    result.value = normalizeTopicFeed(feed);
  } catch (error) {
    loadError.value = error?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
};
const handleGlobalDataRefresh = (event) => {
  void loadTopic(Boolean(event?.detail?.force));
};
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
.chigua-topic {
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
.chigua-topic :deep(.topic-lane-grid) {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 7px;
  margin-bottom: 10px;
}
.chigua-topic :deep(.topic-lane) {
  padding: 8px;
}
.event-lane-item {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 7px 1px;
  border-bottom: 1px solid var(--n-border-color);
  color: inherit;
  text-decoration: none;
}
.event-lane-item:last-child {
  border-bottom: 0;
}
.event-lane-item:hover strong,
.event-lane-item:focus-visible strong {
  text-decoration: underline;
}
.event-lane-item:focus-visible {
  outline: none;
}
.event-lane-item > img {
  width: 56px;
  height: 34px;
  border-radius: 5px;
  object-fit: cover;
  background: var(--n-color);
}
.event-lane-item > div {
  min-width: 0;
}
.event-lane-item strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 1.35;
}
.event-lane-item p {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin: 3px 0 0;
  color: var(--n-text-color-3);
  font-size: 9px;
  white-space: nowrap;
}
.event-lane-item p span {
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-lane-item p b {
  flex: 0 0 auto;
  color: var(--n-text-color);
  font-size: 9px;
}
.event-lane-item p em {
  flex: 0 0 auto;
  font-style: normal;
}
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
.source-pill,
.intelligence-pill,
.verified-resonance-pill {
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
.intelligence-pill {
  border: 1px solid color-mix(in srgb, var(--n-primary-color) 22%, transparent);
  background: color-mix(in srgb, var(--n-primary-color) 8%, transparent);
  color: var(--n-primary-color);
  font-weight: 650;
}
.verified-resonance-pill {
  border: 1px solid color-mix(in srgb, var(--n-success-color, #18a058) 28%, transparent);
  background: color-mix(in srgb, var(--n-success-color, #18a058) 9%, transparent);
  color: var(--n-success-color, #18a058);
  font-weight: 680;
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

.event-pagination__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.event-pagination__meta :deep(.compact-filter) {
  max-width: 110px;
}
@media (max-width: 1100px) and (min-width: 721px) {
  .chigua-topic :deep(.topic-lane-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .chigua-topic {
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
  .event-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    overflow-x: auto;
  }
}
</style>
