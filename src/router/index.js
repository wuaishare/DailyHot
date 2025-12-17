import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { applySeoMeta } from "@/utils/seo";

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

router.afterEach((to) => {
  if (typeof window !== "undefined" && window.$loadingBar) {
    window.$loadingBar.finish();
  }
  applySeoMeta(to);
});

export default router;
