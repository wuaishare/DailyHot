<template>
  <section class="ranking-settings" :class="`is-${store.siteTheme}`">
    <header class="ranking-settings__head">
      <div>
        <strong>{{ t("settings.rankingOrder") }}</strong>
        <p>{{ t("settings.rankingOrderTip") }}</p>
      </div>
      <n-space wrap>
        <n-popconfirm @positive-click="restoreDefaultOrder">
          <template #trigger>
            <n-button size="small">{{ t("settings.restoreDefaultOrder") }}</n-button>
          </template>
          {{ t("settings.restoreDefaultOrderConfirm") }}
        </n-popconfirm>
        <n-popconfirm @positive-click="restoreDefaultCategory">
          <template #trigger>
            <n-button size="small">{{ t("settings.restoreDefaultCategory") }}</n-button>
          </template>
          {{ t("settings.restoreDefaultCategoryConfirm") }}
        </n-popconfirm>
        <n-popconfirm @positive-click="restoreDefaultStatus">
          <template #trigger>
            <n-button size="small">{{ t("settings.restoreDefaultStatus") }}</n-button>
          </template>
          {{ t("settings.restoreDefaultStatusConfirm") }}
        </n-popconfirm>
      </n-space>
    </header>

    <div v-if="editingSource" class="ranking-settings__editor">
      <div class="ranking-settings__editor-source">
        <img
          :src="logoSrc(editingSource.name)"
          alt=""
          @error="handleLogoError"
        />
        <div>
          <strong>{{ getSourceDisplayLabel(editingSource) }}</strong>
          <span>{{ t("settings.categoryPlaceholder") }}</span>
        </div>
      </div>
      <n-select
        class="ranking-settings__editor-select"
        size="small"
        multiple
        filterable
        max-tag-count="responsive"
        :options="categoryOptions"
        :value="getSourceCategoryIds(editingSource, store.categories)"
        :disabled="!categoryEnabled"
        :placeholder="t('settings.categoryPlaceholder')"
        @update:value="(value) => updateSourceCategories(editingSource, value)"
      />
      <button
        type="button"
        class="ranking-settings__editor-close"
        :aria-label="t('settings.close')"
        @click="editingSourceName = ''"
      >
        ×
      </button>
    </div>

    <div class="ranking-grid">
      <article
        v-for="element in renderedSources"
        :key="element.name"
        class="ranking-tile"
        :class="{
          'is-disabled': !element.show,
          'is-editing': editingSourceName === element.name,
          'is-dragging': draggingSourceName === element.name,
          'is-drop-target': dropTargetName === element.name,
        }"
        @dragover.prevent="handleDragOver(element.name)"
        @dragleave="handleDragLeave(element.name)"
        @drop.prevent="handleDrop(element.name)"
      >
        <button
          type="button"
          class="ranking-drag-handle"
          draggable="true"
          :aria-label="`${t('settings.rankingOrder')}: ${getSourceDisplayLabel(element)}`"
          @dragstart="handleDragStart($event, element.name)"
          @dragend="handleDragEnd"
          @keydown.alt.up.prevent="moveSource(element.name, -1)"
          @keydown.alt.down.prevent="moveSource(element.name, 1)"
        >
          <svg viewBox="0 0 16 20" aria-hidden="true">
            <circle cx="5" cy="4" r="1.4" />
            <circle cx="11" cy="4" r="1.4" />
            <circle cx="5" cy="10" r="1.4" />
            <circle cx="11" cy="10" r="1.4" />
            <circle cx="5" cy="16" r="1.4" />
            <circle cx="11" cy="16" r="1.4" />
          </svg>
        </button>

        <img
          class="ranking-tile__logo"
          :src="logoSrc(element.name)"
          alt=""
          loading="lazy"
          @error="handleLogoError"
        />

        <div class="ranking-tile__identity">
          <strong>{{ getSourceDisplayLabel(element) }}</strong>
          <span
            v-if="store.unavailableSources.includes(element.name)"
            class="ranking-tile__warning"
          >
            {{ t("settings.unavailable") }}
          </span>
        </div>

        <button
          type="button"
          class="ranking-category-chip"
          :class="{ active: editingSourceName === element.name }"
          :disabled="!categoryEnabled"
          @click="editingSourceName = element.name"
        >
          {{ getSourceCategorySummary(element) }}
        </button>

        <button
          type="button"
          class="ranking-visible-toggle"
          :class="{ active: element.show }"
          :aria-pressed="element.show"
          :aria-label="getSourceDisplayLabel(element)"
          @click="toggleSourceVisibility(element)"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="m4.2 9.2 3 3 6.7-7" />
          </svg>
        </button>
      </article>
    </div>

    <div
      v-if="renderedSources.length < newsArr.length"
      class="ranking-settings__progress"
      aria-live="polite"
    >
      <span>{{ renderedSources.length }} / {{ newsArr.length }}</span>
    </div>
  </section>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { getCategoryDepth, getSourceCategoryIds } from "@/utils/categoryTree";
import { getCategoryLabel } from "@/utils/locale";
import { getSourceDisplayLabel as getLocalizedSourceDisplayLabel } from "@/utils/sourceLabels";
import { useI18n } from "vue-i18n";

const store = mainStore();
const { t, locale } = useI18n({ useScope: "global" });
const { newsArr, categoryEnabled } = storeToRefs(store);
const editingSourceName = ref("");
const draggingSourceName = ref("");
const dropTargetName = ref("");
const renderLimit = ref(36);
let renderIdleHandle = null;

const categories = computed(() =>
  store.categories.slice().sort((a, b) => a.order - b.order),
);
const categoryOptions = computed(() =>
  categories.value.map((category) => ({
    label: `${"—".repeat(
      Math.max(0, getCategoryDepth(categories.value, category.id) - 1),
    )}${getCategoryLabel(category.name, locale.value)}`,
    value: category.id,
  })),
);
const editingSource = computed(
  () => newsArr.value.find((item) => item.name === editingSourceName.value) || null,
);
const renderedSources = computed(() =>
  newsArr.value.slice(0, Math.min(renderLimit.value, newsArr.value.length)),
);

const getCategoryDisplayName = (category) =>
  category?.builtin
    ? getCategoryLabel(category.name, locale.value)
    : category?.name || "";
const getSourceDisplayLabel = (item) =>
  getLocalizedSourceDisplayLabel(
    item?.name,
    locale.value,
    item?.label || item?.name,
  );
const getSourceCategorySummary = (item) => {
  const labels = getSourceCategoryIds(item, store.categories)
    .map((id) => store.categories.find((category) => category.id === id))
    .filter(Boolean)
    .map(getCategoryDisplayName);
  if (!labels.length) return t("settings.categoryPlaceholder");
  return labels.length > 1 ? `${labels[0]} +${labels.length - 1}` : labels[0];
};
const logoSrc = (name) => getSourceLogo(name);
const handleLogoError = (event) => {
  event.target.src = getSourceLogoFallback();
};

const normalizeOrder = () => {
  newsArr.value = newsArr.value.map((item, index) => ({
    ...item,
    order: index,
  }));
};
const saveOrder = () => {
  normalizeOrder();
  $message.success(t("settings.sortSuccess"));
};

const scheduleRenderBatch = () => {
  if (renderLimit.value >= newsArr.value.length || typeof window === "undefined") {
    return;
  }
  const run = () => {
    renderIdleHandle = null;
    renderLimit.value = Math.min(renderLimit.value + 36, newsArr.value.length);
    if (renderLimit.value < newsArr.value.length) scheduleRenderBatch();
  };
  if ("requestIdleCallback" in window) {
    renderIdleHandle = window.requestIdleCallback(run, { timeout: 350 });
  } else {
    renderIdleHandle = window.setTimeout(run, 80);
  }
};
const cancelRenderBatch = () => {
  if (renderIdleHandle == null || typeof window === "undefined") return;
  if (
    "cancelIdleCallback" in window &&
    typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(renderIdleHandle);
  } else {
    window.clearTimeout(renderIdleHandle);
  }
  renderIdleHandle = null;
};

const moveSourceToIndex = (sourceName, targetIndex) => {
  const sourceIndex = newsArr.value.findIndex((item) => item.name === sourceName);
  if (sourceIndex < 0) return;
  const boundedTarget = Math.max(
    0,
    Math.min(Number(targetIndex), newsArr.value.length - 1),
  );
  if (sourceIndex === boundedTarget) return;
  const next = newsArr.value.slice();
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(boundedTarget, 0, moved);
  newsArr.value = next;
  normalizeOrder();
};
const moveSource = (sourceName, delta) => {
  const sourceIndex = newsArr.value.findIndex((item) => item.name === sourceName);
  if (sourceIndex < 0) return;
  moveSourceToIndex(sourceName, sourceIndex + Number(delta || 0));
  $message.success(t("settings.sortSuccess"));
};
const handleDragStart = (event, sourceName) => {
  draggingSourceName.value = sourceName;
  dropTargetName.value = "";
  if (event?.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", sourceName);
  }
};
const handleDragOver = (targetName) => {
  if (!draggingSourceName.value || draggingSourceName.value === targetName) return;
  dropTargetName.value = targetName;
};
const handleDragLeave = (targetName) => {
  if (dropTargetName.value === targetName) dropTargetName.value = "";
};
const handleDrop = (targetName) => {
  const sourceName = draggingSourceName.value;
  if (!sourceName || sourceName === targetName) {
    handleDragEnd();
    return;
  }
  const targetIndex = newsArr.value.findIndex((item) => item.name === targetName);
  moveSourceToIndex(sourceName, targetIndex);
  handleDragEnd();
  $message.success(t("settings.sortSuccess"));
};
const handleDragEnd = () => {
  draggingSourceName.value = "";
  dropTargetName.value = "";
};
const toggleSourceVisibility = (item) => {
  item.show = !item.show;
  $message.success(
    t(item.show ? "settings.sourceEnabled" : "settings.sourceDisabled", {
      name: getSourceDisplayLabel(item),
    }),
  );
};
const updateSourceCategories = (item, value) => {
  store.setSourceCategories(item.name, value);
};

const restoreDefaultOrder = () => {
  const defaultOrder = store.defaultNewsArr
    .slice()
    .sort((a, b) => a.order - b.order);
  const defaultNames = new Set(defaultOrder.map((item) => item.name));
  const currentByName = new Map(newsArr.value.map((item) => [item.name, item]));
  const restored = defaultOrder.map((item, index) => ({
    ...(currentByName.get(item.name) || item),
    order: index,
  }));
  const extra = newsArr.value
    .filter((item) => !defaultNames.has(item.name))
    .map((item, index) => ({
      ...item,
      order: restored.length + index,
    }));
  newsArr.value = restored.concat(extra);
  $message.success(t("settings.restoreOrderSuccess"));
};

const restoreDefaultCategory = () => {
  const defaultCategoryMap = new Map(
    store.defaultNewsArr.map((item) => [
      item.name,
      getSourceCategoryIds(item, store.categories),
    ]),
  );
  newsArr.value.forEach((item) => {
    const categoryIds =
      defaultCategoryMap.get(item.name) ||
      getSourceCategoryIds(item, store.categories);
    store.setSourceCategories(item.name, categoryIds);
    const target = newsArr.value.find((source) => source.name === item.name);
    if (target) target.categoryIdsCustomized = false;
  });
  $message.success(t("settings.restoreCategorySuccess"));
};

onMounted(scheduleRenderBatch);
onBeforeUnmount(cancelRenderBatch);

const restoreDefaultStatus = () => {
  const defaultStatusMap = new Map(
    store.defaultNewsArr.map((item) => [item.name, item.show]),
  );
  newsArr.value = newsArr.value.map((item) => ({
    ...item,
    show:
      typeof defaultStatusMap.get(item.name) === "boolean"
        ? defaultStatusMap.get(item.name)
        : item.show,
  }));
  $message.success(t("settings.restoreStatusSuccess"));
};
</script>

<style scoped>
.ranking-settings {
  --ranking-panel: oklch(0.955 0.005 285);
  --ranking-hover: oklch(0.935 0.006 285);
  --ranking-text: oklch(0.27 0.008 285);
  --ranking-muted: oklch(0.52 0.008 285);
  --ranking-stroke: oklch(0.36 0.008 285 / 15%);
  display: grid;
  gap: 14px;
}

.ranking-settings.is-dark {
  --ranking-panel: oklch(0.235 0.009 285);
  --ranking-hover: oklch(0.265 0.01 285);
  --ranking-text: oklch(0.9 0.006 285);
  --ranking-muted: oklch(0.67 0.008 285);
  --ranking-stroke: oklch(0.86 0.006 285 / 13%);
}

.ranking-settings__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.ranking-settings__head strong {
  color: var(--ranking-text);
  font-size: 14px;
  font-weight: 700;
}

.ranking-settings__head p {
  margin: 4px 0 0;
  max-width: 680px;
  color: var(--ranking-muted);
  font-size: 11px;
  line-height: 1.5;
}

.ranking-settings__editor {
  display: grid;
  grid-template-columns: minmax(160px, 220px) minmax(260px, 1fr) 30px;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid var(--ranking-stroke);
  border-radius: 10px;
  background: var(--ranking-panel);
}

.ranking-settings__editor-source {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.ranking-settings__editor-source img {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  object-fit: contain;
}

.ranking-settings__editor-source div {
  display: grid;
  min-width: 0;
}

.ranking-settings__editor-source strong {
  overflow: hidden;
  color: var(--ranking-text);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-settings__editor-source span {
  color: var(--ranking-muted);
  font-size: 10px;
}

.ranking-settings__editor-close {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ranking-muted);
  font-size: 18px;
  cursor: pointer;
}

.ranking-settings__editor-close:hover {
  color: var(--ranking-text);
  background: var(--ranking-hover);
}

.ranking-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.ranking-tile {
  display: grid;
  grid-template-columns: 24px 28px minmax(0, 1fr) auto;
  grid-template-areas:
    "drag logo name toggle"
    "drag logo category toggle";
  align-items: center;
  column-gap: 8px;
  row-gap: 4px;
  min-height: 64px;
  padding: 8px 10px;
  border: 1px solid var(--ranking-stroke);
  border-radius: 10px;
  background: var(--ranking-panel);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.ranking-tile:hover,
.ranking-tile.is-editing,
.ranking-tile.is-drop-target {
  border-color: color-mix(in srgb, var(--ranking-muted) 38%, transparent);
  background: var(--ranking-hover);
}

.ranking-tile.is-drop-target {
  box-shadow: inset 0 0 0 1px var(--n-primary-color);
}

.ranking-tile.is-dragging {
  opacity: 0.36;
}

.ranking-tile.is-disabled {
  opacity: 0.55;
}

.ranking-drag-handle {
  grid-area: drag;
  display: grid;
  place-items: center;
  width: 24px;
  height: 36px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ranking-muted);
  cursor: grab;
}

.ranking-drag-handle:active {
  cursor: grabbing;
}

.ranking-drag-handle svg {
  width: 16px;
  height: 20px;
  fill: currentColor;
}

.ranking-tile__logo {
  grid-area: logo;
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: contain;
}

.ranking-tile__identity {
  grid-area: name;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ranking-tile__identity strong {
  min-width: 0;
  overflow: hidden;
  color: var(--ranking-text);
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-tile__warning {
  flex: 0 0 auto;
  color: var(--n-warning-color);
  font-size: 9px;
}

.ranking-category-chip {
  grid-area: category;
  justify-self: start;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ranking-muted);
  font: inherit;
  font-size: 10px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.ranking-category-chip:hover:not(:disabled),
.ranking-category-chip.active {
  color: var(--n-primary-color);
}

.ranking-visible-toggle {
  grid-area: toggle;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--ranking-stroke);
  border-radius: 8px;
  background: transparent;
  color: transparent;
  cursor: pointer;
}

.ranking-visible-toggle.active {
  border-color: var(--n-primary-color);
  background: var(--n-primary-color);
  color: var(--ranking-panel);
}

.ranking-visible-toggle svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.ranking-settings__progress {
  display: flex;
  justify-content: center;
  padding: 4px 0 2px;
  color: var(--ranking-muted);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1499px) {
  .ranking-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1099px) {
  .ranking-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 799px) {
  .ranking-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ranking-settings__editor {
    grid-template-columns: 1fr 30px;
  }

  .ranking-settings__editor-select {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

@media (max-width: 559px) {
  .ranking-grid {
    grid-template-columns: 1fr;
  }
}
</style>
