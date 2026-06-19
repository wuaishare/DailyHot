const https = require("node:https");

const DEFAULT_SITE_URL = "https://hot.wuaishare.cn";
const INDEXNOW_KEY = "45f2e0a6f5a34b8290c80c5e9d0f94ad";
const INDEXNOW_ENDPOINT =
  process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const rawSiteUrl = process.env.VITE_SITE_URL || DEFAULT_SITE_URL;
const siteUrl = rawSiteUrl.replace(/\/+$/, "");
const sitemapUrl = process.env.SITEMAP_URL || `${siteUrl}/sitemap.xml`;
const maxUrls = Number.parseInt(process.env.INDEXNOW_LIMIT || "10000", 10);
const dryRun = process.argv.includes("--dry-run");

const request = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });

    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });

const decodeXml = (value = "") =>
  String(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

const extractUrls = (sitemapXml) =>
  [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);

const sameHostUrls = (urls, host) =>
  urls.filter((url) => {
    try {
      return new URL(url).host === host;
    } catch {
      return false;
    }
  });

async function main() {
  const site = new URL(siteUrl);
  const keyLocation = `${siteUrl}/${INDEXNOW_KEY}.txt`;
  const sitemapResponse = await request(sitemapUrl, { method: "GET" });
  if (sitemapResponse.statusCode !== 200) {
    throw new Error(
      `failed to fetch sitemap: ${sitemapResponse.statusCode} ${sitemapUrl}`
    );
  }

  const urls = sameHostUrls(extractUrls(sitemapResponse.body), site.host).slice(
    0,
    maxUrls
  );
  if (!urls.length) {
    throw new Error(`no same-host URLs found in ${sitemapUrl}`);
  }

  const payload = JSON.stringify({
    host: site.host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: urls,
  });

  if (dryRun) {
    console.log(
      `[indexnow] dry run: ${urls.length} URLs from ${sitemapUrl}; key ${keyLocation}`
    );
    return;
  }

  const response = await request(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Length": Buffer.byteLength(payload),
    },
    body: payload,
  });

  if (![200, 202].includes(response.statusCode)) {
    throw new Error(
      `IndexNow submission failed: ${response.statusCode} ${response.body}`
    );
  }

  console.log(
    `[indexnow] submitted ${urls.length} URLs to ${INDEXNOW_ENDPOINT}; status ${response.statusCode}`
  );
}

main().catch((error) => {
  console.error("[indexnow] failed", error);
  process.exit(1);
});
