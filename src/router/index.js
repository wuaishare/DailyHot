import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { applySeoMeta } from "@/utils/seo";
import { trackEvent } from "@/utils/track";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach(() => {
  if (typeof window !== "undefined" && window.$loadingBar) {
    window.$loadingBar.start();
  }
});

router.beforeEach((to) => {
  if (
    to.name === "analytics" &&
    typeof window !== "undefined" &&
    import.meta.env.PROD
  ) {
    return { path: "/404" };
  }
});

router.afterEach((to) => {
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
