<template>
  <Teleport to="body">
    <Transition name="consent-fade">
      <div v-if="visible" class="analytics-consent-shell">
        <div
          class="analytics-consent"
          :style="consentThemeVars"
        >
          <div class="copy">
            <span class="eyebrow">
              Cookie 与统计偏好
            </span>
            <p class="title">
              站点基础功能与统计分析始终启用，广告个性化与营销追踪由你决定。
            </p>
            <p class="desc">
              我们会保留必要功能与匿名统计，用于站点运维、内容优化和质量判断；广告个性化、营销追踪与增强受众能力仅在你同意后启用。
            </p>
          </div>

          <div class="actions">
            <n-button tertiary @click="acceptRequiredOnly">
              拒绝广告相关
            </n-button>
            <n-button tertiary @click="detailsOpen = !detailsOpen">
              {{ detailsOpen ? "收起设置" : "高级设置" }}
            </n-button>
            <n-button type="primary" @click="acceptAll">同意全部</n-button>
          </div>

          <Transition name="details-expand">
            <div
              v-if="detailsOpen"
              class="details"
              role="region"
              aria-label="Cookie 详细设置"
            >
              <div class="groups">
                <div class="group locked">
                  <div>
                    <div class="group-title">必要功能</div>
                    <p class="group-desc">
                      维持站点基础运行、主题设置、缓存与页面访问。
                    </p>
                  </div>
                  <n-switch :value="true" disabled />
                </div>
                <div class="group locked">
                  <div>
                    <div class="group-title">统计分析</div>
                    <p class="group-desc">
                      用于 PV / UV / 来源入口 / 点击率分析，也是站点运维与内容优化的基础依据。
                    </p>
                  </div>
                  <div class="group-side">
                    <n-tag size="small" type="info" round>始终开启</n-tag>
                    <n-switch :value="true" disabled />
                  </div>
                </div>
                <div class="group">
                  <div>
                    <div class="group-title">广告归因与营销追踪</div>
                    <p class="group-desc">
                      用于广告转化归因、营销追踪与投放效果衡量；关闭后仍可展示非个性化或上下文广告。
                    </p>
                  </div>
                  <n-switch v-model:value="draftConsent.ad_storage" />
                </div>
                <div class="group">
                  <div>
                    <div class="group-title">广告个性化与扩展受众</div>
                    <p class="group-desc">
                      用于更精准的个性化广告、扩展受众能力与更细粒度的投放策略。
                    </p>
                  </div>
                  <n-switch v-model:value="draftConsent.ad_personalization" />
                </div>
              </div>

              <div class="details-footer">
                <p class="footer-text">
                  你也可以稍后在“设置 > 统计与隐私”中重新调整广告相关偏好。
                </p>
                <n-space wrap justify="end">
                  <n-button tertiary @click="acceptRequiredOnly">
                    拒绝广告相关
                  </n-button>
                  <n-button tertiary @click="acceptSelected">
                    保存当前选择
                  </n-button>
                  <n-button text tag="a" href="/privacy">
                    隐私说明
                  </n-button>
                </n-space>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { mainStore } from "@/store";
import {
  CONSENT_CATEGORIES,
  DEFAULT_CONSENT,
  getAnalyticsConsent,
  OPEN_CONSENT_EVENT,
  setAnalyticsConsent,
} from "@/utils/analytics";
import { trackEvent } from "@/utils/track";
import {
  grantAnalyticsConsentToVendors,
  initAnalyticsVendors,
} from "@/utils/vendorAnalytics";

const store = mainStore();
const isDarkTheme = computed(() => store.siteTheme === "dark");
const consentThemeVars = computed(() => ({
  "--consent-bg": isDarkTheme.value
    ? "rgba(24, 26, 32, 0.9)"
    : "rgba(255, 255, 255, 0.94)",
  "--consent-border": isDarkTheme.value
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(15, 23, 42, 0.08)",
  "--consent-shadow": isDarkTheme.value
    ? "0 22px 55px rgba(0, 0, 0, 0.34)"
    : "0 20px 55px rgba(15, 23, 42, 0.16)",
  "--consent-copy": isDarkTheme.value ? "#f8fafc" : "#0f172a",
  "--consent-eyebrow": isDarkTheme.value
    ? "rgba(226, 232, 240, 0.7)"
    : "#64748b",
  "--consent-title": isDarkTheme.value ? "#f8fafc" : "#0f172a",
  "--consent-desc": isDarkTheme.value
    ? "rgba(226, 232, 240, 0.78)"
    : "#475569",
  "--consent-group-bg": isDarkTheme.value
    ? "rgba(255, 255, 255, 0.04)"
    : "rgba(15, 23, 42, 0.04)",
  "--consent-group-locked": isDarkTheme.value
    ? "rgba(34, 197, 94, 0.14)"
    : "rgba(34, 197, 94, 0.08)",
}));

const visible = computed(
  () => !store.analyticsPromptDismissed
);

const detailsOpen = ref(false);

const createDraft = (source = {}) => ({
  ...DEFAULT_CONSENT,
  ...source,
  [CONSENT_CATEGORIES.analytics]: true,
});

const draftConsent = reactive(
  createDraft({
    [CONSENT_CATEGORIES.adStorage]: false,
    [CONSENT_CATEGORIES.adUserData]: false,
    [CONSENT_CATEGORIES.adPersonalization]: false,
  })
);

const applyConsent = (consent) => {
  const normalized = createDraft(consent);
  normalized[CONSENT_CATEGORIES.analytics] = true;
  normalized[CONSENT_CATEGORIES.adUserData] =
    normalized[CONSENT_CATEGORIES.adStorage] ||
    normalized[CONSENT_CATEGORIES.adUserData];
  store.setAnalyticsConsent(normalized);
  store.setAnalyticsPromptDismissed(true);
  setAnalyticsConsent(normalized);
  initAnalyticsVendors();
  grantAnalyticsConsentToVendors(normalized);
  trackEvent({
    event: "consent_update",
    category: "privacy",
    consent:
      normalized[CONSENT_CATEGORIES.adStorage] ||
      normalized[CONSENT_CATEGORIES.adPersonalization]
        ? "ad_consent_enabled"
        : "ad_consent_denied",
    meta: normalized,
  });
};

const acceptAll = () => {
  applyConsent({
    [CONSENT_CATEGORIES.adStorage]: true,
    [CONSENT_CATEGORIES.adUserData]: true,
    [CONSENT_CATEGORIES.adPersonalization]: true,
  });
};

const acceptRequiredOnly = () => {
  applyConsent({
    [CONSENT_CATEGORIES.adStorage]: false,
    [CONSENT_CATEGORIES.adUserData]: false,
    [CONSENT_CATEGORIES.adPersonalization]: false,
  });
};

const acceptSelected = () => {
  applyConsent(draftConsent);
};

const openDetails = () => {
  detailsOpen.value = true;
  if (!store.analyticsPromptDismissed) return;
  Object.assign(draftConsent, createDraft(store.analyticsConsent || {}));
  store.setAnalyticsPromptDismissed(false);
};

watch(
  () => draftConsent.ad_storage,
  (enabled) => {
    if (!enabled) {
      draftConsent.ad_user_data = false;
      draftConsent.ad_personalization = false;
    }
  }
);

watch(
  () => draftConsent.ad_personalization,
  (enabled) => {
    draftConsent.ad_user_data = enabled;
    if (enabled) {
      draftConsent.ad_storage = true;
    }
  }
);

onMounted(() => {
  initAnalyticsVendors();
  const stored = getAnalyticsConsent();
  if (stored) {
    store.setAnalyticsConsent(stored);
    store.setAnalyticsPromptDismissed(true);
    grantAnalyticsConsentToVendors(stored);
    Object.assign(draftConsent, createDraft(stored));
  } else {
    grantAnalyticsConsentToVendors(DEFAULT_CONSENT);
  }
  if (typeof window !== "undefined") {
    window.addEventListener(OPEN_CONSENT_EVENT, openDetails);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener(OPEN_CONSENT_EVENT, openDetails);
  }
});
</script>

<style lang="scss" scoped>
.analytics-consent-shell {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 16px;
  pointer-events: none;
}

.analytics-consent {
  width: min(880px, calc(100vw - 24px));
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--consent-bg);
  border: 1px solid var(--consent-border);
  box-shadow: var(--consent-shadow);
  backdrop-filter: blur(14px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px 16px;
  align-items: end;
  pointer-events: auto;
}

.copy {
  display: grid;
  gap: 4px;
  color: var(--consent-copy);
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--consent-eyebrow) !important;
}

.title {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--consent-title) !important;
}

.desc {
  line-height: 1.6;
  color: var(--consent-desc) !important;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
  align-self: center;
}

.details {
  grid-column: 1 / -1;
  border-top: 1px solid rgb(15 23 42 / 0.08);
  padding-top: 14px;
  display: grid;
  gap: 14px;
}

.groups {
  display: grid;
  gap: 10px;
}

.group {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--consent-group-bg);
}

.group.locked {
  background: var(--consent-group-locked);
}

.group-side {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-title {
  font-weight: 600;
  color: var(--consent-title) !important;
}

.group-desc {
  display: block;
  margin-top: 4px;
  line-height: 1.5;
  color: var(--consent-desc) !important;
}

.details-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.footer-text {
  max-width: 420px;
  line-height: 1.6;
  color: var(--consent-desc) !important;
}

.consent-fade-enter-active,
.consent-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.consent-fade-enter-from,
.consent-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.details-expand-enter-active,
.details-expand-leave-active {
  transition: opacity 0.18s ease, max-height 0.18s ease;
  overflow: hidden;
}

.details-expand-enter-from,
.details-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.details-expand-enter-to,
.details-expand-leave-from {
  opacity: 1;
  max-height: 600px;
}

@media (max-width: 768px) {
  .analytics-consent-shell {
    padding: 10px;
  }

  .analytics-consent {
    width: calc(100vw - 20px);
    border-radius: 16px;
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: stretch;
  }

  .actions :deep(.n-button) {
    flex: 1 1 calc(50% - 5px);
  }

  .details-footer,
  .group {
    flex-direction: column;
    align-items: flex-start;
  }

  .group-side {
    width: 100%;
    justify-content: space-between;
  }

  .footer-text {
    max-width: none;
  }
}
</style>
