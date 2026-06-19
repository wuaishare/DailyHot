import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { VitePWA } from "vite-plugin-pwa";
import prerender from "vite-plugin-prerender";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const versionSourcePaths = [
  "src",
  "public",
  "api",
  "index.html",
  "package.json",
  "vercel.json",
];

function readPackageVersion() {
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")
    );
    const version = packageJson.version?.trim() || "0.0.0";
    return version.startsWith("v") ? version : `v${version}`;
  } catch {
    return "v0.0.0";
  }
}

function readGitValue(args, fallback) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return result.status === 0 && result.stdout.trim()
    ? result.stdout.trim()
    : fallback;
}

function runGit(args) {
  return spawnSync("git", args, {
    cwd: repoRoot,
    stdio: "ignore",
    timeout: 30000,
  }).status === 0;
}

function ensureFullGitHistory() {
  const isShallow = readGitValue(
    ["rev-parse", "--is-shallow-repository"],
    "false"
  );
  if (isShallow !== "true") return;

  if (!runGit(["fetch", "--unshallow", "--quiet"])) {
    runGit(["fetch", "--depth=2147483647", "--quiet"]);
  }
}

function readGitHubRepo() {
  const owner = process.env.VERCEL_GIT_REPO_OWNER?.trim();
  const repo = process.env.VERCEL_GIT_REPO_SLUG?.trim();
  if (owner && repo) return { owner, repo };

  const remoteUrl = readGitValue(["config", "--get", "remote.origin.url"], "");
  const matched = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
  return matched ? { owner: matched[1], repo: matched[2] } : null;
}

function formatDateFallback() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}`;
}

function resolveBuildDate() {
  const envBuildDate = process.env.VITE_BUILD_NUMBER?.trim();
  if (envBuildDate) return envBuildDate;

  ensureFullGitHistory();

  const dates = versionSourcePaths
    .map((pathName) =>
      readGitValue(
        ["log", "-1", "--format=%cd", "--date=format:%y%m%d%H%M", "--", pathName],
        ""
      )
    )
    .filter(Boolean)
    .sort();

  return dates[dates.length - 1] || formatDateFallback();
}

function buildPrerenderRoutes(categorySlugs = []) {
  const storePath = path.join(repoRoot, "src/store/index.js");
  const subtypePath = path.join(repoRoot, "src/utils/sourceSubtypes.js");
  const storeSource = fs.readFileSync(storePath, "utf8");
  const subtypeSource = fs.readFileSync(subtypePath, "utf8");
  const sourceNames = [
    ...new Set([...storeSource.matchAll(/name:\s*"([^"]+)"/g)].map((match) => match[1])),
  ];
  const subtypeBlocks = [...subtypeSource.matchAll(/"([^"]+)":\s*\[(.*?)\n\s*\],/gs)];
  const subtypeMap = new Map();

  for (const [, sourceName, block] of subtypeBlocks) {
    const values = [...block.matchAll(/value:\s*"([^"]+)"/g)].map((match) => match[1]);
    subtypeMap.set(sourceName, values);
  }

  const routes = new Set(["/", "/list"]);
  categorySlugs.forEach((slug) => {
    if (slug) routes.add(`/category/${slug}`);
  });
  sourceNames.forEach((source) => {
    routes.add(`/rank/${source}`);
    (subtypeMap.get(source) || []).forEach((subtype) => {
      routes.add(`/rank/${source}/${subtype}`);
    });
  });

  return [...routes].sort();
}

export default defineConfig(async ({ mode }) => {
  const enablePrerender = process.env.PRERENDER === "true";
  const { BUILTIN_CATEGORIES } = await import(
    new URL("./src/config/site-metadata.mjs", import.meta.url)
  );
  const prerenderRoutes = buildPrerenderRoutes(
    BUILTIN_CATEGORIES.map((item) => item.slug).filter(Boolean)
  );
  const productVersion = readPackageVersion();
  let buildDate = resolveBuildDate();
  const isStillShallow = readGitValue(
    ["rev-parse", "--is-shallow-repository"],
    "false"
  );
  if (isStillShallow === "true" && typeof fetch === "function") {
    const repoInfo = readGitHubRepo();
    const ref =
      process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
      process.env.VERCEL_GIT_COMMIT_REF?.trim() ||
      readGitValue(["rev-parse", "HEAD"], "");
    if (repoInfo && ref) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        const dates = [];
        for (const pathName of versionSourcePaths) {
          const response = await fetch(
            `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/commits?sha=${encodeURIComponent(
              ref
            )}&path=${encodeURIComponent(pathName)}&per_page=1`,
            {
              headers: {
                Accept: "application/vnd.github+json",
                "User-Agent": "DailyHot-build-version",
              },
              signal: controller.signal,
            }
          );
          if (!response.ok) continue;
          const commits = await response.json();
          const latest = commits?.[0]?.commit?.committer?.date;
          if (!latest) continue;
          const date = new Date(latest);
          if (Number.isNaN(date.getTime())) continue;
          const yy = String(date.getFullYear()).slice(-2);
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const hh = String(date.getHours()).padStart(2, "0");
          const mi = String(date.getMinutes()).padStart(2, "0");
          dates.push(`${yy}${mm}${dd}${hh}${mi}`);
        }
        if (dates.length) {
          dates.sort();
          buildDate = dates[dates.length - 1];
        }
      } catch {
        // Fall back to local git-derived value.
      } finally {
        clearTimeout(timeoutId);
      }
    }
  }
  return {
    base: loadEnv(mode, process.cwd())["VITE_DIR"],
    define: {
      __APP_VERSION__: JSON.stringify({
        version: `${productVersion} (${buildDate})`,
        productVersion,
        buildNumber: buildDate,
        buildVersion: buildDate,
      }),
    },
    plugins: [
      vue(),
      AutoImport({
        imports: [
          "vue",
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
            ],
          },
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
      // PWA
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          navigateFallbackDenylist: [
            /^\/api(?:[/?#]|$)/,
            /\/[^/?]+\.[^/?]+(?:[?#].*)?$/,
          ],
          runtimeCaching: [
            {
              urlPattern: /(.*?)\.(woff2|woff|ttf)/,
              handler: "CacheFirst",
              options: {
                cacheName: "file-cache",
              },
            },
            {
              urlPattern:
                /(.*?)\.(webp|png|jpe?g|svg|gif|bmp|psd|tiff|tga|eps)/,
              handler: "CacheFirst",
              options: {
                cacheName: "image-cache",
              },
            },
          ],
        },
        manifest: {
          name: "今日热榜",
          short_name: "DailyHot",
          description: "汇聚全网热点，热门尽览无余_吾爱分享网",
          display: "standalone",
          start_url: "/",
          theme_color: "#fff",
          background_color: "#efefef",
          icons: [
            {
              src: "/ico/favicon.png",
              sizes: "200x200",
              type: "image/png",
            },
          ],
        },
      }),
      // 预渲染首页、分类页与榜单详情页，提升抓取器对动态 title/meta 的首屏感知能力。
      ...(enablePrerender
        ? [
            prerender({
              staticDir: fileURLToPath(new URL("./dist", import.meta.url)),
              routes: prerenderRoutes,
              rendererOptions: {
                headless: true,
                renderAfterDocumentEvent: "prerender-ready",
                inject: {
                  prerender: true,
                },
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 6699,
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          pure_funcs: ["console.log"],
        },
      },
    },
  };
});
