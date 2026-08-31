<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    @update:show="emit('update:show', $event)"
  >
    <n-card
      class="hotboard-manager"
      :bordered="false"
      role="dialog"
      aria-modal="true"
    >
      <template #header>
        <div class="manager-title">
          <div>
            <strong>{{ copy.title }}</strong>
            <span>{{ copy.subtitle }}</span>
          </div>
          <n-button quaternary size="small" @click="emit('advanced')">{{
            copy.advanced
          }}</n-button>
        </div>
      </template>

      <div class="manager-layout">
        <aside class="category-panel">
          <div class="panel-toolbar">
            <strong>{{ copy.categories }}</strong>
            <n-button size="tiny" secondary @click="startAddCategory">{{
              copy.add
            }}</n-button>
          </div>
          <button
            class="category-row"
            :class="{ active: selectedCategoryId === 'all' }"
            @click="selectedCategoryId = 'all'"
          >
            <span>{{ copy.allBoards }}</span
            ><b>{{ visibleSourceCount }}</b>
          </button>
          <draggable
            v-model="sortableCategories"
            item-key="id"
            handle=".category-drag"
            :animation="160"
            @end="saveCategoryOrder"
          >
            <template #item="{ element }">
              <button
                class="category-row"
                :class="{ active: selectedCategoryId === element.id }"
                :style="{ '--depth': categoryDepth(element) }"
                @click="selectCategory(element)"
              >
                <span class="category-drag" aria-hidden="true"
                  ><n-icon :component="Drag"
                /></span>
                <span class="category-name">{{
                  localizedCategory(element)
                }}</span>
                <b>{{ categoryCount(element) }}</b>
              </button>
            </template>
          </draggable>

          <div v-if="addingCategory" class="category-editor">
            <n-input
              v-model:value="newCategoryName"
              size="small"
              :placeholder="copy.categoryName"
              @keyup.enter="createCategory"
            />
            <n-select
              v-model:value="newCategoryParent"
              size="small"
              clearable
              :options="parentOptions"
              :placeholder="copy.parent"
            />
            <div class="editor-actions">
              <n-button size="tiny" @click="addingCategory = false">{{
                copy.cancel
              }}</n-button>
              <n-button size="tiny" type="primary" @click="createCategory">{{
                copy.create
              }}</n-button>
            </div>
          </div>
          <div
            v-else-if="selectedCategory && !selectedCategory.builtin"
            class="category-editor"
          >
            <n-input
              v-model:value="renameValue"
              size="small"
              @keyup.enter="renameSelectedCategory"
            />
            <n-select
              v-model:value="selectedParentId"
              size="small"
              clearable
              :options="parentOptionsForSelected"
              :placeholder="copy.parent"
              @update:value="moveSelectedCategory"
            />
            <div class="editor-actions">
              <n-button size="tiny" @click="renameSelectedCategory">{{
                copy.rename
              }}</n-button>
              <n-popconfirm @positive-click="removeSelectedCategory">
                <template #trigger
                  ><n-button size="tiny" type="error" tertiary>{{
                    copy.remove
                  }}</n-button></template
                >
                {{ copy.removeConfirm }}
              </n-popconfirm>
            </div>
          </div>
        </aside>

        <section class="boards-panel">
          <div class="boards-toolbar">
            <div>
              <strong>{{ selectedCategoryLabel }}</strong>
              <span>{{ filteredSources.length }} {{ copy.boards }}</span>
            </div>
            <n-input
              v-model:value="search"
              clearable
              size="small"
              :placeholder="copy.search"
              class="board-search"
            />
          </div>
          <draggable
            v-model="sortableSources"
            item-key="name"
            handle=".source-drag"
            :animation="160"
            class="board-grid"
            @end="saveSourceOrder"
          >
            <template #item="{ element }">
              <div class="board-item" :class="{ disabled: !element.show }">
                <div class="board-main">
                  <span class="source-drag" aria-hidden="true"
                    ><n-icon :component="Drag"
                  /></span>
                  <img
                    :src="logoSrc(element.name)"
                    :alt="sourceLabel(element)"
                    @error="handleLogoError"
                  />
                  <span class="board-name" :title="sourceLabel(element)">{{
                    sourceLabel(element)
                  }}</span>
                  <n-switch
                    size="small"
                    :value="element.show"
                    @update:value="(value) => setSourceVisible(element, value)"
                  />
                </div>
                <n-select
                  size="tiny"
                  multiple
                  max-tag-count="1"
                  :value="sourceCategoryIds(element)"
                  :options="categorySelectOptions"
                  :placeholder="copy.assign"
                  @update:value="
                    (value) => store.setSourceCategories(element.name, value)
                  "
                />
              </div>
            </template>
          </draggable>
          <n-empty
            v-if="!filteredSources.length"
            :description="copy.empty"
            class="manager-empty"
          />
        </section>
      </div>

      <template #footer>
        <div class="manager-footer">
          <n-button quaternary size="small" @click="restoreDefaults">{{
            copy.restore
          }}</n-button>
          <n-button
            type="primary"
            size="small"
            @click="emit('update:show', false)"
            >{{ copy.done }}</n-button
          >
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
import draggable from "vuedraggable";
import { mainStore } from "@/store";
import {
  canMoveCategory,
  getCategoryDepth,
  getSourceCategoryIds,
  sourceBelongsToCategory,
} from "@/utils/categoryTree";
import { getCategoryLabel } from "@/utils/locale";
import { getSourceDisplayLabel } from "@/utils/sourceLabels";
import { getSourceLogo, getSourceLogoFallback } from "@/utils/sourceLogos";
import { useI18n } from "vue-i18n";
import { Drag } from "@icon-park/vue-next";
import { BUILTIN_CATEGORIES } from "@/config/site-metadata.mjs";

const props = defineProps({ show: { type: Boolean, default: false } });
const emit = defineEmits(["update:show", "advanced"]);
const store = mainStore();
const { locale } = useI18n({ useScope: "global" });
const selectedCategoryId = ref("all");
const search = ref("");
const addingCategory = ref(false);
const newCategoryName = ref("");
const newCategoryParent = ref(null);
const renameValue = ref("");
const selectedParentId = ref(null);
const sortableSources = ref([]);
const sortableCategories = ref([]);

const COPY = {
  "zh-CN": {
    title: "热榜管理",
    subtitle: "分类、归属、启停与排序集中管理",
    advanced: "高级设置",
    categories: "分类",
    add: "新增",
    allBoards: "全部榜单",
    categoryName: "分类名称",
    parent: "父级分类（可选）",
    cancel: "取消",
    create: "创建",
    rename: "重命名",
    remove: "删除",
    removeConfirm: "删除该分类及其子分类？榜单会自动保留到其他分类。",
    boards: "个榜单",
    search: "搜索榜单",
    assign: "分类归属",
    empty: "没有符合条件的榜单",
    restore: "恢复默认",
    done: "完成",
  },
  en: {
    title: "Hotboard Manager",
    subtitle: "Manage categories, visibility and order",
    advanced: "Advanced",
    categories: "Categories",
    add: "Add",
    allBoards: "All boards",
    categoryName: "Category name",
    parent: "Parent (optional)",
    cancel: "Cancel",
    create: "Create",
    rename: "Rename",
    remove: "Delete",
    removeConfirm: "Delete this category and its children?",
    boards: "boards",
    search: "Search boards",
    assign: "Categories",
    empty: "No matching boards",
    restore: "Restore defaults",
    done: "Done",
  },
  "zh-TW": {
    title: "熱榜管理",
    subtitle: "集中管理分類、歸屬、顯示與排序",
    advanced: "進階設定",
    categories: "分類",
    add: "新增",
    allBoards: "全部榜單",
    categoryName: "分類名稱",
    parent: "上層分類（可選）",
    cancel: "取消",
    create: "建立",
    rename: "重新命名",
    remove: "刪除",
    removeConfirm: "刪除此分類及其子分類？榜單會保留在其他分類中。",
    boards: "個榜單",
    search: "搜尋榜單",
    assign: "分類歸屬",
    empty: "沒有符合條件的榜單",
    restore: "恢復預設",
    done: "完成",
  },
  ja: {
    title: "ランキング管理",
    subtitle: "カテゴリ・所属・表示・並び順をまとめて管理",
    advanced: "詳細設定",
    categories: "カテゴリ",
    add: "追加",
    allBoards: "すべてのランキング",
    categoryName: "カテゴリ名",
    parent: "親カテゴリ（任意）",
    cancel: "キャンセル",
    create: "作成",
    rename: "名前変更",
    remove: "削除",
    removeConfirm:
      "このカテゴリと子カテゴリを削除しますか？ランキングは他のカテゴリに保持されます。",
    boards: "件",
    search: "ランキングを検索",
    assign: "カテゴリ所属",
    empty: "該当するランキングはありません",
    restore: "初期設定に戻す",
    done: "完了",
  },
  ko: {
    title: "인기 목록 관리",
    subtitle: "분류·소속·표시·정렬을 한곳에서 관리",
    advanced: "고급 설정",
    categories: "분류",
    add: "추가",
    allBoards: "전체 목록",
    categoryName: "분류 이름",
    parent: "상위 분류(선택)",
    cancel: "취소",
    create: "만들기",
    rename: "이름 변경",
    remove: "삭제",
    removeConfirm:
      "이 분류와 하위 분류를 삭제할까요? 목록은 다른 분류에 유지됩니다.",
    boards: "개 목록",
    search: "목록 검색",
    assign: "분류 소속",
    empty: "조건에 맞는 목록이 없습니다",
    restore: "기본값 복원",
    done: "완료",
  },
};
const copy = computed(() => COPY[locale.value] || COPY["zh-CN"]);
const localizedCategory = (item) =>
  item.builtin ? getCategoryLabel(item.name, locale.value) : item.name;
const categoryDepth = (item) => getCategoryDepth(store.categories, item.id);
const visibleSourceCount = computed(() => store.newsArr.length);
const selectedCategory = computed(() =>
  selectedCategoryId.value === "all"
    ? null
    : store.categories.find((item) => item.id === selectedCategoryId.value) ||
      null,
);
const selectedCategoryLabel = computed(() =>
  selectedCategory.value
    ? localizedCategory(selectedCategory.value)
    : copy.value.allBoards,
);
const categoryCount = (category) =>
  store.newsArr.filter((item) =>
    sourceBelongsToCategory(item, category.id, store.categories),
  ).length;
const sourceLabel = (item) =>
  getSourceDisplayLabel(item.name, locale.value, item.label || item.name);
const logoSrc = (name) => getSourceLogo(name);
const handleLogoError = (event) => {
  if (event.target) event.target.src = getSourceLogoFallback();
};
const sourceCategoryIds = (item) =>
  getSourceCategoryIds(item, store.categories);

const flattenCategories = computed(() => {
  const sorted = store.categories.slice().sort((a, b) => a.order - b.order);
  const result = [];
  const visit = (parentId = null) =>
    sorted
      .filter((item) => (item.parentId || null) === parentId)
      .forEach((item) => {
        result.push(item);
        visit(item.id);
      });
  visit(null);
  sorted
    .filter((item) => !result.some((entry) => entry.id === item.id))
    .forEach((item) => result.push(item));
  return result;
});
const categorySelectOptions = computed(() =>
  flattenCategories.value.map((item) => ({
    label: `${"—".repeat(Math.max(0, categoryDepth(item) - 1))}${localizedCategory(item)}`,
    value: item.id,
  })),
);
const parentOptions = computed(() =>
  flattenCategories.value
    .filter((item) => categoryDepth(item) < 3)
    .map((item) => ({
      label: `${"—".repeat(Math.max(0, categoryDepth(item) - 1))}${localizedCategory(item)}`,
      value: item.id,
    })),
);
const parentOptionsForSelected = computed(() =>
  parentOptions.value.filter((item) =>
    canMoveCategory(store.categories, selectedCategoryId.value, item.value),
  ),
);

const filteredSources = computed(() => {
  const query = search.value.trim().toLowerCase();
  return store.newsArr
    .filter(
      (item) =>
        selectedCategoryId.value === "all" ||
        sourceBelongsToCategory(
          item,
          selectedCategoryId.value,
          store.categories,
        ),
    )
    .filter(
      (item) =>
        !query ||
        `${sourceLabel(item)} ${item.name}`.toLowerCase().includes(query),
    )
    .sort((a, b) => a.order - b.order);
});
const syncSources = () => {
  sortableSources.value = filteredSources.value.slice();
};
watch(
  () =>
    filteredSources.value
      .map((item) => `${item.name}:${item.order}:${item.show}`)
      .join("|"),
  syncSources,
  { immediate: true },
);
watch(
  flattenCategories,
  (value) => {
    sortableCategories.value = value.slice();
  },
  { immediate: true },
);
watch(
  () => props.show,
  (value) => {
    if (value) {
      store.ensureNewsList();
      store.ensureBuiltinCategories();
      syncSources();
    }
  },
);

const selectCategory = (item) => {
  selectedCategoryId.value = item.id;
  renameValue.value = item.name;
  selectedParentId.value = item.parentId || null;
};
const startAddCategory = () => {
  addingCategory.value = true;
  newCategoryName.value = "";
  newCategoryParent.value =
    selectedCategoryId.value === "all" ? null : selectedCategoryId.value;
};
const createCategory = () => {
  const id = store.addCategory(newCategoryName.value, newCategoryParent.value);
  if (id) {
    addingCategory.value = false;
    selectedCategoryId.value = id;
  }
};
const renameSelectedCategory = () => {
  if (selectedCategory.value)
    store.renameCategory(selectedCategory.value.id, renameValue.value);
};
const moveSelectedCategory = (value) => {
  if (selectedCategory.value)
    store.moveCategory(selectedCategory.value.id, value);
};
const removeSelectedCategory = () => {
  if (!selectedCategory.value) return;
  store.removeCategory(selectedCategory.value.id);
  selectedCategoryId.value = "all";
};
const setSourceVisible = (item, value) => {
  const target = store.newsArr.find((source) => source.name === item.name);
  if (target) target.show = value;
};
const saveSourceOrder = () =>
  store.reorderVisibleNews(
    sortableSources.value.map((item) => item.name),
    filteredSources.value.map((item) => item.name),
  );
const saveCategoryOrder = () =>
  store.reorderCategories(sortableCategories.value.map((item) => item.id));
const restoreDefaults = () => {
  store.categories = BUILTIN_CATEGORIES.map((item, order) => ({
    ...item,
    order,
    parentId: null,
    builtin: true,
  }));
  store.newsArr = store.defaultNewsArr.map((item) => ({
    ...item,
    categoryIdsCustomized: false,
  }));
  store.ensureBuiltinCategories();
  store.ensureNewsList();
  selectedCategoryId.value = "all";
};
</script>

<style scoped>
.hotboard-manager {
  width: min(1120px, calc(100vw - 32px));
  max-height: min(820px, calc(100vh - 32px));
  border-radius: 16px;
}
.manager-title,
.boards-toolbar,
.manager-footer,
.panel-toolbar,
.board-main,
.editor-actions {
  display: flex;
  align-items: center;
}
.manager-title,
.boards-toolbar,
.manager-footer,
.panel-toolbar {
  justify-content: space-between;
  gap: 12px;
}
.manager-title > div,
.boards-toolbar > div {
  display: grid;
  gap: 2px;
}
.manager-title strong {
  font-size: 17px;
}
.manager-title span,
.boards-toolbar span {
  color: var(--n-text-color-3, #777);
  font-size: 12px;
}
.manager-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  min-height: 520px;
  max-height: calc(100vh - 190px);
}
.category-panel {
  padding-right: 14px;
  border-right: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  overflow: auto;
}
.boards-panel {
  min-width: 0;
  padding-left: 16px;
  overflow: auto;
}
.panel-toolbar,
.boards-toolbar {
  margin-bottom: 12px;
}
.board-search {
  width: 240px;
}
.category-row {
  --depth: 1;
  width: 100%;
  height: 36px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 calc(8px + (var(--depth) - 1) * 14px);
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.category-row:first-of-type {
  grid-template-columns: minmax(0, 1fr) auto;
}
.category-row:hover,
.category-row.active {
  background: var(--n-color-hover, rgba(127, 127, 127, 0.1));
}
.category-row.active {
  font-weight: 650;
}
.category-drag,
.source-drag {
  color: var(--n-text-color-3, #888);
  cursor: grab;
  font-size: 12px;
  letter-spacing: -3px;
}
.category-name,
.board-name {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.category-row b {
  font-size: 11px;
  font-weight: 500;
  color: var(--n-text-color-3, #777);
}
.category-editor {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
}
.editor-actions {
  justify-content: flex-end;
  gap: 6px;
}
.board-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  align-content: start;
}
.board-item {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 12px;
  background: var(--n-color, #fff);
  transition: 0.16s ease;
}
.board-item:hover {
  border-color: var(--n-text-color-3, #888);
}
.board-item.disabled {
  opacity: 0.55;
}
.board-main {
  min-width: 0;
  gap: 7px;
}
.board-main img {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  object-fit: contain;
  flex: 0 0 18px;
}
.board-name {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
}
.source-drag {
  flex: 0 0 14px;
}
.manager-footer {
  width: 100%;
}
.manager-empty {
  padding: 80px 0;
}
@media (max-width: 900px) {
  .manager-layout {
    grid-template-columns: 190px minmax(0, 1fr);
  }
  .board-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .hotboard-manager {
    width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
  }
  .manager-layout {
    grid-template-columns: 1fr;
    max-height: calc(100vh - 180px);
  }
  .category-panel {
    max-height: 210px;
    padding: 0 0 12px;
    border-right: 0;
    border-bottom: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  }
  .boards-panel {
    padding: 12px 0 0;
  }
  .board-grid {
    grid-template-columns: 1fr;
  }
  .board-search {
    width: 160px;
  }
  .manager-title span {
    display: none;
  }
}
</style>
