// Collect the agreement links from forbund/*.md, fetch each agreement page on
// kollektivavtal.github.io and record the first thumbnail listed for each
// year. Writes lib/thumbnails.json keyed by "<slug>#<year>".
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const forbundDir = path.join(root, "forbund");
const output = path.join(root, "lib", "thumbnails.json");
const link = /https:\/\/kollektivavtal\.github\.io\/([^/#)\s]+)#(\d{4})/g;

const wanted = new Map();
for (const file of fs.readdirSync(forbundDir)) {
  if (!file.endsWith(".md")) continue;
  const markdown = fs.readFileSync(path.join(forbundDir, file), "utf8");
  for (const [, slug, year] of markdown.matchAll(link)) {
    if (!wanted.has(slug)) wanted.set(slug, new Set());
    wanted.get(slug).add(year);
  }
}

const thumbnails = {};
const missing = [];
for (const [slug, years] of [...wanted].sort()) {
  const response = await fetch(`https://kollektivavtal.github.io/${slug}/`);
  if (!response.ok) {
    for (const year of years) missing.push(`${slug}#${year}`);
    continue;
  }
  const html = await response.text();
  for (const year of years) {
    const section = html.split(`id="${year}"`)[1];
    const src = section?.match(/src="(https:\/\/kollektivavtal\.github\.io\/[^"]+-320\.webp)"/)?.[1];
    if (src) thumbnails[`${slug}#${year}`] = src;
    else missing.push(`${slug}#${year}`);
  }
}

fs.writeFileSync(output, JSON.stringify(thumbnails, null, 2) + "\n");
console.log(`Wrote ${Object.keys(thumbnails).length} thumbnails to ${output}`);
if (missing.length) {
  console.error(`Missing:\n${missing.join("\n")}`);
  process.exitCode = 1;
}
