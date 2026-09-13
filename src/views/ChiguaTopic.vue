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

      <div class="topic-layout">
        <aside class="topic-category-rail" :aria-label="ui.categoryNav">
          <div class="topic-category-card">
            <div class="topic-category-title">
              <strong>{{ ui.categoryNav }}</strong>
              <span>{{ data.length }}</span>
            </div>
            <nav>
              <button
                type="button"
                class="topic-category-item"
                :class="{ active: activeCategory === 'all' }"
                :aria-current="activeCategory === 'all' ? 'true' : undefined"
                @click="setCategory('all')"
              >
                <span>{{ ui.all }}</span>
                <em>{{ data.length }}</em>
              </button>
              <button
                v-for="option in categoryOptions.slice(1)"
                :key="option.value"
                type="button"
                class="topic-category-item"
                :class="[`is-${option.value}`, { active: activeCategory === option.value }]"
                :aria-current="activeCategory === option.value ? 'true' : undefined"
                @click="setCategory(option.value)"
              >
                <span>{{ option.label }}</span>
                <em>{{ option.count }}</em>
              </button>
            </nav>
          </div>
        </aside>

        <main class="topic-main">
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

          <TrendIntelligenceStrip
            v-if="trendItems.length"
            :items="trendItems"
            :total="trendMatchCount"
            :window-seconds="result?.dynamics?.windowSeconds || 3600"
            :locale="locale"
          />

          <div v-if="loading && !result" class="topic-loading">
            <n-skeleton text :repeat="9" />
          </div>
          <div v-else-if="filteredData.length" ref="eventListRef" class="event-list">
            <article
              v-for="(item, index) in pagedData"
              :key="item.id"
              class="event-item"
            >
              <span class="event-rank" :class="rankClass(pageStart + index + 1)">{{
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
                    class="event-resonance"
                    :title="confirmationTitle(item)"
                  >
                    {{ effectiveResonanceSourceCount(item) }} {{ ui.platformResonance }}
                  </em>
                </div>
                <div class="event-title-row">
                  <a
                    class="event-title"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <h3>{{ item.title }}</h3>
                  </a>
                  <RankingBadgeGroup
                    v-if="visibleRankingBadges(item).length"
                    :badges="visibleRankingBadges(item)"
                  />
                </div>
                <p v-if="item.desc" class="event-desc">{{ item.desc }}</p>
                <div class="event-meta">
                  <span class="category-pill" :class="`is-${eventCategory(item)}`">{{
                    categoryLabel(eventCategory(item))
                  }}</span>
                  <span
                    v-if="eventTrend(item)"
                    class="trend-pill"
                    :class="`is-${eventTrend(item).signal}`"
                  >
                    {{ trendSignalLabel(eventTrend(item).signal) }}
                    <b>{{ trendMetric(eventTrend(item)) }}</b>
                  </span>
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
        </main>

        <aside class="topic-controls" :aria-label="ui.browseSettings">
          <div class="topic-controls-card">
            <div class="topic-controls-title">
              <strong>{{ ui.browseSettings }}</strong>
              <span>{{ filteredData.length }}</span>
            </div>
            <section class="topic-control-section">
              <span>{{ ui.focus }}</span>
              <CompactFilter v-model="activeFocus" :label="ui.focus" :aria-label="ui.focus" :options="focusOptions" />
            </section>
            <section class="topic-control-section">
              <span>{{ ui.source }}</span>
              <CompactFilter v-model="activeSource" :label="ui.source" :aria-label="ui.source" :options="sourceOptions" />
            </section>
            <section class="topic-control-section">
              <span>{{ ui.sort }}</span>
              <CompactFilter v-model="activeSort" :label="ui.sort" :aria-label="ui.sort" :options="sortOptions" :show-count="false" />
            </section>
            <button
              v-if="resonanceMatchCount"
              type="button"
              class="resonance-toggle"
              :class="{ active: activeConfirmed }"
              :aria-pressed="activeConfirmed"
              @click="activeConfirmed = !activeConfirmed"
            >{{ ui.resonance }} <span>{{ resonanceMatchCount }}</span></button>
            <button v-if="hasFilters" type="button" class="reset-filter" @click="resetFilters">{{ ui.reset }}</button>
            <n-button size="small" tertiary :loading="loading" @click="loadTopic(true)">{{ ui.refresh }}</n-button>
          </div>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup>
import CompactFilter from "@/components/CompactFilter.vue";
import TopicLaneGrid from "@/components/TopicLaneGrid.vue";
import TrendIntelligenceStrip from "@/components/TrendIntelligenceStrip.vue";
import RankingBadgeGroup from "@/components/RankingBadgeGroup.vue";
import { getTopicFeed } from "@/api";
import { CHIGUA_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { normalizeRankingBadges } from "@/utils/rankingBadges";
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
const activeFocus = ref(
  ["fresh", "rising", "resonance", "hot"].includes(route.query.focus)
    ? route.query.focus
    : "all",
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
    categoryNav: "吃瓜分类",
    browseSettings: "追瓜设置",
    focus: "情报状态",
    focusAll: "全部动态",
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
      fresh: "新瓜速递",
      rising: "正在发酵",
      resonance: "多平台共振",
      hot: "高位热瓜",
    },
    featuredSubtitles: {
      fresh: "优先看刚进入这一轮热议的新事件",
      rising: "榜位正在上升、重回榜单或进入前十",
      resonance: "多个独立平台同时出现的娱乐事件",
      hot: "已经进入核心榜单前十的高位事件",
    },
    trendSignals: { reentry: "重新上榜", breakthrough: "进入前十", rising: "榜位上升", falling: "榜位下降", new: "新上榜" },
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
    categoryNav: "Entertainment topics",
    browseSettings: "Tracking settings",
    focus: "Signal",
    focusAll: "All signals",
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
      fresh: "Just in",
      rising: "Gaining traction",
      resonance: "Cross-platform",
      hot: "Top-ranked",
    },
    featuredSubtitles: { fresh: "New events entering the current buzz cycle", rising: "Moving up, re-entering or breaking into the top 10", resonance: "Entertainment events appearing across independent platforms", hot: "Events already ranked in the top 10 of a core board" },
    trendSignals: { reentry: "Re-entered", breakthrough: "Top 10", rising: "Rank up", falling: "Rank down", new: "New entry" },
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
    categoryNav: "吃瓜分類",
    browseSettings: "追瓜設定",
    focus: "情報狀態",
    focusAll: "全部動態",
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
      fresh: "新瓜速遞",
      rising: "正在發酵",
      resonance: "多平台共振",
      hot: "高位熱瓜",
    },
    featuredSubtitles: { fresh: "優先看剛進入這一輪熱議的新事件", rising: "榜位正在上升、重回榜單或進入前十", resonance: "多個獨立平台同時出現的娛樂事件", hot: "已經進入核心榜單前十的高位事件" },
    trendSignals: { reentry: "重新上榜", breakthrough: "進入前十", rising: "榜位上升", falling: "榜位下降", new: "新上榜" },
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
    categoryNav: "エンタメ分類",
    browseSettings: "追跡設定",
    focus: "シグナル",
    focusAll: "すべて",
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
      fresh: "新着速報",
      rising: "上昇中",
      resonance: "複数プラットフォーム",
      hot: "上位トピック",
    },
    featuredSubtitles: { fresh: "現在の話題サイクルに入った新しいイベント", rising: "順位上昇・再ランクイン・トップ10入り", resonance: "複数の独立プラットフォームで同時に出現", hot: "主要ランキングですでにトップ10入り" },
    trendSignals: { reentry: "再ランクイン", breakthrough: "トップ10入り", rising: "順位上昇", falling: "順位下降", new: "新規ランクイン" },
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
    categoryNav: "엔터테인먼트 분류",
    browseSettings: "추적 설정",
    focus: "신호",
    focusAll: "전체",
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
      fresh: "새 소식",
      rising: "상승 중",
      resonance: "다중 플랫폼",
      hot: "상위 이슈",
    },
    featuredSubtitles: { fresh: "현재 화제 흐름에 새로 진입한 이벤트", rising: "순위 상승·재진입·TOP 10 진입", resonance: "여러 독립 플랫폼에서 동시에 포착", hot: "핵심 랭킹 TOP 10에 이미 진입" },
    trendSignals: { reentry: "재진입", breakthrough: "TOP 10 진입", rising: "순위 상승", falling: "순위 하락", new: "신규 진입" },
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
const eventBestRank = (item) => Number(eventMeta(item).bestRank || 0);
const eventTrend = (item) => eventMeta(item).trend || null;
const FRESH_WINDOW_MS = 2 * 60 * 60 * 1000;
const RISING_TREND_SIGNALS = new Set(["reentry", "breakthrough", "rising"]);
const eventWaveStartedAt = (item) => {
  const value = Date.parse(eventMeta(item).currentWaveStartedAt || "");
  return Number.isFinite(value) && value > 0 ? value : Number(item?.timestamp || 0);
};
const topicReferenceTime = () => Date.parse(result.value?.updateTime || "") || Date.now();
const isFreshEvent = (item) => {
  const startedAt = eventWaveStartedAt(item);
  const age = topicReferenceTime() - startedAt;
  return startedAt > 0 && age >= -120000 && age <= FRESH_WINDOW_MS;
};
const isRisingEvent = (item) => RISING_TREND_SIGNALS.has(eventTrend(item)?.signal);
const isHotEvent = (item) => eventBestRank(item) > 0 && eventBestRank(item) <= 10;
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
const visibleRankingBadges = (item) =>
  normalizeRankingBadges(item?.badges, 2).filter((badge) => badge.placement !== "prefix");
const trendSignalLabel = (signal) => ui.value.trendSignals?.[signal] || signal || "";
const trendMetric = (trend) => {
  const rank = Number(trend?.currentRank || 0);
  const baselineRank = Number(trend?.baselineRank || 0);
  if (
    !["reentry", "new"].includes(trend?.signal) &&
    baselineRank > 0 &&
    rank > 0
  ) return `#${baselineRank} → #${rank}`;
  return rank > 0 ? `#${rank}` : "";
};
const rankClass = (rank) => ({
  "is-one": rank === 1,
  "is-two": rank === 2,
  "is-three": rank === 3,
  "is-top10": rank > 3 && rank <= 10,
});
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
const TREND_SIGNAL_ORDER = ["reentry", "breakthrough", "rising", "falling", "new"];
const trendMatchCount = computed(
  () => data.value.filter((item) => Boolean(eventMeta(item).trend?.signal)).length,
);
const trendItems = computed(() => {
  const buckets = new Map(TREND_SIGNAL_ORDER.map((signal) => [signal, []]));
  for (const item of data.value) {
    const trend = eventMeta(item).trend;
    if (!trend?.signal || !buckets.has(trend.signal)) continue;
    buckets.get(trend.signal).push({ ...item, trend });
  }
  for (const items of buckets.values()) {
    items.sort((left, right) =>
      Math.abs(Number(right.trend?.rankDelta || 0)) - Math.abs(Number(left.trend?.rankDelta || 0))
      || eventScore(right) - eventScore(left));
  }
  const selected = [];
  for (let round = 0; round < 2 && selected.length < 6; round += 1) {
    for (const signal of TREND_SIGNAL_ORDER) {
      const item = buckets.get(signal)?.[round];
      if (item) selected.push(item);
      if (selected.length >= 6) break;
    }
  }
  return selected;
});

const categoryOptions = computed(() => [
  { value: "all", label: ui.value.all, count: data.value.length },
  ...CATEGORY_ORDER.map((category) => ({
    value: category,
    label: categoryLabel(category),
    count: data.value.filter((item) => eventCategory(item) === category).length,
  })).filter((item) => item.count > 0),
]);
const focusOptions = computed(() => [
  { value: "all", label: ui.value.focusAll, count: data.value.length },
  { value: "fresh", label: ui.value.featured.fresh, count: data.value.filter(isFreshEvent).length },
  { value: "rising", label: ui.value.featured.rising, count: data.value.filter(isRisingEvent).length },
  { value: "resonance", label: ui.value.featured.resonance, count: data.value.filter(isResonanceItem).length },
  { value: "hot", label: ui.value.featured.hot, count: data.value.filter(isHotEvent).length },
].filter((item) => item.value === "all" || item.count > 0));
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

const matchesFocus = (item, focus = activeFocus.value) => {
  if (focus === "fresh") return isFreshEvent(item);
  if (focus === "rising") return isRisingEvent(item);
  if (focus === "resonance") return isResonanceItem(item);
  if (focus === "hot") return isHotEvent(item);
  return true;
};
const setCategory = (category) => {
  activeCategory.value = category || "all";
  currentPage.value = 1;
  nextTick(() => eventListRef.value?.scrollIntoView({ behavior: "smooth", block: "start" }));
};
const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const rows = data.value.filter((item) => {
    if (query && !textFor(item).includes(query)) return false;
    if (
      activeCategory.value !== "all" &&
      eventCategory(item) !== activeCategory.value
    )
      return false;
    if (!matchesFocus(item)) return false;
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
  const sortLaneItems = (key, items) =>
    items.slice().sort((a, b) => {
      if (key === "fresh")
        return eventWaveStartedAt(b) - eventWaveStartedAt(a) || eventScore(b) - eventScore(a);
      if (key === "rising")
        return Math.abs(Number(eventTrend(b)?.rankDelta || 0)) - Math.abs(Number(eventTrend(a)?.rankDelta || 0)) || eventScore(b) - eventScore(a);
      if (key === "resonance")
        return effectiveResonanceSourceCount(b) - effectiveResonanceSourceCount(a) || eventScore(b) - eventScore(a);
      if (key === "hot")
        return eventBestRank(a) - eventBestRank(b) || eventScore(b) - eventScore(a);
      return eventScore(b) - eventScore(a);
    });
  const lane = (key, predicate) => {
    const items = sortLaneItems(key, data.value.filter(predicate));
    return {
      key,
      label: ui.value.featured[key],
      subtitle: ui.value.featuredSubtitles?.[key] || "",
      count: items.length,
      items: items.slice(0, FEATURED_LANE_LIMIT),
      actionLabel: `${viewAllLabel.value} ${items.length}`,
      filter: { focus: key },
    };
  };
  return [
    lane("fresh", isFreshEvent),
    lane("rising", isRisingEvent),
    lane("resonance", isResonanceItem),
    lane("hot", isHotEvent),
  ].filter((group) => group.items.length);
});
const selectFeaturedLane = (lane) => {
  activeSource.value = "all";
  activeSort.value = lane?.key === "resonance" ? "resonance" : "smart";
  activeCategory.value = "all";
  activeFocus.value = lane?.filter?.focus || "all";
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
    activeFocus.value !== "all" ||
    activeSource.value !== "all" ||
    activeSort.value !== "smart" ||
    activeConfirmed.value,
  ),
);
const resetFilters = () => {
  searchQuery.value = "";
  activeCategory.value = "all";
  activeFocus.value = "all";
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
    if (activeFocus.value !== "all") query.focus = activeFocus.value;
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
    activeFocus,
    activeSource,
    activeSort,
    activeConfirmed,
    currentPage,
    pageSize,
  ],
  syncQuery,
);
watch(
  [searchQuery, activeCategory, activeFocus, activeSource, activeSort, activeConfirmed, pageSize],
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
watch(focusOptions, (options) => {
  if (
    activeFocus.value !== "all" &&
    !options.some((item) => item.value === activeFocus.value)
  )
    activeFocus.value = "all";
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
          trend: event.trend || null,
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
    dynamics: feed?.dynamics || null,
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

/* Chigua intelligence workspace */
.chigua-topic {
  width: min(100%, 1504px);
}
.topic-section {
  padding: 16px 18px 18px;
}
.topic-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 860px) 230px;
  align-items: start;
  justify-content: center;
  gap: 18px;
  min-width: 0;
}
.topic-main {
  min-width: 0;
}
.topic-category-rail,
.topic-controls {
  position: sticky;
  top: 82px;
  min-width: 0;
}
.topic-category-card,
.topic-controls-card {
  overflow: hidden;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-color);
}
.topic-category-title,
.topic-controls-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 38px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 11px;
}
.topic-category-title span,
.topic-controls-title span {
  color: var(--n-text-color-3);
  font-variant-numeric: tabular-nums;
}
.topic-category-card nav {
  display: grid;
  gap: 2px;
  padding: 7px;
}
.topic-category-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 5px 8px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2);
  font: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.topic-category-item:hover {
  background: var(--n-action-color);
  color: var(--n-text-color);
}
.topic-category-item.active {
  background: color-mix(in srgb, var(--n-primary-color) 9%, var(--n-action-color));
  color: var(--n-primary-color);
  box-shadow: inset 2px 0 0 var(--n-primary-color);
  font-weight: 700;
}
.topic-category-item em {
  color: var(--n-text-color-3);
  font-size: 10px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}
.topic-category-item.active em { color: currentColor; }
.topic-controls-card {
  display: grid;
  gap: 0;
  padding-bottom: 8px;
}
.topic-control-section {
  display: grid;
  gap: 6px;
  padding: 9px 10px;
  border-bottom: 1px solid var(--n-border-color);
}
.topic-control-section > span {
  color: var(--n-text-color-3);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: .02em;
}
.topic-control-section :deep(.compact-filter) {
  width: 100%;
  max-width: none;
}
.topic-controls-card > .resonance-toggle,
.topic-controls-card > .reset-filter,
.topic-controls-card > :deep(.n-button) {
  width: calc(100% - 20px);
  margin: 8px 10px 0;
}
.event-toolbar {
  margin-bottom: 10px;
}
.toolbar-primary {
  display: grid;
  grid-template-columns: auto minmax(180px, 1fr);
  align-items: center;
  gap: 10px;
}
.topic-search {
  justify-self: end;
  width: min(100%, 320px);
  max-width: 320px;
}
.chigua-topic :deep(.topic-lane-grid) {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.chigua-topic :deep(.topic-lane) {
  position: relative;
  overflow: hidden;
  min-height: 182px;
}
.chigua-topic :deep(.topic-lane::before) {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--lane-tone, var(--n-primary-color));
  opacity: .78;
}
.chigua-topic :deep(.topic-lane.is-fresh) { --lane-tone: #18a058; }
.chigua-topic :deep(.topic-lane.is-rising) { --lane-tone: #d97706; }
.chigua-topic :deep(.topic-lane.is-resonance) { --lane-tone: #7c5ce7; }
.chigua-topic :deep(.topic-lane.is-hot) { --lane-tone: #e5484d; }
.chigua-topic :deep(.topic-lane__head strong) {
  color: var(--lane-tone, var(--n-text-color));
}
.event-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 7px;
  background: var(--n-action-color);
  color: var(--n-text-color-3);
  font-weight: 750;
}
.event-rank.is-one { background: rgba(229,72,77,.14); color: #e5484d; }
.event-rank.is-two { background: rgba(217,119,6,.14); color: #d97706; }
.event-rank.is-three { background: rgba(222,162,33,.16); color: #b77905; }
.event-rank.is-top10 { color: var(--n-text-color-2); font-weight: 700; }
.event-title-row {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
  margin-top: 3px;
}
.event-title-row .event-title {
  min-width: 0;
  flex: 0 1 auto;
}
.event-title-row :deep(.ranking-badges) {
  margin-top: 2px;
}
.event-title h3 {
  margin-top: 0;
}
.event-resonance {
  border-color: color-mix(in srgb, #18a058 30%, transparent) !important;
  background: color-mix(in srgb, #18a058 9%, transparent);
  color: #18a058 !important;
  font-weight: 700;
}
.category-pill {
  --category-tone: var(--n-primary-color);
  border: 1px solid color-mix(in srgb, var(--category-tone) 22%, transparent);
  background: color-mix(in srgb, var(--category-tone) 8%, transparent);
  color: var(--category-tone);
}
.category-pill.is-gossip { --category-tone: #d14b72; }
.category-pill.is-celebrity { --category-tone: #7c5ce7; }
.category-pill.is-film-tv { --category-tone: #4f7fd8; }
.category-pill.is-variety { --category-tone: #d97706; }
.category-pill.is-music { --category-tone: #6268c7; }
.category-pill.is-creator { --category-tone: #168a84; }
.category-pill.is-other { --category-tone: #6b7280; }
.trend-pill {
  --trend-tone: #6b7280;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 5px;
  border: 1px solid color-mix(in srgb, var(--trend-tone) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--trend-tone) 9%, transparent);
  color: var(--trend-tone);
  font-weight: 700;
}
.trend-pill b { font-size: 9px; font-weight: 750; }
.trend-pill.is-breakthrough { --trend-tone: #e5484d; }
.trend-pill.is-rising { --trend-tone: #d97706; }
.trend-pill.is-reentry { --trend-tone: #7c5ce7; }
.trend-pill.is-new { --trend-tone: #18a058; }
.trend-pill.is-falling { --trend-tone: #5f7892; }

@media (max-width: 1240px) and (min-width: 901px) {
  .topic-layout {
    grid-template-columns: 180px minmax(0, 1fr) 205px;
    gap: 14px;
  }
  .chigua-topic :deep(.topic-lane-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) and (min-width: 721px) {
  .topic-layout {
    grid-template-columns: 176px minmax(0, 1fr);
    gap: 14px;
  }
  .topic-controls {
    position: static;
    grid-column: 2;
  }
  .topic-controls-card {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
    gap: 0;
    padding-bottom: 0;
  }
  .topic-controls-title { grid-column: 1 / -1; }
  .topic-controls-card > .resonance-toggle,
  .topic-controls-card > .reset-filter,
  .topic-controls-card > :deep(.n-button) {
    width: auto;
    margin: 8px;
  }
}
@media (max-width: 720px) {
  .topic-section { padding: 12px; }
  .topic-layout {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .topic-category-rail,
  .topic-controls,
  .topic-main { width: 100%; }
  .topic-category-rail {
    position: sticky;
    top: 0;
    z-index: 4;
    order: 1;
    margin: 0 -12px;
    width: calc(100% + 24px);
    border-bottom: 1px solid var(--n-border-color);
    background: var(--n-color);
  }
  .topic-main { order: 3; }
  .topic-controls { position: static; order: 2; }
  .topic-category-card { border: 0; border-radius: 0; }
  .topic-category-title { display: none; }
  .topic-category-card nav {
    display: flex;
    gap: 4px;
    padding: 7px 12px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .topic-category-card nav::-webkit-scrollbar { display: none; }
  .topic-category-item {
    grid-template-columns: max-content auto;
    flex: 0 0 auto;
    width: auto;
    min-height: 30px;
    padding: 4px 8px;
    box-shadow: none !important;
  }
  .topic-category-item.active {
    border: 1px solid color-mix(in srgb, var(--n-primary-color) 25%, transparent);
  }
  .topic-controls-card {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .topic-controls-card::-webkit-scrollbar { display: none; }
  .topic-controls-title { display: none; }
  .topic-control-section {
    display: block;
    flex: 0 0 auto;
    padding: 0;
    border: 0;
  }
  .topic-control-section > span { display: none; }
  .topic-control-section :deep(.compact-filter) { width: auto; max-width: 160px; }
  .topic-controls-card > .resonance-toggle,
  .topic-controls-card > .reset-filter,
  .topic-controls-card > :deep(.n-button) {
    flex: 0 0 auto;
    width: auto;
    margin: 0;
  }
  .toolbar-primary {
    grid-template-columns: minmax(0, 1fr);
  }
  .toolbar-title { display: flex; }
  .topic-search {
    justify-self: stretch;
    width: 100%;
    max-width: none;
  }
  .chigua-topic :deep(.topic-lane-grid) {
    display: flex;
    margin-right: -12px;
    padding-right: 12px;
  }
  .chigua-topic :deep(.topic-lane) {
    flex-basis: min(82vw, 286px);
  }
  .event-title-row {
    gap: 5px;
    flex-wrap: wrap;
  }
  .event-title-row :deep(.ranking-badges) { margin-top: 0; }
  .trend-pill b { display: none; }
}

</style>
