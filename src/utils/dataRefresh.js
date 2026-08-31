export const DATA_REFRESH_EVENT = "dailyhot:data-refresh";

let refreshGeneration = 0;

export const requestDataRefresh = ({ reason = "manual", force = true } = {}) => {
  if (typeof window === "undefined") return 0;
  refreshGeneration += 1;
  window.dispatchEvent(
    new CustomEvent(DATA_REFRESH_EVENT, {
      detail: {
        generation: refreshGeneration,
        reason,
        force: Boolean(force),
        requestedAt: Date.now(),
      },
    }),
  );
  return refreshGeneration;
};

export const getRefreshGeneration = () => refreshGeneration;
