const ALLOWED_SOURCES = new Set([
  "weibo",
  "baidu",
  "douyin",
  "kuaishou",
  "toutiao",
  "qq-news",
  "sina-news",
  "thepaper",
  "netease-news",
  "zhihu",
]);

const ALLOWED_WINDOWS = new Set(["1h", "6h", "24h", "7d"]);
const DEFAULT_BASE_URL = "https://api.wpbetter.cn/trends/v1";
const REQUEST_TIMEOUT_MS = 12000;
const EDGE_FRESH_SECONDS = 20;
const EDGE_STALE_SECONDS = 60;

const queryValue = (value, fallback = "") =>
  Array.isArray(value) ? String(value[0] ?? fallback) : String(value ?? fallback);

const boundedInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(queryValue(value, String(fallback)), 10);
  return Math.max(min, Math.min(max, Number.isFinite(parsed) ? parsed : fallback));
};

const sendJson = (res, status, payload) => {
  res.status(status);
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.send(JSON.stringify(payload));
};

const handleTrendsIntelligenceProxy = async ({
  req,
  res,
  pathValue,
  fetchImpl = fetch,
}) => {
  if (!String(pathValue || "").startsWith("trends-intelligence/")) return false;

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    sendJson(res, 405, { code: 405, message: "Method not allowed" });
    return true;
  }

  const source = decodeURIComponent(String(pathValue).slice("trends-intelligence/".length));
  if (!ALLOWED_SOURCES.has(source)) {
    sendJson(res, 404, { code: 404, message: "Trend intelligence source is not available" });
    return true;
  }

  const baseUrl = String(process.env.TRENDS_INTELLIGENCE_BASE_URL || DEFAULT_BASE_URL)
    .replace(/\/$/, "");
  const licenseKey = String(process.env.TRENDS_INTELLIGENCE_LICENSE_KEY || "").trim();
  const siteUrl = String(process.env.TRENDS_INTELLIGENCE_SITE_URL || "").trim();
  if (!licenseKey || !siteUrl) {
    sendJson(res, 503, { code: 503, message: "Trend intelligence is not configured" });
    return true;
  }  const windowValue = queryValue(req.query.window, "24h");
  const window = ALLOWED_WINDOWS.has(windowValue) ? windowValue : "24h";
  const limit = boundedInt(req.query.limit, 50, 1, 100);
  const breakthroughRank = boundedInt(req.query.breakthrough_rank, 10, 1, 100);
  const target = new URL(`${baseUrl}/intelligence/${encodeURIComponent(source)}`);
  target.searchParams.set("window", window);
  target.searchParams.set("limit", String(limit));
  target.searchParams.set("breakthrough_rank", String(breakthroughRank));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(target, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${licenseKey}`,
        "X-WPBetter-Site": siteUrl,
      },
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!body || typeof body !== "object") {
      sendJson(res, 502, { code: 502, message: "Trend intelligence returned invalid JSON" });
      return true;
    }

    if (response.ok) {
      res.setHeader("cache-control", "public, max-age=0, must-revalidate");
      res.setHeader(
        "vercel-cdn-cache-control",
        `public, max-age=${EDGE_FRESH_SECONDS}, stale-while-revalidate=${EDGE_STALE_SECONDS}`,
      );
    } else {
      res.setHeader("cache-control", "no-store");
    }    const safe = response.ok
      ? { data: body.data || null, requestId: body.requestId || null }
      : {
          error: {
            code: body?.error?.code || "trends_intelligence_upstream_error",
            message: body?.error?.message || "Trend intelligence is temporarily unavailable.",
          },
          requestId: body.requestId || null,
        };
    sendJson(res, response.status, safe);
    return true;
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    sendJson(res, 502, {
      code: 502,
      message: timedOut
        ? "Trend intelligence request timed out"
        : "Trend intelligence upstream unavailable",
    });
    return true;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { handleTrendsIntelligenceProxy };
