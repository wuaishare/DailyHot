<template>
  <div
    v-if="groups.length"
    class="subtype-bar"
    :class="{
      'has-left-shadow': canScrollLeft,
      'has-right-shadow': canScrollRight,
      'is-dragging': isDragging,
    }"
    @click.stop
  >
    <div class="scroll-shell">
      <div
        v-if="useGroupTabs"
        ref="trackRef"
        class="subtype-scroll group-tabs"
        @pointerdown="startDrag"
        @pointermove="dragScroll"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @pointerleave="endDrag"
        @scroll="handleTrackScroll"
      >
        <div
          v-for="group in groups"
          :key="getGroupKey(group)"
          class="group-tab-wrap"
          @mouseenter="openGroup(group, $event)"
          @mouseleave="scheduleCloseGroup"
        >
          <button
            type="button"
            class="subtype-chip group-tab"
            :class="{ active: isGroupActive(group) }"
            :title="getGroupButtonTitle(group)"
            @click="handleGroupClick(group, $event)"
          >
            <span class="group-tab-label">{{ getGroupBaseLabel(group) }}</span>
            <span
              v-if="getGroupActiveLabel(group)"
              class="group-tab-active-label"
            >
              {{ getGroupActiveLabel(group) }}
            </span>
          </button>
          <Teleport to="body">
            <Transition name="subtype-menu">
              <div
                v-if="(group.items || []).length > 1 && openGroupKey === getGroupKey(group)"
                class="subtype-menu"
                :class="{ 'is-dark': isDarkTheme }"
                :style="menuStyle"
                @mouseenter="keepMenuOpen"
                @mouseleave="scheduleCloseGroup"
              >
                <button
                  v-for="item in group.items"
                  :key="item.value"
                  type="button"
                  class="subtype-chip menu-chip"
                  :class="{ active: item.value === activeValue }"
                  @click="selectItem(item.value)"
                >
                  {{ item.label }}
                </button>
              </div>
            </Transition>
          </Teleport>
        </div>
      </div>
      <div
        v-else
        ref="trackRef"
        class="subtype-scroll flat-track"
        @pointerdown="startDrag"
        @pointermove="dragScroll"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @pointerleave="endDrag"
        @scroll="handleTrackScroll"
      >
        <button
          v-for="item in flatItems"
          :key="item.value"
          type="button"
          class="subtype-chip"
          :class="{ active: item.value === activeValue }"
          @click="handleItemClick(item.value, $event)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { mainStore } from "@/store";

const props = defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  activeValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["change"]);
const store = mainStore();

const openGroupKey = ref(null);
const menuStyle = ref({});
const trackRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const isDragging = ref(false);
const dragMoved = ref(false);
let closeTimer = null;
let dragStartX = 0;
let dragStartScrollLeft = 0;
let pointerCaptured = false;
let resizeObserver = null;

const flatItems = computed(() =>
  props.groups.flatMap((group) => group.items || [])
);
const useGroupTabs = computed(
  () =>
    props.groups.length > 1 &&
    props.groups.some((group) => group.label || (group.items || []).length > 1)
);
const isDarkTheme = computed(() => store.siteTheme === "dark");

const getGroupKey = (group) =>
  group.key || group.label || group.items?.[0]?.value || "group";

const getActiveGroupItem = (group) =>
  (group.items || []).find((item) => item.value === props.activeValue);

const getGroupBaseLabel = (group) =>
  group.label || group.items?.[0]?.label || "";

const getGroupActiveLabel = (group) => {
  const items = group.items || [];
  const activeItem = getActiveGroupItem(group);
  const baseLabel = getGroupBaseLabel(group);
  if (!activeItem?.label || items.length <= 1 || activeItem.label === baseLabel) {
    return "";
  }
  return activeItem.label;
};

const getGroupButtonTitle = (group) => {
  const baseLabel = getGroupBaseLabel(group);
  const activeLabel = getGroupActiveLabel(group);
  return activeLabel ? `${baseLabel} · ${activeLabel}` : baseLabel;
};

const isGroupActive = (group) => Boolean(getActiveGroupItem(group));

const updateScrollShadow = () => {
  const track = trackRef.value;
  if (!track) {
    canScrollLeft.value = false;
    canScrollRight.value = false;
    return;
  }
  const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
  canScrollLeft.value = track.scrollLeft > 1;
  canScrollRight.value = maxScrollLeft - track.scrollLeft > 1;
};

const attachResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (typeof ResizeObserver === "undefined" || !trackRef.value) return;
  resizeObserver = new ResizeObserver(updateScrollShadow);
  resizeObserver.observe(trackRef.value);
};

const refreshScrollState = () => {
  nextTick(() => {
    attachResizeObserver();
    updateScrollShadow();
  });
};

const startDrag = (event) => {
  const track = trackRef.value;
  if (!track || event.button !== 0 || track.scrollWidth <= track.clientWidth) {
    return;
  }
  isDragging.value = true;
  dragMoved.value = false;
  pointerCaptured = false;
  dragStartX = event.clientX;
  dragStartScrollLeft = track.scrollLeft;
  clearCloseTimer();
};

const dragScroll = (event) => {
  const track = trackRef.value;
  if (!isDragging.value || !track) return;
  const deltaX = event.clientX - dragStartX;
  if (!dragMoved.value && Math.abs(deltaX) > 4) {
    dragMoved.value = true;
    track.setPointerCapture?.(event.pointerId);
    pointerCaptured = true;
    closeGroup();
  }
  track.scrollLeft = dragStartScrollLeft - deltaX;
  updateScrollShadow();
};

const endDrag = (event) => {
  const track = trackRef.value;
  if (!isDragging.value) return;
  isDragging.value = false;
  if (pointerCaptured) {
    track?.releasePointerCapture?.(event.pointerId);
    pointerCaptured = false;
  }
  updateScrollShadow();
  if (dragMoved.value && typeof window !== "undefined") {
    window.setTimeout(() => {
      dragMoved.value = false;
    }, 0);
  }
};

const handleTrackScroll = () => {
  updateScrollShadow();
  if (openGroupKey.value) closeGroup();
};

const positionMenu = (target) => {
  if (typeof window === "undefined" || !target) return;
  const rect = target.getBoundingClientRect();
  const width = Math.min(420, window.innerWidth - 24);
  const left = Math.min(
    window.innerWidth - width - 12,
    Math.max(12, rect.left)
  );
  const top = rect.bottom + 6;
  const maxHeight = Math.min(240, window.innerHeight - 24);
  const showAbove = top + 140 > window.innerHeight && rect.top > 150;

  menuStyle.value = {
    left: `${left}px`,
    top: `${showAbove ? Math.max(12, rect.top - 8) : top}px`,
    maxWidth: `${width}px`,
    maxHeight: `${maxHeight}px`,
    transform: showAbove ? "translateY(-100%)" : "none",
  };
};

const openGroup = (group, event) => {
  if ((group.items || []).length <= 1 || isDragging.value) return;
  clearCloseTimer();
  openGroupKey.value = getGroupKey(group);
  positionMenu(event?.currentTarget);
};

const keepMenuOpen = () => {
  clearCloseTimer();
  if (!openGroupKey.value) return;
};

const clearCloseTimer = () => {
  if (!closeTimer) return;
  clearTimeout(closeTimer);
  closeTimer = null;
};

const closeGroup = () => {
  clearCloseTimer();
  openGroupKey.value = null;
};

const scheduleCloseGroup = () => {
  clearCloseTimer();
  closeTimer = setTimeout(() => {
    openGroupKey.value = null;
    closeTimer = null;
  }, 120);
};

const selectItem = (value) => {
  if (!value) return;
  emit("change", value);
  closeGroup();
};

const handleItemClick = (value, event) => {
  if (dragMoved.value) {
    event?.preventDefault();
    return;
  }
  selectItem(value);
};

const handleGroupClick = (group, event) => {
  if (dragMoved.value) {
    event?.preventDefault();
    return;
  }
  const items = group.items || [];
  if (!items.length) return;
  if (items.length === 1) {
    selectItem(items[0].value);
    return;
  }

  openGroupKey.value =
    openGroupKey.value === getGroupKey(group) ? null : getGroupKey(group);
  if (openGroupKey.value) {
    positionMenu(event?.currentTarget);
  }

  if (!isGroupActive(group)) {
    emit("change", items[0].value);
  }
};

watch(
  () => [props.groups, props.activeValue, useGroupTabs.value],
  refreshScrollState,
  { deep: true }
);

onMounted(() => {
  if (typeof document !== "undefined") {
    document.addEventListener("click", closeGroup);
  }
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateScrollShadow);
  }
  refreshScrollState();
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("click", closeGroup);
  }
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateScrollShadow);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  clearCloseTimer();
});
</script>

<style lang="scss" scoped>
.subtype-bar {
  position: relative;
  width: 100%;
  overflow: visible;
  z-index: 50;
}

.scroll-shell {
  position: relative;
  min-width: 0;
  overflow: hidden;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 2;
    width: 24px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.16s ease;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      90deg,
      var(--n-card-color, var(--n-color, #fff)),
      transparent
    );
  }

  &::after {
    right: 0;
    background: linear-gradient(
      270deg,
      var(--n-card-color, var(--n-color, #fff)),
      transparent
    );
  }
}

.has-left-shadow .scroll-shell::before,
.has-right-shadow .scroll-shell::after {
  opacity: 0.92;
}

.group-tabs,
.flat-track {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 2px 0 6px;
}

.subtype-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  cursor: grab;
  touch-action: pan-y;

  &::-webkit-scrollbar {
    display: none;
  }
}

.is-dragging .subtype-scroll {
  cursor: grabbing;
  user-select: none;
}

.group-tab-wrap {
  position: relative;
  flex: 0 0 auto;
}

.subtype-chip {
  flex: 0 0 auto;
  border: 1px solid var(--n-border-color);
  background: var(--n-color);
  color: var(--n-text-color);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  line-height: 1.2;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #ea444d;
    color: #ea444d;
  }

  &.active {
    background: #ea444d;
    border-color: #ea444d;
    color: #fff !important;
    box-shadow: 0 6px 16px rgba(234, 68, 77, 0.2);
  }
}

.group-tab {
  display: inline-flex;
  align-items: center;
  gap: 0;
  max-width: min(320px, 76vw);
  overflow: hidden;
}

.group-tab-label,
.group-tab-active-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.group-tab-label {
  flex: 0 1 auto;
}

.group-tab-active-label {
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  font-weight: 700;

  &::before {
    content: "·";
    flex: 0 0 auto;
    margin-right: 6px;
    font-weight: 500;
    opacity: 0.72;
  }
}

.subtype-menu {
  --subtype-menu-bg: var(--n-card-color, #fff);
  --subtype-menu-border: var(--n-border-color, rgba(0, 0, 0, 0.08));
  --subtype-menu-text: var(--n-text-color, #1f2329);

  position: fixed;
  z-index: 3001;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: max-content;
  min-width: 120px;
  padding: 8px;
  overflow: auto;
  border: 1px solid var(--subtype-menu-border);
  border-radius: 12px;
  background: var(--subtype-menu-bg);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &.is-dark {
    --subtype-menu-bg: #18181c;
    --subtype-menu-border: rgba(255, 255, 255, 0.1);
    --subtype-menu-text: rgba(255, 255, 255, 0.88);

    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.42);
  }
}

.menu-chip {
  border-color: transparent;
  background: transparent;
  color: var(--subtype-menu-text);
  font-size: 12px;

  &:hover {
    background: rgba(234, 68, 77, 0.1);
  }
}

.subtype-menu-enter-active,
.subtype-menu-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.subtype-menu-enter-from,
.subtype-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
