<template>
  <div class="home">
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
      <n-divider dashed class="tip"> {{ t("common.emptyCategory") }} </n-divider>
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
import { getCategoryNameBySlug } from "@/utils/locale";

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
const forcedCategoryName = computed(() => getCategoryNameBySlug(route.params?.categorySlug));
const filteredNews = computed(() => {
  if (forcedCategoryName.value) {
    return renderNews.value.filter((item) => item.category === forcedCategoryName.value);
  }
  if (!store.categoryEnabled || store.activeCategory === "全部") {
    return renderNews.value;
  }
  return renderNews.value.filter((item) => item.category === store.activeCategory);
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
  { immediate: true }
);

onMounted(() => {
  window.setTimeout(() => {
    enableCardEntrance.value = false;
  }, 400);
  window.addEventListener("dailyhot:subtype-interaction", handleSubtypeInteraction);
});

onBeforeUnmount(() => {
  window.removeEventListener("dailyhot:subtype-interaction", handleSubtypeInteraction);
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
