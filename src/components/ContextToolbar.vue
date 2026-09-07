<template>
  <nav v-if="visible" class="context-toolbar" :aria-label="copy.context">
    <div class="context-toolbar__left">
      <div
        v-if="routeKind === 'category' || routeKind === 'list'"
        class="context-breadcrumb"
        :aria-label="copy.breadcrumb"
      >
        <router-link
          :to="withSearch(buildHomePath(locale))"
          class="context-breadcrumb__home"
          :aria-label="copy.home"
          :title="copy.home"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 8.1 9 3l6 5.1v6.4a.5.5 0 0 1-.5.5h-3.2v-4.2H6.7V15H3.5a.5.5 0 0 1-.5-.5V8.1Z" />
          </svg>
          <span>{{ copy.home }}</span>
        </router-link>

        <template v-for="category in categoryTrail" :key="category.id">
          <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
          <n-dropdown
            trigger="manual"
            placement="bottom-start"
            :options="categoryMenuOptions(category)"
            :show="activeBreadcrumbMenu === 'category:' + category.id"
            :menu-props="() => breadcrumbMenuProps('category:' + category.id)"
            @select="switchCategory"
          >
            <div
              class="context-breadcrumb__trigger"
              @mouseenter="openBreadcrumbMenu('category:' + category.id)"
              @mouseleave="scheduleBreadcrumbMenuClose('category:' + category.id)"
            >
              <router-link
                :to="withSearch(buildCategoryPath(locale, category.slug))"
                class="context-breadcrumb__item"
                :class="{ 'is-current': category.id === currentCategory?.id }"
              >
                <span>{{ categoryLabel(category) }}</span>
                <svg
                  v-if="categoryMenuOptions(category).length > 1"
                  class="context-breadcrumb__caret"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path d="m2.5 4.5 3.5 3 3.5-3" />
                </svg>
              </router-link>
            </div>
          </n-dropdown>
        </template>

        <template v-if="routeKind === 'list'">
          <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
          <n-dropdown
            trigger="manual"
            placement="bottom-start"
            :options="sourceMenuOptions"
            :show="activeBreadcrumbMenu === 'source'"
            :menu-props="() => breadcrumbMenuProps('source')"
            @select="switchSource"
          >
            <div
              class="context-breadcrumb__trigger"
              @mouseenter="openBreadcrumbMenu('source')"
              @mouseleave="scheduleBreadcrumbMenuClose('source')"
            >
              <button type="button" class="context-breadcrumb__item is-current">
                <span>{{ currentSourceLabel }}</span>
                <svg
                  v-if="sourceMenuOptions.length > 1"
                  class="context-breadcrumb__caret"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path d="m2.5 4.5 3.5 3 3.5-3" />
                </svg>
              </button>
            </div>
          </n-dropdown>

          <template v-if="variantMenuOptions.length > 1">
            <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
            <n-dropdown
              trigger="manual"
              placement="bottom-start"
              :options="variantMenuOptions"
              :show="activeBreadcrumbMenu === 'variant'"
              :menu-props="() => breadcrumbMenuProps('variant')"
              @select="switchVariant"
            >
              <div
                class="context-breadcrumb__trigger"
                @mouseenter="openBreadcrumbMenu('variant')"
                @mouseleave="scheduleBreadcrumbMenuClose('variant')"
              >
                <button type="button" class="context-breadcrumb__item is-current">
                  <span>{{ currentVariantLabel }}</span>
                  <svg
                    class="context-breadcrumb__caret"
                    viewBox="0 0 12 12"
                    aria-hidden="true"
                  >
                    <path d="m2.5 4.5 3.5 3 3.5-3" />
                  </svg>
                </button>
              </div>
            </n-dropdown>
          </template>
        </template>
      </div>

      <div v-else-if="currentTopic" class="context-breadcrumb">
        <router-link
          :to="withSearch(buildHomePath(locale))"
          class="context-breadcrumb__home"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 8.1 9 3l6 5.1v6.4a.5.5 0 0 1-.5.5h-3.2v-4.2H6.7V15H3.5a.5.5 0 0 1-.5-.5V8.1Z" />
          </svg>
          <span>{{ copy.home }}</span>
        </router-link>
        <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
        <span class="context-breadcrumb__section">{{ copy.topic }}</span>
        <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
        <n-dropdown
          trigger="manual"
          placement="bottom-start"
          :options="topicMenuOptions"
          :show="activeBreadcrumbMenu === 'topic'"
          :menu-props="() => breadcrumbMenuProps('topic')"
          @select="switchTopic"
        >
          <div
            class="context-breadcrumb__trigger"
            @mouseenter="openBreadcrumbMenu('topic')"
            @mouseleave="scheduleBreadcrumbMenuClose('topic')"
          >
            <button type="button" class="context-breadcrumb__item is-current">
              <span>{{ currentTopicLabel }}</span>
              <svg
                class="context-breadcrumb__caret"
                viewBox="0 0 12 12"
                aria-hidden="true"
              >
                <path d="m2.5 4.5 3.5 3 3.5-3" />
              </svg>
            </button>
          </div>
        </n-dropdown>
      </div>

      <div
        v-if="routeKind === 'category' && viewMode === 'stream'"
        class="context-toolbar__filters"
        :aria-label="copy.filters"
      >
        <span class="context-toolbar__filter-label">{{ copy.filters }}</span>
        <n-select
          class="context-toolbar__source-filter"
          size="small"
          multiple
          clearable
          filterable
          :max-tag-count="1"
          :value="selectedSourceNames"
          :options="categorySourceOptions"
          :placeholder="copy.allSources"
          @update:value="updateSources"
        />
        <n-select
          class="context-toolbar__rank-filter"
          size="small"
          :value="rankTo"
          :options="rankOptions"
          @update:value="updateRankTo"
        />
        <button
          v-if="hasStreamFilters"
          type="button"
          class="context-toolbar__filter-reset"
          @click="resetStreamFilters"
        >
          {{ copy.resetFilters }}
        </button>
      </div>
    </div>

    <div class="context-toolbar__right">
      <label
        class="context-search"
        :class="{ 'has-value': Boolean(searchInput), 'is-focused': searchFocused }"
      >
        <svg class="context-search__icon" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="7.6" cy="7.6" r="4.7" />
          <path d="m11.2 11.2 3.6 3.6" />
        </svg>
        <span class="sr-only">{{ copy.search }}</span>
        <input
          ref="searchInputEl"
          v-model="searchInput"
          type="search"
          :placeholder="searchPlaceholder"
          :aria-label="copy.search"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          @input="queueSearchUpdate"
          @keydown.enter.prevent="flushSearchUpdate"
          @keydown.esc.prevent="clearSearch"
        />
        <span v-if="!searchInput" class="context-search__shortcut" aria-hidden="true">
          {{ searchShortcut }}
        </span>
        <button
          v-else
          type="button"
          class="context-search__clear"
          :aria-label="copy.clear"
          @click.prevent="clearSearch"
        >
          <svg viewBox="0 0 14 14" aria-hidden="true">
            <path d="m3.5 3.5 7 7m0-7-7 7" />
          </svg>
        </button>
      </label>

      <div
        v-if="routeKind === 'category'"
        class="context-view-switch"
        role="group"
        :aria-label="copy.viewMode"
      >
        <button
          type="button"
          :class="{ active: viewMode === 'card' }"
          :aria-label="copy.cardView"
          :title="copy.cardView"
          @click="setViewMode('card')"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <rect x="2.5" y="2.5" width="5" height="5" rx="1" />
            <rect x="10.5" y="2.5" width="5" height="5" rx="1" />
            <rect x="2.5" y="10.5" width="5" height="5" rx="1" />
            <rect x="10.5" y="10.5" width="5" height="5" rx="1" />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: viewMode === 'stream' }"
          :aria-label="copy.listView"
          :title="copy.listView"
          @click="setViewMode('stream')"
        >
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 4h2M7.5 4H15M3 9h2M7.5 9H15M3 14h2M7.5 14H15" />
          </svg>
        </button>
      </div>

      <button
        v-if="routeKind === 'category'"
        type="button"
        class="context-toolbar__manager"
        :aria-label="managerButtonLabel"
        :title="managerButtonLabel"
        @click="emit('open-hotboard-manager', managerCategoryId)"
      >
        <svg viewBox="0 0 18 18" aria-hidden="true">
          <rect x="2.5" y="3" width="5" height="4.5" rx="1" />
          <rect x="10.5" y="3" width="5" height="4.5" rx="1" />
          <rect x="2.5" y="10.5" width="5" height="4.5" rx="1" />
          <rect x="10.5" y="10.5" width="5" height="4.5" rx="1" />
        </svg>
        <span>{{ copy.manage }}</span>
      </button>


    </div>
  </nav>
</template>

<script setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { mainStore } from "@/store";
import {
  getCategoryByRef,
  getSourceCategoryIds,
  sourceBelongsToCategory,
} from "@/utils/categoryTree";
import {
  buildCategoryPath,
  buildHomePath,
  buildRankPath,
  getCategoryLabel,
  getLocaleFromRoute,
  getSourceNameBySlug,
  normalizeLocale,
} from "@/utils/locale";
import {
  getDefaultSourceSubtype,
  getSourceSubtypeOptions,
  readSourceSubtype,
  resolveSourceSubtype,
} from "@/utils/sourceSubtypes";
import {
  getSourceDisplayLabel,
  getSubtypeLabel,
} from "@/utils/sourceLabels";
import {
  TOPIC_REGISTRY,
  buildTopicPath,
  getTopicByRouteName,
  getTopicLabel,
} from "@/config/topics";

const emit = defineEmits(["open-hotboard-manager"]);
const route = useRoute();
const router = useRouter();
const store = mainStore();

const COPY = {
  "zh-CN": {
    home: "首页",
    topic: "专题",
    breadcrumb: "当前位置",
    viewMode: "视图",
    cardView: "卡片视图",
    listView: "信息流视图",
    compactView: "紧凑列表",
    filters: "筛选",
    allSources: "全部来源",
    topItems: "Top {count}",
    resetFilters: "重置",
    search: "搜索当前上下文",
    searchCategory: "搜索当前分类中的榜单",
    searchStream: "搜索当前分类聚合内容",
    searchList: "搜索当前榜单内容",
    searchTopic: "搜索当前专题内容",
    clear: "清除搜索",
    manage: "榜单管理",
    manageCurrent: "管理「{category}」分类下的榜单",
    manageAll: "管理全部榜单",
    displayPreferences: "显示偏好",
    compact: "紧凑布局",
    compactTip: "减少卡片间距，提升信息密度",
    images: "显示封面",
    imagesTip: "显示榜单条目的可用封面图片",
    fontSize: "列表字号",
    context: "上下文工具栏",
  },
  en: {
    home: "Home",
    topic: "Topics",
    breadcrumb: "Current location",
    viewMode: "View",
    cardView: "Card view",
    listView: "Stream view",
    compactView: "Compact list",
    filters: "Filter",
    allSources: "All sources",
    topItems: "Top {count}",
    resetFilters: "Reset",
    search: "Search current context",
    searchCategory: "Search rankings in this category",
    searchStream: "Search the aggregated category stream",
    searchList: "Search within this ranking",
    searchTopic: "Search within this topic",
    clear: "Clear search",
    manage: "Manage",
    manageCurrent: "Manage rankings in “{category}”",
    manageAll: "Manage all rankings",
    displayPreferences: "Display preferences",
    compact: "Compact layout",
    compactTip: "Reduce card spacing and increase density",
    images: "Show covers",
    imagesTip: "Show available cover images",
    fontSize: "List font size",
    context: "Context toolbar",
  },
  "zh-TW": {
    home: "首頁",
    topic: "專題",
    breadcrumb: "目前位置",
    viewMode: "檢視",
    cardView: "卡片檢視",
    listView: "資訊流檢視",
    compactView: "緊湊列表",
    filters: "篩選",
    allSources: "全部來源",
    topItems: "Top {count}",
    resetFilters: "重設",
    search: "搜尋目前內容",
    searchCategory: "搜尋目前分類中的榜單",
    searchStream: "搜尋目前分類彙整內容",
    searchList: "搜尋目前榜單內容",
    searchTopic: "搜尋目前專題內容",
    clear: "清除搜尋",
    manage: "榜單管理",
    manageCurrent: "管理「{category}」分類下的榜單",
    manageAll: "管理全部榜單",
    displayPreferences: "顯示偏好",
    compact: "緊湊版面",
    compactTip: "減少卡片間距，提高資訊密度",
    images: "顯示封面",
    imagesTip: "顯示榜單項目的可用封面圖片",
    fontSize: "列表字號",
    context: "內容工具列",
  },
  ja: {
    home: "ホーム",
    topic: "特集",
    breadcrumb: "現在地",
    viewMode: "表示",
    cardView: "カード表示",
    listView: "ストリーム表示",
    compactView: "コンパクトリスト",
    filters: "絞り込み",
    allSources: "すべてのソース",
    topItems: "Top {count}",
    resetFilters: "リセット",
    search: "現在の内容を検索",
    searchCategory: "このカテゴリのランキングを検索",
    searchStream: "カテゴリの統合結果を検索",
    searchList: "このランキング内を検索",
    searchTopic: "この特集内を検索",
    clear: "検索をクリア",
    manage: "管理",
    manageCurrent: "「{category}」のランキングを管理",
    manageAll: "すべてのランキングを管理",
    displayPreferences: "表示設定",
    compact: "コンパクト表示",
    compactTip: "カード間隔を縮めて情報密度を上げます",
    images: "カバーを表示",
    imagesTip: "利用可能なカバー画像を表示します",
    fontSize: "リスト文字サイズ",
    context: "コンテキストツールバー",
  },
  ko: {
    home: "홈",
    topic: "주제",
    breadcrumb: "현재 위치",
    viewMode: "보기",
    cardView: "카드 보기",
    listView: "스트림 보기",
    compactView: "컴팩트 목록",
    filters: "필터",
    allSources: "전체 출처",
    topItems: "Top {count}",
    resetFilters: "초기화",
    search: "현재 컨텍스트 검색",
    searchCategory: "현재 분류의 랭킹 검색",
    searchStream: "현재 분류 통합 결과 검색",
    searchList: "현재 랭킹 내용 검색",
    searchTopic: "현재 주제 내용 검색",
    clear: "검색 지우기",
    manage: "관리",
    manageCurrent: "‘{category}’ 분류 랭킹 관리",
    manageAll: "전체 랭킹 관리",
    displayPreferences: "표시 설정",
    compact: "컴팩트 레이아웃",
    compactTip: "카드 간격을 줄여 정보 밀도를 높입니다",
    images: "커버 표시",
    imagesTip: "사용 가능한 커버 이미지를 표시합니다",
    fontSize: "목록 글꼴 크기",
    context: "컨텍스트 도구 모음",
  },
};

const locale = computed(() => normalizeLocale(getLocaleFromRoute(route)));
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);

const routeKind = computed(() => {
  const name = String(route.name || "");
  if (["home", "home-locale"].includes(name)) return "home";
  if (["category", "category-locale"].includes(name)) return "category";
  if (["list", "list-locale", "list-legacy"].includes(name)) return "list";
  if (name.includes("-topic")) return "topic";
  return "";
});
const visible = computed(() =>
  ["category", "list", "topic"].includes(routeKind.value),
);
const currentTopic = computed(() => getTopicByRouteName(route.name));
const currentTopicLabel = computed(() =>
  currentTopic.value ? getTopicLabel(currentTopic.value, locale.value) : "",
);

const availableCategoryIds = computed(() => {
  const available = new Set();
  store.newsArr
    .filter((item) => item.show)
    .forEach((item) => {
      getSourceCategoryIds(item, store.categories).forEach((id) => {
        let category = getCategoryByRef(store.categories, id);
        const seen = new Set();
        while (category && !seen.has(category.id)) {
          seen.add(category.id);
          available.add(String(category.id));
          category = category.parentId
            ? getCategoryByRef(store.categories, category.parentId)
            : null;
        }
      });
    });
  return available;
});

const routeCategory = computed(() => {
  if (routeKind.value !== "category") return null;
  return getCategoryByRef(store.categories, route.params?.categorySlug);
});
const currentSourceName = computed(() => {
  if (routeKind.value !== "list") return "";
  return getSourceNameBySlug(
    route.params?.sourceSlug ||
      route.query?.type ||
      store.newsArr.find((item) => item.show)?.name ||
      "",
  );
});
const currentSourceMeta = computed(
  () =>
    store.newsArr.find((item) => item.name === currentSourceName.value) ||
    store.defaultNewsArr.find((item) => item.name === currentSourceName.value) ||
    null,
);
const currentSourceCategory = computed(() => {
  const source = currentSourceMeta.value;
  if (!source) return null;
  const [categoryId] = getSourceCategoryIds(source, store.categories);
  return getCategoryByRef(store.categories, categoryId);
});
const currentCategory = computed(() =>
  routeKind.value === "category"
    ? routeCategory.value
    : routeKind.value === "list"
      ? currentSourceCategory.value
      : null,
);

const viewMode = computed(() => {
  if (routeKind.value !== "category") return "card";
  return store.resolveCategoryViewMode(currentCategory.value?.id || null);
});
const setViewMode = (mode) => {
  if (routeKind.value !== "category") return;
  store.setCategoryViewMode(currentCategory.value?.id || null, mode);
  if (route.query.view) {
    const query = { ...route.query };
    delete query.view;
    delete query.page;
    router.replace({ path: route.path, query, hash: route.hash });
  }
};

const categoryTrail = computed(() => {
  const result = [];
  const seen = new Set();
  let node = currentCategory.value;
  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    result.unshift(node);
    node = node.parentId
      ? getCategoryByRef(store.categories, node.parentId)
      : null;
  }
  return result;
});
const categoryLabel = (category) =>
  category?.builtin
    ? getCategoryLabel(category.name, locale.value)
    : category?.name || "";

const siblingCategories = (category) =>
  store.categories
    .filter(
      (item) =>
        String(item.parentId || "") === String(category?.parentId || "") &&
        availableCategoryIds.value.has(String(item.id)),
    )
    .slice()
    .sort((a, b) => a.order - b.order);

const categoryMenuOptions = (category) =>
  siblingCategories(category).map((item) => ({
    key: String(item.id),
    label: categoryLabel(item),
  }));

const sourceMenuOptions = computed(() => {
  const category = currentSourceCategory.value;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) => {
      if (!category) return true;
      return getSourceCategoryIds(item, store.categories).includes(
        String(category.id),
      );
    })
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      key: item.name,
      label: getSourceDisplayLabel(
        item.name,
        locale.value,
        item.label || item.name,
      ),
    }));
});
const currentSourceLabel = computed(() => {
  const item = currentSourceMeta.value;
  return getSourceDisplayLabel(
    currentSourceName.value,
    locale.value,
    item?.label || currentSourceName.value,
  );
});
const variantOptions = computed(() =>
  getSourceSubtypeOptions(currentSourceName.value),
);
const currentVariant = computed(() =>
  resolveSourceSubtype(
    variantOptions.value,
    route.params?.subtypeSlug ||
      route.query?.subtype ||
      getDefaultSourceSubtype(currentSourceName.value),
  ),
);
const variantMenuOptions = computed(() =>
  variantOptions.value.map((item) => ({
    key: item.value,
    label: getSubtypeLabel(item, locale.value),
  })),
);
const currentVariantLabel = computed(() => {
  const item = variantOptions.value.find(
    (option) => option.value === currentVariant.value,
  );
  return item ? getSubtypeLabel(item, locale.value) : "";
});
const topicMenuOptions = computed(() =>
  TOPIC_REGISTRY.map((topic) => ({
    key: topic.id,
    label: getTopicLabel(topic, locale.value),
  })),
);

const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "");
const categorySources = computed(() => {
  if (routeKind.value !== "category") return [];
  const category = currentCategory.value;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) =>
      category
        ? sourceBelongsToCategory(item, category.id, store.categories)
        : true,
    )
    .slice()
    .sort((left, right) => left.order - right.order);
});
const categorySourceOptions = computed(() =>
  categorySources.value.map((item) => ({
    value: item.name,
    label: getSourceDisplayLabel(
      item.name,
      locale.value,
      item.label || item.name,
    ),
  })),
);
const selectedSourceNames = computed(() => {
  const raw = queryValue(route.query.sources).trim();
  if (!raw) return [];
  const allowed = new Set(categorySources.value.map((item) => item.name));
  return [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))]
    .filter((name) => allowed.has(name));
});
const rankTo = computed(() => {
  const value = Number(queryValue(route.query.to));
  return [5, 10, 20, 50].includes(value) ? value : 10;
});
const rankOptions = computed(() =>
  [5, 10, 20, 50].map((count) => ({
    value: count,
    label: copy.value.topItems.replace("{count}", String(count)),
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
const updateSources = (value = []) => {
  const allowed = new Set(categorySources.value.map((item) => item.name));
  const normalized = [...new Set(value.map(String))].filter((name) =>
    allowed.has(name),
  );
  replaceFilterQuery({
    sources:
      normalized.length && normalized.length < categorySources.value.length
        ? normalized.join(",")
        : null,
  });
};
const updateRankTo = (value) => {
  const next = [5, 10, 20, 50].includes(Number(value)) ? Number(value) : 10;
  replaceFilterQuery({
    from: null,
    to: next === 10 ? null : next,
    order: null,
  });
};
const hasStreamFilters = computed(
  () => selectedSourceNames.value.length > 0 || rankTo.value !== 10,
);
const resetStreamFilters = () =>
  replaceFilterQuery({
    sources: null,
    from: null,
    to: null,
    order: null,
  });

watch(
  () => [
    routeKind.value,
    currentCategory.value?.id || "",
    queryValue(route.query.view),
  ],
  ([kind, categoryId, legacyView]) => {
    if (kind !== "category" || !categoryId || !legacyView) return;
    const mode = ["list", "compact", "stream"].includes(legacyView)
      ? "stream"
      : "card";
    store.setCategoryViewMode(categoryId, mode);
    const query = { ...route.query };
    delete query.view;
    delete query.page;
    router.replace({ path: route.path, query, hash: route.hash });
  },
  { immediate: true },
);

const searchInput = ref(queryValue(route.query.q));
const searchInputEl = ref(null);
const searchFocused = ref(false);
const searchShortcut = ref("⌘K");
let searchTimer;
let breadcrumbCloseTimer;
const activeBreadcrumbMenu = ref("");

watch(
  () => route.query.q,
  (value) => {
    const next = queryValue(value);
    if (searchInput.value !== next) searchInput.value = next;
  },
);

const updateSearch = () => {
  clearTimeout(searchTimer);
  const query = { ...route.query };
  const value = searchInput.value.trim();
  if (value) query.q = value;
  else delete query.q;
  delete query.page;
  router.replace({ path: route.path, query, hash: route.hash });
};
const queueSearchUpdate = () => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(updateSearch, 180);
};
const flushSearchUpdate = () => {
  clearTimeout(searchTimer);
  updateSearch();
};
const clearSearch = () => {
  searchInput.value = "";
  flushSearchUpdate();
  searchInputEl.value?.focus();
};
const searchPlaceholder = computed(() => {
  if (routeKind.value === "list") return copy.value.searchList;
  if (routeKind.value === "topic") return copy.value.searchTopic;
  if (
    routeKind.value === "category" &&
    viewMode.value === "stream"
  ) {
    return copy.value.searchStream;
  }
  return copy.value.searchCategory;
});
const currentSearchQuery = () => {
  const q = queryValue(route.query.q).trim();
  return q ? { q } : {};
};
const withSearch = (path) => ({ path, query: currentSearchQuery() });

const cancelBreadcrumbClose = () => {
  clearTimeout(breadcrumbCloseTimer);
  breadcrumbCloseTimer = undefined;
};
const openBreadcrumbMenu = (id) => {
  cancelBreadcrumbClose();
  activeBreadcrumbMenu.value = id;
};
const scheduleBreadcrumbMenuClose = (id) => {
  cancelBreadcrumbClose();
  breadcrumbCloseTimer = window.setTimeout(() => {
    if (activeBreadcrumbMenu.value === id) {
      activeBreadcrumbMenu.value = "";
    }
  }, 140);
};
const breadcrumbMenuProps = (id) => ({
  onMouseenter: () => openBreadcrumbMenu(id),
  onMouseleave: () => scheduleBreadcrumbMenuClose(id),
});
const switchCategory = (categoryId) => {
  activeBreadcrumbMenu.value = "";
  const category = getCategoryByRef(store.categories, categoryId);
  if (!category) return;
  router.push(withSearch(buildCategoryPath(locale.value, category.slug)));
};
const switchSource = (sourceName) => {
  activeBreadcrumbMenu.value = "";
  const subtype = resolveSourceSubtype(
    getSourceSubtypeOptions(sourceName),
    readSourceSubtype(sourceName),
  );
  router.push({
    path: buildRankPath(locale.value, sourceName, subtype || ""),
    query: currentSearchQuery(),
  });
};
const switchVariant = (variant) => {
  activeBreadcrumbMenu.value = "";
  router.push({
    path: buildRankPath(locale.value, currentSourceName.value, variant),
    query: currentSearchQuery(),
  });
};
const switchTopic = (topicId) => {
  activeBreadcrumbMenu.value = "";
  const topic = TOPIC_REGISTRY.find((item) => item.id === topicId);
  if (!topic) return;
  router.push({
    path: buildTopicPath(topic, locale.value),
    query: currentSearchQuery(),
  });
};

const managerCategoryId = computed(() => currentCategory.value?.id || null);
const managerButtonLabel = computed(() => {
  const label = currentCategory.value ? categoryLabel(currentCategory.value) : "";
  return label
    ? copy.value.manageCurrent.replace("{category}", label)
    : copy.value.manageAll;
});

const handleGlobalShortcut = (event) => {
  const target = event.target;
  const editable =
    target?.matches?.("input, textarea, select, [contenteditable='true']") ||
    target?.closest?.("[contenteditable='true']");
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInputEl.value?.focus();
    searchInputEl.value?.select?.();
    return;
  }
  if (!editable && event.key === "/" && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    searchInputEl.value?.focus();
  }
};

onMounted(() => {
  const isMac = /Mac|iPhone|iPad|iPod/i.test(
    navigator?.platform || navigator?.userAgent || "",
  );
  searchShortcut.value = isMac ? "⌘K" : "Ctrl K";
  window.addEventListener("keydown", handleGlobalShortcut);
});
onBeforeUnmount(() => {
  clearTimeout(searchTimer);
  cancelBreadcrumbClose();
  window.removeEventListener("keydown", handleGlobalShortcut);
});

watchEffect(() => {
  if (routeKind.value === "home") {
    if (store.activeCategory !== "全部") store.setActiveCategory("全部");
    return;
  }
  const category = currentCategory.value;
  if (
    (routeKind.value === "category" || routeKind.value === "list") &&
    category?.name &&
    store.activeCategory !== category.name
  ) {
    store.setActiveCategory(category.name);
  }
});
</script>

<style scoped>
.context-toolbar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  min-height: 58px;
  margin: 0 auto 16px;
  padding: 9px 10px 9px 12px;
  border: 1px solid var(--n-border-color);
  border-radius: 14px;
  background: var(--n-color);
  box-shadow:
    0 1px 2px color-mix(in srgb, var(--n-text-color) 4%, transparent),
    0 8px 28px color-mix(in srgb, var(--n-text-color) 4%, transparent);
}

.context-toolbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 auto;
  min-width: 0;
}

.context-toolbar__right,
.context-breadcrumb,
.context-breadcrumb__home,
.context-breadcrumb__item,
.context-breadcrumb__trigger,
.context-search,
.context-toolbar__manager {
  display: flex;
  align-items: center;
}

.context-toolbar__right {
  flex: 0 0 auto;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
}

.context-toolbar__filters {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 0 1 auto;
}

.context-toolbar__filter-label {
  flex: 0 0 auto;
  color: var(--n-text-color-3);
  font-size: 11px;
  font-weight: 650;
}

.context-toolbar__source-filter {
  width: clamp(150px, 13vw, 220px);
}

.context-toolbar__rank-filter {
  width: 94px;
}

.context-toolbar__filter-reset {
  height: 30px;
  padding: 0 7px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--n-primary-color);
  cursor: pointer;
  font-size: 11px;
  font-weight: 650;
}

.context-toolbar__filter-reset:hover {
  background: var(--n-action-color);
}

.context-view-switch {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  height: 38px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--n-border-color, #ddd) 86%, transparent);
  border-radius: 10px;
  background: var(--n-action-color);
}

.context-view-switch button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color-3);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.context-view-switch button:hover {
  color: var(--n-text-color);
  background: color-mix(in srgb, var(--n-color) 82%, var(--n-action-color));
}

.context-view-switch button.active {
  color: var(--n-text-color);
  background: var(--n-color);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.07),
    0 0 0 1px color-mix(in srgb, var(--n-border-color, #ddd) 74%, transparent);
}

.context-view-switch svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.context-breadcrumb {
  min-width: 0;
  gap: 3px;
  overflow: hidden;
  white-space: nowrap;
}

.context-breadcrumb__home,
.context-breadcrumb__item {
  box-sizing: border-box;
  min-height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--n-text-color-2);
  font: inherit;
  font-size: 13px;
  font-weight: 560;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.context-breadcrumb__home {
  gap: 6px;
  padding: 0 8px;
}

.context-breadcrumb__home svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.context-breadcrumb__item {
  gap: 5px;
  max-width: 190px;
  padding: 0 8px;
}

.context-breadcrumb__item > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.context-breadcrumb__home:hover,
.context-breadcrumb__item:hover,
.context-breadcrumb__item:focus-visible {
  color: var(--n-text-color);
  background: var(--n-action-color);
  outline: none;
}

.context-breadcrumb__item.is-current {
  color: var(--n-text-color);
  font-weight: 650;
}

.context-breadcrumb__separator {
  flex: 0 0 auto;
  color: color-mix(in srgb, var(--n-text-color-3) 68%, transparent);
  font-size: 17px;
  font-weight: 300;
  user-select: none;
}

.context-breadcrumb__section {
  padding: 0 5px;
  color: var(--n-text-color-3);
  font-size: 12px;
  font-weight: 550;
}

.context-breadcrumb__caret {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--n-text-color-3);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.context-search {
  box-sizing: border-box;
  gap: 8px;
  width: clamp(280px, 24vw, 360px);
  height: 38px;
  padding: 0 8px 0 11px;
  border: 1px solid color-mix(in srgb, var(--n-border-color, #ddd) 86%, transparent);
  border-radius: 10px;
  background: var(--n-action-color);
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.context-search:hover {
  border-color: color-mix(in srgb, var(--n-text-color-3) 55%, var(--n-border-color));
  background: color-mix(in srgb, var(--n-action-color) 88%, var(--n-color));
}

.context-search.is-focused {
  border-color: color-mix(in srgb, var(--n-primary-color, #d03050) 72%, var(--n-border-color));
  background: var(--n-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--n-primary-color, #d03050) 10%, transparent);
}

.context-search__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--n-text-color-3);
  stroke-linecap: round;
  stroke-width: 1.45;
}

.context-search.is-focused .context-search__icon {
  stroke: var(--n-primary-color, #d03050);
}

.context-search input {
  width: 100%;
  min-width: 0;
  height: 100%;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color);
  font: inherit;
  font-size: 13px;
}

.context-search input::-webkit-search-cancel-button {
  display: none;
}

.context-search input::placeholder {
  color: color-mix(in srgb, var(--n-text-color-3) 88%, transparent);
}

.context-search__shortcut {
  flex: 0 0 auto;
  padding: 3px 6px;
  border: 1px solid color-mix(in srgb, var(--n-border-color) 85%, transparent);
  border-radius: 5px;
  background: color-mix(in srgb, var(--n-color) 78%, transparent);
  color: var(--n-text-color-3);
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}

.context-search__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--n-text-color-3);
  cursor: pointer;
}

.context-search__clear:hover {
  background: var(--n-action-color);
  color: var(--n-text-color);
}

.context-search__clear svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.5;
}

.context-toolbar__manager,
.context-toolbar__manager:hover {
  border-color: color-mix(in srgb, var(--n-text-color-3) 58%, var(--n-border-color));
  background: var(--n-action-color);
  color: var(--n-text-color);
}

.context-toolbar__manager svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.35;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .context-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
    gap: 8px;
  }

  .context-toolbar__left,
  .context-toolbar__right {
    width: 100%;
  }

  .context-toolbar__left {
    flex-wrap: wrap;
  }

  .context-toolbar__filters {
    flex: 1 1 100%;
  }

  .context-toolbar__source-filter {
    flex: 1 1 auto;
    width: auto;
  }

  .context-toolbar__right {
    justify-content: flex-end;
  }

  .context-search {
    flex: 1 1 auto;
    width: auto;
  }
}

@media (max-width: 680px) {
  .context-toolbar {
    margin-bottom: 10px;
    padding: 7px;
    border-radius: 11px;
  }

  .context-breadcrumb {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .context-breadcrumb::-webkit-scrollbar {
    display: none;
  }

  .context-breadcrumb__home span,
  .context-toolbar__manager span,
  .context-search__shortcut {
    display: none;
  }

  .context-breadcrumb__home {
    padding-inline: 7px;
  }

  .context-breadcrumb__item {
    max-width: 150px;
  }

  .context-toolbar__right {
    gap: 6px;
  }

  .context-view-switch {
    flex: 0 0 auto;
  }

  .context-view-switch button {
    width: 30px;
  }

  .context-search {
    min-width: 0;
  }

  .context-toolbar__manager,
  .context-toolbar__display {
    width: 38px;
    min-width: 38px;
    padding: 0;
  }
}
</style>
