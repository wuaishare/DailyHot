<template>
  <draggable
    class="topic-lane-grid"
    :class="{ 'is-scrollbar-hidden': hideScrollbar, 'is-scrollbar-hover': hoverScrollbar }"
    :model-value="lanes"
    item-key="key"
    :disabled="!sortable || dragDisabled"
    :animation="180"
    handle=".topic-lane__drag-handle"
    filter=".no-lane-drag, .no-lane-drag *"
    :prevent-on-filter="false"
    :fallback-tolerance="8"
    :touch-start-threshold="8"
    ghost-class="topic-lane-ghost"
    chosen-class="topic-lane-chosen"
    drag-class="topic-lane-drag"
    :aria-label="ariaLabel"
    @start="emit('drag-start')"
    @end="emit('drag-end')"
    @update:model-value="handleOrderUpdate"
  >
    <template #item="{ element: lane }">
      <section
        :ref="(el) => registerLaneRef(lane.key, el)"
        class="topic-lane"
        :class="[`is-${lane.key}`, { 'is-scrollable': lane.scrollable }]"
      >
      <header class="topic-lane__head">
        <div :title="lane.subtitle || undefined">
          <div class="topic-lane__title-row">
            <strong>{{ lane.label }}</strong>
            <span v-if="$slots['title-actions']" class="topic-lane__title-actions">
              <slot name="title-actions" :lane="lane" />
            </span>
          </div>
          <span v-if="lane.subtitle && !lane.hideSubtitle">{{ lane.subtitle }}</span>
        </div>
        <div class="topic-lane__head-actions no-lane-drag">
          <em>{{ lane.count ?? lane.items?.length ?? 0 }}</em>
          <button
            v-if="lane.actionLabel && lane.actionPlacement === 'header'"
            type="button"
            class="topic-lane__header-action"
            @click.stop="emit('select', lane)"
          >{{ lane.actionLabel }}</button>
          <slot name="header-actions" :lane="lane" />
        </div>
      </header>

      <n-scrollbar
        v-if="hoverScrollbar && lane.scrollable"
        class="topic-lane__scrollbar"
        trigger="hover"
        :tabindex="lane.items?.length > Number(lane.visibleCount ?? 5) ? 0 : undefined"
        @scroll="handleItemsScroll($event, lane)"
      >
        <div class="topic-lane__items topic-lane__items--overlay">
          <template v-for="(item, index) in lane.items || []" :key="item.id || `${lane.key}-${index}`">
            <slot name="item" :lane="lane" :item="item" :index="index" />
          </template>
          <span v-if="lane.hasMore" class="topic-lane__scroll-hint">{{ lane.loadMoreLabel || 'Scroll for more' }}</span>
        </div>
      </n-scrollbar>
      <div
        v-else
        class="topic-lane__items"
        :tabindex="lane.scrollable && lane.items?.length > Number(lane.visibleCount ?? 5) ? 0 : undefined"
        @scroll="handleItemsScroll($event, lane)"
      >
        <template v-for="(item, index) in lane.items || []" :key="item.id || `${lane.key}-${index}`">
          <slot name="item" :lane="lane" :item="item" :index="index" />
        </template>
        <span v-if="lane.hasMore" class="topic-lane__scroll-hint">{{ lane.loadMoreLabel || 'Scroll for more' }}</span>
      </div>

      <div
        v-if="activeSticky[lane.key] && $slots['sticky-item']"
        class="topic-lane__sticky no-lane-drag"
      >
        <slot
          name="sticky-item"
          :lane="lane"
          :item="activeSticky[lane.key].item"
          :meta="activeSticky[lane.key].meta"
        />
      </div>

      <button
        v-if="lane.actionLabel && lane.actionPlacement !== 'header'"
        type="button"
        class="topic-lane__action"
        @click="$emit('select', lane)"
      >
        <span>{{ lane.actionLabel }}</span>
        <b aria-hidden="true">→</b>
      </button>

      <footer v-if="$slots.footer" class="topic-lane__footer">
        <slot name="footer" :lane="lane" />
      </footer>
      </section>
    </template>
  </draggable>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, watch } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  lanes: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: "" },
  sortable: { type: Boolean, default: false },
  dragDisabled: { type: Boolean, default: false },
  hideScrollbar: { type: Boolean, default: false },
  hoverScrollbar: { type: Boolean, default: false },
});

const emit = defineEmits(["select", "load-more", "reorder", "drag-start", "drag-end"]);
const handleOrderUpdate = (ordered) => emit("reorder", Array.isArray(ordered) ? ordered : []);
const pendingLanes = new Set();
const laneRefs = new Map();
const activeSticky = reactive({});
let stickyRefreshFrame = 0;

const registerLaneRef = (key, el) => {
  if (!key) return;
  if (el) laneRefs.set(key, el);
  else laneRefs.delete(key);
};

const laneScrollTarget = (laneEl) =>
  laneEl?.querySelector(".n-scrollbar-container") || laneEl?.querySelector(".topic-lane__items");

const updateStickyVisibility = (lane, explicitTarget = null) => {
  if (!lane?.key) return;
  const candidates = Array.isArray(lane?.stickyCandidates) ? lane.stickyCandidates : [];
  const laneEl = laneRefs.get(lane.key);
  const target = explicitTarget || laneScrollTarget(laneEl);
  if (!target || !candidates.length) {
    activeSticky[lane.key] = null;
    return;
  }
  const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 8;
  if (atBottom) {
    activeSticky[lane.key] = null;
    return;
  }
  const targetRect = target.getBoundingClientRect();
  const tolerance = 4;
  const candidate = candidates.find((entry) => {
    const itemEl = laneEl?.querySelector(`[data-lane-item-key="${entry.key}"]`);
    if (!itemEl) return false;
    const itemRect = itemEl.getBoundingClientRect();
    const intersects =
      itemRect.bottom > targetRect.top + tolerance &&
      itemRect.top < targetRect.bottom - tolerance;
    const targetIsBelowViewport = itemRect.top >= targetRect.bottom - tolerance;
    return targetIsBelowViewport && !intersects;
  });
  activeSticky[lane.key] = candidate || null;
};

const refreshStickyVisibility = () => {
  if (stickyRefreshFrame) cancelAnimationFrame(stickyRefreshFrame);
  stickyRefreshFrame = requestAnimationFrame(() => {
    stickyRefreshFrame = 0;
    for (const lane of props.lanes || []) updateStickyVisibility(lane);
  });
};

watch(
  () => props.lanes,
  () => nextTick(refreshStickyVisibility),
  { deep: true, immediate: true },
);

onMounted(() => window.addEventListener("resize", refreshStickyVisibility, { passive: true }));
onBeforeUnmount(() => {
  window.removeEventListener("resize", refreshStickyVisibility);
  if (stickyRefreshFrame) cancelAnimationFrame(stickyRefreshFrame);
});

const handleItemsScroll = (event, lane) => {
  const target = event?.currentTarget;
  if (!target) return;
  updateStickyVisibility(lane, target);
  if (!lane?.scrollable || !lane?.hasMore || pendingLanes.has(lane.key)) return;
  if (target.scrollTop + target.clientHeight < target.scrollHeight - 48) return;
  pendingLanes.add(lane.key);
  emit("load-more", lane);
  requestAnimationFrame(() => {
    pendingLanes.delete(lane.key);
    nextTick(refreshStickyVisibility);
  });
};
</script>

<style scoped>
.topic-lane-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 2px 0 12px;
}
.topic-lane {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  padding: 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 10px;
  background: var(--n-action-color, rgba(127, 127, 127, 0.04));
}
.topic-lane__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 0 1px 7px;
  border-bottom: 1px solid var(--n-border-color);
}
.topic-lane__head > div {
  min-width: 0;
}
.topic-lane__title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.topic-lane__title-row > strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.topic-lane__title-actions {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}
.topic-lane__head-actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  flex: 0 0 auto;
}
.topic-lane__header-action {
  padding: 2px 4px;
  border: 0;
  background: transparent;
  color: var(--n-text-color-3);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}
.topic-lane__header-action:hover,
.topic-lane__header-action:focus-visible {
  color: var(--n-text-color);
  outline: none;
}
.topic-lane__head strong,
.topic-lane__head span {
  display: block;
}
.topic-lane__head strong {
  color: var(--n-text-color);
  font-size: 11px;
  font-weight: 750;
}
.topic-lane__head span {
  margin-top: 2px;
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.topic-lane__head em {
  flex: 0 0 auto;
  min-width: 24px;
  padding: 2px 6px;
  border-radius: 999px;
  background: var(--n-color);
  color: var(--n-text-color-2);
  font-size: 10px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.topic-lane__items {
  display: grid;
  min-width: 0;
}
.topic-lane.is-scrollable .topic-lane__items {
  max-height: 320px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--n-text-color-3) 24%, transparent) transparent;
}
.topic-lane.is-scrollable .topic-lane__items:focus-visible {
  outline: 1px solid color-mix(in srgb, var(--lane-tone, var(--n-primary-color)) 48%, transparent);
  outline-offset: 2px;
}
.topic-lane.is-scrollable .topic-lane__items::-webkit-scrollbar { width: 5px; }
.topic-lane.is-scrollable .topic-lane__items::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--n-text-color-3) 22%, transparent);
}
.topic-lane-grid.is-scrollbar-hidden .topic-lane__items {
  scrollbar-width: none;
}
.topic-lane-grid.is-scrollbar-hidden .topic-lane__items::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
.topic-lane__scrollbar {
  max-height: 320px;
}
.topic-lane-grid.is-scrollbar-hover .topic-lane.is-scrollable .topic-lane__items--overlay {
  max-height: none;
  overflow: visible;
  scrollbar-width: auto;
}
.topic-lane__scrollbar :deep(.n-scrollbar-rail.n-scrollbar-rail--vertical) {
  right: 0;
  width: 5px;
}
.topic-lane__scroll-hint {
  display: block;
  padding: 6px 2px 2px;
  color: var(--n-text-color-3);
  font-size: 9px;
  text-align: center;
}
.topic-lane__sticky {
  position: absolute;
  right: 9px;
  bottom: 9px;
  left: 9px;
  z-index: 5;
  pointer-events: auto;
}
.topic-lane__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: auto;
  padding: 7px 2px 0;
  border: 0;
  border-top: 1px solid var(--n-border-color);
  background: transparent;
  color: var(--n-text-color-3);
  font: inherit;
  font-size: 10px;
  cursor: pointer;
}
.topic-lane__action:hover,
.topic-lane__action:focus-visible {
  color: var(--n-text-color);
  outline: none;
}
.topic-lane__action b {
  font-size: 12px;
  font-weight: 500;
}
.topic-lane__footer {
  margin-top: auto;
  padding-top: 7px;
  border-top: 1px solid var(--n-border-color);
}
.topic-lane-ghost { opacity: .42; }
.topic-lane-chosen { z-index: 2; }
.topic-lane-drag { cursor: grabbing; }
@media (max-width: 720px) {
  .topic-lane-grid {
    display: flex;
    gap: 7px;
    margin-right: -13px;
    padding-right: 13px;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
  }
  .topic-lane-grid::-webkit-scrollbar {
    display: none;
  }
  .topic-lane {
    flex: 0 0 min(82vw, 292px);
    scroll-snap-align: start;
  }
}
</style>
