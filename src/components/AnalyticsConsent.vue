<template>
  <Teleport to="body">
    <Transition name="consent-fade">
      <div v-if="visible" class="analytics-consent">
        <div class="content">
          <div class="copy">
            <n-text class="title">Cookie 与统计偏好</n-text>
            <n-text depth="3" class="desc">
              我们使用必要功能保持网站正常运行；在你同意后，才会启用统计分析与广告相关功能。
            </n-text>
          </div>

          <div class="groups">
            <div class="group">
              <div>
                <n-text class="group-title">必要功能</n-text>
                <n-text depth="3" class="group-desc">维持站点基础运行，始终开启。</n-text>
              </div>
              <n-switch :value="true" disabled />
            </div>
            <div class="group">
              <div>
                <n-text class="group-title">统计分析</n-text>
                <n-text depth="3" class="group-desc">用于 PV / UV / 来源入口 / 点击率分析。</n-text>
              </div>
              <n-switch v-model:value="draftConsent.analytics" />
            </div>
            <div class="group">
              <div>
                <n-text class="group-title">广告归因</n-text>
                <n-text depth="3" class="group-desc">用于广告转化归因与投放效果衡量。</n-text>
              </div>
              <n-switch v-model:value="draftConsent.ad_storage" />
            </div>
            <div class="group">
              <div>
                <n-text class="group-title">广告个性化</n-text>
                <n-text depth="3" class="group-desc">用于个性化广告与相关受众能力。</n-text>
              </div>
              <n-switch v-model:value="draftConsent.ad_personalization" />
            </div>
          </div>

          <n-space wrap>
            <n-button tertiary @click="rejectAll">拒绝可选项</n-button>
            <n-button tertiary @click="acceptSelected">保存选择</n-button>
            <n-button type="primary" @click="acceptAll">接受全部</n-button>
          </n-space>
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
  setAnalyticsConsent,
} from "@/utils/analytics";
import { trackEvent } from "@/utils/track";
import {
  grantAnalyticsConsentToVendors,
  initAnalyticsVendors,
} from "@/utils/vendorAnalytics";

const store = mainStore();

const visible = computed(
  () => !store.analyticsPromptDismissed && !store.analyticsConsent
);

const createDraft = (source = {}) => ({
  ...DEFAULT_CONSENT,
  ...source,
});

const draftConsent = reactive(
  createDraft({
    [CONSENT_CATEGORIES.analytics]: false,
    [CONSENT_CATEGORIES.adStorage]: false,
    [CONSENT_CATEGORIES.adUserData]: false,
    [CONSENT_CATEGORIES.adPersonalization]: false,
  })
);

const applyConsent = (consent) => {
  const normalized = createDraft(consent);
  normalized[CONSENT_CATEGORIES.adUserData] =
    normalized[CONSENT_CATEGORIES.adStorage] ||
    normalized[CONSENT_CATEGORIES.adUserData];
  store.setAnalyticsConsent(normalized);
  store.setAnalyticsPromptDismissed(true);
  setAnalyticsConsent(normalized);
  initAnalyticsVendors();
  grantAnalyticsConsentToVendors(normalized);
  if (normalized[CONSENT_CATEGORIES.analytics]) {
    trackEvent({
      event: "consent_update",
      category: "privacy",
      consent: "analytics_enabled",
      meta: normalized,
    });
    trackEvent({
      event: "page_view",
      category: "privacy",
    });
  }
};

const acceptAll = () => {
  applyConsent({
    [CONSENT_CATEGORIES.analytics]: true,
    [CONSENT_CATEGORIES.adStorage]: true,
    [CONSENT_CATEGORIES.adUserData]: true,
    [CONSENT_CATEGORIES.adPersonalization]: true,
  });
};

const rejectAll = () => {
  applyConsent({
    [CONSENT_CATEGORIES.analytics]: false,
    [CONSENT_CATEGORIES.adStorage]: false,
    [CONSENT_CATEGORIES.adUserData]: false,
    [CONSENT_CATEGORIES.adPersonalization]: false,
  });
};

const acceptSelected = () => {
  applyConsent(draftConsent);
};

onMounted(() => {
  initAnalyticsVendors();
  const stored = getAnalyticsConsent();
  if (stored) {
    store.setAnalyticsConsent(stored);
    store.setAnalyticsPromptDismissed(true);
    grantAnalyticsConsentToVendors(stored);
    Object.assign(draftConsent, createDraft(stored));
  }
});
</script>

<style lang="scss" scoped>
.analytics-consent {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 20px;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgb(255 255 255 / 0.82) 0%,
    rgb(255 255 255 / 0.66) 26%,
    rgb(255 255 255 / 0) 100%
  );
  backdrop-filter: blur(8px);

  .content {
    width: min(840px, 100%);
    padding: 18px 20px;
    border-radius: 16px;
    background: rgb(255 255 255 / 0.98);
    border: 1px solid var(--n-border-color);
    box-shadow: 0 18px 40px rgb(0 0 0 / 16%);
    display: flex;
    flex-direction: column;
    gap: 16px;
    pointer-events: auto;
  }

  .copy {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
  }

  .desc {
    line-height: 1.6;
  }

  .groups {
    display: grid;
    gap: 10px;
  }

  .group {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
    padding: 12px 14px;
    border-radius: 12px;
    background: rgb(0 0 0 / 0.03);
  }

  .group-title {
    font-weight: 600;
  }

  .group-desc {
    display: block;
    margin-top: 4px;
    line-height: 1.5;
  }
}

:global(.dark) .analytics-consent,
:global(body.dark) .analytics-consent,
:global(html.dark) .analytics-consent {
  background: linear-gradient(
    to top,
    rgb(10 12 16 / 0.84) 0%,
    rgb(10 12 16 / 0.68) 26%,
    rgb(10 12 16 / 0) 100%
  );

  .content {
    background: rgb(24 26 32 / 0.96);
    box-shadow: 0 18px 40px rgb(0 0 0 / 34%);
  }

  .group {
    background: rgb(255 255 255 / 0.04);
  }
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
</style>
