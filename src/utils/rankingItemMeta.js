import { formatCompactMetric } from "./compactMetric.js";

const LABELS = {
  "zh-CN": { author: "作者", published: "发布", hot: "热度", views: "阅读", likes: "点赞", comments: "评论", collects: "收藏" },
  "zh-TW": { author: "作者", published: "發布", hot: "熱度", views: "閱讀", likes: "讚", comments: "評論", collects: "收藏" },
  en: { author: "Author", published: "Published", hot: "Heat", views: "Views", likes: "Likes", comments: "Comments", collects: "Saves" },
  ja: { author: "投稿者", published: "公開", hot: "注目度", views: "閲覧", likes: "いいね", comments: "コメント", collects: "保存" },
  ko: { author: "작성자", published: "게시", hot: "인기도", views: "조회", likes: "좋아요", comments: "댓글", collects: "저장" },
};

const PRIMARY_METRIC_PREFIXES = [
  ["read-", "views"],
  ["like-", "likes"],
  ["collect-", "collects"],
];

const normalizeLocale = (locale = "zh-CN") => {
  const value = String(locale || "").toLowerCase();
  if (value.startsWith("zh-tw")) return "zh-TW";
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja")) return "ja";
  if (value.startsWith("ko")) return "ko";
  return "zh-CN";
};

const normalizeMetric = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

const buildMetric = (key, numeric, labels, locale, isPrimary = false) => ({
  key,
  label: labels[key],
  value: formatCompactMetric(numeric, locale),
  numeric,
  isPrimary,
});

export const getRankingPrimaryMetricKey = (variant = "") => {
  const normalized = String(variant || "").trim().toLowerCase();
  return PRIMARY_METRIC_PREFIXES.find(([prefix]) => normalized.startsWith(prefix))?.[1] || "hot";
};

export const getRankingItemTimestamp = (item = {}, updateTime = "") =>
  item?.timestamp ||
  Date.parse(item?.publishedAt || "") ||
  Date.parse(updateTime || "") ||
  Date.now();
export const formatRankingPublishedAt = (value, locale = "zh-CN") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const normalized = normalizeLocale(locale);
  const options = {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  if (date.getFullYear() !== new Date().getFullYear()) options.year = "numeric";
  try {
    return new Intl.DateTimeFormat(normalized, options).format(date);
  } catch {
    return date.toISOString();
  }
};

export const getRankingItemMeta = (item = {}, locale = "zh-CN", context = {}) => {
  const normalized = normalizeLocale(locale);
  const labels = LABELS[normalized];
  const metadataContext = [];
  const author = String(item?.author || "").trim();
  if (author) metadataContext.push({ key: "author", label: labels.author, value: author });
  const published = formatRankingPublishedAt(item?.publishedAt, normalized);
  if (published) metadataContext.push({ key: "published", label: labels.published, value: published });
  const metricOrder = ["views", "likes", "comments", "collects"];
  const promotePrimary = context?.promotePrimary !== false;
  const primaryMetricKey = promotePrimary ? getRankingPrimaryMetricKey(context?.variant) : null;
  const primaryNumeric = primaryMetricKey === null
    ? null
    : normalizeMetric(primaryMetricKey === "hot" ? item?.hot : item?.metrics?.[primaryMetricKey]);
  const fallbackNumeric = primaryMetricKey && primaryMetricKey !== "hot" ? normalizeMetric(item?.hot) : null;
  const resolvedPrimaryNumeric = primaryNumeric ?? fallbackNumeric;
  const primaryMetric = primaryMetricKey && resolvedPrimaryNumeric !== null
    ? buildMetric(primaryMetricKey, resolvedPrimaryNumeric, labels, normalized, true)
    : null;
  const metrics = promotePrimary
    ? [
        ...(primaryMetric ? [primaryMetric] : []),
        ...metricOrder
          .filter((key) => key !== primaryMetricKey)
          .flatMap((key) => {
            const numeric = normalizeMetric(item?.metrics?.[key]);
            return numeric === null ? [] : [buildMetric(key, numeric, labels, normalized)];
          }),
      ]
    : metricOrder.flatMap((key) => {
        const numeric = normalizeMetric(item?.metrics?.[key]);
        return numeric === null ? [] : [buildMetric(key, numeric, labels, normalized)];
      });

  return {
    context: metadataContext,
    primaryMetricKey,
    primaryMetric,
    metrics,
    hasMetrics: metrics.length > 0,
    hasContent: metadataContext.length > 0 || metrics.length > 0,
  };
};
