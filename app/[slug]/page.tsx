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
          <header className="relative flex w-full flex-col gap-10 md:items-start">
            <div className="flex flex-col gap-y-8 md:w-[calc(100%_-_21rem)]">
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
            </div>

            <aside className="flex w-full flex-row items-start gap-x-4 gap-y-6 md:absolute md:right-0 md:top-0 md:w-80 md:flex-col">
              {union.logo && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10 ring-offset-4 ring-offset-[var(--color-background)] dark:ring-white/30 md:aspect-square md:h-auto md:w-full">
                  <img
                    alt=""
                    className="h-full w-full object-contain"
                    src={union.logo}
                  />
                </div>
              )}
              <dl className="flex flex-col gap-y-5 self-center font-lilex leading-tight md:self-auto">
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

            {hasAgreements && (
              <nav aria-label="Innehåll" className="flex flex-col gap-y-2 md:w-[calc(100%_-_21rem)]">
                <h2 className="section-heading">Innehåll</h2>
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
          <Section className="overflow-visible">
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
                  <ul className="flex w-full flex-col gap-y-8">
                    {year.agreements.map((agreement) => (
                      <li
                        key={agreement.url}
                        className="group relative flex flex-col items-start gap-y-2 xxs:flex-row xxs:items-center xxs:gap-x-4 sm:gap-x-6"
                      >
                        <div className="aspect-[707/1000] w-24 shrink-0 overflow-hidden rounded-md bg-white shadow-md ring-1 ring-black/10 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg sm:w-40 dark:ring-white/50 dark:ring-offset-2 dark:ring-offset-[var(--color-background)]">
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={agreement.thumbnail}
                          />
                        </div>
                        <span className="flex flex-col gap-y-1 font-lilex">
                          <a
                            href={agreement.url}
                            className="section-heading font-bold tracking-tighter break-all text-link underline after:absolute after:inset-0"
                          >
                            {agreement.title}
                          </a>
                          {agreement.note && (
                            <span className="body-text text-slate-500 dark:text-slate-300">
                              {agreement.note}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </Section>
        </Container>
      </Main>
    </>
  );
}
