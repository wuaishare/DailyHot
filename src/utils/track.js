import { sendAnalyticsEvent } from "@/api";
import {
  getEntrySource,
  getSessionId,
  shouldTrackAnalytics,
} from "@/utils/analytics";

const buildBasePayload = () => ({
  sessionId: getSessionId(),
  referrer: typeof document !== "undefined" ? document.referrer || "" : "",
  entry: getEntrySource(),
  locale: typeof navigator !== "undefined" ? navigator.language : "",
  tz:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "",
  href: typeof location !== "undefined" ? location.href : "",
});

export const trackEvent = async (payload) => {
  if (!shouldTrackAnalytics()) return;
  try {
    await sendAnalyticsEvent({
      ...buildBasePayload(),
      ...payload,
    });
  } catch (error) {
    // Ignore analytics errors to avoid affecting UX
  }
};
