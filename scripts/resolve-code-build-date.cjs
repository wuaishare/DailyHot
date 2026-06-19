const { spawnSync } = require("node:child_process");

const versionSourcePaths = [
  "src",
  "public",
  "api",
  "index.html",
  "package.json",
  "vercel.json",
  "vite.config.js",
  "scripts/generate-route-shells.cjs",
  "scripts/generate-seo-files.js",
  "scripts/resolve-code-build-date.cjs",
  "scripts/vercel-deploy-prod.cjs",
];
const buildNumberTimeZone = "Asia/Shanghai";

function formatBuildNumber(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: buildNumberTimeZone,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}`;
}

function readGitValue(args, fallback = "") {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  return result.status === 0 && result.stdout.trim()
    ? result.stdout.trim()
    : fallback;
}

const dates = versionSourcePaths
  .map((pathName) => readGitValue(["log", "-1", "--format=%cI", "--", pathName], ""))
  .filter(Boolean)
  .map((value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : formatBuildNumber(date);
  })
  .filter(Boolean)
  .sort();

process.stdout.write(dates[dates.length - 1] || formatBuildNumber());
