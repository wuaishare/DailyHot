const { spawnSync } = require("node:child_process");

const buildNumber = spawnSync("node", ["scripts/resolve-code-build-date.cjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
  env: {
    ...process.env,
    DAILYHOT_INCLUDE_WORKTREE_MTIME: "1",
  },
});

if (buildNumber.status !== 0 || !buildNumber.stdout.trim()) {
  console.error("无法计算代码版本号");
  process.exit(buildNumber.status || 1);
}

const value = buildNumber.stdout.trim();
const siteUrl = process.env.VITE_SITE_URL || "https://hot.wuaishare.cn";
console.log(`使用代码版本号: ${value}`);
console.log(`使用站点地址: ${siteUrl}`);

const result = spawnSync(
  "npx",
  [
    "vercel",
    "deploy",
    "--prod",
    "--yes",
    "--archive=tgz",
    "-b",
    `VITE_BUILD_NUMBER=${value}`,
    "-b",
    `VITE_SITE_URL=${siteUrl}`,
  ],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      VERCEL_TELEMETRY_DISABLED: "1",
      VITE_BUILD_NUMBER: value,
      VITE_SITE_URL: siteUrl,
    },
  }
);

process.exit(result.status || 0);
