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
                <li key={union.slug}>
                  <a
                    className="group flex items-center gap-x-3"
                    href={`/${union.slug}`}
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition duration-150 group-hover:shadow-md dark:shadow-none dark:ring-white/40 dark:group-hover:-translate-y-1 dark:group-hover:ring-2 dark:group-hover:ring-white">
                      {union.logo ? (
                        <img
                          alt=""
                          className="h-full w-full object-contain"
                          src={union.logo}
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">
                          {union.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="flex flex-col font-lilex">
                      <span className="font-bold text-link group-hover:underline tracking-tight">
                        {union.name}
                      </span>
                      {agreementCount > 0 && (
                        <span className="text-sm text-slate-500 dark:text-slate-100">
                          {agreementCount} kollektivavtal i arkivet
                        </span>
                      )}
                    </span>
                  </a>
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
