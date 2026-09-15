export const COVER_PRESENTATION_MODES = Object.freeze({
  AUTO: "auto-contain",
  MIXED: "mixed",
  PORTRAIT: "portrait-uniform",
  LANDSCAPE: "landscape-uniform",
});

const COVER_PRESENTATION_MODE_VALUES = new Set(
  Object.values(COVER_PRESENTATION_MODES),
);

export const resolveCoverPresentationMode = (source, fallbackSource = null) => {
  const mode = String(
    source?.coverPresentationMode || fallbackSource?.coverPresentationMode || "",
  ).trim();
  return COVER_PRESENTATION_MODE_VALUES.has(mode)
    ? mode
    : COVER_PRESENTATION_MODES.AUTO;
};
