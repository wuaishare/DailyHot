import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { handleTrendsIntelligenceProxy } = require("../api/_trends-intelligence.js");

const makeResponse = () => {
  const headers = new Map();
  return {
    statusCode: 200,
    body: "",
    headers,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), String(value));
    },
    send(value) {
      this.body = String(value ?? "");
    },
  };
};

const originalEnv = {
  base: process.env.TRENDS_INTELLIGENCE_BASE_URL,
  license: process.env.TRENDS_INTELLIGENCE_LICENSE_KEY,
  site: process.env.TRENDS_INTELLIGENCE_SITE_URL,
};

try {
  process.env.TRENDS_INTELLIGENCE_BASE_URL = "https://trends.internal.example/v1";
  process.env.TRENDS_INTELLIGENCE_LICENSE_KEY = "test-server-only-secret";
  process.env.TRENDS_INTELLIGENCE_SITE_URL = "https://hot.example";

  let captured;
  const fetchImpl = async (url, options) => {
    captured = { url: String(url), options };
    return new Response(JSON.stringify({
      data: {
        schema: "trend-intelligence-v1",
        algorithm: "deterministic-ranking-signals-v2",
      },
      requestId: "req-audit-1",
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  const res = makeResponse();
  const handled = await handleTrendsIntelligenceProxy({
    req: {
      method: "GET",
      query: { window: "invalid", limit: "999", breakthrough_rank: "-3" },
    },
    res,
    pathValue: "trends-intelligence/weibo",
    fetchImpl,
  });

  assert.equal(handled, true);
  assert.equal(res.statusCode, 200);
  const target = new URL(captured.url);
  assert.equal(target.pathname, "/v1/intelligence/weibo");
  assert.equal(target.searchParams.get("window"), "24h");
  assert.equal(target.searchParams.get("limit"), "100");
  assert.equal(target.searchParams.get("breakthrough_rank"), "1");
  assert.equal(captured.options.headers.Authorization, ["Bearer", "test-server-only-secret"].join(" "));
  assert.equal(captured.options.headers["X-WPBetter-Site"], "https://hot.example");
  assert.doesNotMatch(res.body, /test-server-only-secret|hot\.example/);
  assert.match(res.headers.get("vercel-cdn-cache-control") || "", /max-age=20/);

  const invalidRes = makeResponse();
  let invalidFetchCalled = false;
  await handleTrendsIntelligenceProxy({
    req: { method: "GET", query: {} },
    res: invalidRes,
    pathValue: "trends-intelligence/not-allowed",
    fetchImpl: async () => {
      invalidFetchCalled = true;
      throw new Error("must not fetch");
    },
  });
  assert.equal(invalidRes.statusCode, 404);
  assert.equal(invalidFetchCalled, false);  delete process.env.TRENDS_INTELLIGENCE_LICENSE_KEY;
  const missingRes = makeResponse();
  await handleTrendsIntelligenceProxy({
    req: { method: "GET", query: {} },
    res: missingRes,
    pathValue: "trends-intelligence/weibo",
    fetchImpl,
  });
  assert.equal(missingRes.statusCode, 503);

  console.log("PASS: DailyHot Trends Intelligence server-only proxy contract");
} finally {
  const restore = (key, value) => {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  };
  restore("TRENDS_INTELLIGENCE_BASE_URL", originalEnv.base);
  restore("TRENDS_INTELLIGENCE_LICENSE_KEY", originalEnv.license);
  restore("TRENDS_INTELLIGENCE_SITE_URL", originalEnv.site);
}
