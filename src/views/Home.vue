<template>
  <div class="home">
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <n-grid
      v-if="filteredNews[0]"
      cols="1 560:2 800:3 1100:4 1500:5"
      :x-gap="store.compactMode ? 14 : 24"
      :y-gap="store.compactMode ? 14 : 24"
    >
      <n-grid-item
        class="news-card"
        :class="{ 'with-entrance': enableCardEntrance }"
        v-for="(item, index) in filteredNews"
        :key="`${store.activeCategory}-${item.name}`"
        :style="{ animationDelay: index / 10 + 0.2 + 's' }"
      >
        <HotList :hotData="item" :eager-load="Boolean(forcedCategoryName)" />
      </n-grid-item>
    </n-grid>
    <div class="error" v-if="renderNews[0] && filteredNews.length === 0">
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
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { getCategoryNameBySlug } from "@/utils/locale";

const store = mainStore();
const { t } = useI18n({ useScope: "global" });
const route = useRoute();
const enableCardEntrance = ref(true);
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

onMounted(() => {
  window.setTimeout(() => {
    enableCardEntrance.value = false;
  }, 400);
});

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
  .news-card.with-entrance {
    opacity: 0;
    transform: translateY(20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
    animation: cardShow 0.3s forwards ease-in-out;
  }
  .tip {
    font-size: 22px;
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
