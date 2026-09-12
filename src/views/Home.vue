<template>
  <div class="home">
    <router-link
      v-if="isGamesCategory"
      :to="gameDealsTopicPath"
      class="wool-topic-entry"
    >
      <div>
        <strong>{{ gameDealsTopicCopy.title }}</strong>
        <p>{{ gameDealsTopicCopy.description }}</p>
      </div>
      <em>{{ gameDealsTopicCopy.open }} →</em>
    </router-link>
    <router-link
      v-if="isWoolCategory"
      :to="woolTopicPath"
      class="wool-topic-entry"
    >
      <div>
        <span>{{ woolTopicCopy.eyebrow }}</span>
        <strong>{{ woolTopicCopy.title }}</strong>
        <p>{{ woolTopicCopy.description }}</p>
      </div>
      <em>{{ woolTopicCopy.open }} →</em>
    </router-link>
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <div
      v-if="supportsViewMode && categoryView === 'stream' && categoryNavigation"
      class="category-context-nav"
      :class="{ 'is-dark': store.siteTheme === 'dark' }"
    >
      <div v-if="categoryNavigation.breadcrumbs.length > 1" class="category-context-nav__crumbs">
        <template v-for="(item, index) in categoryNavigation.breadcrumbs" :key="item.id">
          <router-link :to="categoryPath(item)">{{ categoryLabelFor(item) }}</router-link>
          <span v-if="index < categoryNavigation.breadcrumbs.length - 1" aria-hidden="true">/</span>
        </template>
      </div>
      <nav
        v-if="categoryNavigation.options.length > 1"
        class="category-context-nav__tabs"
        :aria-label="categoryLabelFor(categoryNavigation.scopeRoot)"
      >
        <router-link
          v-for="(item, index) in categoryNavigation.options"
          :key="item.id"
          :to="categoryPath(item)"
          class="category-context-nav__tab"
          :class="{ active: item.id === categoryNavigation.current.id }"
          :aria-current="item.id === categoryNavigation.current.id ? 'page' : undefined"
        >
          <span v-if="categoryNavigation.showScopeAll && item.id === categoryNavigation.scopeRoot.id">{{ t('categories.all') }}</span>
          <span v-else>{{ categoryLabelFor(item) }}</span>
        </router-link>
      </nav>
    </div>
    <CategorySourceRail
      v-if="supportsViewMode && categoryView === 'stream'"
      :sources="scopedNews"
    />
    <draggable
      v-else-if="sortableNews[0]"
      v-model="sortableNews"
      class="news-grid"
      :class="{ 'is-compact': store.compactMode }"
      item-key="name"
      :animation="180"
      :disabled="cardDragDisabled"
      handle=".card-drag-handle"
      filter=".no-card-drag, .no-card-drag *"
      :prevent-on-filter="false"
      :fallback-tolerance="8"
      :touch-start-threshold="8"
      ghost-class="news-card-ghost"
      chosen-class="news-card-chosen"
      drag-class="news-card-drag"
      @start="startCardDrag"
      @end="saveCardOrder"
    >
      <template #item="{ element: item, index }">
        <div
          class="news-card"
          :class="{ 'with-entrance': enableCardEntrance }"
          :key="`${store.activeCategory}-${item.name}`"
          :style="{ animationDelay: index / 10 + 0.2 + 's' }"
        >
          <HotList :hotData="item" />
        </div>
      </template>
    </draggable>
    <div
      class="error"
      v-if="
        categoryView === 'card' &&
        renderNews[0] &&
        sortableNews.length === 0
      "
    >
      <n-divider dashed class="tip">
        {{ t("common.emptyCategory") }}
      </n-divider>
    </div>
    <div class="error" v-else-if="!renderNews[0]">
      <n-divider dashed class="tip"> {{ t("common.noContent") }} </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          {{ t("home.resetAction") }}
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";
import CategorySourceRail from "@/components/CategorySourceRail.vue";
import draggable from "vuedraggable";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  buildCategoryPath,
  buildFixedLocalePath,
  getCategoryLabel,
  getCategoryNameBySlug,
  getLocaleFromRoute,
  normalizeLocale,
} from "@/utils/locale";
import {
  GAME_DEALS_TOPIC_METADATA,
  WOOL_TOPIC_METADATA,
} from "@/config/site-metadata.mjs";
import { sourceBelongsToCategory } from "@/utils/categoryTree";
import { getSourceDisplayLabel } from "@/utils/sourceLabels";

const store = mainStore();
const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const enableCardEntrance = ref(true);
const isCardDragging = ref(false);
const isSubtypeInteracting = ref(false);
const sortableNews = ref([]);
const renderNews = computed(() => {
  return store.newsArr
    .filter((item) => item.show)
    .sort((a, b) => a.order - b.order);
});
const forcedCategoryName = computed(() =>
  getCategoryNameBySlug(route.params?.categorySlug, store.categories),
);
const isHomeRoute = computed(() =>
  ["home", "home-locale"].includes(String(route.name || "")),
);
const isCategoryRoute = computed(() =>
  ["category", "category-locale"].includes(String(route.name || "")),
);
const supportsViewMode = computed(
  () => isHomeRoute.value || isCategoryRoute.value,
);
const categoryView = computed(() =>
  store.resolveCategoryViewMode(
    isCategoryRoute.value ? forcedCategoryName.value || null : null,
  ),
);
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const currentCategory = computed(() =>
  store.categories.find((item) => item.name === forcedCategoryName.value) || null,
);
const categoryChildren = (categoryId) =>
  store.categories
    .filter((item) => String(item.parentId || "") === String(categoryId || ""))
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
const categoryNavigation = computed(() => {
  if (!isCategoryRoute.value || !currentCategory.value) return null;
  const current = currentCategory.value;
  const ownChildren = categoryChildren(current.id);
  const parent = current.parentId
    ? store.categories.find((item) => String(item.id) === String(current.parentId)) || null
    : null;
  const scopeRoot = ownChildren.length ? current : parent || current;
  const topLevel = store.categories
    .filter((item) => !item.parentId)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  const options = ownChildren.length || parent
    ? [scopeRoot, ...categoryChildren(scopeRoot.id)]
    : topLevel;
  const showScopeAll = Boolean(ownChildren.length || parent);
  const breadcrumbs = [];
  let cursor = current;
  const seen = new Set();
  while (cursor && !seen.has(cursor.id)) {
    breadcrumbs.unshift(cursor);
    seen.add(cursor.id);
    cursor = cursor.parentId
      ? store.categories.find((item) => String(item.id) === String(cursor.parentId)) || null
      : null;
  }
  return { current, scopeRoot, options, breadcrumbs, showScopeAll };
});
const categoryLabelFor = (item) =>
  item?.labels?.[locale.value] || getCategoryLabel(item?.name || "", locale.value) || item?.name || "";
const categoryPath = (item) => buildCategoryPath(locale.value, item?.slug || "");
const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "").trim();
const searchQuery = computed(() => queryValue(route.query.q).toLowerCase());
const sourceMatchesSearch = (item) => {
  const query = searchQuery.value;
  if (!query) return true;
  const categoryNames = Array.isArray(item.categoryIds)
    ? item.categoryIds
        .map((id) => store.categories.find((category) => category.id === id)?.name)
        .filter(Boolean)
    : [];
  const haystack = [
    item.name,
    item.label,
    item.category,
    item.subtype,
    ...categoryNames,
    getSourceDisplayLabel(item.name, locale.value, item.label || item.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
};
const isWoolCategory = computed(() => forcedCategoryName.value === "羊毛");
const isGamesCategory = computed(() => forcedCategoryName.value === "游戏");
const gameDealsTopicCopy = computed(
  () =>
    GAME_DEALS_TOPIC_METADATA[locale.value] ||
    GAME_DEALS_TOPIC_METADATA["zh-CN"],
);
const gameDealsTopicPath = computed(() =>
  buildFixedLocalePath(locale.value, "/topic/game-deals"),
);
const woolTopicCopy = computed(
  () => WOOL_TOPIC_METADATA[locale.value] || WOOL_TOPIC_METADATA["zh-CN"],
);
const woolTopicPath = computed(() =>
  buildFixedLocalePath(locale.value, "/topic/wool"),
);
const scopedNews = computed(() => {
  let scoped = renderNews.value;
  if (forcedCategoryName.value) {
    scoped = scoped.filter((item) =>
      sourceBelongsToCategory(item, forcedCategoryName.value, store.categories),
    );
  } else if (store.categoryEnabled && store.activeCategory !== "全部") {
    scoped = scoped.filter((item) =>
      sourceBelongsToCategory(item, store.activeCategory, store.categories),
    );
  }
  return scoped;
});
const filteredNews = computed(() =>
  categoryView.value === "card"
    ? scopedNews.value.filter(sourceMatchesSearch)
    : scopedNews.value,
);
const syncSortableNews = () => {
  sortableNews.value = filteredNews.value.slice();
};
const cardDragDisabled = computed(() => isSubtypeInteracting.value);
let subtypeInteractionTimer = null;

watch(
  () => filteredNews.value.map((item) => item.name).join("|"),
  () => {
    if (!isCardDragging.value) syncSortableNews();
  },
  { immediate: true },
);

onMounted(() => {
  window.setTimeout(() => {
    enableCardEntrance.value = false;
  }, 400);
  window.addEventListener(
    "dailyhot:subtype-interaction",
    handleSubtypeInteraction,
  );
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "dailyhot:subtype-interaction",
    handleSubtypeInteraction,
  );
  if (subtypeInteractionTimer) clearTimeout(subtypeInteractionTimer);
});

const handleSubtypeInteraction = (event) => {
  if (subtypeInteractionTimer) {
    clearTimeout(subtypeInteractionTimer);
    subtypeInteractionTimer = null;
  }
  if (event?.detail?.active) {
    isSubtypeInteracting.value = true;
    return;
  }
  subtypeInteractionTimer = window.setTimeout(() => {
    isSubtypeInteracting.value = false;
    subtypeInteractionTimer = null;
  }, 120);
};

const startCardDrag = () => {
  isCardDragging.value = true;
  enableCardEntrance.value = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("dailyhot:hide-item-preview"));
  }
};

const saveCardOrder = () => {
  const scopedNames = filteredNews.value.map((item) => item.name);
  const orderedNames = sortableNews.value.map((item) => item.name);
  store.reorderVisibleNews(orderedNames, scopedNames);
  isCardDragging.value = false;
  syncSortableNews();
};

// 重置
const reset = () => {
  $dialog.warning({
    title: t("home.resetTitle"),
    content: t("home.resetContent"),
    positiveText: t("home.resetConfirm"),
    negativeText: t("home.resetCancel"),
    onPositiveClick: () => {
      if (typeof window !== "undefined") {
        if (window.$timeInterval) clearInterval(window.$timeInterval);
        if (window.$autoRefreshTimer) clearInterval(window.$autoRefreshTimer);
      }
      localStorage.clear();
      location.reload();
    },
  });
};
</script>

<style lang="scss" scoped>
.home {
  .category-context-nav {
    --ccn-panel: #fff;
    --ccn-action: rgba(31, 34, 37, .045);
    --ccn-border: rgba(31, 34, 37, .12);
    --ccn-text: rgba(31, 34, 37, .92);
    --ccn-text-2: rgba(31, 34, 37, .72);
    --ccn-text-3: rgba(31, 34, 37, .56);
    display: grid;
    gap: 8px;
    margin-bottom: 14px;
    padding: 10px 12px;
    border: 1px solid var(--ccn-border);
    border-radius: 12px;
    background: var(--ccn-panel);
  }
  .category-context-nav.is-dark {
    --ccn-panel: #18181c;
    --ccn-action: rgba(255, 255, 255, .065);
    --ccn-border: rgba(255, 255, 255, .13);
    --ccn-text: rgba(255, 255, 255, .92);
    --ccn-text-2: rgba(255, 255, 255, .72);
    --ccn-text-3: rgba(255, 255, 255, .54);
  }
  .category-context-nav__crumbs {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--ccn-text-3);
    font-size: 11px;
  }
  .category-context-nav__crumbs a {
    color: inherit;
    text-decoration: none;
  }
  .category-context-nav__crumbs a:last-of-type {
    color: var(--ccn-text);
    font-weight: 650;
  }
  .category-context-nav__tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .category-context-nav__tabs::-webkit-scrollbar { display: none; }
  .category-context-nav__tab {
    flex: 0 0 auto;
    padding: 6px 10px;
    border-radius: 999px;
    color: var(--ccn-text-2);
    font-size: 12px;
    font-weight: 620;
    line-height: 1;
    text-decoration: none;
    transition: background-color .15s ease, color .15s ease;
  }
  .category-context-nav__tab:hover {
    background: var(--ccn-action);
    color: var(--ccn-text);
  }
  .category-context-nav__tab.active {
    background: color-mix(in srgb, #ea444d 12%, var(--ccn-action));
    color: #ea444d;
  }

  .wool-topic-entry {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
    padding: 17px 20px;
    border: 1px solid var(--n-border-color);
    border-radius: 12px;
    color: var(--n-text-color);
    text-decoration: none;
  }
  .wool-topic-entry span,
  .wool-topic-entry p,
  .wool-topic-entry em {
    color: var(--n-text-color-3);
  }
  .wool-topic-entry span {
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .wool-topic-entry strong {
    display: block;
    font-size: 16px;
  }
  .wool-topic-entry p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.5;
  }
  .wool-topic-entry em {
    flex: 0 0 auto;
    font-size: 12px;
    font-style: normal;
    white-space: nowrap;
  }

  .news-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 24px;

    &.is-compact {
      gap: 14px;
    }
  }

  .news-card.with-entrance {
    opacity: 0;
    transform: translateY(20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
    animation: cardShow 0.3s forwards ease-in-out;
  }
  .tip {
    font-size: 22px;
  }

  .news-card-ghost {
    opacity: 0.72;
  }

  .news-card-chosen,
  .news-card-drag {
    cursor: grabbing;
  }
}

@media (max-width: 559px) {
  .home .wool-topic-entry {
    align-items: flex-start;
    padding: 14px 15px;
  }
  .home .wool-topic-entry p {
    display: none;
  }
}

@media (min-width: 560px) {
  .home .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 800px) {
  .home .news-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .home .news-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1500px) {
  .home .news-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

// 出现动画
@keyframes cardShow {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
