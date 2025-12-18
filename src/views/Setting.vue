<template>
  <div class="setting">
    <div class="title">全局设置</div>
    <n-h6 prefix="bar"> 基础设置 </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">明暗模式</n-text>
        </div>
        <n-select
          class="set"
          v-model:value="siteTheme"
          :options="themeOptions"
          @update:value="siteThemeAuto = false"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">明暗模式跟随系统</n-text>
          <n-text class="tip" :depth="3"> 明暗模式是否跟随系统当前模式 </n-text>
        </div>
        <n-switch
          v-model:value="siteThemeAuto"
          :round="false"
          @update:value="themeAutoOpen"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">链接跳转方式</n-text>
          <n-text class="tip" :depth="3"> 选择榜单列表内容的跳转方式 </n-text>
        </div>
        <n-select
          class="set"
          v-model:value="linkOpenType"
          :options="linkOptions"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">固定导航栏</n-text>
          <n-text class="tip" :depth="3"> 导航栏是否固定 </n-text>
        </div>
        <n-switch v-model:value="headerFixed" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">导航栏默认折叠</n-text>
          <n-text class="tip" :depth="3">
            默认显示极简导航，鼠标悬停或点击后展开完整内容
          </n-text>
        </div>
        <n-switch v-model:value="headerCollapsed" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">紧凑模式</n-text>
          <n-text class="tip" :depth="3">
            减少页面内边距，显示更多榜单内容
          </n-text>
        </div>
        <n-switch v-model:value="compactMode" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top" style="flex-direction: column; align-items: flex-start">
        <div class="name">
          <n-text class="text">列表文本大小</n-text>
          <n-card
            class="tip"
            :style="{
              backgroundColor: 'var(--n-border-color)',
              margin: '12px 0',
            }"
          >
            <n-text :style="{ fontSize: listFontSize + 'px' }">
              我是将要显示的文字的大小
            </n-text>
          </n-card>
        </div>

        <n-slider
          v-model:value="listFontSize"
          :tooltip="false"
          :max="20"
          :min="14"
          :step="0.01"
          :marks="{
            14: '小一点',
            16: '默认',
            20: '最大',
          }"
        />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">分类开关</n-text>
          <n-text class="tip" :depth="3">
            开启后顶部导航和列表将按分类筛选热榜
          </n-text>
        </div>
        <n-space vertical align="end">
          <n-switch v-model:value="categoryEnabled" :round="false" />
        </n-space>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top" style="align-items: flex-start">
        <div class="name">
          <n-text class="text">分类管理</n-text>
          <n-text class="tip" :depth="3">
            默认分类不可删除，最多保留 10 个分类
          </n-text>
        </div>
        <div class="categories">
          <div class="add">
            <n-input
              v-model:value="newCategory"
              size="small"
              placeholder="新分类名称"
              style="width: 180px"
            />
            <n-button size="small" type="primary" @click="handleAddCategory">
              新增
            </n-button>
          </div>
          <div class="list">
            <div
              class="cat-item"
              v-for="cat in store.categories.sort((a, b) => a.order - b.order)"
              :key="cat.id"
            >
              <n-input
                size="small"
                :disabled="cat.builtin"
                v-model:value="cat.name"
                @change="(val) => handleRenameCategory(cat.id, val)"
              />
              <n-button
                size="small"
                type="error"
                ghost
                :disabled="cat.builtin"
                @click="store.removeCategory(cat.id)"
              >
                删除
              </n-button>
            </div>
          </div>
        </div>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">榜单排序</n-text>
          <n-text class="tip" :depth="3">
            拖拽以排序，开关用以控制在页面中的显示状态，可分配分类
          </n-text>
        </div>
        <n-popconfirm @positive-click="restoreDefault">
          <template #trigger>
            <n-button class="control" size="small"> 恢复默认 </n-button>
          </template>
          确认将排序恢复到默认状态？
        </n-popconfirm>
      </div>
      <draggable
        :list="newsArr"
        :animation="200"
        class="mews-group"
        item-key="order"
        @end="saveSoreData()"
      >
        <template #item="{ element }">
          <n-card
            class="item"
            embedded
            :content-style="{ display: 'flex', alignItems: 'center' }"
          >
            <div class="desc" :style="{ opacity: element.show ? null : 0.6 }">
              <img class="logo" :src="logoSrc(element.name)" alt="logo" />
              <n-text class="news-name" v-html="element.label" />
              <n-tag
                size="small"
                type="warning"
                v-if="store.unavailableSources.includes(element.name)"
              >
                不可用
              </n-tag>
            </div>
            <n-select
              size="small"
              class="category-select"
              :options="categoryOptions"
              v-model:value="element.category"
              placeholder="分类"
              :disabled="!categoryEnabled"
            />
            <n-switch
              class="switch"
              :round="false"
              v-model:value="element.show"
              @update:value="saveSoreData(element.label, element.show)"
            />
          </n-card>
        </template>
      </draggable>
    </n-card>
    <n-h6 prefix="bar"> 杂项设置 </n-h6>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">自动刷新</n-text>
          <n-text class="tip" :depth="3">
            定时刷新页面，默认 0 时 30 分 0 秒（最小 60 秒），关闭时不生效
          </n-text>
        </div>
        <div class="auto-refresh">
          <div class="time-inputs">
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.hour"
                :min="0"
                :max="23"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">时</span>
            </div>
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.minute"
                :min="0"
                :max="59"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">分</span>
            </div>
            <div class="time-item">
              <n-input-number
                size="small"
                v-model:value="autoTime.second"
                :min="0"
                :max="59"
                :disabled="!autoRefreshEnabled"
                button-placement="both"
                @update:value="applyAutoInterval"
              />
              <span class="unit">秒</span>
            </div>
          </div>
          <n-switch v-model:value="autoRefreshEnabled" :round="false" />
        </div>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">显示封面图片</n-text>
          <n-text class="tip" :depth="3">
            开启后在首页卡片和列表中显示封面图片（有防盗链的将自动隐藏）
          </n-text>
        </div>
        <n-switch v-model:value="showImages" :round="false" />
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">清除缓存</n-text>
          <n-text class="tip" :depth="3">
            当前缓存版本：{{ cacheVersion }}，点击立即清除并刷新
          </n-text>
        </div>
        <n-button @click="clearCache" type="warning" ghost> 清除缓存 </n-button>
      </div>
    </n-card>
    <n-card class="set-item">
      <div class="top">
        <div class="name">
          <n-text class="text">重置所有数据</n-text>
          <n-text class="tip" :depth="3">
            重置所有数据，你的自定义设置都将会丢失
          </n-text>
        </div>
        <n-popconfirm @positive-click="reset">
          <template #trigger>
            <n-button type="warning"> 重置 </n-button>
          </template>
          确认重置所有数据？你的自定义设置都将会丢失！
        </n-popconfirm>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { mainStore } from "@/store";
import { clearAppCaches, getCacheVersion } from "@/utils/cache";
import { useOsTheme } from "naive-ui";
import draggable from "vuedraggable";

const store = mainStore();
const osThemeRef = useOsTheme();
const {
  siteTheme,
  siteThemeAuto,
  newsArr,
  linkOpenType,
  headerFixed,
  headerCollapsed,
  compactMode,
  listFontSize,
  autoRefreshEnabled,
  autoRefreshInterval,
  showImages,
  categoryEnabled,
  activeCategory,
} = storeToRefs(store);
const categories = computed(() =>
  store.categories.slice().sort((a, b) => a.order - b.order)
);
const categoryOptions = computed(() =>
  categories.value.map((c) => ({ label: c.name, value: c.name }))
);
const newCategory = ref("");
const cacheVersion = ref(getCacheVersion());
const logoSrc = (name) => `/logo/${name}.png?v=${cacheVersion.value}`;

// 深浅模式
const themeOptions = ref([
  {
    label: "浅色模式",
    value: "light",
  },
  {
    label: "深色模式",
    value: "dark",
  },
]);

// 榜单跳转
const linkOptions = [
  {
    label: "新页面打开",
    value: "open",
  },
  {
    label: "当前页打开",
    value: "href",
  },
];

// 开启明暗自动跟随
const themeAutoOpen = (val) => {
  console.log(osThemeRef.value);
  if (val) {
    siteTheme.value = osThemeRef.value;
  }
};

// 归一化顺序，保证 order 与当前展示一致
const normalizeOrder = () => {
  newsArr.value = newsArr.value.map((item, idx) => ({
    ...item,
    order: idx,
  }));
};

// 恢复默认排序
const restoreDefault = () => {
  newsArr.value = newsArr.value.sort((a, b) => a.order - b.order);
  normalizeOrder();
  $message.success("恢复默认榜单排序成功");
};

// 将排序结果写入
const saveSoreData = (name = null, open = false) => {
  normalizeOrder();
  $message.success(
    name ? `${name}榜单已${open ? "开启" : "关闭"}` : "榜单排序成功"
  );
};

// 重置数据
const reset = () => {
  if (typeof $timeInterval !== "undefined") clearInterval($timeInterval);
  if (typeof $autoRefreshTimer !== "undefined") clearInterval($autoRefreshTimer);
  localStorage.clear();
  location.reload();
};

const autoTime = reactive({
  hour: 0,
  minute: 30,
  second: 0,
});

const secondsToTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.max(seconds % 60, 0);
  return { h, m, s };
};

const timeToSeconds = (time) => {
  const h = Number(time.hour) || 0;
  const m = Number(time.minute) || 0;
  const s = Number(time.second) || 0;
  return h * 3600 + m * 60 + s;
};

const syncAutoTime = () => {
  const { h, m, s } = secondsToTime(Number(autoRefreshInterval.value));
  autoTime.hour = h;
  autoTime.minute = m;
  autoTime.second = s;
};

const applyAutoInterval = () => {
  const seconds = timeToSeconds(autoTime);
  if (seconds < 60) {
    $message.warning("自动刷新最少 60 秒");
    return;
  }
  autoRefreshInterval.value = seconds;
};

const clearCache = async () => {
  await clearAppCaches();
  location.reload();
};

const handleAddCategory = () => {
  if (!newCategory.value) return;
  const ok = store.addCategory(newCategory.value.trim());
  if (ok) {
    newCategory.value = "";
  }
};

const handleRenameCategory = (id, val) => {
  store.renameCategory(id, val);
};

watch(
  () => autoRefreshInterval.value,
  () => {
    syncAutoTime();
  },
  { immediate: true }
);

watch(
  () => categoryEnabled.value,
  (val) => {
    if (!val) {
      activeCategory.value = "全部";
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.setting {
  .title {
    margin-top: 20px;
    margin-bottom: 20px;
    font-size: 31px;
    font-weight: bold;
  }

  .n-h {
    padding-left: 16px;
    font-size: 20px;
    margin-left: 4px;
  }

  .set-item {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 12px;

    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .name {
        font-size: 18px;
        display: flex;
        flex-direction: column;

        .tip {
          font-size: 12px;
          border-radius: 8px;
        }
      }

      .set {
        max-width: 200px;
      }

      .category-select {
        min-width: 140px;
      }

      .auto-refresh {
        display: flex;
        align-items: center;
        gap: 12px;

        .time-inputs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;

          .time-item {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 150px;

            span {
              font-size: 12px;
            }

            :deep(.n-input-number) {
              width: 120px;
            }
          }
        }
      }

      .categories {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;

        .add {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .cat-item {
            display: flex;
            gap: 8px;
            align-items: center;
            max-width: 320px;
          }
        }
      }
    }

    .mews-group {
      margin-top: 16px;
      display: grid;
      grid-template-columns: repeat(5, minmax(0px, 1fr));
      gap: 24px;

      @media (max-width: 1666px) {
        grid-template-columns: repeat(4, minmax(0px, 1fr));
      }

      @media (max-width: 1200px) {
        grid-template-columns: repeat(3, minmax(0px, 1fr));
      }

      @media (max-width: 890px) {
        grid-template-columns: repeat(2, minmax(0px, 1fr));
      }

      @media (max-width: 620px) {
        grid-template-columns: repeat(1, minmax(0px, 1fr));
      }

      .item {
        cursor: pointer;

        .desc {
          display: flex;
          align-items: center;
          width: 100%;
          transition: all 0.3s;

          .logo {
            width: 40px;
            height: 40px;
            margin-right: 12px;
          }

          .news-name {
            font-size: 16px;
          }
        }

        .switch {
          margin-left: auto;
        }
      }
    }
  }
}
</style>
