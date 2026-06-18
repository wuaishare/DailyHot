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
    <n-scrollbar class="news-list" ref="scrollbarRef" @scroll="hidePreview">
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
                :title="item.translatedTitle ? item.originalTitle : undefined"
                @click.stop
              >
                <span
                  class="title-text"
                  :class="{ 'no-auto-translate': shouldEnhanceReadableTitles }"
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
          <div class="loading">
            <n-skeleton text round />
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
    <Transition name="cover-preview">
      <div
        v-if="previewItem"
        class="hot-cover-preview"
        :style="previewStyle"
      >
        <img
          class="cover"
          :src="previewItem.cover"
          :alt="previewItem.title"
          loading="lazy"
          @error="coverErrorMap[previewItem.cover] = true; hidePreview()"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { Refresh, More } from "@icon-park/vue-next";
import { getHotListsWithFallback } from "@/api";
import { formatTime } from "@/utils/getTime";
import { getCacheVersion } from "@/utils/cache";
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
  getSourceLabel,
  getSourceSubtitleLabel,
  localizeSubtypeGroups,
} from "@/utils/sourceLabels";
import { buildRankPath } from "@/utils/locale";
import {
  shouldUseReadableTitleTranslation,
  translateReadableTitles,
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
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self"
);
const previewMaxWidth = 260;
const previewMaxHeight = 260;
const READABLE_TITLE_LIMIT = 3;
const showImages = computed(() => store.showImages);
const sourceLabel = computed(() =>
  getSourceLabel(props.hotData.name, locale.value, props.hotData.label)
);
const shouldEnhanceReadableTitles = computed(() =>
  shouldUseReadableTitleTranslation(props.hotData.name, locale.value)
);
const cardSubtitle = computed(() => {
  const rawSubtitle =
    Object.prototype.hasOwnProperty.call(props.hotData || {}, "subtype")
      ? props.hotData.subtype ?? ""
      : hotListData.value?.type || "";
  if (Object.prototype.hasOwnProperty.call(props.hotData || {}, "subtype")) {
    return getSourceSubtitleLabel(rawSubtitle, locale.value);
  }
  return getSourceSubtitleLabel(rawSubtitle, locale.value);
});
let hotListRequestId = 0;
let titleTranslationRequestId = 0;
const visibleItems = ref([]);
const buildVisibleItems = (translatedTitles = {}) =>
  (hotListData.value?.data || []).slice(0, 15).map((item) => {
    const originalTitle = String(item?.title || "").trim();
    const translatedTitle = translatedTitles[originalTitle] || "";
    return {
      ...item,
      originalTitle,
      translatedTitle,
      displayTitle: translatedTitle || originalTitle,
    };
  });
const syncReadableTitleDom = (items = []) => {
  nextTick(() => {
    const root = document.getElementById(`hot-list-${props.hotData.name}`);
    if (!root) return;
    const links = root.querySelectorAll(".lists .item .text");
    const titles = root.querySelectorAll(".lists .item .title-text");
    items.forEach((item, index) => {
      const titleNode = titles[index];
      const linkNode = links[index];
      if (!titleNode || !linkNode) return;
      titleNode.textContent = item.translatedTitle || item.originalTitle || "";
      if (item.translatedTitle) {
        linkNode.setAttribute("title", item.originalTitle);
      } else {
        linkNode.removeAttribute("title");
      }
    });
  });
};
const updateVisibleItems = async (items = hotListData.value?.data || []) => {
  const requestId = ++titleTranslationRequestId;
  const initialItems = buildVisibleItems();
  visibleItems.value = initialItems;
  syncReadableTitleDom(initialItems);
  const titles = (items || [])
    .slice(0, READABLE_TITLE_LIMIT)
    .map((item) => item?.title || "");
  if (!shouldEnhanceReadableTitles.value || !titles.length) {
    if (requestId === titleTranslationRequestId) {
      const fallbackItems = buildVisibleItems();
      visibleItems.value = fallbackItems;
      syncReadableTitleDom(fallbackItems);
    }
    return;
  }
  const translatedTitles = await translateReadableTitles(
    titles,
    locale.value
  );
  if (requestId === titleTranslationRequestId) {
    const translatedItems = buildVisibleItems(translatedTitles);
    visibleItems.value = translatedItems;
    syncReadableTitleDom(translatedItems);
  }
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
  () => locale.value,
  () => {
    updateVisibleItems();
  },
  { immediate: true }
);

const updateIsDesktop = () => {
  if (!isClient) return;
  isDesktop.value = window.innerWidth > 680;
};

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  if (isPrerender) return;
  const requestId = ++hotListRequestId;
  try {
    loadingError.value = false;
    const item =
      store.newsArr.find((item) => item.name == name) ||
      store.defaultNewsArr.find((item) => item.name == name);
    if (!item) return;
    const useApi2 = item?.useApi2 || item?.api === 2 || item?.api === "api2";
    const { result, usedFallback, fallbackSuccess } =
      await getHotListsWithFallback(
        item.name,
        isNew,
        buildSourceSubtypeParams(item.name, activeSubType.value),
        {
          useApi2,
        }
      );
    if (usedFallback && fallbackSuccess && !useApi2) {
      store.setSourceApi2(item.name, true);
    }
    if (requestId !== hotListRequestId) return;
    if (result.code === 200) {
      store.markAvailable(item.name);
      listLoading.value = false;
      hotListData.value = result;
      await updateVisibleItems(result.data || []);
      // 滚动至顶部
      if (scrollbarRef.value) {
        scrollbarRef.value.scrollTo({ position: "top", behavior: "smooth" });
      }
    } else {
      store.markUnavailable(item.name);
      loadingError.value = true;
      $message.error(result.title + result.message);
    }
  } catch (error) {
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
        previewMaxWidth / image.naturalWidth,
        previewMaxHeight / image.naturalHeight,
        1
      );
      resolve({
        width: Math.round(image.naturalWidth * scale),
        height: Math.round(image.naturalHeight * scale),
      });
    };
    image.onerror = reject;
    image.src = cover;
  });
  previewSizeCache.set(cover, sizePromise);
  return sizePromise;
};

const showPreview = async (item, event) => {
  if (!showImages.value || !item?.cover || coverErrorMap[item.cover]) return;
  if (!isClient || !event?.currentTarget) return;
  const target = event.currentTarget;
  const requestId = ++previewRequestId;
  let previewSize;
  try {
    previewSize = await getPreviewSize(item.cover);
  } catch (error) {
    coverErrorMap[item.cover] = true;
    hidePreview();
    return;
  }
  if (requestId !== previewRequestId || !target.isConnected) return;

  const rect = target.getBoundingClientRect();
  const card = target.closest(".hot-list");
  const cardRect = card?.getBoundingClientRect();
  const textRects = Array.from(card?.querySelectorAll(".text") || []).map(
    (node) => node.getBoundingClientRect()
  );
  const padding = 12;
  const gap = 10;
  const previewWidth = previewSize.width;
  const previewHeight = previewSize.height;
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
  };
};

const hidePreview = () => {
  previewRequestId += 1;
  previewItem.value = null;
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

onMounted(() => {
  updateIsDesktop();
  if (isClient) {
    window.addEventListener("resize", updateIsDesktop);
  }
  checkListShow();
});

onBeforeUnmount(() => {
  if (isClient) {
    window.removeEventListener("resize", updateIsDesktop);
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

.hot-cover-preview {
  position: fixed;
  z-index: 3000;
  pointer-events: none;
  line-height: 0;
  filter: drop-shadow(0 16px 34px rgba(0, 0, 0, 0.22));

  .cover {
    display: block;
    width: auto;
    height: auto;
    max-width: 260px;
    max-height: 260px;
    object-fit: contain;
    object-position: center;
    border: 1px solid rgba(127, 127, 127, 0.2);
    border-radius: 12px;
    background: transparent;
  }
}

.cover-preview-enter-active,
.cover-preview-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.cover-preview-enter-from,
.cover-preview-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
