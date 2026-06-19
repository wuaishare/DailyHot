const fs = require("node:fs");
const path = require("node:path");

const rawSiteUrl = process.env.VITE_SITE_URL || "";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const fallbackUrl = "http://localhost:5173";
const resolvedSiteUrl = siteUrl || fallbackUrl;
const lastmod = new Date().toISOString();
const publicDir = path.resolve(process.cwd(), "public");

const extractLiteral = (source, constName) => {
  const marker = `const ${constName} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`unable to find constant ${constName}`);
  }

  let index = markerIndex + marker.length;
  while (index < source.length && /\s/.test(source[index])) {
    index += 1;
  }

  const opener = source[index];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : null;
  if (!closer) {
    throw new Error(`unsupported literal opener for ${constName}: ${opener}`);
  }

  let depth = 0;
  let inString = false;
  let stringQuote = "";
  let escaped = false;

  for (let cursor = index; cursor < source.length; cursor += 1) {
    const char = source[cursor];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === stringQuote) {
        inString = false;
        stringQuote = "";
      }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      inString = true;
      stringQuote = char;
      continue;
    }
    if (char === opener) {
      depth += 1;
    } else if (char === closer) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(index, cursor + 1);
      }
    }
  }

  throw new Error(`unable to extract literal for ${constName}`);
};

const parseConstant = (source, constName) =>
  Function(`"use strict"; return (${extractLiteral(source, constName)});`)();

async function main() {
  const metadataPath = path.resolve(process.cwd(), "src/config/site-metadata.mjs");
  const storePath = path.resolve(process.cwd(), "src/store/index.js");
  const subtypePath = path.resolve(process.cwd(), "src/utils/sourceSubtypes.js");
  const { SUPPORTED_LOCALES, BUILTIN_CATEGORIES } = await import(metadataPath);
  const storeSource = fs.readFileSync(storePath, "utf8");
  const subtypeSource = fs.readFileSync(subtypePath, "utf8");
  const newsSectionMatch = storeSource.match(/defaultNewsArr:\s*\[(.*?)\n\s*\],\n\s*newsArr:/s);
  const newsSection = newsSectionMatch?.[1] || "";

  const localePrefixes = SUPPORTED_LOCALES.map((item) => item.routePrefix || "");
  const categorySlugs = BUILTIN_CATEGORIES.map((item) => item.slug).filter(Boolean);
  const sourceNames = [...newsSection.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
  const sourceSubtypeGroups = parseConstant(subtypeSource, "SOURCE_SUBTYPE_GROUPS");
  const subtypeMap = new Map();
  for (const [sourceName, groups] of Object.entries(sourceSubtypeGroups)) {
    const values = (groups || []).flatMap((group) =>
      (group.items || []).map((item) => item?.value).filter(Boolean)
    );
    subtypeMap.set(sourceName, values);
  }

  const routes = new Set();
  localePrefixes.forEach((prefix) => {
    routes.add(prefix ? `${prefix}/` : "/");
    categorySlugs.forEach((slug) => {
      routes.add(`${prefix}/category/${slug}`.replace("//", "/"));
    });
    sourceNames.forEach((source) => {
      routes.add(`${prefix}/rank/${source}`.replace("//", "/"));
      (subtypeMap.get(source) || []).forEach((subtype) => {
        routes.add(`${prefix}/rank/${source}/${subtype}`.replace("//", "/"));
      });
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...routes]
  .map(
    (route) => `  <url>
    <loc>${resolvedSiteUrl}${route}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const robots = `User-agent: *
Allow: /
Disallow: /setting
Disallow: /analytics
Disallow: /test
Disallow: /403
Disallow: /404
Disallow: /500
Sitemap: ${resolvedSiteUrl}/sitemap.xml
`;

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

  if (!siteUrl) {
    console.warn(
      "[seo] VITE_SITE_URL is not set; using localhost for sitemap/robots."
    );
  }
}

main().catch((error) => {
  console.error("[seo] failed to generate sitemap/robots", error);
  process.exit(1);
});
