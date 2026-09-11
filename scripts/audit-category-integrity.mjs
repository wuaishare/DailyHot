import assert from "node:assert/strict";
import { createPinia, setActivePinia } from "pinia";
import { createServer } from "vite";

const memory = new Map();
globalThis.localStorage = {
  getItem: (key) => (memory.has(key) ? memory.get(key) : null),
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key),
  clear: () => memory.clear(),
  key: (index) => [...memory.keys()][index] || null,
  get length() { return memory.size; },
};

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "silent",
});

try {
  const { mainStore } = await vite.ssrLoadModule("/src/store/index.js");
  setActivePinia(createPinia());
  const store = mainStore();
  store.ensureNewsList();
  store.categories.push(
    { id: "old-general-v0", name: "综合旧版", slug: "general", parentId: null, order: 0.25, builtin: false },
    { id: "custom-topic-a", name: "自定义热点", slug: "custom-hot", parentId: null, order: 98, builtin: false },
    { id: "custom-topic-b", name: "旧自定义热点", slug: "custom-hot", parentId: null, order: 99, builtin: false },
    { id: "custom-child", name: "旧子类", slug: "legacy-child", parentId: "custom-topic-b", order: 100, builtin: false },
  );
  const kuaishou = store.newsArr.find((item) => item.name === "kuaishou");
  kuaishou.categoryIds = ["old-general-v0", "custom-topic-b", "custom-child"];
  store.categoryViewModes = {
    "old-general-v0": "stream",
    "custom-topic-b": "stream",
    "custom-child": "card",
  };
  store.activeCategory = "综合旧版";
  store.ensureBuiltinCategories();

  const duplicates = (key) => {
    const counts = new Map();
    store.categories.forEach((item) => {
      const value = String(item?.[key] || "");
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    });
    return [...counts].filter(([, count]) => count > 1);
  };
  assert.deepEqual(duplicates("id"), []);
  assert.deepEqual(duplicates("name"), []);
  assert.deepEqual(duplicates("slug"), []);
  assert.equal(store.activeCategory, "综合");
  const migratedKuaishou = store.newsArr.find((item) => item.name === "kuaishou");
  assert.deepEqual(migratedKuaishou.categoryIds, ["general", "custom-topic-a", "custom-child"]);
  assert.equal(store.categories.find((item) => item.id === "custom-child")?.parentId, "custom-topic-a");
  assert.deepEqual(store.categoryViewModes, {
    general: "stream",
    "custom-topic-a": "stream",
    "custom-child": "card",
  });
  assert.equal(store.renameCategory("custom-child", "自定义热点"), false);
  assert.equal(store.categories.find((item) => item.id === "custom-child")?.name, "旧子类");
  console.log("[category-integrity] persisted duplicate categories and references reconcile safely");
} finally {
  await vite.close();
}
