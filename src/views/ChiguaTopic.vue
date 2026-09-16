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

    <div class="topic-workspace-header">
        <div class="radar-identity">
          <div class="radar-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="24" />
              <circle cx="32" cy="32" r="16" />
              <circle cx="32" cy="32" r="8" />
              <path d="M32 8v48M8 32h48M15 15l34 34M49 15 15 49" />
              <path class="radar-mark__beam" d="M32 32 52 18" />
              <circle class="radar-mark__ping" cx="45" cy="23" r="2.8" />
            </svg>
            <svg class="radar-watermelon" viewBox="0 0 28 18">
              <path class="radar-watermelon__rind" d="M2 3h24c-.7 7.6-5.3 12.5-12 12.5S2.7 10.6 2 3Z" />
              <path class="radar-watermelon__flesh" d="M4.6 4.7h18.8C22.3 10 18.7 13.2 14 13.2S5.7 10 4.6 4.7Z" />
              <circle cx="10" cy="7.6" r=".8" /><circle cx="14" cy="9.2" r=".8" /><circle cx="18" cy="7.6" r=".8" />
            </svg>
          </div>
          <div class="topic-workspace-title">
            <span class="radar-eyebrow">{{ ui.radar }}</span>
            <h1>{{ copy.title }}</h1>
            <p>{{ copy.description }}</p>
          </div>
        </div>
        <div class="radar-actions">
          <div v-if="dashboard" class="hero-stats">
            <span><strong>{{ dashboard.total || data.length }}</strong>{{ ui.events }}</span>
            <span><strong>{{ dashboard.sourceCount }}</strong>{{ ui.sources }}</span>
          </div>
        </div>
    </div>

    <TopicLaneGrid
      class="topic-featured-lanes"
      v-if="featuredGroups.length"
      :lanes="featuredGroups"
      :aria-label="copy.feedTitle"
      @select="selectFeaturedLane"
      @load-more="loadMoreFeaturedLane"
    >
      <template #item="{ item }">
        <article
          class="event-lane-item"
          :class="{ 'is-serious': isSeriousEvent(item), 'has-cover': hasUsableCover(item) }"
          :aria-describedby="lanePreviewItem === item ? lanePreviewTooltipId : undefined"
          @pointerenter="showLanePreview(item, $event)"
          @pointerleave="scheduleLanePreviewClose"
          @focusin="showLanePreview(item, $event)"
          @focusout="scheduleLanePreviewClose"
          @keydown.esc="hideLanePreview"
        >
          <button
            v-if="hasUsableCover(item)"
            type="button"
            class="event-lane-cover"
            :title="item.title"
            :aria-label="item.title"
            @click.stop="openLaneFullImagePreview(item.cover)"
          >
            <img
              :src="coverSrc(item.cover)"
              :referrerpolicy="COVER_REFERRER_POLICY"
              :alt="item.title"
              loading="lazy"
              @error="markCoverError(item.cover)"
            />
          </button>
          <div class="event-lane-copy">
            <span v-if="isSeriousEvent(item)" class="event-lane-serious" :title="ui.seriousTip">
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.2c1.2 1.4 1.7 2.2 1.7 3.1A1.7 1.7 0 0 1 8 7 1.7 1.7 0 0 1 6.3 5.3C6.3 4.4 6.8 3.6 8 2.2Zm-2.2 6h4.4v5.2H5.8V8.2Zm-1.5 5.2h7.4" /></svg>
              {{ ui.serious }}
            </span>
            <a class="event-lane-title" :href="item.url" target="_blank" rel="noopener noreferrer">{{ item.title }}</a>
            <p>
              <a class="event-source-link" :href="primaryRankPath(item)">{{ sourceLabel(item) }}</a>
              <b v-if="eventSourceCount(item) > 1">{{ eventSourceCount(item) }} {{ ui.platforms }}</b>
              <em v-else-if="item.hot">{{ formatHot(item.hot) }}</em>
            </p>
          </div>
        </article>
      </template>
    </TopicLaneGrid>

    <Teleport to="body">
      <Transition name="item-preview">
        <div
          v-if="lanePreviewItem"
          :id="lanePreviewTooltipId"
          class="event-lane-floating-preview"
          :class="{ 'is-serious': isSeriousEvent(lanePreviewItem) }"
          :style="lanePreviewStyle"
          role="group"
          :aria-label="lanePreviewItem.title"
          @pointerenter="cancelLanePreviewClose"
          @pointerleave="scheduleLanePreviewClose"
          @focusin="cancelLanePreviewClose"
          @focusout="scheduleLanePreviewClose"
        >
          <button
            type="button"
            class="event-lane-floating-preview__media"
            :title="lanePreviewItem.title"
            :aria-label="lanePreviewItem.title"
            @click.stop="openLaneFullImagePreview(lanePreviewItem.cover)"
          >
            <img
              :src="coverSrc(lanePreviewItem.cover)"
              :referrerpolicy="COVER_REFERRER_POLICY"
              :alt="lanePreviewItem.title"
              @error="handleLanePreviewCoverError(lanePreviewItem.cover)"
            />
          </button>
        </div>
      </Transition>
    </Teleport>
    <n-image
      v-if="laneImagePreviewSrc"
      ref="laneImagePreviewRef"
      class="event-lane-image-preview-trigger"
      :src="laneImagePreviewSrc"
      :preview-src="laneImagePreviewSrc"
      :show-toolbar="true"
      :img-props="{ referrerpolicy: COVER_REFERRER_POLICY }"
    />

    <section class="topic-section topic-feed-section">
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



          <div v-if="loading && !result" class="topic-loading">
            <n-skeleton text :repeat="9" />
          </div>
          <div v-else-if="filteredData.length" ref="eventListRef" class="event-list">
            <article
              v-for="(item, index) in pagedData"
              :key="item.id"
              class="event-item"
              :class="{ 'is-serious': isSeriousEvent(item), 'has-media': hasUsableCover(item) }"
              @mouseenter="prepareEventCoverHover"
            >
              <span class="event-rank" :class="rankClass(pageStart + index + 1)">{{
                String(pageStart + index + 1).padStart(2, "0")
              }}</span>
              <div v-if="hasUsableCover(item)" class="event-media">
                <n-image
                  class="event-cover"
                  :src="coverSrc(item.cover)"
                  :preview-src="coverSrc(item.cover)"
                  :alt="item.title"
                  lazy
                  object-fit="contain"
                  :img-props="{ tabindex: 0, role: 'button', referrerpolicy: COVER_REFERRER_POLICY, 'data-cover-source': item.cover, onKeydown: handleEventCoverPreviewKeydown, onLoad: handleEventCoverImageLoad, onError: () => markCoverError(item.cover) }"
                  @error="markCoverError(item.cover)"
                />
              </div>
              <div class="event-main">
                <div class="event-source-line">
                  <a class="event-source-link" :href="primaryRankPath(item)" :title="sourceLabel(item)">
                    <img
                      :src="getSourceLogo(primarySource(item))"
                      :alt="sourceLabel(item)"
                      @error="onLogoError"
                    />
                    <span>{{ sourceLabel(item) }}</span>
                  </a>
                  <em v-if="isSeriousEvent(item)" class="serious-event-badge" :title="ui.seriousTip">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.2c1.2 1.4 1.7 2.2 1.7 3.1A1.7 1.7 0 0 1 8 7 1.7 1.7 0 0 1 6.3 5.3C6.3 4.4 6.8 3.6 8 2.2Zm-2.2 6h4.4v5.2H5.8V8.2Zm-1.5 5.2h7.4" /></svg>
                    {{ ui.serious }}
                  </em>
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
                  <n-popover
                    v-if="supportingConfirmations(item).length"
                    trigger="hover"
                    placement="top-start"
                    :show-arrow="false"
                    :delay="80"
                  >
                    <template #trigger>
                      <button type="button" class="event-evidence-summary">
                        <span>{{ ui.corroboration }}：</span>
                        <template v-for="(confirmation, confirmationIndex) in evidenceSummary(item)" :key="`${item.id}-summary-${confirmation.source}-${confirmation.variant || 'default'}`">
                          <b>{{ evidenceLabel(confirmation) }}</b><i v-if="confirmationIndex < evidenceSummary(item).length - 1">、</i>
                        </template>
                        <em v-if="supportingConfirmations(item).length > evidenceSummary(item).length">+{{ supportingConfirmations(item).length - evidenceSummary(item).length }}</em>
                      </button>
                    </template>
                    <div class="event-evidence-popover">
                      <strong>{{ ui.evidenceSources }}</strong>
                      <template v-for="confirmation in supportingConfirmations(item)" :key="`${item.id}-evidence-${confirmation.source}-${confirmation.variant || 'default'}`">
                        <a v-if="confirmation.url" :href="confirmation.url" target="_blank" rel="noopener noreferrer">
                          <span>{{ evidenceLabel(confirmation) }}</span>
                          <em v-if="confirmation.rank">#{{ confirmation.rank }}</em>
                          <small>{{ evidenceRoleLabel(confirmation) }}</small>
                        </a>
                        <span v-else class="is-unlinked">
                          <span>{{ evidenceLabel(confirmation) }}</span>
                          <em v-if="confirmation.rank">#{{ confirmation.rank }}</em>
                          <small>{{ evidenceRoleLabel(confirmation) }}</small>
                        </span>
                      </template>
                    </div>
                  </n-popover>
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
          <section v-if="trendItems.length" class="topic-trend-card" :aria-label="ui.trend">
            <div class="topic-trend-title">
              <strong>{{ ui.trend }}</strong>
            </div>
            <div class="topic-trend-list">
              <a
                v-for="item in trendItems.slice(0, 4)"
                :key="`trend-${item.id}`"
                class="radar-trend-item"
                :class="`is-${eventTrend(item)?.signal || 'steady'}`"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="item.title"
              >
                <em>{{ trendSignalLabel(eventTrend(item)?.signal) }}</em>
                <strong>{{ trendMetric(eventTrend(item)) }}</strong>
                <span>{{ item.title }}</span>
              </a>
            </div>
          </section>
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

          </div>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup>
import CompactFilter from "@/components/CompactFilter.vue";
import TopicLaneGrid from "@/components/TopicLaneGrid.vue";
import RankingBadgeGroup from "@/components/RankingBadgeGroup.vue";
import { getTopicFeed } from "@/api";
import { CHIGUA_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { buildRankPath, getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { normalizeRankingBadges } from "@/utils/rankingBadges";
import { COVER_REFERRER_POLICY, getCoverDisplaySrc } from "@/utils/imageProxy";
import { resolveCoverPreviewLayout } from "@/utils/coverPreviewGeometry";
import { applyExpandableCoverGeometry } from "@/utils/expandableCoverGeometry";
import {
  FLOATING_COVER_PREVIEW_CLOSE_DELAY,
  FLOATING_COVER_PREVIEW_OPEN_DELAY,
  resolveFloatingCoverPreviewPosition,
} from "@/utils/floatingCoverPreview";
import { useRoute } from "vue-router";

const route = useRoute();
const result = ref(null);
const coverImageErrors = reactive({});
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
const lanePreviewItem = ref(null);
const lanePreviewStyle = ref({});
const lanePreviewMediaCache = new Map();
const laneImagePreviewRef = ref(null);
const laneImagePreviewSrc = ref("");
const lanePreviewTooltipId = "chigua-lane-cover-preview";
let lanePreviewRequestId = 0;
let lanePreviewOpenTimer = null;
let lanePreviewCloseTimer = null;
let lanePreviewViewportListenersBound = false;
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
    radar: "娱乐热点态势雷达",
    trend: "榜位趋势",
    serious: "严肃事件",
    seriousTip: "涉及死亡、遇难、讣告等严肃主题，采用中性低饱和展示。",
    evidenceSources: "佐证来源",
    scrollMore: "继续滚动加载",
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
      hot: "高位焦点",
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
    radar: "Entertainment signal radar",
    trend: "Rank movement",
    serious: "Serious event",
    seriousTip: "Sensitive events involving death, casualties or obituaries use a neutral presentation.",
    evidenceSources: "Evidence sources",
    scrollMore: "Scroll to load more",
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
      hot: "Top focus",
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
    radar: "娛樂熱點態勢雷達",
    trend: "榜位趨勢",
    serious: "嚴肅事件",
    seriousTip: "涉及死亡、遇難、訃告等嚴肅主題，採用中性低飽和展示。",
    evidenceSources: "佐證來源",
    scrollMore: "繼續捲動載入",
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
      hot: "高位焦點",
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
    radar: "エンタメ動向レーダー",
    trend: "順位トレンド",
    serious: "重大・慎重な話題",
    seriousTip: "死亡・事故・訃報などを含む話題は中立的な低彩度表示にします。",
    evidenceSources: "補強ソース",
    scrollMore: "スクロールしてさらに表示",
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
      hot: "上位フォーカス",
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
    radar: "엔터테인먼트 동향 레이더",
    trend: "순위 추세",
    serious: "엄중한 이슈",
    seriousTip: "사망·사고·부고 등 엄중한 주제는 중립적이고 낮은 채도로 표시합니다.",
    evidenceSources: "근거 출처",
    scrollMore: "스크롤하여 더 불러오기",
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
      hot: "상위 포커스",
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
const primaryEvidence = (item) => confirmations(item)[0] || null;
const rankPathForEvidence = (entry) =>
  entry?.source ? buildRankPath(locale.value, entry.source, entry.variant || "") : buildRankPath(locale.value, "");
const primaryRankPath = (item) => {
  const entry = primaryEvidence(item);
  return entry?.source
    ? rankPathForEvidence(entry)
    : buildRankPath(locale.value, primarySource(item));
};
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
const supportingConfirmations = (item) =>
  confirmations(item).slice(1).filter((entry) => entry?.source);
const evidenceSummary = (item) => supportingConfirmations(item).slice(0, 3);
const evidenceRoleLabel = (entry) =>
  entry?.role === "corroboration"
    ? ui.value.corroboration
    : entry?.role === "support"
      ? ui.value.support
      : "";
const SERIOUS_EVENT_PATTERN = /(去世|逝世|病逝|离世|辞世|身亡|遇难|罹难|讣告|死亡|去世享年|逝世享年|passed away|died|death|obituary|訃報|死去|死亡|사망|별세|부고)/i;
const isSeriousEvent = (item) =>
  SERIOUS_EVENT_PATTERN.test(`${item?.title || ""} ${item?.desc || ""}`);
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

const FEATURED_LANE_INITIAL_RENDER = 8;
const FEATURED_LANE_BATCH = 5;
const featuredLaneRenderLimits = reactive({
  fresh: FEATURED_LANE_INITIAL_RENDER,
  rising: FEATURED_LANE_INITIAL_RENDER,
  resonance: FEATURED_LANE_INITIAL_RENDER,
  hot: FEATURED_LANE_INITIAL_RENDER,
});
const resetFeaturedLaneRenderLimits = () => {
  Object.keys(featuredLaneRenderLimits).forEach((key) => {
    featuredLaneRenderLimits[key] = FEATURED_LANE_INITIAL_RENDER;
  });
};
const loadMoreFeaturedLane = (lane) => {
  const key = lane?.key;
  if (!key || !Object.prototype.hasOwnProperty.call(featuredLaneRenderLimits, key)) return;
  const total = Number(lane?.count || 0);
  featuredLaneRenderLimits[key] = Math.min(
    total || featuredLaneRenderLimits[key] + FEATURED_LANE_BATCH,
    featuredLaneRenderLimits[key] + FEATURED_LANE_BATCH,
  );
};
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
      hideSubtitle: true,
      visibleCount: 3,
      count: items.length,
      items: items.slice(0, featuredLaneRenderLimits[key] || FEATURED_LANE_INITIAL_RENDER),
      hasMore: items.length > (featuredLaneRenderLimits[key] || FEATURED_LANE_INITIAL_RENDER),
      scrollable: true,
      loadMoreLabel: ui.value.scrollMore,
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
const coverSrc = (cover) => getCoverDisplaySrc(cover);
const hasUsableCover = (item) => Boolean(item?.cover && !coverImageErrors[item.cover]);
const markCoverError = (cover) => {
  if (!cover) return;
  coverImageErrors[cover] = true;
  if (lanePreviewItem.value?.cover === cover) hideLanePreview();
};
const onLogoError = (event) => {
  if (event?.target) event.target.src = getSourceLogoFallback();
};

const getLanePreviewMediaLayout = (cover) => {
  if (lanePreviewMediaCache.has(cover)) return lanePreviewMediaCache.get(cover);
  const mediaPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const layout = resolveCoverPreviewLayout(image.naturalWidth, image.naturalHeight);
      if (!layout) {
        reject(new Error("Invalid lane preview image layout"));
        return;
      }
      resolve(layout);
    };
    image.onerror = reject;
    image.referrerPolicy = COVER_REFERRER_POLICY;
    image.src = coverSrc(cover);
  });
  lanePreviewMediaCache.set(cover, mediaPromise);
  return mediaPromise;
};
const cancelLanePreviewClose = () => {
  if (!lanePreviewCloseTimer) return;
  window.clearTimeout(lanePreviewCloseTimer);
  lanePreviewCloseTimer = null;
};
const scheduleLanePreviewClose = () => {
  cancelLanePreviewClose();
  lanePreviewCloseTimer = window.setTimeout(() => {
    lanePreviewCloseTimer = null;
    hideLanePreview();
  }, FLOATING_COVER_PREVIEW_CLOSE_DELAY);
};
const openLaneFullImagePreview = (cover) => {
  if (!cover) return;
  cancelLanePreviewClose();
  laneImagePreviewSrc.value = coverSrc(cover);
  nextTick(() => laneImagePreviewRef.value?.click?.());
};
const bindLanePreviewViewportListeners = () => {
  if (lanePreviewViewportListenersBound) return;
  window.addEventListener("scroll", hideLanePreview, true);
  window.addEventListener("blur", hideLanePreview);
  lanePreviewViewportListenersBound = true;
};
const unbindLanePreviewViewportListeners = () => {
  if (!lanePreviewViewportListenersBound) return;
  window.removeEventListener("scroll", hideLanePreview, true);
  window.removeEventListener("blur", hideLanePreview);
  lanePreviewViewportListenersBound = false;
};
const hideLanePreview = () => {
  if (lanePreviewOpenTimer) {
    window.clearTimeout(lanePreviewOpenTimer);
    lanePreviewOpenTimer = null;
  }
  if (lanePreviewCloseTimer) {
    window.clearTimeout(lanePreviewCloseTimer);
    lanePreviewCloseTimer = null;
  }
  lanePreviewRequestId += 1;
  lanePreviewItem.value = null;
  lanePreviewStyle.value = {};
  unbindLanePreviewViewportListeners();
};
const positionLanePreview = (item, target, mediaLayout) => {
  if (!target?.isConnected || !mediaLayout?.mediaOnly) return false;
  const targetRect = target.getBoundingClientRect();
  const lane = target.closest?.(".topic-lane");
  const containerRect = lane?.getBoundingClientRect?.();
  const textRects = Array.from(lane?.querySelectorAll?.(".event-lane-copy") || []).map((node) =>
    node.getBoundingClientRect(),
  );
  const previewWidth = mediaLayout.mediaOnly.width;
  const previewHeight = mediaLayout.mediaOnly.height;
  const position = resolveFloatingCoverPreviewPosition({
    targetRect,
    containerRect,
    textRects,
    previewWidth,
    previewHeight,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
  if (!position) return false;
  lanePreviewItem.value = item;
  lanePreviewStyle.value = {
    left: `${position.left}px`,
    top: `${position.top}px`,
    width: `${previewWidth}px`,
    height: `${previewHeight}px`,
  };
  bindLanePreviewViewportListeners();
  return true;
};
const openLanePreview = async (item, target, requestId) => {
  try {
    const mediaLayout = await getLanePreviewMediaLayout(item.cover);
    if (requestId !== lanePreviewRequestId || !target?.isConnected) return;
    if (!positionLanePreview(item, target, mediaLayout)) hideLanePreview();
  } catch {
    markCoverError(item.cover);
  }
};
const showLanePreview = (item, event) => {
  if (typeof window === "undefined" || window.innerWidth <= 680 || !event?.currentTarget || !hasUsableCover(item)) return;
  cancelLanePreviewClose();
  if (lanePreviewOpenTimer) window.clearTimeout(lanePreviewOpenTimer);
  const target = event.currentTarget;
  const requestId = ++lanePreviewRequestId;
  lanePreviewOpenTimer = window.setTimeout(() => {
    lanePreviewOpenTimer = null;
    void openLanePreview(item, target, requestId);
  }, FLOATING_COVER_PREVIEW_OPEN_DELAY);
};
const handleLanePreviewCoverError = (cover) => markCoverError(cover);

const syncEventCoverGeometry = (image) => {
  if (!image?.isConnected) return;
  applyExpandableCoverGeometry({
    image,
    media: image.closest?.(".event-media"),
    preview: image.closest?.(".event-cover.n-image"),
    row: image.closest?.(".event-item"),
  });
};
const handleEventCoverImageLoad = (event) => {
  const image = event?.currentTarget;
  if (!image) return;
  window.requestAnimationFrame?.(() => syncEventCoverGeometry(image));
};
const prepareEventCoverHover = (event) => {
  const image = event?.currentTarget?.querySelector?.(".event-cover img");
  if (image?.complete) syncEventCoverGeometry(image);
};
const pendingEventCoverGeometryImages = new WeakSet();
const markBrokenEventCoverImage = (image) => {
  const cover = image?.dataset?.coverSource || "";
  pendingEventCoverGeometryImages.delete(image);
  if (cover) markCoverError(cover);
};
const ensureEventCoverGeometry = (image) => {
  if (!image) return;
  if (image.complete) {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      pendingEventCoverGeometryImages.delete(image);
      syncEventCoverGeometry(image);
    } else {
      markBrokenEventCoverImage(image);
    }
    return;
  }
  if (pendingEventCoverGeometryImages.has(image)) return;
  pendingEventCoverGeometryImages.add(image);
  image.addEventListener?.("load", () => {
    pendingEventCoverGeometryImages.delete(image);
    syncEventCoverGeometry(image);
  }, { once: true });
  image.addEventListener?.("error", () => markBrokenEventCoverImage(image), { once: true });
};
const syncReadyEventCoverGeometries = () => {
  eventListRef.value?.querySelectorAll?.(".event-cover img").forEach(ensureEventCoverGeometry);
};
const queueEventCoverGeometrySync = () => {
  if (typeof window === "undefined") return;
  nextTick(() => window.requestAnimationFrame?.(syncReadyEventCoverGeometries));
};
const handleEventCoverPreviewKeydown = (event) => {
  if (event?.key !== "Enter" && event?.key !== " ") return;
  event.preventDefault();
  event.currentTarget?.click?.();
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
watch(
  () => pagedData.value.map((item) => `${item.id}:${item.cover || ""}`).join("|"),
  queueEventCoverGeometrySync,
  { flush: "post" },
);
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
  if (force) resetFeaturedLaneRenderLimits();
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
  queueEventCoverGeometrySync();
  void loadTopic(false);
});
onActivated(() => {
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  queueEventCoverGeometrySync();
});
onDeactivated(() => {
  hideLanePreview();
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
});
onBeforeUnmount(() => {
  clearTimeout(querySyncTimer);
  hideLanePreview();
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
});
watch(locale, () => void loadTopic(false));
</script>

<style scoped>
.chigua-topic {
  display: grid;
  gap: 14px;
  width: min(100%, var(--site-container-width, 1400px));
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
  --radar-cyan: #168a84;
  --radar-violet: #705ac8;
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 11px 16px;
  margin-bottom: 0;
  padding: 13px 15px 11px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--radar-cyan) 18%, var(--n-border-color));
  border-radius: 14px;
  background:
    radial-gradient(circle at 7% -15%, color-mix(in srgb, var(--radar-cyan) 12%, transparent), transparent 34%),
    radial-gradient(circle at 92% 5%, color-mix(in srgb, var(--radar-violet) 8%, transparent), transparent 32%),
    color-mix(in srgb, var(--n-color) 97%, var(--radar-cyan) 3%);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--n-color) 70%, transparent);
}
.topic-workspace-header::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(108deg, transparent 0 67%, color-mix(in srgb, var(--radar-cyan) 4%, transparent) 67% 68%, transparent 68%);
}
.radar-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.radar-mark {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  color: var(--radar-cyan);
}
.radar-watermelon {
  position: absolute;
  right: -3px;
  bottom: -1px;
  width: 25px !important;
  height: 16px !important;
  overflow: visible;
  filter: drop-shadow(0 2px 4px color-mix(in srgb, #dc4969 18%, transparent));
}
.radar-mark { position: relative; }
.radar-watermelon__rind { fill: #2f9f68; stroke: #217b51 !important; stroke-width: .6 !important; opacity: .98 !important; }
.radar-watermelon__flesh { fill: #e95872; stroke: none !important; opacity: .98 !important; }
.radar-watermelon circle { fill: #53323a !important; stroke: none !important; opacity: .9 !important; }
.radar-mark svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-width: .75;
  opacity: .86;
}
.radar-mark svg circle:not(.radar-mark__ping),
.radar-mark svg > path:not(.radar-mark__beam) { opacity: .38; }
.radar-mark__beam { stroke: var(--radar-violet); stroke-width: 1.4; }
.radar-mark__ping {
  fill: var(--radar-violet);
  stroke: color-mix(in srgb, var(--radar-violet) 44%, transparent);
  stroke-width: 5;
  transform-origin: 45px 23px;
  animation: radar-ping 1.8s ease-out infinite;
}
@keyframes radar-ping {
  0%, 38% { opacity: .95; transform: scale(.78); }
  100% { opacity: .28; transform: scale(1.28); }
}
.radar-eyebrow {
  display: block;
  margin-bottom: 3px;
  color: var(--radar-cyan);
  font-size: 9px;
  font-weight: 760;
  letter-spacing: .12em;
}
.topic-workspace-title { min-width: 0; }
.topic-workspace-title h1 {
  margin: 0;
  font-size: clamp(20px, 2vw, 26px);
  line-height: 1.18;
  letter-spacing: -.015em;
}
.topic-workspace-title p {
  max-width: 820px;
  margin: 4px 0 0;
  color: var(--n-text-color-3);
  font-size: 11px;
  line-height: 1.45;
}
.radar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.hero-stats {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-stats > span {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  min-height: 30px;
  padding: 5px 8px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 78%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--n-color) 82%, transparent);
  color: var(--n-text-color-3);
  font-size: 9px;
  white-space: nowrap;
}
.hero-stats > span strong {
  color: var(--n-text-color);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.radar-trend-item {
  --radar-signal: #5f7892;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 3px 6px;
  min-width: 0;
  padding: 7px 8px;
  border: 1px solid color-mix(in srgb, var(--radar-signal) 16%, var(--n-border-color));
  border-radius: 8px;
  background: color-mix(in srgb, var(--radar-signal) 5%, transparent);
  color: inherit;
  text-decoration: none;
}
.radar-trend-item:hover { border-color: color-mix(in srgb, var(--radar-signal) 36%, var(--n-border-color)); }
.radar-trend-item em { color: var(--radar-signal); font-size: 8px; font-style: normal; font-weight: 720; white-space: nowrap; }
.radar-trend-item strong { justify-self: end; color: var(--radar-signal); font-size: 9px; font-weight: 760; white-space: nowrap; }
.radar-trend-item span {
  display: -webkit-box;
  grid-column: 1 / -1;
  overflow: hidden;
  color: var(--n-text-color-2);
  font-size: 9px;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.radar-trend-item.is-breakthrough { --radar-signal: #c65357; }
.radar-trend-item.is-rising { --radar-signal: #c07a13; }
.radar-trend-item.is-reentry { --radar-signal: #705ac8; }
.radar-trend-item.is-new { --radar-signal: #168a84; }
.radar-trend-item.is-falling { --radar-signal: #5f7892; }
@media (prefers-reduced-motion: reduce) {
  .radar-mark__ping { animation: none; }
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
  gap: 8px;
  margin: 0;
}
.chigua-topic :deep(.topic-lane) {
  padding: 8px;
}
.event-lane-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--ranking-card-featured-item-gap);
  align-items: center;
  min-width: 0;
  min-height: var(--ranking-card-featured-item-min-height);
  padding: 5px 2px;
  border-bottom: 1px solid var(--n-border-color);
  color: inherit;
}
.event-lane-item.has-cover {
  grid-template-columns: var(--ranking-card-featured-thumb-width) minmax(0, 1fr);
}
.event-lane-item:last-child { border-bottom: 0; }
.event-lane-copy { min-width: 0; }
.event-lane-title {
  display: block;
  overflow: hidden;
  color: var(--n-text-color);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-lane-title:hover,
.event-lane-title:focus-visible {
  color: var(--n-primary-color);
  text-decoration: underline;
  outline: none;
}
.event-lane-cover {
  display: block;
  box-sizing: border-box;
  width: var(--ranking-card-featured-thumb-width);
  height: var(--ranking-card-featured-thumb-height);
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--ranking-card-thumb-radius);
  background: var(--n-action-color);
  cursor: zoom-in;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--n-border-color) 70%, transparent);
}
.event-lane-cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform .18s ease;
}
.event-lane-cover:hover img,
.event-lane-cover:focus-visible img { transform: scale(1.04); }
.event-lane-cover:focus-visible {
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}
.event-lane-floating-preview {
  position: fixed;
  z-index: 3000;
  display: block;
  overflow: visible;
  border-radius: 10px;
  background: transparent;
  box-shadow: 0 12px 28px rgba(0, 0, 0, .16);
  pointer-events: auto;
}
.event-lane-floating-preview__media {
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: inherit;
  background: transparent;
  cursor: zoom-in;
}
.event-lane-floating-preview__media img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: contain;
  object-position: center;
}
.event-lane-floating-preview.is-serious img { filter: grayscale(.88) saturate(.18) contrast(.96); }
.event-lane-image-preview-trigger {
  position: fixed;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
.item-preview-enter-active,
.item-preview-leave-active { transition: opacity .16s ease, transform .16s ease; }
.item-preview-enter-from,
.item-preview-leave-to { opacity: 0; transform: scale(.98); }
.event-lane-item p {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin: 4px 0 0;
  color: var(--n-text-color-3);
  font-size: 10px;
  white-space: nowrap;
}
.event-source-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.event-source-link:hover,
.event-source-link:focus-visible {
  color: var(--n-primary-color);
  text-decoration: underline;
  outline: none;
}
.event-lane-item p .event-source-link {
  overflow: hidden;
  text-overflow: ellipsis;
}
.event-lane-item p b {
  flex: 0 0 auto;
  color: var(--n-text-color);
  font-size: 10px;
}
.event-lane-item p em { flex: 0 0 auto; font-style: normal; }
.event-lane-serious {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 2px;
  color: #6b7280;
  font-size: 8px;
  font-weight: 720;
}
.event-lane-serious svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.15; stroke-linecap: round; stroke-linejoin: round; }
.event-lane-item.is-serious {
  margin-inline: -4px;
  padding-inline: 5px;
  border-radius: 6px;
  background: linear-gradient(90deg, color-mix(in srgb, #6b7280 8%, transparent), transparent 72%);
}
.event-lane-item.is-serious .event-lane-cover img { filter: grayscale(.88) saturate(.18) contrast(.96); }
.event-list {
  display: grid;
}
.event-item {
  position: relative;
  display: grid;
  grid-template-columns: var(--ranking-stream-rank-width) var(--ranking-stream-media-width) minmax(0, 1fr) auto;
  gap: var(--ranking-stream-row-gap);
  align-items: center;
  min-width: 0;
  min-height: var(--ranking-stream-row-min-height);
  padding: var(--ranking-stream-row-padding-block) var(--ranking-stream-row-padding-inline-end) var(--ranking-stream-row-padding-block) var(--ranking-stream-row-padding-inline-start);
  border-top: 1px solid var(--n-border-color);
  transition: background-color .16s ease;
}
.event-item:hover { background: var(--n-action-color); }
.event-item:not(.has-media) {
  grid-template-columns: var(--ranking-stream-rank-width) minmax(0, 1fr) auto;
}
.event-rank {
  align-self: center;
  padding-top: 0;
  color: var(--n-text-color-3);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.event-media {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: var(--ranking-stream-media-width);
  height: var(--ranking-stream-media-height);
  max-width: var(--ranking-stream-media-width);
  max-height: var(--ranking-stream-media-height);
  overflow: visible;
}
.event-cover {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  overflow: visible;
  border-radius: 0;
  background: transparent;
}
.event-cover :deep(img) {
  position: relative;
  z-index: 1;
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  border-radius: var(--ranking-stream-media-radius);
  object-fit: contain;
  object-position: center;
  cursor: zoom-in;
}
.event-cover :deep(img:focus-visible) {
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}
.event-cover.is-cover-geometry-ready {
  position: absolute;
  top: calc(50% + var(--cover-hover-center-y-shift, 0px));
  right: 0;
  width: var(--cover-base-viewport-width, 100%);
  height: var(--cover-base-viewport-height, 100%);
  max-width: none;
  max-height: none;
  overflow: hidden;
  border-radius: var(--ranking-stream-media-radius);
  transform: translateY(-50%);
  transition: width .24s cubic-bezier(.22,1,.36,1), height .24s cubic-bezier(.22,1,.36,1), top .24s cubic-bezier(.22,1,.36,1), box-shadow .18s ease;
  will-change: width, height;
}
.event-cover.is-cover-geometry-ready :deep(img) {
  position: absolute;
  top: 50%;
  right: var(--cover-base-image-right, 0px);
  left: auto;
  width: var(--cover-base-image-width, 100%);
  height: var(--cover-base-image-height, 100%);
  max-width: none;
  max-height: none;
  border-radius: var(--ranking-stream-media-radius);
  object-fit: contain !important;
  transform: translateY(-50%);
  transform-origin: right center;
  transition: width .24s cubic-bezier(.22,1,.36,1), height .24s cubic-bezier(.22,1,.36,1), right .24s cubic-bezier(.22,1,.36,1);
  will-change: width, height, right;
}
@media (hover: hover) and (pointer: fine) {
  .event-item.has-media:hover { z-index: 4; }
  .event-item.has-media:hover .event-cover.is-cover-geometry-ready {
    z-index: 5;
    width: var(--cover-hover-width, 113.4px);
    height: var(--cover-hover-height, 113.4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, .16);
  }
  .event-item.has-media:hover .event-cover.is-cover-geometry-ready :deep(img) {
    right: 0;
    width: var(--cover-hover-width, 113.4px);
    height: var(--cover-hover-height, 113.4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .event-cover.is-cover-geometry-ready,
  .event-cover.is-cover-geometry-ready :deep(img),
  .item-preview-enter-active,
  .item-preview-leave-active { transition: none; }
  .item-preview-enter-from,
  .item-preview-leave-to { transform: none; }
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
.event-evidence-summary {
  display: inline-flex;
  align-items: center;
  gap: 0;
  max-width: min(56%, 420px);
  min-height: 20px;
  padding: 1px 5px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--n-text-color-3) 16%, transparent);
  border-radius: 999px;
  background: transparent;
  color: var(--n-text-color-3);
  font: inherit;
  font-size: 9px;
  white-space: nowrap;
  cursor: pointer;
}
.event-evidence-summary:hover { border-color: color-mix(in srgb, var(--n-primary-color) 26%, transparent); color: var(--n-text-color-2); }
.event-evidence-summary > span { flex: 0 0 auto; font-weight: 650; }
.event-evidence-summary b { overflow: hidden; font-weight: 560; text-overflow: ellipsis; }
.event-evidence-summary i { flex: 0 0 auto; font-style: normal; }
.event-evidence-summary em { flex: 0 0 auto; margin-left: 3px; color: var(--n-primary-color); font-style: normal; font-weight: 700; }
.event-evidence-popover {
  display: grid;
  gap: 3px;
  min-width: 270px;
  max-width: 360px;
  padding: 2px;
}
.event-evidence-popover > strong { padding: 2px 5px 5px; color: var(--n-text-color-2); font-size: 10px; }
.event-evidence-popover > a,
.event-evidence-popover > .is-unlinked {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 5px 7px;
  border-radius: 7px;
  color: inherit;
  font-size: 10px;
  text-decoration: none;
}
.event-evidence-popover > a:hover { background: var(--n-action-color); }
.event-evidence-popover > a > span,
.event-evidence-popover > .is-unlinked > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.event-evidence-popover em { color: var(--n-text-color-2); font-style: normal; font-variant-numeric: tabular-nums; }
.event-evidence-popover small { color: var(--n-text-color-3); font-size: 9px; }
.serious-event-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-color: color-mix(in srgb, #6b7280 28%, transparent) !important;
  background: color-mix(in srgb, #6b7280 7%, transparent);
  color: #6b7280 !important;
  font-weight: 700;
}
.serious-event-badge svg { width: 10px; height: 10px; fill: none; stroke: currentColor; stroke-width: 1.15; stroke-linecap: round; stroke-linejoin: round; }
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
  .topic-workspace-header { grid-template-columns: minmax(0, 1fr); padding: 11px; }
  .radar-mark { width: 44px; height: 44px; flex-basis: 44px; }
  .radar-actions { justify-content: space-between; }
  .hero-stats { min-width: 0; justify-items: initial; }
  .hero-stats > span { min-height: 28px; padding: 4px 6px; }
  .hero-stats > span strong { font-size: 14px; }
  .topic-section {
    padding: 13px;
    border-radius: 12px;
  }
  .topic-workspace-header {
    gap: 6px;
    padding-bottom: 8px;
    margin-bottom: 0;
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
    grid-template-columns: var(--ranking-stream-mobile-rank-width) var(--ranking-stream-mobile-media-width) minmax(0, 1fr);
    gap: var(--ranking-stream-mobile-row-gap);
    min-height: var(--ranking-stream-mobile-row-min-height);
    padding: var(--ranking-stream-mobile-row-padding-block) var(--ranking-stream-mobile-row-padding-inline-end) var(--ranking-stream-mobile-row-padding-block) var(--ranking-stream-mobile-row-padding-inline-start);
  }
  .event-item:not(.has-media) {
    grid-template-columns: var(--ranking-stream-mobile-rank-width) minmax(0, 1fr);
  }
  .event-media {
    width: var(--ranking-stream-mobile-media-width);
    height: var(--ranking-stream-mobile-media-height);
    max-width: var(--ranking-stream-mobile-media-width);
    max-height: var(--ranking-stream-mobile-media-height);
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
  width: min(100%, var(--site-container-width, 1400px));
}
.topic-section {
  padding: 16px 18px 18px;
}
.topic-feed-section {
  box-sizing: border-box;
  width: min(100%, var(--site-focus-container-width, 1360px));
  margin: 0 auto;
}
.topic-layout {
  display: grid;
  grid-template-columns: minmax(190px, 272px) minmax(0, 720px) minmax(190px, 272px);
  align-items: start;
  justify-content: center;
  gap: 24px;
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
.topic-controls {
  display: grid;
  align-content: start;
  gap: 10px;
}
.topic-category-card,
.topic-controls-card,
.topic-trend-card {
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
.topic-trend-card {
  padding: 0 8px 8px;
}
.topic-trend-title {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 8px 2px;
  border-bottom: 1px solid var(--n-border-color);
  font-size: 11px;
}
.topic-trend-list {
  display: grid;
  gap: 6px;
  padding-top: 8px;
}
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
.chigua-topic :deep(.topic-lane__items) {
  align-content: start;
}
.chigua-topic :deep(.topic-lane.is-scrollable .topic-lane__items) {
  height: 252px;
  max-height: 252px;
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

.event-item.is-serious {
  margin-inline: -6px;
  padding-inline: 8px;
  border-top-color: color-mix(in srgb, #6b7280 22%, var(--n-border-color));
  border-radius: 8px;
  background: linear-gradient(90deg, color-mix(in srgb, #6b7280 8%, transparent), transparent 66%);
}
.event-item.is-serious .event-cover :deep(img) { filter: grayscale(.9) saturate(.15) contrast(.96); }
.event-item.is-serious .event-rank,
.event-item.is-serious .event-rank.is-one,
.event-item.is-serious .event-rank.is-two,
.event-item.is-serious .event-rank.is-three,
.event-item.is-serious .event-rank.is-top10 {
  background: color-mix(in srgb, #6b7280 10%, transparent);
  color: #6b7280;
}
.event-item.is-serious .category-pill,
.event-item.is-serious .trend-pill {
  --category-tone: #6b7280;
  --trend-tone: #6b7280;
  border-color: color-mix(in srgb, #6b7280 22%, transparent);
  background: color-mix(in srgb, #6b7280 7%, transparent);
  color: #6b7280;
}

@media (max-width: 1360px) {
  .topic-layout {
    grid-template-columns: minmax(180px, 220px) minmax(0, 720px) minmax(180px, 220px);
    gap: 16px;
  }
}
@media (max-width: 1240px) {
  .chigua-topic :deep(.topic-lane-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1120px) and (min-width: 821px) {
  .topic-layout {
    grid-template-columns: minmax(170px, 190px) minmax(0, 720px);
    gap: 14px;
  }
  .topic-category-rail { grid-column: 1; grid-row: 1; }
  .topic-main { grid-column: 2; grid-row: 1; }
  .topic-controls {
    position: static;
    grid-column: 1 / -1;
    grid-row: 2;
  }
  .topic-trend-list { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .topic-controls-card {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: end;
    gap: 0;
    padding-bottom: 0;
  }
  .topic-controls-title { grid-column: 1 / -1; }
  .topic-controls-card > .resonance-toggle,
  .topic-controls-card > .reset-filter,
  .topic-controls-card > :deep(.n-button) { width: auto; margin: 8px; }
}
@media (max-width: 820px) {
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
    margin-right: 0;
    padding-right: 0;
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
