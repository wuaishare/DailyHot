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

const BADGE_BACKUP_FILES = {
  douyin: Object.fromEntries(
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "15", "16", "17", "20", "202", "203", "204", "205"]
      .map((code) => [code, `${code}.${code === "6" ? "gif" : "png"}`]),
  ),
  baidu: { "1": "1.png", "3": "3.png", "4": "4.png" },
  kuaishou: { "新": "new.png", "独家": "exclusive.png", "置顶": "pinned.png" },
  toutiao: {
    hot: "hot.png", new: "new.png", onSite: "onSite.png",
    recentProgress: "recentProgress.png", refuteRumors: "refuteRumors.png",
    interpretation: "interpretation.png",
  },
  zhihu: { hot: "hot.png", new: "new.png", boiling: "boiling.png" },
};

const officialBadgeProvider = (value = "") => {
  try {
    const parsed = new URL(String(value || ""));
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname;
    if (path.includes("/hotspot_detail_page/")
      || path.includes("/ies/douyin/hot_spot/")
      || host === "lf-douyin-pc-web.douyinstatic.com") return "douyin";
    if (host === "search-operate.cdn.bcebos.com") return "baidu";
    if (host === "kwimgs.com" || host.endsWith(".kwimgs.com")) return "kuaishou";
    if (host === "toutiaoimg.com" || host.endsWith(".toutiaoimg.com")
      || path.includes("/toutiao_web_pc/hotboard/")) return "toutiao";
    if (host === "zhimg.com" || host.endsWith(".zhimg.com")) return "zhihu";
  } catch {
    return "";
  }
  return "";
};

export const getRankingBadgeFallbackIconUrl = (badge) => {
  const sourceCode = String(badge?.sourceCode || "").trim();
  const provider = officialBadgeProvider(badge?.iconUrl);
  const file = provider && sourceCode ? BADGE_BACKUP_FILES[provider]?.[sourceCode] : "";
  return file ? getPublicAssetUrl(`/ico/ranking-badges/${provider}/${file}`) : "";
};

export const resolveRankingBadgeIconUrl = (badge, failedUrls = {}) => {
  const primary = String(badge?.iconUrl || "").trim();
  if (primary && !failedUrls[primary]) return primary;
  const fallback = getRankingBadgeFallbackIconUrl(badge);
  return fallback && !failedUrls[fallback] ? fallback : "";
};
