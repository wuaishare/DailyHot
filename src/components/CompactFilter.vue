<template>
  <n-dropdown
    :trigger="triggerMode"
    :options="menuOptions"
    :show="dropdownShow"
    :menu-props="menuProps"
    placement="bottom-start"
    @update:show="handleShowChange"
    @select="handleSelect"
  >
    <button
      type="button"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
      class="compact-filter"
      :aria-label="ariaLabel || label"
      aria-haspopup="listbox"
    >
      <span class="compact-filter__label">{{ label }}</span>
      <i
        v-if="activeOption?.status"
        class="compact-filter__status"
        :class="`is-${activeOption.status}`"
        :title="activeOption.detail || activeOption.status"
        aria-hidden="true"
      ></i>
      <strong class="compact-filter__value">{{ activeText }}</strong>
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="m2.5 4.5 3.5 3 3.5-3" />
      </svg>
    </button>
  </n-dropdown>
</template>

<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from "vue";
import { HOVER_MENU_OPEN_EVENT, announceHoverMenuOpen } from "@/utils/hoverMenu";

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  label: { type: String, required: true },
  ariaLabel: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  showCount: { type: Boolean, default: true },
});
const emit = defineEmits(["update:modelValue"]);
const hoverCapable = ref(false);
const dropdownShow = ref(false);
const menuId = `compact-filter:${getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)}`;
let hoverMediaQuery;
let closeTimer;

const updateHoverCapability = (event) => {
  hoverCapable.value = Boolean(event?.matches ?? hoverMediaQuery?.matches);
};
const cancelClose = () => {
  clearTimeout(closeTimer);
  closeTimer = undefined;
};
const closeDropdown = () => {
  cancelClose();
  dropdownShow.value = false;
};
const openDropdown = () => {
  cancelClose();
  if (dropdownShow.value) return;
  dropdownShow.value = true;
  announceHoverMenuOpen(menuId);
};
const scheduleClose = () => {
  cancelClose();
  closeTimer = setTimeout(closeDropdown, 140);
};
const handleTriggerEnter = () => {
  if (hoverCapable.value) openDropdown();
};
const handleTriggerLeave = () => {
  if (hoverCapable.value) scheduleClose();
};
const menuProps = () => ({
  onMouseenter: cancelClose,
  onMouseleave: scheduleClose,
});
const handleForeignMenuOpen = (event) => {
  if (event?.detail?.id !== menuId) closeDropdown();
};
onMounted(() => {
  hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  updateHoverCapability(hoverMediaQuery);
  hoverMediaQuery.addEventListener?.("change", updateHoverCapability);
  window.addEventListener(HOVER_MENU_OPEN_EVENT, handleForeignMenuOpen);
});
onBeforeUnmount(() => {
  cancelClose();
  hoverMediaQuery?.removeEventListener?.("change", updateHoverCapability);
  window.removeEventListener(HOVER_MENU_OPEN_EVENT, handleForeignMenuOpen);
});

const triggerMode = computed(() => (hoverCapable.value ? "manual" : "click"));
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
const handleShowChange = (show) => {
  if (hoverCapable.value) return;
  dropdownShow.value = show;
  if (show) announceHoverMenuOpen(menuId);
};
const handleSelect = (value) => {
  emit("update:modelValue", value);
  closeDropdown();
};
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
.compact-filter__status {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--n-text-color-3);
}
.compact-filter__status.is-ok {
  background: #18a058;
}
.compact-filter__status.is-partial {
  background: #f0a020;
}
.compact-filter__status.is-failed {
  background: #d03050;
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
