const { spawnSync } = require("node:child_process");

const buildNumber = spawnSync("node", ["scripts/resolve-code-build-date.cjs"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (buildNumber.status !== 0 || !buildNumber.stdout.trim()) {
  console.error("无法计算代码版本号");
  process.exit(buildNumber.status || 1);
}

const value = buildNumber.stdout.trim();
console.log(`使用代码版本号: ${value}`);

const result = spawnSync(
  "npx",
  ["vercel", "deploy", "--prod", "--yes", "-b", `VITE_BUILD_NUMBER=${value}`],
  {
    cwd: process.cwd(),
    stdio: "inherit",
    env: {
      ...process.env,
      VITE_BUILD_NUMBER: value,
    },
  }
);

process.exit(result.status || 0);
