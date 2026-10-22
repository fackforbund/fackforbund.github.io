import { Breadcrumbs } from "@svenskamodellen/components/Breadcrumb";
import { Container } from "@svenskamodellen/components/Container";
import { Main } from "@svenskamodellen/components/Main";
import { Section } from "@svenskamodellen/components/Section";
import { TopLevelHeading } from "@svenskamodellen/components/TopLevelHeading";
import { getUnionSlugs, parseUnion } from "@/lib/union";

export const dynamic = "force-static";

export default function Home() {
  const unions = getUnionSlugs()
    .map((slug) => parseUnion(slug))
    .sort((a, b) => a.name.localeCompare(b.name, "sv"));

  return (
    <>
      <Breadcrumbs>
        {{
          "https://svenskamodellen.github.io/": "Svenska modellen",
          "/": "Fackförbund",
        }}
      </Breadcrumbs>
      <Main>
        <Container className="flex flex-col items-start space-y-8">
          <TopLevelHeading
            text="Fackförbund"
            subtext="A–Ö listan över Sveriges nuvarande fackförbund"
          />

          <Section className="w-full overflow-visible">
            <ul className="flex w-full flex-col gap-y-8">
              {unions.map((union) => {
                const agreementCount = union.years.reduce(
                  (total, year) => total + year.agreements.length,
                  0
                );
                return (
                  <li
                    key={union.slug}
                    className="group relative flex items-center gap-x-4"
                  >
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition duration-150 group-hover:shadow-md dark:shadow-none dark:ring-white/40 dark:group-hover:-translate-y-1 dark:group-hover:ring-2 dark:group-hover:ring-white">
                      <img
                        alt=""
                        className="h-full w-full object-contain"
                        src={union.logo}
                      />
                    </div>
                    <span className="flex flex-col font-lilex">
                      <a
                        className="text-link underline after:absolute after:inset-0 section-heading"
                        href={`/${union.slug}`}
                      >
                        {union.name}
                      </a>
                      {agreementCount > 0 && (
                        <span className="text-sm text-slate-500 dark:text-slate-100">
                          {agreementCount} kollektivavtal i arkivet
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>
        </Container>
      </Main>
    </>
  );
}
