<template>
  <footer>
    <div class="copyright">
      <n-text class="description">{{ t("footer.description") }}</n-text>
      <n-a
        class="author"
        :depth="3"
        :href="authorUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t("footer.author") }}
      </n-a>
      <n-text>. {{ t("footer.poweredBy") }} </n-text>
      <n-a
        class="author-link"
        :depth="3"
        :href="originRepo.href"
        :title="originRepo.title"
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
          :target="link.external ? '_blank' : undefined"
          :rel="link.external ? 'noopener noreferrer' : undefined"
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
import { useI18n } from "vue-i18n";
import packageJson from "@/../package.json";
import { feedbackConfig } from "@/config/feedback.mjs";
import { getBuildVersion, getDisplayVersion } from "@/utils/cache";
import { buildFixedLocalePath } from "@/utils/locale";

const icp = ref(import.meta.env.VITE_ICP ? import.meta.env.VITE_ICP : null);
const { t, locale } = useI18n({ useScope: "global" });

const footerLinks = computed(() => {
  const links = [
    {
      label: t("footer.autoRefresh"),
      href: "https://greasyfork.org/zh-CN/scripts/541188",
      external: true,
    },
    {
      label: t("footer.community"),
      href: "https://sns.wuaishare.cn/",
      external: true,
    },
    {
      label: t("footer.reading"),
      href: "https://v.wuaishare.cn/",
      external: true,
    },
    {
      label: t("footer.privacy"),
      href: buildFixedLocalePath(locale.value, "/privacy"),
      external: false,
    },
  ];

  if (feedbackConfig.enabled) {
    links.push({
      label: t("footer.feedback"),
      href: feedbackConfig.portalUrl,
      external: true,
    });
  }

  return links;
});

const appVersion = getDisplayVersion();
const buildVersion = getBuildVersion();
const authorUrl = packageJson.author?.url || packageJson.homepage;
const repositoryUrl = String(packageJson.repository?.url || "").replace(/\.git$/, "");

const originRepo = computed(() => ({
  label: t("footer.releaseLabel", { version: appVersion }),
  href: `${repositoryUrl}/tree/main`,
  title: buildVersion,
}));
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
        content: "Copyright ©";
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
