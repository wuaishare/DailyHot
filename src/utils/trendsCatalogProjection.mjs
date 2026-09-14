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
          ...(Number.isFinite(Number(option?.recommendedRefreshIntervalSeconds))
            ? { recommendedRefreshIntervalSeconds: Number(option.recommendedRefreshIntervalSeconds) }
            : {}),
          ...(Number.isFinite(Number(option?.refreshIntervalSeconds))
            ? { recommendedRefreshIntervalSeconds: Number(option.refreshIntervalSeconds) }
            : {}),
          ...(option?.dimensionValues && typeof option.dimensionValues === "object"
            ? { dimensionValues: { ...option.dimensionValues } }
            : {}),
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
  const variantsBySource = new Map();
  const dimensionsBySource = new Map();
  for (const source of Array.isArray(catalog?.sources) ? catalog.sources : []) {
    const sourceName = String(source?.key || "").trim();
    if (!sourceName) continue;
    const groups = normalizeRemoteGroups(sourceName, source?.variantGroups || [], staticGroupsBySource);
    if (!groups.length || !canProjectSource(staticGroupsBySource[sourceName] || [], groups)) continue;
    const options = flattenSubtypeOptions(groups);
    const selectorEnabled = source?.variantSelectorEnabled !== false && options.length > 1;
    groupsBySource.set(sourceName, selectorEnabled ? groups : []);
    variantsBySource.set(sourceName, options);
    const dimensions = (source?.variantDimensions || [])
      .map((dimension) => ({
        key: String(dimension?.key || "").trim(),
        label: String(dimension?.label || dimension?.key || "").trim(),
        items: (dimension?.options || [])
          .map((option) => ({
            label: String(option?.label || option?.key || "").trim(),
            value: String(option?.key || "").trim(),
          }))
          .filter((item) => item.value),
      }))
      .filter((dimension) => dimension.key && dimension.items.length);
    if (dimensions.length) dimensionsBySource.set(sourceName, dimensions);
    const defaultVariant = String(source?.defaultVariant || "").trim();
    if (defaultVariant && options.some((item) => item.value === defaultVariant)) {
      defaultsBySource.set(sourceName, defaultVariant);
    }
  }
  return { groupsBySource, defaultsBySource, variantsBySource, dimensionsBySource };
};

export const mergeProjectedSubtypeGroups = (staticGroupsBySource = {}, groupsBySource = new Map()) => {
  const merged = { ...staticGroupsBySource };
  for (const [sourceName, groups] of groupsBySource) merged[sourceName] = groups;
  return merged;
};
