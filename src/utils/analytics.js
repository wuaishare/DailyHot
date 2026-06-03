const CONSENT_KEY = "dailyhot:analytics-consent";
const SESSION_KEY = "dailyhot:session-id";

export const ANALYTICS_CONSENT = {
  accepted: "accepted",
  rejected: "rejected",
};

const canUseStorage = () => typeof localStorage !== "undefined";

export const getAnalyticsConsent = () => {
  if (!canUseStorage()) return null;
  return localStorage.getItem(CONSENT_KEY);
};

export const setAnalyticsConsent = (value) => {
  if (!canUseStorage()) return;
  localStorage.setItem(CONSENT_KEY, value);
};

export const getSessionId = () => {
  if (!canUseStorage()) return "server";
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(SESSION_KEY, next);
  return next;
};

export const shouldTrackAnalytics = () =>
  getAnalyticsConsent() === ANALYTICS_CONSENT.accepted;

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
