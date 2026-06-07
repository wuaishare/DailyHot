const CONSENT_KEY = "dailyhot:analytics-consent";
const SESSION_KEY = "dailyhot:session-id";
export const OPEN_CONSENT_EVENT = "dailyhot:open-consent-settings";

export const CONSENT_CATEGORIES = {
  necessary: "necessary",
  analytics: "analytics",
  adStorage: "ad_storage",
  adUserData: "ad_user_data",
  adPersonalization: "ad_personalization",
};

export const DEFAULT_CONSENT = {
  [CONSENT_CATEGORIES.necessary]: true,
  [CONSENT_CATEGORIES.analytics]: true,
  [CONSENT_CATEGORIES.adStorage]: false,
  [CONSENT_CATEGORIES.adUserData]: false,
  [CONSENT_CATEGORIES.adPersonalization]: false,
};

const canUseStorage = () => typeof localStorage !== "undefined";

export const getAnalyticsConsent = () => {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
      [CONSENT_CATEGORIES.necessary]: true,
      [CONSENT_CATEGORIES.analytics]: true,
    };
  } catch {
    return null;
  }
};

export const setAnalyticsConsent = (value) => {
  if (!canUseStorage()) return;
  const next = {
    ...DEFAULT_CONSENT,
    ...(value || {}),
    [CONSENT_CATEGORIES.necessary]: true,
    [CONSENT_CATEGORIES.analytics]: true,
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
};

export const shouldTrackAnalytics = () =>
  getAnalyticsConsent()
    ? Boolean(getAnalyticsConsent()?.[CONSENT_CATEGORIES.analytics])
    : true;

export const getSessionId = () => {
  if (!canUseStorage()) return "server";
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
};

export const getEntrySource = () => {
  if (typeof document === "undefined") return "server";
  const referrer = document.referrer || "";
  if (!referrer) return "direct";
  try {
    const ref = new URL(referrer);
    if (ref.hostname.includes("google")) return "google";
    if (ref.hostname.includes("baidu")) return "baidu";
    if (ref.hostname.includes("bing")) return "bing";
    if (ref.hostname.includes("github")) return "github";
    if (ref.hostname.includes("twitter") || ref.hostname.includes("x.com")) return "x";
    return ref.hostname;
  } catch {
    return "unknown";
  }
};
