<template>
  <section
    class="category-stream"
    :class="{ 'is-compact': store.compactMode, 'shows-images': showImages }"
    :style="streamStyle"
  >
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

    <div v-if="!props.sources.length" class="category-stream__empty">
      {{ copy.noSources }}
    </div>

    <div v-else class="category-stream__body">
      <div class="category-stream__main">
        <div
          v-if="!visibleEntries.length && pendingCount"
          class="category-stream__skeleton"
        >
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
            <div
              class="category-stream__rank"
              :class="rankTone(entry.rank, entry.isPinned)"
              :title="entry.isPinned ? '置顶' : undefined"
            >
              <span v-if="entry.isPinned" class="category-stream__pin-icon" aria-hidden="true"></span>
              <template v-else><span>#</span>{{ entry.rank }}</template>
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
              <div class="category-stream__title-row">
                <span
                  v-if="entry.inlinePrefixBadges.length"
                  class="category-stream__badges is-prefix notranslate"
                  translate="no"
                >
                  <span
                    v-for="(badge, badgeIndex) in entry.inlinePrefixBadges"
                    :key="`prefix-${badge.kind}-${badge.sourceCode || badge.label}-${badgeIndex}`"
                    class="category-stream__badge"
                    :class="[
                      `is-${badge.kind}`,
                      {
                        'is-strong': badge.prominence === 'strong',
                        'has-icon': Boolean(badge.iconUrl) && !rankingBadgeImageErrors[badge.iconUrl],
                      },
                    ]"
                    role="img"
                    :title="badge.label"
                    :aria-label="badge.label"
                  >
                    <img
                      v-if="badge.iconUrl && !rankingBadgeImageErrors[badge.iconUrl]"
                      :src="badge.iconUrl"
                      alt=""
                      loading="lazy"
                      @error="handleRankingBadgeImageError(badge.iconUrl)"
                    />
                    <span v-else aria-hidden="true">{{ badge.label }}</span>
                  </span>
                </span>
                <div class="category-stream__title">{{ entry.title }}</div>
                <span
                  v-if="entry.suffixBadges.length"
                  class="category-stream__badges notranslate"
                  translate="no"
                >
                  <span
                    v-for="(badge, badgeIndex) in entry.suffixBadges"
                    :key="`${badge.kind}-${badge.sourceCode || badge.label}-${badgeIndex}`"
                    class="category-stream__badge"
                    :class="[
                      `is-${badge.kind}`,
                      {
                        'is-strong': badge.prominence === 'strong',
                        'is-animated': badge.animated,
                        'has-icon': Boolean(badge.iconUrl) && !rankingBadgeImageErrors[badge.iconUrl],
                      },
                    ]"
                    role="img"
                    :title="badge.label"
                    :aria-label="badge.label"
                  >
                    <img
                      v-if="badge.iconUrl && !rankingBadgeImageErrors[badge.iconUrl]"
                      :src="badge.iconUrl"
                      alt=""
                      loading="lazy"
                      @error="handleRankingBadgeImageError(badge.iconUrl)"
                    />
                    <span v-else aria-hidden="true">{{ badge.label }}</span>
                  </span>
                </span>
              </div>
              <p v-if="entry.description" class="category-stream__desc">
                {{ entry.description }}
              </p>
              <div v-if="entry.hot" class="category-stream__meta">
                <span>{{ copy.heat }} {{ entry.hot }}</span>
              </div>
            </a>

            <a
              v-if="showImages && entry.cover"
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
      </div>

      <aside class="category-stream__rail" :aria-label="copy.sources">
        <div class="category-stream__rail-card">
          <div class="category-stream__rail-title">
            <div>
              <strong>{{ copy.sources }}</strong>
              <span>{{ activeSources.length }}/{{ props.sources.length }}</span>
            </div>
            <button
              v-if="hasRailFilters"
              type="button"
              class="category-stream__rail-reset"
              @click="resetRailFilters"
            >
              {{ copy.reset }}
            </button>
          </div>

          <div class="category-stream__rail-rank">
            <span>{{ copy.rankRange }}</span>
            <n-select
              size="tiny"
              :value="rankTo"
              :options="rankOptions"
              @update:value="updateRankTo"
            />
          </div>

          <button
            type="button"
            class="category-stream__rail-source is-all"
            :class="{ active: showingAllSources }"
            @click="showAllSources"
          >
            <span class="category-stream__rail-check" aria-hidden="true">
              {{ showingAllSources ? "✓" : "" }}
            </span>
            <span>{{ copy.allSources }}</span>
            <i class="category-stream__rail-count">{{ props.sources.length }}</i>
          </button>

          <button
            v-for="source in props.sources"
            :key="source.name"
            type="button"
            class="category-stream__rail-source"
            :class="{ active: isSourceSelected(source.name) }"
            @click="selectRailSource(source)"
          >
            <span class="category-stream__rail-check" aria-hidden="true">
              {{ isSourceSelected(source.name) ? "✓" : "" }}
            </span>
            <img
              :src="getSourceLogo(source.name)"
              :alt="sourceLabelFor(source)"
              @error="handleLogoError"
            />
            <span>{{ sourceLabelFor(source) }}</span>
            <i
              class="category-stream__rail-state"
              :class="sourceStates[source.name] || 'idle'"
              aria-hidden="true"
            ></i>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch,
} from "vue";
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
import { normalizeRankingBadges } from "@/utils/rankingBadges";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";

const props = defineProps({
  sources: { type: Array, default: () => [] },
  sourcePageSource: { type: String, default: "" },
});

const route = useRoute();
const router = useRouter();
const store = mainStore();
const rankingBadgeImageErrors = reactive({});
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

const sourceQuery = computed(() => queryString(route.query.sources));
const sourcePageMode = computed(() => Boolean(props.sourcePageSource));
const allowedSourceNames = computed(
  () => new Set(props.sources.map((item) => item.name)),
);
const selectedSourceNames = computed(() => {
  const raw = sourceQuery.value;
  if (raw && raw !== "all") {
    return [
      ...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean)),
    ].filter((name) => allowedSourceNames.value.has(name));
  }
  if (
    !raw &&
    sourcePageMode.value &&
    allowedSourceNames.value.has(props.sourcePageSource)
  ) {
    return [props.sourcePageSource];
  }
  return [];
});

const showingAllSources = computed(
  () =>
    sourceQuery.value === "all" ||
    (!sourcePageMode.value && selectedSourceNames.value.length === 0),
);

const activeSources = computed(() => {
  if (showingAllSources.value) return props.sources;
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
const rankOptions = computed(() =>
  [5, 10, 20, 50].map((count) => ({
    value: count,
    label: `TOP ${count}`,
  })),
);
const replaceFilterQuery = (patch = {}) => {
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
const updateRankTo = (value) => {
  const next = [5, 10, 20, 50].includes(Number(value)) ? Number(value) : 10;
  replaceFilterQuery({
    from: null,
    to: next === 10 ? null : next,
    order: null,
  });
};
const isSourceSelected = (name) =>
  showingAllSources.value || selectedSourceNames.value.includes(name);
const showAllSources = () => {
  replaceFilterQuery({ sources: sourcePageMode.value ? "all" : null });
};
const selectRailSource = (source) => {
  if (sourcePageMode.value) {
    const query = { ...route.query };
    delete query.sources;
    delete query.page;
    router.push({
      path: sourcePathFor(source),
      query,
      hash: route.hash,
    });
    return;
  }

  if (showingAllSources.value) {
    replaceFilterQuery({ sources: source.name });
    return;
  }
  const next = new Set(selectedSourceNames.value);
  if (next.has(source.name)) next.delete(source.name);
  else next.add(source.name);
  replaceFilterQuery({
    sources:
      next.size > 0 && next.size < props.sources.length
        ? [...next].join(",")
        : null,
  });
};
const hasRailFilters = computed(
  () =>
    (sourcePageMode.value
      ? Boolean(sourceQuery.value)
      : !showingAllSources.value) ||
    rankFrom.value !== 1 ||
    rankTo.value !== 10,
);
const resetRailFilters = () =>
  replaceFilterQuery({
    sources: sourcePageMode.value ? null : null,
    from: null,
    to: null,
    order: null,
  });
const queryText = computed(() => queryString(route.query.q).toLowerCase());
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self",
);
const showImages = computed(() => store.showImages);
const streamStyle = computed(() => ({
  "--category-stream-font-size": String(store.listFontSize) + "px",
  "--category-stream-compact-font-size":
    String(Math.max(12, Number(store.listFontSize || 16) - 2)) + "px",
}));
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

const sourceSubtypeFor = (sourceName) => {
  const routeSubtype =
    sourcePageMode.value && sourceName === props.sourcePageSource
      ? route.params?.subtypeSlug || route.query?.subtype
      : "";
  return resolveSourceSubtype(
    getSourceSubtypeOptions(sourceName),
    routeSubtype || readSourceSubtype(sourceName),
  );
};

const buildSourceParams = (source) => {
  const subtype = sourceSubtypeFor(source.name);
  const params = buildSourceSubtypeParams(source.name, subtype);
  if (API_LOCALIZED_SOURCE_NAMES.has(source.name)) {
    params.locale = locale.value;
  }
  return params;
};

const sourceLabelFor = (source) =>
  getSourceDisplayLabel(
    source.name,
    locale.value,
    source.label || source.name,
  );
const sourcePathFor = (source) =>
  buildRankPath(locale.value, source.name, sourceSubtypeFor(source.name) || "");

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

watch(
  () => [
    props.sourcePageSource,
    route.params?.subtypeSlug || "",
    route.query?.subtype || "",
  ],
  () => {
    if (!sourcePageMode.value || !props.sourcePageSource) return;
    delete sourceResults[props.sourcePageSource];
    sourceStates[props.sourcePageSource] = "idle";
    void loadActiveSources();
  },
);

const handleDataRefresh = async () => {
  await Promise.all(activeSources.value.map((source) => loadSource(source, true)));
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener(DATA_REFRESH_EVENT, handleDataRefresh);
  }
});

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
    let nextDisplayRank = 1;
    data.forEach((item) => {
      const rankingBadges = normalizeRankingBadges(item?.badges);
      const prefixBadges = rankingBadges.filter((badge) => badge.placement === "prefix");
      const suffixBadges = rankingBadges.filter((badge) => badge.placement !== "prefix");
      const isPinned = prefixBadges.some((badge) => badge.kind === "pinned");
      if (isPinned && !store.showPinnedRankings) return;
      const inlinePrefixBadges = prefixBadges.filter((badge) => badge.kind !== "pinned");
      const rank = isPinned ? null : nextDisplayRank++;
      if (!isPinned && (rank < rankFrom.value || rank > rankTo.value)) return;
      if (isPinned && rankFrom.value > 1) return;
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
          (isPinned ? "pinned" : rank),
        sourceName: source.name,
        sourceLabel,
        sourceLogo: getSourceLogo(source.name),
        sourceOrder: sourceIndex.value.get(source.name) ?? 9999,
        sourcePath: sourcePathFor(source),
        rank,
        isPinned,
        inlinePrefixBadges,
        suffixBadges,
        title,
        description,
        hot,
        href,
      });
    });
  });
  output.sort(
    (left, right) =>
      left.sourceOrder - right.sourceOrder || left.rank - right.rank,
  );
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

const rankTone = (rank, isPinned = false) => ({
  "is-pinned": isPinned,
  "is-top": !isPinned && rank <= 3,
  "is-top10": !isPinned && rank > 3 && rank <= 10,
});
const handleRankingBadgeImageError = (iconUrl) => {
  if (iconUrl) rankingBadgeImageErrors[iconUrl] = true;
};
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

.category-stream__retry {
  border: 0;
  background: transparent;
  color: var(--n-primary-color);
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
}

.category-stream__retry:hover {
  text-decoration: underline;
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

.category-stream__status {
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: min(100%, 1178px);
  margin-inline: auto;
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

.category-stream__body {
  display: grid;
  grid-template-columns: minmax(0, 920px) 240px;
  justify-content: center;
  align-items: start;
  gap: 18px;
  width: 100%;
}

.category-stream__main {
  min-width: 0;
}

.category-stream__list {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-color);
}

.category-stream__rail {
  position: sticky;
  top: 82px;
  min-width: 0;
}

.category-stream__rail-card {
  display: grid;
  gap: 3px;
  max-height: calc(100vh - 110px);
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  background: var(--n-color);
}

.category-stream__rail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 5px 8px;
  color: var(--n-text-color);
  font-size: 12px;
}

.category-stream__rail-title > div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.category-stream__rail-title span {
  color: var(--n-text-color-3);
  font-variant-numeric: tabular-nums;
}

.category-stream__rail-reset {
  border: 0;
  background: transparent;
  color: var(--n-text-color-3);
  font: inherit;
  cursor: pointer;
}

.category-stream__rail-reset:hover {
  color: var(--n-primary-color);
}

.category-stream__rail-rank {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px;
  align-items: center;
  gap: 8px;
  margin: 0 2px 6px;
  padding: 7px 5px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--n-border-color) 72%, transparent);
  color: var(--n-text-color-3);
  font-size: 11px;
}

.category-stream__rail-source {
  appearance: none;
  display: grid;
  grid-template-columns: 18px 20px minmax(0, 1fr) 8px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 0 7px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--n-text-color-2);
  text-align: left;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.category-stream__rail-source.is-all {
  grid-template-columns: 18px minmax(0, 1fr) auto;
  margin-bottom: 3px;
}

.category-stream__rail-source:hover,
.category-stream__rail-source.active {
  background: var(--n-action-color);
  color: var(--n-text-color);
}

.category-stream__rail-source.active {
  box-shadow: inset 2px 0 0 var(--n-primary-color);
}

.category-stream__rail-check {
  display: grid;
  place-items: center;
  width: 16px;
  height: 16px;
  border: 1px solid var(--n-border-color);
  border-radius: 4px;
  color: #fff;
  font-size: 10px;
  line-height: 1;
}

.category-stream__rail-source.active .category-stream__rail-check {
  border-color: var(--n-primary-color);
  background: var(--n-primary-color);
}

.category-stream__rail-count {
  color: var(--n-text-color-3);
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.category-stream__rail-source img {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  object-fit: contain;
}

.category-stream__rail-source span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__rail-state {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--n-border-color);
}

.category-stream__rail-state.loaded {
  background: #18a058;
}

.category-stream__rail-state.loading {
  background: #f0a020;
}

.category-stream__rail-state.failed {
  background: #d03050;
}


.category-stream__row {
  display: grid;
  grid-template-columns: 44px 132px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-height: 84px;
  padding: 10px 14px;
  border-bottom: 1px solid
    color-mix(in srgb, var(--n-border-color) 75%, transparent);
}

.category-stream.shows-images .category-stream__row {
  grid-template-columns: 44px 132px minmax(0, 1fr) 108px;
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

.category-stream__rank.is-pinned {
  display: flex;
  align-items: center;
}

.category-stream__pin-icon {
  display: block;
  width: 24px;
  height: 24px;
  background: center / contain no-repeat url("/icons/ranking-pinned.png");
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

.category-stream__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.category-stream__title {
  min-width: 0;
  overflow: hidden;
  font-size: var(--category-stream-font-size, 15px);
  font-weight: 620;
  line-height: 1.42;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__badges {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  line-height: 1;
}

.category-stream__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 4px;
  box-sizing: border-box;
  color: #fff;
  background: #ff3852;
  font-size: 11px;
  font-weight: 750;
  line-height: 18px;
}

.category-stream__badge.is-hot,
.category-stream__badge.is-boiling {
  background: #ff9406;
}

.category-stream__badge.is-explosive {
  min-width: 20px;
  height: 20px;
  border-radius: 3px;
  background: linear-gradient(135deg, #f04438, #c81e1e);
  box-shadow: 0 2px 8px color-mix(in srgb, #c81e1e 36%, transparent);
  font-size: 12px;
  font-weight: 800;
}

.category-stream__badge.is-interpretation,
.category-stream__badge.is-depth {
  background: linear-gradient(135deg, #4d7cff, #6d5ce7);
}

.category-stream__badge.is-rumor {
  background: #2788f5;
}

.category-stream__badge.is-challenge {
  background: #ff4b7d;
}

.category-stream__badge.is-commercial {
  background: #00a6d9;
}

.category-stream__badge.is-category,
.category-stream__badge.is-source {
  background: color-mix(in srgb, var(--n-text-color) 68%, transparent);
}

.category-stream__badge.has-icon {
  min-width: 18px;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.category-stream__badge img {
  display: block;
  width: auto;
  max-width: 38px;
  height: 18px;
  object-fit: contain;
}

.category-stream__badge.is-hot-live img {
  width: 20px;
  max-width: 20px;
  height: 20px;
}

.category-stream__badge.is-animated img {
  animation: category-ranking-badge-live 1.25s ease-in-out infinite;
  transform-origin: 50% 80%;
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
  min-height: 64px;
  padding-block: 7px;
}

.category-stream.is-compact.shows-images .category-stream__row {
  grid-template-columns: 42px 124px minmax(0, 1fr) 82px;
}

.category-stream.is-compact .category-stream__cover {
  width: 82px;
  height: 50px;
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

@media (max-width: 1199px) {
  .category-stream__body {
    grid-template-columns: minmax(0, 940px);
  }

  .category-stream__rail {
    position: static;
    order: -1;
  }

  .category-stream__rail-card {
    max-height: 240px;
  }
}

@media (max-width: 1100px) {
  .category-stream.shows-images .category-stream__row {
    grid-template-columns: 42px 110px minmax(0, 1fr) 96px;
  }

  .category-stream__cover {
    width: 96px;
    height: 58px;
  }

  .category-stream.is-compact.shows-images .category-stream__row {
    grid-template-columns: 42px 110px minmax(0, 1fr) 82px;
  }

  .category-stream.is-compact .category-stream__cover {
    width: 82px;
    height: 50px;
  }
}

@media (max-width: 680px) {
  .category-stream__row,
  .category-stream.shows-images .category-stream__row,
  .category-stream.is-compact .category-stream__row,
  .category-stream.is-compact.shows-images .category-stream__row {
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

@keyframes category-ranking-badge-live {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  45% {
    transform: translateY(-2px) scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-stream__badge.is-animated img {
    animation: none !important;
  }
}
</style>
