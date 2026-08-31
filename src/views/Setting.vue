<template>
  <div class="setting-modal-route">
    <HotboardManager
      v-model:show="open"
      initial-section="general"
      @update:show="handleVisibility"
    />
  </div>
</template>

<script setup>
import HotboardManager from "@/components/HotboardManager.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { buildHomePath } from "@/utils/locale";

const router = useRouter();
const { locale } = useI18n({ useScope: "global" });
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
</style>
