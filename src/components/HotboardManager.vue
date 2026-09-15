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
            class="category-row category-row--all"
            :class="{ active: selectedCategoryId === 'all' }"
            @click="selectedCategoryId = 'all'"
          >
            <span class="category-row__spacer" aria-hidden="true"></span>
            <span class="category-name">{{ copy.allBoards }}</span>
            <b>{{ visibleSourceCount }}</b>
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
              :show-checkmark="false"
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
              :show-checkmark="false"
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

        <section class="boards-panel" :style="managerGridStyle">
          <div class="manager-display-bar">
            <div class="manager-display-summary">
              <div>
                <strong>{{ copy.displayStrategy }}</strong>
                <span>{{ currentLayoutSummary }}</span>
              </div>
              <n-tag size="small" :bordered="false">{{ currentContextLabel }}</n-tag>
            </div>
            <div class="manager-display-controls">
              <label class="manager-control">
                <span>{{ copy.compact }}</span>
                <n-switch v-model:value="store.compactMode" size="small" />
              </label>
              <label class="manager-control manager-control--columns">
                <span>{{ copy.columns }}</span>
                <n-select
                  size="tiny"
                  :show-checkmark="false"
                  :value="activeColumnCount"
                  :options="columnOptions"
                  @update:value="setActiveColumnCount"
                />
              </label>
              <label class="manager-control">
                <span>{{ copy.pinned }}</span>
                <n-switch v-model:value="store.showPinnedRankings" size="small" />
              </label>
            </div>
            <div class="manager-cover-policy">
              <div class="manager-cover-policy__head">
                <div>
                  <strong>{{ copy.covers }}</strong>
                  <span>{{ copy.coversTip }}</span>
                </div>
                <n-switch v-model:value="store.showImages" size="small" />
              </div>
              <div class="manager-cover-policy__grid" :class="{ 'is-disabled': !store.showImages }">
                <label
                  v-for="option in coverOptions"
                  :key="option.key"
                  class="manager-cover-option"
                  :class="{ 'is-current': option.key === currentCoverKey }"
                >
                  <span>{{ option.label }} <em v-if="option.key === currentCoverKey">{{ copy.current }}</em></span>
                  <n-switch
                    size="small"
                    :value="store[option.field]"
                    :disabled="!store.showImages"
                    @update:value="(value) => (store[option.field] = value)"
                  />
                </label>
              </div>
            </div>
          </div>
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
          <n-button
            quaternary
            size="small"
            @click="restoreDefaults"
          >{{ copy.restore }}</n-button>
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
import { useRoute } from "vue-router";

const props = defineProps({
  show: { type: Boolean, default: false },
  initialCategoryId: { type: [String, Number], default: null },
});
const emit = defineEmits(["update:show"]);
const store = mainStore();
const { locale } = useI18n({ useScope: "global" });
const route = useRoute();
const columnOptions = [3, 4, 5].map((value) => ({ value, label: String(value) }));
const activeColumnCount = computed(() =>
  store.compactMode ? Number(store.homeCompactColumns || 5) : Number(store.homeCardColumns || 4),
);
const setActiveColumnCount = (value) => {
  const next = Math.max(3, Math.min(5, Number(value) || 4));
  if (store.compactMode) store.homeCompactColumns = next;
  else store.homeCardColumns = next;
};
const managerGridStyle = computed(() => ({
  '--manager-grid-columns': String(activeColumnCount.value),
}));
const currentViewMode = computed(() =>
  store.resolveCategoryViewMode(props.initialCategoryId || null),
);
const currentCoverKey = computed(() => {
  if (/\/rank\//.test(route.path)) return 'detail';
  return currentViewMode.value === 'stream' ? 'stream' : 'card';
});
const coverOptions = computed(() => [
  { key: 'card', field: 'showCardImages', label: copy.value.cardCover },
  { key: 'stream', field: 'showStreamImages', label: copy.value.streamCover },
  { key: 'detail', field: 'showDetailImages', label: copy.value.detailCover },
  { key: 'preview', field: 'showPreviewImages', label: copy.value.previewCover },
]);
const currentContextLabel = computed(() =>
  currentCoverKey.value === 'detail'
    ? copy.value.detailContext
    : currentCoverKey.value === 'stream'
      ? copy.value.streamContext
      : copy.value.cardContext,
);
const currentCoverEnabled = computed(() => {
  const option = coverOptions.value.find((item) => item.key === currentCoverKey.value);
  return store.showImages !== false && option ? store[option.field] !== false : store.showImages !== false;
});
const currentLayoutSummary = computed(() =>
  [
    currentContextLabel.value,
    store.compactMode ? copy.value.compactState : copy.value.regularState,
    `${activeColumnCount.value}${copy.value.columnUnit}`,
    currentCoverEnabled.value ? copy.value.coverOn : copy.value.coverOff,
  ].join(' · '),
);
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
    subtitle: "分类、归属、启停、排序与显示策略集中管理",
    displayStrategy: "展示策略",
    compact: "紧凑模式",
    columns: "榜单列数",
    columnUnit: "列",
    pinned: "显示置顶",
    covers: "封面图片",
    coversTip: "按实际页面场景独立控制",
    cardCover: "卡片",
    streamCover: "信息流",
    detailCover: "单榜详情",
    previewCover: "悬浮预览",
    current: "当前",
    cardContext: "卡片视图",
    streamContext: "信息流",
    detailContext: "单榜详情",
    compactState: "紧凑",
    regularState: "普通",
    coverOn: "封面开",
    coverOff: "封面关",
    settingsTabs: "设置栏目",
    boardsTab: "榜单管理",
    generalTab: "通用设置",
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
    subtitle: "Manage categories, rankings and display strategy",
    displayStrategy: "Display strategy", compact: "Compact", columns: "Columns", columnUnit: " cols", pinned: "Pinned", covers: "Covers", coversTip: "Control covers by page context", cardCover: "Cards", streamCover: "Stream", detailCover: "Detail", previewCover: "Hover preview", current: "Current", cardContext: "Card view", streamContext: "Stream", detailContext: "Ranking detail", compactState: "Compact", regularState: "Regular", coverOn: "Covers on", coverOff: "Covers off",
    settingsTabs: "Settings sections",
    boardsTab: "Boards",
    generalTab: "General",
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
    subtitle: "集中管理分類、歸屬、顯示、排序與版面策略",
    displayStrategy: "顯示策略", compact: "緊湊模式", columns: "榜單欄數", columnUnit: "欄", pinned: "顯示置頂", covers: "封面圖片", coversTip: "依實際頁面情境獨立控制", cardCover: "卡片", streamCover: "資訊流", detailCover: "單榜詳情", previewCover: "懸浮預覽", current: "目前", cardContext: "卡片檢視", streamContext: "資訊流", detailContext: "單榜詳情", compactState: "緊湊", regularState: "一般", coverOn: "封面開", coverOff: "封面關",
    settingsTabs: "設定分頁",
    boardsTab: "榜單管理",
    generalTab: "通用設定",
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
    subtitle: "カテゴリ・表示・並び順・レイアウトをまとめて管理",
    displayStrategy: "表示戦略", compact: "コンパクト", columns: "列数", columnUnit: "列", pinned: "固定項目", covers: "カバー画像", coversTip: "ページごとに個別管理", cardCover: "カード", streamCover: "ストリーム", detailCover: "詳細", previewCover: "ホバー", current: "現在", cardContext: "カード表示", streamContext: "ストリーム", detailContext: "詳細表示", compactState: "コンパクト", regularState: "通常", coverOn: "カバーあり", coverOff: "カバーなし",
    settingsTabs: "設定セクション",
    boardsTab: "ランキング管理",
    generalTab: "一般設定",
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
    subtitle: "분류·표시·정렬·레이아웃을 한곳에서 관리",
    displayStrategy: "표시 전략", compact: "컴팩트", columns: "열 수", columnUnit: "열", pinned: "고정 항목", covers: "커버 이미지", coversTip: "페이지 상황별로 개별 제어", cardCover: "카드", streamCover: "스트림", detailCover: "상세", previewCover: "호버 미리보기", current: "현재", cardContext: "카드 보기", streamContext: "스트림", detailContext: "상세 보기", compactState: "컴팩트", regularState: "일반", coverOn: "커버 켬", coverOff: "커버 끔",
    settingsTabs: "설정 섹션",
    boardsTab: "목록 관리",
    generalTab: "일반 설정",
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

const applyInitialContext = () => {
  const requestedId =
    props.initialCategoryId === null ||
    typeof props.initialCategoryId === "undefined"
      ? ""
      : String(props.initialCategoryId);
  const exists = store.categories.some(
    (item) => String(item.id) === requestedId,
  );
  selectedCategoryId.value = exists ? requestedId : "all";
  search.value = "";
};

watch(
  () => [props.show, props.initialCategoryId],
  ([show]) => {
    if (show) applyInitialContext();
  },
  { immediate: true },
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
    parentId: item.parentId || null,
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
  width: min(1400px, calc(100vw - 32px));
  height: min(820px, calc(100vh - 32px));
  max-height: min(820px, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: var(--n-color, #fff);
}
.hotboard-manager :deep(.n-card__content) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
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
  grid-template-columns: 220px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  max-height: none;
}
.category-panel {
  padding-right: 14px;
  border-right: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  overflow: auto;
}
.boards-panel {
  min-width: 0;
  min-height: 0;
  padding-left: 16px;
  overflow: auto;
}
.manager-display-bar {
  display: grid;
  gap: 9px;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid var(--n-border-color, rgba(127,127,127,.18));
  border-radius: 12px;
  background: var(--n-action-color, rgba(127,127,127,.04));
}
.manager-display-summary,
.manager-display-controls,
.manager-cover-policy__head,
.manager-cover-option {
  display: flex;
  align-items: center;
}
.manager-display-summary,
.manager-cover-policy__head { justify-content: space-between; gap: 12px; }
.manager-display-summary > div,
.manager-cover-policy__head > div { display: grid; gap: 2px; min-width: 0; }
.manager-display-summary span,
.manager-cover-policy__head span { color: var(--n-text-color-3); font-size: 10px; }
.manager-display-controls { gap: 8px; flex-wrap: wrap; }
.manager-control { display: inline-flex; align-items: center; gap: 7px; min-height: 30px; padding: 4px 7px; border: 1px solid var(--n-border-color); border-radius: 8px; font-size: 10px; }
.manager-control--columns :deep(.n-select) { width: 72px; }
.manager-cover-policy { display: grid; gap: 7px; padding-top: 8px; border-top: 1px solid var(--n-border-color); }
.manager-cover-policy__grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.manager-cover-policy__grid.is-disabled { opacity: .55; }
.manager-cover-option { justify-content: space-between; gap: 7px; min-width: 0; min-height: 30px; padding: 5px 7px; border: 1px solid var(--n-border-color); border-radius: 8px; font-size: 10px; }
.manager-cover-option.is-current { border-color: color-mix(in srgb, var(--n-primary-color) 38%, var(--n-border-color)); background: color-mix(in srgb, var(--n-primary-color) 8%, transparent); }
.manager-cover-option span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.manager-cover-option em { margin-left: 4px; color: var(--n-primary-color); font-size: 8px; font-style: normal; font-weight: 700; }
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
.category-row__spacer {
  width: 18px;
  height: 1px;
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
  grid-template-columns: repeat(var(--manager-grid-columns, 4), minmax(0, 1fr));
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .manager-cover-policy__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 680px) {
  .hotboard-manager {
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }
  .manager-layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 210px) minmax(0, 1fr);
    height: 100%;
    max-height: none;
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
  .board-grid { grid-template-columns: 1fr; }
  .manager-cover-policy__grid { grid-template-columns: 1fr 1fr; }
  .manager-display-summary { align-items: flex-start; }
  .board-search {
    width: 160px;
  }
  .manager-title span {
    display: none;
  }
}
</style>
