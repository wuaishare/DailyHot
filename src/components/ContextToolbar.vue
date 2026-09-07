<template>
  <nav v-if="visible" class="context-toolbar" :aria-label="copy.context">
    <div class="context-toolbar__left">
      <TopicSwitcher
        v-if="currentTopic"
        class="context-toolbar__topics"
        :active-topic="currentTopic.id"
        :locale="locale"
      />

      <template v-else>
        <div class="context-toolbar__trail">
          <router-link
            :to="withSearch(buildHomePath(locale))"
            class="context-toolbar__crumb"
            :class="{ 'is-active': routeKind === 'home' }"
          >
            {{ copy.all }}
          </router-link>
          <span
            v-for="category in categoryTrail"
            :key="category.id"
            class="context-toolbar__trail-part"
          >
            <span class="context-toolbar__separator" aria-hidden="true">/</span>
            <router-link
              :to="withSearch(buildCategoryPath(locale, category.slug))"
              class="context-toolbar__crumb"
              :class="{ 'is-active': category.id === currentCategory?.id }"
            >
              {{ categoryLabel(category) }}
            </router-link>
          </span>
        </div>

        <div
          v-if="routeKind === 'home' || routeKind === 'category'"
          class="context-toolbar__rail"
        >
          <router-link
            v-for="category in categoryQuickOptions"
            :key="category.id"
            :to="withSearch(buildCategoryPath(locale, category.slug))"
            class="context-toolbar__chip"
            :class="{ 'is-active': category.id === currentCategory?.id }"
          >
            {{ categoryLabel(category) }}
          </router-link>
        </div>

        <div v-else-if="routeKind === 'list'" class="context-toolbar__list-nav">
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
      </template>
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
import { getTopicByRouteName } from "@/config/topics";

const route = useRoute();
const router = useRouter();
const store = mainStore();

const COPY = {
  "zh-CN": {
    all: "全部",
    source: "来源",
    variant: "榜单",
    search: "搜索当前上下文",
    searchCategory: "搜索当前分类榜单",
    searchList: "搜索当前榜单",
    searchTopic: "搜索当前专题",
    clear: "清除搜索",
    context: "上下文工具栏",
  },
  en: {
    all: "All",
    source: "Source",
    variant: "View",
    search: "Search current context",
    searchCategory: "Search rankings in this category",
    searchList: "Search this ranking",
    searchTopic: "Search this topic",
    clear: "Clear search",
    context: "Context toolbar",
  },
  "zh-TW": {
    all: "全部",
    source: "來源",
    variant: "榜單",
    search: "搜尋目前內容",
    searchCategory: "搜尋目前分類榜單",
    searchList: "搜尋目前榜單",
    searchTopic: "搜尋目前專題",
    clear: "清除搜尋",
    context: "內容工具列",
  },
  ja: {
    all: "すべて",
    source: "ソース",
    variant: "ランキング",
    search: "現在の内容を検索",
    searchCategory: "このカテゴリのランキングを検索",
    searchList: "このランキングを検索",
    searchTopic: "この特集を検索",
    clear: "検索をクリア",
    context: "コンテキストツールバー",
  },
  ko: {
    all: "전체",
    source: "출처",
    variant: "랭킹",
    search: "현재 컨텍스트 검색",
    searchCategory: "현재 분류 랭킹 검색",
    searchList: "현재 랭킹 검색",
    searchTopic: "현재 주제 검색",
    clear: "검색 지우기",
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
const visible = computed(() => Boolean(routeKind.value));
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

const categoryQuickOptions = computed(() => {
  if (routeKind.value === "home") {
    return store.categories
      .filter(
        (item) =>
          !item.parentId && availableCategoryIds.value.has(String(item.id)),
      )
      .slice()
      .sort((a, b) => a.order - b.order);
  }
  const current = currentCategory.value;
  if (!current) return [];
  const children = store.categories
    .filter(
      (item) =>
        item.parentId === current.id &&
        availableCategoryIds.value.has(String(item.id)),
    )
    .slice()
    .sort((a, b) => a.order - b.order);
  if (children.length) return children;
  return store.categories
    .filter(
      (item) =>
        (item.parentId || null) === (current.parentId || null) &&
        availableCategoryIds.value.has(String(item.id)),
    )
    .slice()
    .sort((a, b) => a.order - b.order);
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
  gap: 10px;
  width: 100%;
  min-height: 44px;
  margin: 0 auto 12px;
  padding: 6px 8px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 10px;
  background: color-mix(in srgb, var(--n-color, #fff) 94%, transparent);
}
.context-toolbar__left,
.context-toolbar__right,
.context-toolbar__trail,
.context-toolbar__trail-part,
.context-toolbar__rail,
.context-toolbar__list-nav {
  display: flex;
  align-items: center;
}
.context-toolbar__left {
  flex: 1 1 auto;
  gap: 8px;
  min-width: 0;
}
.context-toolbar__right {
  flex: 0 1 auto;
  gap: 6px;
  min-width: 0;
}
.context-toolbar__topics {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
}
.context-toolbar__trail {
  flex: 0 0 auto;
  min-width: 0;
}
.context-toolbar__trail-part {
  min-width: 0;
}
.context-toolbar__separator {
  margin: 0 3px;
  color: var(--n-text-color-3);
  font-size: 10px;
}
.context-toolbar__crumb,
.context-toolbar__chip {
  color: var(--n-text-color-2);
  text-decoration: none;
  white-space: nowrap;
}
.context-toolbar__crumb {
  font-size: 11px;
  font-weight: 600;
}
.context-toolbar__crumb.is-active {
  color: var(--n-primary-color, #d03050);
}
.context-toolbar__rail {
  flex: 1 1 auto;
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
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 11px;
}
.context-toolbar__chip:hover,
.context-toolbar__chip.is-active {
  color: var(--n-text-color);
  background: var(--n-action-color);
}
.context-toolbar__list-nav {
  flex: 1 1 auto;
  gap: 5px;
  min-width: 0;
}
.context-toolbar__select {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 30px;
  max-width: 220px;
  padding: 0 8px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
  color: var(--n-text-color);
  cursor: pointer;
}
.context-toolbar__select-label {
  color: var(--n-text-color-3);
  font-size: 10px;
}
.context-toolbar__select strong {
  min-width: 0;
  overflow: hidden;
  font-size: 11px;
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
  stroke-width: 1.4;
}
.context-toolbar__search {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 5px;
  width: clamp(160px, 20vw, 260px);
  min-height: 30px;
  padding: 0 7px;
  border: 1px solid var(--n-border-color);
  border-radius: 7px;
  background: transparent;
}
.context-toolbar__search:focus-within {
  border-color: var(--n-primary-color, #d03050);
}
.context-toolbar__search > svg {
  width: 13px;
  height: 13px;
  flex: 0 0 auto;
  fill: none;
  stroke: var(--n-text-color-3);
  stroke-linecap: round;
  stroke-width: 1.4;
}
.context-toolbar__search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--n-text-color);
  font: inherit;
  font-size: 11px;
}
.context-toolbar__search input::placeholder {
  color: var(--n-text-color-3);
}
.context-toolbar__clear {
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--n-text-color-3);
  cursor: pointer;
  font-size: 16px;
  line-height: 16px;
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
  }
  .context-toolbar__left,
  .context-toolbar__right {
    width: 100%;
  }
  .context-toolbar__right {
    justify-content: flex-end;
  }
  .context-toolbar__search {
    flex: 1 1 auto;
    width: auto;
  }
}
@media (max-width: 560px) {
  .context-toolbar {
    gap: 6px;
    margin-bottom: 8px;
    padding: 5px 6px;
  }
  .context-toolbar__trail {
    max-width: 42%;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .context-toolbar__trail::-webkit-scrollbar {
    display: none;
  }
  .context-toolbar__rail,
  .context-toolbar__list-nav {
    flex: 1 1 0;
  }
  .context-toolbar__select {
    max-width: 150px;
  }
}
</style>
