<template>
  <nav v-if="visible" class="context-toolbar" :aria-label="copy.context">
    <div class="context-toolbar__left">
      <TopicSwitcher
        v-if="currentTopic"
        class="context-toolbar__topics"
        :active-topic="currentTopic.id"
        :locale="locale"
      />

      <div
        v-else-if="routeKind === 'category' && secondLevelOptions.length"
        class="context-toolbar__levels"
      >
        <div class="context-toolbar__level">
          <span class="context-toolbar__level-label">{{ copy.subcategory }}</span>
          <div class="context-toolbar__rail">
            <router-link
              :to="withSearch(buildCategoryPath(locale, rootCategory.slug))"
              class="context-toolbar__chip"
              :class="{ 'is-active': !activeSecondCategory }"
            >
              {{ copy.all }}
            </router-link>
            <router-link
              v-for="category in secondLevelOptions"
              :key="category.id"
              :to="withSearch(buildCategoryPath(locale, category.slug))"
              class="context-toolbar__chip"
              :class="{ 'is-active': category.id === activeSecondCategory?.id }"
            >
              {{ categoryLabel(category) }}
            </router-link>
          </div>
        </div>

        <div
          v-if="activeSecondCategory && thirdLevelOptions.length"
          class="context-toolbar__level context-toolbar__level--detail"
        >
          <span class="context-toolbar__level-divider" aria-hidden="true"></span>
          <span class="context-toolbar__level-label">{{ copy.detail }}</span>
          <div class="context-toolbar__rail">
            <router-link
              :to="withSearch(buildCategoryPath(locale, activeSecondCategory.slug))"
              class="context-toolbar__chip"
              :class="{ 'is-active': !activeThirdCategory }"
            >
              {{ copy.all }}
            </router-link>
            <router-link
              v-for="category in thirdLevelOptions"
              :key="category.id"
              :to="withSearch(buildCategoryPath(locale, category.slug))"
              class="context-toolbar__chip"
              :class="{ 'is-active': category.id === activeThirdCategory?.id }"
            >
              {{ categoryLabel(category) }}
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="routeKind === 'list'" class="context-toolbar__list-nav">
        <router-link
          v-if="currentSourceCategory"
          :to="withSearch(buildCategoryPath(locale, currentSourceCategory.slug))"
          class="context-toolbar__back"
          :aria-label="copy.backCategory"
          :title="copy.backCategory"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="m9.5 3.5-4.5 4.5 4.5 4.5" />
          </svg>
          <span>{{ copy.category }}</span>
        </router-link>

        <n-dropdown
          trigger="click"
          :options="sourceMenuOptions"
          @select="switchSource"
        >
          <button
            type="button"
            class="context-toolbar__select"
            :aria-label="copy.source"
          >
            <span class="context-toolbar__select-label">{{ copy.source }}</span>
            <strong>{{ currentSourceLabel }}</strong>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="m2.5 4.5 3.5 3 3.5-3" />
            </svg>
          </button>
        </n-dropdown>

        <n-dropdown
          v-if="variantMenuOptions.length"
          trigger="click"
          :options="variantMenuOptions"
          @select="switchVariant"
        >
          <button
            type="button"
            class="context-toolbar__select"
            :aria-label="copy.variant"
          >
            <span class="context-toolbar__select-label">{{ copy.variant }}</span>
            <strong>{{ currentVariantLabel }}</strong>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="m2.5 4.5 3.5 3 3.5-3" />
            </svg>
          </button>
        </n-dropdown>
      </div>
    </div>

    <div class="context-toolbar__right">
      <label class="context-toolbar__search">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3 3" />
        </svg>
        <span class="sr-only">{{ copy.search }}</span>
        <input
          v-model="searchInput"
          type="search"
          :placeholder="searchPlaceholder"
          :aria-label="copy.search"
          @input="queueSearchUpdate"
          @keydown.enter.prevent="flushSearchUpdate"
          @keydown.esc.prevent="clearSearch"
        />
        <button
          v-if="searchInput"
          type="button"
          class="context-toolbar__clear"
          :aria-label="copy.clear"
          @click="clearSearch"
        >
          ×
        </button>
      </label>

      <n-popover trigger="click" placement="bottom-end" :show-arrow="false">
        <template #trigger>
          <button
            type="button"
            class="context-toolbar__display"
            :aria-label="copy.displayPreferences"
            :title="copy.displayPreferences"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 4h10M3 8h10M3 12h10" />
              <circle cx="6" cy="4" r="1.2" />
              <circle cx="10" cy="8" r="1.2" />
              <circle cx="7" cy="12" r="1.2" />
            </svg>
          </button>
        </template>

        <div class="context-toolbar__preferences">
          <strong>{{ copy.displayPreferences }}</strong>
          <label class="context-toolbar__preference-row">
            <span>
              <b>{{ copy.compact }}</b>
              <small>{{ copy.compactTip }}</small>
            </span>
            <n-switch v-model:value="store.compactMode" size="small" />
          </label>
          <label class="context-toolbar__preference-row">
            <span>
              <b>{{ copy.images }}</b>
              <small>{{ copy.imagesTip }}</small>
            </span>
            <n-switch v-model:value="store.showImages" size="small" />
          </label>
          <div class="context-toolbar__font-size">
            <div>
              <b>{{ copy.fontSize }}</b>
              <span>{{ store.listFontSize }}px</span>
            </div>
            <n-slider
              v-model:value="store.listFontSize"
              :tooltip="false"
              :min="14"
              :max="20"
              :step="1"
            />
          </div>
        </div>
      </n-popover>
    </div>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import TopicSwitcher from "@/components/TopicSwitcher.vue";
import { mainStore } from "@/store";
import {
  getCategoryByRef,
  getSourceCategoryIds,
} from "@/utils/categoryTree";
import {
  buildCategoryPath,
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
import { getTopicByRouteName } from "@/config/topics";

const route = useRoute();
const router = useRouter();
const store = mainStore();

const COPY = {
  "zh-CN": {
    all: "全部",
    category: "分类",
    subcategory: "分类",
    detail: "细分",
    backCategory: "返回所属分类",
    source: "来源",
    variant: "榜单",
    search: "搜索当前上下文",
    searchCategory: "搜索当前分类榜单",
    searchList: "搜索当前榜单",
    searchTopic: "搜索当前专题",
    clear: "清除搜索",
    displayPreferences: "显示偏好",
    compact: "紧凑布局",
    compactTip: "减少卡片间距，提升信息密度",
    images: "显示封面",
    imagesTip: "显示榜单条目的可用封面图片",
    fontSize: "列表字号",
    context: "上下文工具栏",
  },
  en: {
    all: "All",
    category: "Category",
    subcategory: "Sections",
    detail: "Detail",
    backCategory: "Back to category",
    source: "Source",
    variant: "View",
    search: "Search current context",
    searchCategory: "Search rankings in this category",
    searchList: "Search this ranking",
    searchTopic: "Search this topic",
    clear: "Clear search",
    displayPreferences: "Display preferences",
    compact: "Compact layout",
    compactTip: "Reduce card spacing and increase density",
    images: "Show covers",
    imagesTip: "Show available cover images",
    fontSize: "List font size",
    context: "Context toolbar",
  },
  "zh-TW": {
    all: "全部",
    category: "分類",
    subcategory: "分類",
    detail: "細分",
    backCategory: "返回所屬分類",
    source: "來源",
    variant: "榜單",
    search: "搜尋目前內容",
    searchCategory: "搜尋目前分類榜單",
    searchList: "搜尋目前榜單",
    searchTopic: "搜尋目前專題",
    clear: "清除搜尋",
    displayPreferences: "顯示偏好",
    compact: "緊湊版面",
    compactTip: "減少卡片間距，提高資訊密度",
    images: "顯示封面",
    imagesTip: "顯示榜單項目的可用封面圖片",
    fontSize: "列表字號",
    context: "內容工具列",
  },
  ja: {
    all: "すべて",
    category: "カテゴリ",
    subcategory: "カテゴリ",
    detail: "詳細",
    backCategory: "カテゴリに戻る",
    source: "ソース",
    variant: "ランキング",
    search: "現在の内容を検索",
    searchCategory: "このカテゴリのランキングを検索",
    searchList: "このランキングを検索",
    searchTopic: "この特集を検索",
    clear: "検索をクリア",
    displayPreferences: "表示設定",
    compact: "コンパクト表示",
    compactTip: "カード間隔を縮めて情報密度を上げます",
    images: "カバーを表示",
    imagesTip: "利用可能なカバー画像を表示します",
    fontSize: "リスト文字サイズ",
    context: "コンテキストツールバー",
  },
  ko: {
    all: "전체",
    category: "분류",
    subcategory: "분류",
    detail: "세부",
    backCategory: "분류로 돌아가기",
    source: "출처",
    variant: "랭킹",
    search: "현재 컨텍스트 검색",
    searchCategory: "현재 분류 랭킹 검색",
    searchList: "현재 랭킹 검색",
    searchTopic: "현재 주제 검색",
    clear: "검색 지우기",
    displayPreferences: "표시 설정",
    compact: "컴팩트 레이아웃",
    compactTip: "카드 간격을 줄여 정보 밀도를 높입니다",
    images: "커버 표시",
    imagesTip: "사용 가능한 커버 이미지를 표시합니다",
    fontSize: "목록 글꼴 크기",
    context: "컨텍스트 도구 모음",
  },
};

const locale = computed(() =>
  normalizeLocale(getLocaleFromRoute(route)),
);
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);

const routeKind = computed(() => {
  const name = String(route.name || "");
  if (["home", "home-locale"].includes(name)) return "home";
  if (["category", "category-locale"].includes(name)) return "category";
  if (["list", "list-locale", "list-legacy"].includes(name)) return "list";
  if (name.includes("-topic")) return "topic";
  return "";
});

// Header owns level-1 navigation. The context toolbar begins at level 2 and
// therefore never appears on the home route.
const visible = computed(() =>
  ["category", "list", "topic"].includes(routeKind.value),
);
const currentTopic = computed(() => getTopicByRouteName(route.name));

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

const currentCategory = computed(() => {
  if (routeKind.value === "category") return routeCategory.value;
  if (routeKind.value === "list") return currentSourceCategory.value;
  return null;
});

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

const rootCategory = computed(() => categoryTrail.value[0] || null);
const activeSecondCategory = computed(() => categoryTrail.value[1] || null);
const activeThirdCategory = computed(() => categoryTrail.value[2] || null);

const childCategories = (parentId) =>
  store.categories
    .filter(
      (item) =>
        String(item.parentId || "") === String(parentId || "") &&
        availableCategoryIds.value.has(String(item.id)),
    )
    .slice()
    .sort((a, b) => a.order - b.order);

const secondLevelOptions = computed(() => {
  if (routeKind.value !== "category" || !rootCategory.value) return [];
  return childCategories(rootCategory.value.id);
});

const thirdLevelOptions = computed(() => {
  if (
    routeKind.value !== "category" ||
    !activeSecondCategory.value
  ) {
    return [];
  }
  return childCategories(activeSecondCategory.value.id);
});

const categoryLabel = (category) =>
  category?.builtin
    ? getCategoryLabel(category.name, locale.value)
    : category?.name || "";

const sourceMenuOptions = computed(() => {
  const category = currentSourceCategory.value;
  const candidates = store.newsArr
    .filter((item) => item.show)
    .filter((item) => {
      if (!category) return true;
      return getSourceCategoryIds(item, store.categories).includes(
        String(category.id),
      );
    })
    .slice()
    .sort((a, b) => a.order - b.order);
  return candidates.map((item) => ({
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
  return item ? getSubtypeLabel(item, locale.value) : copy.value.variant;
});

const queryValue = (value) =>
  String(Array.isArray(value) ? value[0] || "" : value || "");
const searchInput = ref(queryValue(route.query.q));
let searchTimer;

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
  router.replace({
    path: route.path,
    query,
    hash: route.hash,
  });
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
};

const searchPlaceholder = computed(() => {
  if (routeKind.value === "list") return copy.value.searchList;
  if (routeKind.value === "topic") return copy.value.searchTopic;
  return copy.value.searchCategory;
});

const currentSearchQuery = () => {
  const q = queryValue(route.query.q).trim();
  return q ? { q } : {};
};
const withSearch = (path) => ({
  path,
  query: currentSearchQuery(),
});

const switchSource = (sourceName) => {
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
  router.push({
    path: buildRankPath(locale.value, currentSourceName.value, variant),
    query: currentSearchQuery(),
  });
};

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

onBeforeUnmount(() => {
  clearTimeout(searchTimer);
});
</script>

<style scoped>
.context-toolbar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  min-height: 52px;
  margin: 0 auto 16px;
  padding: 8px 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 12px;
  background: color-mix(in srgb, var(--n-color, #fff) 96%, transparent);
}

.context-toolbar__left,
.context-toolbar__right,
.context-toolbar__levels,
.context-toolbar__level,
.context-toolbar__rail,
.context-toolbar__list-nav {
  display: flex;
  align-items: center;
}

.context-toolbar__left {
  flex: 1 1 auto;
  min-width: 0;
}

.context-toolbar__right {
  flex: 0 0 auto;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
}

.context-toolbar__topics {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
}

.context-toolbar__levels {
  flex: 1 1 auto;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
}

.context-toolbar__level {
  flex: 0 1 auto;
  gap: 7px;
  min-width: 0;
}

.context-toolbar__level--detail {
  flex: 1 1 auto;
}

.context-toolbar__level-divider {
  width: 1px;
  height: 22px;
  margin-right: 4px;
  flex: 0 0 auto;
  background: var(--n-border-color, rgba(127, 127, 127, 0.2));
}

.context-toolbar__level-label {
  flex: 0 0 auto;
  color: var(--n-text-color-3);
  font-size: 12px;
  font-weight: 650;
  line-height: 1;
}

.context-toolbar__rail {
  flex: 0 1 auto;
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.context-toolbar__rail::-webkit-scrollbar {
  display: none;
}

.context-toolbar__chip {
  flex: 0 0 auto;
  padding: 7px 11px;
  border-radius: 8px;
  color: var(--n-text-color-2);
  font-size: 14px;
  font-weight: 560;
  line-height: 1.2;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.context-toolbar__chip:hover,
.context-toolbar__chip:focus-visible {
  color: var(--n-text-color);
  background: var(--n-action-color);
  outline: none;
}

.context-toolbar__chip.is-active {
  color: var(--n-primary-color, #d03050);
  background: color-mix(
    in srgb,
    var(--n-primary-color, #d03050) 9%,
    transparent
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--n-primary-color, #d03050) 24%, transparent);
}

.context-toolbar__list-nav {
  flex: 1 1 auto;
  gap: 7px;
  min-width: 0;
}

.context-toolbar__back,
.context-toolbar__select,
.context-toolbar__display {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border: 1px solid var(--n-border-color);
  border-radius: 9px;
  background: transparent;
  color: var(--n-text-color);
  text-decoration: none;
}

.context-toolbar__back {
  flex: 0 0 auto;
  gap: 5px;
  padding: 0 9px 0 7px;
  color: var(--n-text-color-2);
  font-size: 13px;
  font-weight: 600;
}

.context-toolbar__back:hover,
.context-toolbar__select:hover,
.context-toolbar__display:hover {
  background: var(--n-action-color);
}

.context-toolbar__back svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.context-toolbar__select {
  gap: 6px;
  max-width: 240px;
  padding: 0 10px;
  cursor: pointer;
}

.context-toolbar__select-label {
  color: var(--n-text-color-3);
  font-size: 12px;
}

.context-toolbar__select strong {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-toolbar__select svg {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.context-toolbar__search {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 7px;
  width: clamp(220px, 22vw, 320px);
  min-height: 36px;
  padding: 0 9px;
  border: 1px solid var(--n-border-color);
  border-radius: 9px;
  background: transparent;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease;
}

.context-toolbar__search:focus-within {
  border-color: var(--n-primary-color, #d03050);
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--n-primary-color, #d03050) 10%, transparent);
}

.context-toolbar__search > svg {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--n-text-color-3);
  stroke-linecap: round;
  stroke-width: 1.5;
}

.context-toolbar__search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color);
  font: inherit;
  font-size: 13px;
}

.context-toolbar__search input::placeholder {
  color: var(--n-text-color-3);
}

.context-toolbar__clear {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--n-text-color-3);
  cursor: pointer;
  font-size: 18px;
  line-height: 18px;
}

.context-toolbar__display {
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  cursor: pointer;
}

.context-toolbar__display svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.context-toolbar__preferences {
  display: grid;
  gap: 12px;
  width: 270px;
  padding: 5px 3px 3px;
}

.context-toolbar__preferences > strong {
  font-size: 14px;
}

.context-toolbar__preference-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.context-toolbar__preference-row > span {
  display: grid;
  gap: 2px;
}

.context-toolbar__preference-row b,
.context-toolbar__font-size b {
  color: var(--n-text-color);
  font-size: 13px;
  font-weight: 600;
}

.context-toolbar__preference-row small {
  color: var(--n-text-color-3);
  font-size: 11px;
  line-height: 1.35;
}

.context-toolbar__font-size {
  display: grid;
  gap: 8px;
  padding-top: 2px;
}

.context-toolbar__font-size > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.context-toolbar__font-size span {
  color: var(--n-text-color-3);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
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

@media (max-width: 1080px) {
  .context-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .context-toolbar__left,
  .context-toolbar__right {
    width: 100%;
  }

  .context-toolbar__levels {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .context-toolbar__levels::-webkit-scrollbar {
    display: none;
  }

  .context-toolbar__right {
    justify-content: flex-end;
  }

  .context-toolbar__search {
    flex: 1 1 auto;
    width: auto;
  }
}

@media (max-width: 620px) {
  .context-toolbar {
    gap: 8px;
    margin-bottom: 10px;
    padding: 7px;
  }

  .context-toolbar__level-label {
    display: none;
  }

  .context-toolbar__level {
    gap: 4px;
  }

  .context-toolbar__level-divider {
    margin-inline: 2px;
  }

  .context-toolbar__chip {
    padding: 6px 9px;
    font-size: 13px;
  }

  .context-toolbar__back span,
  .context-toolbar__select-label {
    display: none;
  }

  .context-toolbar__select {
    max-width: 170px;
  }
}
</style>
