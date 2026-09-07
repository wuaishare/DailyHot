<!-- 全局配置组件 -->
<template>
  <n-config-provider
    abstract
    inline-theme-disabled
    :locale="currentNaiveLocale"
    :date-locale="currentNaiveDateLocale"
    :theme="theme"
    :theme-overrides="themeOverrides"
  >
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider :max="1">
            <slot></slot>
            <NaiveProviderContent />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import {
  zhCN,
  dateZhCN,
  enUS,
  dateEnUS,
  zhTW,
  dateZhTW,
  jaJP,
  dateJaJP,
  koKR,
  dateKoKR,
  darkTheme,
  useOsTheme,
  useLoadingBar,
  useDialog,
  useMessage,
  useNotification,
} from "naive-ui";
import { useI18n } from "vue-i18n";
import { mainStore } from "@/store";
import { setDocumentLanguage } from "@/utils/locale";

const store = mainStore();
const osThemeRef = useOsTheme();
const { locale } = useI18n({ useScope: "global" });

// 明暗切换：首 render 必须与 index.html 的 boot theme 完全一致，不能等 mounted。
const getBootTheme = () => {
  if (typeof document === "undefined") return "";
  const value = document.documentElement.dataset.dailyhotTheme;
  return value === "dark" || value === "light" ? value : "";
};

const resolveInitialTheme = () => {
  const bootTheme = getBootTheme();
  if (bootTheme) return bootTheme;
  if (store.siteThemeAuto && osThemeRef.value) {
    return osThemeRef.value === "dark" ? "dark" : "light";
  }
  return store.siteTheme === "dark" ? "dark" : "light";
};

const initialTheme = resolveInitialTheme();
if (store.siteThemeAuto && store.siteTheme !== initialTheme) {
  store.siteTheme = initialTheme;
}
const theme = ref(initialTheme === "dark" ? darkTheme : null);

const applyDocumentTheme = (value) => {
  if (typeof document === "undefined") return;
  const normalized = value === "dark" ? "dark" : "light";
  document.documentElement.dataset.dailyhotTheme = normalized;
  document.documentElement.style.colorScheme = normalized;
  const themeColor = document.querySelector(
    'meta[name="theme-color"][data-dailyhot-theme-color]'
  );
  themeColor?.setAttribute(
    "content",
    normalized === "dark" ? "#101014" : "#ffffff"
  );
};

applyDocumentTheme(initialTheme);

const changeTheme = () => {
  if (store.siteTheme === "light") {
    theme.value = null;
    applyDocumentTheme("light");
  } else if (store.siteTheme === "dark") {
    theme.value = darkTheme;
    applyDocumentTheme("dark");
  }
};

const localeMap = {
  "zh-CN": { locale: zhCN, dateLocale: dateZhCN },
  en: { locale: enUS, dateLocale: dateEnUS },
  "zh-TW": { locale: zhTW, dateLocale: dateZhTW },
  ja: { locale: jaJP, dateLocale: dateJaJP },
  ko: { locale: koKR, dateLocale: dateKoKR },
};

const currentNaiveLocale = computed(
  () => localeMap[locale.value]?.locale || zhCN
);

const currentNaiveDateLocale = computed(
  () => localeMap[locale.value]?.dateLocale || dateZhCN
);

// 根据系统决定明暗切换
const osThemeChange = (val) => {
  if (store.siteThemeAuto) {
    val == "dark" ? (store.siteTheme = "dark") : (store.siteTheme = "light");
  }
};

// 监听明暗变化
watch(
  () => store.siteTheme,
  () => {
    changeTheme();
  }
);

// 监听系统明暗变化
watch(
  () => osThemeRef.value,
  (val) => {
    osThemeChange(val);
  }
);

watch(
  () => locale.value,
  (val) => {
    setDocumentLanguage(val);
  },
  { immediate: true }
);

// 配置主题色
const themeOverrides = {
  common: {
    primaryColor: "#ea444d",
    primaryColorHover: "#F57B74",
    primaryColorSuppl: "#F57B74",
    primaryColorPressed: "#F64B41",
  },
};

// 挂载 naive 组件的方法
const setupNaiveTools = () => {
  if (typeof window === "undefined") return;
  window.$loadingBar = useLoadingBar(); // 进度条
  window.$notification = useNotification(); // 通知
  window.$message = useMessage(); // 信息
  window.$dialog = useDialog(); // 对话框
};

const NaiveProviderContent = defineComponent({
  setup() {
    setupNaiveTools();
  },
  render() {
    return h("div", {
      class: {
        tools: true,
      },
    });
  },
});

// 首次主题已在 setup 阶段同步；watch 只负责后续用户/系统变更。
</script>
