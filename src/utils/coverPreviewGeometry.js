const PREVIEW_TARGETS = {
  portrait: {
    detail: { maxWidth: 96, maxHeight: 128, previewWidth: 420 },
    mediaOnly: { maxWidth: 168, maxHeight: 224 },
  },
  square: {
    detail: { maxWidth: 112, maxHeight: 112, previewWidth: 430 },
    mediaOnly: { maxWidth: 200, maxHeight: 200 },
  },
  landscape: {
    detail: { maxWidth: 148, maxHeight: 96, previewWidth: 460 },
    mediaOnly: { maxWidth: 240, maxHeight: 144 },
  },
};

export const classifyCoverPreviewRatio = (width, height) => {
  const ratio = Number(width || 0) / Number(height || 0);
  if (!Number.isFinite(ratio) || ratio <= 0) return "square";
  if (ratio < 0.8) return "portrait";
  if (ratio < 1.25) return "square";
  return "landscape";
};
export const fitCoverPreviewSize = (width, height, maxWidth, maxHeight) => {
  const sourceWidth = Number(width || 0);
  const sourceHeight = Number(height || 0);
  if (!sourceWidth || !sourceHeight || !maxWidth || !maxHeight) {
    return { width: 0, height: 0 };
  }
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);
  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
};

export const resolveCoverPreviewLayout = (width, height) => {
  const naturalWidth = Number(width || 0);
  const naturalHeight = Number(height || 0);
  if (!naturalWidth || !naturalHeight) return null;
  const kind = classifyCoverPreviewRatio(naturalWidth, naturalHeight);
  const preset = PREVIEW_TARGETS[kind];
  return {
    kind,
    naturalWidth,
    naturalHeight,
    ratio: naturalWidth / naturalHeight,
    detail: {
      ...fitCoverPreviewSize(
        naturalWidth,
        naturalHeight,
        preset.detail.maxWidth,
        preset.detail.maxHeight,
      ),
      previewWidth: preset.detail.previewWidth,
    },
    mediaOnly: fitCoverPreviewSize(
      naturalWidth,
      naturalHeight,
      preset.mediaOnly.maxWidth,
      preset.mediaOnly.maxHeight,
    ),
  };
};
