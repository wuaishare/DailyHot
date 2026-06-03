export const config = {
  runtime: "nodejs",
};

const readBody = async (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  return await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data || undefined));
    req.on("error", reject);
  });
};

export default async function handler(req, res) {
  const baseUrl = process.env.INTERNAL_API_BASE_URL;
  const proxyToken = process.env.INTERNAL_PROXY_TOKEN;

  if (!baseUrl || !proxyToken) {
    res.status(500).json({ code: 500, message: "API proxy is not configured" });
    return;
  }

  const queryPath = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
  const requestPath = new URL(req.url, "https://hot.wuaishare.cn").pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/+/, "");
  const pathValue = queryPath || requestPath;

  if (
    pathValue === "analytics" &&
    req.method === "GET" &&
    !req.headers.authorization
  ) {
    res.status(200).json({
      code: 200,
      name: "analytics",
      title: "Analytics",
      type: "dashboard",
      total: 0,
      updateTime: new Date().toISOString(),
      fromCache: false,
      data: [],
      message: "Unauthorized",
    });
    return;
  }

  const targetUrl = new URL(`${baseUrl.replace(/\/+$/, "")}/${pathValue}`);

  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return;
    if (Array.isArray(value)) {
      value.forEach((item) => targetUrl.searchParams.append(key, item));
      return;
    }
    if (typeof value === "string") {
      targetUrl.searchParams.set(key, value);
    }
  });

  const body = await readBody(req);

  let response;
  try {
    response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        Accept: "application/json",
        "Content-Type": req.headers["content-type"] || "application/json",
        Authorization: req.headers.authorization || "",
        "User-Agent": "DailyHot-Internal-Proxy/1.0",
        "X-Internal-Proxy-Token": proxyToken,
      },
      body,
    });
  } catch (error) {
    res.status(502).json({
      code: 502,
      message: "API proxy upstream unavailable",
    });
    return;
  }

  const contentType = response.headers.get("content-type") || "application/json";
  const text = await response.text();
  if (!contentType.includes("application/json")) {
    res.status(502).json({
      code: 502,
      message: "API proxy upstream returned non-JSON response",
    });
    return;
  }
  res.status(response.status);
  res.setHeader("content-type", contentType);
  res.send(text);
}
