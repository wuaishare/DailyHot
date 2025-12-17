const DEFAULT_SEO = {
  title: "今日热榜 - 全网热点聚合与多平台热榜实时更新",
  description:
    "今日热榜聚合微博、知乎、抖音、B站、头条等多平台热榜，一站式浏览全网热点。支持榜单筛选与排序、自动刷新和简洁高效的阅读体验。",
  keywords:
    "今日热榜,全网热点,热榜聚合,微博热搜,知乎热榜,抖音热榜,B站热榜,头条热榜,实时热点,榜单排行",
  ogImage: "/ico/favicon.png",
  siteName: "今日热榜",
  locale: "zh_CN",
};

const normalizeSiteUrl = (url) => {
  if (!url) return "";
  return url.replace(/\/+$/, "");
};

const getSiteUrl = () => {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (envUrl) return normalizeSiteUrl(envUrl);
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

const ensureMetaTag = (attr, name) => {
  const selector = `meta[${attr}="${name}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  return tag;
};

const setMetaTag = (attr, name, content) => {
  if (!content) return;
  const tag = ensureMetaTag(attr, name);
  tag.setAttribute("content", content);
};

const setLinkTag = (rel, href) => {
  if (!href) return;
  const selector = `link[rel="${rel}"]`;
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

const setJsonLd = (id, data) => {
  const selector = `script#${id}`;
  const existing = document.head.querySelector(selector);
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const script = existing || document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  if (!existing) document.head.appendChild(script);
};

const buildAbsoluteUrl = (path, siteUrl) => {
  if (!path) return "";
  if (!siteUrl) return path;
  try {
    return new URL(path, siteUrl).toString();
  } catch (error) {
    return path;
  }
};

export const applySeoMeta = (route) => {
  if (typeof document === "undefined") return;
  const meta = route?.meta || {};
  const siteUrl = getSiteUrl();
  const canonical = meta.canonical
    ? buildAbsoluteUrl(meta.canonical, siteUrl)
    : buildAbsoluteUrl(route?.fullPath || route?.path || "/", siteUrl);

  const title = meta.seoTitle || meta.title || DEFAULT_SEO.title;
  const description = meta.description || DEFAULT_SEO.description;
  const keywords = meta.keywords || DEFAULT_SEO.keywords;
  const robots = meta.robots || "index,follow";
  const ogType = meta.ogType || "website";
  const ogImage = buildAbsoluteUrl(meta.ogImage || DEFAULT_SEO.ogImage, siteUrl);

  document.title = title;
  setMetaTag("name", "description", description);
  setMetaTag("name", "keywords", keywords);
  setMetaTag("name", "robots", robots);

  setMetaTag("property", "og:type", ogType);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:url", canonical);
  setMetaTag("property", "og:image", ogImage);
  setMetaTag("property", "og:site_name", DEFAULT_SEO.siteName);
  setMetaTag("property", "og:locale", DEFAULT_SEO.locale);

  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);

  setLinkTag("canonical", canonical);

  const jsonLd =
    typeof meta.jsonLd === "function"
      ? meta.jsonLd({ siteUrl, canonical, title, description })
      : meta.jsonLd;
  setJsonLd("page-schema", jsonLd);
};
