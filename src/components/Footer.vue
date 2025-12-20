<template>
  <footer>
    <div class="copyright">
      <n-text class="description" v-html="packageJson.description" />
      <n-a
        class="author"
        :depth="3"
        :href="packageJson.github"
        target="_blank"
        rel="noopener noreferrer"
        v-html="packageJson.author"
      />
      <n-text>. Powered by </n-text>
      <n-a
        class="author-link"
        :depth="3"
        :href="originRepo.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ originRepo.label }}
      </n-a>
      <n-text>. </n-text>
    </div>
    <div class="quick-links">
      <template v-for="(link, index) in footerLinks" :key="link.label">
        <n-a
          class="link"
          :depth="3"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.label }}
        </n-a>
        <span v-if="index !== footerLinks.length - 1" class="separator">|</span>
      </template>
    </div>
    <n-a
      v-if="icp"
      :depth="3"
      class="icp"
      v-html="icp"
      href="https://beian.miit.gov.cn/"
      target="_blank"
      rel="noopener noreferrer"
    />
  </footer>
</template>

<script setup>
import packageJson from "@/../package.json";
import { getCacheVersion } from "@/utils/cache";

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

const appVersion = getCacheVersion();

const originRepo = {
  label: `DailyHot(二次开发版 v${appVersion})`,
  href: "https://github.com/wuaishare/DailyHot/tree/live",
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
        content: "Copyright @";
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
      text-decoration: none;
      color: inherit;
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
    text-decoration: none;
    color: inherit;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
  .author-link {
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    color: inherit;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
  .icp {
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s;
    text-decoration: none;
    color: inherit;
    &:hover {
      color: var(--n-code-text-color);
    }
  }
}
</style>
