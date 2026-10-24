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

          <div className="flex flex-col gap-6">
            <p className="max-w-prose body-text">Den här sidan är en del av webbprojektet <a className="text-link underline" href="https://svenskamodellen.github.io/">Svenska Modellen</a>. Google vimlar av fackförbundslistor och guider och jämförelsetjänster, ofta byggda av vinstdrivna företag, späckade med affiliate-länkar, hopplöst inaktuella, eller alla tre. Denna ger dig tillgång till kollektivavtal.
            </p>
          </div>

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
                    className="group relative flex xxs:items-center gap-x-4 flex-col xxs:flex-row max-w-full"
                  >
                    <div className="h-16 w-16 sm:h-32 sm:w-32 shrink-0 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition duration-150 group-hover:shadow-md dark:shadow-none dark:ring-white/40 dark:group-hover:-translate-y-1 dark:group-hover:ring-2 dark:group-hover:ring-white">
                      <img
                        alt=""
                        className="h-full w-full object-contain"
                        src={union.logo}
                      />
                    </div>
                    <span className="flex flex-col font-lilex min-w-0">
                      <a
                        className="text-link underline after:absolute after:inset-0 section-heading hyphens-auto break-words"
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
