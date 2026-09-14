import assert from "node:assert/strict";
import fs from "node:fs";

const clientPath = "src/utils/imageProxy.js";
const serverPath = "api/[...path].js";
const clientSource = fs.readFileSync(clientPath, "utf8");
const serverSource = fs.readFileSync(serverPath, "utf8");

const readSuffixes = (source, constantName) => {
  const match = source.match(
    new RegExp(`const ${constantName} = (\\[[^;]+\\]);`),
  );
  assert.ok(match, `${constantName} must remain a literal allowlist`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
};

const clientSuffixes = readSuffixes(clientSource, "PROXY_HOST_SUFFIXES");
const serverSuffixes = readSuffixes(
  serverSource,
  "IMAGE_PROXY_ALLOWED_HOST_SUFFIXES",
);

assert.deepEqual(
  clientSuffixes,
  serverSuffixes,
  "browser routing and server-side host admission must stay aligned",
);
assert.ok(
  clientSuffixes.includes("ci.xiaohongshu.com"),
  "the exact Xiaohongshu cover host must use the server-side image proxy",
);
assert.ok(
  !clientSuffixes.includes("xiaohongshu.com"),
  "do not broaden image-proxy admission to every Xiaohongshu subdomain",
);
assert.match(serverSource, /target\.protocol !== "https:"/);
assert.match(serverSource, /return `\$\{target\.origin\}\/`/);

const testableClientSource = clientSource.replace(
  "import.meta.env.PROD",
  "true",
);
const clientModule = await import(
  `data:text/javascript;base64,${Buffer.from(testableClientSource).toString("base64")}`
);
const cover = "https://ci.xiaohongshu.com/example.jpg";

assert.equal(
  clientModule.getCoverDisplaySrc(cover),
  `/api/image-proxy?url=${encodeURIComponent(cover)}`,
);
assert.equal(
  clientModule.getCoverDisplaySrc("http://ci.xiaohongshu.com/example.jpg"),
  "http://ci.xiaohongshu.com/example.jpg",
);

console.log("PASS: DailyHot image proxy client/server contract");
