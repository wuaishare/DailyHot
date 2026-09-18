const cleanSummary = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const sourceTexts = (source) =>
  [source?.summary, source?.desc, source?.description]
    .map(cleanSummary)
    .filter(Boolean);

const summaryScore = (text) => {
  const length = Array.from(text).length;
  if (length < 24) return -1;
  const sentenceLike = /[。！？!?]/u.test(text);
  if (!sentenceLike && length < 40) return -1;
  const metadataLike =
    /(?:^| · )(?:[^·。！？!?]{0,18}领域|标签\s|热度\s)/u.test(text);
  return Math.min(length, 180) + (sentenceLike ? 20 : 0) - (metadataLike ? 24 : 0);
};

const bestNarrative = (sources) =>
  sources
    .flatMap(sourceTexts)
    .map((text) => ({ text, score: summaryScore(text) }))
    .filter((candidate) => candidate.score >= 0)
    .sort((left, right) => right.score - left.score || right.text.length - left.text.length)[0]?.text || "";

export const pickTopicSummary = ({ event, sources = [], primary, mediaSource } = {}) => {
  const eventSummary = [event?.desc, event?.summary]
    .map(cleanSummary)
    .find(Boolean);
  if (eventSummary) return eventSummary;

  const primaryText = sourceTexts(primary)[0] || "";
  const primarySourceKey = cleanSummary(primary?.sourceKey);
  const sameSourceEvidence = primarySourceKey
    ? sources.filter((source) => cleanSummary(source?.sourceKey) === primarySourceKey)
    : [];

  const richerSameSource = bestNarrative(sameSourceEvidence);
  if (
    richerSameSource &&
    (!primaryText || Array.from(richerSameSource).length >= Array.from(primaryText).length + 12)
  ) {
    return richerSameSource;
  }

  return [
    primaryText,
    ...sourceTexts(mediaSource),
    ...sources.flatMap(sourceTexts),
  ].find(Boolean) || "";
};
