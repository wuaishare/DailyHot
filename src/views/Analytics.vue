<template>
  <div class="analytics">
    <div class="title-row">
      <div>
        <div class="title">{{ t("analyticsPage.title") }}</div>
        <n-text depth="3">
          {{ t("analyticsPage.description") }}
        </n-text>
      </div>
      <n-space v-if="authorized">
        <n-select
          v-model:value="days"
          :options="dayOptions"
          size="small"
          style="width: 120px"
        />
        <n-button size="small" type="primary" @click="loadDashboard">{{ t("analyticsPage.refresh") }}</n-button>
        <n-button size="small" tertiary @click="logout">{{ t("analyticsPage.logout") }}</n-button>
      </n-space>
    </div>

    <n-card v-if="!authorized" class="auth-card">
      <n-space vertical>
        <n-text>{{ t("analyticsPage.enterToken") }}</n-text>
        <n-input
          v-model:value="adminTokenInput"
          type="password"
          show-password-on="click"
          placeholder="Analytics Admin Token"
        />
        <n-space>
          <n-button type="primary" @click="login">{{ t("analyticsPage.enterPanel") }}</n-button>
        </n-space>
      </n-space>
    </n-card>

    <template v-else>
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
          <n-card :title="t('analyticsPage.homeOrder')">
            <n-list v-if="dashboard?.recommendedHomeOrder?.length">
              <n-list-item
                v-for="(item, index) in dashboard.recommendedHomeOrder.slice(0, 15)"
                :key="item.source"
              >
                <n-space justify="space-between" style="width: 100%">
                  <n-text>{{ index + 1 }}. {{ sourceLabel(item.source) }}</n-text>
                  <n-text depth="3">{{ t("analyticsPage.clicks", { count: item.clicks }) }}</n-text>
                </n-space>
              </n-list-item>
            </n-list>
            <n-empty v-else :description="t('analyticsPage.emptyClicks')" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card :title="t('analyticsPage.entries')">
            <n-list v-if="dashboard?.entries?.length">
              <n-list-item v-for="item in dashboard.entries.slice(0, 10)" :key="item.entry">
                <n-space justify="space-between" style="width: 100%">
                  <n-text>{{ item.entry }}</n-text>
                  <n-text depth="3">PV {{ item.pv }} / UV {{ item.uv }}</n-text>
                </n-space>
              </n-list-item>
            </n-list>
            <n-empty v-else :description="t('analyticsPage.emptyEntries')" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card :title="t('analyticsPage.dailyTraffic')">
            <n-list v-if="dashboard?.daily?.length">
              <n-list-item v-for="item in dashboard.daily.slice(0, 14)" :key="item.day">
                <n-space justify="space-between" style="width: 100%">
                  <n-text>{{ item.day }}</n-text>
                  <n-text depth="3">{{ t("analyticsPage.dailyStats", { pv: item.pv, uv: item.uv, ip: item.dailyIp }) }}</n-text>
                </n-space>
              </n-list-item>
            </n-list>
            <n-empty v-else :description="t('analyticsPage.emptyTraffic')" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card :title="t('analyticsPage.categories')">
            <n-list v-if="dashboard?.categories?.length">
              <n-list-item
                v-for="item in dashboard.categories.slice(0, 10)"
                :key="item.category"
              >
                <n-space justify="space-between" style="width: 100%">
                  <n-text>{{ item.category }}</n-text>
                  <n-text depth="3">{{ t("analyticsPage.categoryStats", { pv: item.pv, uv: item.uv }) }}</n-text>
                </n-space>
              </n-list-item>
            </n-list>
            <n-empty v-else :description="t('analyticsPage.emptyCategories')" />
          </n-card>
        </n-grid-item>
      </n-grid>
    </template>
  </div>
</template>

<script setup>
import { getAnalyticsDashboard } from "@/api";
import { getAdminToken, setAdminToken } from "@/utils/adminAuth";
import { mainStore } from "@/store";
import { useI18n } from "vue-i18n";
import { getSourceLabel } from "@/utils/sourceLabels";

const store = mainStore();
const { locale, t } = useI18n({ useScope: "global" });
const days = ref(30);
const dashboard = ref(null);
const authorized = ref(Boolean(getAdminToken()));
const adminTokenInput = ref(getAdminToken());

const dayOptions = computed(() => [
  { label: t("analyticsPage.last7"), value: 7 },
  { label: t("analyticsPage.last30"), value: 30 },
  { label: t("analyticsPage.last90"), value: 90 },
]);

const sourceLabel = (source) =>
  getSourceLabel(
    source,
    locale.value,
    store.newsArr.find((item) => item.name === source)?.label || source
  );

const overviewCards = computed(() => [
  { label: t("analyticsPage.totalEvents"), value: dashboard.value?.overview?.events || 0 },
  { label: t("analyticsPage.pageViews"), value: dashboard.value?.overview?.pageViews || 0 },
  { label: t("analyticsPage.uniqueVisitors"), value: dashboard.value?.overview?.uniqueVisitors || 0 },
  { label: t("analyticsPage.window"), value: t("analyticsPage.windowDays", { days: days.value }) },
]);

const loadDashboard = async () => {
  try {
    const result = await getAnalyticsDashboard(days.value);
    if (result.message === "Unauthorized") {
      authorized.value = false;
      dashboard.value = null;
      return;
    }
    dashboard.value = result.dashboard || null;
    store.setAnalyticsRecommendedOrder(dashboard.value?.recommendedHomeOrder || []);
  } catch {
    authorized.value = false;
    dashboard.value = null;
  }
};

const login = async () => {
  setAdminToken(adminTokenInput.value.trim());
  authorized.value = Boolean(getAdminToken());
  if (!authorized.value) {
    $message.warning(t("analyticsPage.tokenRequired"));
    return;
  }
  await loadDashboard();
  if (!dashboard.value) {
    $message.error(t("analyticsPage.tokenInvalid"));
  }
};

const logout = () => {
  setAdminToken("");
  adminTokenInput.value = "";
  authorized.value = false;
  dashboard.value = null;
};

onMounted(() => {
  if (authorized.value) {
    loadDashboard();
  }
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

  .auth-card {
    max-width: 520px;
  }
}
</style>
