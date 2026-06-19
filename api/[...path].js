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

const GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE = {
  "zh-CN": "zh-CN",
  en: "en",
  "zh-TW": "zh-TW",
  ja: "ja",
  ko: "ko",
};
const PROTECTED_TERM_PATTERN =
  /\b(?:GPT(?:-\d+(?:\.\d+)*)?|ChatGPT|Claude|Sonnet|Opus|Haiku|Fable|Mythos|Gemini|Gemma|DiffusionGemma|GLM|Llama|Grok|Qwen|DeepSeek|Mistral|Mixtral|Kimi|ERNIE|Hunyuan|Doubao|Yi|Phi|Command|Aya|Cohere|Anthropic|OpenAI|DeepMind|Hugging Face|OpenRouter|xAI|DALL[·-]E|Sora|Codex|Copilot|JDK)(?:\s+\d+(?:\.\d+)*)?|\b(?:AI|AGI|API|MCP|LLM)\b/g;
const READABLE_TRANSLATE_TIMEOUT_MS = 6000;
const READABLE_TRANSLATE_CONCURRENCY = 4;
const READABLE_TRANSLATE_MAX_TEXTS = 50;
const READABLE_TRANSLATE_MAX_CHARS = 500;

const normalizeReadableLocale = (locale = "") => {
  const value = String(locale || "").toLowerCase();
  if (value === "zh-tw" || value === "zh_tw" || value === "zh-hant") return "zh-TW";
  if (
    value === "zh-cn" ||
    value === "zh_cn" ||
    value === "zh-hans" ||
    value === "zh" ||
    value.startsWith("zh-cn")
  ) {
    return "zh-CN";
  }
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja") || value.startsWith("jp")) return "ja";
  if (value.startsWith("ko") || value.startsWith("kr")) return "ko";
  return "";
};

const parseGoogleTranslateResponse = (payload) => {
  const segments = Array.isArray(payload?.[0]) ? payload[0] : [];
  return segments
    .map((segment) => String(segment?.[0] || ""))
    .join("")
    .trim();
};

const protectTranslationTerms = (text = "") => {
  const terms = [];
  const protectedText = String(text || "").replace(PROTECTED_TERM_PATTERN, (term) => {
    const token = `DHTERM${terms.length}X`;
    terms.push([token, term]);
    return token;
  });
  const restore = (value = "") =>
    terms.reduce(
      (nextValue, [token, term]) => nextValue.replaceAll(token, term),
      String(value || "")
    );
  return { protectedText, restore };
};

const translateReadableText = async (text, locale) => {
  const targetLanguage = GOOGLE_TRANSLATE_LANGUAGE_BY_LOCALE[locale];
  if (!targetLanguage || !text) return "";
  const { protectedText, restore } = protectTranslationTerms(text);

  const controller =
    typeof AbortController === "undefined" ? null : new AbortController();
  const timeout = controller
    ? setTimeout(() => controller.abort(), READABLE_TRANSLATE_TIMEOUT_MS)
    : null;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", protectedText);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      signal: controller?.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "DailyHot-Readable-Translate/1.0",
      },
    });
    if (!response.ok) return "";
    return restore(parseGoogleTranslateResponse(await response.json()));
  } catch {
    return "";
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const translateReadableTexts = async (texts = [], locale) => {
  const data = texts.map((text, id) => ({
    id,
    original: text,
    translated: text,
  }));
  let cursor = 0;

  const runWorker = async () => {
    while (cursor < data.length) {
      const index = cursor;
      cursor += 1;
      const item = data[index];
      const translated = await translateReadableText(item.original, locale);
      if (translated) {
        item.translated = translated;
      }
    }
  };

  const workerCount = Math.min(READABLE_TRANSLATE_CONCURRENCY, data.length);
  await Promise.all(Array.from({ length: workerCount }, runWorker));
  return data;
};

const handleReadableTranslate = async (body, res) => {
  let payload;
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    res.status(400).json({ code: 400, message: "Invalid JSON body" });
    return true;
  }

  const locale = normalizeReadableLocale(payload.locale);
  const texts = Array.isArray(payload.texts)
    ? payload.texts
        .slice(0, READABLE_TRANSLATE_MAX_TEXTS)
        .map((text) => String(text || "").trim().slice(0, READABLE_TRANSLATE_MAX_CHARS))
        .filter(Boolean)
    : [];

  if (!locale || !texts.length) {
    res.status(200).json({
      code: 200,
      name: "readable-translate",
      title: "Readable Translate",
      type: "translation",
      total: texts.length,
      locale: locale || payload.locale || "",
      success: false,
      data: texts.map((text, id) => ({ id, original: text, translated: text })),
      fromCache: false,
      updateTime: new Date().toISOString(),
    });
    return true;
  }

  const data = await translateReadableTexts(texts, locale);
  res.status(200).json({
    code: 200,
    name: "readable-translate",
    title: "Readable Translate",
    type: "translation",
    total: data.length,
    locale,
    success: data.some((item) => item.translated && item.translated !== item.original),
    data,
    fromCache: false,
    updateTime: new Date().toISOString(),
  });
  return true;
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

  if (pathValue === "readable-translate" && req.method === "POST") {
    const handled = await handleReadableTranslate(body, res);
    if (handled) return;
  }

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
