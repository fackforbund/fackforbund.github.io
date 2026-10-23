import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { Section } from "@svenskamodellen/components/Section";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUnionSlugs, parseUnion } from "@/lib/union";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getUnionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!getUnionSlugs().includes(slug)) {
    return {};
  }

  const union = parseUnion(slug);

  return {
    title: union.name,
  };
}

export default async function UnionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!getUnionSlugs().includes(slug)) {
    notFound();
  }

  const union = parseUnion(slug);
  const hasAgreements = union.years.length > 0;

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "https://fackforbund.github.io/": "Fackförbund",
          [`/${union.slug}`]: union.name,
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex w-full flex-col gap-y-8">
          <header className="flex w-full flex-col gap-10 md:flex-row md:items-start">
            <div className="flex flex-col gap-y-8 md:flex-1 md:min-w-0">
              <TopLevelHeading text={union.name} />
              {union.description.length > 0 && (
                <div className="flex max-w-prose flex-col gap-y-4">
                  {union.description.map((paragraph, index) => (
                    <p key={index} className="body-text leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              {hasAgreements && (
                <nav aria-label="Innehåll" className="flex flex-col gap-y-2">
                  <h2 className="font-serif text-lg font-bold">Innehåll</h2>
                  <ul className="flex flex-col font-lilex">
                    <li>
                      <a className="font-bold text-link underline" href="#avtal">
                        Avtal
                      </a>
                      <ul className="flex flex-col pl-1">
                        {union.years.map((year) => (
                          <li
                            key={year.name}
                            className="relative py-1 pl-6 before:absolute before:left-0 before:top-0 before:h-[1.1rem] before:w-4 before:rounded-bl-[0.2rem] before:border-b before:border-l before:border-slate-300 after:absolute after:left-0 after:top-0 after:h-full after:w-px after:bg-slate-300 last:after:hidden dark:before:border-slate-600 dark:after:bg-slate-600"
                          >
                            <a
                              className="text-link underline"
                              href={`#avtal-${year.name}`}
                            >
                              {year.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>
              )}
            </div>

            <aside className="flex w-full flex-col gap-y-6 md:w-80 md:shrink-0">
              {union.logo && (
                <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10 ring-offset-4 ring-offset-[var(--color-background)] dark:ring-white/30">
                  <img
                    alt=""
                    className="h-full w-full object-contain"
                    src={union.logo}
                  />
                </div>
              )}
              <dl className="flex flex-col gap-y-5 font-lilex">
                {union.website && (
                  <div className="flex flex-col gap-y-1">
                    <dt className="font-serif font-bold">Webbplats</dt>
                    <dd>
                      <a className="text-link underline" href={union.website}>
                        {union.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </header>

          <Section>
            <h2 id="avtal" className="scroll-mt-20 section-heading">
              Avtal
            </h2>
            <p className="max-w-prose body-text leading-relaxed">
              Är du medlem i eller anställd hos {union.name}? Har du tillgång
              till avtal som saknas här? Skicka gärna PDF:er till{" "}
              <a
                className="text-link underline"
                href="mailto:henry@catalinismith.se"
              >
                henry@catalinismith.se
              </a>{" "}
              så lägger jag till dem i kollektivavtalsarkivet. Läs mer på{" "}
              <a
                className="text-link underline"
                href="https://kollektivavtal.github.io/bidra"
              >
                kollektivavtal.github.io/bidra
              </a>
              .
            </p>
          </Section>
          <Section>
            <div className="flex w-full flex-col gap-y-8">
              {union.years.map((year) => (
                <section key={year.name} className="flex flex-col gap-y-5">
                  <div className="flex flex-col">
                    <h3
                      id={`avtal-${year.name}`}
                      className="scroll-mt-20 section-heading"
                    >
                      {year.name}
                    </h3>
                    <span className="body-text text-slate-500 dark:text-slate-100">
                      {year.agreements.length} avtal
                    </span>
                  </div>
                  <div className="flex gap-x-4 overflow-x-auto -mx-2 px-2 pt-2 pb-4 pr-8 [scrollbar-width:thin] [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
                    {year.agreements.map((agreement) => (
                      <div
                        key={agreement.url}
                        className="group relative flex w-40 shrink-0 flex-col gap-y-2"
                      >
                        <div className="aspect-[707/1000] w-full overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/10 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg dark:ring-white/50 dark:ring-offset-2 dark:ring-offset-[var(--color-background)]">
                          <img
                            alt=""
                            className="h-full w-full object-cover [image-rendering:pixelated]"
                            src={agreement.thumbnail}
                          />
                        </div>
                        <a
                          // className="text-link underline text-link underline line-clamp-2 body-text group-hover:underline after:absolute after:inset-0"
                          href={agreement.url}
                        >
                          {agreement.title}
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Section>
        </Container>
      </Main>
    </>
  );
}
