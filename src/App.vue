<template>
  <Provider>
    <n-layout
      embedded
      :native-scrollbar="false"
      class="app-layout"
      :class="[
        store.headerFixed ? 'fixed' : null,
        headerExpanded ? 'header-expanded' : 'header-collapsed',
      ]"
    >
      <n-back-top :visibility-height="2" @update:show="backTopChange" />
      <Header
        :class="[{ expanded: headerExpanded, collapsed: !headerExpanded }]"
        @mouseenter="handleHeaderEnter"
        @mouseleave="handleHeaderLeave"
        @click="handleHeaderClick"
      />
      <button
        class="header-toggle"
        type="button"
        :data-collapsed="!headerExpanded"
        @click="toggleHeader"
      >
        {{ headerExpanded ? "收起导航" : "展开导航" }}
      </button>
      <main>
        <router-view v-slot="{ Component }">
          <keep-alive>
            <transition name="scale" mode="out-in">
              <component :is="Component" />
            </transition>
          </keep-alive>
        </router-view>
      </main>
      <Footer />
    </n-layout>
  </Provider>
</template>

<script setup>
import { mainStore } from "@/store";
import Provider from "@/components/Provider.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

const store = mainStore();

const headerExpanded = ref(!store.headerCollapsed);
const collapseTimer = ref(null);

// 回顶按钮显隐
const backTopChange = (val) => {
  if (!store.headerCollapsed) return;
  if (!val) {
    headerExpanded.value = false;
  }
};

const handleHeaderEnter = () => {
  clearTimeout(collapseTimer.value);
  headerExpanded.value = true;
};

const handleHeaderLeave = () => {
  if (!store.headerCollapsed) return;
  clearTimeout(collapseTimer.value);
  collapseTimer.value = setTimeout(() => {
    headerExpanded.value = false;
  }, 200);
};

const handleHeaderClick = () => {
  if (!headerExpanded.value) {
    headerExpanded.value = true;
  }
};

// 手动展开或收起
const toggleHeader = () => {
  clearTimeout(collapseTimer.value);
  headerExpanded.value = !headerExpanded.value;
};

// 点击页眉外区域时折叠
const handleOutsideClick = (e) => {
  if (!store.headerCollapsed) return;
  const path = e.composedPath ? e.composedPath() : [];
  const clickInsideHeader = path.some(
    (el) => el?.classList && el.classList.contains("header")
  );
  const clickToggle = path.some(
    (el) => el?.classList && el.classList.contains("header-toggle")
  );
  const clickOverlay = path.some(
    (el) =>
      el?.classList &&
      (el.classList.contains("n-popover") ||
        el.classList.contains("n-dropdown") ||
        el.classList.contains("n-popconfirm"))
  );
  if (!clickInsideHeader && !clickToggle && !clickOverlay) {
    headerExpanded.value = false;
  }
};

// 默认折叠设置变化时同步状态
watch(
  () => store.headerCollapsed,
  (val) => {
    headerExpanded.value = !val;
  }
);

onMounted(() => {
  store.checkNewsUpdate();
  document.addEventListener("click", handleOutsideClick);
  nextTick(() => {
    if (store.newsArr.length === 0) {
      store.newsArr = store.defaultNewsArr;
    }
  });
});

onBeforeUnmount(() => {
  clearTimeout(collapseTimer.value);
  document.removeEventListener("click", handleOutsideClick);
});
</script>

<style lang="scss" scoped>
.app-layout {
  height: 100%;
  position: relative;

  &.fixed {
    :deep(.header) {
      width: 100%;
      margin: 0;
      position: absolute;
      z-index: 2;
      top: 0;
      left: 0;
      box-sizing: border-box;
    }

    &.header-expanded {
      main {
        padding: 116px 5vw 0 5vw;
      }
    }

    &.header-collapsed {
      main {
        padding: 72px 5vw 0 5vw;
      }
    }
  }

  :deep(.n-scrollbar-rail) {
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 3;
  }

  main {
    padding: 24px 5vw 0;
    max-width: 1800px;
    margin: 0 auto;
    min-height: calc(100vh - 238px);
  }
}

.header-toggle {
  position: fixed;
  right: 5vw;
  top: 12px;
  z-index: 5;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--n-border-color);
  background-color: var(--n-color);
  color: var(--n-text-color);
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;

  &[data-collapsed="true"] {
    opacity: 0.9;
  }

  &:hover {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
  }
}

@media (max-width: 640px) {
  .header-toggle {
    top: 10px;
    right: 16px;
    padding: 6px 10px;
  }
}

// 路由跳转动画
.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
