<template>
  <div class="privacy">
    <div class="title">{{ t("privacyPage.title") }}</div>
    <n-card>
      <n-p>{{ t("privacyPage.intro") }}</n-p>
      <n-h4>{{ t("privacyPage.collectTitle") }}</n-h4>
      <n-ul>
        <n-li>{{ t("privacyPage.collect1") }}</n-li>
        <n-li>{{ t("privacyPage.collect2") }}</n-li>
        <n-li>{{ t("privacyPage.collect3") }}</n-li>
      </n-ul>
      <n-h4>{{ t("privacyPage.avoidTitle") }}</n-h4>
      <n-ul>
        <n-li>{{ t("privacyPage.avoid1") }}</n-li>
        <n-li>{{ t("privacyPage.avoid2") }}</n-li>
        <n-li>{{ t("privacyPage.avoid3") }}</n-li>
      </n-ul>
      <n-h4>{{ t("privacyPage.usageTitle") }}</n-h4>
      <n-p>{{ t("privacyPage.usageBody") }}</n-p>
      <n-h4>{{ t("privacyPage.revokeTitle") }}</n-h4>
      <n-p>{{ t("privacyPage.revokeBody") }}</n-p>
    </n-card>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.privacy {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .title {
    font-size: 30px;
    font-weight: 700;
  }
}
</style>
