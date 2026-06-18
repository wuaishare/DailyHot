import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { applySeoMeta } from "@/utils/seo";
import { mainStore } from "@/store";
import {
  buildRankPath,
  getCategoryNameBySlug,
  getLocaleFromRoute,
  getSourceNameBySlug,
  savePreferredLocale,
  setDocumentLanguage,
} from "@/utils/locale";
import { trackEvent } from "@/utils/track";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach((to) => {
  const store = mainStore();
  const locale = getLocaleFromRoute(to);
  setDocumentLanguage(locale);
  savePreferredLocale(locale);
  if (store?.setActiveCategory) {
    const categoryName = getCategoryNameBySlug(to.params?.categorySlug);
    store.setActiveCategory(categoryName || "全部");
  }
  if (typeof window !== "undefined" && window.$loadingBar) {
    window.$loadingBar.start();
  }
});

router.beforeEach((to) => {
  const locale = getLocaleFromRoute(to);
  const legacyType = to.query?.type;
  const legacySubtype = to.query?.subtype;
  if (to.name === "list-legacy" && legacyType) {
    const sourceSlug = getSourceNameBySlug(
      Array.isArray(legacyType) ? legacyType[0] : legacyType
    );
    const subtypeSlug = Array.isArray(legacySubtype)
      ? legacySubtype[0]
      : legacySubtype;
    return buildRankPath(locale, sourceSlug, subtypeSlug || "");
  }
  if (to.name === "list" || to.name === "list-locale") {
    const rawSourceSlug = Array.isArray(to.params?.sourceSlug)
      ? to.params.sourceSlug[0]
      : to.params?.sourceSlug;
    const sourceSlug = getSourceNameBySlug(rawSourceSlug);
    const subtypeSlug = Array.isArray(to.params?.subtypeSlug)
      ? to.params.subtypeSlug[0]
      : to.params?.subtypeSlug;
    if (rawSourceSlug && sourceSlug && rawSourceSlug !== sourceSlug) {
      return buildRankPath(locale, sourceSlug, subtypeSlug || "");
    }
  }
  const categoryName = getCategoryNameBySlug(to.params?.categorySlug);
  const store = mainStore();
  if (store?.setActiveCategory) {
    store.setActiveCategory(categoryName || "全部");
  }
});

router.afterEach((to) => {
  const locale = getLocaleFromRoute(to);
  setDocumentLanguage(locale);
  savePreferredLocale(locale);
  if (typeof window !== "undefined" && window.$loadingBar) {
    window.$loadingBar.finish();
  }
  applySeoMeta(to);
  trackEvent({
    event: "page_view",
    source: to.query.type || to.name,
    subtype: to.query.subtype,
    category: to.name === "home" ? "home" : "list",
    meta: {
      routeName: to.name,
      path: to.path,
    },
  });
});

export default router;
