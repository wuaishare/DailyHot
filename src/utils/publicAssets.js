const PUBLIC_ASSET_VERSIONS = __PUBLIC_ASSET_VERSIONS__;

export const getPublicAssetUrl = (assetPath = "") => {
  const normalizedPath = String(assetPath || "");
  if (!normalizedPath.startsWith("/")) return normalizedPath;
  const version = PUBLIC_ASSET_VERSIONS[normalizedPath];
  return version ? `${normalizedPath}?v=${version}` : normalizedPath;
};
