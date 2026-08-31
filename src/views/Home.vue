<template>
  <div class="home">
    <nav
      v-if="categoryTrail.length > 1 || childCategories.length"
      class="category-subnav"
      aria-label="分类导航"
    >
      <div class="category-breadcrumb">
        <router-link
          v-for="item in categoryTrail"
          :key="item.id"
          :to="categoryPath(item)"
          >{{ categoryLabel(item) }}</router-link
        >
      </div>
      <div v-if="childCategories.length" class="category-children">
        <router-link
          v-for="item in childCategories"
          :key="item.id"
          :to="categoryPath(item)"
          >{{ categoryLabel(item) }}</router-link
        >
      </div>
    </nav>
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
    <draggable
      v-if="sortableNews[0]"
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
          <HotList :hotData="item" :eager-load="Boolean(forcedCategoryName)" />
        </div>
      </template>
    </draggable>
    <div class="error" v-if="renderNews[0] && sortableNews.length === 0">
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
import { WOOL_TOPIC_METADATA } from "@/config/site-metadata.mjs";
import { sourceBelongsToCategory } from "@/utils/categoryTree";

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
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const currentCategory = computed(
  () =>
    store.categories.find((item) => item.name === forcedCategoryName.value) ||
    null,
);
const childCategories = computed(() =>
  currentCategory.value
    ? store.categories
        .filter((item) => item.parentId === currentCategory.value.id)
        .sort((a, b) => a.order - b.order)
    : [],
);
const categoryTrail = computed(() => {
  const result = [];
  const seen = new Set();
  let node = currentCategory.value;
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    result.unshift(node);
    node = node.parentId
      ? store.categories.find((item) => item.id === node.parentId)
      : null;
  }
  return result;
});
const categoryLabel = (item) =>
  item.builtin ? getCategoryLabel(item.name, locale.value) : item.name;
const categoryPath = (item) => buildCategoryPath(locale.value, item.slug);
const isWoolCategory = computed(() => forcedCategoryName.value === "羊毛");
const woolTopicCopy = computed(
  () => WOOL_TOPIC_METADATA[locale.value] || WOOL_TOPIC_METADATA["zh-CN"],
);
const woolTopicPath = computed(() =>
  buildFixedLocalePath(locale.value, "/topic/wool"),
);
const filteredNews = computed(() => {
  if (forcedCategoryName.value) {
    return renderNews.value.filter((item) =>
      sourceBelongsToCategory(item, forcedCategoryName.value, store.categories),
    );
  }
  if (!store.categoryEnabled || store.activeCategory === "全部") {
    return renderNews.value;
  }
  return renderNews.value.filter((item) =>
    sourceBelongsToCategory(item, store.activeCategory, store.categories),
  );
});
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

.category-subnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  min-width: 0;
}
.category-breadcrumb,
.category-children {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.category-breadcrumb::-webkit-scrollbar,
.category-children::-webkit-scrollbar {
  display: none;
}
.category-breadcrumb a,
.category-children a {
  flex: 0 0 auto;
  padding: 5px 9px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 8px;
  color: var(--n-text-color-2, #555);
  font-size: 12px;
  text-decoration: none;
}
.category-breadcrumb a:last-child {
  color: var(--n-text-color, #222);
  font-weight: 650;
}
@media (max-width: 680px) {
  .category-subnav {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
