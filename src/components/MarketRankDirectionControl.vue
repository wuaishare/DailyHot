<template>
  <div
    class="rank-direction-control no-card-drag"
    role="group"
    :aria-label="t('hotList.rankOrder')"
    data-no-card-drag
    @click.stop
    @pointerdown.stop
    @mousedown.stop
  >
    <button
      type="button"
      class="direction-option"
      :class="{ active: direction !== 'reverse' }"
      :aria-pressed="direction !== 'reverse'"
      @click="select('normal')"
    >
      {{ t("hotList.rankOrderNormal") }}
    </button>
    <button
      type="button"
      class="direction-option"
      :class="{ active: direction === 'reverse' }"
      :aria-pressed="direction === 'reverse'"
      @click="select('reverse')"
    >
      {{ t("hotList.rankOrderReverse") }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const props = defineProps({
  direction: {
    type: String,
    default: "normal",
  },
});

const emit = defineEmits(["change"]);
const { t } = useI18n({ useScope: "global" });

const select = (direction) => {
  if (direction === props.direction) return;
  emit("change", direction);
};
</script>

<style scoped>
.rank-direction-control {
  display: inline-flex;
  flex: 0 0 auto;
  padding: 2px;
  border: 1px solid var(--n-border-color);
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.08);
}

.direction-option {
  border: 0;
  background: transparent;
  color: var(--n-text-color);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 1.2;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.16s ease, color 0.16s ease;
}

.direction-option:hover {
  color: #ea444d;
}

.direction-option.active {
  background: #ea444d;
  color: #fff;
  font-weight: 700;
}

@media (max-width: 680px) {
  .direction-option {
    padding-inline: 7px;
  }
}
</style>
