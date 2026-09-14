import { formatCompactMetric } from "./compactMetric.js";

const LABELS = {
  "zh-CN": { author: "作者", published: "发布", views: "阅读", likes: "点赞", comments: "评论", collects: "收藏" },
  "zh-TW": { author: "作者", published: "發布", views: "閱讀", likes: "讚", comments: "評論", collects: "收藏" },
  en: { author: "Author", published: "Published", views: "Views", likes: "Likes", comments: "Comments", collects: "Saves" },
  ja: { author: "投稿者", published: "公開", views: "閲覧", likes: "いいね", comments: "コメント", collects: "保存" },
  ko: { author: "작성자", published: "게시", views: "조회", likes: "좋아요", comments: "댓글", collects: "저장" },
};

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

export const getRankingItemMeta = (item = {}, locale = "zh-CN") => {
  const normalized = normalizeLocale(locale);
  const labels = LABELS[normalized];
  const context = [];
  const author = String(item?.author || "").trim();
  if (author) context.push({ key: "author", label: labels.author, value: author });
  const published = formatRankingPublishedAt(item?.publishedAt, normalized);
  if (published) context.push({ key: "published", label: labels.published, value: published });
  const metricOrder = ["views", "likes", "comments", "collects"];
  const metrics = metricOrder.flatMap((key) => {
    const numeric = normalizeMetric(item?.metrics?.[key]);
    if (numeric === null) return [];
    return [{
      key,
      label: labels[key],
      value: formatCompactMetric(numeric, normalized),
      numeric,
    }];
  });

  return {
    context,
    metrics,
    hasMetrics: metrics.length > 0,
    hasContent: context.length > 0 || metrics.length > 0,
  };
};
