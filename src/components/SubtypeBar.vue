<template>
  <div v-if="groups.length" class="subtype-bar">
    <div
      v-for="group in groups"
      :key="group.key || group.label || 'group'"
      class="subtype-group"
    >
      <span v-if="group.label" class="group-label">{{ group.label }}</span>
      <div class="group-track">
        <button
          v-for="item in group.items"
          :key="item.value"
          type="button"
          class="subtype-chip"
          :class="{ active: item.value === activeValue }"
          @click="$emit('change', item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  activeValue: {
    type: String,
    default: null,
  },
});

defineEmits(["change"]);
</script>

<style lang="scss" scoped>
.subtype-bar {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.subtype-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}

.group-label {
  flex: 0 0 auto;
  font-size: 12px;
  color: var(--n-text-color-3);
  line-height: 1;
}

.group-track {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(127, 127, 127, 0.35);
    border-radius: 999px;
  }
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
    border-color: var(--n-primary-color);
    color: var(--n-primary-color);
  }

  &.active {
    background: var(--n-primary-color);
    border-color: var(--n-primary-color);
    color: #fff;
  }
}
</style>
