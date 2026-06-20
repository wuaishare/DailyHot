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

const request = (url, options = {}, redirectCount = 0) =>
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
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location &&
            redirectCount < 5
          ) {
            resolve(
              request(
                new URL(res.headers.location, url).toString(),
                options,
                redirectCount + 1
              )
            );
            return;
          }
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

const requestWithRetry = async (url, options = {}, attempts = 2) => {
  let lastResponse;
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await request(url, options);
      lastResponse = response;
      if (response.statusCode < 500 && response.statusCode !== 429) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }
    if (index < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  if (lastResponse) return lastResponse;
  throw lastError;
};

const extract = (html, pattern) => html.match(pattern)?.[1] || "";

const checks = [];
const addCheck = (name, run) => checks.push({ name, run });

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const hasHan = (value = "") => /[\u3400-\u9fff]/.test(String(value || ""));
const hasKana = (value = "") => /[\u3040-\u30ff]/.test(String(value || ""));
const hasHangul = (value = "") => /[\uac00-\ud7af]/.test(String(value || ""));

const assertLocaleText = (value, locale, context) => {
  const text = String(value || "");
  if (locale === "ko") {
    assert(hasHangul(text), `${context}: expected Hangul text, got ${text}`);
    assert(!hasHan(text), `${context}: leaked Han text in Korean label: ${text}`);
    return;
  }
  if (locale === "ja") {
    assert(hasKana(text), `${context}: expected Kana text, got ${text}`);
    return;
  }
  if (locale === "en") {
    assert(
      !hasHan(text) && !hasKana(text) && !hasHangul(text),
      `${context}: leaked CJK text in English label: ${text}`
    );
  }
};

const assertHtml = async (path, expectations) => {
  const response = await requestWithRetry(withVerify(path));
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const title = extract(response.body, /<title>(.*?)<\/title>/);
  const canonical = extract(
    response.body,
    /<link\s+rel="canonical"\s+href="([^"]+)"/
  );
  const description = extract(
    response.body,
    /<meta\s+name="description"\s+content="([^"]+)"/
  );
  const htmlLang = extract(response.body, /<html\s+lang="([^"]+)"/);
  const alternateCount =
    response.body.match(/<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+"\s*\/?>/g)
      ?.length || 0;
  const hasRouteJsonLd = response.body.includes('id="dailyhot-route-jsonld"');
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
  if (expectations.titleExcludes) {
    const blocked = Array.isArray(expectations.titleExcludes)
      ? expectations.titleExcludes
      : [expectations.titleExcludes];
    blocked.forEach((item) =>
      assert(!title.includes(item), `title unexpectedly contains ${item}: ${title}`)
    );
  }
  if (expectations.descriptionIncludes) {
    const required = Array.isArray(expectations.descriptionIncludes)
      ? expectations.descriptionIncludes
      : [expectations.descriptionIncludes];
    required.forEach((item) =>
      assert(
        description.includes(item),
        `description missing ${item}: ${description}`
      )
    );
  }
  if (expectations.canonical) {
    assert(
      canonical === `${siteUrl}${expectations.canonical}`,
      `canonical mismatch: ${canonical}`
    );
  }
  if (expectations.htmlLang) {
    assert(htmlLang === expectations.htmlLang, `html lang mismatch: ${htmlLang}`);
  }
  if (expectations.alternateCount) {
    assert(
      alternateCount === expectations.alternateCount,
      `alternate count mismatch: ${alternateCount}`
    );
  }
  if (expectations.jsonLd) {
    assert(hasRouteJsonLd, "missing route JSON-LD");
  }
  assert(asset, "missing main asset");
  return { title, canonical, description, htmlLang, alternateCount, hasRouteJsonLd, asset };
};

addCheck("localized home SEO shells include hreflang and JSON-LD", async () => {
  const cases = [
    ["/", "zh-CN", "吾爱热榜", "/"],
    ["/en/", "en", "DailyHot - Cross-platform", "/en/"],
    ["/zh-tw/", "zh-TW", "吾愛熱榜", "/zh-tw/"],
    ["/ja/", "ja", "DailyHot - 複数", "/ja/"],
    ["/ko/", "ko", "DailyHot - 여러", "/ko/"],
  ];
  const results = [];
  for (const [path, htmlLang, titleIncludes, canonical] of cases) {
    const result = await assertHtml(path, {
      titleIncludes,
      canonical,
      htmlLang,
      alternateCount: 6,
      jsonLd: true,
    });
    results.push(`${path}:${result.htmlLang}:${result.alternateCount}`);
  }
  return results;
});

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

addCheck("route SEO: bilibili base canonicalizes to popular all", () =>
  assertHtml("/rank/bilibili", {
    titleIncludes: "哔哩哔哩综合热门",
    canonical: "/rank/bilibili/all",
    descriptionIncludes: "全站热视频",
  })
);

addCheck("route SEO: toutiao title remains concise", () =>
  assertHtml("/rank/toutiao", {
    titleIncludes: "今日头条热榜 - 时事热点",
    titleExcludes: ["今日头条热榜 热榜", "今日头条热榜 - 热榜"],
    canonical: "/rank/toutiao",
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

addCheck("category SEO: zh-CN AI uses platform-rich description", () =>
  assertHtml("/category/ai", {
    titleIncludes: "AI 热榜",
    canonical: "/category/ai",
    descriptionIncludes: ["OpenRouter", "Artificial Analysis", "Product Hunt"],
  })
);

addCheck("category SEO: en AI uses platform-rich description", () =>
  assertHtml("/en/category/ai", {
    titleIncludes: "AI Hot Rankings - AI model leaderboards",
    canonical: "/en/category/ai",
    descriptionIncludes: ["OpenRouter", "Artificial Analysis", "Hacker News"],
  })
);

addCheck("category SEO: zh-TW AI uses platform-rich description", () =>
  assertHtml("/zh-tw/category/ai", {
    titleIncludes: "AI熱榜 - AI模型排行榜",
    canonical: "/zh-tw/category/ai",
    descriptionIncludes: ["OpenRouter", "Artificial Analysis", "Hacker News"],
  })
);

addCheck("category SEO: ja AI uses platform-rich description", () =>
  assertHtml("/ja/category/ai", {
    titleIncludes: "AIランキング - AIモデル評価",
    canonical: "/ja/category/ai",
    descriptionIncludes: ["OpenRouter", "Artificial Analysis", "Hacker News"],
  })
);

addCheck("category SEO: ko AI uses platform-rich description", () =>
  assertHtml("/ko/category/ai", {
    titleIncludes: "AI 랭킹 - AI 모델 순위",
    canonical: "/ko/category/ai",
    descriptionIncludes: ["OpenRouter", "Artificial Analysis", "Hacker News"],
  })
);

addCheck("route SEO: openrouter model rankings are localized", () =>
  assertHtml("/rank/openrouter-rankings/models-week", {
    titleIncludes: "OpenRouter 模型周榜",
    canonical: "/rank/openrouter-rankings/models-week",
    descriptionIncludes: "模型使用热度与调用趋势榜",
  })
);

addCheck("route SEO: designarena daily usage is concise", () =>
  assertHtml("/rank/designarena/daily-usage", {
    titleIncludes: "DesignArena 日活使用榜",
    canonical: "/rank/designarena/daily-usage",
    descriptionIncludes: "模型生成应用日活用户",
  })
);

addCheck("route SEO: clawhub skill installs mention OpenClaw", () =>
  assertHtml("/rank/clawhub/skills-installs", {
    titleIncludes: "ClawHub 安装最多技能榜",
    canonical: "/rank/clawhub/skills-installs",
    descriptionIncludes: "OpenClaw技能安装量",
  })
);

addCheck("sitemap canonical route set", async () => {
  const response = await requestWithRetry(withVerify("/sitemap.xml"));
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const xml = response.body;
  assert(
    xml.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'),
    "missing sitemap xhtml namespace"
  );
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
  const routeExpectations = [
    ["/", "hourly", "1.0"],
    ["/en/", "hourly", "1.0"],
    ["/category/ai", "hourly", "0.9"],
    ["/en/category/ai", "hourly", "0.9"],
    ["/rank/bilibili/all", "hourly", "0.6"],
    ["/ko/rank/clawhub/plugins-recommended", "hourly", "0.6"],
  ];
  const routeDetails = routeExpectations.map(([path, changefreq, priority]) => {
    const loc = `<loc>${siteUrl}${path}</loc>`;
    const index = xml.indexOf(loc);
    assert(index >= 0, `missing sitemap loc ${loc}`);
    const urlEnd = xml.indexOf("</url>", index);
    const block = xml.slice(index, urlEnd);
    const alternateCount = block.match(/<xhtml:link\s+/g)?.length || 0;
    assert(alternateCount === 6, `${path}: alternate count ${alternateCount}`);
    assert(
      block.includes(`<changefreq>${changefreq}</changefreq>`),
      `${path}: missing changefreq ${changefreq}`
    );
    assert(
      block.includes(`<priority>${priority}</priority>`),
      `${path}: missing priority ${priority}`
    );
    return `${path}:${alternateCount}:${changefreq}:${priority}`;
  });
  return { urlCount: count, routeDetails };
});

addCheck("indexnow key file is reachable", async () => {
  const key = "45f2e0a6f5a34b8290c80c5e9d0f94ad";
  const response = await requestWithRetry(withVerify(`/${key}.txt`));
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  assert(response.body.trim() === key, `unexpected key body: ${response.body}`);
  return { key };
});

addCheck("api: ithome subtype coverage", async () => {
  const subtypes = ["day", "week", "month", "comments", "hot", "list"];
  const results = [];
  for (const type of subtypes) {
    const url = new URL(`${siteUrl}/api/ithome`);
    url.searchParams.set("cache", "false");
    url.searchParams.set("type", type);
    const response = await requestWithRetry(url.toString(), {}, 3);
    assert(response.statusCode === 200, `${type}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.code === 200, `${type}: API code ${payload.code}`);
    assert(Array.isArray(payload.data) && payload.data.length > 0, `${type}: empty data`);
    results.push(`${type}:${payload.subtitle || payload.type}:${payload.data.length}`);
  }
  return results;
});

addCheck("api: bilibili popular coverage", async () => {
  const subtypes = {
    all: "综合热门",
    weekly: "每周必看",
    history: "入站必刷",
    rank: "排行榜",
    music: "全站音乐榜",
  };
  const results = [];
  for (const [type, expectedLabel] of Object.entries(subtypes)) {
    const url = new URL(`${siteUrl}/api/bilibili`);
    url.searchParams.set("cache", "false");
    url.searchParams.set("type", type);
    const response = await requestWithRetry(url.toString(), {}, 3);
    assert(response.statusCode === 200, `${type}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.code === 200, `${type}: API code ${payload.code}`);
    assert(Array.isArray(payload.data) && payload.data.length > 0, `${type}: empty data`);
    const actualLabel = payload.subtitle || payload.type || "";
    assert(
      actualLabel === expectedLabel,
      `${type}: subtype mismatch, expected ${expectedLabel}, got ${actualLabel}`
    );
    results.push(`${type}:${actualLabel}:${payload.data.length}`);
  }
  return results;
});

addCheck("api: AI ranking endpoints are available", async () => {
  const cases = [
    ["openrouter-rankings", "models-week"],
    ["openrouter-rankings", "apps-day"],
    ["designarena", "fullstack"],
    ["designarena", "daily-usage"],
    ["clawhub", "skills-installs"],
    ["clawhub", "plugins-recommended"],
  ];
  const results = [];
  for (const [source, type] of cases) {
    const url = new URL(`${siteUrl}/api/${source}`);
    url.searchParams.set("cache", "false");
    url.searchParams.set("type", type);
    const response = await requestWithRetry(url.toString(), {}, 3);
    assert(response.statusCode === 200, `${source}/${type}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.code === 200, `${source}/${type}: API code ${payload.code}`);
    assert(
      Array.isArray(payload.data) && payload.data.length > 0,
      `${source}/${type}: empty data`
    );
    results.push(`${source}/${type}:${payload.subtitle || payload.type}:${payload.data.length}`);
  }
  return results;
});

addCheck("api: localized AI ranking labels are language-specific", async () => {
  const cases = [
    ["designarena", "fullstack", "ko", ["type", "description"]],
    ["designarena", "fullstack", "ja", ["type", "description"]],
    ["clawhub", "plugins-recommended", "ko", ["type", "subtitle", "description"]],
    ["clawhub", "skills-installs", "ja", ["type", "subtitle", "description"]],
    ["clawhub", "plugins-recommended", "en", ["type", "subtitle", "description"]],
  ];
  const results = [];
  for (const [source, type, locale, fields] of cases) {
    const url = new URL(`${siteUrl}/api/${source}`);
    url.searchParams.set("cache", "false");
    url.searchParams.set("type", type);
    url.searchParams.set("locale", locale);
    const response = await requestWithRetry(url.toString(), {}, 3);
    assert(response.statusCode === 200, `${source}/${type}/${locale}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.code === 200, `${source}/${type}/${locale}: API code ${payload.code}`);
    assert(
      Array.isArray(payload.data) && payload.data.length > 0,
      `${source}/${type}/${locale}: empty data`
    );
    fields.forEach((field) =>
      assertLocaleText(payload[field], locale, `${source}/${type}/${locale}.${field}`)
    );
    results.push(`${source}/${type}/${locale}:${payload.subtitle || payload.type}`);
  }
  return results;
});

addCheck("api: readable translation preserves model terms", async () => {
  const locales = ["zh-CN", "zh-TW", "ja", "ko"];
  const results = [];
  for (const locale of locales) {
    const response = await requestWithRetry(
      `${siteUrl}/api/readable-translate`,
      {
        method: "POST",
        body: JSON.stringify({
          locale,
          texts: [
            "Statement on the US government directive to suspend access to Fable 5",
            "Introducing Claude Opus 4.8",
          ],
        }),
      },
      3
    );
    assert(response.statusCode === 200, `${locale}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.success, `${locale}: translation API did not report success`);
    const translated = (payload.data || payload.items || [])
      .map((item) => item.translated || "")
      .join("\n");
    assert(/Fable 5/.test(translated), `${locale}: Fable 5 was not preserved: ${translated}`);
    assert(
      /Claude Opus 4\.8/.test(translated),
      `${locale}: Claude Opus 4.8 was not preserved: ${translated}`
    );
    results.push(`${locale}:${translated.replace(/\n/g, " | ")}`);
  }
  return results;
});

addCheck("api: readable translation localizes zh-CN news titles", async () => {
  const response = await requestWithRetry(
    `${siteUrl}/api/readable-translate`,
    {
      method: "POST",
      body: JSON.stringify({
        locale: "zh-CN",
        texts: [
          "New usage analytics and updated spend controls for enterprises",
          "Hyundai buys Boston Dynamics",
          "Securing the future of AI agents",
        ],
      }),
    },
    3
  );
  assert(response.statusCode === 200, `HTTP ${response.statusCode}`);
  const payload = JSON.parse(response.body);
  assert(payload.success, "translation API did not report success");
  const translatedItems = payload.data || payload.items || [];
  const translated = translatedItems.map((item) => item.translated || "");
  assert(translated.length === 3, `unexpected translated item count: ${translated.length}`);
  translated.forEach((value, index) => {
    assert(/[\u3400-\u9fff]/.test(value), `item ${index} has no zh-CN text: ${value}`);
    assert(
      value !== translatedItems[index]?.original,
      `item ${index} was not translated: ${value}`
    );
  });
  return translated;
});

addCheck("api: readable translation localizes zh-CN titles to target languages", async () => {
  const sourceTexts = [
    "日本签证7月1日起涨价5倍",
    "如何评价GLM-5.2？",
    "中国在为台岛以东海域国土规划做准备",
  ];
  const locales = ["zh-TW", "en", "ja", "ko"];
  const results = [];
  for (const locale of locales) {
    const response = await requestWithRetry(
      `${siteUrl}/api/readable-translate`,
      {
        method: "POST",
        body: JSON.stringify({
          locale,
          texts: sourceTexts,
        }),
      },
      3
    );
    assert(response.statusCode === 200, `${locale}: HTTP ${response.statusCode}`);
    const payload = JSON.parse(response.body);
    assert(payload.success, `${locale}: translation API did not report success`);
    const translatedItems = payload.data || payload.items || [];
    assert(
      translatedItems.length === sourceTexts.length,
      `${locale}: unexpected translated item count: ${translatedItems.length}`
    );
    const translated = translatedItems.map((item) => item.translated || "");
    translated.forEach((value, index) => {
      assert(value && value !== sourceTexts[index], `${locale}: item ${index} was not translated`);
    });
    assert(
      /GLM-5\.2/.test(translated.join("\n")),
      `${locale}: GLM-5.2 model term was not preserved: ${translated.join(" | ")}`
    );
    if (locale === "zh-TW") {
      const joined = translated.join("\n");
      assert(/中國|評價|規劃|準備/.test(joined), `zh-TW: missing traditional text: ${joined}`);
      assert(!/中国|评价|规划|准备/.test(joined), `zh-TW: leaked simplified text: ${joined}`);
    } else {
      translated.forEach((value, index) =>
        assertLocaleText(value, locale, `zh-CN-to-${locale}.item${index}`)
      );
    }
    results.push(`${locale}:${translated.join(" | ")}`);
  }
  return results;
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
