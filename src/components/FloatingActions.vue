<template>
  <n-float-button-group
    v-show="!feedbackOpen"
    class="floating-actions"
    position="fixed"
    shape="circle"
    :right="16"
    :bottom="18"
  >
    <FeedbackWidget @update:open="feedbackOpen = $event" />

    <n-float-button
      v-if="backTopVisible"
      class="n-back-top floating-back-top"
      position="relative"
      :width="44"
      :height="44"
      :title="t('feedback.backToTop')"
      :aria-label="t('feedback.backToTop')"
      @click="scrollToTop"
    >
      <n-icon size="22">
        <ArrowUp />
      </n-icon>
    </n-float-button>
  </n-float-button-group>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ArrowUp } from "@icon-park/vue-next";
import FeedbackWidget from "@/components/FeedbackWidget.vue";

const emit = defineEmits(["update:back-top-show"]);
const { t } = useI18n({ useScope: "global" });

const feedbackOpen = ref(false);
const backTopVisible = ref(false);
let scrollContainer = null;

const resolveScrollContainer = () => {
  if (typeof document === "undefined") return null;

  const containers = [...document.querySelectorAll(".app-layout .n-scrollbar-container")];
  if (!containers.length) return null;

  return containers.reduce((best, current) => {
    const bestRange = best.scrollHeight - best.clientHeight;
    const currentRange = current.scrollHeight - current.clientHeight;
    return currentRange > bestRange ? current : best;
  });
};

const updateBackTopVisibility = () => {
  const visible = Number(scrollContainer?.scrollTop || 0) >= 2;
  if (visible === backTopVisible.value) return;
  backTopVisible.value = visible;
  emit("update:back-top-show", visible);
};

const bindScrollContainer = () => {
  const nextContainer = resolveScrollContainer();
  if (nextContainer === scrollContainer) {
    updateBackTopVisibility();
    return;
  }

  scrollContainer?.removeEventListener("scroll", updateBackTopVisibility);
  scrollContainer = nextContainer;
  scrollContainer?.addEventListener("scroll", updateBackTopVisibility, { passive: true });
  updateBackTopVisibility();
};

const scrollToTop = () => {
  bindScrollContainer();
  scrollContainer?.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  nextTick(bindScrollContainer);
  window.addEventListener("resize", bindScrollContainer, { passive: true });
});

onBeforeUnmount(() => {
  scrollContainer?.removeEventListener("scroll", updateBackTopVisibility);
  window.removeEventListener("resize", bindScrollContainer);
});
</script>

<style lang="scss" scoped>
.floating-actions {
  z-index: 2400;
}

.floating-actions :deep(.n-float-button) {
  width: 44px;
  height: 44px;
}

.floating-actions :deep(.n-float-button-group--circle-shape > :not(:last-child)) {
  margin-bottom: 10px;
}

.floating-back-top {
  cursor: pointer;
}

@media (max-width: 640px) {
  .floating-actions {
    right: max(12px, env(safe-area-inset-right)) !important;
    bottom: max(12px, env(safe-area-inset-bottom)) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-actions :deep(.n-float-button) {
    transition: none;
  }
}
</style>
