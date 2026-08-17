<template>
  <div class="feedback-entry" :class="{ 'is-open': menuOpen }">
    <Transition name="feedback-menu">
      <div v-if="menuOpen" class="feedback-menu" role="menu" :aria-label="t('feedback.menuTitle')">
        <div class="feedback-menu-head">
          <strong>{{ t("feedback.menuTitle") }}</strong>
          <span>{{ t("feedback.menuDesc") }}</span>
        </div>

        <button
          v-for="item in feedbackTypes"
          :key="item.board"
          type="button"
          class="feedback-option"
          role="menuitem"
          :disabled="loadingBoard === item.board"
          @click="openFeedback(item)"
        >
          <span class="feedback-option-icon" aria-hidden="true">
            <component :is="item.icon" />
          </span>
          <span class="feedback-option-copy">
            <strong>{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </span>
          <span v-if="loadingBoard === item.board" class="feedback-option-status">
            {{ t("feedback.loading") }}
          </span>
          <span v-else class="feedback-option-arrow" aria-hidden="true">→</span>
        </button>

        <a
          class="feedback-portal-link"
          :href="feedbackPortalUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ t("feedback.openPortal") }}
        </a>
      </div>
    </Transition>

    <button
      type="button"
      class="feedback-launcher"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      @click="menuOpen = !menuOpen"
    >
      <span class="feedback-launcher-icon" aria-hidden="true">
        <Message />
      </span>
      <span class="feedback-launcher-label">{{ t("feedback.launcher") }}</span>
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { Bug, Message, Optimize, Tips } from "@icon-park/vue-next";
import { getBuildNumber, getProductVersion } from "@/utils/cache";

const feedbackPortalUrl = "https://feedback.wuaishare.cn/";
const feedbackSdkUrl = `${feedbackPortalUrl}api/widget/sdk.js`;
const feedbackScriptId = "dailyhot-quackback-sdk";

const { t, locale } = useI18n({ useScope: "global" });
const router = useRouter();
const menuOpen = ref(false);
const loadingBoard = ref("");
let sdkPromise = null;

const feedbackTypes = computed(() => [
  {
    icon: Tips,
    label: t("feedback.feature"),
    description: t("feedback.featureDesc"),
    board: "dailyhot-feature-requests",
    type: "feature-request",
  },
  {
    icon: Bug,
    label: t("feedback.bug"),
    description: t("feedback.bugDesc"),
    board: "dailyhot-bug-reports",
    type: "bug-report",
  },
  {
    icon: Optimize,
    label: t("feedback.ux"),
    description: t("feedback.uxDesc"),
    board: "dailyhot-ux-feedback",
    type: "ux-feedback",
  },
]);

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
  if (currentLocale === "zh-CN" || currentLocale === "zh-TW" || currentLocale === "en") {
    return currentLocale;
  }
  return "en";
};

const buildMetadata = (feedbackType) => {
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
    feedback_type: feedbackType,
    page_path: route?.path || "/",
    locale: String(locale.value || "zh-CN"),
    viewport,
  };
};

const ensureWidget = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Feedback widget requires a browser environment"));
  }
  if (sdkPromise) return sdkPromise;

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

  return sdkPromise;
};

const openFeedback = async (item) => {
  loadingBoard.value = item.board;
  try {
    const quackback = ensureQueue();
    quackback("metadata", buildMetadata(item.type));
    await ensureWidget();
    window.Quackback?.("metadata", buildMetadata(item.type));
    window.Quackback?.("open", {
      view: "new-post",
      board: item.board,
    });
    menuOpen.value = false;
  } catch (error) {
    console.warn("Unable to open embedded feedback widget, falling back to portal", error);
    window.open(`${feedbackPortalUrl}?board=${encodeURIComponent(item.board)}`, "_blank", "noopener,noreferrer");
  } finally {
    loadingBoard.value = "";
  }
};

const handleEscape = (event) => {
  if (event.key === "Escape") menuOpen.value = false;
};

onMounted(() => window.addEventListener("keydown", handleEscape));
onBeforeUnmount(() => window.removeEventListener("keydown", handleEscape));
</script>

<style lang="scss" scoped>
.feedback-entry {
  position: fixed;
  left: max(16px, env(safe-area-inset-left));
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 2400;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.feedback-launcher {
  display: inline-flex;
  align-items: center;
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

.feedback-menu {
  width: min(342px, calc(100vw - 32px));
  padding: 10px;
  border: 1px solid rgba(127, 127, 127, 0.18);
  border-radius: 14px;
  color: var(--n-text-color, inherit);
  background: var(--n-color, rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(18px);
}

.feedback-menu-head {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 6px 9px;

  strong {
    font-size: 14px;
    line-height: 1.4;
  }

  span {
    color: var(--n-text-color-3, rgba(127, 127, 127, 0.92));
    font-size: 12px;
    line-height: 1.5;
  }
}

.feedback-option {
  width: 100%;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border: 0;
  border-radius: 10px;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.16s ease;

  &:hover,
  &:focus-visible {
    background: rgba(127, 127, 127, 0.1);
    outline: none;
  }

  &:disabled {
    cursor: wait;
    opacity: 0.72;
  }
}

.feedback-option-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(127, 127, 127, 0.1);
  font-size: 16px;
}

.feedback-option-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 13px;
    line-height: 1.35;
  }

  span {
    color: var(--n-text-color-3, rgba(127, 127, 127, 0.9));
    font-size: 11px;
    line-height: 1.45;
  }
}

.feedback-option-arrow,
.feedback-option-status {
  color: var(--n-text-color-3, rgba(127, 127, 127, 0.9));
  font-size: 12px;
  white-space: nowrap;
}

.feedback-portal-link {
  display: block;
  margin: 5px 6px 2px;
  color: var(--n-text-color-3, rgba(127, 127, 127, 0.9));
  font-size: 11px;
  text-align: center;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: var(--n-text-color, inherit);
    text-decoration: underline;
    outline: none;
  }
}

.feedback-menu-enter-active,
.feedback-menu-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
  transform-origin: bottom left;
}

.feedback-menu-enter-from,
.feedback-menu-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

@media (max-width: 640px) {
  .feedback-entry {
    left: max(12px, env(safe-area-inset-left));
    bottom: max(12px, env(safe-area-inset-bottom));
  }

  .feedback-launcher {
    min-width: 40px;
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
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
  .feedback-menu-enter-active,
  .feedback-menu-leave-active {
    transition: none;
  }
}
</style>
