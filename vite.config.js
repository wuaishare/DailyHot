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

function resolveBuildNumber() {
  const envBuildNumber = process.env.VITE_BUILD_NUMBER?.trim();
  if (envBuildNumber) return envBuildNumber;

  ensureFullGitHistory();

  const isStillShallow = readGitValue(
    ["rev-parse", "--is-shallow-repository"],
    "false"
  );
  if (isStillShallow === "true") {
    const vercelCommitSha = process.env.VERCEL_GIT_COMMIT_SHA?.trim();
    return vercelCommitSha
      ? parseInt(vercelCommitSha.slice(0, 8), 16).toString()
      : Date.now().toString();
  }

  return readGitValue(["rev-list", "--count", "HEAD"], Date.now().toString());
}

export default defineConfig(({ mode }) => {
  const enablePrerender = process.env.PRERENDER === "true";
  const productVersion = readPackageVersion();
  const buildNumber = resolveBuildNumber();
  const buildVersion = readGitValue(
    ["log", "-1", "--format=%cd", "--date=format:%y.%m%d.%H%M%S"],
    "00.0000.000000"
  );
  return {
    base: loadEnv(mode, process.cwd())["VITE_DIR"],
    define: {
      __APP_VERSION__: JSON.stringify({
        version: `${productVersion} (${buildNumber})`,
        productVersion,
        buildNumber,
        buildVersion,
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
          navigateFallbackDenylist: [/^\/api(?:\/|$)/],
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
      // 预渲染首页与榜单页，降低 SPA 空白首屏的抓取风险（默认关闭，CI 可用 PRERENDER=true 开启）
      ...(enablePrerender
        ? [
            prerender({
              staticDir: fileURLToPath(new URL("./dist", import.meta.url)),
              routes: ["/", "/list"],
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
