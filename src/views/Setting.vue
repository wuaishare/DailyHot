<template>
  <div class="setting-modal-route">
    <n-modal
      :show="open"
      :mask-closable="true"
      @update:show="handleVisibility"
    >
      <n-card
        class="general-settings-modal"
        :bordered="false"
        role="dialog"
        aria-modal="true"
        closable
        @close="handleVisibility(false)"
      >
        <template #header>
          <strong>{{ t("settings.title") }}</strong>
        </template>
        <div class="general-settings-scroll">
          <GeneralSettings embedded />
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import GeneralSettings from "@/components/GeneralSettings.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { buildHomePath } from "@/utils/locale";

const router = useRouter();
const { t, locale } = useI18n({ useScope: "global" });
const open = ref(true);

const handleVisibility = (value) => {
  open.value = value;
  if (!value) router.replace(buildHomePath(locale.value));
};

onActivated(() => {
  open.value = true;
});
</script>

<style scoped>
.setting-modal-route {
  min-height: 1px;
}

.general-settings-modal {
  width: min(760px, calc(100vw - 32px));
  max-height: min(820px, calc(100vh - 32px));
  overflow: hidden;
  border-radius: 16px;
  background: var(--n-color);
}

.general-settings-modal :deep(.n-card__content) {
  min-height: 0;
  overflow: hidden;
}

.general-settings-scroll {
  max-height: calc(100vh - 150px);
  overflow: auto;
  overscroll-behavior: contain;
  padding: 2px 4px 4px 2px;
}
</style>
