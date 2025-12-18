<template>
  <div class="home">
    <!-- <n-alert type="info" :show-icon="false" style="margin-bottom: 20px">
      站点未完工
    </n-alert> -->
    <n-grid
      v-if="visibleNews[0]"
      cols="1 560:2 800:3 1100:4 1500:5"
      :x-gap="store.compactMode ? 14 : 24"
      :y-gap="store.compactMode ? 14 : 24"
    >
      <n-grid-item
        class="news-card"
        v-for="(item, index) in visibleNews"
        :key="item"
        :style="{ animationDelay: index / 10 + 0.2 + 's' }"
      >
        <HotList :hotData="item" />
      </n-grid-item>
    </n-grid>
    <div class="error" v-else>
      <n-divider dashed class="tip"> 此处暂无内容 </n-divider>
      <n-space justify="center">
        <n-button size="large" secondary strong @click="reset">
          出错了？点此重置
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import HotList from "@/components/HotList.vue";

const store = mainStore();
const visibleNews = computed(() => {
  const categoryOn = store.categoryEnabled;
  const current = store.activeCategory;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) => !store.unavailableSources.includes(item.name))
    .filter((item) =>
      categoryOn && current !== "全部" ? item.category === current : true
    )
    .sort((a, b) => a.order - b.order);
});

// 重置
const reset = () => {
  $dialog.warning({
    title: "重置站点",
    content:
      "确认重置站点？你的自定义数据将会恢复为默认状态！（当设置页面能正常进入并显示时请不要执行此操作！）",
    positiveText: "重置",
    negativeText: "取消",
    onPositiveClick: () => {
      if ($timeInterval) clearInterval($timeInterval);
      if (typeof $autoRefreshTimer !== "undefined") clearInterval($autoRefreshTimer);
      localStorage.clear();
      location.reload();
    },
  });
};
</script>

<style lang="scss" scoped>
.home {
  .news-card {
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
