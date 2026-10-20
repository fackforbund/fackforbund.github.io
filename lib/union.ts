import fs from "node:fs";
import path from "node:path";

export interface Agreement {
  title: string;
  thumbnail: string;
  url: string;
}

export interface AgreementYear {
  name: string;
  agreements: Agreement[];
}

export interface Union {
  slug: string;
  name: string;
  logo: string;
  description: string[];
  years: AgreementYear[];
}

// Union content lives together under `forbund/`, one markdown file per union,
// e.g. `forbund/unionen.md`. Logo binaries live under `public/<slug>/`.
const contentRoot = path.join(process.cwd(), "forbund");

export function getUnionSlugs(): string[] {
  return fs
    .readdirSync(contentRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name.slice(0, -3));
}

// Agreement lines are plain links: `- [Title](url)`. The thumbnail is derived
// from the agreement slug in the url, which kollektivavtal-autoindex now emits
// as `<year>/<slug>-320.webp` alongside `<year>/<slug>/`.
const agreementLink = /^-\s*\[([^\]]*)\]\(([^)]+)\)\s*$/;

// Also accept the legacy `- [![alt](img)](url)` form so existing markdown keeps
// working; the embedded image is ignored in favour of the slug-derived one.
const legacyImageLink = /^-\s*\[!\[[^\]]*\]\([^)]+\)\]\(([^)]+)\)\s*$/;

function thumbnailFromUrl(url: string): string {
  return `${url.replace(/\/$/, "")}-320.webp`;
}

export function parseUnion(slug: string): Union {
  const markdown = fs.readFileSync(
    path.join(contentRoot, `${slug}.md`),
    "utf8"
  );

  let name = slug;
  // The logo is served from `public/<slug>/<slug>@512x512.webp`.
  const logo = `/${slug}/${slug}@512x512.webp`;
  const description: string[] = [];
  let paragraph: string[] = [];
  let inPreamble = true;
  const years: AgreementYear[] = [];
  let currentYear: AgreementYear | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      description.push(paragraph.join(" "));
      paragraph = [];
    }
  };

  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("### ")) {
      inPreamble = false;
      currentYear = { name: line.slice(4).trim(), agreements: [] };
      years.push(currentYear);
      continue;
    }

    if (line.startsWith("## ")) {
      // Section heading (e.g. "Kollektivavtal"); reset the active year.
      inPreamble = false;
      currentYear = null;
      continue;
    }

    // Check the legacy image form first: a plain-link regex would otherwise
    // partially (and wrongly) match the `[![alt](img)](url)` syntax.
    const legacyMatch = line.match(legacyImageLink);
    if (legacyMatch && currentYear) {
      const [, url] = legacyMatch;
      const title = line.match(/\[!\[([^\]]*)\]/)?.[1] ?? url;
      currentYear.agreements.push({
        title,
        url,
        thumbnail: thumbnailFromUrl(url),
      });
      continue;
    }

    const plainMatch = line.match(agreementLink);
    if (plainMatch && currentYear) {
      const [, title, url] = plainMatch;
      currentYear.agreements.push({
        title,
        url,
        thumbnail: thumbnailFromUrl(url),
      });
      continue;
    }

    // Any remaining plain text before the first section is the description.
    if (inPreamble) {
      paragraph.push(line);
    }
  }

  flushParagraph();

  return { slug, name, logo, description, years };
}
