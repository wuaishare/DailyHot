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
            v-for="(item, index) in visibleItems"
            :key="item.id || item.url || item.mobileUrl || `${props.hotData.name}-${index}-${item.originalTitle}`"
            @mouseenter="showPreview(item, $event)"
            @pointerenter="showPreview(item, $event)"
            @mouseleave="hidePreview"
            @pointerleave="hidePreview"
            @focusin="showPreview(item, $event)"
            @focusout="hidePreview"
          >
            <div class="line">
              <n-text
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
        class="hot-item-preview"
        :class="{ 'has-cover': previewHasCover }"
        :style="previewStyle"
        role="tooltip"
      >
        <div class="preview-copy">
          <div class="preview-title">
            {{ previewItem.displayTitle || previewItem.title }}
          </div>
          <div v-if="previewItem.displayDesc" class="preview-desc">
            {{ previewItem.displayDesc }}
          </div>
          <div v-if="previewItem.hot" class="preview-meta">
            <n-icon :component="Fire" />
            <span>{{ previewItem.hot }}</span>
          </div>
        </div>
        <div v-if="previewHasCover" class="preview-cover-wrap">
          <img
            class="cover"
            :src="getCoverDisplaySrc(previewItem.cover)"
            :alt="previewItem.title"
            loading="lazy"
            @error="handlePreviewCoverError(previewItem.cover)"
          />
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
const previewSizeCache = new Map();
let previewRequestId = 0;
let previewOpenTimer = null;
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self"
);
const previewTextOnlyWidth = 340;
const previewWithCoverWidth = 440;
const previewCoverMaxWidth = 150;
const previewCoverMaxHeight = 150;
const previewFallbackCoverSize = {
  width: previewCoverMaxWidth,
  height: previewCoverMaxHeight,
};
const showImages = computed(() => store.showImages);
const previewHasCover = computed(
  () =>
    showImages.value &&
    previewItem.value?.cover &&
    !coverErrorMap[previewItem.value.cover]
);
const shouldEnhanceReadableTitles = computed(() =>
  shouldUseReadableTitleTranslation(props.hotData.name, locale.value)
);
const shouldProtectEntityTitles = computed(() =>
  shouldProtectEntityTitleTranslation(props.hotData.name)
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

const getPreviewSize = (cover) => {
  if (previewSizeCache.has(cover)) return previewSizeCache.get(cover);
  const sizePromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(
        previewCoverMaxWidth / image.naturalWidth,
        previewCoverMaxHeight / image.naturalHeight,
        1
      );
      resolve({
        width: Math.round(image.naturalWidth * scale),
        height: Math.round(image.naturalHeight * scale),
      });
    };
    image.onerror = reject;
    image.src = getCoverDisplaySrc(cover);
  });
  previewSizeCache.set(cover, sizePromise);
  return sizePromise;
};

const hasPreviewContent = (item) =>
  Boolean(
    item?.displayDesc || (showImages.value && item?.cover && !coverErrorMap[item.cover])
  );

const estimatePreviewHeight = (item, coverSize) => {
  const descLength = String(item?.displayDesc || "").length;
  const descLines = descLength ? Math.min(4, Math.max(1, Math.ceil(descLength / 28))) : 0;
  const textHeight = 48 + descLines * 20 + (item?.hot ? 22 : 0);
  if (!coverSize) return Math.max(84, textHeight + 28);
  return Math.max(coverSize.height + 28, textHeight + 28);
};

const openPreview = async (item, target, requestId) => {
  const canShowCover = showImages.value && item?.cover && !coverErrorMap[item.cover];
  let coverSize = null;
  if (canShowCover) {
    try {
      coverSize = await getPreviewSize(item.cover);
    } catch (error) {
      coverSize = previewFallbackCoverSize;
    }
  }
  if (requestId !== previewRequestId || !target.isConnected) return;

  const hasCover = Boolean(coverSize);
  const rect = target.getBoundingClientRect();
  const card = target.closest(".hot-list");
  const cardRect = card?.getBoundingClientRect();
  const textRects = Array.from(card?.querySelectorAll(".text") || []).map(
    (node) => node.getBoundingClientRect()
  );
  const padding = 12;
  const gap = 10;
  const previewWidth = hasCover ? previewWithCoverWidth : previewTextOnlyWidth;
  const previewHeight = estimatePreviewHeight(item, coverSize);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clampLeft = (value) =>
    clamp(value, padding, window.innerWidth - previewWidth - padding);
  const clampTop = (value) =>
    clamp(value, padding, window.innerHeight - previewHeight - padding);
  const placeRight =
    window.innerWidth - rect.right >= previewWidth + gap + padding;
  const placeLeft =
    rect.left >= previewWidth + gap + padding;
  const placeBelow =
    cardRect &&
    window.innerHeight - cardRect.bottom >= previewHeight + gap + padding;
  const placeAbove =
    cardRect && cardRect.top >= previewHeight + gap + padding;
  let left = clampLeft(rect.left + 32);
  let top = clampTop(rect.top - 8);

  if (placeRight) {
    left = rect.right + gap;
  } else if (placeLeft) {
    left = rect.left - previewWidth - gap;
  } else if (placeBelow) {
    top = cardRect.bottom + gap;
  } else if (placeAbove) {
    top = cardRect.top - previewHeight - gap;
  } else {
    hidePreview();
    return;
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
  if (overlapsText && !placeBelow && !placeAbove) {
    hidePreview();
    return;
  }

  previewItem.value = item;
  previewStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${previewWidth}px`,
    "--preview-cover-width": coverSize ? `${coverSize.width}px` : "0px",
    "--preview-cover-height": coverSize ? `${coverSize.height}px` : "0px",
    ...getPreviewThemeVars(),
  };
};

const showPreview = (item, event) => {
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

const hidePreview = () => {
  if (previewOpenTimer) {
    window.clearTimeout(previewOpenTimer);
    previewOpenTimer = null;
  }
  previewRequestId += 1;
  previewItem.value = null;
};

const handleGlobalPreviewClose = () => {
  hidePreview();
};

const handlePreviewCoverError = (cover) => {
  if (!cover) return;
  coverErrorMap[cover] = true;
  if (previewItem.value?.cover !== cover) return;
  previewStyle.value = {
    ...previewStyle.value,
    width: `${previewTextOnlyWidth}px`,
    "--preview-cover-width": "0px",
    "--preview-cover-height": "0px",
  };
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
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
  line-height: 1.45;

  &.has-cover {
    grid-template-columns: minmax(0, 1fr) var(--preview-cover-width);
    align-items: start;
  }

  .preview-copy {
    min-width: 0;
  }

  .preview-title {
    display: -webkit-box;
    overflow: hidden;
    margin-bottom: 6px;
    color: var(--preview-title-color, var(--n-title-text-color, var(--n-text-color, rgba(31, 34, 37, 0.92))));
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .preview-desc {
    display: -webkit-box;
    overflow: hidden;
    color: var(--preview-text-color, var(--n-text-color-2, rgba(31, 34, 37, 0.72)));
    font-size: 13px;
    line-height: 1.55;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: var(--preview-muted-color, var(--n-text-color-3, rgba(31, 34, 37, 0.56)));
    font-size: 12px;
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
    object-position: center;
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
</style>
