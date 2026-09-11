<template>
  <nav
    v-if="visible"
    class="context-toolbar"
    :class="[`is-${store.siteTheme}`, { 'is-compact': store.compactMode }]"
    :aria-label="copy.context"
  >
    <div class="context-toolbar__left">
      <div
        v-if="routeKind === 'home' || routeKind === 'category' || routeKind === 'list'"
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

        <template v-if="routeKind === 'home'">
          <span class="context-breadcrumb__separator" aria-hidden="true">›</span>
          <span class="context-breadcrumb__section">{{ allCategoryLabel }}</span>
        </template>

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
          <span class="context-breadcrumb__item is-current">
            {{ currentSourceLabel }}
          </span>

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
        v-if="routeKind === 'home' || routeKind === 'category'"
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
        v-if="routeKind === 'home' || routeKind === 'category'"
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
import { dropdownSelectionProps } from "@/utils/dropdownSelection";
import {
  getCategoryByRef,
  getSourceCategoryIds,
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
import { useTrendsCatalogRevision } from "@/composables/useTrendsCatalogRevision";
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
    searchCard: "搜索当前范围内的榜单",
    searchStream: "搜索信息流中的新闻条目",
    searchList: "搜索当前榜单中的新闻条目",
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
    searchCard: "Search rankings in the current scope",
    searchStream: "Search news items in the stream",
    searchList: "Search news items in this ranking",
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
    searchCard: "搜尋目前範圍內的榜單",
    searchStream: "搜尋資訊流中的新聞項目",
    searchList: "搜尋目前榜單中的新聞項目",
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
    searchCard: "現在の範囲のランキングを検索",
    searchStream: "ストリーム内のニュース項目を検索",
    searchList: "このランキングのニュース項目を検索",
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
    searchCard: "현재 범위의 랭킹 검색",
    searchStream: "스트림의 뉴스 항목 검색",
    searchList: "현재 랭킹의 뉴스 항목 검색",
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
  ["home", "category", "list", "topic"].includes(routeKind.value),
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
  if (!["home", "category"].includes(routeKind.value)) return "card";
  return store.resolveCategoryViewMode(
    routeKind.value === "category" ? currentCategory.value?.id || null : null,
  );
});
const setViewMode = (mode) => {
  if (!["home", "category"].includes(routeKind.value)) return;
  store.setCategoryViewMode(
    routeKind.value === "category" ? currentCategory.value?.id || null : null,
    mode,
  );
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
const allCategoryLabel = computed(() => getCategoryLabel("全部", locale.value));

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
    props: dropdownSelectionProps(
      String(item.id) === String(currentCategory.value?.id || ""),
      { current: true },
    ),
  }));

const currentSourceLabel = computed(() => {
  const item = currentSourceMeta.value;
  return getSourceDisplayLabel(
    currentSourceName.value,
    locale.value,
    item?.label || currentSourceName.value,
  );
});
const subtypeCatalogRevision = useTrendsCatalogRevision();
const variantOptions = computed(() => {
  subtypeCatalogRevision.value;
  return getSourceSubtypeOptions(currentSourceName.value);
});
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
    props: dropdownSelectionProps(item.value === currentVariant.value, { current: true }),
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
    props: dropdownSelectionProps(topic.id === currentTopic.value?.id, { current: true }),
  })),
);

const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "");
watch(
  () => [
    routeKind.value,
    currentCategory.value?.id || "",
    queryValue(route.query.view),
  ],
  ([kind, categoryId, legacyView]) => {
    if (!["home", "category"].includes(kind) || !legacyView) return;
    if (kind === "category" && !categoryId) return;
    const mode = ["list", "compact", "stream"].includes(legacyView)
      ? "stream"
      : "card";
    store.setCategoryViewMode(kind === "category" ? categoryId : null, mode);
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
    ["home", "category"].includes(routeKind.value) &&
    viewMode.value === "stream"
  ) {
    return copy.value.searchStream;
  }
  return copy.value.searchCard;
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
  --context-surface: oklch(0.985 0.004 285);
  --context-control: oklch(0.955 0.005 285);
  --context-control-hover: oklch(0.935 0.006 285);
  --context-fg: oklch(0.27 0.008 285);
  --context-muted: oklch(0.51 0.008 285);
  --context-icon: oklch(0.44 0.008 285);
  --context-stroke: oklch(0.36 0.008 285 / 16%);
  --context-stroke-hover: oklch(0.34 0.008 285 / 28%);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  min-height: 58px;
  margin: 0 auto 16px;
  padding: 9px 10px 9px 12px;
  border: 1px solid var(--context-stroke);
  border-radius: 14px;
  background: var(--context-surface);
  color: var(--context-fg);
  box-shadow:
    0 1px 2px oklch(0.18 0.008 285 / 5%),
    0 8px 28px oklch(0.18 0.008 285 / 6%);
}

.context-toolbar.is-compact {
  min-height: 38px;
  margin-bottom: 10px;
  padding: 3px 6px 3px 8px;
  gap: 12px;
  border-radius: 10px;
  box-shadow: 0 1px 2px oklch(0.18 0.008 285 / 4%);
}

.context-toolbar.is-compact .context-breadcrumb__home,
.context-toolbar.is-compact .context-breadcrumb__item {
  min-height: 30px;
  font-size: 12px;
}

.context-toolbar.is-compact .context-breadcrumb__home {
  padding-inline: 6px;
}

.context-toolbar.is-compact .context-breadcrumb__item {
  padding-inline: 6px;
}

.context-toolbar.is-compact .context-search,
.context-toolbar.is-compact .context-view-switch,
.context-toolbar.is-compact .context-toolbar__manager {
  height: 32px;
  border-radius: 8px;
}

.context-toolbar.is-compact .context-search {
  padding-left: 9px;
}

.context-toolbar.is-compact .context-view-switch {
  padding: 2px;
}

.context-toolbar.is-compact .context-view-switch button {
  width: 27px;
  height: 26px;
  border-radius: 6px;
}

.context-toolbar.is-compact .context-toolbar__manager {
  padding-inline: 8px;
}

.context-toolbar.is-compact .context-search__icon,
.context-toolbar.is-compact .context-view-switch svg {
  width: 15px;
  height: 15px;
}

.context-toolbar.is-compact .context-toolbar__manager svg {
  width: 16px;
  height: 16px;
}

.context-toolbar.is-dark {
  --context-surface: oklch(0.185 0.008 285);
  --context-control: oklch(0.225 0.008 285);
  --context-control-hover: oklch(0.255 0.009 285);
  --context-fg: oklch(0.9 0.006 285);
  --context-muted: oklch(0.67 0.008 285);
  --context-icon: oklch(0.76 0.008 285);
  --context-stroke: oklch(0.86 0.006 285 / 14%);
  --context-stroke-hover: oklch(0.9 0.006 285 / 24%);
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
  border: 1px solid var(--context-stroke);
  border-radius: 10px;
  background: var(--context-control);
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
  color: var(--context-muted);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.context-view-switch button:hover {
  color: var(--context-fg);
  background: var(--context-control-hover);
}

.context-view-switch button.active {
  color: var(--context-fg);
  background: var(--context-surface);
  box-shadow:
    0 1px 2px oklch(0.18 0.008 285 / 8%),
    inset 0 0 0 1px var(--context-stroke);
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
  border: 1px solid var(--context-stroke);
  border-radius: 10px;
  background: var(--context-control);
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.context-search:hover {
  border-color: var(--context-stroke-hover);
  background: var(--context-control-hover);
}

.context-search.is-focused {
  border-color: color-mix(in srgb, var(--n-primary-color, #d03050) 72%, var(--context-stroke));
  background: var(--context-surface);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--n-primary-color, #d03050) 10%, transparent);
}

.context-search__icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: none;
  color: var(--context-icon);
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.65;
  opacity: 1;
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
  color: var(--context-fg);
  font: inherit;
  font-size: 13px;
}

.context-search input::-webkit-search-cancel-button {
  display: none;
}

.context-search input::placeholder {
  color: var(--context-muted);
}

.context-search__shortcut {
  flex: 0 0 auto;
  padding: 3px 6px;
  border: 1px solid var(--context-stroke);
  border-radius: 5px;
  background: var(--context-surface);
  color: var(--context-muted);
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

.context-toolbar__manager {
  box-sizing: border-box;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--context-stroke);
  border-radius: 10px;
  background: var(--context-control);
  color: var(--context-fg);
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;
}

.context-toolbar__manager:hover {
  border-color: var(--context-stroke-hover);
  background: var(--context-control-hover);
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

  .context-toolbar__manager {
    width: 38px;
    min-width: 38px;
    padding: 0;
  }
}
</style>
