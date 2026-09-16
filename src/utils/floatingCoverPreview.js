export const FLOATING_COVER_PREVIEW_OPEN_DELAY = 180;
export const FLOATING_COVER_PREVIEW_CLOSE_DELAY = 140;

export const resolveFloatingCoverPreviewPosition = ({
  targetRect,
  containerRect = null,
  textRects = [],
  previewWidth,
  previewHeight,
  viewportWidth,
  viewportHeight,
  preferredPlacement = null,
  padding = 12,
  gap = 10,
}) => {
  if (!targetRect || !previewWidth || !previewHeight || !viewportWidth || !viewportHeight) {
    return null;
  }
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const clampLeft = (value) => clamp(value, padding, viewportWidth - previewWidth - padding);
  const clampTop = (value) => clamp(value, padding, viewportHeight - previewHeight - padding);
  const placeRight = viewportWidth - targetRect.right >= previewWidth + gap + padding;
  const placeLeft = targetRect.left >= previewWidth + gap + padding;
  const placeBelow = Boolean(
    containerRect && viewportHeight - containerRect.bottom >= previewHeight + gap + padding,
  );
  const placeAbove = Boolean(containerRect && containerRect.top >= previewHeight + gap + padding);
  const availablePlacements = { right: placeRight, left: placeLeft, below: placeBelow, above: placeAbove };
  const placement =
    (preferredPlacement && availablePlacements[preferredPlacement] ? preferredPlacement : null) ||
    (placeRight ? "right" : placeLeft ? "left" : placeBelow ? "below" : placeAbove ? "above" : null);
  if (!placement) return null;

  let left = clampLeft(targetRect.left + 32);
  let top = clampTop(targetRect.top - 8);
  if (placement === "right") left = targetRect.right + gap;
  else if (placement === "left") left = targetRect.left - previewWidth - gap;
  else if (placement === "below") top = containerRect.bottom + gap;
  else top = containerRect.top - previewHeight - gap;
  left = clampLeft(left);
  top = clampTop(top);

  const overlapsText = textRects.some(
    (rect) =>
      left < rect.right &&
      left + previewWidth > rect.left &&
      top < rect.bottom &&
      top + previewHeight > rect.top,
  );
  if (overlapsText && (placement === "left" || placement === "right")) return null;
  return { left, top, placement };
};
