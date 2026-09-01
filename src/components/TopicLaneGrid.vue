<template>
  <div class="topic-lane-grid" :aria-label="ariaLabel">
    <section v-for="lane in lanes" :key="lane.key" class="topic-lane">
      <header class="topic-lane__head">
        <div>
          <strong>{{ lane.label }}</strong>
          <span v-if="lane.subtitle">{{ lane.subtitle }}</span>
        </div>
        <em>{{ lane.count ?? lane.items?.length ?? 0 }}</em>
      </header>

      <div class="topic-lane__items">
        <template v-for="(item, index) in lane.items || []" :key="item.id || `${lane.key}-${index}`">
          <slot name="item" :lane="lane" :item="item" :index="index" />
        </template>
      </div>

      <button
        v-if="lane.actionLabel"
        type="button"
        class="topic-lane__action"
        @click="$emit('select', lane)"
      >
        <span>{{ lane.actionLabel }}</span>
        <b aria-hidden="true">→</b>
      </button>
    </section>
  </div>
</template>

<script setup>
defineProps({
  lanes: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: "" },
});

defineEmits(["select"]);
</script>

<style scoped>
.topic-lane-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 2px 0 12px;
}
.topic-lane {
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
