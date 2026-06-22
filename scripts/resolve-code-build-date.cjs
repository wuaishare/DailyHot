const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

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
const includeWorkingTreeMtime =
  process.env.DAILYHOT_INCLUDE_WORKTREE_MTIME === "1";

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

function readGitLines(args) {
  return readGitValue(args, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function collectChangedPaths() {
  const tracked = readGitLines([
    "diff",
    "--name-only",
    "--",
    ...versionSourcePaths,
  ]);
  const untracked = readGitLines([
    "ls-files",
    "--others",
    "--exclude-standard",
    "--",
    ...versionSourcePaths,
  ]);
  return [...new Set([...tracked, ...untracked])];
}

function readFileMtime(pathName) {
  const absolutePath = path.resolve(process.cwd(), pathName);
  if (!fs.existsSync(absolutePath)) return null;
  const stat = fs.statSync(absolutePath);
  return stat.isFile() ? stat.mtime : null;
}

const gitDates = versionSourcePaths
  .map((pathName) => readGitValue(["log", "-1", "--format=%cI", "--", pathName], ""))
  .filter(Boolean)
  .map((value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : formatBuildNumber(date);
  })
  .filter(Boolean);

const workingTreeDates = includeWorkingTreeMtime
  ? collectChangedPaths()
      .map((pathName) => readFileMtime(pathName))
      .filter(Boolean)
      .map((date) => formatBuildNumber(date))
      .filter(Boolean)
  : [];

const dates = [...gitDates, ...workingTreeDates].sort();

process.stdout.write(dates[dates.length - 1] || formatBuildNumber());
