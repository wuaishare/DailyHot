const formatterCache = new Map();

const getFormatter = (locale, maximumFractionDigits) => {
  const key = `${locale}:${maximumFractionDigits}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale || "zh-CN", {
      notation: "compact",
      maximumFractionDigits,
    }));
  }
  return formatterCache.get(key);
};

export const formatCompactMetric = (value, locale = "zh-CN") => {
  const raw = String(value ?? "").trim();
  if (!raw || !/^\d+(?:\.\d+)?$/.test(raw)) return raw;
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return raw;
  const digits = numeric >= 10_000_000 ? 0 : 1;
  try {
    return getFormatter(locale, digits).format(numeric);
  } catch {
    return raw;
  }
};
