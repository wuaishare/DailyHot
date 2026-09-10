import { getPublicAssetUrl } from "./publicAssets";

const RANKING_BADGE_KINDS = new Set([
  "hot",
  "new",
  "explosive",
  "boiling",
  "hot-live",
  "first-release",
  "challenge",
  "rumor",
  "discussion",
  "interpretation",
  "depth",
  "pinned",
  "live",
  "commercial",
  "category",
  "source",
]);

export const normalizeRankingBadges = (badges, limit = 4) => {
  if (!Array.isArray(badges)) return [];
  return badges
    .map((badge) => {
      if (!badge || typeof badge !== "object") return null;
      const label = String(badge.label || "").trim();
      if (!label) return null;
      const kind = RANKING_BADGE_KINDS.has(String(badge.kind || ""))
        ? String(badge.kind)
        : "source";
      const rawIconUrl = String(badge.iconUrl || "").trim();
      let iconUrl = "";
      if (rawIconUrl) {
        try {
          const parsed = new URL(rawIconUrl);
          if (["https:", "http:"].includes(parsed.protocol)) iconUrl = parsed.toString();
        } catch {
          iconUrl = "";
        }
      }
      return {
        kind,
        label,
        placement: badge.placement === "prefix" ? "prefix" : "suffix",
        iconUrl,
        animated: Boolean(badge.animated),
        prominence: badge.prominence === "strong" ? "strong" : "normal",
        sourceCode: String(badge.sourceCode || "").trim(),
      };
    })
    .filter(Boolean)
    .slice(0, Math.max(1, Math.min(8, Number(limit) || 4)));
};

const DOUYIN_BACKUP_CODES = new Set([
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "15", "16", "17", "20", "202", "203", "204", "205",
]);

const isDouyinOfficialBadgeUrl = (value = "") => {
  try {
    const parsed = new URL(String(value || ""));
    return parsed.pathname.includes("/hotspot_detail_page/")
      || parsed.pathname.includes("/ies/douyin/hot_spot/");
  } catch {
    return false;
  }
};

export const getRankingBadgeFallbackIconUrl = (badge) => {
  const sourceCode = String(badge?.sourceCode || "").trim();
  if (!sourceCode || !DOUYIN_BACKUP_CODES.has(sourceCode)) return "";
  if (!isDouyinOfficialBadgeUrl(badge?.iconUrl)) return "";
  const extension = sourceCode === "6" ? "gif" : "png";
  return getPublicAssetUrl(`/ico/ranking-badges/douyin/${sourceCode}.${extension}`);
};

export const resolveRankingBadgeIconUrl = (badge, failedUrls = {}) => {
  const primary = String(badge?.iconUrl || "").trim();
  if (primary && !failedUrls[primary]) return primary;
  const fallback = getRankingBadgeFallbackIconUrl(badge);
  return fallback && !failedUrls[fallback] ? fallback : "";
};
