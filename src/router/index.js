import { createRouter, createWebHistory } from "vue-router";
import routes from "@/router/routes";
import { applySeoMeta } from "@/utils/seo";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 路由守卫
router.beforeEach(() => {
  $loadingBar.start();
});

router.afterEach((to) => {
  $loadingBar.finish();
  applySeoMeta(to);
});

export default router;
