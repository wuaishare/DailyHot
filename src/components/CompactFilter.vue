<template>
  <n-dropdown
    :trigger="triggerMode"
    :options="menuOptions"
    placement="bottom-start"
    @select="handleSelect"
  >
    <button
      type="button"
      class="compact-filter"
      :aria-label="ariaLabel || label"
      aria-haspopup="listbox"
    >
      <span class="compact-filter__label">{{ label }}</span>
      <strong class="compact-filter__value">{{ activeText }}</strong>
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="m2.5 4.5 3.5 3 3.5-3" />
      </svg>
    </button>
  </n-dropdown>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  label: { type: String, required: true },
  ariaLabel: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  showCount: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue"]);
const hoverCapable = ref(false);
let hoverMediaQuery;

const updateHoverCapability = (event) => {
  hoverCapable.value = Boolean(event?.matches ?? hoverMediaQuery?.matches);
};
onMounted(() => {
  hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  updateHoverCapability(hoverMediaQuery);
  hoverMediaQuery.addEventListener?.("change", updateHoverCapability);
});
onBeforeUnmount(() => {
  hoverMediaQuery?.removeEventListener?.("change", updateHoverCapability);
});

const triggerMode = computed(() => (hoverCapable.value ? "hover" : "click"));
const activeOption = computed(
  () => props.options.find((item) => item.value === props.modelValue) || props.options[0],
);
const activeText = computed(() => {
  const option = activeOption.value;
  if (!option) return "";
  if (!props.showCount || option.count === undefined) return option.label;
  return `${option.label} · ${option.count}`;
});
const menuOptions = computed(() =>
  props.options.map((option) => ({
    key: option.value,
    label:
      props.showCount && option.count !== undefined
        ? `${option.label} · ${option.count}`
        : option.label,
  })),
);
const handleSelect = (value) => emit("update:modelValue", value);
</script>

<style scoped>
.compact-filter {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 190px;
  min-height: 30px;
  padding: 0 8px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color);
  cursor: pointer;
  white-space: nowrap;
}
.compact-filter:hover,
.compact-filter:focus-visible {
  border-color: var(--n-text-color-3);
  outline: none;
}
.compact-filter__label {
  color: var(--n-text-color-3);
  font-size: 10px;
  line-height: 1;
}
.compact-filter__value {
  min-width: 0;
  overflow: hidden;
  color: var(--n-text-color);
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.compact-filter svg {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.4;
  color: var(--n-text-color-3);
}
</style>
