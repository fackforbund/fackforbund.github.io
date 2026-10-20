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

// Agreement lines use the embedded-image form `- [![alt](img)](url)`, where
// `img` is the agreement thumbnail URL and `url` is the agreement page. The
// image URL is used directly rather than derived from the slug.
const imageLink = /^-\s*\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)\s*$/;

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

    const agreementMatch = line.match(imageLink);
    if (agreementMatch && currentYear) {
      const [, title, thumbnail, url] = agreementMatch;
      currentYear.agreements.push({ title, url, thumbnail });
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
