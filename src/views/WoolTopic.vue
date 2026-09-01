<template>
  <section class="wool-topic">
    <n-alert
      v-if="loadError"
      type="error"
      :show-icon="false"
      class="topic-alert"
    >
      {{ loadError }}
    </n-alert>
    <n-alert
      v-else-if="woolFailedCount"
      type="warning"
      :show-icon="false"
      class="topic-alert"
    >
      {{ copy.degraded }}
    </n-alert>

    <section class="topic-section feed-section">
      <div class="topic-workspace-header">
        <TopicSwitcher active-topic="wool" :locale="locale" />
        <div class="topic-workspace-title">
          <h1>{{ copy.title }}</h1>
          <p class="topic-description">{{ copy.description }}</p>
        </div>
      </div>
      <div class="opportunity-toolbar">
        <div class="toolbar-primary">
          <div class="toolbar-heading">
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
          <div class="toolbar-filter-strip" role="group" :aria-label="ui.filters">
            <CompactFilter
              v-model="activeSource"
              :label="ui.source"
              :aria-label="ui.source"
              :options="sourceOptions"
            />
            <CompactFilter
              v-model="activeIntent"
              :label="ui.type"
              :aria-label="ui.type"
              :options="intentOptions"
            />
            <CompactFilter
              v-model="activeTime"
              :label="ui.time"
              :aria-label="ui.time"
              :options="timeOptions"
            />
            <CompactFilter
              v-model="activePlatform"
              :label="ui.platform"
              :aria-label="ui.platform"
              :options="platformOptions"
            />
            <CompactFilter
              v-model="activeSort"
              :label="ui.sort"
              :aria-label="ui.sort"
              :options="sortOptions"
              :show-count="false"
            />
            <CompactFilter
              v-model="pageSize"
              :label="ui.perPage"
              :aria-label="ui.perPage"
              :options="pageSizeOptions"
              :show-count="false"
            />
            <button
              v-if="searchQuery || hasActiveFilter"
              type="button"
              class="reset-filter"
              @click="resetFilters"
            >
              {{ ui.resetFilters }}
            </button>
          </div>
          <div class="toolbar-actions">
            <div class="topic-status">
              <strong>{{ filteredData.length }}</strong>
              <span>{{
                searchQuery || hasActiveFilter ? ui.matches : copy.feedTitle
              }}</span>
            </div>
            <button
              v-if="confirmedAvailableCount"
              type="button"
              class="confirmed-toggle"
              :class="{ active: activeConfirmed }"
              :aria-pressed="activeConfirmed"
              @click="activeConfirmed = !activeConfirmed"
            >
              {{ ui.confirmed }} <span>{{ confirmedAvailableCount }}</span>
            </button>
            <n-button
              size="small"
              tertiary
              :loading="loading"
              @click="loadTopic(true)"
            >
              {{ refreshLabel }}
            </n-button>
          </div>
        </div>
      </div>

      <div v-if="loading && !result" class="topic-loading">
        <n-skeleton text :repeat="8" />
      </div>
      <div v-else-if="filteredData.length" ref="opportunityListRef" class="opportunity-list">
        <article
          v-for="(item, index) in pagedData"
          :key="item.id"
          class="opportunity-item"
          :data-super-deal-id="rawSuperDealId(item) || undefined"
          @mouseenter="prefetchSuperDealNavigation(item)"
          @focusin="prefetchSuperDealNavigation(item)"
        >
          <span class="opportunity-rank">{{
            String(pageStart + index + 1).padStart(2, "0")
          }}</span>
          <div class="opportunity-main">
            <div class="opportunity-source">
              <img
                :src="getSourceLogo(item.source)"
                :alt="sourceLabel(item)"
                @error="onLogoError"
              />
              <span>{{ sourceLabel(item) }}</span>
              <em>{{ subtypeLabel(item) }}</em>
            </div>
            <a
              class="opportunity-title-link"
              :href="opportunityHref(item)"
              target="_blank"
              rel="noopener noreferrer"
              @click="handleOpportunityClick($event, item)"
            >
              <h3>{{ item.title }}</h3>
            </a>
            <p v-if="item.desc && locale === 'zh-CN'" class="opportunity-desc">
              {{ item.desc }}
            </p>
            <div class="opportunity-meta">
              <span class="intent-pill">{{ intentLabel(woolType(item)) }}</span>
              <span v-if="platformLabel(item)" class="platform-pill">{{
                platformLabel(item)
              }}</span>
              <span
                v-if="confirmationCount(item) > 1"
                class="confirmation-pill"
                :title="confirmationTitle(item)"
                :aria-label="confirmationTitle(item)"
                >{{ confirmationLabel(item) }}</span
              >
              <strong v-if="primaryPriceLabel(item)" class="price-pill">{{
                primaryPriceLabel(item)
              }}</strong>
              <span
                v-for="(benefit, benefitIndex) in visibleBenefits(item)"
                :key="`${item.id}-${benefit.type}-${benefit.amount}-${benefit.threshold || 0}`"
                class="benefit-pill"
                :class="{ 'benefit-pill--secondary': benefitIndex > 0 }"
                >{{ benefitLabel(benefit) }}</span
              >
              <time :title="formatItemTime(item.timestamp)">{{
                formatFreshness(item.timestamp)
              }}</time>
              <span
                v-for="keyword in visibleKeywords(item)"
                :key="`${item.id}-${keyword}`"
                class="keyword-pill"
                >{{ keyword }}</span
              >
            </div>
            <div
              v-if="showSuperDealInstructions(item)"
              class="opportunity-instructions"
            >
              <strong>{{ ui.navigation.stepsTitle }}</strong>
              <span>{{ navigationForItem(item)?.instructions }}</span>
              <a
                :href="navigationForItem(item)?.sourceUrl || item.url"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
                >{{ ui.navigation.source }}</a
              >
            </div>
          </div>
          <a
            class="opportunity-open"
            :href="opportunityHref(item)"
            target="_blank"
            rel="noopener noreferrer"
            @click="handleOpportunityClick($event, item)"
            >{{ opportunityActionLabel(item) }}</a
          >
        </article>
        <div class="opportunity-pagination">
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
import TopicSwitcher from "@/components/TopicSwitcher.vue";
import CompactFilter from "@/components/CompactFilter.vue";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { getHotListsWithFallback } from "@/api";
import { WOOL_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { GAME_DEAL_SOURCE_IDS } from "@/config/topics";
import { getLocaleFromRoute, normalizeLocale } from "@/utils/locale";
import { getSourceLabel, getSourceSubtitleLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { enhanceReadableResultTitles } from "@/utils/readableTitles";
import { useRoute } from "vue-router";

const route = useRoute();
const result = ref(null);
const loading = ref(false);
const loadError = ref("");
const validIntents = new Set([
  "all",
  "free",
  "red_packet",
  "coupon",
  "delivery",
  "ride",
  "giveaway",
  "ai",
  "deal",
]);
const validTimes = new Set(["all", "1h", "3h", "6h", "today"]);
const validSorts = new Set(["smart", "latest"]);
const queryValue = (value) => (typeof value === "string" ? value : "");
const PAGE_SIZE_VALUES = [20, 30, 50, 100];
const routePage = Number(queryValue(route.query.page));
const routePageSize = Number(queryValue(route.query.size));
const currentPage = ref(Number.isFinite(routePage) && routePage > 0 ? routePage : 1);
const pageSize = ref(PAGE_SIZE_VALUES.includes(routePageSize) ? routePageSize : 30);
const opportunityListRef = ref(null);
const activeIntent = ref(
  validIntents.has(queryValue(route.query.intent))
    ? queryValue(route.query.intent)
    : "all",
);
const activeTime = ref(
  validTimes.has(queryValue(route.query.time))
    ? queryValue(route.query.time)
    : "all",
);
const activeSource = ref(queryValue(route.query.source) || "all");
const activePlatform = ref(queryValue(route.query.platform) || "all");
const activeSort = ref(
  validSorts.has(queryValue(route.query.sort))
    ? queryValue(route.query.sort)
    : "smart",
);
const activeConfirmed = ref(queryValue(route.query.confirmed) === "1");
const searchQuery = ref(queryValue(route.query.q).trim());
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(
  () => WOOL_TOPIC_METADATA[locale.value] || WOOL_TOPIC_METADATA["zh-CN"],
);
const GAME_DEAL_SOURCES = new Set(GAME_DEAL_SOURCE_IDS);
const rawData = computed(() => result.value?.data || []);
const data = computed(() =>
  rawData.value.filter(
    (item) => item?.intent !== "game" && !GAME_DEAL_SOURCES.has(item?.source),
  ),
);
const dashboard = computed(() => result.value?.dashboard || null);
const woolFeeds = computed(() =>
  (dashboard.value?.feeds || []).filter(
    (feed) => !GAME_DEAL_SOURCES.has(feed?.source),
  ),
);
const woolFailedCount = computed(
  () => woolFeeds.value.filter((feed) => feed.status !== "ok").length,
);
const superDealNavigationById = ref({});
const superDealInstructionOpen = ref({});
const superDealResolvePromises = new Map();
const publicApi2Base =
  import.meta.env.VITE_GLOBAL_API2 ||
  (import.meta.env.PROD ? "https://hotapi2.wuaishare.cn" : "/api");

const UI_COPY = {
  "zh-CN": {
    sources: "来源状态",
    source: "来源",
    filters: "机会筛选",
    type: "类型",
    time: "时间",
    platform: "平台",
    sort: "排序",
    perPage: "每页",
    smartSort: "综合",
    newestSort: "最新优先",
    resetFilters: "清除筛选",
    navigation: {
      official: "官方直达",
      product: "官方商品",
      coupon: "官方领券",
      activity: "官方活动",
      steps: "查看步骤",
      stepsTitle: "操作步骤",
      source: "查看原线报",
    },
    allPlatforms: "全部平台",
    confirmed: "多源确认",
    search: "搜索机会",
    searchPlaceholder: "搜索京东、美团、Claude…",
    matches: "条匹配",
    latest: "最新",
    oneHour: "1小时",
    threeHours: "3小时",
    sixHours: "6小时",
    today: "今天",
    allSources: "全部来源",
    sourceUnit: "个来源",
    updated: "更新",
    ok: "正常",
    partial: "部分异常",
    failed: "异常",
    actions: {
      free: "立即领取",
      coupon: "去领券",
      giveaway: "参与活动",
      ai: "查看额度",
      game: "立即领取",
      deal: "查看优惠",
    },
  },
  en: {
    sources: "Source Status",
    source: "Source",
    filters: "Deal filters",
    type: "Type",
    time: "Time",
    platform: "Platform",
    sort: "Sort",
    perPage: "Per page",
    smartSort: "Smart",
    newestSort: "Newest",
    resetFilters: "Reset",
    navigation: {
      official: "Official link",
      product: "Official product",
      coupon: "Official coupon",
      activity: "Official activity",
      steps: "View steps",
      stepsTitle: "How to claim",
      source: "View source",
    },
    allPlatforms: "All platforms",
    confirmed: "Confirmed",
    search: "Search deals",
    searchPlaceholder: "Search JD, Meituan, Claude…",
    matches: "matches",
    latest: "Latest",
    oneHour: "1h",
    threeHours: "3h",
    sixHours: "6h",
    today: "Today",
    allSources: "All sources",
    sourceUnit: "sources",
    updated: "updated",
    ok: "Healthy",
    partial: "Partial",
    failed: "Down",
    actions: {
      free: "Claim now",
      coupon: "Get coupon",
      giveaway: "Join",
      ai: "View credits",
      game: "Claim now",
      deal: "View deal",
    },
  },
  "zh-TW": {
    sources: "來源狀態",
    source: "來源",
    filters: "優惠篩選",
    type: "類型",
    time: "時間",
    platform: "平台",
    sort: "排序",
    perPage: "每頁",
    smartSort: "綜合",
    newestSort: "最新優先",
    resetFilters: "清除篩選",
    navigation: {
      official: "官方直達",
      product: "官方商品",
      coupon: "官方領券",
      activity: "官方活動",
      steps: "查看步驟",
      stepsTitle: "操作步驟",
      source: "查看原線報",
    },
    allPlatforms: "全部平台",
    confirmed: "多源確認",
    search: "搜尋優惠",
    searchPlaceholder: "搜尋京東、美團、Claude…",
    matches: "筆符合",
    latest: "最新",
    oneHour: "1小時",
    threeHours: "3小時",
    sixHours: "6小時",
    today: "今天",
    allSources: "全部來源",
    sourceUnit: "個來源",
    updated: "更新",
    ok: "正常",
    partial: "部分異常",
    failed: "異常",
    actions: {
      free: "立即領取",
      coupon: "領優惠券",
      giveaway: "參與活動",
      ai: "查看額度",
      game: "立即領取",
      deal: "查看優惠",
    },
  },
  ja: {
    sources: "情報源ステータス",
    source: "情報源",
    filters: "お得情報フィルター",
    type: "種類",
    time: "時間",
    platform: "プラットフォーム",
    sort: "並び順",
    perPage: "表示件数",
    smartSort: "総合",
    newestSort: "新着順",
    resetFilters: "リセット",
    navigation: {
      official: "公式へ直行",
      product: "公式商品",
      coupon: "公式クーポン",
      activity: "公式キャンペーン",
      steps: "手順を見る",
      stepsTitle: "利用手順",
      source: "元情報を見る",
    },
    allPlatforms: "すべてのプラットフォーム",
    confirmed: "複数確認",
    search: "お得情報を検索",
    searchPlaceholder: "JD・Meituan・Claudeを検索…",
    matches: "件",
    latest: "最新",
    oneHour: "1時間",
    threeHours: "3時間",
    sixHours: "6時間",
    today: "今日",
    allSources: "すべて",
    sourceUnit: "情報源",
    updated: "更新",
    ok: "正常",
    partial: "一部異常",
    failed: "異常",
    actions: {
      free: "今すぐ受取",
      coupon: "クーポン取得",
      giveaway: "参加する",
      ai: "クレジット確認",
      game: "今すぐ受取",
      deal: "詳細を見る",
    },
  },
  ko: {
    sources: "출처 상태",
    source: "출처",
    filters: "혜택 필터",
    type: "유형",
    time: "시간",
    platform: "플랫폼",
    sort: "정렬",
    perPage: "페이지당",
    smartSort: "종합",
    newestSort: "최신순",
    resetFilters: "초기화",
    navigation: {
      official: "공식 바로가기",
      product: "공식 상품",
      coupon: "공식 쿠폰",
      activity: "공식 이벤트",
      steps: "단계 보기",
      stepsTitle: "이용 단계",
      source: "원문 보기",
    },
    allPlatforms: "전체 플랫폼",
    confirmed: "다중 확인",
    search: "혜택 검색",
    searchPlaceholder: "JD, Meituan, Claude 검색…",
    matches: "개 일치",
    latest: "최신",
    oneHour: "1시간",
    threeHours: "3시간",
    sixHours: "6시간",
    today: "오늘",
    allSources: "전체 출처",
    sourceUnit: "개 출처",
    updated: "업데이트",
    ok: "정상",
    partial: "일부 오류",
    failed: "오류",
    actions: {
      free: "지금 받기",
      coupon: "쿠폰 받기",
      giveaway: "참여하기",
      ai: "크레딧 보기",
      game: "지금 받기",
      deal: "혜택 보기",
    },
  },
};
const ACTION_COPY = {
  "zh-CN": {
    claim: "立即领取",
    claim_coupon: "去领券",
    join: "参与活动",
    groupbuy: "去拼单",
    task: "去参与",
    view: "查看优惠",
  },
  en: {
    claim: "Claim now",
    claim_coupon: "Get coupon",
    join: "Join",
    groupbuy: "Join group",
    task: "Take part",
    view: "View deal",
  },
  "zh-TW": {
    claim: "立即領取",
    claim_coupon: "領優惠券",
    join: "參與活動",
    groupbuy: "去拼單",
    task: "去參與",
    view: "查看優惠",
  },
  ja: {
    claim: "今すぐ受取",
    claim_coupon: "クーポン取得",
    join: "参加する",
    groupbuy: "共同購入",
    task: "参加する",
    view: "詳細を見る",
  },
  ko: {
    claim: "지금 받기",
    claim_coupon: "쿠폰 받기",
    join: "참여하기",
    groupbuy: "공동구매",
    task: "참여하기",
    view: "혜택 보기",
  },
};
const BENEFIT_COPY = {
  "zh-CN": {
    coupon: "券",
    red_packet: "红包",
    subsidy: "补贴",
    cash_gift: "礼金",
    rebate: "返",
    instant_discount: "立减",
    discount: "优惠",
  },
  en: {
    coupon: "Coupon",
    red_packet: "Bonus",
    subsidy: "Subsidy",
    cash_gift: "Credit",
    rebate: "Rebate",
    instant_discount: "Instant off",
    discount: "Discount",
  },
  "zh-TW": {
    coupon: "券",
    red_packet: "紅包",
    subsidy: "補貼",
    cash_gift: "禮金",
    rebate: "返",
    instant_discount: "立減",
    discount: "優惠",
  },
  ja: {
    coupon: "クーポン",
    red_packet: "ボーナス",
    subsidy: "補助",
    cash_gift: "特典",
    rebate: "還元",
    instant_discount: "即時割引",
    discount: "割引",
  },
  ko: {
    coupon: "쿠폰",
    red_packet: "보너스",
    subsidy: "보조금",
    cash_gift: "크레딧",
    rebate: "환급",
    instant_discount: "즉시할인",
    discount: "할인",
  },
};
const ui = computed(() => UI_COPY[locale.value] || UI_COPY["zh-CN"]);

const rawSuperDealId = (item) => {
  if (item?.source !== "super-deals") return "";
  return (
    String(item.id || "")
      .split(":")
      .pop() || ""
  );
};
const navigationForItem = (item) => {
  const id = rawSuperDealId(item);
  return id ? superDealNavigationById.value[id] || null : null;
};
const superDealPlatform = (item) =>
  item?.extra?.platform || item?.signals?.primaryPlatform || "";
const superDealGoUrl = (item) => {
  const id = rawSuperDealId(item);
  if (!id) return item?.url || "#";
  const base = `${String(publicApi2Base).replace(/\/$/, "")}/go/super-deals/${encodeURIComponent(id)}`;
  const platform = superDealPlatform(item);
  return platform ? `${base}?platform=${encodeURIComponent(platform)}` : base;
};
const resolveSuperDealNavigation = async (item) => {
  const id = rawSuperDealId(item);
  if (!id) return null;
  if (superDealNavigationById.value[id])
    return superDealNavigationById.value[id];
  if (superDealResolvePromises.has(id)) return superDealResolvePromises.get(id);

  const promise = getHotListsWithFallback(
    "super-deals",
    false,
    {
      id,
      platform: superDealPlatform(item),
      locale: locale.value,
      translate_limit: 1,
    },
    { timeout: 6500 },
  )
    .then((response) => {
      const resolvedItem = response?.result?.data?.[0];
      const navigation = resolvedItem?.navigation;
      if (!navigation) return null;
      const normalized = {
        ...navigation,
        instructions: resolvedItem?.desc || navigation.instructions,
      };
      superDealNavigationById.value[id] = normalized;
      return normalized;
    })
    .catch(() => null)
    .finally(() => superDealResolvePromises.delete(id));
  superDealResolvePromises.set(id, promise);
  return promise;
};
const prefetchSuperDealNavigation = (item) => {
  if (item?.source === "super-deals") void resolveSuperDealNavigation(item);
};
let superDealVisibilityObserver;
const observeVisibleSuperDeals = async () => {
  if (
    typeof window === "undefined" ||
    typeof IntersectionObserver === "undefined"
  )
    return;
  await nextTick();
  if (!superDealVisibilityObserver) {
    superDealVisibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target?.dataset?.superDealId || "";
          const item = data.value.find(
            (candidate) => rawSuperDealId(candidate) === id,
          );
          if (!item) {
            superDealVisibilityObserver?.unobserve(entry.target);
            return;
          }
          void resolveSuperDealNavigation(item).then((navigation) => {
            if (navigation) {
              superDealVisibilityObserver?.unobserve(entry.target);
              return;
            }
            entry.target.dataset.superDealObserved = "0";
            window.setTimeout(() => {
              if (entry.target.isConnected) {
                entry.target.dataset.superDealObserved = "1";
                superDealVisibilityObserver?.observe(entry.target);
              }
            }, 1200);
          });
        });
      },
      { rootMargin: "700px 0px", threshold: 0.01 },
    );
  }
  document
    .querySelectorAll(".opportunity-item[data-super-deal-id]")
    .forEach((element) => {
      if (element.dataset.superDealObserved === "1") return;
      element.dataset.superDealObserved = "1";
      superDealVisibilityObserver.observe(element);
    });
};

const prefetchTopSuperDeals = async () => {
  const items = data.value
    .filter((item) => item.source === "super-deals")
    .slice(0, 8);
  for (let index = 0; index < items.length; index += 2) {
    await Promise.allSettled(
      items.slice(index, index + 2).map(resolveSuperDealNavigation),
    );
  }
};
const showSuperDealInstructions = (item) => {
  const id = rawSuperDealId(item);
  const navigation = navigationForItem(item);
  return Boolean(
    id &&
    superDealInstructionOpen.value[id] &&
    navigation?.directType === "app" &&
    navigation?.instructions,
  );
};
const opportunityHref = (item) => {
  if (item?.source !== "super-deals") return item?.url || "#";
  const navigation = navigationForItem(item);
  if (navigation?.directType === "official" && navigation.directUrl)
    return navigation.directUrl;
  if (navigation?.directType === "source" && navigation.sourceUrl)
    return navigation.sourceUrl;
  if (navigation?.directType === "app" && navigation.sourceUrl)
    return navigation.sourceUrl;
  return superDealGoUrl(item);
};
const handleOpportunityClick = (event, item) => {
  if (item?.source !== "super-deals") return;
  const navigation = navigationForItem(item);
  if (navigation?.directType !== "app" || !navigation.instructions) return;
  event.preventDefault();
  const id = rawSuperDealId(item);
  superDealInstructionOpen.value[id] = !superDealInstructionOpen.value[id];
};
const opportunityActionLabel = (item) => {
  if (item?.source !== "super-deals") return actionLabel(item);
  const navigation = navigationForItem(item);
  if (navigation?.directType === "official") {
    const kind = navigation?.directKind;
    return ui.value.navigation[kind] || ui.value.navigation.official;
  }
  if (navigation?.directType === "app" && navigation.instructions)
    return ui.value.navigation.steps;
  if (navigation?.directType === "source") return ui.value.navigation.source;
  return actionLabel(item);
};

const signalText = (item) =>
  `${item?.signals?.primaryPlatform || ""} ${(item?.signals?.benefits || []).map((benefit) => benefit.raw || "").join(" ")}`;
const clusterText = (item) =>
  (item?.cluster?.sources || [])
    .map((source) => `${source.sourceLabel || ""} ${source.title || ""}`)
    .join(" ");
const textForItem = (item) =>
  `${item.title || ""} ${item.desc || ""} ${item.extra?.platform || ""} ${(item.matchedKeywords || []).join(" ")} ${signalText(item)} ${clusterText(item)}`.toLowerCase();
const hasBenefitType = (item, type) =>
  (item?.signals?.benefits || []).some((benefit) => benefit?.type === type);
const woolType = (item) => {
  const text = textForItem(item);
  if (hasBenefitType(item, "red_packet") || /红包|洪包|紅包/.test(text))
    return "red_packet";
  if (
    /外卖|外賣|闪购|閃購|饿了么|餓了麼|美团买菜|美團買菜|即时零售|即時零售/.test(
      text,
    )
  )
    return "delivery";
  if (
    /打车|打車|滴滴|花小猪|花小豬|高德打车|高德打車|曹操出行|t3出行/.test(text)
  )
    return "ride";
  if (item?.intent === "coupon" || hasBenefitType(item, "coupon"))
    return "coupon";
  if (["free", "giveaway", "ai"].includes(item?.intent)) return item.intent;
  return "deal";
};
const itemMatchesSource = (item, source) =>
  source === "all" ||
  item.source === source ||
  (item?.cluster?.sources || []).some((evidence) => evidence.source === source);
const matchesTime = (item, range) => {
  if (range === "all") return true;
  const timestamp = Number(item.timestamp);
  if (!Number.isFinite(timestamp)) return false;
  if (range === "today")
    return new Date(timestamp).toDateString() === new Date().toDateString();
  const limits = { "1h": 1, "3h": 3, "6h": 6 };
  return Date.now() - timestamp <= limits[range] * 60 * 60 * 1000;
};
const matchesSearch = (item) => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return true;
  return `${textForItem(item)} ${sourceLabel(item)} ${subtypeLabel(item)}`
    .toLowerCase()
    .includes(query);
};
const matchesBase = (
  item,
  {
    intent = activeIntent.value,
    source = activeSource.value,
    time = activeTime.value,
    platform = activePlatform.value,
    confirmed = activeConfirmed.value,
  } = {},
) =>
  (intent === "all" || woolType(item) === intent) &&
  itemMatchesSource(item, source) &&
  (platform === "all" || platformLabel(item) === platform) &&
  (!confirmed || Number(item?.cluster?.sourceCount || 0) > 1) &&
  matchesTime(item, time) &&
  matchesSearch(item);

const filteredData = computed(() => {
  const items = data.value.filter((item) => matchesBase(item));
  if (activeSort.value === "latest") {
    return items
      .slice()
      .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
  }
  return items;
});
const sortOptions = computed(() => [
  { value: "smart", label: ui.value.smartSort },
  { value: "latest", label: ui.value.newestSort },
]);
const pageSizeOptions = computed(() =>
  PAGE_SIZE_VALUES.map((value) => ({ value, label: String(value) })),
);
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
    opportunityListRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
    void observeVisibleSuperDeals();
  });
};

const confirmedAvailableCount = computed(
  () =>
    data.value.filter(
      (item) =>
        matchesBase(item, { confirmed: false }) &&
        Number(item?.cluster?.sourceCount || 0) > 1,
    ).length,
);
const hasActiveFilter = computed(
  () =>
    activeIntent.value !== "all" ||
    activeTime.value !== "all" ||
    activeSource.value !== "all" ||
    activePlatform.value !== "all" ||
    activeSort.value !== "smart" ||
    activeConfirmed.value,
);
const intentOptions = computed(() => [
  {
    value: "all",
    label: copy.value.all,
    count: data.value.filter((item) => matchesBase(item, { intent: "all" }))
      .length,
  },
  ...Object.entries(copy.value.intents).map(([value, label]) => ({
    value,
    label,
    count: data.value.filter((item) => matchesBase(item, { intent: value }))
      .length,
  })),
]);
const timeOptions = computed(() =>
  [
    ["all", ui.value.latest],
    ["1h", ui.value.oneHour],
    ["3h", ui.value.threeHours],
    ["6h", ui.value.sixHours],
    ["today", ui.value.today],
  ].map(([value, label]) => ({
    value,
    label,
    count: data.value.filter((item) => matchesBase(item, { time: value }))
      .length,
  })),
);
const platformOptions = computed(() => {
  const values = [
    ...new Set(data.value.map((item) => platformLabel(item)).filter(Boolean)),
  ].sort((a, b) => String(a).localeCompare(String(b), locale.value));
  return [
    {
      value: "all",
      label: ui.value.allPlatforms,
      count: data.value.filter((item) => matchesBase(item, { platform: "all" }))
        .length,
    },
    ...values.map((value) => ({
      value,
      label: value,
      count: data.value.filter((item) => matchesBase(item, { platform: value }))
        .length,
    })),
  ];
});

const parseUpdateTime = (value) => {
  const time = new Date(value || "").getTime();
  return Number.isFinite(time) ? time : 0;
};
const sourceOptions = computed(() => {
  const feeds = woolFeeds.value;
  const grouped = new Map();
  feeds.forEach((feed) => {
    const current = grouped.get(feed.source) || {
      source: feed.source,
      label: feed.label,
      feeds: [],
    };
    current.feeds.push(feed);
    grouped.set(feed.source, current);
  });
  const failedFeedCount = feeds.filter((feed) => feed.status !== "ok").length;
  const allStatus = failedFeedCount
    ? failedFeedCount >= feeds.length
      ? "failed"
      : "partial"
    : "ok";
  const options = [
    {
      value: "all",
      label: ui.value.allSources,
      count: data.value.length,
      status: allStatus,
      detail: `${grouped.size} ${ui.value.sourceUnit}`,
    },
  ];
  grouped.forEach((group, source) => {
    const okCount = group.feeds.filter((feed) => feed.status === "ok").length;
    const status =
      okCount === 0
        ? "failed"
        : okCount === group.feeds.length
          ? "ok"
          : "partial";
    const updateTime = group.feeds
      .map((feed) => feed.updateTime)
      .sort((a, b) => parseUpdateTime(b) - parseUpdateTime(a))[0];
    options.push({
      value: source,
      label: getSourceLabel(source, locale.value, group.label || source),
      count: data.value.filter((item) => itemMatchesSource(item, source))
        .length,
      status,
      detail: updateTime
        ? `${formatUpdated(updateTime)} ${ui.value.updated}`
        : statusLabel(status),
    });
  });
  return options;
});

const refreshLabels = {
  "zh-CN": "刷新",
  en: "Refresh",
  "zh-TW": "重新整理",
  ja: "更新",
  ko: "새로고침",
};
const refreshLabel = computed(
  () => refreshLabels[locale.value] || refreshLabels["zh-CN"],
);
const sourceLabel = (item) =>
  getSourceLabel(
    item?.source,
    locale.value,
    item?.sourceLabel || item?.source || "",
  );
const subtypeLabel = (item) =>
  getSourceSubtitleLabel(item?.sourceSubtype || "", locale.value);
const intentLabel = (intent) =>
  copy.value.intents?.[intent] || copy.value.intents.deal;
const actionLabel = (item) =>
  ACTION_COPY[locale.value]?.[item?.signals?.action] ||
  ui.value.actions?.[item?.intent] ||
  copy.value.open;
const statusLabel = (status) => ui.value[status] || status;
const CONFIRMATION_LABELS = {
  "zh-CN": "源确认",
  en: "sources",
  "zh-TW": "來源確認",
  ja: "ソース確認",
  ko: "개 출처 확인",
};
const confirmationCount = (item) => Number(item?.cluster?.sourceCount || 0);
const confirmationLabel = (item) =>
  `${confirmationCount(item)}${locale.value === "en" ? " " : ""}${CONFIRMATION_LABELS[locale.value] || CONFIRMATION_LABELS["zh-CN"]}`;
const confirmationTitle = (item) =>
  [
    ...new Set(
      (item?.cluster?.sources || []).map((source) =>
        getSourceLabel(
          source.source,
          locale.value,
          source.sourceLabel || source.source,
        ),
      ),
    ),
  ].join(" + ");
const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `¥${new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(amount)}`;
};
const primaryPriceLabel = (item) =>
  formatMoney(item?.signals?.primaryPrice?.value);
const BENEFIT_PRIORITY = {
  coupon: 1,
  red_packet: 2,
  instant_discount: 3,
  subsidy: 4,
  cash_gift: 5,
  rebate: 6,
  discount: 7,
};
const visibleBenefits = (item) =>
  [...(item?.signals?.benefits || [])]
    .sort(
      (a, b) =>
        (BENEFIT_PRIORITY[a.type] || 99) - (BENEFIT_PRIORITY[b.type] || 99) ||
        Number(b.amount || 0) - Number(a.amount || 0),
    )
    .slice(0, 2);
const benefitLabel = (benefit) => {
  const labels = BENEFIT_COPY[locale.value] || BENEFIT_COPY["zh-CN"];
  const name = labels[benefit?.type] || labels.discount;
  const amount = formatMoney(benefit?.amount);
  const threshold = formatMoney(benefit?.threshold);
  if (threshold) {
    if (locale.value === "zh-CN")
      return `${name} 满${threshold.slice(1)}减${amount.slice(1)}`;
    if (locale.value === "zh-TW")
      return `${name} 滿${threshold.slice(1)}減${amount.slice(1)}`;
    return `${name} -${amount}/${threshold}`;
  }
  return amount ? `${name} ${amount}` : name;
};

const formatItemTime = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat(locale.value, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
};
const formatUpdated = (value) => {
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
const formatFreshness = (value) => {
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp)) return "—";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (locale.value === "zh-CN")
    return minutes < 1
      ? "刚刚"
      : minutes < 60
        ? `${minutes}分钟前`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}小时前`
          : `${Math.floor(minutes / 1440)}天前`;
  if (locale.value === "zh-TW")
    return minutes < 1
      ? "剛剛"
      : minutes < 60
        ? `${minutes}分鐘前`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}小時前`
          : `${Math.floor(minutes / 1440)}天前`;
  if (locale.value === "ja")
    return minutes < 1
      ? "たった今"
      : minutes < 60
        ? `${minutes}分前`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}時間前`
          : `${Math.floor(minutes / 1440)}日前`;
  if (locale.value === "ko")
    return minutes < 1
      ? "방금"
      : minutes < 60
        ? `${minutes}분 전`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}시간 전`
          : `${Math.floor(minutes / 1440)}일 전`;
  return minutes < 1
    ? "just now"
    : minutes < 60
      ? `${minutes}m ago`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)}h ago`
        : `${Math.floor(minutes / 1440)}d ago`;
};
const PLATFORM_RULES = [
  [/(京东|jd\.com|jdapp)/i, "京东"],
  [/(淘宝|淘工厂|淘宝闪购)/i, "淘宝"],
  [/天猫/i, "天猫"],
  [/美团/i, "美团"],
  [/(拼多多|pdd)/i, "拼多多"],
  [/(支付宝|蚂蚁)/i, "支付宝"],
  [/微信/i, "微信"],
  [/steam/i, "Steam"],
  [/epic/i, "Epic"],
  [/(app store|苹果商店)/i, "App Store"],
  [/饿了么/i, "饿了么"],
  [/抖音/i, "抖音"],
];
const platformLabel = (item) =>
  item?.signals?.primaryPlatform ||
  item?.extra?.platform ||
  PLATFORM_RULES.find(([pattern]) => pattern.test(textForItem(item)))?.[1] ||
  "";
const visibleKeywords = (item) => {
  if (item?.signals?.primaryPrice || item?.signals?.benefits?.length) return [];
  return (item?.matchedKeywords || [])
    .filter(
      (keyword) => keyword.length > 1 && !["优惠券", "免费"].includes(keyword),
    )
    .slice(0, 1);
};
const onLogoError = (event) => {
  if (event?.target) event.target.src = getSourceLogoFallback();
};

let querySyncTimer;
const syncQuery = () => {
  clearTimeout(querySyncTimer);
  querySyncTimer = setTimeout(() => {
    const query = { ...route.query };
    const setOrDelete = (key, value, defaultValue = "") =>
      value && value !== defaultValue
        ? (query[key] = value)
        : delete query[key];
    setOrDelete("q", searchQuery.value.trim());
    setOrDelete("source", activeSource.value, "all");
    setOrDelete("platform", activePlatform.value, "all");
    setOrDelete("sort", activeSort.value, "smart");
    setOrDelete("confirmed", activeConfirmed.value ? "1" : "");
    setOrDelete("time", activeTime.value, "all");
    setOrDelete("intent", activeIntent.value, "all");
    setOrDelete("page", currentPage.value > 1 ? String(currentPage.value) : "");
    setOrDelete("size", pageSize.value !== 30 ? String(pageSize.value) : "");
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value))
        value.forEach((item) => params.append(key, String(item)));
      else if (value !== undefined && value !== null)
        params.set(key, String(value));
    });
    const search = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${route.path}${search ? `?${search}` : ""}${route.hash || ""}`,
    );
  }, 220);
};

const resetFilters = () => {
  searchQuery.value = "";
  activeSource.value = "all";
  activeIntent.value = "all";
  activeTime.value = "all";
  activePlatform.value = "all";
  activeSort.value = "smart";
  activeConfirmed.value = false;
  currentPage.value = 1;
};

const loadTopic = async (force = false) => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await getHotListsWithFallback(
      "wool-topic",
      force,
      { locale: locale.value, translate_limit: 60 },
      { forceNoCache: force },
    );
    if (response?.result?.code !== 200)
      throw new Error(response?.result?.message || "request failed");
    const rawResult = response.result;
    result.value = rawResult;
    loading.value = false;
    void prefetchTopSuperDeals();
    void observeVisibleSuperDeals();
    result.value = await enhanceReadableResultTitles(rawResult, locale.value, {
      includeDescriptions: false,
      limit: 60,
      sourceName: "wool-topic",
    });
  } catch (error) {
    loadError.value = error?.message || "Failed to load";
  } finally {
    loading.value = false;
  }
};

watch(locale, () => {
  superDealNavigationById.value = {};
  superDealInstructionOpen.value = {};
  void loadTopic(false);
});
watch(
  [
    searchQuery,
    activeSource,
    activePlatform,
    activeSort,
    activeConfirmed,
    activeTime,
    activeIntent,
    currentPage,
    pageSize,
  ],
  syncQuery,
);
watch(
  [
    searchQuery,
    activeSource,
    activePlatform,
    activeSort,
    activeConfirmed,
    activeTime,
    activeIntent,
    pageSize,
  ],
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
    !options.some((option) => option.value === activeSource.value)
  )
    activeSource.value = "all";
});
watch(platformOptions, (options) => {
  if (
    activePlatform.value !== "all" &&
    !options.some((option) => option.value === activePlatform.value)
  )
    activePlatform.value = "all";
});
const handleGlobalDataRefresh = (event) => {
  void loadTopic(Boolean(event?.detail?.force));
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  }
  loadTopic(false);
});

onActivated(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
    window.addEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  }
});

onDeactivated(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  }
});
watch(pagedData, () => void observeVisibleSuperDeals(), { flush: "post" });
onBeforeUnmount(() => {
  clearTimeout(querySyncTimer);
  if (typeof window !== "undefined") {
    window.removeEventListener(DATA_REFRESH_EVENT, handleGlobalDataRefresh);
  }
  superDealVisibilityObserver?.disconnect();
  superDealVisibilityObserver = undefined;
});
</script>
<style scoped>
.wool-topic {
  --wool-section-gap: 14px;
  --wool-section-padding: 16px;
  --wool-list-padding-y: 11px;
  display: grid;
  gap: var(--wool-section-gap);
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
.topic-workspace-title {
  min-width: 0;
}
.topic-workspace-title h1 {
  margin: 0;
  font-size: clamp(20px, 2vw, 26px);
  line-height: 1.2;
}
.topic-search {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(300px, 100%);
  min-width: 200px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.2));
  border-radius: 9px;
  color: var(--n-text-color-3, #777);
}
.topic-search:focus-within {
  border-color: var(--n-text-color-2, #555);
}
.topic-search svg {
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}
.topic-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color, #222);
  font: inherit;
  font-size: 12px;
}
.topic-search input::placeholder {
  color: var(--n-text-color-3, #888);
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
.topic-description {
  max-width: 1080px;
  margin: 4px 0 0;
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
  margin: -4px 0 0;
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

.source-status-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}
.source-status {
  appearance: none;
  min-width: 0;
  padding: 10px 11px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.16));
  border-radius: 9px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.source-status:hover,
.source-status.active {
  border-color: var(--n-text-color-2, #555);
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 96%,
    var(--n-text-color, #222) 4%
  );
}
.source-status:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.source-status-main,
.source-status-meta {
  display: flex;
  align-items: center;
  min-width: 0;
}
.source-status-main {
  gap: 7px;
}
.source-status-main img,
.source-status-all {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 4px;
}
.source-status-all {
  display: grid;
  place-items: center;
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 88%,
    var(--n-text-color, #222) 12%
  );
  font-size: 10px;
  font-weight: 800;
}
.source-status-main strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}
.source-health {
  width: 6px;
  height: 6px;
  margin-left: auto;
  flex: 0 0 6px;
  border-radius: 50%;
  background: var(--n-text-color-3, #888);
}
.source-health.is-ok {
  background: #2f9e44;
}
.source-health.is-partial {
  background: #d08b14;
}
.source-health.is-failed {
  background: #d9485f;
}
.source-status-meta {
  justify-content: space-between;
  gap: 8px;
  margin-top: 7px;
  color: var(--n-text-color-3, #777);
  font-size: 10px;
}
.source-status-meta b {
  color: var(--n-text-color, #222);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.source-status-meta span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.feed-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.confirmed-toggle {
  appearance: none;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.2));
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2, #555);
  font-size: 11px;
  cursor: pointer;
}
.confirmed-toggle span {
  margin-left: 4px;
  font-variant-numeric: tabular-nums;
}
.confirmed-toggle:hover,
.confirmed-toggle.active {
  border-color: currentColor;
  color: var(--n-text-color, #222);
}
.confirmed-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.filter-stack {
  display: grid;
  gap: 7px;
  margin-bottom: 9px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.filter-label {
  flex: 0 0 30px;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
  font-weight: 700;
}
.time-filter {
  flex: 1 1 auto;
}
.platform-filter {
  position: relative;
  flex: 0 0 auto;
}
.platform-filter select {
  appearance: none;
  height: 30px;
  max-width: 150px;
  padding: 0 28px 0 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.2));
  border-radius: 999px;
  background: var(--n-color, #fff);
  color: var(--n-text-color-2, #555);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.platform-filter::after {
  position: absolute;
  top: 50%;
  right: 10px;
  width: 6px;
  height: 6px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  color: var(--n-text-color-3, #777);
  content: "";
  pointer-events: none;
  transform: translateY(-70%) rotate(45deg);
}
.platform-filter select:hover,
.platform-filter select:focus-visible {
  border-color: currentColor;
  outline: none;
  color: var(--n-text-color, #222);
}
.opportunity-source {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
}
.opportunity-source img {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 4px;
  object-fit: cover;
}
.opportunity-source span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--n-text-color, #222);
  font-weight: 650;
}
.opportunity-source em {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-style: normal;
}
.opportunity-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 7px;
  margin-top: 8px;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
}
.platform-pill {
  color: var(--n-text-color-2, #555);
  font-weight: 650;
}
.confirmation-pill {
  display: inline-flex;
  align-items: center;
  min-height: 19px;
  padding: 0 6px;
  border: 1px solid currentColor;
  border-radius: 999px;
  color: var(--n-text-color-2, #555);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}
.price-pill {
  color: var(--n-text-color, #222);
  font-size: 13px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.benefit-pill {
  display: inline-flex;
  align-items: center;
  min-height: 19px;
  padding: 0 6px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.14));
  border-radius: 999px;
  color: var(--n-text-color-2, #555);
  font-size: 10px;
  font-weight: 650;
  white-space: nowrap;
}
.keyword-pill {
  display: inline-flex;
  align-items: center;
  min-height: 19px;
  padding: 0 6px;
  border-radius: 999px;
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 92%,
    var(--n-text-color, #222) 8%
  );
  color: var(--n-text-color-3, #666);
  font-size: 10px;
}
.intent-pill {
  display: inline-flex;
  align-items: center;
  min-height: 21px;
  padding: 0 7px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.16));
  border-radius: 999px;
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 90%,
    var(--n-text-color, #222) 10%
  );
  color: var(--n-text-color-2, #555);
  font-size: 10px;
  font-weight: 650;
}
.intent-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 0;
  min-width: 0;
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
.opportunity-item:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.opportunity-title-link {
  display: block;
  color: inherit;
  text-decoration: none;
}
.opportunity-title-link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
  border-radius: 4px;
}
.opportunity-instructions {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.14));
  border-radius: 8px;
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 96%,
    var(--n-text-color, #222) 4%
  );
  font-size: 11px;
  line-height: 1.55;
}
.opportunity-instructions strong {
  white-space: nowrap;
}
.opportunity-instructions span {
  min-width: 0;
  color: var(--n-text-color-2, #555);
}
.opportunity-instructions a {
  color: var(--n-text-color-2, #555);
  white-space: nowrap;
  text-underline-offset: 2px;
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
  text-decoration: none;
  color: var(--n-text-color-3, #777);
  font-size: 12px;
  white-space: nowrap;
}
.opportunity-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 2px 2px;
  border-top: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  color: var(--n-text-color-3);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
.topic-loading,
.topic-empty {
  padding: 24px 0;
}
/* Unified opportunity controls: keep all operations in one compact panel. */
.opportunity-toolbar {
  margin-bottom: 10px;
}
.toolbar-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.toolbar-heading {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex: 0 0 auto;
  min-width: 0;
  white-space: nowrap;
}
.toolbar-heading h2 {
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
}
.toolbar-heading span {
  display: inline;
  margin-top: 0;
  color: var(--n-text-color-3, #777);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.opportunity-toolbar .topic-search {
  flex: 0 1 220px;
  width: 220px;
  min-width: 150px;
  max-width: 220px;
  height: 30px;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 7px;
  min-width: max-content;
  white-space: nowrap;
}
.opportunity-toolbar .topic-status {
  position: static;
  display: flex;
  align-items: baseline;
  gap: 4px;
  min-width: 54px;
  text-align: left;
  white-space: nowrap;
}
.opportunity-toolbar .topic-status strong {
  display: inline;
  font-size: 18px;
  line-height: 1;
}
.opportunity-toolbar .topic-status span {
  display: inline;
  margin: 0;
  font-size: 10px;
}
.toolbar-filter-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;
}
.toolbar-filter-strip::-webkit-scrollbar {
  display: none;
}
.toolbar-select {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: 0 0 auto;
  height: 31px;
  padding: 0 7px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 8px;
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 97%,
    var(--n-text-color, #222) 3%
  );
}
.toolbar-select > span {
  color: var(--n-text-color-3, #777);
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}
.toolbar-select .source-health {
  margin-left: 0;
}
.toolbar-select select {
  max-width: 160px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color, #222);
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.toolbar-select select:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
.reset-filter {
  flex: 0 0 auto;
  height: 31px;
  padding: 0 9px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--n-text-color-3, #777);
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.reset-filter:hover,
.reset-filter:focus-visible {
  background: color-mix(
    in srgb,
    var(--n-color, #fff) 92%,
    var(--n-text-color, #222) 8%
  );
  color: var(--n-text-color, #222);
}
@media (max-width: 1100px) and (min-width: 641px) {
  .toolbar-primary {
    flex-wrap: wrap;
  }
  .toolbar-heading {
    display: none;
  }
  .opportunity-toolbar .topic-search {
    flex: 1 1 220px;
    max-width: 320px;
  }
  .toolbar-filter-strip {
    order: 3;
    flex: 1 0 100%;
  }
}
@media (max-width: 980px) {
  .source-status-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 720px) {
  .source-status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .wool-topic {
    --wool-section-gap: 10px;
    --wool-section-padding: 13px;
    --wool-list-padding-y: 10px;
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
  .topic-workspace-title h1 {
    font-size: 18px;
    line-height: 1.3;
  }
  .topic-search {
    width: 100%;
    min-width: 0;
    height: 32px;
  }
  .topic-description {
    display: -webkit-box;
    margin-top: 4px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.45;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .source-status-grid {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(150px, 48vw);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: inline proximity;
    scrollbar-width: none;
  }
  .source-status-grid::-webkit-scrollbar {
    display: none;
  }
  .source-status {
    scroll-snap-align: start;
  }
  .section-heading--feed {
    align-items: center;
    gap: 8px;
  }
  .section-heading--feed p {
    display: none;
  }
  .filter-row {
    align-items: flex-start;
    gap: 6px;
  }
  .filter-label {
    flex-basis: 28px;
    padding-top: 7px;
  }
  .intent-filter {
    flex: 1 1 auto;
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
  .platform-filter select {
    max-width: 112px;
    padding-left: 9px;
    font-size: 11px;
  }
  .opportunity-instructions {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .opportunity-instructions a {
    justify-self: start;
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
  .opportunity-meta {
    gap: 4px 6px;
  }
  .benefit-pill--secondary {
    display: none;
  }
  .opportunity-desc {
    -webkit-line-clamp: 2;
  }
  .opportunity-pagination {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }
}
@media (max-width: 640px) {
  .toolbar-primary {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 5px;
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
  .opportunity-toolbar .topic-search {
    width: 100%;
    min-width: 0;
    max-width: none;
    height: 30px;
  }
  .opportunity-toolbar .topic-status {
    position: static;
    top: auto;
    right: auto;
    min-width: 22px;
  }
  .opportunity-toolbar .topic-status strong {
    font-size: 16px;
  }
  .opportunity-toolbar .topic-status span {
    display: none;
  }
  .confirmed-toggle {
    min-height: 28px;
    padding: 0 6px;
    font-size: 10px;
    white-space: nowrap;
  }
  .toolbar-filter-strip {
    width: 100%;
    margin-right: -13px;
    padding-right: 13px;
    gap: 6px;
  }
  .toolbar-select {
    height: 30px;
    padding: 0 6px;
  }
  .toolbar-select select {
    max-width: 136px;
    font-size: 11px;
  }
}
</style>
