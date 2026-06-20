<template>
  <div class="list">
    <div
      ref="typeContainerRef"
      v-if="availableNews.length"
      class="type-shell"
      :class="{
        'has-left-shadow': typeCanScrollLeft,
        'has-right-shadow': typeCanScrollRight,
        'is-dragging': typeDragging,
      }"
    >
      <div
        ref="typeTrackRef"
        class="type"
        @pointerdown="startTypeDrag"
        @pointermove="dragTypeTrack"
        @pointerup="endTypeDrag"
        @pointercancel="endTypeDrag"
        @pointerleave="endTypeDrag"
        @scroll="updateTypeShadow"
      >
        <div
          v-for="(row, rowIndex) in sourceRows"
          :key="rowIndex"
          class="type-row"
        >
          <n-tag
            round
            size="large"
            class="tag"
            :class="{ 'is-active-source': isActiveSource(item.name) }"
            v-for="item in row"
            :key="item.name"
            :type="isActiveSource(item.name) ? 'primary' : 'default'"
            :aria-current="isActiveSource(item.name) ? 'page' : undefined"
            @click="changeType(item.name, $event)"
          >
            {{ getSourceDisplayLabel(item) }}
            <template #avatar>
              <img :src="logoSrc(item.name)" alt="logo" class="logo" @error="handleLogoError" />
            </template>
          </n-tag>
        </div>
      </div>
    </div>
    <SubtypeBar
      v-if="subtypeGroups.length"
      class="subtype"
      :groups="subtypeGroups"
      :active-value="listSubType"
      @change="changeSubType"
    />
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
                <img :src="logoSrc(listType)" alt="logo" @error="handleLogoError" />
              </div>
              <div class="name">
                <n-text class="title">{{ listHeaderTitle }}</n-text>
                <n-text v-if="listHeaderSubtitle && !subtypeGroups.length" class="subtitle" :depth="3">
                  {{ listHeaderSubtitle }}
                </n-text>
              </div>
              <div class="data">
                <n-text
                  v-if="listData.total"
                  :depth="3"
                  class="total"
                >
                  {{ t("list.totalSummary", { total: listData.total }) }}
                </n-text>
                <n-text :depth="3" class="time" v-html="updateTime" />
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
            <n-list hoverable style="width: 100%">
              <n-list-item
                v-for="(item, index) in currentPageItems"
                :key="item.id || item.url || item.mobileUrl || `${listType}-${pageNumber}-${index}-${item.originalTitle}`"
              >
                <template #prefix>
                  <n-text
                    class="num"
                    :class="
                      index + 1 + (pageNumber - 1) * 20 === 1
                        ? 'one'
                        : index + 1 + (pageNumber - 1) * 20 === 2
                        ? 'two'
                        : index + 1 + (pageNumber - 1) * 20 === 3
                        ? 'three'
                        : null
                    "
                    :depth="2"
                  >
                    {{ index + 1 + (pageNumber - 1) * 20 }}
                  </n-text>
                </template>
                <n-a
                  class="text"
                  :href="getItemLink(item)"
                  :target="linkTarget"
                  rel="noopener noreferrer nofollow"
                  :title="item.originalTitle || undefined"
                  @click="trackEvent({
                    event: 'rank_item_click',
                    source: listType,
                    subtype: listSubType,
                    category: store.activeCategory,
                    href: getItemLink(item),
                    meta: {
                      itemId: item.id,
                      itemTitle: item.title,
                      rankIndex: index + 1 + (pageNumber - 1) * 20,
                    },
                  })"
                >
                  <div class="content">
                    <div class="copy">
                      <n-text
                        class="title"
                        :class="{ 'no-auto-translate': item.hasReadableTranslation }"
                        v-html="item.displayTitle"
                      />
                      <n-text
                        v-if="item.displayDesc"
                        class="desc"
                        :depth="3"
                        v-html="item.displayDesc"
                      />
                      <div class="message">
                        <div class="hot" v-if="item.hot">
                          <n-icon :depth="3" :component="Fire" />
                          <n-text class="hot-text" :depth="3" v-html="item.hot" />
                        </div>
                      </div>
                    </div>
                    <div
                      class="cover-wrapper"
                      v-if="showImages && item.cover && !coverErrorMap[item.cover]"
                    >
                      <img
                        class="cover"
                        :src="item.cover"
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
              class="pagination"
              :page-slot="5"
              :item-count="listData.data.length"
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
import { getCacheVersion } from "@/utils/cache";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { formatTime } from "@/utils/getTime";
import { getHotListsWithFallback } from "@/api";
import SubtypeBar from "@/components/SubtypeBar.vue";
import {
  buildSourceSubtypeParams,
  getSourceSubtypeGroups,
  getSourceSubtypeOptions,
  persistSourceSubtype,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { buildRankPath, getLocaleFromRoute, getSourceNameBySlug } from "@/utils/locale";
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
const cacheVersion = getCacheVersion();
const isPrerender =
  isClient && window.__PRERENDER_INJECTED && window.__PRERENDER_INJECTED.prerender;
const coverErrorMap = reactive({});
const SOURCE_FAMILY_ALIASES = {
  "clawhub-skills": "clawhub",
  "clawhub-plugins": "clawhub",
  "openai-news": "openai",
  "openai-research": "openai",
  lmarena: "arena-ai",
  "huggingface-blog": "huggingface",
  "hf-models": "huggingface",
  "hf-papers": "huggingface",
};
const normalizeSourceFamily = (name = "") => SOURCE_FAMILY_ALIASES[name] || name;
const API_LOCALIZED_SOURCE_NAMES = new Set(["designarena"]);
const shouldReloadForLocaleChange = (name = "") =>
  API_LOCALIZED_SOURCE_NAMES.has(name);

const updateTime = ref(null);
const availableNews = computed(() => {
  const categoryOn = store.categoryEnabled;
  const currentCat = store.activeCategory;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) =>
      categoryOn && currentCat !== "全部" ? item.category === currentCat : true
    )
    .sort((a, b) => a.order - b.order);
});
const typeContainerRef = ref(null);
const typeRowCount = ref(2);
const sourceRows = computed(() =>
  availableNews.value.reduce(
    (rows, item, index) => {
      rows[index % typeRowCount.value].push(item);
      return rows;
    },
    Array.from({ length: typeRowCount.value }, () => [])
  )
);
const resolveRouteType = (targetRoute) =>
  getSourceNameBySlug(
    targetRoute?.params?.sourceSlug || targetRoute?.query?.type || availableNews.value[0]?.name
  );
const listType = ref(
  resolveRouteType(router.currentRoute.value)
);
const listSubType = ref(null);
const pageNumber = ref(
  router.currentRoute.value.query.page
    ? Number(router.currentRoute.value.query.page)
    : 1
);
const listData = ref(null);
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const typeTrackRef = ref(null);
const typeCanScrollLeft = ref(false);
const typeCanScrollRight = ref(false);
const typeDragging = ref(false);
const typeDragMoved = ref(false);
let typeDragStartX = 0;
let typeDragStartScrollLeft = 0;
let typePointerCaptured = false;
let typeResizeObserver = null;
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self"
);
const showImages = computed(() => store.showImages);
const logoSrc = (name) => getSourceLogo(name, cacheVersion);
const isActiveSource = (name) =>
  normalizeSourceFamily(name) === normalizeSourceFamily(listType.value);
const getSourceDisplayLabel = (item) =>
  getLocalizedSourceDisplayLabel(
    item?.name,
    locale.value,
    item?.label || item?.name
  );
const currentSourceMeta = computed(
  () =>
    store.newsArr.find((item) => item.name === listType.value) ||
    store.defaultNewsArr.find((item) => item.name === listType.value) ||
    null
);
const listHeaderTitle = computed(
  () => getSourceDisplayLabel(currentSourceMeta.value || { name: listType.value, label: listData.value?.title || listType.value })
);
const shouldEnhanceReadableTitles = computed(() =>
  shouldUseReadableTitleTranslation(listType.value, locale.value)
);
const shouldProtectEntityTitles = computed(() =>
  shouldProtectEntityTitleTranslation(listType.value)
);
const listHeaderSubtitle = computed(() => {
  const rawSubtitle =
    currentSourceMeta.value &&
    Object.prototype.hasOwnProperty.call(currentSourceMeta.value, "subtype")
      ? currentSourceMeta.value.subtype ?? ""
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
const currentPageItems = computed(() =>
  (listData.value?.data || [])
    .slice(pageNumber.value * 20 - 20, pageNumber.value * 20)
    .map((item) => {
      const originalTitle = String(item?.originalTitle || "");
      const originalDesc = String(item?.originalDesc || "");
      const displayTitle = item?.title || originalTitle;
      const rawDisplayDesc = item?.desc || originalDesc;
      const displayDesc =
        locale.value !== "zh-CN" &&
        isDuplicateDesc(rawDisplayDesc, originalTitle, item?.title, displayTitle)
          ? ""
          : rawDisplayDesc;
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
    const rows = document.querySelectorAll(".all .n-list-item");
    items.forEach((item, index) => {
      const row = rows[index];
      if (!row) return;
      const linkNode = row.querySelector(".text");
      const titleNode = row.querySelector(".content .copy .title");
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
const handleLogoError = (event) => {
  event.target.src = getSourceLogoFallback();
};
const subtypeGroups = computed(() =>
  localizeSubtypeGroups(getSourceSubtypeGroups(listType.value), locale.value)
);
const activeTypeOptions = computed(() =>
  subtypeGroups.value.flatMap((group) => group.items || [])
);

const resolveSubType = (route) => {
  const options = activeTypeOptions.value;
  const candidate = route?.params?.subtypeSlug || route?.query?.subtype;
  const stored = readSourceSubtype(listType.value);
  return resolveSourceSubtype(options, candidate || stored);
};

const enhanceListResult = (result, targetLocale = locale.value) =>
  shouldUseReadableTitleTranslation(listType.value, targetLocale)
    ? enhanceReadableResultTitles(result, targetLocale, {
        limit: 20,
        offset: Math.max(0, (pageNumber.value - 1) * 20),
        sourceName: listType.value,
      })
    : Promise.resolve(result);

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  if (!name) return;
  const requestId = ++listRequestId;
  if (isPrerender) {
    const label = getSourceDisplayLabel(
      store.newsArr.find((item) => item.name === name) ||
        store.defaultNewsArr.find((item) => item.name === name) ||
        { name, label: name }
    );
    listData.value = {
      title: label,
      subtitle: t("list.prerenderSubtitle"),
      data: [],
    };
    updateTime.value = formatTime(new Date().toISOString(), locale.value);
    return;
  }
  listData.value = null;
  const item =
    store.newsArr.find((item) => item.name == name) ||
    store.defaultNewsArr.find((item) => item.name == name);
  if (!item) return;
  const useApi2 = item?.useApi2 || item?.api === 2 || item?.api === "api2";
  const shouldTranslate = shouldEnhanceReadableTitles.value;
  const params = buildSourceSubtypeParams(item.name, listSubType.value);
  if (item.name === "designarena") {
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
    const { result, usedFallback, fallbackSuccess } = await getHotListsWithFallback(
      item.name,
      isNew,
      requestParams,
      {
        useApi2,
        forceNoCache: Boolean(isNew),
      }
    );
    if (requestId !== listRequestId) return;
    if (usedFallback && fallbackSuccess && !useApi2) {
      store.setSourceApi2(item.name, true);
    }
    if (result.code === 200) {
      store.markAvailable(item.name);
      const nextResult = shouldTranslate
        ? await enhanceListResult(result)
        : result;
      if (requestId !== listRequestId) return;
      listData.value = nextResult;
    } else {
      store.markUnavailable(item.name);
      $message.error(result.message);
    }
  } catch {
    if (requestId !== listRequestId) return;
    store.markUnavailable(item.name);
    $message.error(t("list.loadFailedMessage"));
  }
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

const getTypeTrackElement = () => typeTrackRef.value?.$el || typeTrackRef.value;

const updateTypeShadow = () => {
  const track = getTypeTrackElement();
  if (!track) {
    typeCanScrollLeft.value = false;
    typeCanScrollRight.value = false;
    return;
  }
  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
  typeCanScrollLeft.value = track.scrollLeft > 1;
  typeCanScrollRight.value = maxScrollLeft - track.scrollLeft > 1;
};

const alignActiveTypeIntoView = () => {
  const track = getTypeTrackElement();
  const activeTag = track?.querySelector?.(".tag.is-active-source");
  if (!track || !activeTag) return;
  const trackRect = track.getBoundingClientRect();
  const activeRect = activeTag.getBoundingClientRect();
  const padding = 18;
  let nextScrollLeft = track.scrollLeft;
  if (activeRect.left < trackRect.left + padding) {
    nextScrollLeft -= trackRect.left + padding - activeRect.left;
  } else if (activeRect.right > trackRect.right - padding) {
    nextScrollLeft += activeRect.right - (trackRect.right - padding);
  }
  if (nextScrollLeft !== track.scrollLeft) {
    track.scrollTo({ left: Math.max(0, nextScrollLeft), behavior: "auto" });
  }
  updateTypeShadow();
};

const scrollActiveTypeIntoView = () => {
  nextTick(() => {
    alignActiveTypeIntoView();
    if (!isClient) return;
    window.requestAnimationFrame(() => alignActiveTypeIntoView());
    window.setTimeout(() => alignActiveTypeIntoView(), 120);
    window.setTimeout(() => alignActiveTypeIntoView(), 600);
  });
};

const updateTypeRowCount = () => {
  const container = typeContainerRef.value;
  const track = getTypeTrackElement();
  if (!container || !track) {
    typeRowCount.value = 2;
    return;
  }
  typeRowCount.value = track.scrollWidth <= container.clientWidth ? 1 : 2;
};

const refreshTypeScrollState = () => {
  nextTick(() => {
    const track = getTypeTrackElement();
    if (typeResizeObserver) {
      typeResizeObserver.disconnect();
      typeResizeObserver = null;
    }
    if (track && typeof ResizeObserver !== "undefined") {
      typeResizeObserver = new ResizeObserver(() => {
        updateTypeRowCount();
        updateTypeShadow();
      });
      typeResizeObserver.observe(track);
      if (typeContainerRef.value) {
        typeResizeObserver.observe(typeContainerRef.value);
      }
    }
    updateTypeRowCount();
    updateTypeShadow();
    scrollActiveTypeIntoView();
  });
};

const startTypeDrag = (event) => {
  const track = getTypeTrackElement();
  if (!track || event.button !== 0 || track.scrollWidth <= track.clientWidth) {
    return;
  }
  typeDragging.value = true;
  typeDragMoved.value = false;
  typePointerCaptured = false;
  typeDragStartX = event.clientX;
  typeDragStartScrollLeft = track.scrollLeft;
};

const dragTypeTrack = (event) => {
  const track = getTypeTrackElement();
  if (!typeDragging.value || !track) return;
  const deltaX = event.clientX - typeDragStartX;
  if (!typeDragMoved.value && Math.abs(deltaX) > 4) {
    typeDragMoved.value = true;
    track.setPointerCapture?.(event.pointerId);
    typePointerCaptured = true;
  }
  track.scrollLeft = typeDragStartScrollLeft - deltaX;
  updateTypeShadow();
};

const endTypeDrag = (event) => {
  const track = getTypeTrackElement();
  if (!typeDragging.value) return;
  typeDragging.value = false;
  if (typePointerCaptured) {
    track?.releasePointerCapture?.(event.pointerId);
    typePointerCaptured = false;
  }
  updateTypeShadow();
  if (typeDragMoved.value && typeof window !== "undefined") {
    window.setTimeout(() => {
      typeDragMoved.value = false;
    }, 0);
  }
};

// 切换类别
const changeType = (type, event) => {
  if (typeDragMoved.value) {
    event?.preventDefault();
    return;
  }
  if (!type) return;
  trackEvent({
    event: "list_source_change",
    source: type,
    category: store.activeCategory,
  });
  const nextSubtype = resolveSourceSubtype(
    getSourceSubtypeOptions(type),
    readSourceSubtype(type)
  );
  router.push(buildRankPath(getLocaleFromRoute(route), type, nextSubtype || ""));
};

const changeSubType = (subtype) => {
  if (!subtype || subtype === listSubType.value) return;
  trackEvent({
    event: "list_subtype_change",
    source: listType.value,
    subtype,
    category: store.activeCategory,
  });
  persistSourceSubtype(listType.value, subtype);
  router.push(buildRankPath(getLocaleFromRoute(route), listType.value, subtype));
};

// 实时改变更新时间
watch(
  () => store.timeData,
  () => {
    if (listData.value) {
      updateTime.value = formatTime(listData.value.updateTime, locale.value);
    }
  }
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
    if (!listData.value || !shouldUseReadableTitleTranslation(listType.value, targetLocale)) {
      return;
    }
    const requestId = listRequestId;
    const sourceResult = listData.value;
    try {
      const enhancedResult = await enhanceListResult(sourceResult, targetLocale);
      if (requestId === listRequestId && locale.value === targetLocale) {
        listData.value = enhancedResult;
      }
    } catch {
      if (requestId === listRequestId && locale.value === targetLocale) {
        listData.value = sourceResult;
      }
    }
  }
);

watch(
  () => currentPageItems.value,
  (items) => {
    syncReadableTitleDom(items);
  },
  { immediate: true, deep: true }
);

// 页数变化
watch(
  () => pageNumber.value,
  (val) => {
    const query = {
      page: val,
    };
    router.push({
      path: buildRankPath(
        getLocaleFromRoute(route),
        listType.value,
        listSubType.value || ""
      ),
      query,
    });
    document.querySelector(".n-back-top")?.click();
  }
);

// 类别变化
watch(
  () => router.currentRoute.value,
  (val) => {
    if (["list", "list-locale", "list-legacy"].includes(val.name)) {
      listType.value = resolveRouteType(val);
      pageNumber.value = Number(val.query.page) || 1;
      listSubType.value = resolveSubType(val);
      persistSourceSubtype(listType.value, listSubType.value);
      getHotListsData(listType.value);
    }
  }
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
    refreshTypeScrollState();
  },
  { deep: true }
);

watch(
  () => [listType.value, activeTypeOptions.value],
  () => {
    const nextSubtype = resolveSubType(router.currentRoute.value);
    if (nextSubtype === listSubType.value) return;
    listSubType.value = nextSubtype;
    refreshTypeScrollState();
  },
  { deep: true }
);

onMounted(() => {
  updateIsDesktop();
  if (isClient) {
    window.addEventListener("resize", updateIsDesktop);
    window.addEventListener("resize", updateTypeShadow);
  }
  refreshTypeScrollState();
  listSubType.value = resolveSubType(router.currentRoute.value);
  getHotListsData(listType.value);
});

onActivated(() => {
  listSubType.value = resolveSubType(router.currentRoute.value);
  if (!listData.value) {
    getHotListsData(listType.value);
  }
  refreshTypeScrollState();
});

onBeforeUnmount(() => {
  if (isClient) {
    window.removeEventListener("resize", updateIsDesktop);
    window.removeEventListener("resize", updateTypeShadow);
  }
  if (typeResizeObserver) {
    typeResizeObserver.disconnect();
    typeResizeObserver = null;
  }
});
</script>

<style lang="scss" scoped>
.list {
  .type-shell {
    position: relative;
    overflow: hidden;
    max-height: 78px;

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 4px;
      z-index: 2;
      width: 34px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.16s ease;
    }

    &::before {
      left: 0;
      background: linear-gradient(90deg, var(--n-color, #fff), transparent);
    }

    &::after {
      right: 0;
      background: linear-gradient(270deg, var(--n-color, #fff), transparent);
    }

    &.has-left-shadow::before,
    &.has-right-shadow::after {
      opacity: 0.94;
    }

    &.is-dragging {
      .type {
        cursor: grabbing;
        user-select: none;
      }
    }
  }

  .type {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 8px;
    cursor: grab;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
      display: none;
    }
  }

    .type-row {
      display: flex;
      width: max-content;
      min-width: 100%;
      gap: 8px;

      &::after {
        content: "";
        flex: 0 0 42px;
      }

      & + .type-row {
        margin-top: 6px;
      }

    .tag {
      flex: 0 0 auto;
      width: max-content;
      cursor: pointer;
      transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;

      &.is-active-source {
        background: rgba(234, 68, 77, 0.12);
        box-shadow: 0 0 0 2px rgba(234, 68, 77, 0.18);
        color: #ea444d;
        font-weight: 700;
        transform: translateY(-1px);

        :deep(.n-tag__content) {
          color: #ea444d;
        }
      }

      .logo {
        height: 22px;
        width: 22px;
        margin-left: 6px;
      }
    }
  }
  .subtype {
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
          .title {
            overflow: hidden;
            font-size: 16px;
            margin-bottom: 4px;
            text-overflow: ellipsis;
            white-space: nowrap;
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
