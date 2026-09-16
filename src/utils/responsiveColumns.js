export const resolveResponsiveCardColumns = ({
  width,
  requested = 4,
  compact = false,
} = {}) => {
  const preferred = Math.max(1, Math.min(5, Math.round(Number(requested) || 4)));
  const available = Math.max(0, Number(width) || 0);
  if (!available) return preferred;
  const gap = compact ? 12 : 24;
  const minCardWidth = compact ? 276 : 290;
  const capacity = Math.max(
    1,
    Math.min(5, Math.floor((available + gap) / (minCardWidth + gap))),
  );
  return Math.min(preferred, capacity);
};
