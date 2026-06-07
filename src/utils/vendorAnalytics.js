let initialized = false;
import { CONSENT_CATEGORIES } from "@/utils/analytics";

const appendScript = (src, attrs = {}) => {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  document.head.appendChild(script);
};

const initGA4 = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || typeof window === "undefined") return;
  appendScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true,
    send_page_view: false,
  });
};

const initClarity = () => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
  if (!projectId || typeof window === "undefined") return;
  window.clarity =
    window.clarity ||
    function clarity() {
      (window.clarity.q = window.clarity.q || []).push(arguments);
    };
  appendScript(`https://www.clarity.ms/tag/${projectId}`);
};

const initBaiduTongji = () => {
  const siteId = import.meta.env.VITE_BAIDU_TONGJI_ID;
  if (!siteId || typeof window === "undefined") return;
  window._hmt = window._hmt || [];
  appendScript(`https://hm.baidu.com/hm.js?${siteId}`);
};

export const initAnalyticsVendors = () => {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  initGA4();
  initClarity();
  initBaiduTongji();
};

export const grantAnalyticsConsentToVendors = (consent) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: consent?.[CONSENT_CATEGORIES.analytics]
        ? "granted"
        : "denied",
      ad_storage: consent?.[CONSENT_CATEGORIES.adStorage]
        ? "granted"
        : "denied",
      ad_user_data: consent?.[CONSENT_CATEGORIES.adUserData]
        ? "granted"
        : "denied",
      ad_personalization: consent?.[CONSENT_CATEGORIES.adPersonalization]
        ? "granted"
        : "denied",
    });
  }
};

export const trackVendorEvent = (event, payload = {}) => {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, payload);
  }
  if (typeof window.clarity === "function") {
    window.clarity("event", event);
  }
  if (Array.isArray(window._hmt)) {
    window._hmt.push([
      "_trackEvent",
      payload.category || "dailyhot",
      event,
      payload.source || payload.href || "",
    ]);
  }
};
