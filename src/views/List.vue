<template>
  <div class="list">
    <div v-if="showNativeOrderControl" class="subtype-actions">
      <MarketRankDirectionControl
        :direction="marketRankDirection"
        @change="changeMarketRankDirection"
      />
    </div>
    <n-card class="card">
      <template #header>
        <Transition name="fade" mode="out-in">
          <template v-if="!listData">
            <div class="loading" style="height: 60px">
              <n-skeleton text round height="40px" />
            </div>
          </template>
          <template v-else>
            <div class="header">
              <div class="logo">
                <img
                  :src="logoSrc(listType)"
                  alt="logo"
                  @error="handleLogoError"
                />
              </div>
              <div class="name">
                <n-text class="title">{{ listHeaderTitle }}</n-text>
                <n-text
                  v-if="listHeaderSubtitle && !subtypeGroups.length"
                  class="subtitle"
                  :depth="3"
                >
                  {{ listHeaderSubtitle }}
                </n-text>
              </div>
              <div class="data">
                <n-text v-if="listData.total" :depth="3" class="total">
                  {{ t("list.totalSummary", { total: listData.total }) }}
                </n-text>
                <n-text :depth="3" class="time" v-html="updateTime" />
                <GlobalIndexControls
                  v-if="isIndexOverviewSource && listData.data?.length"
                  class="index-controls"
                  :items="listData.data"
                  :compact="!isDesktop"
                />
                <MarketListSortControl
                  v-else-if="showMarketSortControl && listData.data?.length"
                  class="market-sort-control"
                  :source="listType"
                  :compact="!isDesktop"
                  :show-state-label="isDesktop"
                />
              </div>
            </div>
          </template>
        </Transition>
      </template>
      <Transition name="fade" mode="out-in">
        <template v-if="!listData">
          <div class="loading" style="flex-direction: column">
            <n-skeleton
              text
              round
              :repeat="20"
              height="40px"
              style="margin-bottom: 20px"
            />
          </div>
        </template>
        <template v-else>
          <div class="all">
            <n-empty
              v-if="!orderedListItems.length"
              :description="
                listSearchQuery
                  ? t('common.noContent')
                  : isIndexOverviewSource
                    ? t('hotList.indexRegionEmpty')
                    : t('common.noContent')
              "
              style="padding: 48px 16px"
            />
            <GlobalIndexTable
              v-else-if="isIndexOverviewSource"
              :items="orderedListItems"
              :link-target="linkTarget"
            />
            <MarketQuoteTable
              v-else-if="isProfessionalMarketSource"
              :items="currentPageItems"
              :link-target="linkTarget"
              :aria-label="listHeaderTitle"
              @item-click="trackMarketTableItemClick"
            />
            <n-list v-else hoverable style="width: 100%">
              <n-list-item
                v-for="(item, index) in currentPageItems"
                :key="
                  item.id ||
                  item.url ||
                  item.mobileUrl ||
                  `${listType}-${pageNumber}-${index}-${item.originalTitle}`
                "
              >
                <template #prefix>
                  <n-text
                    v-if="!isIndexOverviewSource"
                    class="num"
                    :class="
                      (item.contextRank || index + 1 + (pageNumber - 1) * 20) === 1
                        ? 'one'
                        : (item.contextRank || index + 1 + (pageNumber - 1) * 20) === 2
                          ? 'two'
                          : (item.contextRank || index + 1 + (pageNumber - 1) * 20) === 3
                            ? 'three'
                            : null
                    "
                    :depth="2"
                  >
                    {{ item.contextRank || index + 1 + (pageNumber - 1) * 20 }}
                  </n-text>
                </template>
                <n-a
                  class="text"
                  :href="getItemLink(item)"
                  :target="linkTarget"
                  rel="noopener noreferrer nofollow"
                  :title="getItemHoverTitle(item)"
                  @click="
                    trackEvent({
                      event: 'rank_item_click',
                      source: listType,
                      subtype: listSubType,
                      category: store.activeCategory,
                      href: getItemLink(item),
                      meta: {
                        itemId: item.id,
                        itemTitle: item.title,
                        rankIndex:
                          item.contextRank ||
                          index + 1 + (pageNumber - 1) * 20,
                      },
                    })
                  "
                >
                  <div class="content">
                    <div class="copy">
                      <div class="title-row">
                        <n-text
                          class="title"
                          :class="{
                            'no-auto-translate': item.hasReadableTranslation,
                            notranslate: item.hasReadableTranslation,
                          }"
                          :translate="
                            item.hasReadableTranslation ? 'no' : undefined
                          "
                          v-html="item.displayTitle"
                        />
                        <span v-if="item.marketQuote" class="market-quote-code">
                          {{ item.marketQuote.code }}
                        </span>
                      </div>
                      <div v-if="item.marketQuote" class="market-quote-detail">
                        <span>
                          {{ item.marketQuote.closeLabel }}
                          {{ item.marketQuote.price }}
                        </span>
                        <span
                          class="market-quote-change"
                          :class="[
                            `is-${item.marketQuote.tone}`,
                            `is-${item.marketQuote.colorConvention}`,
                          ]"
                        >
                          {{ item.marketQuote.change }}
                        </span>
                        <span>
                          {{ item.marketQuote.metricLabel }}
                          {{ item.marketQuote.metric }}
                        </span>
                      </div>
                      <div
                        v-else-if="item.fundMetric"
                        class="fund-metric-detail"
                      >
                        <span>{{ item.fundMetric.label }}</span>
                        <span
                          class="fund-metric-value"
                          :class="`is-${item.fundMetric.tone}`"
                        >
                          {{ item.fundMetric.value }}
                        </span>
                      </div>
                      <template v-else>
                        <n-text
                          v-if="item.displayDesc"
                          class="desc"
                          :depth="3"
                          v-html="item.displayDesc"
                        />
                        <div class="message">
                          <div class="hot" v-if="item.hot">
                            <n-icon :depth="3" :component="Fire" />
                            <n-text
                              class="hot-text"
                              :depth="3"
                              v-html="item.hot"
                            />
                          </div>
                        </div>
                      </template>
                    </div>
                    <div
                      class="cover-wrapper"
                      v-if="
                        showImages && item.cover && !coverErrorMap[item.cover]
                      "
                    >
                      <img
                        class="cover"
                        :src="getCoverDisplaySrc(item.cover)"
                        :alt="item.title"
                        loading="lazy"
                        @error="coverErrorMap[item.cover] = true"
                      />
                    </div>
                  </div>
                </n-a>
              </n-list-item>
            </n-list>
            <n-pagination
              v-if="
                orderedListItems.length &&
                !isIndexOverviewSource &&
                !isProfessionalMarketSource
              "
              class="pagination"
              :page-slot="5"
              :item-count="orderedListItems.length"
              :page-sizes="[20]"
              v-model:page="pageNumber"
            />
          </div>
        </template>
      </Transition>
    </n-card>
  </div>
</template>

<script setup>
import { Fire } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { sourceBelongsToCategory } from "@/utils/categoryTree";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { formatTime } from "@/utils/getTime";
import { getSharedRanking } from "@/utils/rankingCollection";
import { getCoverDisplaySrc } from "@/utils/imageProxy";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import GlobalIndexControls from "@/components/GlobalIndexControls.vue";
import GlobalIndexTable from "@/components/GlobalIndexTable.vue";
import MarketQuoteTable from "@/components/MarketQuoteTable.vue";
import MarketListSortControl from "@/components/MarketListSortControl.vue";
import MarketRankDirectionControl from "@/components/MarketRankDirectionControl.vue";
import {
  buildSourceSubtypeParams,
  getSourceSubtypeGroups,
  getSourceSubtypeOptions,
  persistSourceSubtype,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import {
  getFundMetricView,
  getMarketEntityDisplayTitle,
  getMarketQuoteView,
  isMarketQuoteSource,
} from "@/utils/marketQuote";
import {
  buildRankPath,
  getLocaleFromRoute,
  getSourceNameBySlug,
} from "@/utils/locale";
import { applyGlobalIndexPreferences } from "@/utils/globalIndexOrder";
import {
  applyMarketListSort,
  applyMarketRankDirection,
  isMarketListSortable,
  isNativeMarketRanking,
  readMarketRankDirection,
  saveMarketRankDirection,
} from "@/utils/marketListSort";
import { trackEvent } from "@/utils/track";
import {
  getSourceDisplayLabel as getLocalizedSourceDisplayLabel,
  getSourceSubtitleLabel,
  isGenericSourceSubtitleLabel,
  localizeSubtypeGroups,
} from "@/utils/sourceLabels";
import {
  enhanceReadableResultTitles,
  shouldProtectEntityTitleTranslation,
  shouldUseReadableTitleTranslation,
} from "@/utils/readableTitles";

const router = useRouter();
const route = useRoute();
const store = mainStore();
const { locale, t } = useI18n({ useScope: "global" });
const isClient = typeof window !== "undefined";
const isPrerender =
  isClient &&
  window.__PRERENDER_INJECTED &&
  window.__PRERENDER_INJECTED.prerender;
const coverErrorMap = reactive({});
const API_LOCALIZED_SOURCE_NAMES = new Set([
  "designarena",
  "clawhub",
  "clawhub-skills",
  "clawhub-plugins",
  "global-indexes",
]);
const shouldReloadForLocaleChange = (name = "") =>
  API_LOCALIZED_SOURCE_NAMES.has(name);

const updateTime = ref(null);
const availableNews = computed(() => {
  const categoryOn = store.categoryEnabled;
  const currentCat = store.activeCategory;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) =>
      categoryOn && currentCat !== "全部"
        ? sourceBelongsToCategory(item, currentCat, store.categories)
        : true,
    )
    .sort((a, b) => a.order - b.order);
});
const resolveRouteType = (targetRoute) =>
  getSourceNameBySlug(
    targetRoute?.params?.sourceSlug ||
      targetRoute?.query?.type ||
      availableNews.value[0]?.name,
  );
const listType = ref(resolveRouteType(router.currentRoute.value));
const listSubType = ref(null);
const pageNumber = ref(
  router.currentRoute.value.query.page
    ? Number(router.currentRoute.value.query.page)
    : 1,
);
const listData = ref(null);
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self",
);
const showImages = computed(() => store.showImages);
const logoSrc = (name) => getSourceLogo(name);
const getSourceDisplayLabel = (item) =>
  getLocalizedSourceDisplayLabel(
    item?.name,
    locale.value,
    item?.label || item?.name,
  );
const currentSourceMeta = computed(
  () =>
    store.newsArr.find((item) => item.name === listType.value) ||
    store.defaultNewsArr.find((item) => item.name === listType.value) ||
    null,
);
const PROFESSIONAL_MARKET_SOURCES = new Set([
  "sse",
  "szse",
  "hkex",
  "nasdaq",
  "nyse",
  "twse",
  "nse",
  "asx",
]);
const isIndexOverviewSource = computed(
  () => listType.value === "global-indexes",
);
const isProfessionalMarketSource = computed(() =>
  PROFESSIONAL_MARKET_SOURCES.has(listType.value),
);
const isSortableMarketSource = computed(() =>
  isMarketListSortable(listType.value),
);
const showNativeOrderControl = computed(() =>
  isNativeMarketRanking(listType.value, listSubType.value),
);
const marketRankDirection = computed(() =>
  readMarketRankDirection(listType.value, listSubType.value),
);
const showMarketSortControl = computed(
  () => isSortableMarketSource.value && !showNativeOrderControl.value,
);
const listHeaderTitle = computed(() =>
  getSourceDisplayLabel(
    currentSourceMeta.value || {
      name: listType.value,
      label: listData.value?.title || listType.value,
    },
  ),
);
const shouldEnhanceReadableTitles = computed(() =>
  shouldUseReadableTitleTranslation(
    listType.value,
    locale.value,
    listSubType.value,
  ),
);
const shouldProtectEntityTitles = computed(() =>
  shouldProtectEntityTitleTranslation(listType.value, listSubType.value),
);
const listHeaderSubtitle = computed(() => {
  const rawSubtitle =
    currentSourceMeta.value &&
    Object.prototype.hasOwnProperty.call(currentSourceMeta.value, "subtype")
      ? (currentSourceMeta.value.subtype ?? "")
      : listData.value?.subtitle || listData.value?.type || "";
  const subtitle = getSourceSubtitleLabel(rawSubtitle, locale.value);
  if (isGenericSourceSubtitleLabel(subtitle, locale.value)) {
    return "";
  }
  return subtitle;
});
let listRequestId = 0;
const normalizeComparableText = (value = "") =>
  String(value || "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .trim();
const isDuplicateDesc = (desc = "", ...titles) => {
  const normalizedDesc = normalizeComparableText(desc);
  if (!normalizedDesc) return true;
  return titles.some((title) => {
    const normalizedTitle = normalizeComparableText(title);
    return normalizedTitle && normalizedDesc === normalizedTitle;
  });
};
const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "").trim();
const listSearchQuery = computed(() => queryValue(route.query.q).toLowerCase());
const normalizeSearchText = (value = "") =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
const applyListSearch = (items = []) => {
  const query = listSearchQuery.value;
  if (!query) return items;
  return items.filter((item) =>
    [
      item?.title,
      item?.originalTitle,
      item?.desc,
      item?.originalDesc,
      item?.author,
      item?.hot,
      item?.code,
      item?.symbol,
      item?.name,
      item?.subtitle,
    ].some((value) => normalizeSearchText(value).includes(query)),
  );
};
const orderedListItems = computed(() => {
  const items = listData.value?.data || [];
  let ordered = items;
  if (isIndexOverviewSource.value) {
    ordered = applyGlobalIndexPreferences(items);
  } else if (showNativeOrderControl.value) {
    ordered = applyMarketRankDirection(items, listType.value, listSubType.value);
  } else if (showMarketSortControl.value) {
    ordered = applyMarketListSort(items, listType.value);
  }
  return applyListSearch(
    ordered.map((item, index) => ({
      ...item,
      contextRank: index + 1,
    })),
  );
});
const currentPageItems = computed(() =>
  orderedListItems.value
    .slice(pageNumber.value * 20 - 20, pageNumber.value * 20)
    .map((item) => {
      const originalTitle = String(item?.originalTitle || "");
      const originalDesc = String(item?.originalDesc || "");
      const displayTitle = isMarketQuoteSource(listType.value)
        ? getMarketEntityDisplayTitle(item, listType.value, locale.value)
        : item?.title || originalTitle;
      const rawDisplayDesc = item?.desc || originalDesc;
      const displayDesc =
        locale.value !== "zh-CN" &&
        isDuplicateDesc(
          rawDisplayDesc,
          originalTitle,
          item?.title,
          displayTitle,
        )
          ? ""
          : rawDisplayDesc;
      return {
        ...item,
        originalTitle,
        originalDesc,
        displayTitle,
        displayDesc,
        marketQuote: isMarketQuoteSource(listType.value)
          ? getMarketQuoteView(item, locale.value)
          : null,
        fundMetric: getFundMetricView(item, locale.value),
        hasReadableTranslation:
          shouldProtectEntityTitles.value ||
          Boolean(item?.noAutoTranslate) ||
          (Boolean(originalTitle) &&
            Boolean(displayTitle) &&
            displayTitle.trim() !== originalTitle.trim()),
      };
    }),
);
const getItemHoverTitle = (item) => {
  const title = item?.displayTitle || item?.originalTitle || "";
  const quote = item?.marketQuote;
  if (quote) {
    return [
      quote.region,
      title,
      quote.code,
      `${quote.closeLabel} ${quote.price}`,
      `${quote.metricLabel} ${quote.metric}`,
      quote.change,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return title || undefined;
};

const syncReadableTitleDom = (items = []) => {
  nextTick(() => {
    const rows = document.querySelectorAll(".all .n-list-item");
    items.forEach((item, index) => {
      const row = rows[index];
      if (!row) return;
      const linkNode = row.querySelector(".text");
      const titleNode = row.querySelector(".content .copy .title");
      if (!linkNode || !titleNode) return;
      titleNode.textContent = item.displayTitle || item.originalTitle || "";
      const hoverTitle = getItemHoverTitle(item);
      if (hoverTitle) {
        linkNode.setAttribute("title", hoverTitle);
      } else {
        linkNode.removeAttribute("title");
      }
    });
  });
};
const handleLogoError = (event) => {
  event.target.src = getSourceLogoFallback();
};
const subtypeGroups = computed(() =>
  localizeSubtypeGroups(getSourceSubtypeGroups(listType.value), locale.value),
);
const activeTypeOptions = computed(() =>
  subtypeGroups.value.flatMap((group) => group.items || []),
);

const resolveSubType = (route) => {
  const options = activeTypeOptions.value;
  const candidate = route?.params?.subtypeSlug || route?.query?.subtype;
  return resolveSourceSubtype(options, candidate);
};

const enhanceListResult = (result, targetLocale = locale.value) =>
  shouldUseReadableTitleTranslation(listType.value, targetLocale)
    ? enhanceReadableResultTitles(result, targetLocale, {
        limit: 20,
        offset: Math.max(0, (pageNumber.value - 1) * 20),
        sourceName: listType.value,
      })
    : Promise.resolve(result);

const applyListResult = (result) => {
  listData.value = result;
  updateTime.value = formatTime(result?.updateTime, locale.value);
};

const enhanceAndApplyListResult = async (
  result,
  requestId,
  name,
  shouldTranslate,
) => {
  if (!isCurrentListRequest(requestId, name)) return;
  applyListResult(result);
  if (!shouldTranslate) return;

  try {
    const nextResult = await enhanceListResult(result);
    if (!isCurrentListRequest(requestId, name)) return;
    applyListResult(nextResult);
  } catch {
    // Raw provider data is already visible; readable-title enhancement is best effort.
  }
};

const applyListFailureResult = (item, result = {}) => {
  applyListResult({
    code: result.code || 500,
    name: item?.name || listType.value,
    title: item?.label || result.title || listType.value,
    subtitle: result.message || result.title || t("list.loadFailedMessage"),
    total: 0,
    updateTime: new Date().toISOString(),
    data: [],
  });
};

const isCurrentListRequest = (requestId, name) =>
  requestId === listRequestId && listType.value === name;

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  if (!name) return;
  if (isPrerender) {
    const label = getSourceDisplayLabel(
      store.newsArr.find((item) => item.name === name) ||
        store.defaultNewsArr.find((item) => item.name === name) || {
          name,
          label: name,
        },
    );
    listData.value = {
      title: label,
      subtitle: t("list.prerenderSubtitle"),
      data: [],
    };
    updateTime.value = formatTime(new Date().toISOString(), locale.value);
    return;
  }
  const item =
    store.newsArr.find((item) => item.name == name) ||
    store.defaultNewsArr.find((item) => item.name == name);
  if (!item) return;
  const requestId = ++listRequestId;
  listData.value = null;
  const useApi2 = item?.useApi2 || item?.api === 2 || item?.api === "api2";
  const shouldTranslate = shouldEnhanceReadableTitles.value;
  const params = buildSourceSubtypeParams(item.name, listSubType.value);
  if (API_LOCALIZED_SOURCE_NAMES.has(item.name)) {
    params.locale = locale.value;
  }
  const requestParams = shouldTranslate
    ? {
        ...params,
        locale: locale.value,
        translate_limit: 20,
        translate_offset: Math.max(0, (pageNumber.value - 1) * 20),
        translate_nonce: `${pageNumber.value}-${Date.now()}`,
      }
    : params;
  try {
    let response = await getSharedRanking(
      item.name,
      isNew,
      requestParams,
      {
        useApi2,
        forceNoCache: Boolean(isNew),
      },
    );
    if (
      response?.result?.code !== 200 &&
      isCurrentListRequest(requestId, item.name)
    ) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      response = await getSharedRanking(item.name, true, requestParams, {
        useApi2,
        forceNoCache: true,
      });
    }
    const { result, usedFallback, fallbackSuccess } = response;
    if (!isCurrentListRequest(requestId, item.name)) return;
    if (usedFallback && fallbackSuccess && !useApi2) {
      store.setSourceApi2(item.name, true);
    }
    if (result.code === 200) {
      store.markAvailable(item.name);
      await enhanceAndApplyListResult(
        result,
        requestId,
        item.name,
        shouldTranslate,
      );
    } else {
      store.markUnavailable(item.name);
      applyListFailureResult(item, result);
      $message.error(result.message);
    }
  } catch {
    if (!isCurrentListRequest(requestId, item.name)) return;
    try {
      const retryResponse = await getSharedRanking(
        item.name,
        true,
        requestParams,
        {
          useApi2,
          forceNoCache: true,
        },
      );
      if (!isCurrentListRequest(requestId, item.name)) return;
      if (retryResponse?.result?.code === 200) {
        store.markAvailable(item.name);
        await enhanceAndApplyListResult(
          retryResponse.result,
          requestId,
          item.name,
          shouldTranslate,
        );
        return;
      }
      store.markUnavailable(item.name);
      applyListFailureResult(item, retryResponse?.result);
    } catch {
      if (!isCurrentListRequest(requestId, item.name)) return;
      store.markUnavailable(item.name);
      applyListFailureResult(item);
    }
    $message.error(t("list.loadFailedMessage"));
  }
};

const handleDataRefresh = (event) => {
  void getHotListsData(listType.value, Boolean(event?.detail?.force));
};

const updateIsDesktop = () => {
  if (!isClient) return;
  isDesktop.value = window.innerWidth > 680;
};

const getItemLink = (data) => {
  if (!data?.url && !data?.mobileUrl) return "";
  if (!data?.url) return data.mobileUrl;
  if (!data?.mobileUrl) return data.url;
  return isDesktop.value ? data.url : data.mobileUrl;
};

const trackMarketTableItemClick = (item, index) =>
  trackEvent({
    event: "rank_item_click",
    source: listType.value,
    subtype: listSubType.value,
    category: store.activeCategory,
    href: getItemLink(item),
    meta: {
      itemId: item?.id,
      itemTitle: item?.title,
      rankIndex: index + 1,
    },
  });

const changeType = (type) => {
  if (!type) return;
  const nextSubtype = resolveSourceSubtype(
    getSourceSubtypeOptions(type),
    readSourceSubtype(type),
  );
  router.push({
    path: buildRankPath(getLocaleFromRoute(route), type, nextSubtype || ""),
    query: queryValue(route.query.q) ? { q: queryValue(route.query.q) } : {},
  });
};

const changeMarketRankDirection = (direction) => {
  saveMarketRankDirection(listType.value, listSubType.value, direction);
};

// 实时改变更新时间
watch(
  () => store.timeData,
  () => {
    if (listData.value) {
      updateTime.value = formatTime(listData.value.updateTime, locale.value);
    }
  },
);

watch(
  () => locale.value,
  async (targetLocale) => {
    if (listData.value) {
      updateTime.value = formatTime(listData.value.updateTime, targetLocale);
    }
    if (listData.value && shouldReloadForLocaleChange(listType.value)) {
      getHotListsData(listType.value);
      return;
    }
    if (
      !listData.value ||
      !shouldUseReadableTitleTranslation(listType.value, targetLocale)
    ) {
      return;
    }
    const requestId = listRequestId;
    const sourceResult = listData.value;
    try {
      const enhancedResult = await enhanceListResult(
        sourceResult,
        targetLocale,
      );
      if (requestId === listRequestId && locale.value === targetLocale) {
        listData.value = enhancedResult;
      }
    } catch {
      if (requestId === listRequestId && locale.value === targetLocale) {
        listData.value = sourceResult;
      }
    }
  },
);

watch(
  () => currentPageItems.value,
  (items) => {
    syncReadableTitleDom(items);
  },
  { immediate: true, deep: true },
);

watch(
  () => orderedListItems.value.length,
  (total) => {
    const maxPage = Math.max(1, Math.ceil(total / 20));
    if (pageNumber.value > maxPage) pageNumber.value = maxPage;
  },
);

// 页数变化
watch(
  () => pageNumber.value,
  (val) => {
    const query = { ...route.query };
    delete query.type;
    delete query.subtype;
    if (val > 1) query.page = String(val);
    else delete query.page;
    router.push({
      path: buildRankPath(
        getLocaleFromRoute(route),
        listType.value,
        listSubType.value || "",
      ),
      query,
    });
    document.querySelector(".n-back-top")?.click();
  },
);

// 榜单上下文变化。q 仅影响本地搜索，不应触发重新拉取 provider 数据。
watch(
  [
    () => router.currentRoute.value.name,
    () => router.currentRoute.value.params?.sourceSlug,
    () => router.currentRoute.value.params?.subtypeSlug,
    () => router.currentRoute.value.query?.type,
    () => router.currentRoute.value.query?.subtype,
    () => router.currentRoute.value.query?.page,
  ],
  () => {
    const val = router.currentRoute.value;
    if (["list", "list-locale", "list-legacy"].includes(val.name)) {
      listType.value = resolveRouteType(val);
      pageNumber.value = Number(val.query.page) || 1;
      listSubType.value = resolveSubType(val);
      persistSourceSubtype(listType.value, listSubType.value);
      getHotListsData(listType.value);
    }
  },
);

watch(
  () => [availableNews.value, store.activeCategory],
  () => {
    const exists = availableNews.value.find((i) => i.name === listType.value);
    if (!exists && availableNews.value[0]) {
      changeType(availableNews.value[0].name);
    } else if (exists && !listData.value) {
      getHotListsData(listType.value);
    }
  },
  { deep: true },
);

watch(
  () => [listType.value, activeTypeOptions.value],
  () => {
    const nextSubtype = resolveSubType(router.currentRoute.value);
    if (nextSubtype === listSubType.value) return;
    listSubType.value = nextSubtype;
  },
  { deep: true },
);

onMounted(() => {
  updateIsDesktop();
  if (isClient) {
    window.addEventListener("resize", updateIsDesktop);
    window.addEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
  }
  listSubType.value = resolveSubType(router.currentRoute.value);
  getHotListsData(listType.value);
});

onActivated(() => {
  if (isClient) {
    window.removeEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
    window.addEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
  }
  listSubType.value = resolveSubType(router.currentRoute.value);
  if (!listData.value) {
    getHotListsData(listType.value);
  }
});

onDeactivated(() => {
  if (isClient) window.removeEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
});

onBeforeUnmount(() => {
  if (isClient) {
    window.removeEventListener("resize", updateIsDesktop);
    window.removeEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
  }
});
</script>

<style lang="scss" scoped>
.list {
  .subtype-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
    width: 100%;
    margin-top: 6px;
  }
  .card {
    margin-top: 10px;
    border-radius: 8px;
    :deep(.n-card-header) {
      padding: 14px 16px 10px;
    }

    :deep(.n-card__content) {
      padding: 0 16px 16px;
    }

    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s ease-in-out;
    }

    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
    .loading {
      display: flex;
      align-items: center;
    }
    :deep(.n-card__content) {
      @media (max-width: 740px) {
        padding: 0 12px 12px 12px;
      }
    }
    .header {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      column-gap: 16px;
      align-items: center;
      justify-content: space-between;
      min-height: 44px;
      .logo {
        display: flex;
        align-items: center;
        img {
          height: 42px;
          width: 42px;
          object-fit: contain;
        }
      }
      .name {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
        .title {
          overflow: hidden;
          font-size: 18px;
          font-weight: bold;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .subtitle {
          font-size: 14px;
        }
      }
      .data {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-width: 0;
        font-size: 14px;
        white-space: nowrap;
        .total::after {
          content: " ·";
          margin-right: 6px;
        }
      }
      @media (max-width: 740px) {
        display: flex;
        justify-content: flex-start;
        .logo {
          img {
            width: 32px;
            height: 32px;
          }
        }
        .name {
          margin-left: 12px;
          align-items: flex-end;
          flex-direction: row;
          .subtitle {
            margin-bottom: 3px;
            margin-left: 8px;
          }
        }
        .data {
          margin-left: auto;
        }
      }
    }
    .all {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      :deep(.n-list) {
        width: 100%;
      }
      .num {
        width: 24px;
        height: 24px;
        min-width: 24px;
        margin-right: 8px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--n-border-color);
        border-radius: 8px;
        transition: all 0.3s;
        &:hover {
          background-color: var(--n-close-color-hover);
        }
        &.one {
          background-color: #ea444d;
          color: #fff;
        }
        &.two {
          background-color: #ed702d;
          color: #fff;
        }
        &.three {
          background-color: #eead3f;
          color: #fff;
        }
      }
      .text {
        display: flex;
        flex-direction: row;
        min-width: 0;
        text-decoration: none;
        color: inherit;
        .content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          width: 100%;
        }
        .copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          .title-row {
            display: flex;
            align-items: baseline;
            gap: 8px;
            min-width: 0;
          }
          .title {
            overflow: hidden;
            font-size: 16px;
            margin-bottom: 4px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .title-row .title {
            min-width: 0;
            margin-bottom: 0;
          }
          .market-quote-region {
            flex: 0 0 auto;
            padding: 1px 6px;
            border-radius: 999px;
            background: color-mix(in srgb, currentColor 8%, transparent);
            font-size: 11px;
            line-height: 1.4;
            color: var(--n-text-color-3);
          }

          .market-quote-code {
            flex: 0 0 auto;
            font-size: 12px;
            color: var(--n-text-color-3);
            font-variant-numeric: tabular-nums;
          }
          .market-quote-detail {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px 12px;
            margin-top: 5px;
            font-size: 13px;
            color: var(--n-text-color-3);
            font-variant-numeric: tabular-nums;
          }
          .market-quote-change {
            font-weight: 600;

            &.is-up {
              color: #ea444d;
            }

            &.is-down {
              color: #18a058;
            }

            &.is-flat {
              color: var(--n-text-color-3);
            }

            &.is-western.is-up {
              color: #18a058;
            }

            &.is-western.is-down {
              color: #ea444d;
            }
          }
          .fund-metric-detail {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 5px;
            font-size: 13px;
            color: var(--n-text-color-3);
            font-variant-numeric: tabular-nums;

            .fund-metric-value {
              font-weight: 600;

              &.is-up {
                color: #ea444d;
              }

              &.is-down {
                color: #18a058;
              }

              &.is-flat {
                color: var(--n-text-color-3);
              }
            }
          }
          .desc {
            overflow: hidden;
            font-size: 14px;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
          }
        }
        .cover-wrapper {
          flex: 0 0 auto;
          opacity: 1;
          overflow: hidden;
          border-radius: 10px;
          .cover {
            width: 78px;
            height: 104px;
            object-fit: cover;
            object-position: center;
            border-radius: 10px;
            display: block;
            background: rgba(0, 0, 0, 0.05);
          }
        }
      }
      @media (min-width: 1200px) {
        :deep(.n-list) {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 14px;
        }
        :deep(.n-list-item) {
          border: none;
          border-radius: 10px;
          box-shadow: inset 0 0 0 1px var(--n-border-color);
          padding: 10px 12px;

          .n-list-item__main {
            min-width: 0;
          }
        }
        .text {
          .content {
            grid-template-columns: minmax(0, 1fr) auto;
          }
          .cover-wrapper {
            .cover {
              width: 84px;
              height: 112px;
            }
          }
        }
      }
      .message {
        display: flex;
        align-items: center;
        margin-top: 6px;
        min-height: 18px;
        .hot {
          display: flex;
          align-items: center;
          font-size: 13px;
          .hot-text {
            margin-left: 4px;
            line-height: 0;
          }
        }
      }
      .pagination {
        margin: 14px 0 4px;
        align-self: center;
      }
      @media (max-width: 740px) {
        :deep(.n-list-item) {
          padding: 12px 10px;
          .n-list-item__prefix {
            margin-right: 12px;
          }
          .content {
            grid-template-columns: 1fr;
          }
          .cover {
            width: 100%;
            height: auto;
          }
        }
      }
    }
  }
}
</style>
