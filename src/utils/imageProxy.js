const PROXY_HOST_SUFFIXES = [
  "doubanio.com",
  "gtimg.com",
  "hdslb.com",
  "ci.xiaohongshu.com",
  "sinaimg.cn",
];

export const COVER_REFERRER_POLICY = "no-referrer";

const SINA_IMAGE_VARIANTS = new Map([
  ["thumb180", 180],
  ["orj360", 360],
  ["small", 360],
  ["bmiddle", 440],
  ["mw690", 690],
  ["mw1024", 1024],
  ["large", Number.POSITIVE_INFINITY],
]);

const normalizeSinaCover = (cover = "", profile = "medium") => {
  if (!cover) return cover;
  try {
    const url = new URL(cover);
    const host = url.hostname.toLowerCase();
    if (!(host === "sinaimg.cn" || host.endsWith(".sinaimg.cn"))) return cover;
    const segments = url.pathname.split("/");
    const current = segments[1] || "";
    if (!SINA_IMAGE_VARIANTS.has(current)) return cover;
    if (profile === "full") {
      segments[1] = "large";
    } else {
      const target = profile === "compact" ? "orj360" : "mw690";
      const targetWidth = SINA_IMAGE_VARIANTS.get(target);
      const currentWidth = SINA_IMAGE_VARIANTS.get(current);
      if (currentWidth > targetWidth) segments[1] = target;
    }
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return cover;
  }
};

const shouldProxyCover = (cover = "") => {
  if (!import.meta.env.PROD || !cover) return false;
  try {
    const url = new URL(cover);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return PROXY_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`)
    );
  } catch {
    return false;
  }
};

const getProxiedCoverSrc = (cover = "", profile = "medium") => {
  const normalizedCover = normalizeSinaCover(cover, profile);
  if (!shouldProxyCover(normalizedCover)) return normalizedCover;
  return `/api/image-proxy?url=${encodeURIComponent(normalizedCover)}`;
};

export const getCoverDisplaySrc = (cover = "") => getProxiedCoverSrc(cover, "medium");
export const getCoverCompactSrc = (cover = "") => getProxiedCoverSrc(cover, "compact");
export const getCoverFullSrc = (cover = "") => getProxiedCoverSrc(cover, "full");
