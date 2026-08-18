<template>
  <n-float-button
    class="feedback-float-button"
    :class="{ 'is-loading': loading }"
    position="relative"
    :width="44"
    :height="44"
    :title="loading ? t('feedback.loading') : t('feedback.launcher')"
    :aria-label="t('feedback.launcher')"
    :aria-busy="loading"
    @click="openFeedback"
  >
    <n-icon size="21">
      <Message />
    </n-icon>
  </n-float-button>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Message } from "@icon-park/vue-next";
import { feedbackConfig } from "@/config/feedback.mjs";
import { getBuildNumber, getProductVersion } from "@/utils/cache";

const emit = defineEmits(["update:open"]);
const feedbackSdkVersion = `${getProductVersion()}-${getBuildNumber()}`;
const feedbackSdkUrl = `${feedbackConfig.url}/api/widget/sdk.js?v=${encodeURIComponent(
  feedbackSdkVersion
)}`;
const feedbackScriptId = "dailyhot-quackback-sdk";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();
const loading = ref(false);
const widgetOpen = ref(false);
let sdkPromise = null;
let closeHandlerRegistered = false;

watch(
  widgetOpen,
  (open) => {
    emit("update:open", open);
  },
  { immediate: true }
);

const ensureQueue = () => {
  if (typeof window === "undefined") return null;
  if (typeof window.Quackback === "function") return window.Quackback;

  const queue = function (...args) {
    queue.q = queue.q || [];
    queue.q.push(args);
  };
  queue.q = [];
  window.Quackback = queue;
  return queue;
};

const getWidgetLocale = () => {
  const currentLocale = String(locale.value || "zh-CN");
  if (["zh-CN", "zh-TW", "en"].includes(currentLocale)) return currentLocale;
  return "en";
};

const buildFeedbackIntro = () => ({
  title: t("feedback.menuTitle", { productName: feedbackConfig.productName }),
  description: t("feedback.menuDesc"),
  items: [
    { label: t("feedback.feature"), description: t("feedback.featureDesc") },
    { label: t("feedback.bug"), description: t("feedback.bugDesc") },
    { label: t("feedback.ux"), description: t("feedback.uxDesc") },
  ],
});

const buildMetadata = () => {
  const route = router.currentRoute.value;
  const viewport =
    typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "unknown";

  return {
    product: feedbackConfig.productName,
    product_key: feedbackConfig.productKey,
    product_version: getProductVersion(),
    build_number: getBuildNumber(),
    channel: "web",
    source: "dailyhot-web",
    entry: "floating-action-group",
    page_path: route?.path || "/",
    locale: String(locale.value || "zh-CN"),
    viewport,
  };
};

const handleWidgetClose = () => {
  widgetOpen.value = false;
};

const ensureWidget = async () => {
  if (feedbackConfig.provider !== "quackback") return;
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Feedback widget requires a browser environment");
  }

  if (!sdkPromise) {
    const quackback = ensureQueue();
    quackback("init", {
      instanceUrl: feedbackConfig.url,
      launcher: false,
      locale: getWidgetLocale(),
      feedbackIntro: buildFeedbackIntro(),
    });

    const existingScript = document.getElementById(feedbackScriptId);
    sdkPromise = new Promise((resolve, reject) => {
      if (existingScript?.dataset.loaded === "true") {
        resolve();
        return;
      }

      const script = existingScript || document.createElement("script");
      script.id = feedbackScriptId;
      script.async = true;
      script.src = feedbackSdkUrl;
      script.referrerPolicy = "strict-origin-when-cross-origin";

      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          resolve();
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        () => {
          sdkPromise = null;
          reject(new Error("Failed to load feedback widget"));
        },
        { once: true }
      );

      if (!existingScript) document.head.appendChild(script);
    });
  }

  await sdkPromise;

  if (!closeHandlerRegistered) {
    window.Quackback?.("on", "close", handleWidgetClose);
    closeHandlerRegistered = true;
  }
};

const openExternalFeedback = () => {
  if (!feedbackConfig.portalUrl || typeof window === "undefined") return;
  window.open(feedbackConfig.portalUrl, "_blank", "noopener,noreferrer");
};

const openFeedback = async () => {
  if (!feedbackConfig.enabled || loading.value || widgetOpen.value) return;

  if (feedbackConfig.provider !== "quackback") {
    openExternalFeedback();
    return;
  }

  loading.value = true;

  try {
    await ensureWidget();
    window.Quackback?.("metadata", buildMetadata());
    widgetOpen.value = true;
    window.Quackback?.("open");
  } catch (error) {
    widgetOpen.value = false;
    console.warn("Unable to open embedded feedback widget, falling back to portal", error);
    openExternalFeedback();
  } finally {
    loading.value = false;
  }
};

onBeforeUnmount(() => {
  if (closeHandlerRegistered) {
    window.Quackback?.("off", "close", handleWidgetClose);
  }
});
</script>

<style lang="scss" scoped>
.feedback-float-button {
  cursor: pointer;
}

.feedback-float-button.is-loading {
  cursor: wait;
  opacity: 0.72;
  pointer-events: none;
}
</style>
