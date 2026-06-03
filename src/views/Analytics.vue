<template>
  <div class="analytics">
    <div class="title-row">
      <div>
        <div class="title">数据统计</div>
        <n-text depth="3">匿名访问与点击行为面板，用于默认排序与增长判断。</n-text>
      </div>
      <n-space>
        <n-select
          v-model:value="days"
          :options="dayOptions"
          size="small"
          style="width: 120px"
        />
        <n-button size="small" type="primary" @click="loadDashboard">刷新</n-button>
      </n-space>
    </div>

    <n-grid cols="1 800:4" :x-gap="14" :y-gap="14">
      <n-grid-item v-for="item in overviewCards" :key="item.label">
        <n-card>
          <n-text depth="3">{{ item.label }}</n-text>
          <div class="metric">{{ item.value }}</div>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid cols="1 900:2" :x-gap="14" :y-gap="14" style="margin-top: 14px">
      <n-grid-item>
        <n-card title="首页默认排序建议">
          <template #header-extra>
            <n-button
              size="small"
              tertiary
              :disabled="!dashboard?.recommendedHomeOrder?.length"
              @click="applyRecommendedOrder"
            >
              应用到首页排序
            </n-button>
          </template>
          <n-list v-if="dashboard?.recommendedHomeOrder?.length">
            <n-list-item
              v-for="(item, index) in dashboard.recommendedHomeOrder.slice(0, 15)"
              :key="item.source"
            >
              <n-space justify="space-between" style="width: 100%">
                <n-text>{{ index + 1 }}. {{ sourceLabel(item.source) }}</n-text>
                <n-text depth="3">{{ item.clicks }} 点击</n-text>
              </n-space>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无点击数据" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="来源入口">
          <n-list v-if="dashboard?.entries?.length">
            <n-list-item v-for="item in dashboard.entries.slice(0, 10)" :key="item.entry">
              <n-space justify="space-between" style="width: 100%">
                <n-text>{{ item.entry }}</n-text>
                <n-text depth="3">PV {{ item.pv }} / UV {{ item.uv }}</n-text>
              </n-space>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无来源入口数据" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="每日流量">
          <n-list v-if="dashboard?.daily?.length">
            <n-list-item v-for="item in dashboard.daily.slice(0, 14)" :key="item.day">
              <n-space justify="space-between" style="width: 100%">
                <n-text>{{ item.day }}</n-text>
                <n-text depth="3">PV {{ item.pv }} / UV {{ item.uv }} / IP {{ item.dailyIp }}</n-text>
              </n-space>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无流量数据" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="分类画像">
          <n-list v-if="dashboard?.categories?.length">
            <n-list-item
              v-for="item in dashboard.categories.slice(0, 10)"
              :key="item.category"
            >
              <n-space justify="space-between" style="width: 100%">
                <n-text>{{ item.category }}</n-text>
                <n-text depth="3">PV {{ item.pv }} / UV {{ item.uv }}</n-text>
              </n-space>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无分类数据" />
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup>
import { getAnalyticsDashboard } from "@/api";
import { mainStore } from "@/store";

const store = mainStore();
const days = ref(30);
const dashboard = ref(null);

const dayOptions = [
  { label: "近 7 天", value: 7 },
  { label: "近 30 天", value: 30 },
  { label: "近 90 天", value: 90 },
];

const sourceLabel = (source) =>
  store.newsArr.find((item) => item.name === source)?.label || source;

const overviewCards = computed(() => [
  { label: "总事件", value: dashboard.value?.overview?.events || 0 },
  { label: "页面浏览", value: dashboard.value?.overview?.pageViews || 0 },
  { label: "独立访客", value: dashboard.value?.overview?.uniqueVisitors || 0 },
  { label: "统计窗口", value: `${days.value} 天` },
]);

const loadDashboard = async () => {
  const result = await getAnalyticsDashboard(days.value);
  dashboard.value = result.dashboard || null;
  store.setAnalyticsRecommendedOrder(dashboard.value?.recommendedHomeOrder || []);
};

const applyRecommendedOrder = () => {
  const order = dashboard.value?.recommendedHomeOrder || [];
  if (!order.length) {
    $message.warning("暂无可应用的排序建议");
    return;
  }
  const clickMap = new Map(order.map((item, index) => [item.source, index]));
  const fallbackOrder = new Map(store.defaultNewsArr.map((item) => [item.name, item.order]));
  store.newsArr = store.newsArr
    .slice()
    .sort((a, b) => {
      const ai = clickMap.has(a.name) ? clickMap.get(a.name) : 10_000 + (fallbackOrder.get(a.name) || 0);
      const bi = clickMap.has(b.name) ? clickMap.get(b.name) : 10_000 + (fallbackOrder.get(b.name) || 0);
      return ai - bi;
    })
    .map((item, index) => ({ ...item, order: index }));
  $message.success("已按统计推荐顺序更新首页默认排序");
};

onMounted(() => {
  loadDashboard();
});
</script>

<style lang="scss" scoped>
.analytics {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .title {
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .metric {
    margin-top: 10px;
    font-size: 28px;
    font-weight: 700;
  }
}
</style>
