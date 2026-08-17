export const FEEDBACK_PROVIDERS = Object.freeze([
  "off",
  "quackback",
  "github",
  "url",
]);

const DEFAULT_PRODUCT_NAME = "DailyHot";
const DEFAULT_PRODUCT_KEY = "dailyhot";

const normalizeText = (value, fallback) => {
  const normalized = String(value || "").trim();
  return normalized || fallback;
};

const normalizeHttpUrl = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  try {
    const parsed = new URL(input);
    if (!['http:', 'https:'].includes(parsed.protocol)) return "";

    if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
      return parsed.origin;
    }

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

export const resolveFeedbackConfig = (env = {}) => {
  const requestedProvider = String(env?.VITE_FEEDBACK_PROVIDER || "off")
    .trim()
    .toLowerCase();
  const provider = FEEDBACK_PROVIDERS.includes(requestedProvider)
    ? requestedProvider
    : "off";
  const url = normalizeHttpUrl(env?.VITE_FEEDBACK_URL);
  const enabled = provider !== "off" && Boolean(url);
  const resolvedProvider = enabled ? provider : "off";

  return Object.freeze({
    provider: resolvedProvider,
    enabled,
    url: enabled ? url : "",
    portalUrl:
      enabled && resolvedProvider === "quackback"
        ? `${url}/`
        : enabled
        ? url
        : "",
    productName: normalizeText(
      env?.VITE_FEEDBACK_PRODUCT_NAME,
      DEFAULT_PRODUCT_NAME
    ),
    productKey: normalizeText(env?.VITE_FEEDBACK_PRODUCT_KEY, DEFAULT_PRODUCT_KEY),
  });
};

const runtimeEnv = import.meta.env || {};
export const feedbackConfig = resolveFeedbackConfig(runtimeEnv);
