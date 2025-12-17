<template>
  <footer>
    <div class="copyright">
      <n-text class="description" v-html="packageJson.description" />
      <n-text
        class="author"
        :depth="3"
        v-html="packageJson.author"
        @click="jumpLink(packageJson.github)"
      />
      <n-text class="author-link" :depth="3" @click="jumpLink(originRepo.href)">
        （{{ originRepo.label }}）
      </n-text>
    </div>
    <div class="quick-links">
      <template v-for="(link, index) in footerLinks" :key="link.label">
        <n-text class="link" :depth="3" @click="jumpLink(link.href)">
          {{ link.label }}
        </n-text>
        <span v-if="index !== footerLinks.length - 1" class="separator">|</span>
      </template>
    </div>
    <n-text
      v-if="icp"
      :depth="3"
      class="icp"
      v-html="icp"
      @click="jumpLink('https://beian.miit.gov.cn/')"
    />
  </footer>
</template>

<script setup>
import packageJson from "@/../package.json";

const icp = ref(import.meta.env.VITE_ICP ? import.meta.env.VITE_ICP : null);

const footerLinks = [
  {
    label: "网页自动刷新（油猴脚本）",
    href: "https://greasyfork.org/zh-CN/scripts/541188",
  },
  {
    label: "吾爱分享社区",
    href: "https://sns.wuaishare.cn/",
  },
  {
    label: "精品阅读站",
    href: "https://v.wuaishare.cn/",
  },
];

const originRepo = {
  label: "原Git项目",
  href: "https://github.com/imsyy/DailyHot",
};

// 链接跳转
const jumpLink = (url) => {
  window.open(url);
};
</script>

<style lang="scss" scoped>
footer {
  height: 100px;
  padding: 0 5vw;
  max-width: 1800px;
  margin: 20px auto 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .copyright {
    margin-bottom: 4px;
    .description {
      &::after {
        content: "@ Copyright By";
        margin: 0 6px;
      }
    }
  }
  .quick-links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 4px;
    .link {
      cursor: pointer;
      transition: all 0.3s;
      &:hover {
        color: var(--n-code-text-color);
      }
    }
    .separator {
      color: var(--n-code-text-color);
    }
  }
  .author {
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
  .author-link {
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
  .icp {
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
}
</style>
