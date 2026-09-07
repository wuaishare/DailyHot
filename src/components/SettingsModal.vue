<template>
  <n-modal
    :show="show"
    display-directive="show"
    :mask-closable="true"
    @update:show="updateShow"
  >
    <section
      class="settings-modal"
      :class="`is-${store.siteTheme}`"
      role="dialog"
      aria-modal="true"
      :aria-label="t('settings.title')"
    >
      <header class="settings-modal__header">
        <div class="settings-modal__title">
          <span class="settings-modal__icon" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="M8.3 2.8h3.4l.6 2a6.2 6.2 0 0 1 1.4.8l2-.5 1.7 2.9-1.5 1.5v1.1l1.5 1.5-1.7 2.9-2-.5a6.2 6.2 0 0 1-1.4.8l-.6 2H8.3l-.6-2a6.2 6.2 0 0 1-1.4-.8l-2 .5-1.7-2.9 1.5-1.5V9.5L2.6 8l1.7-2.9 2 .5a6.2 6.2 0 0 1 1.4-.8l.6-2Z" />
              <circle cx="10" cy="10" r="2.4" />
            </svg>
          </span>
          <div>
            <strong>{{ t("settings.title") }}</strong>
            <p>{{ t("settings.modalSubtitle") }}</p>
          </div>
        </div>
        <button
          type="button"
          class="settings-modal__close"
          :aria-label="t('settings.close')"
          @click="updateShow(false)"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" />
          </svg>
        </button>
      </header>

      <div class="settings-modal__body">
        <div
          class="settings-modal__tabs"
          role="tablist"
          :aria-label="t('settings.title')"
          @keydown.left.prevent="selectRelativeTab(-1)"
          @keydown.right.prevent="selectRelativeTab(1)"
        >
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            role="tab"
            :tabindex="activeTab === tab.value ? 0 : -1"
            :aria-selected="activeTab === tab.value"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            <span class="settings-modal__tab-icon" aria-hidden="true" v-html="tab.icon" />
            <span>{{ tab.label }}</span>
          </button>
        </div>

        <div
          class="settings-modal__content"
          role="tabpanel"
          :aria-label="activeTabLabel"
        >
          <GeneralSettings
            v-if="activeTab !== 'ranking'"
            embedded
            :section="activeTab"
          />
          <RankingOrderSettings v-else />
        </div>
      </div>
    </section>
  </n-modal>
</template>

<script setup>
import GeneralSettings from "@/components/GeneralSettings.vue";
import { defineAsyncComponent } from "vue";
import { mainStore } from "@/store";
import { useI18n } from "vue-i18n";

const loadRankingOrderSettings = () =>
  import("@/components/RankingOrderSettings.vue");
const RankingOrderSettings = defineAsyncComponent(loadRankingOrderSettings);

const props = defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["update:show"]);
const store = mainStore();
const { t } = useI18n({ useScope: "global" });
const activeTab = ref("display");
let rankingPrefetchHandle = null;

const prefetchRankingSettings = () => {
  void loadRankingOrderSettings();
};
const scheduleRankingPrefetch = () => {
  if (typeof window === "undefined") return;
  if ("requestIdleCallback" in window) {
    rankingPrefetchHandle = window.requestIdleCallback(
      prefetchRankingSettings,
      { timeout: 1800 },
    );
    return;
  }
  rankingPrefetchHandle = window.setTimeout(prefetchRankingSettings, 1000);
};
const cancelRankingPrefetch = () => {
  if (rankingPrefetchHandle == null || typeof window === "undefined") return;
  if (
    "cancelIdleCallback" in window &&
    typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(rankingPrefetchHandle);
  } else {
    window.clearTimeout(rankingPrefetchHandle);
  }
  rankingPrefetchHandle = null;
};

const tabs = computed(() => [
  {
    value: "display",
    label: t("settings.displayAndView"),
    icon: '<svg viewBox="0 0 18 18"><rect x="2.5" y="3" width="13" height="9" rx="2"/><path d="M6 15h6M9 12v3"/></svg>',
  },
  {
    value: "categories",
    label: t("settings.categoryManagement"),
    icon: '<svg viewBox="0 0 18 18"><path d="M3 4.5h5l1 1.5h6v8H3z"/><path d="M3 7h12"/></svg>',
  },
  {
    value: "ranking",
    label: t("settings.rankingOrder"),
    icon: '<svg viewBox="0 0 18 18"><path d="M6 4h9M6 9h9M6 14h9"/><circle cx="3" cy="4" r="1"/><circle cx="3" cy="9" r="1"/><circle cx="3" cy="14" r="1"/></svg>',
  },
  {
    value: "misc",
    label: t("settings.dataAndMisc"),
    icon: '<svg viewBox="0 0 18 18"><path d="M4 4h10M4 9h10M4 14h10"/><circle cx="7" cy="4" r="1.6"/><circle cx="11" cy="9" r="1.6"/><circle cx="8" cy="14" r="1.6"/></svg>',
  },
]);

const activeTabLabel = computed(
  () => tabs.value.find((tab) => tab.value === activeTab.value)?.label || "",
);
const selectRelativeTab = (direction) => {
  const values = tabs.value.map((tab) => tab.value);
  const currentIndex = Math.max(values.indexOf(activeTab.value), 0);
  const nextIndex = (currentIndex + direction + values.length) % values.length;
  activeTab.value = values[nextIndex];
  nextTick(() => {
    document
      .querySelector(".settings-modal__tabs button.active")
      ?.focus({ preventScroll: true });
  });
};

const updateShow = (value) => {
  emit("update:show", Boolean(value));
};

watch(
  () => props.show,
  (value) => {
    if (value) activeTab.value = "display";
  },
);

onMounted(scheduleRankingPrefetch);
onBeforeUnmount(cancelRankingPrefetch);
</script>

<style scoped>
.settings-modal {
  --settings-surface: oklch(0.985 0.004 285);
  --settings-panel: oklch(0.955 0.005 285);
  --settings-hover: oklch(0.935 0.006 285);
  --settings-text: oklch(0.27 0.008 285);
  --settings-muted: oklch(0.52 0.008 285);
  --settings-stroke: oklch(0.36 0.008 285 / 15%);
  --settings-accent: oklch(0.62 0.19 28);
  width: min(1360px, calc(100vw - 32px));
  height: min(820px, calc(100vh - 32px));
  overflow: hidden;
  border: 1px solid var(--settings-stroke);
  border-radius: 18px;
  box-shadow: 0 28px 90px oklch(0.08 0.006 285 / 46%);
}

.settings-modal.is-dark {
  --settings-surface: oklch(0.205 0.008 285);
  --settings-panel: oklch(0.235 0.009 285);
  --settings-hover: oklch(0.265 0.01 285);
  --settings-text: oklch(0.9 0.006 285);
  --settings-muted: oklch(0.67 0.008 285);
  --settings-stroke: oklch(0.86 0.006 285 / 13%);
  background: var(--settings-surface);
  color: var(--settings-text);
}

.settings-modal.is-light {
  background: var(--settings-surface);
  color: var(--settings-text);
}

.settings-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 76px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--settings-stroke);
}

.settings-modal__title {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.settings-modal__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--settings-accent) 13%, var(--settings-panel));
  color: var(--settings-accent);
}

.settings-modal__icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.settings-modal__title strong {
  display: block;
  color: var(--settings-text);
  font-size: 19px;
  font-weight: 720;
}

.settings-modal__title p {
  margin: 3px 0 0;
  color: var(--settings-muted);
  font-size: 11px;
}

.settings-modal__close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 9px;
  background: var(--settings-panel);
  color: var(--settings-muted);
  cursor: pointer;
}

.settings-modal__close:hover {
  color: var(--settings-text);
  background: var(--settings-hover);
}

.settings-modal__close svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.settings-modal__body {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  min-height: 0;
  height: calc(100% - 76px);
}

.settings-modal__tabs {
  display: grid;
  align-content: start;
  gap: 5px;
  padding: 14px 12px;
  border-right: 1px solid var(--settings-stroke);
  background: color-mix(in srgb, var(--settings-panel) 72%, transparent);
}

.settings-modal__tabs button {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 11px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--settings-muted);
  text-align: left;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.settings-modal__tabs button:hover,
.settings-modal__tabs button.active {
  color: var(--settings-text);
  background: var(--settings-hover);
}

.settings-modal__tabs button.active {
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--settings-accent) 26%, transparent);
}

.settings-modal__tab-icon {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.settings-modal__tab-icon :deep(svg) {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.settings-modal__content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 14px;
  background: transparent;
}

.settings-modal__content :deep(.setting.embedded) {
  grid-template-columns: 1fr;
  gap: 10px;
}

.settings-modal__content :deep(.setting .n-h) {
  margin: 0 0 2px;
  padding-left: 2px;
  font-size: 14px;
}

.settings-modal__content :deep(.setting .set-item) {
  border-radius: 11px;
  border-color: var(--settings-stroke);
  background: color-mix(in srgb, var(--settings-panel) 92%, transparent);
}

.settings-modal__content :deep(.ranking-order-card) {
  background: transparent;
  border: 0;
}

@media (max-width: 760px) {
  .settings-modal {
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
  }

  .settings-modal__body {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .settings-modal__tabs {
    display: flex;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--settings-stroke);
  }

  .settings-modal__tabs button {
    flex: 0 0 auto;
  }
}
</style>
