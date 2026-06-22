const PROXY_HOST_SUFFIXES = ["doubanio.com"];

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

export const getCoverDisplaySrc = (cover = "") => {
  if (!shouldProxyCover(cover)) return cover;
  return `/api/image-proxy?url=${encodeURIComponent(cover)}`;
};
