<template>
  <n-card
    :header-style="{ padding: '16px' }"
    :content-style="{ padding: '0 16px' }"
    :footer-style="{ padding: '16px' }"
    :id="`hot-list-${hotData.name}`"
    class="hot-list"
    hoverable
    @click="toList"
  >
    <template #header>
      <div class="header-block">
        <div class="title">
          <div class="name">
            <n-avatar
              class="ico"
              :src="logoSrc(hotData.name)"
              fallback-src="/ico/icon_error.png"
            />
            <n-text class="name-text">{{ sourceLabel }}</n-text>
          </div>
          <SubtypeBar
            v-if="subtypeGroups.length"
            class="header-subtype"
            :groups="subtypeGroups"
            :active-value="activeSubType"
            @change="changeSubType"
            @click.stop
          />
          <n-text
            v-if="cardSubtitle && !subtypeGroups.length"
            class="subtitle"
            :depth="2"
          >
            {{ cardSubtitle }}
          </n-text>
          <n-skeleton v-else-if="!subtypeGroups.length && !hotListData" width="60px" text round />
        </div>
      </div>
    </template>
    <n-scrollbar class="news-list no-card-drag" ref="scrollbarRef" @scroll="hidePreview">
      <Transition name="fade" mode="out-in">
        <div v-if="loadingError" class="error">
          <n-result
            size="small"
            status="500"
            :title="t('hotList.loadErrorTitle')"
            :description="t('hotList.loadErrorDescription')"
            style="margin-top: 40px"
          />
          <n-button
            size="small"
            secondary
            strong
            round
            @click.stop="getHotListsData(hotData.name)"
          >
            <template #icon>
              <n-icon :component="Refresh" />
            </template>
            {{ t("hotList.retry") }}
          </n-button>
        </div>
        <div v-else-if="!hotListData || listLoading" class="loading">
          <n-skeleton text round :repeat="10" height="20px" />
        </div>
        <div v-else class="lists" :id="hotData.name + 'Lists'">
          <div
            class="item"
            :class="{
              'is-market-quote': item.marketQuote,
              'is-fund-metric': item.fundMetric,
              'is-index-overview': isIndexOverviewSource,
            }"
            v-for="(item, index) in visibleItems"
            :key="item.id || item.url || item.mobileUrl || `${props.hotData.name}-${index}-${item.originalTitle}`"
            :aria-describedby="previewItem === item ? previewTooltipId : undefined"
            @pointerenter="showPreview(item, $event)"
            @pointerleave="hidePreview"
            @focusin="showPreview(item, $event)"
            @focusout="hidePreview"
            @keydown.esc="hidePreview"
          >
            <div class="line">
              <n-text
                v-if="!isIndexOverviewSource"
                class="num"
                :class="
                  index === 0
                    ? 'one'
                    : index === 1
                    ? 'two'
                    : index === 2
                    ? 'three'
                    : null
                "
                :depth="2"
                >{{ index + 1 }}</n-text
              >
              <n-a
                v-if="item.marketQuote"
                :style="{ fontSize: store.listFontSize + 'px' }"
                class="text market-quote-link"
                :href="getItemLink(item)"
                :target="linkTarget"
                rel="noopener noreferrer nofollow"
                :title="item.originalTitle || undefined"
                @click.stop
              >
                <div class="market-quote-copy">
                  <div class="market-quote-title-row">
                    <span
                      class="title-text"
                      :class="{
                        'no-auto-translate': item.hasReadableTranslation,
                        notranslate: item.hasReadableTranslation,
                      }"
                      :translate="item.hasReadableTranslation ? 'no' : undefined"
                    >
                      {{ item.displayTitle }}
                    </span>
                    <span v-if="item.marketQuote.region" class="market-quote-region">
                      {{ item.marketQuote.region }}
                    </span>
                    <span class="market-quote-code">{{ item.marketQuote.code }}</span>
                  </div>
                  <div class="market-quote-meta">
                    <span>{{ item.marketQuote.closeLabel }} {{ item.marketQuote.price }}</span>
                    <span>·</span>
                    <span>{{ item.marketQuote.metricLabel }} {{ item.marketQuote.metric }}</span>
                  </div>
                </div>
                <span
                  class="market-quote-change"
                  :class="[
                    `is-${item.marketQuote.tone}`,
                    `is-${item.marketQuote.colorConvention}`,
                  ]"
                >
                  {{ item.marketQuote.change }}
                </span>
              </n-a>
              <n-a
                v-else-if="item.fundMetric"
                :style="{ fontSize: store.listFontSize + 'px' }"
                class="text fund-metric-link"
                :href="getItemLink(item)"
                :target="linkTarget"
                rel="noopener noreferrer nofollow"
                :title="item.originalTitle || undefined"
                @click.stop
              >
                <div class="fund-metric-copy">
                  <span
                    class="title-text"
                    :class="{
                      'no-auto-translate': item.hasReadableTranslation,
                      notranslate: item.hasReadableTranslation,
                    }"
                    :translate="item.hasReadableTranslation ? 'no' : undefined"
                  >
                    {{ item.displayTitle }}
                  </span>
                  <span class="fund-metric-label">{{ item.fundMetric.label }}</span>
                </div>
                <span
                  class="fund-metric-value"
                  :class="`is-${item.fundMetric.tone}`"
                >
                  {{ item.fundMetric.value }}
                </span>
              </n-a>
              <n-a
                v-else
                :style="{ fontSize: store.listFontSize + 'px' }"
                class="text"
                :href="getItemLink(item)"
                :target="linkTarget"
                rel="noopener noreferrer nofollow"
                :title="item.originalTitle || undefined"
                @click.stop
              >
                <span
                  class="title-text"
                  :class="{
                    'no-auto-translate': item.hasReadableTranslation,
                    notranslate: item.hasReadableTranslation,
                  }"
                  :translate="item.hasReadableTranslation ? 'no' : undefined"
                >
                  {{ item.displayTitle }}
                </span>
              </n-a>
            </div>
          </div>
        </div>
      </Transition>
    </n-scrollbar>
    <template #footer>
      <Transition name="fade" mode="out-in">
        <template v-if="!hotListData">
          <div class="message is-loading-footer">
            <div class="loading">
              <n-skeleton text round />
            </div>
            <n-popover>
              <template #trigger>
                <span
                  class="card-drag-handle"
                  role="button"
                  tabindex="0"
                  :aria-label="t('hotList.dragSort')"
                  @click.stop.prevent
                  @keydown.stop.prevent
                >
                  <n-icon :component="Drag" />
                </span>
              </template>
              {{ t("hotList.dragSort") }}
            </n-popover>
          </div>
        </template>
        <template v-else>
          <div class="message">
            <n-text class="time" :depth="3" v-if="updateTime">
              {{ updateTime }}
            </n-text>
            <n-text class="time" :depth="3" v-else>
              {{ t("hotList.updateFailed") }}
            </n-text>
            <n-space class="controls">
              <n-popover v-if="hotListData.data.length">
                <template #trigger>
                  <n-button
                    size="tiny"
                    secondary
                    strong
                    round
                    @click.stop="toList"
                  >
                    <template #icon>
                      <n-icon :component="More" />
                    </template>
                  </n-button>
                </template>
                {{ t("hotList.viewMore") }}
              </n-popover>
              <n-popover>
                <template #trigger>
                  <span
                    class="card-drag-handle"
                    role="button"
                    tabindex="0"
                    :aria-label="t('hotList.dragSort')"
                    @click.stop.prevent
                    @keydown.stop.prevent
                  >
                    <n-icon :component="Drag" />
                  </span>
                </template>
                {{ t("hotList.dragSort") }}
              </n-popover>
              <n-popover>
                <template #trigger>
                  <n-button
                    size="tiny"
                    secondary
                    strong
                    round
                    @click.stop="getNewData"
                  >
                    <template #icon>
                      <n-icon :component="Refresh" />
                    </template>
                  </n-button>
                </template>
                {{ t("hotList.refreshLatest") }}
              </n-popover>
            </n-space>
          </div>
        </template>
      </Transition>
    </template>
  </n-card>
  <Teleport to="body">
    <Transition name="item-preview">
      <div
        v-if="previewItem"
        :id="previewTooltipId"
        class="hot-item-preview"
        :class="{
          'has-cover': previewHasCover,
          'is-media-only': previewIsMediaOnly,
        }"
        :style="previewStyle"
        role="tooltip"
      >
        <div v-if="previewItem.displayDesc" class="preview-copy">
          <div class="preview-desc">
            {{ previewItem.displayDesc }}
          </div>
          <div v-if="previewItem.hot" class="preview-meta">
            <n-icon :component="Fire" />
            <span>{{ formatPreviewHot(previewItem.hot) }}</span>
          </div>
        </div>
        <div v-if="previewHasCover" class="preview-cover-wrap">
          <img
            class="cover"
            :src="getCoverDisplaySrc(previewItem.cover)"
            alt=""
            loading="lazy"
            @error="handlePreviewCoverError(previewItem.cover)"
          />
        </div>
        <div v-if="previewIsMediaOnly && previewItem.hot" class="preview-meta preview-media-meta">
          <n-icon :component="Fire" />
          <span>{{ formatPreviewHot(previewItem.hot) }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Drag, Fire, Refresh, More } from "@icon-park/vue-next";
import { getHotListsWithFallback } from "@/api";
import { formatTime } from "@/utils/getTime";
import { getCacheVersion } from "@/utils/cache";
import { getCoverDisplaySrc } from "@/utils/imageProxy";
import { mainStore } from "@/store";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SubtypeBar from "@/components/SubtypeBar.vue";
import {
  buildSourceSubtypeParams,
  getSourceSubtypeGroups,
  persistSourceSubtype,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import { getSourceLogo } from "@/utils/sourceLogos";
import {
  getFundMetricView,
  getMarketQuoteView,
  isMarketQuoteSource,
} from "@/utils/marketQuote";
import { trackEvent } from "@/utils/track";
import {
  getSourceDisplayLabel,
  getSourceSubtitleLabel,
  isGenericSourceSubtitleLabel,
  localizeSubtypeGroups,
} from "@/utils/sourceLabels";
import { buildRankPath } from "@/utils/locale";
import {
  enhanceReadableResultTitles,
  shouldProtectEntityTitleTranslation,
  shouldUseReadableTitleTranslation,
} from "@/utils/readableTitles";

const router = useRouter();
const store = mainStore();
const { locale, t } = useI18n({ useScope: "global" });
const isClient = typeof window !== "undefined";
const isPrerender =
  isClient && window.__PRERENDER_INJECTED && window.__PRERENDER_INJECTED.prerender;
const coverErrorMap = reactive({});
const cacheVersion = getCacheVersion();
const logoSrc = (name) => getSourceLogo(name, cacheVersion);
const props = defineProps({
  // 热榜数据
  hotData: {
    type: Object,
    default: {},
  },
  eagerLoad: {
    type: Boolean,
    default: false,
  },
});

// 更新时间
const updateTime = ref(null);

// 刷新按钮数据
const lastClickTime = ref(
  typeof localStorage !== "undefined"
    ? localStorage.getItem(`${props.hotData.name}Btn`) || 0
    : 0
);

// 热榜数据
const hotListData = ref(null);
const scrollbarRef = ref(null);
const listLoading = ref(false);
const loadingError = ref(false);
const previewItem = ref(null);
const previewStyle = ref({});
const previewMediaCache = new Map();
let previewRequestId = 0;
let previewOpenTimer = null;
let previewTarget = null;
let previewPlacement = null;
let previewViewportListenersBound = false;
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self"
);
const previewTextOnlyWidth = 340;
const previewMediaPresets = {
  portrait: {
    detail: { width: 96, height: 128, previewWidth: 420 },
    mediaOnly: { width: 168, height: 224 },
  },
  square: {
    detail: { width: 112, height: 112, previewWidth: 430 },
    mediaOnly: { width: 200, height: 200 },
  },
  landscape: {
    detail: { width: 148, height: 96, previewWidth: 460 },
    mediaOnly: { width: 240, height: 144 },
  },
};
const previewCompactFormatterCache = new Map();
const previewTooltipId = computed(() => `hot-item-preview-${props.hotData.name}`);
const showImages = computed(() => store.showImages);
const previewHasCover = computed(
  () =>
    showImages.value &&
    previewItem.value?.cover &&
    !coverErrorMap[previewItem.value.cover]
);
const previewIsMediaOnly = computed(
  () => previewHasCover.value && !previewItem.value?.displayDesc
);
const HOT_LIST_VISIBLE_LIMIT = 15;
const API_LOCALIZED_SOURCE_NAMES = new Set([
  "designarena",
  "clawhub",
  "clawhub-skills",
  "clawhub-plugins",
]);
const shouldReloadForLocaleChange = (name = "") =>
  API_LOCALIZED_SOURCE_NAMES.has(name);
const READABLE_TRANSLATION_FALLBACK_MS = 3000;
const sourceLabel = computed(() =>
  getSourceDisplayLabel(props.hotData.name, locale.value, props.hotData.label)
);
const isIndexOverviewSource = computed(() => props.hotData.name === "global-indexes");
const cardSubtitle = computed(() => {
  const rawSubtitle =
    Object.prototype.hasOwnProperty.call(props.hotData || {}, "subtype")
      ? props.hotData.subtype ?? ""
      : hotListData.value?.type || "";
  const subtitle = getSourceSubtitleLabel(rawSubtitle, locale.value);
  if (isGenericSourceSubtitleLabel(subtitle, locale.value)) {
    return "";
  }
  return subtitle;
});
let hotListRequestId = 0;
const normalizeComparableText = (value = "") =>
  String(value || "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase()
    .trim();
const stripPreviewText = (value = "") =>
  String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/^智搜[:：]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
const isDuplicateDesc = (desc = "", ...titles) => {
  const normalizedDesc = normalizeComparableText(desc);
  if (!normalizedDesc) return true;
  return titles.some((title) => {
    const normalizedTitle = normalizeComparableText(title);
    return normalizedTitle && normalizedDesc === normalizedTitle;
  });
};
const getPreviewCompactFormatter = (maximumFractionDigits) => {
  const targetLocale = locale.value || "zh-CN";
  const cacheKey = `${targetLocale}:${maximumFractionDigits}`;
  if (!previewCompactFormatterCache.has(cacheKey)) {
    previewCompactFormatterCache.set(
      cacheKey,
      new Intl.NumberFormat(targetLocale, {
        notation: "compact",
        maximumFractionDigits,
      })
    );
  }
  return previewCompactFormatterCache.get(cacheKey);
};
const formatPreviewHot = (value) => {
  const rawValue = String(value ?? "").trim();
  if (!rawValue || !/^\d+(?:\.\d+)?$/.test(rawValue)) return rawValue;
  const numericValue = Number(rawValue);
  if (!Number.isFinite(numericValue)) return rawValue;
  const maximumFractionDigits = numericValue >= 10_000_000 ? 0 : 1;
  try {
    return getPreviewCompactFormatter(maximumFractionDigits).format(numericValue);
  } catch {
    return rawValue;
  }
};
const visibleItems = computed(() =>
  (hotListData.value?.data || []).slice(0, HOT_LIST_VISIBLE_LIMIT).map((item) => {
    const originalTitle = String(item?.originalTitle || "");
    const originalDesc = String(item?.originalDesc || "");
    const displayTitle = item?.title || originalTitle;
    const rawDisplayDesc = item?.desc || originalDesc;
    const displayDesc = isDuplicateDesc(
      rawDisplayDesc,
      originalTitle,
      item?.title,
      displayTitle
    )
      ? ""
      : stripPreviewText(rawDisplayDesc);
    return {
      ...item,
      originalTitle,
      originalDesc,
      displayTitle,
      displayDesc,
      marketQuote: isMarketQuoteSource(props.hotData.name)
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
  })
);
const syncReadableTitleDom = (items = []) => {
  nextTick(() => {
    const root =
      document.getElementById(`${props.hotData.name}Lists`)?.closest(".hot-list") ||
      document.getElementById(`hot-list-${props.hotData.name}`);
    if (!root) return;
    const links = root.querySelectorAll(".lists .item .text");
    const titles = root.querySelectorAll(".lists .item .title-text");
    items.forEach((item, index) => {
      const linkNode = links[index];
      const titleNode = titles[index];
      if (!linkNode || !titleNode) return;
      titleNode.textContent = item.displayTitle || item.originalTitle || "";
      if (item.originalTitle) {
        linkNode.setAttribute("title", item.originalTitle);
      } else {
        linkNode.removeAttribute("title");
      }
    });
  });
};
const subtypeGroups = computed(() =>
  localizeSubtypeGroups(getSourceSubtypeGroups(props.hotData.name), locale.value)
);
const subtypeOptions = computed(() => subtypeGroups.value.flatMap((group) => group.items || []));
const activeSubType = ref(
  resolveSourceSubtype(
    subtypeOptions.value,
    readSourceSubtype(props.hotData.name)
  )
);
const shouldEnhanceReadableTitles = computed(() =>
  shouldUseReadableTitleTranslation(
    props.hotData.name,
    locale.value,
    activeSubType.value
  )
);
const shouldProtectEntityTitles = computed(() =>
  shouldProtectEntityTitleTranslation(props.hotData.name, activeSubType.value)
);

watch(
  () => subtypeOptions.value,
  (options) => {
    activeSubType.value = resolveSourceSubtype(
      options,
      readSourceSubtype(props.hotData.name)
    );
  },
  { immediate: true, deep: true }
);

watch(
  () => visibleItems.value,
  (items) => {
    syncReadableTitleDom(items);
  },
  { immediate: true, deep: true }
);

const updateIsDesktop = () => {
  if (!isClient) return;
  isDesktop.value = window.innerWidth > 680;
  if (previewItem.value) hidePreview();
};

const buildHotListRequestParams = (item, shouldTranslate) => {
  const params = buildSourceSubtypeParams(item.name, activeSubType.value);
  if (API_LOCALIZED_SOURCE_NAMES.has(item.name)) {
    params.locale = locale.value;
  }
  if (!shouldTranslate) return params;
  return {
    ...params,
    locale: locale.value,
    translate_limit: HOT_LIST_VISIBLE_LIMIT,
    translate_offset: 0,
    translate_nonce: Date.now(),
  };
};

const requestHotListResult = (item, isNew, shouldTranslate, useApi2) =>
  getHotListsWithFallback(
    item.name,
    isNew,
    buildHotListRequestParams(item, shouldTranslate),
    {
      useApi2,
      forceNoCache: Boolean(isNew),
    }
  );

const enhanceHotListResult = (result, targetLocale = locale.value) =>
  shouldUseReadableTitleTranslation(props.hotData.name, targetLocale)
    ? enhanceReadableResultTitles(result, targetLocale, {
        includeDescriptions: false,
        limit: HOT_LIST_VISIBLE_LIMIT,
        offset: 0,
        sourceName: props.hotData.name,
      })
    : Promise.resolve(result);

const applyHotListResult = (result) => {
  listLoading.value = false;
  hotListData.value = result;
  updateTime.value = formatTime(result?.updateTime, locale.value);
  if (scrollbarRef.value) {
    scrollbarRef.value.scrollTo({ position: "top", behavior: "smooth" });
  }
};

const enhanceAndApplyHotListResult = async (result, requestId, shouldTranslate) => {
  if (!shouldTranslate) {
    applyHotListResult(result);
    return;
  }
  let fallbackApplied = false;
  const fallbackTimer = window.setTimeout(() => {
    if (requestId !== hotListRequestId) return;
    fallbackApplied = true;
    applyHotListResult(result);
  }, READABLE_TRANSLATION_FALLBACK_MS);
  try {
    const nextResult = await enhanceHotListResult(result);
    if (requestId !== hotListRequestId) return;
    applyHotListResult(nextResult);
  } catch {
    if (requestId !== hotListRequestId) return;
    if (!fallbackApplied) {
      applyHotListResult(result);
    }
  } finally {
    window.clearTimeout(fallbackTimer);
  }
};

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  if (isPrerender) return;
  const item =
    store.newsArr.find((item) => item.name == name) ||
    store.defaultNewsArr.find((item) => item.name == name);
  if (!item) return;
  const requestId = ++hotListRequestId;
  const useApi2 = item?.useApi2 || item?.api === 2 || item?.api === "api2";
  const shouldTranslate = shouldEnhanceReadableTitles.value;
  try {
    loadingError.value = false;
    let response = await requestHotListResult(item, isNew, shouldTranslate, useApi2);
    if (response?.result?.code !== 200 && requestId === hotListRequestId) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      response = await requestHotListResult(item, true, shouldTranslate, useApi2);
    }
    const { result, usedFallback, fallbackSuccess } = response;
    if (usedFallback && fallbackSuccess && !useApi2) {
      store.setSourceApi2(item.name, true);
    }
    if (requestId !== hotListRequestId) return;
    if (result.code === 200) {
      await enhanceAndApplyHotListResult(result, requestId, shouldTranslate);
      store.markAvailable(item.name);
    } else {
      store.markUnavailable(item.name);
      loadingError.value = true;
      $message.error(result.title + result.message);
    }
  } catch (error) {
    if (item && requestId === hotListRequestId) {
      try {
        const retryResponse = await requestHotListResult(item, true, shouldTranslate, useApi2);
        if (requestId !== hotListRequestId) return;
        if (retryResponse?.result?.code === 200) {
          await enhanceAndApplyHotListResult(
            retryResponse.result,
            requestId,
            shouldTranslate
          );
          store.markAvailable(item.name);
          return;
        }
      } catch {}
    }
    if (requestId !== hotListRequestId) return;
    store.markUnavailable(name);
    loadingError.value = true;
    $message.error(t("hotList.loadFailedMessage"));
  }
};

// 获取最新数据
const getNewData = () => {
  if (isPrerender) return;
  const now = Date.now();
  if (now - lastClickTime.value > 60000) {
    // 点击事件
    listLoading.value = true;
    getHotListsData(props.hotData.name, true);
    // 更新最后一次点击时间
    lastClickTime.value = now;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(`${props.hotData.name}Btn`, now);
    }
  } else {
    // 不执行点击事件
    $message.info(t("hotList.refreshTooSoon"));
  }
};

const getItemLink = (data) => {
  if (!data?.url && !data?.mobileUrl) return "";
  if (!data?.url) return data.mobileUrl;
  if (!data?.mobileUrl) return data.url;
  return isDesktop.value ? data.url : data.mobileUrl;
};

const getPreviewMediaLayout = (cover) => {
  if (previewMediaCache.has(cover)) return previewMediaCache.get(cover);
  const mediaPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const naturalWidth = Number(image.naturalWidth || 0);
      const naturalHeight = Number(image.naturalHeight || 0);
      if (!naturalWidth || !naturalHeight) {
        reject(new Error("Invalid preview image dimensions"));
        return;
      }
      const ratio = naturalWidth / naturalHeight;
      const kind = ratio < 0.8 ? "portrait" : ratio < 1.25 ? "square" : "landscape";
      resolve({ kind, ...previewMediaPresets[kind] });
    };
    image.onerror = reject;
    image.src = getCoverDisplaySrc(cover);
  });
  previewMediaCache.set(cover, mediaPromise);
  return mediaPromise;
};

const hasPreviewContent = (item) =>
  Boolean(
    item?.displayDesc || (showImages.value && item?.cover && !coverErrorMap[item.cover])
  );

const getPreviewDimensions = (item, mediaLayout) => {
  const hasDescription = Boolean(item?.displayDesc);
  if (mediaLayout && !hasDescription) {
    return {
      width: mediaLayout.mediaOnly.width,
      height: mediaLayout.mediaOnly.height,
    };
  }

  const descLength = String(item?.displayDesc || "").length;
  const descLines = descLength ? Math.min(3, Math.max(1, Math.ceil(descLength / 24))) : 0;
  let textHeight = descLines ? descLines * 20 : 0;
  if (item?.hot) textHeight += (textHeight ? 8 : 0) + 18;
  const detailMedia = mediaLayout?.detail;
  return {
    width: detailMedia?.previewWidth || previewTextOnlyWidth,
    height: Math.max(58, Math.max(textHeight, detailMedia?.height || 0) + 24),
  };
};

const positionPreview = (item, target, mediaLayout, preferredPlacement = null) => {
  if (!target?.isConnected) return false;

  const rect = target.getBoundingClientRect();
  const card = target.closest(".hot-list");
  const cardRect = card?.getBoundingClientRect();
  const textRects = Array.from(card?.querySelectorAll(".text") || []).map(
    (node) => node.getBoundingClientRect()
  );
  const padding = 12;
  const gap = 10;
  const { width: previewWidth, height: previewHeight } = getPreviewDimensions(
    item,
    mediaLayout
  );
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clampLeft = (value) =>
    clamp(value, padding, window.innerWidth - previewWidth - padding);
  const clampTop = (value) =>
    clamp(value, padding, window.innerHeight - previewHeight - padding);
  const placeRight =
    window.innerWidth - rect.right >= previewWidth + gap + padding;
  const placeLeft = rect.left >= previewWidth + gap + padding;
  const placeBelow =
    cardRect &&
    window.innerHeight - cardRect.bottom >= previewHeight + gap + padding;
  const placeAbove =
    cardRect && cardRect.top >= previewHeight + gap + padding;
  const availablePlacements = {
    right: placeRight,
    left: placeLeft,
    below: placeBelow,
    above: placeAbove,
  };
  const placement =
    (preferredPlacement && availablePlacements[preferredPlacement]
      ? preferredPlacement
      : null) ||
    (placeRight ? "right" : placeLeft ? "left" : placeBelow ? "below" : placeAbove ? "above" : null);
  if (!placement) return false;

  let left = clampLeft(rect.left + 32);
  let top = clampTop(rect.top - 8);

  if (placement === "right") {
    left = rect.right + gap;
  } else if (placement === "left") {
    left = rect.left - previewWidth - gap;
  } else if (placement === "below") {
    top = cardRect.bottom + gap;
  } else {
    top = cardRect.top - previewHeight - gap;
  }

  left = clampLeft(left);
  top = clampTop(top);

  const overlapsText = textRects.some(
    (textRect) =>
      left < textRect.right &&
      left + previewWidth > textRect.left &&
      top < textRect.bottom &&
      top + previewHeight > textRect.top
  );
  if (overlapsText && (placement === "left" || placement === "right")) return false;

  const isMediaOnly = Boolean(mediaLayout && !item?.displayDesc);
  const activeMedia = mediaLayout
    ? isMediaOnly
      ? mediaLayout.mediaOnly
      : mediaLayout.detail
    : null;

  previewTarget = target;
  previewPlacement = placement;
  previewItem.value = item;
  bindPreviewViewportListeners();
  previewStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${previewWidth}px`,
    height: isMediaOnly ? `${previewHeight}px` : undefined,
    "--preview-cover-width": activeMedia ? `${activeMedia.width}px` : "0px",
    "--preview-cover-height": activeMedia ? `${activeMedia.height}px` : "0px",
    "--preview-cover-position": mediaLayout?.kind === "portrait" ? "center 28%" : "center",
    ...getPreviewThemeVars(),
  };
  return true;
};

const openPreview = async (item, target, requestId) => {
  const canShowCover = showImages.value && item?.cover && !coverErrorMap[item.cover];
  let mediaLayout = null;
  if (canShowCover) {
    try {
      mediaLayout = await getPreviewMediaLayout(item.cover);
    } catch {
      coverErrorMap[item.cover] = true;
      if (!item.displayDesc) {
        hidePreview();
        return;
      }
    }
  }
  if (requestId !== previewRequestId || !target.isConnected) return;
  if (!positionPreview(item, target, mediaLayout)) hidePreview();
};

const showPreview = (item, event) => {
  if (item?.marketQuote || item?.fundMetric) return;
  if (!isClient || !isDesktop.value || !event?.currentTarget) return;
  if (!hasPreviewContent(item)) return;
  if (previewOpenTimer) window.clearTimeout(previewOpenTimer);
  const target = event.currentTarget;
  const requestId = ++previewRequestId;
  previewOpenTimer = window.setTimeout(() => {
    previewOpenTimer = null;
    openPreview(item, target, requestId);
  }, 180);
};

const bindPreviewViewportListeners = () => {
  if (!isClient || previewViewportListenersBound) return;
  window.addEventListener("scroll", hidePreview, true);
  window.addEventListener("blur", hidePreview);
  previewViewportListenersBound = true;
};

const unbindPreviewViewportListeners = () => {
  if (!isClient || !previewViewportListenersBound) return;
  window.removeEventListener("scroll", hidePreview, true);
  window.removeEventListener("blur", hidePreview);
  previewViewportListenersBound = false;
};

const hidePreview = () => {
  if (previewOpenTimer) {
    window.clearTimeout(previewOpenTimer);
    previewOpenTimer = null;
  }
  previewRequestId += 1;
  previewTarget = null;
  previewPlacement = null;
  previewItem.value = null;
  unbindPreviewViewportListeners();
};

const handleGlobalPreviewClose = () => {
  hidePreview();
};

const handlePreviewCoverError = (cover) => {
  if (!cover) return;
  coverErrorMap[cover] = true;
  if (previewItem.value?.cover !== cover) return;

  const item = previewItem.value;
  const target = previewTarget;
  if (!item.displayDesc || !target?.isConnected) {
    hidePreview();
    return;
  }

  if (!positionPreview(item, target, null, previewPlacement)) hidePreview();
};

const getPreviewThemeVars = () => {
  const isDarkTheme = store.siteTheme === "dark";
  return {
    "--preview-bg": isDarkTheme ? "#18181c" : "#fff",
    "--preview-border": isDarkTheme
      ? "rgba(255, 255, 255, 0.12)"
      : "rgba(127, 127, 127, 0.2)",
    "--preview-title-color": isDarkTheme
      ? "rgba(255, 255, 255, 0.92)"
      : "rgba(31, 34, 37, 0.92)",
    "--preview-text-color": isDarkTheme
      ? "rgba(255, 255, 255, 0.74)"
      : "rgba(31, 34, 37, 0.72)",
    "--preview-muted-color": isDarkTheme
      ? "rgba(255, 255, 255, 0.48)"
      : "rgba(31, 34, 37, 0.56)",
  };
};

const changeSubType = (subtype) => {
  const nextSubtype = resolveSourceSubtype(subtypeOptions.value, subtype);
  if (!nextSubtype || nextSubtype === activeSubType.value) return;
  trackEvent({
    event: "home_subtype_change",
    source: props.hotData.name,
    subtype: nextSubtype,
    category: props.hotData.category,
  });
  activeSubType.value = nextSubtype;
  persistSourceSubtype(props.hotData.name, nextSubtype);
  hidePreview();
  listLoading.value = true;
  getHotListsData(props.hotData.name);
};

// 前往全部列表
const toList = () => {
  if (props.hotData.name) {
    trackEvent({
      event: "rank_click",
      source: props.hotData.name,
      subtype: activeSubType.value,
      category: props.hotData.category,
    });
    router.push(
      buildRankPath(locale.value, props.hotData.name, activeSubType.value)
    );
  } else {
    $message.error(t("hotList.loadFailedMessage"));
  }
};

// 判断列表是否显示
const checkListShow = () => {
  if (isPrerender || !isClient || typeof document === "undefined") return;
  if (props.eagerLoad) {
    getHotListsData(props.hotData.name);
    return;
  }
  const typeName = props.hotData.name;
  const listId = "hot-list-" + typeName;
  const listDom = document.getElementById(listId);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        getHotListsData(props.hotData.name);
        observer.unobserve(entry.target);
      }
    });
  });
  observer.observe(listDom);
};

// 实时改变更新时间
watch(
  () => store.timeData,
  () => {
    if (hotListData.value) {
      updateTime.value = formatTime(hotListData.value.updateTime, locale.value);
    }
  }
);

watch(
  () => locale.value,
  async (targetLocale) => {
    if (hotListData.value) {
      updateTime.value = formatTime(hotListData.value.updateTime, targetLocale);
    }
    if (!hotListData.value) {
      listLoading.value = false;
      return;
    }
    if (shouldReloadForLocaleChange(props.hotData.name)) {
      listLoading.value = true;
      getHotListsData(props.hotData.name);
      return;
    }
    if (!shouldUseReadableTitleTranslation(props.hotData.name, targetLocale)) {
      listLoading.value = false;
      return;
    }
    const requestId = hotListRequestId;
    const sourceResult = hotListData.value;
    listLoading.value = true;
    try {
      const enhancedResult = await enhanceHotListResult(sourceResult, targetLocale);
      if (requestId === hotListRequestId && locale.value === targetLocale) {
        hotListData.value = enhancedResult;
      }
    } finally {
      if (requestId === hotListRequestId && locale.value === targetLocale) {
        listLoading.value = false;
      }
    }
  }
);

onMounted(() => {
  updateIsDesktop();
  if (isClient) {
    window.addEventListener("resize", updateIsDesktop);
    window.addEventListener("dailyhot:hide-item-preview", handleGlobalPreviewClose);
  }
  checkListShow();
});

onBeforeUnmount(() => {
  if (isClient) {
    window.removeEventListener("resize", updateIsDesktop);
    window.removeEventListener("dailyhot:hide-item-preview", handleGlobalPreviewClose);
  }
  hidePreview();
});
</script>

<style lang="scss" scoped>
.hot-list {
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
  .header-block {
    display: block;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 16px;
    height: 32px;
    min-width: 0;
    .name {
      display: flex;
      align-items: center;
      flex: 1 1 0;
      min-width: 0;
      max-width: none;
      .n-avatar {
        background-color: transparent;
        width: 25px;
        height: 25px;
        margin-right: 8px;
        flex: 0 0 auto;

        :deep(img) {
          object-fit: contain;
        }
      }

      .name-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .header-subtype {
      flex: 1 1 0;
      min-width: 0;
      max-width: none;
      margin-left: auto;
    }

    .header-subtype:deep(.subtype-scroll) {
      justify-content: flex-start;
      padding: 0;
    }

    .header-subtype:deep(.subtype-chip) {
      font-size: 12px;
      padding: 5px 11px;
    }

    .subtitle {
      flex: 0 1 auto;
      min-width: 0;
      max-width: 46%;
      margin-left: 12px;
      font-size: 12px;
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .message {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    font-size: 12px;
    height: 24px;

    .time {
      padding: 0 6px;
    }

    .loading {
      flex: 1 1 auto;
      min-width: 0;
    }

    .card-drag-handle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 34px;
      height: 22px;
      border-radius: 999px;
      color: var(--n-text-color-2);
      background: rgba(127, 127, 127, 0.14);
      cursor: grab;
      touch-action: none;
      transition: color 0.2s ease, background-color 0.2s ease;

      &:hover {
        color: var(--n-text-color);
        background: rgba(127, 127, 127, 0.2);
      }

      &:focus-visible {
        outline: 2px solid var(--n-close-color-pressed);
        outline-offset: 2px;
      }

      &:active {
        cursor: grabbing;
      }
    }
  }

  :deep(.news-list) {
    height: 300px;

    .n-scrollbar-rail {
      right: 0;
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      .n-button {
        margin-top: 12px;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      height: 300px;
      justify-content: space-between;
    }
  }

  .lists {
    padding-right: 6px;

    .item {
      position: relative;
      display: flex;
      flex-direction: column;
      margin-bottom: 6px;
      padding-bottom: 2px;
      min-height: 30px;
      border-radius: 8px;
      transition: all 0.3s;
      cursor: pointer;

      &:nth-last-of-type(1) {
        margin-bottom: 0;
      }

      .line {
        display: grid;
        grid-template-columns: auto 1fr;
        align-items: center;
        gap: 8px;
      }

      &.is-market-quote,
      &.is-fund-metric {
        min-height: 42px;
        margin-bottom: 8px;

        .line {
          align-items: stretch;
        }
      }

      &.is-index-overview .line {
        grid-template-columns: minmax(0, 1fr);
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
        position: relative;
        display: inline-flex;
        align-items: center;
        width: 100%;
        gap: 6px;
        transition: all 0.3s;
        text-decoration: none;
        color: inherit;

        .title-text {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }

        &.market-quote-link {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          min-width: 0;

          .market-quote-copy {
            min-width: 0;
          }

          .market-quote-title-row {
            display: flex;
            align-items: baseline;
            gap: 6px;
            min-width: 0;
          }

          .title-text {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .market-quote-region {
            flex: 0 0 auto;
            padding: 1px 5px;
            border-radius: 999px;
            background: color-mix(in srgb, currentColor 8%, transparent);
            font-size: 10px;
            line-height: 1.35;
            color: var(--n-text-color-3);
          }

          .market-quote-code {
            flex: 0 0 auto;
            font-size: 11px;
            line-height: 1.2;
            color: var(--n-text-color-3);
            font-variant-numeric: tabular-nums;
          }

          .market-quote-meta {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 2px;
            overflow: hidden;
            font-size: 11px;
            line-height: 1.3;
            color: var(--n-text-color-3);
            white-space: nowrap;
            text-overflow: ellipsis;
            font-variant-numeric: tabular-nums;
          }

          .market-quote-change {
            flex: 0 0 auto;
            min-width: 54px;
            text-align: right;
            font-size: 13px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;

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
        }

        &.fund-metric-link {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 10px;
          min-width: 0;

          .fund-metric-copy {
            min-width: 0;
          }

          .title-text {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .fund-metric-label {
            display: block;
            margin-top: 2px;
            overflow: hidden;
            font-size: 11px;
            line-height: 1.3;
            color: var(--n-text-color-3);
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .fund-metric-value {
            min-width: 58px;
            text-align: right;
            font-size: 13px;
            font-weight: 600;
            font-variant-numeric: tabular-nums;

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

        @media (min-width: 768px) {
          &:hover {
            transform: translateX(4px);

            &::after {
              width: 90%;
            }
          }
        }

        @media (max-width: 768px) {
          &:active {
            color: #ea444d;
          }
        }

        &::after {
          content: "";
          width: 0;
          height: 2px;
          max-height: 2px;
          background-color: var(--n-close-color-pressed);
          position: absolute;
          left: 0;
          bottom: -2px;
          border-radius: 8px;
          transition: all 0.3s;
        }
      }

    }
  }

  :deep(.n-card-header) {
    .loading {
      height: 26px;
    }
  }

  :deep(.n-card__footer) {
    .loading {
      height: 24px;
    }
  }
}

.hot-item-preview {
  position: fixed;
  z-index: 3000;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  box-sizing: border-box;
  max-width: calc(100vw - 24px);
  padding: 12px;
  pointer-events: none;
  color: var(--preview-title-color, var(--n-text-color, rgba(31, 34, 37, 0.92)));
  background: var(--preview-bg, var(--n-color, #fff));
  border: 1px solid var(--preview-border, var(--n-border-color, rgba(127, 127, 127, 0.2)));
  border-radius: 10px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  line-height: 1.45;

  &.has-cover {
    grid-template-columns: minmax(0, 1fr) var(--preview-cover-width);
    align-items: start;

    .preview-copy {
      align-self: center;
    }
  }

  &.is-media-only {
    position: fixed;
    display: block;
    overflow: hidden;
    padding: 0;
    border: 0;
    background: transparent;

    .preview-cover-wrap {
      width: 100%;
      height: 100%;
      border-radius: inherit;
    }
  }

  .preview-copy {
    min-width: 0;
  }

  .preview-desc {
    display: -webkit-box;
    overflow: hidden;
    color: var(--preview-text-color, var(--n-text-color-2, rgba(31, 34, 37, 0.72)));
    font-size: 13px;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: var(--preview-muted-color, var(--n-text-color-3, rgba(31, 34, 37, 0.56)));
    font-size: 12px;
  }

  .preview-media-meta {
    position: absolute;
    left: 8px;
    bottom: 8px;
    z-index: 1;
    justify-content: center;
    margin-top: 0;
    padding: 4px 8px;
    color: rgba(255, 255, 255, 0.96);
    background: rgba(20, 22, 26, 0.76);
    border-radius: 999px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    font-size: 12px;
    font-weight: 500;
    line-height: 18px;
  }

  .preview-cover-wrap {
    overflow: hidden;
    width: var(--preview-cover-width);
    height: var(--preview-cover-height);
    border-radius: 8px;
    background: rgba(127, 127, 127, 0.08);
  }

  .cover {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: var(--preview-cover-position, center);
  }
}

.item-preview-enter-active,
.item-preview-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.item-preview-enter-from,
.item-preview-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .item-preview-enter-active,
  .item-preview-leave-active {
    transition: opacity 0.01ms linear;
  }

  .item-preview-enter-from,
  .item-preview-leave-to {
    transform: none;
  }
}
</style>
