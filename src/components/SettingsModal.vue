<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    @update:show="updateShow"
  >
    <section
      class="settings-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="t('settings.title')"
    >
      <header class="settings-modal__header">
        <div class="settings-modal__title">
          <span class="settings-modal__icon">⚙</span>
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
          ×
        </button>
      </header>

      <div class="settings-modal__body">
        <aside class="settings-modal__nav" :aria-label="t('settings.title')">
          <button
            type="button"
            :class="{ active: activeSection === 'base' }"
            @click="scrollTo('base')"
          >
            <span>◫</span>
            {{ t("settings.displayAndView") }}
          </button>
          <button
            type="button"
            :class="{ active: activeSection === 'misc' }"
            @click="scrollTo('misc')"
          >
            <span>☷</span>
            {{ t("settings.dataAndMisc") }}
          </button>
        </aside>

        <div ref="scrollEl" class="settings-modal__content" @scroll="syncSection">
          <GeneralSettings embedded />
        </div>
      </div>
    </section>
  </n-modal>
</template>

<script setup>
import GeneralSettings from "@/components/GeneralSettings.vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  show: { type: Boolean, default: false },
});
const emit = defineEmits(["update:show"]);
const { t } = useI18n({ useScope: "global" });
const scrollEl = ref(null);
const activeSection = ref("base");

const updateShow = (value) => {
  emit("update:show", Boolean(value));
};

const scrollTo = (section) => {
  activeSection.value = section;
  const target = scrollEl.value?.querySelector(
    section === "misc" ? "#settings-misc" : "#settings-base",
  );
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const syncSection = () => {
  const root = scrollEl.value;
  if (!root) return;
  const misc = root.querySelector("#settings-misc");
  if (!misc) return;
  const rootTop = root.getBoundingClientRect().top;
  activeSection.value =
    misc.getBoundingClientRect().top - rootTop < 90 ? "misc" : "base";
};

watch(
  () => props.show,
  (value) => {
    if (value) activeSection.value = "base";
  },
);
</script>

<style scoped>
.settings-modal {
  width: min(980px, calc(100vw - 28px));
  max-height: min(840px, calc(100vh - 28px));
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, var(--n-border-color) 82%, transparent);
  border-radius: 20px;
  background:
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--n-color) 96%, var(--n-primary-color) 4%),
      var(--n-color)
    );
  box-shadow: 0 26px 80px rgba(0, 0, 0, 0.38);
}

.settings-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 78px;
  padding: 18px 20px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--n-border-color) 76%, transparent);
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
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 13px;
  color: var(--n-text-color);
  background: color-mix(in srgb, var(--n-primary-color) 12%, var(--n-action-color));
  font-size: 22px;
}

.settings-modal__title strong {
  display: block;
  color: var(--n-text-color);
  font-size: 20px;
}

.settings-modal__title p {
  margin: 3px 0 0;
  color: var(--n-text-color-3);
  font-size: 12px;
}

.settings-modal__close {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 10px;
  background: var(--n-action-color);
  color: var(--n-text-color-2);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.settings-modal__close:hover {
  color: var(--n-text-color);
  background: color-mix(in srgb, var(--n-action-color) 72%, var(--n-primary-color) 10%);
}

.settings-modal__body {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  min-height: 0;
  height: min(700px, calc(100vh - 110px));
}

.settings-modal__nav {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 14px 12px;
  border-right: 1px solid
    color-mix(in srgb, var(--n-border-color) 76%, transparent);
  background: color-mix(in srgb, var(--n-action-color) 48%, transparent);
}

.settings-modal__nav button {
  appearance: none;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--n-text-color-2);
  text-align: left;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.settings-modal__nav button:hover,
.settings-modal__nav button.active {
  color: var(--n-text-color);
  background: color-mix(in srgb, var(--n-primary-color) 10%, var(--n-action-color));
}

.settings-modal__nav button.active {
  box-shadow: inset 2px 0 0 var(--n-primary-color);
}

.settings-modal__content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  padding: 14px;
}

.settings-modal__content :deep(.setting.embedded) {
  grid-template-columns: 1fr;
  gap: 10px;
}

.settings-modal__content :deep(.setting .n-h) {
  scroll-margin-top: 8px;
  margin-top: 2px;
  font-size: 16px;
}

.settings-modal__content :deep(.setting .set-item) {
  border-radius: 12px;
}

@media (max-width: 760px) {
  .settings-modal__body {
    grid-template-columns: 1fr;
  }

  .settings-modal__nav {
    display: flex;
    overflow-x: auto;
    border-right: 0;
    border-bottom: 1px solid var(--n-border-color);
  }

  .settings-modal__nav button {
    flex: 0 0 auto;
  }
}
</style>
