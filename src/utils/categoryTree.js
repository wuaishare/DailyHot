import { BUILTIN_CATEGORIES } from "@/config/site-metadata.mjs";

export const MAX_CATEGORY_DEPTH = 3;

const builtinById = new Map(BUILTIN_CATEGORIES.map((item) => [item.id, item]));
const builtinByName = new Map(
  BUILTIN_CATEGORIES.map((item) => [item.name, item]),
);

export const normalizeCategoryNode = (item = {}, index = 0) => ({
  ...item,
  id: String(item.id || `custom-${Date.now()}-${index}`),
  name: String(item.name || "未命名分类"),
  slug:
    item.slug ||
    builtinById.get(String(item.id || ""))?.slug ||
    `custom-${String(item.id || index)}`,
  parentId: item.parentId || null,
  order: Number.isFinite(Number(item.order)) ? Number(item.order) : index,
  builtin: Boolean(item.builtin || builtinById.has(String(item.id || ""))),
});

export const normalizeCategoryTree = (list = []) =>
  list.map(normalizeCategoryNode);

export const getCategoryByRef = (categories = [], ref) => {
  if (!ref) return null;
  const value = String(ref);
  return (
    categories.find(
      (item) => item.id === value || item.name === value || item.slug === value,
    ) ||
    builtinById.get(value) ||
    builtinByName.get(value) ||
    null
  );
};

export const getCategoryDepth = (categories = [], categoryId) => {
  let depth = 1;
  let node = getCategoryByRef(categories, categoryId);
  const seen = new Set();
  while (node?.parentId && !seen.has(node.id)) {
    seen.add(node.id);
    node = getCategoryByRef(categories, node.parentId);
    depth += 1;
  }
  return depth;
};

export const getCategoryDescendantIds = (categories = [], categoryId) => {
  const output = new Set([String(categoryId)]);
  let changed = true;
  while (changed) {
    changed = false;
    categories.forEach((item) => {
      if (
        item.parentId &&
        output.has(String(item.parentId)) &&
        !output.has(String(item.id))
      ) {
        output.add(String(item.id));
        changed = true;
      }
    });
  }
  return output;
};

export const getCategorySubtreeHeight = (categories = [], categoryId) => {
  const rootId = String(categoryId || "");
  if (!rootId) return 0;
  const visit = (id, seen = new Set()) => {
    if (seen.has(id)) return 0;
    const nextSeen = new Set(seen).add(id);
    const children = categories.filter(
      (item) => String(item.parentId || "") === id,
    );
    if (!children.length) return 1;
    return (
      1 + Math.max(...children.map((item) => visit(String(item.id), nextSeen)))
    );
  };
  return visit(rootId);
};

export const canMoveCategory = (
  categories = [],
  categoryId,
  parentId = null,
  maxDepth = MAX_CATEGORY_DEPTH,
) => {
  const category = getCategoryByRef(categories, categoryId);
  if (!category) return false;
  const subtreeHeight = getCategorySubtreeHeight(categories, category.id);
  if (!parentId) return subtreeHeight <= maxDepth;
  const parent = getCategoryByRef(categories, parentId);
  if (!parent || parent.id === category.id) return false;
  if (
    getCategoryDescendantIds(categories, category.id).has(String(parent.id))
  ) {
    return false;
  }
  return getCategoryDepth(categories, parent.id) + subtreeHeight <= maxDepth;
};

export const getSourceCategoryIds = (item = {}, categories = []) => {
  const explicit = Array.isArray(item.categoryIds)
    ? item.categoryIds.filter(Boolean).map(String)
    : [];
  if (explicit.length) return [...new Set(explicit)];
  const legacy = getCategoryByRef(categories, item.category || "综合");
  return [String(legacy?.id || "general")];
};

export const sourceBelongsToCategory = (
  item,
  categoryRef,
  categories = [],
  includeDescendants = true,
) => {
  const target = getCategoryByRef(categories, categoryRef);
  if (!target) return false;
  const allowed = includeDescendants
    ? getCategoryDescendantIds(categories, target.id)
    : new Set([String(target.id)]);
  return getSourceCategoryIds(item, categories).some((id) =>
    allowed.has(String(id)),
  );
};

export const syncLegacyPrimaryCategory = (item = {}, categories = []) => {
  const ids = getSourceCategoryIds(item, categories);
  const primary = getCategoryByRef(categories, ids[0]);
  return {
    ...item,
    categoryIds: ids,
    category: primary?.name || item.category || "综合",
  };
};
