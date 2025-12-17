const fs = require("node:fs");
const path = require("node:path");

const rawSiteUrl = process.env.VITE_SITE_URL || "";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const fallbackUrl = "http://localhost:5173";
const resolvedSiteUrl = siteUrl || fallbackUrl;

const routes = ["/", "/list"];
const lastmod = new Date().toISOString();

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
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
Disallow: /test
Disallow: /403
Disallow: /404
Disallow: /500
Sitemap: ${resolvedSiteUrl}/sitemap.xml
`;

const publicDir = path.resolve(process.cwd(), "public");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

if (!siteUrl) {
  console.warn(
    "[seo] VITE_SITE_URL is not set; using localhost for sitemap/robots."
  );
}
