<template>
  <section class="game-topic">
    <n-alert
      v-if="loadError"
      type="error"
      :show-icon="false"
      class="topic-alert"
    >
      {{ loadError }}
    </n-alert>

    <section class="topic-section">
      <div class="topic-workspace-header">
        <TopicSwitcher active-topic="game-deals" :locale="locale" />
        <div class="topic-workspace-summary">
          <div class="topic-workspace-title">
            <h1>{{ copy.title }}</h1>
            <p>{{ copy.description }}</p>
          </div>
          <div v-if="dashboard" class="hero-stats" :aria-label="ui.stats">
            <strong>{{ dashboard.total || data.length }}</strong>
            <span>{{ ui.deals }}</span>
            <em>{{ dashboard.sourceCount }} {{ ui.sources }}</em>
          </div>
        </div>
      </div>
      <div class="deal-toolbar">
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
            <CompactFilter v-model="activeTag" :label="ui.type" :aria-label="ui.type" :options="tagOptions" />
            <CompactFilter v-model="activeSource" :label="ui.source" :aria-label="ui.source" :options="sourceOptions" />
            <CompactFilter v-model="activeSort" :label="ui.sort" :aria-label="ui.sort" :options="sortOptions" :show-count="false" />
            <CompactFilter v-model="pageSize" :label="ui.perPage" :aria-label="ui.perPage" :options="pageSizeOptions" :show-count="false" />
            <button v-if="hasFilters" type="button" class="reset-filter" @click="resetFilters">{{ ui.reset }}</button>
          </div>
          <div class="toolbar-actions">
            <div class="result-count"><strong>{{ filteredData.length }}</strong><span>{{ ui.matches }}</span></div>
            <button
              v-if="dashboard?.multiSourceCount"
              type="button"
              class="confirmed-toggle"
              :class="{ active: activeConfirmed }"
              :aria-pressed="activeConfirmed"
              @click="activeConfirmed = !activeConfirmed"
            >{{ ui.confirmed }} <span>{{ dashboard.multiSourceCount }}</span></button>
            <button
              v-if="endingSoonCount"
              type="button"
              class="confirmed-toggle ending-toggle"
              :class="{ active: activeEnding }"
              :aria-pressed="activeEnding"
              @click="activeEnding = !activeEnding"
            >{{ ui.endingSoon }} <span>{{ endingSoonCount }}</span></button>
            <n-button size="small" tertiary :loading="loading" @click="loadTopic(true)">{{ ui.refresh }}</n-button>
          </div>
        </div>
      </div>

      <div
        v-if="featuredGroups.length"
        class="deal-feature-grid"
        :aria-label="copy.feedTitle"
      >
        <a
          v-for="group in featuredGroups"
          :key="group.key"
          class="deal-feature"
          :href="group.item.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="deal-feature__head">
            <span>{{ group.label }}</span>
            <em>{{ group.count }}</em>
          </div>
          <div class="deal-feature__body">
            <img
              :src="
                group.item.cover || getSourceLogo(primarySource(group.item))
              "
              :alt="group.item.title"
              loading="lazy"
              @error="onCoverError($event, group.item)"
            />
            <div>
              <strong>{{ group.item.title }}</strong>
              <p>
                <b v-if="priceLabel(group.item)">{{
                  priceLabel(group.item)
                }}</b>
                <span v-if="discountLabel(group.item)">{{
                  discountLabel(group.item)
                }}</span>
                <time v-if="deadlineLabel(group.item)">{{
                  deadlineLabel(group.item)
                }}</time>
              </p>
            </div>
          </div>
        </a>
      </div>

      <div v-if="loading && !result" class="topic-loading">
        <n-skeleton text :repeat="9" />
      </div>
      <div v-else-if="filteredData.length" ref="dealListRef" class="deal-list">
        <article
          v-for="(item, index) in pagedData"
          :key="item.id"
          class="deal-item"
          :class="dealRankClass(index)"
        >
          <span class="deal-rank">{{
            String(pageStart + index + 1).padStart(2, "0")
          }}</span>
          <a
            class="deal-cover"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            tabindex="-1"
          >
            <img
              :src="item.cover || getSourceLogo(primarySource(item))"
              :alt="item.title"
              loading="lazy"
              @error="onCoverError($event, item)"
            />
          </a>
          <div class="deal-main">
            <div class="deal-source">
              <img
                :src="getSourceLogo(primarySource(item))"
                :alt="primarySourceLabel(item)"
                @error="onLogoError"
              />
              <span>{{ primarySourceLabel(item) }}</span>
              <em v-if="sourceCount(item) > 1" :title="confirmationTitle(item)"
                >{{ sourceCount(item) }}{{ ui.sourceConfirm }}</em
              >
            </div>
            <a
              class="deal-title"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              ><h3>{{ item.title }}</h3></a
            >
            <div class="deal-meta">
              <strong v-if="priceLabel(item)" class="price">{{
                priceLabel(item)
              }}</strong>
              <span v-if="originalPriceLabel(item)" class="original-price">{{
                originalPriceLabel(item)
              }}</span>
              <span v-if="discountLabel(item)" class="discount">{{
                discountLabel(item)
              }}</span>
              <span
                v-for="tag in visibleTags(item)"
                :key="`${item.id}-${tag}`"
                class="tag"
                :class="`tag-${tag}`"
                >{{ tagLabel(tag) }}</span
              >
              <time v-if="deadlineLabel(item)" :title="deadlineTitle(item)">{{
                deadlineLabel(item)
              }}</time>
            </div>
          </div>
          <a
            class="deal-open"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            >{{ actionLabel(item) }}</a
          >
        </article>
        <div class="deal-pagination">
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
import TopicSwitcher from "@/components/TopicSwitcher.vue";
import { getHotListsWithFallback } from "@/api";
import { GAME_DEALS_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { enhanceReadableResultTitles } from "@/utils/readableTitles";
import { useRoute } from "vue-router";

const route = useRoute();
const result = ref(null);
const loading = ref(false);
const loadError = ref("");
const searchQuery = ref(
  typeof route.query.q === "string" ? route.query.q.trim() : "",
);
const activeTag = ref(
  typeof route.query.type === "string" ? route.query.type : "all",
);
const activeSource = ref(
  typeof route.query.source === "string" ? route.query.source : "all",
);
const activeSort = ref(
  ["smart", "price", "discount", "deadline"].includes(route.query.sort)
    ? route.query.sort
    : "smart",
);
const activeConfirmed = ref(route.query.confirmed === "1");
const activeEnding = ref(route.query.ending === "1");
const PAGE_SIZE_VALUES = [20, 30, 50, 100];
const routePage = Number.parseInt(String(route.query.page || "1"), 10);
const routePageSize = Number.parseInt(String(route.query.size || "30"), 10);
const currentPage = ref(Number.isFinite(routePage) && routePage > 0 ? routePage : 1);
const pageSize = ref(PAGE_SIZE_VALUES.includes(routePageSize) ? routePageSize : 30);
const dealListRef = ref(null);
const nowTick = ref(Date.now());
const ENDING_SOON_MS = 72 * 60 * 60 * 1000;
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(
  () =>
    GAME_DEALS_TOPIC_METADATA[locale.value] ||
    GAME_DEALS_TOPIC_METADATA["zh-CN"],
);
const data = computed(() => result.value?.data || []);
const dashboard = computed(() => result.value?.dashboard || null);

const UI_COPY = {
  "zh-CN": {
    stats: "专题统计",
    deals: "条优惠",
    sources: "个来源",
    search: "搜索游戏",
    searchPlaceholder: "搜索游戏名称…",
    matches: "条结果",
    confirmed: "多源确认",
    endingSoon: "即将结束",
    refresh: "刷新",
    filters: "游戏优惠筛选",
    perPage: "每页",
    type: "类型",
    source: "来源",
    sort: "排序",
    smart: "综合价值",
    priceLow: "价格从低到高",
    discountHigh: "折扣从高到低",
    deadlineSoon: "截止时间",
    ended: "已结束",
    todayEnds: "今日结束",
    hoursLeft: "剩 {hours}小时",
    daysHoursLeft: "剩 {days}天{hours}小时",
    endingUrgent: "即将结束",
    reset: "清除筛选",
    all: "全部",
    sourceConfirm: "源确认",
    free: "正在免费",
    upcoming: "即将免费",
    newLowest: "新史低",
    lowest: "史低",
    valuePick: "史低 / 高折扣",
    discount90: "90%+",
    discount75: "75%+",
    under10: "10元内",
    under30: "30元内",
    bundle: "游戏包",
    deal: "优惠",
    claim: "免费领取",
    view: "查看优惠",
    bundleAction: "查看游戏包",
    upcomingAction: "查看活动",
    original: "原价",
  },
  en: {
    stats: "Topic stats",
    deals: "deals",
    sources: "sources",
    search: "Search games",
    searchPlaceholder: "Search game titles…",
    matches: "results",
    confirmed: "Multi-source",
    endingSoon: "Ending soon",
    refresh: "Refresh",
    filters: "Game deal filters",
    perPage: "Per page",
    type: "Type",
    source: "Source",
    sort: "Sort",
    smart: "Best value",
    priceLow: "Lowest price",
    discountHigh: "Biggest discount",
    deadlineSoon: "Ending soon",
    ended: "Ended",
    todayEnds: "Ends today",
    hoursLeft: "{hours}h left",
    daysHoursLeft: "{days}d {hours}h left",
    endingUrgent: "Ending soon",
    reset: "Reset",
    all: "All",
    sourceConfirm: " sources",
    free: "Free now",
    upcoming: "Free soon",
    newLowest: "New low",
    lowest: "Historical low",
    valuePick: "Lows / deep discounts",
    discount90: "90%+ off",
    discount75: "75%+ off",
    under10: "Under ¥10",
    under30: "Under ¥30",
    bundle: "Bundles",
    deal: "Deals",
    claim: "Claim free",
    view: "View deal",
    bundleAction: "View bundle",
    upcomingAction: "View offer",
    original: "Was",
  },
  "zh-TW": {
    stats: "專題統計",
    deals: "筆優惠",
    sources: "個來源",
    search: "搜尋遊戲",
    searchPlaceholder: "搜尋遊戲名稱…",
    matches: "筆結果",
    confirmed: "多源確認",
    endingSoon: "即將結束",
    refresh: "重新整理",
    filters: "遊戲優惠篩選",
    perPage: "每頁",
    type: "類型",
    source: "來源",
    sort: "排序",
    smart: "綜合價值",
    priceLow: "價格由低到高",
    discountHigh: "折扣由高到低",
    deadlineSoon: "截止時間",
    ended: "已結束",
    todayEnds: "今日結束",
    hoursLeft: "剩 {hours}小時",
    daysHoursLeft: "剩 {days}天{hours}小時",
    endingUrgent: "即將結束",
    reset: "清除篩選",
    all: "全部",
    sourceConfirm: "源確認",
    free: "正在免費",
    upcoming: "即將免費",
    newLowest: "新史低",
    lowest: "史低",
    valuePick: "史低 / 高折扣",
    discount90: "90%+",
    discount75: "75%+",
    under10: "10元內",
    under30: "30元內",
    bundle: "遊戲包",
    deal: "優惠",
    claim: "免費領取",
    view: "查看優惠",
    bundleAction: "查看遊戲包",
    upcomingAction: "查看活動",
    original: "原價",
  },
  ja: {
    stats: "トピック統計",
    deals: "件",
    sources: "情報源",
    search: "ゲーム検索",
    searchPlaceholder: "ゲーム名を検索…",
    matches: "件",
    confirmed: "複数ソース確認",
    endingSoon: "まもなく終了",
    refresh: "更新",
    filters: "ゲームセール絞り込み",
    perPage: "件数",
    type: "種類",
    source: "情報源",
    sort: "並び順",
    smart: "価値順",
    priceLow: "価格が安い順",
    discountHigh: "割引率順",
    deadlineSoon: "終了が近い順",
    ended: "終了",
    todayEnds: "本日終了",
    hoursLeft: "残り{hours}時間",
    daysHoursLeft: "残り{days}日{hours}時間",
    endingUrgent: "まもなく終了",
    reset: "解除",
    all: "すべて",
    sourceConfirm: "ソース確認",
    free: "無料配布中",
    upcoming: "近日無料",
    newLowest: "新史上最安",
    lowest: "史上最安",
    valuePick: "史上最安 / 高割引",
    discount90: "90%以上",
    discount75: "75%以上",
    under10: "10元以下",
    under30: "30元以下",
    bundle: "バンドル",
    deal: "セール",
    claim: "無料で入手",
    view: "セールを見る",
    bundleAction: "バンドルを見る",
    upcomingAction: "詳細を見る",
    original: "通常",
  },
  ko: {
    stats: "주제 통계",
    deals: "개 혜택",
    sources: "개 출처",
    search: "게임 검색",
    searchPlaceholder: "게임 이름 검색…",
    matches: "개 결과",
    confirmed: "다중 출처 확인",
    endingSoon: "곧 종료",
    refresh: "새로고침",
    filters: "게임 할인 필터",
    perPage: "페이지당",
    type: "유형",
    source: "출처",
    sort: "정렬",
    smart: "가치순",
    priceLow: "낮은 가격순",
    discountHigh: "할인율순",
    deadlineSoon: "마감 임박순",
    ended: "종료됨",
    todayEnds: "오늘 종료",
    hoursLeft: "{hours}시간 남음",
    daysHoursLeft: "{days}일 {hours}시간 남음",
    endingUrgent: "곧 종료",
    reset: "초기화",
    all: "전체",
    sourceConfirm: "개 출처 확인",
    free: "현재 무료",
    upcoming: "곧 무료",
    newLowest: "신규 역대 최저",
    lowest: "역대 최저",
    valuePick: "역대 최저 / 대폭 할인",
    discount90: "90%+ 할인",
    discount75: "75%+ 할인",
    under10: "¥10 이하",
    under30: "¥30 이하",
    bundle: "번들",
    deal: "할인",
    claim: "무료 받기",
    view: "할인 보기",
    bundleAction: "번들 보기",
    upcomingAction: "행사 보기",
    original: "정가",
  },
};
const ui = computed(() => UI_COPY[locale.value] || UI_COPY["zh-CN"]);
const TAG_ORDER = [
  "free",
  "upcoming-free",
  "new-lowest",
  "lowest",
  "discount90",
  "discount75",
  "under10",
  "under30",
  "bundle",
  "deal",
];
const validTags = new Set(["all", ...TAG_ORDER]);
if (!validTags.has(activeTag.value)) activeTag.value = "all";

const gameDeal = (item) => item?.extra?.gameDeal || {};
const tags = (item) =>
  Array.isArray(gameDeal(item).tags) ? gameDeal(item).tags : [];
const sourceCount = (item) => Number(gameDeal(item).sourceCount || 1);
const primarySource = (item) =>
  gameDeal(item).primarySource || "game-deals-topic";
const primarySourceLabel = (item) =>
  getSourceLabel(
    primarySource(item),
    locale.value,
    gameDeal(item).primarySourceLabel || primarySource(item),
  );
const sourceList = (item) =>
  Array.isArray(gameDeal(item).sources)
    ? gameDeal(item).sources
    : [primarySource(item)];

const tagLabel = (tag) =>
  ({
    free: ui.value.free,
    "upcoming-free": ui.value.upcoming,
    "new-lowest": ui.value.newLowest,
    lowest: ui.value.lowest,
    discount90: ui.value.discount90,
    discount75: ui.value.discount75,
    under10: ui.value.under10,
    under30: ui.value.under30,
    bundle: ui.value.bundle,
    deal: ui.value.deal,
  })[tag] || tag;
const visibleTags = (item) =>
  tags(item)
    .filter((tag) => !["under30", "deal", "free"].includes(tag))
    .slice(0, 3);
const tagOptions = computed(() => [
  { value: "all", label: ui.value.all, count: data.value.length },
  ...TAG_ORDER.filter((tag) => tag !== "deal")
    .map((tag) => ({
      value: tag,
      label: tagLabel(tag),
      count: data.value.filter((item) => tags(item).includes(tag)).length,
    }))
    .filter((item) => item.count > 0),
]);
const sourceOptions = computed(() => [
  { value: "all", label: ui.value.all, count: data.value.length },
  ...(dashboard.value?.sources || []).map((item) => ({
    value: item.source,
    label: getSourceLabel(item.source, locale.value) || item.label,
    count: item.count,
  })),
]);
const sortOptions = computed(() => [
  { value: "smart", label: ui.value.smart },
  { value: "price", label: ui.value.priceLow },
  { value: "discount", label: ui.value.discountHigh },
  { value: "deadline", label: ui.value.deadlineSoon },
]);
const pageSizeOptions = computed(() =>
  PAGE_SIZE_VALUES.map((value) => ({ value, label: String(value) })),
);

const numberValue = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
};
const currentPrice = (item) => numberValue(item?.extra?.currentPrice);
const originalPrice = (item) => numberValue(item?.extra?.originalPrice);
const discount = (item) => numberValue(item?.extra?.discountPercent);
const currency = (item) => String(item?.extra?.currency || "CNY").toUpperCase();
const currencySymbol = (code) =>
  ({ CNY: "¥", RMB: "¥", USD: "$", EUR: "€", GBP: "£" })[code] || `${code} `;
const money = (value, item) => {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return `${currencySymbol(currency(item))}${text}`;
};
const priceLabel = (item) =>
  tags(item).includes("free")
    ? ui.value.free
    : currentPrice(item) !== undefined
      ? money(currentPrice(item), item)
      : "";
const originalPriceLabel = (item) =>
  originalPrice(item) && originalPrice(item) > (currentPrice(item) ?? -1)
    ? `${ui.value.original} ${money(originalPrice(item), item)}`
    : "";
const discountLabel = (item) => (discount(item) ? `-${discount(item)}%` : "");
const score = (item) => numberValue(gameDeal(item).score) || 0;
const textFor = (item) =>
  `${item.title || ""} ${item.desc || ""}`.toLowerCase();
const expiresAt = (item) => numberValue(item?.extra?.expiresAt);
const remainingMs = (item) => {
  const value = expiresAt(item);
  return value ? value - nowTick.value : undefined;
};
const isEndingSoon = (item) => {
  const remaining = remainingMs(item);
  return (
    remaining !== undefined && remaining > 0 && remaining <= ENDING_SOON_MS
  );
};
const endingSoonCount = computed(() => data.value.filter(isEndingSoon).length);
const deadlineSortValue = (item) => {
  const value = expiresAt(item);
  return value && value > nowTick.value ? value : Number.MAX_SAFE_INTEGER;
};
const featuredGroups = computed(() => {
  const pickBest = (items) =>
    items.slice().sort((a, b) => score(b) - score(a))[0];
  const freeItems = data.value.filter((item) => tags(item).includes("free"));
  const endingItems = data.value
    .filter(isEndingSoon)
    .slice()
    .sort((a, b) => deadlineSortValue(a) - deadlineSortValue(b));
  const valueItems = data.value.filter((item) =>
    tags(item).some((tag) =>
      ["new-lowest", "lowest", "discount90", "discount75"].includes(tag),
    ),
  );
  return [
    {
      key: "free",
      label: ui.value.free,
      count: freeItems.length,
      item: pickBest(freeItems),
    },
    {
      key: "value",
      label: ui.value.valuePick,
      count: valueItems.length,
      item: pickBest(valueItems),
    },
    {
      key: "ending",
      label: ui.value.endingSoon,
      count: endingItems.length,
      item: endingItems[0],
    },
  ].filter((group) => group.item);
});

const filteredData = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const rows = data.value.filter((item) => {
    if (query && !textFor(item).includes(query)) return false;
    if (activeTag.value !== "all" && !tags(item).includes(activeTag.value))
      return false;
    if (
      activeSource.value !== "all" &&
      !sourceList(item).includes(activeSource.value)
    )
      return false;
    if (activeConfirmed.value && sourceCount(item) < 2) return false;
    if (activeEnding.value && !isEndingSoon(item)) return false;
    return true;
  });
  return [...rows].sort((a, b) => {
    if (activeSort.value === "price") {
      const currencyOrder = { CNY: 0, RMB: 0, USD: 1, EUR: 2, GBP: 3 };
      const currencyA = currencyOrder[currency(a)] ?? 9;
      const currencyB = currencyOrder[currency(b)] ?? 9;
      return (
        currencyA - currencyB ||
        (currentPrice(a) ?? Number.MAX_SAFE_INTEGER) -
          (currentPrice(b) ?? Number.MAX_SAFE_INTEGER) ||
        score(b) - score(a)
      );
    }
    if (activeSort.value === "discount")
      return (discount(b) || 0) - (discount(a) || 0) || score(b) - score(a);
    if (activeSort.value === "deadline")
      return deadlineSortValue(a) - deadlineSortValue(b) || score(b) - score(a);
    return score(b) - score(a) || Number(b.hot || 0) - Number(a.hot || 0);
  });
});
const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredData.value.length / pageSize.value)),
);
const pageStart = computed(() => (currentPage.value - 1) * pageSize.value);
const dealRankClass = (index) => {
  const rank = pageStart.value + index + 1;
  return rank <= 3 ? ["is-top-deal", `is-top-${rank}`] : [];
};
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
    dealListRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const hasFilters = computed(() =>
  Boolean(
    searchQuery.value ||
    activeTag.value !== "all" ||
    activeSource.value !== "all" ||
    activeSort.value !== "smart" ||
    activeConfirmed.value ||
    activeEnding.value,
  ),
);
const resetFilters = () => {
  searchQuery.value = "";
  activeTag.value = "all";
  activeSource.value = "all";
  activeSort.value = "smart";
  activeConfirmed.value = false;
  activeEnding.value = false;
  currentPage.value = 1;
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
const eventTime = (item) =>
  tags(item).includes("upcoming-free")
    ? numberValue(item?.extra?.startsAt)
    : numberValue(item?.extra?.expiresAt);
const interpolate = (template, values) =>
  Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
const sameLocalDay = (a, b) =>
  new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(a) ===
  new Intl.DateTimeFormat(locale.value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(b);
const deadlineLabel = (item) => {
  const value = eventTime(item);
  if (!value) return "";
  const d = new Date(value);
  if (tags(item).includes("upcoming-free")) {
    return `${ui.value.upcoming} · ${new Intl.DateTimeFormat(locale.value, { month: "2-digit", day: "2-digit" }).format(d)}`;
  }
  const remaining = value - nowTick.value;
  if (remaining <= 0) return ui.value.ended;
  const hours = Math.max(1, Math.floor(remaining / (60 * 60 * 1000)));
  if (remaining <= 6 * 60 * 60 * 1000)
    return `${ui.value.endingUrgent} · ${interpolate(ui.value.hoursLeft, { hours })}`;
  if (
    remaining < 24 * 60 * 60 * 1000 &&
    sameLocalDay(new Date(nowTick.value), d)
  )
    return `${ui.value.todayEnds} · ${interpolate(ui.value.hoursLeft, { hours })}`;
  if (remaining <= ENDING_SOON_MS) {
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return days > 0
      ? interpolate(ui.value.daysHoursLeft, { days, hours: restHours })
      : interpolate(ui.value.hoursLeft, { hours });
  }
  return new Intl.DateTimeFormat(locale.value, {
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};
const deadlineTitle = (item) => {
  const value = eventTime(item);
  return value ? new Date(value).toLocaleString(locale.value) : "";
};
const confirmationTitle = (item) =>
  (gameDeal(item).confirmations || [])
    .map((entry) =>
      getSourceLabel(
        entry.source,
        locale.value,
        entry.sourceLabel || entry.source,
      ),
    )
    .join(" + ");
const actionLabel = (item) =>
  tags(item).includes("free")
    ? ui.value.claim
    : tags(item).includes("upcoming-free")
      ? ui.value.upcomingAction
      : tags(item).includes("bundle")
        ? ui.value.bundleAction
        : ui.value.view;
const onLogoError = (event) => {
  if (event?.target) event.target.src = getSourceLogoFallback();
};
const onCoverError = (event, item) => {
  if (event?.target) event.target.src = getSourceLogo(primarySource(item));
};

let querySyncTimer;
const syncQuery = () => {
  clearTimeout(querySyncTimer);
  querySyncTimer = setTimeout(() => {
    const query = {};
    if (searchQuery.value.trim()) query.q = searchQuery.value.trim();
    if (activeTag.value !== "all") query.type = activeTag.value;
    if (activeSource.value !== "all") query.source = activeSource.value;
    if (activeSort.value !== "smart") query.sort = activeSort.value;
    if (activeConfirmed.value) query.confirmed = "1";
    if (activeEnding.value) query.ending = "1";
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
    activeTag,
    activeSource,
    activeSort,
    activeConfirmed,
    activeEnding,
    currentPage,
    pageSize,
  ],
  syncQuery,
);
watch(
  [searchQuery, activeTag, activeSource, activeSort, activeConfirmed, activeEnding, pageSize],
  () => {
    currentPage.value = 1;
  },
);
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});
watch(sourceOptions, (options) => {
  if (
    activeSource.value !== "all" &&
    !options.some((item) => item.value === activeSource.value)
  )
    activeSource.value = "all";
});
watch(tagOptions, (options) => {
  if (
    activeTag.value !== "all" &&
    !options.some((item) => item.value === activeTag.value)
  )
    activeTag.value = "all";
});

const loadTopic = async (force = false) => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await getHotListsWithFallback(
      "game-deals-topic",
      force,
      { locale: locale.value, translate_limit: 80 },
      { forceNoCache: force, timeout: 12000 },
    );
    if (response?.result?.code !== 200)
      throw new Error(response?.result?.message || "request failed");
    const rawResult = response.result;
    result.value = rawResult;
    loading.value = false;
    result.value = await enhanceReadableResultTitles(rawResult, locale.value, {
      includeDescriptions: false,
      limit: 80,
      sourceName: "game-deals-topic",
    });
  } catch (error) {
    loadError.value = error?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
};
const handleGlobalDataRefresh = (event) =>
  void loadTopic(Boolean(event?.detail?.force));
let countdownTimer;
const startCountdown = () => {
  clearInterval(countdownTimer);
  nowTick.value = Date.now();
  countdownTimer = window.setInterval(() => {
    nowTick.value = Date.now();
  }, 60 * 1000);
};
const stopCountdown = () => clearInterval(countdownTimer);
onMounted(() => {
  window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  startCountdown();
  void loadTopic(false);
});
onActivated(() => {
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  startCountdown();
});
onDeactivated(() => {
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  stopCountdown();
});
onBeforeUnmount(() => {
  clearTimeout(querySyncTimer);
  stopCountdown();
  window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
});
watch(locale, () => void loadTopic(false));
</script>

<style scoped>
.game-topic {
  display: grid;
  gap: 14px;
  width: min(100%, 1240px);
  margin: 0 auto;
}
.topic-section {
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  background: var(--n-color, #fff);
  border-radius: 16px;
}
.topic-workspace-header {
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
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
  max-width: 980px;
  margin: 4px 0 0;
  color: var(--n-text-color-3);
  font-size: 12px;
  line-height: 1.45;
}
.hero-stats {
  display: grid;
  min-width: 98px;
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
.topic-alert {
  border-radius: 12px;
}
.topic-section {
  min-width: 0;
  padding: 16px;
}
.deal-toolbar {
  margin-bottom: 8px;
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
  background: var(--n-color);
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
  white-space: nowrap;
}
.result-count strong {
  font-size: 16px;
}
.result-count span {
  color: var(--n-text-color-3);
  font-size: 10px;
}
.confirmed-toggle,
.reset-filter {
  min-height: 30px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.confirmed-toggle {
  padding: 0 8px;
}
.confirmed-toggle span {
  font-variant-numeric: tabular-nums;
}
.confirmed-toggle:hover,
.reset-filter:hover,
.confirmed-toggle.active {
  border-color: currentColor;
  color: var(--n-text-color);
  background: var(--n-action-color);
}
.reset-filter {
  flex: 0 0 auto;
  padding: 0 8px;
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
.deal-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 2px 0 10px;
}
.deal-feature {
  min-width: 0;
  padding: 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  background: var(--n-action-color, rgba(127, 127, 127, 0.04));
}
.deal-feature:hover,
.deal-feature:focus-visible {
  border-color: var(--n-text-color-3);
  outline: none;
}
.deal-feature__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
  color: var(--n-text-color-2);
  font-size: 11px;
  font-weight: 700;
}
.deal-feature__head em {
  color: var(--n-text-color-3);
  font-size: 10px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}
.deal-feature__body {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
}
.deal-feature__body > img {
  width: 92px;
  height: 52px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--n-color);
}
.deal-feature__body > div {
  min-width: 0;
}
.deal-feature__body strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.35;
}
.deal-feature__body p {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  margin: 5px 0 0;
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 10px;
  white-space: nowrap;
}
.deal-feature__body b {
  color: var(--n-text-color);
  font-size: 12px;
}
.deal-feature__body span {
  color: #d03050;
  font-weight: 600;
}
.deal-list {
  display: grid;
}
.deal-item {
  display: grid;
  grid-template-columns: 30px 112px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  min-width: 0;
  padding: 11px 2px;
  border-top: 1px solid var(--n-border-color);
}
.deal-rank {
  align-self: start;
  padding-top: 3px;
  color: var(--n-text-color-3);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.deal-item.is-top-deal {
  margin-inline: -6px;
  padding-inline: 8px;
  border-radius: 9px;
  background: color-mix(in srgb, var(--n-action-color) 78%, transparent);
}
.deal-item.is-top-deal + .deal-item {
  border-top-color: transparent;
}
.deal-item.is-top-deal .deal-rank {
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
.deal-item.is-top-deal .deal-title h3 {
  font-size: 15px;
  font-weight: 700;
}
.deal-item.is-top-1 {
  background: color-mix(in srgb, var(--n-action-color) 58%, rgba(255, 188, 66, 0.11));
}
.deal-cover {
  width: 112px;
  height: 63px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--n-action-color);
}
.deal-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.deal-main {
  min-width: 0;
}
.deal-source {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: var(--n-text-color-3);
  font-size: 10px;
}
.deal-source img {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  object-fit: contain;
}
.deal-source span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.deal-source em {
  padding: 1px 5px;
  border: 1px solid var(--n-border-color);
  border-radius: 999px;
  color: var(--n-text-color);
  font-style: normal;
  white-space: nowrap;
}
.deal-title {
  color: inherit;
  text-decoration: none;
}
.deal-title h3 {
  margin: 4px 0 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 600;
}
.deal-meta {
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
.price {
  color: var(--n-text-color);
  font-size: 14px;
}
.original-price {
  text-decoration: line-through;
}
.discount {
  font-weight: 600;
  color: #d03050;
}
.tag {
  padding: 1px 5px;
  border-radius: 999px;
  background: var(--n-action-color);
  color: var(--n-text-color-2);
}
.tag-free,
.tag-new-lowest {
  font-weight: 600;
  color: #18a058;
}
.tag-upcoming-free {
  color: #2080f0;
}
.tag-lowest {
  color: #d03050;
}
.deal-open {
  min-width: 70px;
  padding: 6px 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  color: var(--n-text-color);
  font-size: 11px;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
}
.deal-title:hover h3,
.deal-open:hover {
  text-decoration: underline;
}
.deal-list {
  scroll-margin-top: 74px;
}
.deal-pagination {
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
  .game-topic {
    gap: 10px;
  }
  .topic-section {
    border-radius: 12px;
  }
  .topic-workspace-header {
    grid-template-columns: 1fr;
    align-items: stretch;
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
  .topic-section {
    padding: 13px;
  }
  .toolbar-primary {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
  .toolbar-title {
    display: none;
  }
  .toolbar-actions {
    gap: 4px;
    min-width: 0;
    width: 100%;
    max-width: none;
    overflow: visible;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .topic-search {
    min-width: 0;
    max-width: none;
    height: 30px;
  }
  .result-count {
    display: none;
  }
  .confirmed-toggle {
    padding: 0 7px;
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
  .deal-feature-grid {
    display: flex;
    gap: 7px;
    margin-right: -13px;
    padding-right: 13px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .deal-feature-grid::-webkit-scrollbar {
    display: none;
  }
  .deal-feature {
    flex: 0 0 250px;
    padding: 8px;
  }
  .deal-feature__body {
    grid-template-columns: 78px minmax(0, 1fr);
  }
  .deal-feature__body > img {
    width: 78px;
    height: 44px;
  }
  .deal-item {
    grid-template-columns: 24px 64px minmax(0, 1fr);
    gap: 8px;
    padding: 10px 0;
  }
  .deal-cover {
    width: 64px;
    height: 36px;
  }
  .deal-open {
    display: none;
  }
  .deal-source em {
    max-width: 86px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .deal-title h3 {
    font-size: 13px;
  }
  .deal-meta {
    gap: 5px;
  }
  .price {
    font-size: 13px;
  }
  .original-price {
    display: none;
  }
  .deal-meta .tag:nth-of-type(n + 3) {
    display: none;
  }
  .deal-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
    overflow-x: auto;
  }
}
</style>
