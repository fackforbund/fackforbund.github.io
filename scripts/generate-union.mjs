// Builds a union's markdown content file from a verified match list produced by
// scripts/scan-union.sh (which greps each kollektivavtal PDF's parties block).
//
// Usage: node scripts/generate-union.mjs <slug> "<Display Name>"
// Reads: scripts/matches-<slug>.tsv  (lines: "<year>\t<pdf filename>")
// Writes: <slug>/<slug>.md

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [, , slugArg, nameArg] = process.argv;
const unionSlug = slugArg || "unionen";
const unionName = nameArg || "Unionen";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function slugify(name) {
  return name
    .normalize("NFC")
    .toLowerCase()
    .replace(/ /gi, "-")
    .replace(/&/gi, "-")
    .replace(/[()]/gi, "-")
    .replace(/å/gi, "a")
    .replace(/ä/gi, "a")
    .replace(/ö/gi, "o")
    .replace(/é/gi, "e")
    .replace(/--+/g, "-")
    .replace(/-$/g, "");
}

// Mirror of autoindex's parseFilename: "Name (2) Document.pdf" -> agreement "Name".
function parseAgreementName(filename) {
  const basename = path.basename(filename, ".pdf");
  const rankMatch = basename.match(/^([^[]+) \((\d+)\) (.+)$/);
  return (rankMatch ? rankMatch[1] : basename).trim();
}

async function main() {
  const tsv = await fs.readFile(
    path.join(__dirname, `matches-${unionSlug}.tsv`),
    "utf8"
  );

  // Preserve any hand-authored description from the existing file (the plain
  // text between the logo and the "## Kollektivavtal" section).
  const outPath = path.join(repoRoot, "forbund", `${unionSlug}.md`);
  let description = "";
  try {
    const existing = await fs.readFile(outPath, "utf8");
    const preamble = existing.split(/^## /m)[0];
    description = preamble
      .split("\n")
      .filter((l) => !l.trim().startsWith("#"))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n") // collapse runs of blank lines
      .trim();
  } catch {
    // no existing file; nothing to preserve
  }

  // year -> Map(agreementSlug -> { title, slug, pdf })
  const byYear = new Map();
  for (const line of tsv.split("\n")) {
    if (!line.trim()) continue;
    const [year, pdf] = line.split("\t");
    const title = parseAgreementName(pdf);
    const slug = slugify(title);
    if (!byYear.has(year)) byYear.set(year, new Map());
    const agreements = byYear.get(year);
    // First matched PDF for an agreement wins (used only for the icon).
    if (!agreements.has(slug)) agreements.set(slug, { title, slug, pdf });
  }

  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));

  const lines = [`# ${unionName}`, ""];
  if (description) lines.push(description, "");
  lines.push("## Kollektivavtal", "");

  for (const year of years) {
    const agreements = [...byYear.get(year).values()].sort((a, b) =>
      a.title.localeCompare(b.title, "sv")
    );
    lines.push(`### ${year}`, "");
    for (const a of agreements) {
      const icon = `https://kollektivavtal.github.io/${year}/${slugify(
        a.pdf.slice(0, -4)
      )}-320.webp`;
      const url = `https://kollektivavtal.github.io/${year}/${a.slug}/`;
      lines.push(`- [![${a.title}](${icon})](${url})`);
    }
    lines.push("");
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, lines.join("\n").replace(/\n+$/, "\n"));

  const total = years.reduce((n, y) => n + byYear.get(y).size, 0);
  console.log(
    `Wrote ${outPath}: ${total} agreements across ${years.length} years.`
  );
}

main();
