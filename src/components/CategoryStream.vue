<template>
  <section
    class="category-stream"
    :class="{ 'is-compact': compact }"
    :style="streamStyle"
  >
    <div class="category-stream__filters">
      <div class="category-stream__filter category-stream__filter--sources">
        <div class="category-stream__filter-heading">
          <span class="category-stream__filter-label">{{ copy.sources }}</span>
          <div class="category-stream__filter-meta">
            <span class="category-stream__filter-count">{{ sourceSelectionText }}</span>
            <button
              v-if="selectedSourceNames.length"
              type="button"
              class="category-stream__source-reset"
              @click="updateSources([])"
            >
              {{ copy.allSources }}
            </button>
          </div>
        </div>
        <n-select
          :value="selectedSourceNames"
          multiple
          clearable
          filterable
          :max-tag-count="2"
          :options="sourceOptions"
          :placeholder="copy.allSources"
          @update:value="updateSources"
        />
      </div>

      <div class="category-stream__rank-filter">
        <span class="category-stream__filter-label">{{ copy.rankRange }}</span>
        <div class="category-stream__rank-presets">
          <button
            v-for="preset in rankPresets"
            :key="preset.to"
            type="button"
            :class="{ active: rankFrom === 1 && rankTo === preset.to }"
            @click="setRankRange(1, preset.to)"
          >
            Top {{ preset.to }}
          </button>
        </div>
        <div class="category-stream__range-inputs">
          <n-input-number
            :value="rankFrom"
            size="small"
            :min="1"
            :max="99"
            :show-button="false"
            @update:value="updateRankFrom"
          />
          <span>–</span>
          <n-input-number
            :value="rankTo"
            size="small"
            :min="1"
            :max="100"
            :show-button="false"
            @update:value="updateRankTo"
          />
        </div>
      </div>

      <div class="category-stream__filter category-stream__filter--order">
        <span class="category-stream__filter-label">{{ copy.mergeOrder }}</span>
        <n-select
          :value="mergeOrder"
          :options="orderOptions"
          @update:value="updateMergeOrder"
        />
      </div>

      <button
        v-if="hasExplicitFilters"
        type="button"
        class="category-stream__reset"
        @click="resetFilters"
      >
        {{ copy.reset }}
      </button>
    </div>

    <div class="category-stream__status">
      <div>
        <span class="category-stream__status-dot" :class="{ loading: pendingCount }"></span>
        <span>
          {{ statusText }}
        </span>
      </div>
      <n-popover
        v-if="failedCount"
        trigger="hover"
        placement="top-end"
        :show-arrow="false"
      >
        <template #trigger>
          <button
            type="button"
            class="category-stream__retry"
            @click="retryFailed"
          >
            {{ copy.retryFailed.replace("{count}", String(failedCount)) }}
          </button>
        </template>
        <div class="category-stream__failed-popover">
          <strong>{{ copy.failedSources }}</strong>
          <span v-for="label in failedSourceLabels" :key="label">{{ label }}</span>
        </div>
      </n-popover>
    </div>

    <div v-if="!activeSources.length" class="category-stream__empty">
      {{ copy.noSources }}
    </div>

    <div v-else-if="!visibleEntries.length && pendingCount" class="category-stream__skeleton">
      <div v-for="index in 8" :key="index"></div>
    </div>

    <div v-else-if="!visibleEntries.length" class="category-stream__empty">
      {{ queryText ? copy.noSearchResults : copy.noEntries }}
    </div>

    <div v-else class="category-stream__list">
      <article
        v-for="entry in visibleEntries"
        :key="entry.key"
        class="category-stream__row"
      >
        <div class="category-stream__rank" :class="rankTone(entry.rank)">
          <span>#</span>{{ entry.rank }}
        </div>

        <router-link
          class="category-stream__source"
          :to="entry.sourcePath"
          :title="entry.sourceLabel"
        >
          <img
            :src="entry.sourceLogo"
            :alt="entry.sourceLabel"
            @error="handleLogoError"
          />
          <span>{{ entry.sourceLabel }}</span>
        </router-link>

        <a
          class="category-stream__content"
          :href="entry.href"
          :target="linkTarget"
          rel="noopener noreferrer nofollow"
        >
          <div class="category-stream__title">{{ entry.title }}</div>
          <p v-if="!compact && entry.description" class="category-stream__desc">
            {{ entry.description }}
          </p>
          <div v-if="!compact && entry.hot" class="category-stream__meta">
            <span>{{ copy.heat }} {{ entry.hot }}</span>
          </div>
        </a>

        <a
          v-if="!compact && showImages && entry.cover"
          class="category-stream__cover"
          :href="entry.href"
          :target="linkTarget"
          rel="noopener noreferrer nofollow"
        >
          <img
            :src="coverSrc(entry.cover)"
            alt=""
            loading="lazy"
            @error="hideBrokenCover"
          />
        </a>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";
import { getSharedRanking } from "@/utils/rankingCollection";
import {
  buildSourceSubtypeParams,
  getSourceSubtypeOptions,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import {
  getSourceDisplayLabel,
} from "@/utils/sourceLabels";
import {
  buildRankPath,
  getLocaleFromRoute,
  normalizeLocale,
} from "@/utils/locale";
import {
  enhanceReadableResultTitles,
  shouldUseReadableTitleTranslation,
} from "@/utils/readableTitles";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { getCoverDisplaySrc } from "@/utils/imageProxy";

const props = defineProps({
  sources: { type: Array, default: () => [] },
  compact: { type: Boolean, default: false },
});

const route = useRoute();
const router = useRouter();
const store = mainStore();
const { locale: i18nLocale } = useI18n({ useScope: "global" });
const locale = computed(() =>
  normalizeLocale(getLocaleFromRoute(route) || i18nLocale.value),
);

const COPY = {
  "zh-CN": {
    sources: "来源",
    allSources: "全部来源",
    selectedSources: "{selected}/{total}",
    rankRange: "每榜名次",
    failedSources: "失败来源",
    mergeOrder: "融合顺序",
    byRank: "名次优先",
    bySource: "来源分组",
    reset: "重置筛选",
    loaded: "已加载 {loaded}/{total} 个来源 · {entries} 条",
    loading: "正在加载 {loaded}/{total} 个来源 · {entries} 条",
    retryFailed: "重试失败来源（{count}）",
    noSources: "当前筛选没有可用来源",
    noEntries: "当前名次区间没有条目",
    noSearchResults: "没有匹配当前搜索的条目",
    heat: "热度",
  },
  en: {
    sources: "Sources",
    allSources: "All sources",
    selectedSources: "{selected}/{total}",
    rankRange: "Per-source rank",
    failedSources: "Failed sources",
    mergeOrder: "Merge order",
    byRank: "Rank first",
    bySource: "Group by source",
    reset: "Reset filters",
    loaded: "{loaded}/{total} sources loaded · {entries} items",
    loading: "Loading {loaded}/{total} sources · {entries} items",
    retryFailed: "Retry failed sources ({count})",
    noSources: "No sources in the current filter",
    noEntries: "No items in this rank range",
    noSearchResults: "No items match the current search",
    heat: "Heat",
  },
  "zh-TW": {
    sources: "來源",
    allSources: "全部來源",
    selectedSources: "{selected}/{total}",
    rankRange: "每榜名次",
    failedSources: "失敗來源",
    mergeOrder: "融合順序",
    byRank: "名次優先",
    bySource: "來源分組",
    reset: "重設篩選",
    loaded: "已載入 {loaded}/{total} 個來源 · {entries} 條",
    loading: "正在載入 {loaded}/{total} 個來源 · {entries} 條",
    retryFailed: "重試失敗來源（{count}）",
    noSources: "目前篩選沒有可用來源",
    noEntries: "目前名次區間沒有條目",
    noSearchResults: "沒有符合目前搜尋的條目",
    heat: "熱度",
  },
  ja: {
    sources: "ソース",
    allSources: "すべてのソース",
    selectedSources: "{selected}/{total}",
    rankRange: "各ソース順位",
    failedSources: "失敗したソース",
    mergeOrder: "統合順",
    byRank: "順位優先",
    bySource: "ソース別",
    reset: "フィルターをリセット",
    loaded: "{loaded}/{total} ソース読み込み済み · {entries} 件",
    loading: "{loaded}/{total} ソースを読み込み中 · {entries} 件",
    retryFailed: "失敗したソースを再試行（{count}）",
    noSources: "現在の条件に利用可能なソースがありません",
    noEntries: "この順位範囲に項目がありません",
    noSearchResults: "検索条件に一致する項目がありません",
    heat: "注目度",
  },
  ko: {
    sources: "출처",
    allSources: "전체 출처",
    selectedSources: "{selected}/{total}",
    rankRange: "출처별 순위",
    failedSources: "실패한 출처",
    mergeOrder: "통합 순서",
    byRank: "순위 우선",
    bySource: "출처별",
    reset: "필터 초기화",
    loaded: "{loaded}/{total}개 출처 로드 · {entries}개",
    loading: "{loaded}/{total}개 출처 로드 중 · {entries}개",
    retryFailed: "실패한 출처 재시도 ({count})",
    noSources: "현재 필터에 사용 가능한 출처가 없습니다",
    noEntries: "현재 순위 범위에 항목이 없습니다",
    noSearchResults: "현재 검색과 일치하는 항목이 없습니다",
    heat: "인기도",
  },
};
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);

const sourceResults = reactive({});
const sourceStates = reactive({});

const API_LOCALIZED_SOURCE_NAMES = new Set([
  "designarena",
  "clawhub",
  "clawhub-skills",
  "clawhub-plugins",
  "global-indexes",
]);

const queryString = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "").trim();

const selectedSourceNames = computed(() => {
  const raw = queryString(route.query.sources);
  if (!raw) return [];
  const allowed = new Set(props.sources.map((item) => item.name));
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))]
    .filter((name) => allowed.has(name));
});

const activeSources = computed(() => {
  if (!selectedSourceNames.value.length) return props.sources;
  const allowed = new Set(selectedSourceNames.value);
  return props.sources.filter((item) => allowed.has(item.name));
});

const normalizeRank = (value, fallback, max = 100) => {
  const raw = queryString(value);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.round(parsed)));
};
const rankFrom = computed(() => normalizeRank(route.query.from, 1, 99));
const rankTo = computed(() =>
  Math.max(rankFrom.value, normalizeRank(route.query.to, 10, 100)),
);
const mergeOrder = computed(() =>
  route.query.order === "source" ? "source" : "rank",
);
const queryText = computed(() => queryString(route.query.q).toLowerCase());
const rankPresets = [{ to: 5 }, { to: 10 }, { to: 20 }];
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self",
);
const showImages = computed(() => store.showImages);
const streamStyle = computed(() => ({
  "--category-stream-font-size": String(store.listFontSize) + "px",
  "--category-stream-compact-font-size":
    String(Math.max(12, Number(store.listFontSize || 16) - 2)) + "px",
}));
const sourceSelectionText = computed(() =>
  copy.value.selectedSources
    .replace(
      "{selected}",
      String(selectedSourceNames.value.length || props.sources.length),
    )
    .replace("{total}", String(props.sources.length)),
);

const sourceOptions = computed(() =>
  props.sources.map((item) => ({
    value: item.name,
    label: getSourceDisplayLabel(
      item.name,
      locale.value,
      item.label || item.name,
    ),
  })),
);
const orderOptions = computed(() => [
  { value: "rank", label: copy.value.byRank },
  { value: "source", label: copy.value.bySource },
]);

const replaceQuery = (patch = {}) => {
  const query = { ...route.query };
  Object.entries(patch).forEach(([key, value]) => {
    if (value === null || typeof value === "undefined" || value === "") {
      delete query[key];
    } else {
      query[key] = String(value);
    }
  });
  delete query.page;
  router.replace({ path: route.path, query, hash: route.hash });
};

const updateSources = (value = []) => {
  const normalized = [...new Set(value.map(String))].filter((name) =>
    props.sources.some((item) => item.name === name),
  );
  replaceQuery({
    sources:
      normalized.length && normalized.length < props.sources.length
        ? normalized.join(",")
        : null,
  });
};
const setRankRange = (from, to) => {
  const nextFrom = Math.max(1, Math.min(99, Number(from) || 1));
  const nextTo = Math.max(nextFrom, Math.min(100, Number(to) || 10));
  replaceQuery({
    from: nextFrom === 1 ? null : nextFrom,
    to: nextTo === 10 ? null : nextTo,
  });
};
const updateRankFrom = (value) => setRankRange(value, rankTo.value);
const updateRankTo = (value) => setRankRange(rankFrom.value, value);
const updateMergeOrder = (value) =>
  replaceQuery({ order: value === "source" ? "source" : null });
const resetFilters = () =>
  replaceQuery({ sources: null, from: null, to: null, order: null });

const canonicalizeFilterQuery = () => {
  const patch = {};
  const rawSources = queryString(route.query.sources);
  if (rawSources && props.sources.length) {
    const canonicalSources = selectedSourceNames.value.join(",");
    if (
      !canonicalSources ||
      selectedSourceNames.value.length >= props.sources.length
    ) {
      patch.sources = null;
    } else if (canonicalSources !== rawSources) {
      patch.sources = canonicalSources;
    }
  }

  const rawFrom = queryString(route.query.from);
  const rawTo = queryString(route.query.to);
  if (
    rawFrom &&
    (rankFrom.value === 1 || String(rankFrom.value) !== rawFrom)
  ) {
    patch.from = rankFrom.value === 1 ? null : rankFrom.value;
  }
  if (
    rawTo &&
    (rankTo.value === 10 || String(rankTo.value) !== rawTo)
  ) {
    patch.to = rankTo.value === 10 ? null : rankTo.value;
  }
  if (route.query.order && route.query.order !== "source") {
    patch.order = null;
  }

  if (Object.keys(patch).length) {
    replaceQuery(patch);
  }
};

watch(
  () => [
    route.query.sources,
    route.query.from,
    route.query.to,
    route.query.order,
    props.sources.map((item) => item.name).join("|"),
  ],
  () => canonicalizeFilterQuery(),
  { immediate: true },
);

const hasExplicitFilters = computed(
  () =>
    selectedSourceNames.value.length ||
    rankFrom.value !== 1 ||
    rankTo.value !== 10 ||
    mergeOrder.value !== "rank",
);

const normalizeSearchText = (value = "") =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const stripText = (value = "") =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const buildSourceParams = (source) => {
  const subtype = resolveSourceSubtype(
    getSourceSubtypeOptions(source.name),
    readSourceSubtype(source.name),
  );
  const params = buildSourceSubtypeParams(source.name, subtype);
  if (API_LOCALIZED_SOURCE_NAMES.has(source.name)) {
    params.locale = locale.value;
  }
  return params;
};

const loadSource = async (source, force = false) => {
  if (!force && sourceResults[source.name]) return;
  sourceStates[source.name] = "loading";
  const useApi2 =
    source?.useApi2 || source?.api === 2 || source?.api === "api2";
  try {
    const response = await getSharedRanking(
      source.name,
      force,
      buildSourceParams(source),
      {
        useApi2,
        forceNoCache: force,
      },
    );
    if (response?.usedFallback && response?.fallbackSuccess && !useApi2) {
      store.setSourceApi2(source.name, true);
    }
    if (response?.result?.code !== 200) {
      sourceStates[source.name] = "failed";
      store.markUnavailable(source.name);
      return;
    }

    let result = response.result;
    if (shouldUseReadableTitleTranslation(source.name, locale.value)) {
      try {
        result = await enhanceReadableResultTitles(result, locale.value, {
          includeDescriptions: false,
          limit: Math.min(50, Math.max(20, rankTo.value)),
          offset: 0,
          sourceName: source.name,
        });
      } catch {
        // Provider data is already useful; readable titles are best effort.
      }
    }
    sourceResults[source.name] = result;
    sourceStates[source.name] = "loaded";
    store.markAvailable(source.name);
  } catch {
    sourceStates[source.name] = "failed";
    store.markUnavailable(source.name);
  }
};

const loadActiveSources = async ({ forceFailed = false } = {}) => {
  const queue = activeSources.value.filter((source) => {
    if (forceFailed) return sourceStates[source.name] === "failed";
    return !sourceResults[source.name] && sourceStates[source.name] !== "loading";
  });
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const source = queue[cursor++];
      await loadSource(source, forceFailed);
    }
  };
  await Promise.all(
    Array.from(
      { length: Math.min(4, Math.max(1, queue.length)) },
      () => worker(),
    ),
  );
};

watch(
  () =>
    [
      locale.value,
      activeSources.value.map((item) => item.name).join("|"),
    ].join("::"),
  () => {
    void loadActiveSources();
  },
  { immediate: true },
);

const sourceIndex = computed(
  () => new Map(props.sources.map((source, index) => [source.name, index])),
);

const entries = computed(() => {
  const output = [];
  activeSources.value.forEach((source) => {
    const result = sourceResults[source.name];
    const data = Array.isArray(result?.data) ? result.data : [];
    const sourceLabel = getSourceDisplayLabel(
      source.name,
      locale.value,
      source.label || result?.title || source.name,
    );
    const subtype = resolveSourceSubtype(
      getSourceSubtypeOptions(source.name),
      readSourceSubtype(source.name),
    );
    data.forEach((item, index) => {
      const rank = index + 1;
      if (rank < rankFrom.value || rank > rankTo.value) return;
      const title = stripText(item?.title || item?.originalTitle || "");
      const description = stripText(item?.desc || item?.originalDesc || "");
      const hot = stripText(item?.hot || "");
      const href = item?.url || item?.mobileUrl || "";
      output.push({
        ...item,
        key:
          String(item?.id || item?.url || item?.mobileUrl || title) +
          "::" +
          source.name +
          "::" +
          rank,
        sourceName: source.name,
        sourceLabel,
        sourceLogo: getSourceLogo(source.name),
        sourceOrder: sourceIndex.value.get(source.name) ?? 9999,
        sourcePath: buildRankPath(locale.value, source.name, subtype || ""),
        rank,
        title,
        description,
        hot,
        href,
      });
    });
  });
  if (mergeOrder.value === "source") {
    output.sort(
      (left, right) =>
        left.sourceOrder - right.sourceOrder || left.rank - right.rank,
    );
  } else {
    output.sort(
      (left, right) =>
        left.rank - right.rank || left.sourceOrder - right.sourceOrder,
    );
  }
  return output;
});

const visibleEntries = computed(() => {
  const query = queryText.value;
  if (!query) return entries.value;
  return entries.value.filter((entry) =>
    [
      entry.title,
      entry.description,
      entry.hot,
      entry.author,
      entry.sourceLabel,
      entry.sourceName,
      entry.code,
      entry.symbol,
    ].some((value) => normalizeSearchText(value).includes(query)),
  );
});

const loadedCount = computed(
  () =>
    activeSources.value.filter((source) => sourceStates[source.name] === "loaded")
      .length,
);
const failedSources = computed(() =>
  activeSources.value.filter(
    (source) => sourceStates[source.name] === "failed",
  ),
);
const failedCount = computed(() => failedSources.value.length);
const failedSourceLabels = computed(() =>
  failedSources.value.map((source) =>
    getSourceDisplayLabel(
      source.name,
      locale.value,
      source.label || source.name,
    ),
  ),
);
const pendingCount = computed(
  () =>
    activeSources.value.filter((source) => sourceStates[source.name] === "loading")
      .length,
);

const statusText = computed(() => {
  const template = pendingCount.value ? copy.value.loading : copy.value.loaded;
  return template
    .replace("{loaded}", String(loadedCount.value))
    .replace("{total}", String(activeSources.value.length))
    .replace("{entries}", String(visibleEntries.value.length));
});

const retryFailed = () => {
  void loadActiveSources({ forceFailed: true });
};

const rankTone = (rank) => ({
  "is-top": rank <= 3,
  "is-top10": rank > 3 && rank <= 10,
});
const handleLogoError = (event) => {
  if (event.target) event.target.src = getSourceLogoFallback();
};
const coverSrc = (cover) => getCoverDisplaySrc(cover);
const hideBrokenCover = (event) => {
  event.target?.closest?.(".category-stream__cover")?.remove();
};
</script>

<style scoped>
.category-stream {
  display: grid;
  gap: 10px;
}

.category-stream__filters {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  min-height: 58px;
  padding: 10px 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: color-mix(in srgb, var(--n-color, #fff) 97%, transparent);
}

.category-stream__filter {
  display: grid;
  gap: 5px;
}

.category-stream__filter-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.category-stream__filter-meta {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.category-stream__filter-count {
  color: var(--n-text-color-3);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.category-stream__source-reset {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--n-primary-color, #d03050);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.category-stream__filter--sources {
  width: min(330px, 28vw);
}

.category-stream__filter--order {
  width: 150px;
}

.category-stream__filter-label {
  color: var(--n-text-color-3);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.category-stream__rank-filter {
  display: grid;
  gap: 5px;
  min-width: 360px;
}

.category-stream__rank-presets,
.category-stream__range-inputs {
  display: flex;
  align-items: center;
}

.category-stream__rank-presets {
  gap: 4px;
}

.category-stream__rank-presets button {
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-2);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.category-stream__rank-presets button:hover,
.category-stream__rank-presets button.active {
  border-color: color-mix(
    in srgb,
    var(--n-primary-color, #d03050) 52%,
    var(--n-border-color)
  );
  color: var(--n-primary-color, #d03050);
  background: color-mix(
    in srgb,
    var(--n-primary-color, #d03050) 7%,
    transparent
  );
}

.category-stream__rank-filter {
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 34px;
  column-gap: 8px;
}

.category-stream__rank-filter > .category-stream__filter-label {
  grid-column: 1 / -1;
}

.category-stream__rank-presets {
  grid-column: 1 / 2;
}

.category-stream__range-inputs {
  grid-column: 2 / 3;
  gap: 5px;
}

.category-stream__range-inputs :deep(.n-input-number) {
  width: 66px;
}

.category-stream__reset,
.category-stream__retry {
  border: 0;
  background: transparent;
  color: var(--n-primary-color, #d03050);
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.category-stream__failed-popover {
  display: grid;
  gap: 5px;
  min-width: 150px;
  max-width: 260px;
  padding: 2px 0;
}

.category-stream__failed-popover strong {
  margin-bottom: 2px;
  color: var(--n-text-color);
  font-size: 12px;
  font-weight: 650;
}

.category-stream__failed-popover span {
  overflow: hidden;
  color: var(--n-text-color-2);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__reset {
  height: 34px;
  margin-left: auto;
  padding: 0 4px;
}

.category-stream__status {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 4px;
  color: var(--n-text-color-3);
  font-size: 12px;
}

.category-stream__status > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.category-stream__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #18a058;
}

.category-stream__status-dot.loading {
  background: #f0a020;
  animation: category-stream-pulse 1s ease-in-out infinite alternate;
}

.category-stream__list {
  overflow: hidden;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-color, #fff);
}

.category-stream__row {
  display: grid;
  grid-template-columns: 44px 132px minmax(0, 1fr) 108px;
  align-items: center;
  gap: 12px;
  min-height: 84px;
  padding: 10px 14px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--n-border-color) 75%, transparent);
}

.category-stream__row:last-child {
  border-bottom: 0;
}

.category-stream__row:hover {
  background: color-mix(in srgb, var(--n-action-color) 70%, transparent);
}

.category-stream__rank {
  color: var(--n-text-color-3);
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.category-stream__rank span {
  font-size: 10px;
  font-weight: 500;
  margin-right: 1px;
}

.category-stream__rank.is-top {
  color: var(--n-primary-color, #d03050);
}

.category-stream__rank.is-top10 {
  color: var(--n-text-color-2);
}

.category-stream__source {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--n-text-color-2);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}

.category-stream__source img {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  border-radius: 5px;
  object-fit: contain;
}

.category-stream__source span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__content {
  min-width: 0;
  display: block;
  color: var(--n-text-color);
  text-decoration: none;
}

.category-stream__title {
  overflow: hidden;
  font-size: var(--category-stream-font-size, 15px);
  font-weight: 620;
  line-height: 1.42;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__desc {
  display: -webkit-box;
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--n-text-color-3);
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.category-stream__meta {
  margin-top: 3px;
  color: var(--n-text-color-3);
  font-size: 11px;
}

.category-stream__cover {
  width: 108px;
  height: 64px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--n-action-color);
}

.category-stream__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-stream.is-compact .category-stream__row {
  grid-template-columns: 42px 124px minmax(0, 1fr);
  min-height: 48px;
  padding-block: 6px;
}

.category-stream.is-compact .category-stream__title {
  font-size: var(--category-stream-compact-font-size, 13px);
  font-weight: 570;
}

.category-stream.is-compact .category-stream__source img {
  width: 18px;
  height: 18px;
  flex-basis: 18px;
}

.category-stream__empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  border: 1px dashed var(--n-border-color);
  border-radius: 12px;
  color: var(--n-text-color-3);
  font-size: 13px;
}

.category-stream__skeleton {
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
}

.category-stream__skeleton div {
  height: 72px;
  background: linear-gradient(
    100deg,
    var(--n-action-color) 20%,
    color-mix(in srgb, var(--n-action-color) 35%, var(--n-color)) 45%,
    var(--n-action-color) 70%
  );
  background-size: 200% 100%;
  animation: category-stream-shimmer 1.4s linear infinite;
}

@keyframes category-stream-pulse {
  to {
    opacity: 0.35;
  }
}

@keyframes category-stream-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 1100px) {
  .category-stream__filters {
    flex-wrap: wrap;
  }

  .category-stream__filter--sources {
    width: min(400px, 48%);
  }

  .category-stream__rank-filter {
    flex: 1 1 420px;
  }

  .category-stream__row {
    grid-template-columns: 42px 110px minmax(0, 1fr) 96px;
  }

  .category-stream__cover {
    width: 96px;
    height: 58px;
  }
}

@media (max-width: 680px) {
  .category-stream__filters {
    align-items: stretch;
  }

  .category-stream__filter--sources,
  .category-stream__filter--order,
  .category-stream__rank-filter {
    width: 100%;
    min-width: 0;
  }

  .category-stream__rank-filter {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .category-stream__rank-filter > .category-stream__filter-label,
  .category-stream__rank-presets,
  .category-stream__range-inputs {
    grid-column: 1;
  }

  .category-stream__rank-presets {
    grid-row: 2;
  }

  .category-stream__range-inputs {
    grid-row: 3;
  }

  .category-stream__reset {
    margin-left: 0;
    align-self: flex-start;
  }

  .category-stream__row,
  .category-stream.is-compact .category-stream__row {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 8px;
  }

  .category-stream__source {
    grid-column: 2;
    grid-row: 1;
    align-self: start;
    width: fit-content;
  }

  .category-stream__content {
    grid-column: 2;
  }

  .category-stream__cover {
    display: none;
  }
}
</style>
