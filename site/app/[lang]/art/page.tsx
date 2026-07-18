import type { Metadata } from "next";
import Link from "next/link";
import { ART_COLLECTION, creditLine, objectUrl } from "../../../lib/art/collection";
import { ArtFigure } from "../../../components/ArtFigure";
import { RepoLink } from "../../../components/RepoLink";

type Params = { lang: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ lang: "en" }];
}

export const metadata: Metadata = {
  title: "The art of resistance",
  description:
    "A hand-curated collection of public-domain protest art — fliers, placards and broadsides from the movements that documented their own struggle.",
  alternates: { canonical: "/en/art" },
};

export default async function Page({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  return (
    <>
      <header className="mast">
        <Link href={`/${lang}`} className="disp" style={{ textDecoration: "none" }}>
          Decolonize.wiki
        </Link>
        <span className="mono">The collection · all CC0 · Smithsonian NMAAHC</span>
      </header>

      <main id="main">
        <section className="hero">
          <div className="eyebrow">
            <span>The art of resistance</span>
            <span>{ART_COLLECTION.length} works · public domain</span>
          </div>
          <h1 className="disp">The movement printed its own record.</h1>
          <p>
            Decolonization was documented by the people who fought for it — on
            fliers, placards and broadsides. These are originals, kept by the
            Smithsonian National Museum of African American History and Culture
            and released into the public domain. <b>Every piece is credited to
            its record.</b>
          </p>
        </section>

        <section className="art-list" aria-label="The collection">
          {ART_COLLECTION.map((e) => (
            <article key={e.id} className="art-item" id={e.id}>
              <ArtFigure id={e.id} sizes="(max-width:760px) 92vw, 42vw" />
              <div className="art-ctx">
                <h2 className="disp">{e.title}</h2>
                <p className="art-meta mono">
                  {e.year} · {e.themes.join(" · ")}
                </p>
                <p className="art-context">{e.context}</p>
                <p className="art-record mono">
                  <a href={objectUrl(e)} rel="noopener">
                    View the record at NMAAHC →
                  </a>
                </p>
              </div>
            </article>
          ))}
        </section>

        <section className="art-note">
          <p>
            The collection is deliberately small and grows slowly. Every piece
            is CC0 — dedicated to the public domain by the museum that holds it
            — and every credit line names the accession, because provenance is
            the point.
          </p>
        </section>
      </main>

      <footer className="mfoot">
        <span>An open project · AGPL / CC BY-SA</span>
        <span>
          Not affiliated with the Wikimedia Foundation · analyses critique
          articles, not editors · <RepoLink />
        </span>
      </footer>
    </>
  );
}
