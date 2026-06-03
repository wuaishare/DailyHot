<template>
  <Teleport to="body">
    <Transition name="consent-fade">
      <div v-if="visible" class="analytics-consent">
        <div class="content">
          <div class="copy">
            <n-text class="title">统计与隐私设置</n-text>
            <n-text depth="3" class="desc">
              为了优化首页默认排序、来源入口分析、日活与运维指标，我们希望在你同意后统计匿名使用行为。
              仅记录匿名事件与哈希化访客标识，不存储原始 IP。
            </n-text>
          </div>
          <n-space wrap>
            <n-button tertiary @click="reject">拒绝</n-button>
            <n-button type="primary" @click="accept">同意统计</n-button>
          </n-space>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { mainStore } from "@/store";
import {
  ANALYTICS_CONSENT,
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

const accept = () => {
  store.setAnalyticsConsent(ANALYTICS_CONSENT.accepted);
  store.setAnalyticsPromptDismissed(true);
  setAnalyticsConsent(ANALYTICS_CONSENT.accepted);
  initAnalyticsVendors();
  grantAnalyticsConsentToVendors();
  trackEvent({
    event: "consent_update",
    consent: ANALYTICS_CONSENT.accepted,
    category: "privacy",
  });
  trackEvent({
    event: "page_view",
    category: "privacy",
  });
};

const reject = () => {
  store.setAnalyticsConsent(ANALYTICS_CONSENT.rejected);
  store.setAnalyticsPromptDismissed(true);
  setAnalyticsConsent(ANALYTICS_CONSENT.rejected);
};

onMounted(() => {
  initAnalyticsVendors();
  const stored = getAnalyticsConsent();
  if (stored) {
    store.setAnalyticsConsent(stored);
    store.setAnalyticsPromptDismissed(true);
    if (stored === ANALYTICS_CONSENT.accepted) {
      grantAnalyticsConsentToVendors();
    }
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
    width: min(760px, 100%);
    padding: 16px 18px;
    border-radius: 16px;
    background: rgb(255 255 255 / 0.98);
    border: 1px solid var(--n-border-color);
    box-shadow: 0 18px 40px rgb(0 0 0 / 16%);
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    max-width: 560px;
  }

  @media (max-width: 720px) {
    .content {
      flex-direction: column;
      align-items: flex-start;
    }
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
