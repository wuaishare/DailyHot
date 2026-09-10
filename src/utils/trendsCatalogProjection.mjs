export const flattenSubtypeOptions = (groups = []) =>
  groups.flatMap((group) => group.items || []);

const findTransportGroup = (staticGroups = [], remoteOptions = []) => {
  const remoteValues = new Set(remoteOptions.map((item) => item.value));
  let best = null;
  let bestOverlap = 0;
  for (const group of staticGroups) {
    const overlap = (group.items || []).filter((item) => remoteValues.has(item.value)).length;
    if (overlap > bestOverlap) {
      best = group;
      bestOverlap = overlap;
    }
  }
  return best;
};

const canProjectSource = (staticGroups = [], remoteGroups = []) => {
  if (!staticGroups.length) return true;
  const remoteValues = new Set(flattenSubtypeOptions(remoteGroups).map((item) => item.value));
  return flattenSubtypeOptions(staticGroups).every(
    (item) => remoteValues.has(item.value) && (!item.apiValue || item.apiValue === item.value),
  );
};

const normalizeRemoteGroups = (sourceName, variantGroups = [], staticGroupsBySource = {}) =>
  variantGroups
    .map((group) => {
      const items = (group.options || [])
        .map((option) => ({
          label: String(option?.label || option?.key || "").trim(),
          value: String(option?.key || "").trim(),
        }))
        .filter((item) => item.value);
      if (!items.length) return null;
      const transportGroup = findTransportGroup(staticGroupsBySource[sourceName] || [], items);
      return {
        key: String(group?.key || transportGroup?.key || "ranking").trim() || "ranking",
        label: String(group?.label || transportGroup?.label || "").trim(),
        ...(transportGroup?.param ? { param: transportGroup.param } : {}),
        items,
      };
    })
    .filter(Boolean);

export const projectTrendsCatalog = (catalog = {}, staticGroupsBySource = {}) => {
  const groupsBySource = new Map();
  const defaultsBySource = new Map();
  for (const source of Array.isArray(catalog?.sources) ? catalog.sources : []) {
    const sourceName = String(source?.key || "").trim();
    if (!sourceName) continue;
    const groups = normalizeRemoteGroups(sourceName, source?.variantGroups || [], staticGroupsBySource);
    if (!groups.length || !canProjectSource(staticGroupsBySource[sourceName] || [], groups)) continue;
    groupsBySource.set(sourceName, groups);
    const defaultVariant = String(source?.defaultVariant || "").trim();
    if (defaultVariant && flattenSubtypeOptions(groups).some((item) => item.value === defaultVariant)) {
      defaultsBySource.set(sourceName, defaultVariant);
    }
  }
  return { groupsBySource, defaultsBySource };
};

export const mergeProjectedSubtypeGroups = (staticGroupsBySource = {}, groupsBySource = new Map()) => {
  const merged = { ...staticGroupsBySource };
  for (const [sourceName, groups] of groupsBySource) merged[sourceName] = groups;
  return merged;
};
