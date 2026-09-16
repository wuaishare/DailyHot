import assert from "node:assert/strict";
import fs from "node:fs";
import { resolveProxiedImageContentType } from "../api/_image-content-type.js";

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

assert.ok(
  clientSuffixes.every((suffix) => serverSuffixes.includes(suffix)),
  "every browser-proxied host must remain admitted by the server proxy",
);
assert.ok(
  clientSuffixes.includes("ci.xiaohongshu.com"),
  "the exact Xiaohongshu cover host must use the server-side image proxy",
);
assert.ok(serverSuffixes.includes("thepaper.cn"), "keep The Paper server admission for older cached clients");
assert.ok(serverSuffixes.includes("geekpark.net"), "keep GeekPark server admission for older cached clients");
assert.ok(!clientSuffixes.includes("thepaper.cn"), "The Paper covers must load directly with no-referrer");
assert.ok(!clientSuffixes.includes("geekpark.net"), "GeekPark covers must load directly with no-referrer");
assert.match(clientSource, /export const COVER_REFERRER_POLICY = "no-referrer"/);
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

assert.equal(
  clientModule.getCoverDisplaySrc("https://imgpai.thepaper.cn/example.jpg"),
  "https://imgpai.thepaper.cn/example.jpg",
);
assert.equal(
  clientModule.getCoverDisplaySrc("https://imgslim.geekpark.net/example.jpg"),
  "https://imgslim.geekpark.net/example.jpg",
);

assert.equal(
  resolveProxiedImageContentType(
    "application/octet-stream",
    Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  ),
  "image/jpeg",
);
assert.equal(
  resolveProxiedImageContentType(
    "",
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  ),
  "image/png",
);
assert.equal(
  resolveProxiedImageContentType(
    "application/octet-stream",
    Buffer.from("<!doctype html><title>not an image</title>"),
  ),
  "",
);
assert.equal(
  resolveProxiedImageContentType(
    "text/html",
    Buffer.from("<!doctype html><title>not an image</title>"),
  ),
  "",
);

const coverConsumerPaths = [
  "src/components/HotList.vue",
  "src/components/CategoryStream.vue",
  "src/components/CategorySourceRail.vue",
  "src/views/List.vue",
  "src/views/ChiguaTopic.vue",
];
for (const path of coverConsumerPaths) {
  const source = fs.readFileSync(path, "utf8");
  assert.match(source, /COVER_REFERRER_POLICY/, `${path} must apply the shared cover referrer policy`);
}

console.log("PASS: DailyHot image proxy client/server contract");
