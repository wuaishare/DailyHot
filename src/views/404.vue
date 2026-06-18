<template>
  <n-layout
    embedded
    class="state"
    :content-style="{
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  >
    <n-result
      class="error"
      status="404"
      :title="t('statePage.notFoundTitle')"
      :description="t('statePage.notFoundDescription')"
    >
      <template #footer>
        <n-button @click="goHome">{{ t("statePage.reload") }}</n-button>
      </template>
    </n-result>
  </n-layout>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
const router = useRouter();
const { t } = useI18n({ useScope: "global" });

const goHome = () => {
  router.push("/");
};
</script>

<style lang="scss" scoped>
.state {
  height: 100%;
}
</style>
