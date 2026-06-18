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
              {{ t("consent.eyebrow") }}
            </span>
            <p class="title">
              {{ t("consent.title") }}
            </p>
            <p class="desc">
              {{ t("consent.description") }}
            </p>
          </div>

          <div class="actions">
            <n-button tertiary @click="declineAndExit">
              {{ t("consent.rejectAndLeave") }}
            </n-button>
            <n-button tertiary @click="openDetails">
              {{ detailsOpen ? t("consent.collapseDetails") : t("consent.viewDetails") }}
            </n-button>
            <n-button type="primary" @click="acceptRequiredOnly">
              {{ t("consent.acceptRequired") }}
            </n-button>
          </div>

          <Transition name="details-expand">
            <div
              v-if="detailsOpen"
              class="details"
              role="region"
              :aria-label="t('consent.detailsAria')"
            >
              <div class="groups">
                <div class="group locked">
                  <div>
                    <div class="group-title">{{ t("consent.necessaryTitle") }}</div>
                    <p class="group-desc">
                      {{ t("consent.necessaryDesc") }}
                    </p>
                  </div>
                  <n-switch :value="true" disabled />
                </div>
                <div class="group locked">
                  <div>
                    <div class="group-title">{{ t("consent.analyticsTitle") }}</div>
                    <p class="group-desc">
                      {{ t("consent.analyticsDesc") }}
                    </p>
                  </div>
                  <div class="group-side">
                    <n-tag size="small" type="info" round>{{ t("consent.alwaysOn") }}</n-tag>
                    <n-switch :value="true" disabled />
                  </div>
                </div>
                <div class="group">
                  <div>
                    <div class="group-title">{{ t("consent.adStorageTitle") }}</div>
                    <p class="group-desc">
                      {{ t("consent.adStorageDesc") }}
                    </p>
                  </div>
                  <n-switch v-model:value="draftConsent.ad_storage" />
                </div>
                <div class="group">
                  <div>
                    <div class="group-title">{{ t("consent.adPersonalTitle") }}</div>
                    <p class="group-desc">
                      {{ t("consent.adPersonalDesc") }}
                    </p>
                  </div>
                  <n-switch v-model:value="draftConsent.ad_personalization" />
                </div>
              </div>

              <div class="details-footer">
                <p class="footer-text">
                  {{ t("consent.footerText") }}
                </p>
                <n-space wrap justify="end">
                  <n-button tertiary @click="declineAndExit">
                    {{ t("consent.rejectAndLeave") }}
                  </n-button>
                  <n-button tertiary @click="acceptRequiredOnly">
                    {{ t("consent.acceptRequired") }}
                  </n-button>
                  <n-button tertiary @click="acceptSelected">
                    {{ t("consent.saveSelection") }}
                  </n-button>
                  <n-button text tag="a" :href="buildFixedLocalePath(locale, '/privacy')">
                    {{ t("consent.privacyLink") }}
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
import { useI18n } from "vue-i18n";
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
import { buildFixedLocalePath } from "@/utils/locale";

const store = mainStore();
const { t, locale } = useI18n({ useScope: "global" });
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

const declineAndExit = () => {
  if (typeof window === "undefined") return;
  window.location.replace("about:blank");
};

const openDetails = () => {
  detailsOpen.value = !detailsOpen.value;
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
