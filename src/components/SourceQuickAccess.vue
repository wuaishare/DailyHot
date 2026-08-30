<template>
  <section v-if="sources.length" class="source-quick-access no-card-drag">
    <span class="quick-title">{{ t("home.quickAccess") }}</span>
    <div class="quick-items">
      <button
        v-for="source in primarySources"
        :key="source.name"
        type="button"
        class="quick-source"
        :title="displayLabel(source)"
        @click.stop="selectSource(source)"
      >
        <img
          :src="getSourceLogo(source.name)"
          :alt="displayLabel(source)"
          @error="handleLogoError"
        />
        <span>{{ displayLabel(source) }}</span>
      </button>
    </div>
    <n-popover
      v-model:show="panelOpen"
      trigger="click"
      placement="bottom-end"
      :show-arrow="false"
    >
      <template #trigger>
        <n-button size="small" secondary strong round class="all-sources-btn">
          {{ t("home.allSources") }}
        </n-button>
      </template>
      <div class="source-panel" @click.stop>
        <n-input
          v-model:value="searchQuery"
          size="small"
          clearable
          :placeholder="t('home.searchSources')"
        />
        <n-scrollbar class="source-panel-scroll">
          <div v-if="filteredSources.length" class="source-panel-grid">
            <button
              v-for="source in filteredSources"
              :key="source.name"
              type="button"
              class="panel-source"
              @click="selectSource(source)"
            >
              <img
                :src="getSourceLogo(source.name)"
                :alt="displayLabel(source)"
                @error="handleLogoError"
              />
              <span>{{ displayLabel(source) }}</span>
            </button>
          </div>
          <n-empty v-else size="small" :description="t('home.noMatchingSources')" />
        </n-scrollbar>
      </div>
    </n-popover>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { getSourceDisplayLabel, getSourceLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";

const props = defineProps({
  sources: { type: Array, default: () => [] },
});
const emit = defineEmits(["select"]);
const { t, locale } = useI18n({ useScope: "global" });
const panelOpen = ref(false);
const searchQuery = ref("");

const primarySources = computed(() => props.sources.slice(0, 6));
const displayLabel = (source) =>
  getSourceDisplayLabel(source?.name, locale.value, source?.label || source?.name || "");
const filteredSources = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase();
  if (!query) return props.sources;
  return props.sources.filter((source) =>
    `${displayLabel(source)} ${getSourceLabel(source?.name, locale.value, source?.label || "")} ${source?.label || ""} ${source?.name || ""}`
      .toLocaleLowerCase()
      .includes(query)
  );
});
const selectSource = (source) => {
  if (!source?.name) return;
  panelOpen.value = false;
  searchQuery.value = "";
  emit("select", source.name);
};

const handleLogoError = (event) => {
  const target = event?.currentTarget;
  if (!target || target.src.endsWith(getSourceLogoFallback())) return;
  target.src = getSourceLogoFallback();
};
</script>

<style lang="scss" scoped>
.source-quick-access {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  padding: 8px 10px;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--n-card-color) 92%, transparent);
}
.quick-title {
  flex: 0 0 auto;
  padding: 0 2px;
  color: var(--n-text-color-3);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.quick-items {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.quick-source,
.panel-source {
  border: 1px solid transparent;
  background: transparent;
  color: var(--n-text-color);
  cursor: pointer;
}

.quick-source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 132px;
  padding: 5px 8px;
  border-radius: 999px;
}
.quick-source:hover,
.panel-source:hover {
  border-color: rgba(234, 68, 77, 0.38);
  background: rgba(234, 68, 77, 0.08);
}

.quick-source img,
.panel-source img {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  object-fit: contain;
}

.quick-source span,
.panel-source span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.all-sources-btn {
  flex: 0 0 auto;
}

.source-panel {
  width: min(340px, calc(100vw - 40px));
  display: grid;
  gap: 10px;
}

.source-panel-scroll {
  max-height: min(360px, calc(100vh - 180px));
}
.source-panel-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding-right: 4px;
}

.panel-source {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 8px 9px;
  border-radius: 8px;
  text-align: left;
}

@media (max-width: 900px) {
  .quick-source:nth-child(n + 5) {
    display: none;
  }
}

@media (max-width: 680px) {
  .source-quick-access {
    padding: 7px 8px;
  }

  .quick-title {
    display: none;
  }

  .quick-source:nth-child(n + 4) {
    display: none;
  }

  .source-panel-grid {
    grid-template-columns: 1fr;
  }
}
</style>
