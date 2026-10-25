import fs from "node:fs";
import path from "node:path";

export interface Agreement {
  title: string;
  thumbnail: string;
  url: string;
  note?: string;
}

export interface AgreementYear {
  name: string;
  agreements: Agreement[];
}

export interface Union {
  slug: string;
  name: string;
  logo: string;
  website: string | null;
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

// Agreement lines use plain Markdown links. Thumbnails are inferred from the
// archive URL, so source Markdown does not need to duplicate image URLs.
const agreementLink = /^-\s*\[([^\]]+)\]\((https:\/\/kollektivavtal\.github\.io\/(\d{4})\/([^/)]+)\/\))\s*$/;

// Keep accepting the legacy embedded-image form while existing files migrate.
const legacyImageLink = /^-\s*\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)\s*$/;

// A bare URL on its own line (the union's website).
const bareUrl = /^https?:\/\/\S+$/;

export function parseUnion(slug: string): Union {
  const markdown = fs.readFileSync(
    path.join(contentRoot, `${slug}.md`),
    "utf8"
  );

  let name = slug;
  // The logo is served from `public/<slug>/<slug>@512x512.webp`.
  const logo = `/${slug}/${slug}@512x512.webp`;
  let website: string | null = null;
  // The website, if present, is the first thing after the h1.
  let expectWebsite = false;
  const description: string[] = [];
  let paragraph: string[] = [];
  let inPreamble = true;
  const years: AgreementYear[] = [];
  let currentYear: AgreementYear | null = null;
  let currentAgreement: Agreement | null = null;

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
      currentAgreement = null;
      continue;
    }

    if (line.startsWith("# ")) {
      name = line.slice(2).trim();
      expectWebsite = true;
      continue;
    }

    if (expectWebsite) {
      expectWebsite = false;
      if (bareUrl.test(line)) {
        website = line;
        continue;
      }
    }

    if (line.startsWith("### ")) {
      inPreamble = false;
      currentYear = { name: line.slice(4).trim(), agreements: [] };
      currentAgreement = null;
      years.push(currentYear);
      continue;
    }

    if (line.startsWith("## ")) {
      // Section heading (e.g. "Kollektivavtal"); reset the active year.
      inPreamble = false;
      currentYear = null;
      currentAgreement = null;
      continue;
    }

    if (currentAgreement && /^\s{2,}\S/.test(rawLine)) {
      currentAgreement.note = line;
      continue;
    }

    const agreementMatch = line.match(agreementLink);
    if (agreementMatch && currentYear) {
      const [, title, url, year, agreementSlug] = agreementMatch;
      currentAgreement = {
        title,
        url,
        thumbnail: `https://kollektivavtal.github.io/${year}/${agreementSlug}-320.webp`,
      };
      currentYear.agreements.push(currentAgreement);
      continue;
    }

    const legacyAgreementMatch = line.match(legacyImageLink);
    if (legacyAgreementMatch && currentYear) {
      const [, title, thumbnail, url] = legacyAgreementMatch;
      currentAgreement = { title, url, thumbnail };
      currentYear.agreements.push(currentAgreement);
      continue;
    }

    currentAgreement = null;

    // Any remaining plain text before the first section is the description.
    if (inPreamble) {
      paragraph.push(line);
    }
  }

  flushParagraph();

  return { slug, name, logo, website, description, years };
}
