const { spawnSync } = require("node:child_process");

const versionSourcePaths = [
  "src",
  "public",
  "api",
  "index.html",
  "package.json",
  "vercel.json",
];

function readGitValue(args, fallback = "") {
  const result = spawnSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  return result.status === 0 && result.stdout.trim()
    ? result.stdout.trim()
    : fallback;
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

const dates = versionSourcePaths
  .map((pathName) =>
    readGitValue(
      ["log", "-1", "--format=%cd", "--date=format:%y%m%d%H%M", "--", pathName],
      ""
    )
  )
  .filter(Boolean)
  .sort();

process.stdout.write(dates[dates.length - 1] || formatDateFallback());
