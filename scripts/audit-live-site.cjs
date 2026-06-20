const https = require("node:https");
const { URL } = require("node:url");

const siteUrl = (process.env.LIVE_SITE_URL || "https://hot.wuaishare.cn").replace(
  /\/+$/,
  ""
);
const verify = process.env.VERIFY || process.env.VITE_BUILD_NUMBER || "";
const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS || 20000);

const withVerify = (path) => {
  if (!verify) return `${siteUrl}${path}`;
  const url = new URL(`${siteUrl}${path}`);
  url.searchParams.set("verify", verify);
  return url.toString();
};

const request = (url, options = {}) =>
  new Promise((resolve, reject) => {
    const body = options.body ? Buffer.from(options.body) : null;
    const req = https.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "user-agent": "DailyHot live audit",
          ...(body
            ? {
                "content-type": options.contentType || "application/json",
                "content-length": body.length,
              }
            : {}),
          ...(options.headers || {}),
        },
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error(`request timed out: ${url}`)));
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });

const extract = (html, pattern) => html.match(pattern)?.[1] || "";

const checks = [];
const addCheck = (name, run) => checks.push({ name, run });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertHtml = async (path, expectations) => {
  const response = await request(withVerify(path));
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const title = extract(response.body, /<title>(.*?)<\/title>/);
  const canonical = extract(
    response.body,
    /<link\s+rel="canonical"\s+href="([^"]+)"/
  );
  const asset = extract(
    response.body,
    /<script\s+type="module"\s+crossorigin\s+src="(\/assets\/index-[^"]+\.js)"/
  );
  if (expectations.titleIncludes) {
    assert(
      title.includes(expectations.titleIncludes),
      `title mismatch: ${title}`
    );
  }
  if (expectations.canonical) {
    assert(
      canonical === `${siteUrl}${expectations.canonical}`,
      `canonical mismatch: ${canonical}`
    );
  }
  assert(asset, "missing main asset");
  return { title, canonical, asset };
};

addCheck("route SEO: ithome base canonicalizes to day", () =>
  assertHtml("/rank/ithome", {
    titleIncludes: "IT之家日榜",
    canonical: "/rank/ithome/day",
  })
);

addCheck("route SEO: ithome month has distinct title", () =>
  assertHtml("/rank/ithome/month", {
    titleIncludes: "IT之家月榜",
    canonical: "/rank/ithome/month",
  })
);

addCheck("route SEO: designarena base canonicalizes to fullstack", () =>
  assertHtml("/rank/designarena", {
    titleIncludes: "DesignArena Agentic 全栈应用模型榜",
    canonical: "/rank/designarena/fullstack",
  })
);

addCheck("route SEO: clawhub plugins are localized for OpenClaw", () =>
  assertHtml("/rank/clawhub/plugins-recommended", {
    titleIncludes: "ClawHub 推荐插件榜 - OpenClaw插件推荐与工具生态榜单",
    canonical: "/rank/clawhub/plugins-recommended",
  })
);

addCheck("localized route SEO: english ithome base canonicalizes to day", () =>
  assertHtml("/en/rank/ithome", {
    titleIncludes: "ITHome · Daily",
    canonical: "/en/rank/ithome/day",
  })
);

addCheck("sitemap canonical route set", async () => {
  const response = await request(withVerify("/sitemap.xml"));
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const xml = response.body;
  const expectations = {
    "/rank/ithome": false,
    "/rank/ithome/day": true,
    "/rank/ithome/month": true,
    "/rank/designarena": false,
    "/rank/designarena/fullstack": true,
    "/rank/clawhub": true,
  };
  for (const [path, expected] of Object.entries(expectations)) {
    const loc = `<loc>${siteUrl}${path}</loc>`;
    assert(
      xml.includes(loc) === expected,
      `${loc} expected=${expected} got=${xml.includes(loc)}`
    );
  }
  assert(
    xml.includes('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'),
    "missing sitemap xsl declaration"
  );
  const count = xml.match(/<url>/g)?.length || 0;
  assert(count >= 1500, `unexpected sitemap url count: ${count}`);
  return { urlCount: count };
});

addCheck("api: ithome subtype coverage", async () => {
  const subtypes = ["day", "week", "month", "comments", "hot", "list"];
  const results = [];
  for (const type of subtypes) {
    const url = new URL(`${siteUrl}/api/ithome`);
    url.searchParams.set("cache", "false");
    url.searchParams.set("type", type);
    const response = await request(url.toString());
    assert(response.statusCode === 200, `${type}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.code === 200, `${type}: API code ${payload.code}`);
    assert(Array.isArray(payload.data) && payload.data.length > 0, `${type}: empty data`);
    results.push(`${type}:${payload.subtitle || payload.type}:${payload.data.length}`);
  }
  return results;
});

addCheck("api: readable translation preserves model terms", async () => {
  const response = await request(`${siteUrl}/api/readable-translate`, {
    method: "POST",
    body: JSON.stringify({
      locale: "zh-CN",
      texts: [
        "Statement on the US government directive to suspend access to Fable 5",
        "Introducing Claude Opus 4.8",
      ],
    }),
  });
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const payload = JSON.parse(response.body);
  assert(payload.success, "translation API did not report success");
  const translated = (payload.data || payload.items || [])
    .map((item) => item.translated || "")
    .join("\n");
  assert(/Fable 5/.test(translated), `Fable 5 was not preserved: ${translated}`);
  assert(/Claude Opus 4\.8/.test(translated), `Claude Opus 4.8 was not preserved: ${translated}`);
  return translated.split("\n");
});

const main = async () => {
  let failed = 0;
  for (const check of checks) {
    try {
      const detail = await check.run();
      console.log(`PASS ${check.name}`);
      if (detail) console.log(`  ${JSON.stringify(detail)}`);
    } catch (error) {
      failed += 1;
      console.error(`FAIL ${check.name}`);
      console.error(`  ${error.message}`);
    }
  }
  if (failed) {
    console.error(`[audit] ${failed}/${checks.length} checks failed`);
    process.exit(1);
  }
  console.log(`[audit] ${checks.length} checks passed for ${siteUrl}`);
};

main().catch((error) => {
  console.error("[audit] failed", error);
  process.exit(1);
});
