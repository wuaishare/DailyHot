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

  const pathValue = Array.isArray(req.query.path)
    ? req.query.path.join("/")
    : req.query.path || "";
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

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: {
      Accept: "application/json",
      "Content-Type": req.headers["content-type"] || "application/json",
      Authorization: req.headers.authorization || "",
      "X-Internal-Proxy-Token": proxyToken,
    },
    body,
  });

  const contentType = response.headers.get("content-type") || "application/json";
  res.status(response.status);
  res.setHeader("content-type", contentType);
  res.send(await response.text());
}
