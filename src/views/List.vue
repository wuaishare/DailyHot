<template>
  <div class="list">
    <n-space class="type" v-if="availableNews.length">
      <n-tag
        round
        size="large"
        class="tag"
        v-for="item in availableNews"
        :key="item"
        :type="item.name === listType ? 'primary' : 'default'"
        @click="changeType(item.name)"
      >
        {{ item.label }}
        <template #avatar>
          <img :src="logoSrc(item.name)" alt="logo" class="logo" />
        </template>
      </n-tag>
    </n-space>
    <n-card class="card">
      <template #header>
        <Transition name="fade" mode="out-in">
          <template v-if="!listData">
            <div class="loading" style="height: 60px">
              <n-skeleton text round height="40px" />
            </div>
          </template>
          <template v-else>
            <div class="header">
              <div class="logo">
                <img :src="logoSrc(listType)" alt="logo" />
              </div>
              <div class="name">
                <n-text class="title">{{ listData.title }}</n-text>
                <n-text class="subtitle" :depth="3">
                  {{ listData.subtitle }}
                </n-text>
              </div>
              <div class="data">
                <n-text
                  v-if="listData.total"
                  :depth="3"
                  class="total"
                  v-html="listData.total"
                />
                <n-text :depth="3" class="time" v-html="updateTime" />
              </div>
            </div>
          </template>
        </Transition>
      </template>
      <Transition name="fade" mode="out-in">
        <template v-if="!listData">
          <div class="loading" style="flex-direction: column">
            <n-skeleton
              text
              round
              :repeat="20"
              height="40px"
              style="margin-bottom: 20px"
            />
          </div>
        </template>
        <template v-else>
          <div class="all">
            <n-list hoverable style="width: 100%">
              <n-list-item
                v-for="(item, index) in listData.data.slice(
                  pageNumber * 20 - 20,
                  pageNumber * 20
                )"
                :key="item"
              >
                <template #prefix>
                  <n-text
                    class="num"
                    :class="
                      index + 1 + (pageNumber - 1) * 20 === 1
                        ? 'one'
                        : index + 1 + (pageNumber - 1) * 20 === 2
                        ? 'two'
                        : index + 1 + (pageNumber - 1) * 20 === 3
                        ? 'three'
                        : null
                    "
                    :depth="2"
                  >
                    {{ index + 1 + (pageNumber - 1) * 20 }}
                  </n-text>
                </template>
                <n-a
                  class="text"
                  :href="getItemLink(item)"
                  :target="linkTarget"
                  rel="noopener noreferrer nofollow"
                >
                  <div class="content">
                    <div class="copy">
                      <n-text class="title" v-html="item.title" />
                      <n-text
                        v-if="item.desc"
                        class="desc"
                        :depth="3"
                        v-html="item.desc"
                      />
                    </div>
                    <div
                      class="cover-wrapper"
                      v-if="showImages && item.cover && !coverErrorMap[item.cover]"
                    >
                      <img
                        class="cover"
                        :src="item.cover"
                        :alt="item.title"
                        loading="lazy"
                        @error="coverErrorMap[item.cover] = true"
                      />
                    </div>
                  </div>
                </n-a>
                <div class="message">
                  <div class="hot" v-if="item.hot">
                    <n-icon :depth="3" :component="Fire" />
                    <n-text class="hot-text" :depth="3" v-html="item.hot" />
                  </div>
                </div>
              </n-list-item>
            </n-list>
            <n-pagination
              class="pagination"
              :page-slot="5"
              :item-count="listData.data.length"
              :page-sizes="[20]"
              v-model:page="pageNumber"
            />
          </div>
        </template>
      </Transition>
    </n-card>
  </div>
</template>

<script setup>
import { Fire } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { getCacheVersion } from "@/utils/cache";
import { useRouter } from "vue-router";
import { formatTime } from "@/utils/getTime";
import { getHotListsWithFallback } from "@/api";

const router = useRouter();
const store = mainStore();
const isClient = typeof window !== "undefined";
const cacheVersion = getCacheVersion();
const isPrerender =
  isClient && window.__PRERENDER_INJECTED && window.__PRERENDER_INJECTED.prerender;
const coverErrorMap = reactive({});

const updateTime = ref(null);
const availableNews = computed(() => {
  const categoryOn = store.categoryEnabled;
  const currentCat = store.activeCategory;
  return store.newsArr
    .filter((item) => item.show)
    .filter((item) => !store.unavailableSources.includes(item.name))
    .filter((item) =>
      categoryOn && currentCat !== "全部" ? item.category === currentCat : true
    )
    .sort((a, b) => a.order - b.order);
});
const listType = ref(
  router.currentRoute.value.query.type || availableNews.value[0]?.name
);
const pageNumber = ref(
  router.currentRoute.value.query.page
    ? Number(router.currentRoute.value.query.page)
    : 1
);
const listData = ref(null);
const isDesktop = ref(isClient ? window.innerWidth > 680 : true);
const linkTarget = computed(() =>
  store.linkOpenType === "open" ? "_blank" : "_self"
);
const showImages = computed(() => store.showImages);
const logoSrc = (name) => `/logo/${name}.png?v=${cacheVersion}`;

// 获取热榜数据
const getHotListsData = async (name, isNew = false) => {
  if (!name) return;
  if (isPrerender) {
    const label = store.newsArr.find((item) => item.name === name)?.label || "热门榜单";
    listData.value = {
      title: `${label}热榜`,
      subtitle: "实时热榜 | 预渲染占位",
      data: [],
    };
    updateTime.value = formatTime(new Date().toISOString());
    return;
  }
  listData.value = null;
  const item = store.newsArr.find((item) => item.name == name);
  if (!item) return;
  const useApi2 = item?.useApi2 || item?.api === 2 || item?.api === "api2";
  getHotListsWithFallback(item.name, isNew, item.params, { useApi2 })
    .then(({ result, usedFallback, fallbackSuccess }) => {
      console.log(result);
      if (usedFallback && fallbackSuccess && !useApi2) {
        store.setSourceApi2(item.name, true);
      }
      if (result.code === 200) {
        store.markAvailable(item.name);
        listData.value = result;
      } else {
        store.markUnavailable(item.name);
        $message.error(result.message);
      }
    })
    .catch(() => {
      store.markUnavailable(item.name);
      $message.error("热榜加载失败，请重试");
    });
};

const updateIsDesktop = () => {
  if (!isClient) return;
  isDesktop.value = window.innerWidth > 680;
};

const getItemLink = (data) => {
  if (!data?.url && !data?.mobileUrl) return "";
  if (!data?.url) return data.mobileUrl;
  if (!data?.mobileUrl) return data.url;
  return isDesktop.value ? data.url : data.mobileUrl;
};

// 切换类别
const changeType = (type) => {
  if (!type) return;
  router.push({
    path: "/list",
    query: {
      type,
      page: 1,
    },
  });
};

// 实时改变更新时间
watch(
  () => store.timeData,
  () => {
    if (listData.value) {
      updateTime.value = formatTime(listData.value.updateTime);
    }
  }
);

// 页数变化
watch(
  () => pageNumber.value,
  (val) => {
    router.push({
      path: "/list",
      query: {
        type: listType.value,
        page: val,
      },
    });
    document.querySelector(".n-back-top")?.click();
  }
);

// 类别变化
watch(
  () => router.currentRoute.value,
  (val) => {
    if (val.name === "list") {
      listType.value = val.query.type;
      pageNumber.value = Number(val.query.page);
      getHotListsData(listType.value);
    }
  }
);

watch(
  () => [availableNews.value, store.activeCategory],
  () => {
    const exists = availableNews.value.find((i) => i.name === listType.value);
    if (!exists && availableNews.value[0]) {
      changeType(availableNews.value[0].name);
    }
  },
  { deep: true }
);

onMounted(() => {
  updateIsDesktop();
  if (isClient) {
    window.addEventListener("resize", updateIsDesktop);
  }
  getHotListsData(listType.value);
});

onBeforeUnmount(() => {
  if (isClient) {
    window.removeEventListener("resize", updateIsDesktop);
  }
});
</script>

<style lang="scss" scoped>
.list {
  .type {
    width: 100%;
    .tag {
      cursor: pointer;
      .logo {
        height: 22px;
        width: 22px;
        margin-left: 6px;
      }
    }
  }
  .card {
    margin-top: 20px;
    border-radius: 8px;
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s ease-in-out;
    }

    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
    .loading {
      display: flex;
      align-items: center;
    }
    :deep(.n-card__content) {
      @media (max-width: 740px) {
        padding: 0 12px 12px 12px;
      }
    }
    .header {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: center;
      justify-content: space-between;
      height: 60px;
      .logo {
        display: flex;
        align-items: center;
        img {
          height: 50px;
          width: 50px;
        }
      }
      .name {
        display: flex;
        align-items: center;
        flex-direction: column;
        .title {
          font-size: 22px;
          font-weight: bold;
        }
        .subtitle {
          font-size: 14px;
        }
      }
      .data {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 14px;
        .total {
          &::before {
            content: "共 ";
          }
          &::after {
            content: " 条 ·";
            margin-right: 6px;
          }
        }
      }
      @media (max-width: 740px) {
        display: flex;
        justify-content: flex-start;
        .logo {
          img {
            width: 32px;
            height: 32px;
          }
        }
        .name {
          margin-left: 12px;
          align-items: flex-end;
          flex-direction: row;
          .subtitle {
            margin-bottom: 3px;
            margin-left: 8px;
          }
        }
        .data {
          margin-left: auto;
        }
      }
    }
    .all {
      display: flex;
      flex-direction: column;
      align-items: center;
      .num {
        width: 24px;
        height: 24px;
        min-width: 24px;
        margin-right: 8px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--n-border-color);
        border-radius: 8px;
        transition: all 0.3s;
        &:hover {
          background-color: var(--n-close-color-hover);
        }
        &.one {
          background-color: #ea444d;
          color: #fff;
        }
        &.two {
          background-color: #ed702d;
          color: #fff;
        }
        &.three {
          background-color: #eead3f;
          color: #fff;
        }
      }
      .text {
        display: flex;
        flex-direction: row;
        text-decoration: none;
        color: inherit;
        .content {
          display: grid;
          grid-template-columns: 1fr 160px;
          gap: 12px;
          align-items: center;
          width: 100%;
        }
        .copy {
          display: flex;
          flex-direction: column;
          .title {
            font-size: 16px;
            margin-bottom: 4px;
          }
          .desc {
            overflow: hidden;
            font-size: 14px;
            display: -webkit-inline-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 5;
          }
        }
        .cover-wrapper {
          max-height: none;
          opacity: 1;
          overflow: hidden;
          .cover {
            width: 160px;
            height: 96px;
            object-fit: cover;
            border-radius: 12px;
            display: block;
          }
        }
      }
      .message {
        display: flex;
        align-items: center;
        margin-top: 12px;
        .hot {
          display: flex;
          align-items: center;
          font-size: 13px;
          .hot-text {
            margin-left: 4px;
            line-height: 0;
          }
        }
      }
      .pagination {
        margin: 20px 0;
      }
      @media (max-width: 740px) {
        :deep(.n-list-item) {
          padding: 12px 10px;
          .n-list-item__prefix {
            margin-right: 12px;
          }
          .content {
            grid-template-columns: 1fr;
          }
          .cover {
            width: 100%;
            height: auto;
          }
        }
      }
    }
  }
}
</style>
