// One-off importer: builds forbund/<slug>.md from the archived fackforbund.github.io
// site and copies each union's webp logos into public/<slug>/.
//
// It reads the archive's per-union frontmatter (name.sv + description.sv) and
// writes our simple markdown format (# Name + description paragraph). It does
// NOT add any kollektivavtal links.
//
// Usage: node scripts/import-forbund.mjs

import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const archiveRoot = path.join(
  os.homedir(),
  "Downloads/Archive/fackforbund.github.io"
);

// Archive entries that are not national trade unions (employer associations
// and single-workplace clubs). Keyed by lowercased slug.
const excluded = new Set([
  "teknikforetagen",
  "baro",
  "malmo-vard-och-omsorg",
  "seko-klubb-sj-trafik",
  "spotify-workers-unionen",
  "sveriges-ingenjorer-pa-sandvik",
  "volvo-car-verkstadsklubb",
]);

// Minimal extractor for the `name:`/`description:` sv values in the frontmatter.
function extractSv(frontmatter, key) {
  const lines = frontmatter.split("\n");
  let inKey = false;
  for (const line of lines) {
    if (/^\S/.test(line)) inKey = false;
    if (new RegExp(`^${key}:\\s*$`).test(line)) {
      inKey = true;
      continue;
    }
    if (inKey) {
      const m = line.match(/^\s+sv:\s*(.+)$/);
      if (m) return m[1].trim();
    }
  }
  return null;
}

async function main() {
  const entries = await fs.readdir(archiveRoot, { withFileTypes: true });
  const slugs = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const sourceSlug = entry.name;
    // Our slugs are always lowercase (e.g. fackforbundet-ST -> fackforbundet-st).
    const slug = sourceSlug.trim().toLowerCase();
    // unionen is already authored (description + kollektivavtal links); leave it.
    if (slug === "unionen") continue;
    if (excluded.has(slug)) continue;
    const mdPath = path.join(archiveRoot, sourceSlug, `${sourceSlug}.md`);

    let raw;
    try {
      raw = await fs.readFile(mdPath, "utf8");
    } catch {
      continue; // no per-union markdown; not a union directory
    }

    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    const frontmatter = fmMatch[1];

    const name = extractSv(frontmatter, "name");
    const description = extractSv(frontmatter, "description");
    if (!name) continue;

    // Write our markdown (no kollektivavtal links yet).
    const lines = [`# ${name}`, ""];
    if (description) lines.push(description, "");
    await fs.mkdir(path.join(repoRoot, "forbund"), { recursive: true });
    await fs.writeFile(
      path.join(repoRoot, "forbund", `${slug}.md`),
      lines.join("\n")
    );

    // Copy logos into public/<slug>/, normalising filenames to the lowercase
    // slug. Prefer webp; convert PNG with cwebp when webp isn't available.
    const destDir = path.join(repoRoot, "public", slug);
    await fs.mkdir(destDir, { recursive: true });
    const files = await fs.readdir(path.join(archiveRoot, sourceSlug));
    const hasWebp = files.some((f) => f.endsWith(".webp"));
    for (const file of files) {
      const ext = hasWebp ? ".webp" : ".png";
      if (!file.endsWith(ext)) continue;
      const size = file.match(/@(\d+x\d+)\./)?.[1];
      if (!size) continue;
      const src = path.join(archiveRoot, sourceSlug, file);
      const dest = path.join(destDir, `${slug}@${size}.webp`);
      if (hasWebp) {
        await fs.copyFile(src, dest);
      } else {
        await execFileAsync("cwebp", ["-quiet", src, "-o", dest]);
      }
    }

    slugs.push(slug);
  }

  slugs.sort((a, b) => a.localeCompare(b, "sv"));
  console.log(`Imported ${slugs.length} unions:\n  ${slugs.join("\n  ")}`);
}

main();
