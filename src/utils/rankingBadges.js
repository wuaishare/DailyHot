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
