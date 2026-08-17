<template>
  <Transition name="feedback-launcher">
    <div v-if="!widgetOpen" class="feedback-entry">
      <button
        type="button"
        class="feedback-launcher"
        :disabled="loading"
        :aria-label="t('feedback.launcher')"
        @click="openFeedback"
      >
        <span class="feedback-launcher-icon" aria-hidden="true">
          <Message />
        </span>
        <span class="feedback-launcher-label">
          {{ loading ? t("feedback.loading") : t("feedback.launcher") }}
        </span>
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Message } from "@icon-park/vue-next";
import { getBuildNumber, getProductVersion } from "@/utils/cache";

const feedbackPortalUrl = "https://feedback.wuaishare.cn/";
const feedbackSdkUrl = `${feedbackPortalUrl}api/widget/sdk.js`;
const feedbackScriptId = "dailyhot-quackback-sdk";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();
const loading = ref(false);
const widgetOpen = ref(false);
let sdkPromise = null;
let closeHandlerRegistered = false;

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

const buildMetadata = () => {
  const route = router.currentRoute.value;
  const viewport =
    typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "unknown";

  return {
    product: "吾爱热榜",
    product_key: "dailyhot",
    product_version: getProductVersion(),
    build_number: getBuildNumber(),
    channel: "web",
    source: "dailyhot-web",
    entry: "global-feedback-launcher",
    page_path: route?.path || "/",
    locale: String(locale.value || "zh-CN"),
    viewport,
  };
};

const ensureWidget = async () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Feedback widget requires a browser environment");
  }

  if (!sdkPromise) {
    const quackback = ensureQueue();
    quackback("init", {
      instanceUrl: feedbackPortalUrl.replace(/\/$/, ""),
      launcher: false,
      locale: getWidgetLocale(),
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
    window.Quackback?.("on", "close", () => {
      widgetOpen.value = false;
    });
    closeHandlerRegistered = true;
  }
};

const openFeedback = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    await ensureWidget();
    window.Quackback?.("metadata", buildMetadata());
    widgetOpen.value = true;
    window.Quackback?.("open");
  } catch (error) {
    widgetOpen.value = false;
    console.warn("Unable to open embedded feedback widget, falling back to portal", error);
    window.open(feedbackPortalUrl, "_blank", "noopener,noreferrer");
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.feedback-entry {
  position: fixed;
  right: max(16px, env(safe-area-inset-right));
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 2400;
}

.feedback-launcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid rgba(127, 127, 127, 0.2);
  border-radius: 999px;
  color: var(--n-text-color, inherit);
  background: var(--n-color, rgba(255, 255, 255, 0.94));
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.14);
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &:hover,
  &:focus-visible {
    transform: translateY(-1px);
    border-color: rgba(127, 127, 127, 0.34);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    outline: none;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
}

.feedback-launcher-icon {
  display: inline-flex;
  font-size: 17px;
  line-height: 1;
}

.feedback-launcher-label {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.feedback-launcher-enter-active,
.feedback-launcher-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.feedback-launcher-enter-from,
.feedback-launcher-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.96);
}

@media (max-width: 640px) {
  .feedback-entry {
    right: max(12px, env(safe-area-inset-right));
    bottom: max(12px, env(safe-area-inset-bottom));
  }

  .feedback-launcher {
    width: 42px;
    height: 42px;
    min-height: 42px;
    padding: 0;
  }

  .feedback-launcher-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feedback-launcher,
  .feedback-launcher-enter-active,
  .feedback-launcher-leave-active {
    transition: none;
  }
}
</style>
