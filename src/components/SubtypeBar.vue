<template>
  <div v-if="groups.length" class="subtype-bar" @click.stop>
    <div v-if="useGroupTabs" class="group-tabs">
      <div
        v-for="group in groups"
        :key="getGroupKey(group)"
        class="group-tab-wrap"
        @mouseenter="openGroup(group)"
        @mouseleave="closeGroup"
      >
        <button
          type="button"
          class="subtype-chip group-tab"
          :class="{ active: isGroupActive(group) }"
          @click="handleGroupClick(group)"
        >
          {{ group.label || group.items?.[0]?.label }}
        </button>
        <Transition name="subtype-menu">
          <div
            v-if="(group.items || []).length > 1 && openGroupKey === getGroupKey(group)"
            class="subtype-menu"
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
      </div>
    </div>
    <div v-else class="flat-track">
      <button
        v-for="item in flatItems"
        :key="item.value"
        type="button"
        class="subtype-chip"
        :class="{ active: item.value === activeValue }"
        @click="selectItem(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

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

const openGroupKey = ref(null);
const flatItems = computed(() =>
  props.groups.flatMap((group) => group.items || [])
);
const useGroupTabs = computed(
  () =>
    props.groups.length > 1 &&
    props.groups.some((group) => group.label || (group.items || []).length > 1)
);

const getGroupKey = (group) =>
  group.key || group.label || group.items?.[0]?.value || "group";

const getActiveGroupItem = (group) =>
  (group.items || []).find((item) => item.value === props.activeValue);

const isGroupActive = (group) => Boolean(getActiveGroupItem(group));

const openGroup = (group) => {
  if ((group.items || []).length <= 1) return;
  openGroupKey.value = getGroupKey(group);
};

const closeGroup = () => {
  openGroupKey.value = null;
};

const selectItem = (value) => {
  if (!value) return;
  emit("change", value);
  closeGroup();
};

const handleGroupClick = (group) => {
  const items = group.items || [];
  if (!items.length) return;
  if (items.length === 1) {
    selectItem(items[0].value);
    return;
  }

  openGroupKey.value =
    openGroupKey.value === getGroupKey(group) ? null : getGroupKey(group);

  if (!isGroupActive(group)) {
    emit("change", items[0].value);
  }
};

onMounted(() => {
  if (typeof document !== "undefined") {
    document.addEventListener("click", closeGroup);
  }
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("click", closeGroup);
  }
});
</script>

<style lang="scss" scoped>
.subtype-bar {
  position: relative;
  width: 100%;
  overflow: visible;
  z-index: 5;
}

.group-tabs,
.flat-track {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 2px 0 6px;
}

.group-tabs {
  overflow: visible;
}

.flat-track {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.group-tab-wrap {
  position: relative;
  flex: 0 0 auto;

  &:nth-last-child(-n + 2) {
    .subtype-menu {
      right: 0;
      left: auto;
    }
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
  gap: 6px;
}

.subtype-menu {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: max-content;
  min-width: 120px;
  max-width: min(300px, calc(100vw - 32px));
  padding: 8px;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-card-color, var(--n-color));
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
}

.menu-chip {
  font-size: 12px;
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
