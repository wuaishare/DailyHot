<template>
  <section
    class="category-stream"
    :class="{
      'is-compact': store.compactMode,
      'shows-images': showImages,
      'shows-descriptions': showDescriptions,
      'is-minimal': minimalMode,
      'is-source-page': sourcePageMode,
    }"
    :style="streamStyle"
  >
    <div class="category-stream__status">
      <div>
        <span class="category-stream__status-dot" :class="{ loading: pendingCount }"></span>
        <span>{{ statusText }}</span>
      </div>
      <n-popover v-if="failedCount" trigger="hover" placement="top-end" :show-arrow="false">
        <template #trigger>
          <button type="button" class="category-stream__retry" @click="retryFailed">
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
      <aside class="category-stream__rail category-stream__source-rail" :aria-label="copy.sourceNavigation">
        <div class="category-stream__rail-card">
          <div class="category-stream__rail-title">
            <div>
              <strong>{{ copy.sourceNavigation }}</strong>
              <span>{{ props.sources.length }}</span>
            </div>
          </div>

          <nav class="category-stream__toc" :aria-label="copy.sourceNavigation">
            <div
              v-for="source in props.sources"
              :key="source.name"
              class="category-stream__toc-source"
              :class="{ active: isActiveTocSource(source.name) }"
            >
              <router-link
                class="category-stream__toc-source-link"
                :to="sourceNavigationPathFor(source)"
                :aria-current="isActiveTocSource(source.name) ? 'page' : undefined"
              >
                <img
                  :src="getSourceLogo(source.name)"
                  :alt="sourceLabelFor(source)"
                  @error="handleLogoError"
                />
                <span>{{ sourceLabelFor(source) }}</span>
                <i
                  v-if="isActiveTocSource(source.name) && sourceTocItemCount(source.name) > 1"
                  class="category-stream__toc-caret"
                  aria-hidden="true"
                >⌄</i>
              </router-link>

              <div
                v-if="isActiveTocSource(source.name) && sourceTocItemCount(source.name) > 1"
                class="category-stream__toc-children"
              >
                <section
                  v-for="group in sourceTocGroups(source.name)"
                  :key="group.key || group.label"
                  class="category-stream__toc-group"
                >
                  <span
                    v-if="sourceTocGroups(source.name).length > 1 && group.label"
                    class="category-stream__toc-group-label"
                  >{{ group.label }}</span>
                  <router-link
                    v-for="item in group.items || []"
                    :key="item.value"
                    class="category-stream__toc-child"
                    :class="{ active: isActiveTocVariant(source.name, item.value) }"
                    :to="sourceVariantPathFor(source.name, item.value)"
                    :aria-current="isActiveTocVariant(source.name, item.value) ? 'page' : undefined"
                  >
                    <span class="category-stream__toc-marker" aria-hidden="true"></span>
                    <span>{{ item.label }}</span>
                  </router-link>
                </section>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      <div class="category-stream__main">
        <div v-if="!visibleEntries.length && pendingCount" class="category-stream__skeleton">
          <div v-for="index in 8" :key="index"></div>
        </div>

        <div v-else-if="!visibleEntries.length" class="category-stream__empty">
          {{ queryText ? copy.noSearchResults : copy.noEntries }}
        </div>

        <div v-else class="category-stream__list">
          <article v-for="entry in pagedEntries" :key="entry.key" class="category-stream__row">
            <div
              class="category-stream__rank"
              :class="rankTone(entry.rank, entry.isPinned)"
              :title="entry.isPinned ? '置顶' : undefined"
            >
              <UiGlyph v-if="entry.isPinned" class="category-stream__pin-icon" name="pin" aria-hidden="true" />
              <template v-else><span>#</span>{{ entry.rank }}</template>
            </div>

            <a
              v-if="!minimalMode && showImages && entry.cover"
              class="category-stream__media is-cover"
              :href="entry.href"
              :target="linkTarget"
              rel="noopener noreferrer nofollow"
            >
              <img :src="coverSrc(entry.cover)" alt="" loading="lazy" @error="hideBrokenMedia" />
            </a>
            <router-link
              v-else-if="!minimalMode"
              class="category-stream__media is-logo"
              :to="entry.sourcePath"
              :title="entry.sourceLabel"
            >
              <img :src="entry.sourceLogo" :alt="entry.sourceLabel" @error="handleLogoError" />
            </router-link>

            <div class="category-stream__content-wrap">
              <router-link
                v-if="!sourcePageMode && !minimalMode"
                class="category-stream__source-line"
                :to="entry.sourcePath"
              >
                {{ entry.sourceLabel }}
              </router-link>
              <a
                class="category-stream__content"
                :href="entry.href"
                :target="linkTarget"
                rel="noopener noreferrer nofollow"
              >
                <div class="category-stream__title-row">
                  <span v-if="minimalMode && !sourcePageMode" class="category-stream__source-inline">
                    {{ entry.sourceLabel }}
                  </span>
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
                          'has-icon': Boolean(resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)),
                        },
                      ]"
                      role="img"
                      :title="badge.label"
                      :aria-label="badge.label"
                    >
                      <img
                        v-if="resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)"
                        :src="resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)"
                        alt=""
                        loading="lazy"
                        @error="handleRankingBadgeImageError(resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors))"
                      />
                      <span v-else aria-hidden="true">{{ badge.label }}</span>
                    </span>
                  </span>
                  <div class="category-stream__title">{{ entry.title }}</div>
                  <span v-if="entry.suffixBadges.length" class="category-stream__badges notranslate" translate="no">
                    <span
                      v-for="(badge, badgeIndex) in entry.suffixBadges"
                      :key="`${badge.kind}-${badge.sourceCode || badge.label}-${badgeIndex}`"
                      class="category-stream__badge"
                      :class="[
                        `is-${badge.kind}`,
                        {
                          'is-strong': badge.prominence === 'strong',
                          'is-animated': badge.animated,
                          'has-icon': Boolean(resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)),
                        },
                      ]"
                      role="img"
                      :title="badge.label"
                      :aria-label="badge.label"
                    >
                      <img
                        v-if="resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)"
                        :src="resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors)"
                        alt=""
                        loading="lazy"
                        @error="handleRankingBadgeImageError(resolveRankingBadgeIconUrl(badge, rankingBadgeImageErrors))"
                      />
                      <span v-else aria-hidden="true">{{ badge.label }}</span>
                    </span>
                  </span>
                </div>
                <p v-if="showDescriptions && entry.description" class="category-stream__desc">
                  {{ entry.description }}
                </p>
                <div v-if="showDescriptions && entry.hot" class="category-stream__meta">
                  <span>{{ copy.heat }} {{ entry.hot }}</span>
                </div>
              </a>
            </div>
          </article>
        </div>
      </div>

      <aside class="category-stream__controls" :aria-label="copy.browseSettings">
        <div class="category-stream__controls-card">
          <strong class="category-stream__controls-title">{{ copy.browseSettings }}</strong>

          <div v-if="!sourcePageMode" class="category-stream__source-scope">
            <span>{{ copy.sourceScope }}</span>
            <n-select
              size="tiny"
              multiple
              clearable
              :max-tag-count="1"
              :value="sourceFilterValue"
              :options="sourceFilterOptions"
              :placeholder="copy.allSources"
              @update:value="updateSourceFilter"
            />
          </div>

          <label class="category-stream__control-row">
            <span>{{ copy.perPage }}</span>
            <n-select
              size="tiny"
              :show-checkmark="false"
              :value="pageSize"
              :options="pageSizeOptions"
              @update:value="updatePageSize"
            />
          </label>

          <div v-if="pageCount > 1" class="category-stream__pagination-block">
            <span>{{ copy.pagination }}</span>
            <n-pagination
              size="small"
              :page="currentPage"
              :page-count="pageCount"
              :page-slot="3"
              @update:page="updatePage"
            />
          </div>

          <label v-if="!sourcePageMode" class="category-stream__control-row">
            <span>{{ copy.rankRange }}</span>
            <n-select
              size="tiny"
              :show-checkmark="false"
              :value="rankTo"
              :options="rankOptions"
              @update:value="updateRankTo"
            />
          </label>

          <div class="category-stream__display-options">
            <span>{{ copy.display }}</span>
            <n-checkbox :checked="showDescriptions" @update:checked="setShowDescriptions">
              {{ copy.summary }}
            </n-checkbox>
            <n-checkbox :checked="showImages" @update:checked="setShowImages">
              {{ copy.images }}
            </n-checkbox>
          </div>

          <p v-if="minimalMode" class="category-stream__minimal-hint">{{ copy.minimalHint }}</p>
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
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  getSourceSubtypeOptions,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import {
  getSourceDisplayLabel,
  localizeSubtypeGroups,
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
import { normalizeRankingBadges, resolveRankingBadgeIconUrl } from "@/utils/rankingBadges";
import UiGlyph from "@/components/ui/UiGlyph.vue";
import { DATA_REFRESH_EVENT } from "@/utils/dataRefresh";
import { useTrendsCatalogRevision } from "@/composables/useTrendsCatalogRevision";

const props = defineProps({
  sources: { type: Array, default: () => [] },
  sourcePageSource: { type: String, default: "" },
});

const route = useRoute();
const router = useRouter();
const store = mainStore();
const rankingBadgeImageErrors = reactive({});
const subtypeCatalogRevision = useTrendsCatalogRevision();
const { locale: i18nLocale } = useI18n({ useScope: "global" });
const locale = computed(() =>
  normalizeLocale(getLocaleFromRoute(route) || i18nLocale.value),
);

const COPY = {
  "zh-CN": {
    sources: "来源",
    sourceNavigation: "榜单来源",
    browseSettings: "浏览设置",
    sourceScope: "来源范围",
    perPage: "每页数量",
    pagination: "页码",
    display: "显示内容",
    summary: "摘要",
    images: "图片",
    minimalHint: "已进入单行快速浏览模式",
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
    sourceNavigation: "Ranking sources",
    browseSettings: "Browse settings",
    sourceScope: "Source scope",
    perPage: "Per page",
    pagination: "Pages",
    display: "Display",
    summary: "Summary",
    images: "Images",
    minimalHint: "Single-line quick scan mode",
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
    sourceNavigation: "榜單來源",
    browseSettings: "瀏覽設定",
    sourceScope: "來源範圍",
    perPage: "每頁數量",
    pagination: "頁碼",
    display: "顯示內容",
    summary: "摘要",
    images: "圖片",
    minimalHint: "已進入單行快速瀏覽模式",
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
    sourceNavigation: "ランキングソース",
    browseSettings: "表示設定",
    sourceScope: "ソース範囲",
    perPage: "1ページ",
    pagination: "ページ",
    display: "表示内容",
    summary: "概要",
    images: "画像",
    minimalHint: "1行クイックスキャンモード",
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
    sourceNavigation: "랭킹 출처",
    browseSettings: "보기 설정",
    sourceScope: "출처 범위",
    perPage: "페이지당",
    pagination: "페이지",
    display: "표시 내용",
    summary: "요약",
    images: "이미지",
    minimalHint: "한 줄 빠른 탐색 모드",
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
  if (sourcePageMode.value) {
    return allowedSourceNames.value.has(props.sourcePageSource)
      ? [props.sourcePageSource]
      : [];
  }
  const raw = sourceQuery.value;
  if (raw && raw !== "all") {
    return [
      ...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean)),
    ].filter((name) => allowedSourceNames.value.has(name));
  }
  return [];
});

const showingAllSources = computed(
  () =>
    !sourcePageMode.value &&
    (sourceQuery.value === "all" || selectedSourceNames.value.length === 0),
);

const activeSources = computed(() => {
  if (sourcePageMode.value) {
    return props.sources.filter((item) => item.name === props.sourcePageSource);
  }
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
const PAGE_SIZE_VALUES = [20, 30, 50, 100];
const pageSize = computed(() => {
  const value = Number(queryString(route.query.size));
  return PAGE_SIZE_VALUES.includes(value) ? value : 30;
});
const pageSizeOptions = computed(() =>
  PAGE_SIZE_VALUES.map((value) => ({ value, label: String(value) })),
);
const currentPage = computed(() =>
  Math.max(1, Math.round(Number(queryString(route.query.page)) || 1)),
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
const sourceFilterOptions = computed(() =>
  props.sources.map((source) => ({
    value: source.name,
    label: sourceLabelFor(source),
  })),
);
const sourceFilterValue = computed(() =>
  sourcePageMode.value || showingAllSources.value ? [] : selectedSourceNames.value,
);
const updateSourceFilter = (value = []) => {
  if (sourcePageMode.value) return;
  const next = [...new Set((Array.isArray(value) ? value : []).map(String))]
    .filter((name) => allowedSourceNames.value.has(name));
  replaceFilterQuery({
    sources: next.length && next.length < props.sources.length ? next.join(",") : null,
  });
};
const currentTocSourceName = computed(() =>
  sourcePageMode.value ? props.sourcePageSource : "",
);
const currentTocSubtype = computed(() => {
  subtypeCatalogRevision.value;
  const sourceName = currentTocSourceName.value;
  if (!sourceName) return "";
  const options = getSourceSubtypeOptions(sourceName);
  const requested = route.params?.subtypeSlug || route.query?.subtype;
  return (
    resolveSourceSubtype(options, requested || getDefaultSourceSubtype(sourceName)) ||
    getDefaultSourceSubtype(sourceName) ||
    ""
  );
});
const sourceTocGroups = (sourceName) => {
  subtypeCatalogRevision.value;
  return localizeSubtypeGroups(getSourceSubtypeGroups(sourceName), locale.value)
    .map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => item?.value),
    }))
    .filter((group) => group.items.length);
};
const sourceTocItemCount = (sourceName) =>
  sourceTocGroups(sourceName).reduce((total, group) => total + group.items.length, 0);
const isActiveTocSource = (sourceName) => currentTocSourceName.value === sourceName;
const isActiveTocVariant = (sourceName, value) =>
  isActiveTocSource(sourceName) && currentTocSubtype.value === value;
const sourceNavigationPathFor = (source) => {
  subtypeCatalogRevision.value;
  return buildRankPath(
    locale.value,
    source.name,
    getDefaultSourceSubtype(source.name) || "",
  );
};
const sourceVariantPathFor = (sourceName, variant) =>
  buildRankPath(locale.value, sourceName, variant || "");
const updatePageSize = (value) => {
  const next = PAGE_SIZE_VALUES.includes(Number(value)) ? Number(value) : 30;
  replaceFilterQuery({ size: next === 30 ? null : next });
};
const updatePage = (value) => {
  const next = Math.max(1, Math.round(Number(value) || 1));
  const query = { ...route.query };
  if (next > 1) query.page = String(next);
  else delete query.page;
  router.replace({ path: route.path, query, hash: route.hash });
};
const queryText = computed(() => queryString(route.query.q).toLowerCase());
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self",
);
const showImages = computed(() => store.showImages);
const showDescriptions = computed(() => store.showStreamDescriptions !== false);
const minimalMode = computed(() => !showImages.value && !showDescriptions.value);
const setShowImages = (value) => {
  store.showImages = Boolean(value);
};
const setShowDescriptions = (value) => {
  store.showStreamDescriptions = Boolean(value);
};
const streamStyle = computed(() => {
  const dark = store.siteTheme === "dark";
  return {
    "--category-stream-font-size": String(store.listFontSize) + "px",
    "--category-stream-compact-font-size":
      String(Math.max(12, Number(store.listFontSize || 16) - 2)) + "px",
    "--category-stream-primary": dark ? "#ff737a" : "#ea444d",
    "--category-stream-panel": dark ? "#18181c" : "#ffffff",
    "--category-stream-action": dark
      ? "rgba(255, 255, 255, 0.065)"
      : "rgba(31, 34, 37, 0.045)",
    "--category-stream-border": dark
      ? "rgba(255, 255, 255, 0.13)"
      : "rgba(31, 34, 37, 0.12)",
    "--category-stream-text": dark
      ? "rgba(255, 255, 255, 0.92)"
      : "rgba(31, 34, 37, 0.92)",
    "--category-stream-text-2": dark
      ? "rgba(255, 255, 255, 0.72)"
      : "rgba(31, 34, 37, 0.72)",
    "--category-stream-text-3": dark
      ? "rgba(255, 255, 255, 0.54)"
      : "rgba(31, 34, 37, 0.56)",
  };
});
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
  subtypeCatalogRevision.value;
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

watch(
  () => subtypeCatalogRevision.value,
  () => {
    const targets = sourcePageMode.value && props.sourcePageSource
      ? [props.sourcePageSource]
      : activeSources.value.map((source) => source.name);
    for (const sourceName of targets) {
      delete sourceResults[sourceName];
      sourceStates[sourceName] = "idle";
    }
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
      if (
        !sourcePageMode.value &&
        !isPinned &&
        (rank < rankFrom.value || rank > rankTo.value)
      ) return;
      if (!sourcePageMode.value && isPinned && rankFrom.value > 1) return;
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
const pageCount = computed(() =>
  Math.max(1, Math.ceil(visibleEntries.value.length / pageSize.value)),
);
const pagedEntries = computed(() => {
  const start = (Math.min(currentPage.value, pageCount.value) - 1) * pageSize.value;
  return visibleEntries.value.slice(start, start + pageSize.value);
});
watch(
  () => [currentPage.value, pageCount.value],
  ([page, total]) => {
    if (page > total) updatePage(total);
  },
);

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
const hideBrokenMedia = (event) => {
  const media = event.target?.closest?.(".category-stream__media");
  if (!media) return;
  media.classList.remove("is-cover");
  media.classList.add("is-logo");
  event.target.src = getSourceLogoFallback();
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
  color: var(--category-stream-primary);
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
  color: var(--category-stream-text);
  font-size: 12px;
  font-weight: 650;
}

.category-stream__failed-popover span {
  overflow: hidden;
  color: var(--category-stream-text-2);
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
  width: 100%;
  margin-inline: auto;
  padding: 0 4px;
  color: var(--category-stream-text-3);
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

.category-stream__main {
  min-width: 0;
}

.category-stream__list {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--category-stream-border);
  border-radius: 12px;
  background: var(--category-stream-panel);
}

.category-stream__rail-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 2px 5px 8px;
  color: var(--category-stream-text);
  font-size: 12px;
}

.category-stream__rail-title > div {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.category-stream__rail-title span {
  color: var(--category-stream-text-3);
  font-variant-numeric: tabular-nums;
}

.category-stream__row:last-child {
  border-bottom: 0;
}

.category-stream__row:hover {
  background: color-mix(in srgb, var(--category-stream-action) 70%, transparent);
}

.category-stream__rank {
  color: var(--category-stream-text-3);
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
  color: var(--category-stream-primary, #ea444d);
}

.category-stream__rank.is-top10 {
  color: var(--category-stream-text-2);
}

.category-stream__rank.is-pinned {
  display: flex;
  align-items: center;
}

.category-stream__pin-icon {
  display: block;
  width: 20px;
  height: 20px;
  color: var(--category-stream-primary);
  stroke-width: 1.9;
}

.category-stream__content {
  min-width: 0;
  display: block;
  color: var(--category-stream-text);
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
  position: relative;
  isolation: isolate;
  min-width: 20px;
  height: 20px;
  border: 1px solid rgba(164, 16, 10, 0.48);
  border-radius: 4px;
  background: linear-gradient(180deg, #d52a1f 0%, #b8150d 100%);
  box-shadow:
    0 1px 2px rgba(111, 8, 4, 0.28),
    0 3px 9px rgba(211, 36, 27, 0.32),
    0 0 13px rgba(255, 74, 58, 0.18);
  font-size: 12px;
  font-weight: 850;
  line-height: 18px;
  text-shadow: 0 1px 1px rgba(96, 5, 0, 0.28);
  transform: translateY(-1px);
}

.category-stream__badge.is-explosive::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: -4px;
  border-radius: 7px;
  background: rgba(245, 52, 39, 0.18);
  filter: blur(5px);
  pointer-events: none;
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
  background: color-mix(in srgb, var(--category-stream-text) 68%, transparent);
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
  color: var(--category-stream-text-3);
  font-size: 12px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.category-stream__meta {
  margin-top: 3px;
  color: var(--category-stream-text-3);
  font-size: 11px;
}

.category-stream.is-compact .category-stream__title {
  font-size: var(--category-stream-compact-font-size, 13px);
  font-weight: 570;
}

.category-stream__empty {
  display: grid;
  place-items: center;
  min-height: 220px;
  border: 1px dashed var(--category-stream-border);
  border-radius: 12px;
  color: var(--category-stream-text-3);
  font-size: 13px;
}

.category-stream__skeleton {
  display: grid;
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--category-stream-border);
  border-radius: 12px;
}

.category-stream__skeleton div {
  height: 72px;
  background: linear-gradient(
    100deg,
    var(--category-stream-action) 20%,
    color-mix(in srgb, var(--category-stream-action) 35%, var(--category-stream-panel)) 45%,
    var(--category-stream-action) 70%
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


.category-stream__toc {
  display: grid;
  gap: 2px;
}

.category-stream__toc-source {
  min-width: 0;
  border-radius: 8px;
}

.category-stream__toc-source-link {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) 14px;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 5px 7px;
  border-radius: 8px;
  color: var(--category-stream-text-2);
  font-size: 12px;
  font-weight: 620;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.category-stream__toc-source-link:hover {
  background: var(--category-stream-action);
  color: var(--category-stream-text);
}

.category-stream__toc-source.active > .category-stream__toc-source-link {
  background: color-mix(in srgb, var(--category-stream-primary) 11%, var(--category-stream-action));
  color: var(--category-stream-primary);
  box-shadow: inset 2px 0 0 var(--category-stream-primary);
}

.category-stream__toc-source-link img {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
}

.category-stream__toc-source-link > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__toc-caret {
  color: var(--category-stream-text-3);
  font-size: 11px;
  font-style: normal;
  text-align: center;
}

.category-stream__toc-children {
  display: grid;
  gap: 2px;
  margin: 3px 4px 6px 17px;
  padding: 2px 0 2px 12px;
  border-left: 1px solid color-mix(in srgb, var(--category-stream-border) 82%, transparent);
}

.category-stream__toc-group {
  display: grid;
  gap: 1px;
}

.category-stream__toc-group + .category-stream__toc-group {
  margin-top: 5px;
}

.category-stream__toc-group-label {
  padding: 3px 7px 2px;
  color: var(--category-stream-text-3);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.category-stream__toc-child {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 3px 7px;
  border-radius: 6px;
  color: var(--category-stream-text-3);
  font-size: 11px;
  font-weight: 560;
  text-decoration: none;
}

.category-stream__toc-child:hover {
  background: var(--category-stream-action);
  color: var(--category-stream-text);
}

.category-stream__toc-child.active {
  background: color-mix(in srgb, var(--category-stream-primary) 9%, transparent);
  color: var(--category-stream-primary);
  font-weight: 700;
}

.category-stream__toc-marker {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--category-stream-text-3) 48%, transparent);
}

.category-stream__toc-child.active .category-stream__toc-marker {
  background: var(--category-stream-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--category-stream-primary) 12%, transparent);
}

.category-stream__source-scope {
  display: grid;
  gap: 7px;
  color: var(--category-stream-text-3);
  font-size: 11px;
}

/* Three-column stream layout: sources / content / browsing controls. */
.category-stream__body {
  display: grid;
  grid-template-columns: 280px minmax(520px, 720px) 280px;
  justify-content: center;
  align-items: start;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  margin-inline: auto;
}

.category-stream__rail,
.category-stream__controls {
  position: sticky;
  top: 82px;
  min-width: 0;
}

.category-stream__rail-card,
.category-stream__controls-card {
  max-height: calc(100vh - 110px);
  overflow: auto;
  border: 1px solid var(--category-stream-border);
  border-radius: 12px;
  background: var(--category-stream-panel);
}

.category-stream__rail-card {
  padding: 10px;
}

.category-stream__controls-card {
  display: grid;
  gap: 12px;
  padding: 12px;
}

.category-stream__controls-title {
  color: var(--category-stream-text);
  font-size: 12px;
  font-weight: 700;
}

.category-stream__control-row,
.category-stream__pagination-block,
.category-stream__display-options {
  display: grid;
  gap: 7px;
  color: var(--category-stream-text-3);
  font-size: 11px;
}

.category-stream__control-row {
  grid-template-columns: minmax(0, 1fr) 92px;
  align-items: center;
}

.category-stream__pagination-block {
  padding-block: 2px 4px;
  border-bottom: 1px solid color-mix(in srgb, var(--category-stream-border) 72%, transparent);
}

.category-stream__pagination-block :deep(.n-pagination) {
  flex-wrap: wrap;
  row-gap: 5px;
}

.category-stream__display-options {
  padding-top: 2px;
  border-top: 1px solid color-mix(in srgb, var(--category-stream-border) 72%, transparent);
}

.category-stream__display-options :deep(.n-checkbox) {
  margin: 0;
}

.category-stream__minimal-hint {
  margin: 0;
  color: var(--category-stream-primary);
  font-size: 10px;
  line-height: 1.45;
}

.category-stream__row,
.category-stream.shows-images .category-stream__row,
.category-stream.is-compact .category-stream__row,
.category-stream.is-compact.shows-images .category-stream__row {
  grid-template-columns: 42px 92px minmax(0, 1fr);
  gap: 12px;
  min-height: 78px;
  padding: 9px 12px;
}

.category-stream.is-compact .category-stream__row,
.category-stream.is-compact.shows-images .category-stream__row {
  min-height: 62px;
  padding-block: 6px;
}

.category-stream.is-minimal .category-stream__row,
.category-stream.is-minimal.is-compact .category-stream__row {
  box-sizing: border-box;
  grid-template-columns: 42px minmax(0, 1fr);
  height: 42px;
  min-height: 42px;
  overflow: hidden;
  padding-block: 3px;
}

.category-stream__media {
  display: grid;
  place-items: center;
  width: 92px;
  height: 56px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--category-stream-action);
  text-decoration: none;
}

.category-stream__media img {
  display: block;
  width: 100%;
  height: 100%;
}

.category-stream__media.is-cover img {
  object-fit: cover;
}

.category-stream__media.is-logo img {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  object-fit: contain;
}

.category-stream__content-wrap {
  min-width: 0;
  align-self: center;
}

.category-stream__source-line {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 3px;
  overflow: hidden;
  color: var(--category-stream-text-3);
  font-size: 10px;
  font-weight: 650;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream__source-line:hover {
  color: var(--category-stream-primary);
}

.category-stream__source-inline {
  flex: 0 0 auto;
  max-width: 92px;
  overflow: hidden;
  padding: 1px 5px;
  border-radius: 5px;
  background: var(--category-stream-action);
  color: var(--category-stream-text-3);
  font-size: 10px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-stream.is-minimal .category-stream__content-wrap,
.category-stream.is-minimal .category-stream__content,
.category-stream.is-minimal .category-stream__title-row {
  min-width: 0;
}

.category-stream.is-minimal .category-stream__title-row {
  flex-wrap: nowrap;
}

.category-stream.is-minimal .category-stream__title {
  line-height: 1.3;
}

@media (max-width: 1280px) {
  .category-stream__body {
    grid-template-columns: 220px minmax(0, 1fr) 220px;
    gap: 12px;
  }

  .category-stream__row,
  .category-stream.shows-images .category-stream__row,
  .category-stream.is-compact .category-stream__row,
  .category-stream.is-compact.shows-images .category-stream__row {
    grid-template-columns: 40px 82px minmax(0, 1fr);
  }

  .category-stream__media {
    width: 82px;
    height: 50px;
  }

  .category-stream.is-minimal .category-stream__row,
  .category-stream.is-minimal.is-compact .category-stream__row {
    grid-template-columns: 40px minmax(0, 1fr);
  }
}

@media (max-width: 1120px) {
  .category-stream__body {
    grid-template-columns: 190px minmax(0, 1fr);
  }

  .category-stream__source-rail {
    grid-column: 1;
    grid-row: 1;
  }

  .category-stream__main {
    grid-column: 2;
    grid-row: 1;
  }

  .category-stream__controls {
    position: static;
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .category-stream__controls-card {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    align-items: start;
    max-height: none;
  }

  .category-stream__display-options {
    border-top: 0;
  }

  .category-stream__minimal-hint {
    align-self: center;
  }
}

@media (max-width: 820px) {
  .category-stream__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .category-stream__source-rail,
  .category-stream__main,
  .category-stream__controls {
    position: static;
    grid-column: 1;
    grid-row: auto;
  }

  .category-stream__source-rail {
    order: 1;
  }

  .category-stream__controls {
    order: 2;
  }

  .category-stream__main {
    order: 3;
  }

  .category-stream__rail-card {
    max-height: 220px;
  }

  .category-stream__controls-card {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .category-stream__row,
  .category-stream.shows-images .category-stream__row,
  .category-stream.is-compact .category-stream__row,
  .category-stream.is-compact.shows-images .category-stream__row {
    grid-template-columns: 34px 68px minmax(0, 1fr);
    gap: 8px;
    min-height: 66px;
    padding-inline: 9px;
  }

  .category-stream__media {
    display: grid;
    width: 68px;
    height: 44px;
  }

  .category-stream__media.is-logo img {
    width: 26px;
    height: 26px;
  }

  .category-stream.is-minimal .category-stream__row,
  .category-stream.is-minimal.is-compact .category-stream__row {
    grid-template-columns: 34px minmax(0, 1fr);
    height: 40px;
    min-height: 40px;
    padding-block: 2px;
  }

  .category-stream__controls-card {
    grid-template-columns: minmax(0, 1fr);
  }

  .category-stream__source-line {
    margin-bottom: 2px;
  }
}
</style>
