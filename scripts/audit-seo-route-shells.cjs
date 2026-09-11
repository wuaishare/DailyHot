const fs = require("node:fs");
const path = require("node:path");

const distRoot = path.join(__dirname, "..", "dist");
if (!fs.existsSync(distRoot)) {
  throw new Error("dist/ is missing; build route shells before auditing SEO titles.");
}

const htmlFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(target);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(target);
  }
};
walk(distRoot);

const malformed = [];
let titledFiles = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) continue;
  titledFiles += 1;
  const title = match[1].replace(/\s+/g, " ").trim();
  if (/\s-\s榜(?:[，, ]|$)/u.test(title)) {
    malformed.push({ file: path.relative(distRoot, file), title });
  }
}
if (malformed.length) {
  console.error("[seo-shell-audit] malformed generated titles detected:");
  for (const row of malformed) {
    console.error(`- ${row.file}: ${row.title}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `[seo-shell-audit] checked ${titledFiles} titled HTML files; malformed suffix fragments: 0`,
  );
}
