import { resolveCoverPreviewLayout } from "@/utils/coverPreviewGeometry";

export const applyExpandableCoverGeometry = ({
  image,
  media,
  preview,
  row,
  isMixed = false,
  viewportPadding = 12,
  hoverBoost = 1.1,
  minScale = 1.35,
  maxScale = 4.5,
}) => {
  const mediaWidth = Number(media?.clientWidth || 0);
  const mediaHeight = Number(media?.clientHeight || 0);
  const naturalWidth = Number(image?.naturalWidth || image?.offsetWidth || 0);
  const naturalHeight = Number(image?.naturalHeight || image?.offsetHeight || 0);
  if (!image?.isConnected || !mediaWidth || !mediaHeight || !naturalWidth || !naturalHeight || !preview) {
    return false;
  }

  const naturalRatio = naturalWidth / naturalHeight;
  let fullWidth = mediaWidth;
  let fullHeight = fullWidth / naturalRatio;
  if (fullHeight > mediaHeight) {
    fullHeight = mediaHeight;
    fullWidth = fullHeight * naturalRatio;
  }
  const fillScale = Math.max(mediaWidth / fullWidth, mediaHeight / fullHeight, 1);
  const baseViewportWidth = isMixed ? mediaWidth : fullWidth;
  const baseViewportHeight = isMixed ? mediaHeight : fullHeight;
  const baseImageWidth = isMixed ? fullWidth * fillScale : fullWidth;
  const baseImageHeight = isMixed ? fullHeight * fillScale : fullHeight;
  const baseImageRight = isMixed ? Math.min(0, -Math.max(0, (baseImageWidth - baseViewportWidth) / 2)) : 0;
  const mediaRect = media.getBoundingClientRect?.();
  const rowRect = row?.getBoundingClientRect?.();
  const previewLayout = resolveCoverPreviewLayout(naturalWidth, naturalHeight);
  const preferredHover = previewLayout?.mediaOnly;
  const rowCenterY = rowRect ? rowRect.top + rowRect.height / 2 : 0;
  const availableWidth = mediaRect
    ? Math.max(baseViewportWidth, mediaRect.right - viewportPadding)
    : Number(preferredHover?.width || baseViewportWidth);
  const availableHeight = rowCenterY && typeof window !== "undefined"
    ? Math.max(
        baseViewportHeight,
        2 * Math.max(
          0,
          Math.min(rowCenterY - viewportPadding, window.innerHeight - rowCenterY - viewportPadding),
        ),
      )
    : Number(preferredHover?.height || baseViewportHeight);
  const preferredScale = preferredHover
    ? Math.min(preferredHover.width / fullWidth, preferredHover.height / fullHeight)
    : minScale;
  const availableScale = Math.min(availableWidth / fullWidth, availableHeight / fullHeight);
  const baselineScale = Math.max(fillScale * hoverBoost, minScale);
  const hoverScale = Math.min(Math.max(baselineScale, Math.min(preferredScale, availableScale)), maxScale);
  const hoverWidth = fullWidth * hoverScale;
  const hoverHeight = fullHeight * hoverScale;
  const centerShiftY = mediaRect && rowRect
    ? rowRect.top + rowRect.height / 2 - (mediaRect.top + mediaRect.height / 2)
    : 0;

  preview.style?.setProperty?.("--cover-base-viewport-width", `${baseViewportWidth.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-base-viewport-height", `${baseViewportHeight.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-base-image-width", `${baseImageWidth.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-base-image-height", `${baseImageHeight.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-base-image-right", `${baseImageRight.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-hover-width", `${hoverWidth.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-hover-height", `${hoverHeight.toFixed(2)}px`);
  preview.style?.setProperty?.("--cover-hover-center-y-shift", `${centerShiftY.toFixed(2)}px`);
  preview.classList?.add?.("is-cover-geometry-ready");
  return true;
};
