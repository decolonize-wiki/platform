import type { Metadata } from "next";
import Link from "next/link";
import { getAllAnalyses } from "../../lib/cached";
import { latestFor } from "../../lib/data";
import { CATEGORY_NAMES } from "../../components/FlagBlock";
import { Library } from "../../components/Library";
import { HomeHero } from "../../components/hero/HomeHero";
import { SLUG_REGION } from "../../lib/atlas-regions";
import { EmailForm } from "../../components/EmailForm";
import { RepoLink } from "../../components/RepoLink";
import { heroFlags } from "../../lib/hero-flags";
import { HeroArtSlider } from "../../components/HeroArtSlider";
import type { Analysis } from "@schema/analysis";

const REQUEST_URL =
  "https://github.com/decolonize-wiki/methodology/issues/new?title=Request%3A%20%5BArticle%20title%5D&labels=article-request&body=Which%20Wikipedia%20article%3F%0A%0AWhy%3F";

const MISSION =
  "Wikipedia still says it. We read the world's encyclopedia line by line, against a public methodology built on a century of decolonial thought — and publish the receipts.";

type Params = { lang: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return [{ lang: "en" }];
}

export const metadata: Metadata = {
  title: { absolute: "decolonize.wiki — the receipts on colonial framing" },
  description: MISSION,
};

function latestPerSlug(all: Analysis[], lang: string): Analysis[] {
  const slugs = new Set(
    all
      .filter((a) => a.language === lang && a.status === "published")
      .map((a) => a.article.slug),
  );
  return [...slugs]
    .map((slug) => latestFor(all, lang, slug))
    .filter((a): a is Analysis => a !== undefined)
    .sort((a, b) => a.article.title.localeCompare(b.article.title));
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { lang } = await params;
  const all = await getAllAnalyses();
  const latest = latestPerSlug(all, lang);

  const flagsTotal = latest.reduce((n, a) => n + a.flags.length, 0);
  const categories = new Set(latest.flatMap((a) => a.flags.map((f) => f.categoryId)));
  const version =
    latest
      .map((a) => a.methodologyVersion)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .at(-1) ?? "v0.1";

  const entries = latest.map((a) => ({
    title: a.article.title,
    slug: a.article.slug,
    lang: a.language,
    seq: a.sequence,
    flagCount: a.flags.length,
    categories: [...new Set(a.flags.map((f) => CATEGORY_NAMES[f.categoryId]))],
  }));

  const atlasEntries = latest
    .map((a) => ({
      slug: a.article.slug,
      title: a.article.title,
      flagCount: a.flags.length,
      categories: [...new Set(a.flags.map((f) => CATEGORY_NAMES[f.categoryId]))],
      lang: a.language,
      region: SLUG_REGION[a.article.slug] ?? "",
    }))
    .filter((e) => e.region !== "");

  const flags = heroFlags(all);

  return (
    <>
      <header className="mast">
        <span className="disp">Decolonize.wiki</span>
        <span className="mono">
          Open methodology · <em>{version}</em> · CC BY-SA
        </span>
      </header>

      <main id="main">
      <section className="hero">
        <HeroArtSlider lang={lang} />
        <h1 className="disp">
          {"Discovered"}
          <span className="q">?</span>
        </h1>
        <p>
          Wikipedia still says it. We read the world's encyclopedia line by
          line, against a public methodology built on a century of decolonial
          thought — <b>and publish the receipts.</b>
        </p>
        <p>
          <Link href="#library" className="cta">
            Open the archive →
          </Link>
        </p>
        <p className="hero-artlink mono">
          <Link href={`/${lang}/art`}>The art of resistance →</Link>
        </p>
      </section>

      <div className="stats">
        <div>
          <div className="n">{latest.length}</div>
          <div className="l">Articles analyzed</div>
        </div>
        <div>
          <div className="n">{flagsTotal}</div>
          <div className="l">Flags published</div>
        </div>
        <div>
          <div className="n">{categories.size}</div>
          <div className="l">Categories in use</div>
        </div>
        <div>
          <div className="n">{version}</div>
          <div className="l">Methodology</div>
        </div>
      </div>

      <section className="paper" id="library">
        <div className="eyebrow-p">
          <span>The archive</span>
          <span>Every quote verbatim · pinned revisions</span>
        </div>
        <h2>The archive.</h2>
        <Library entries={entries} />
        <p className="request">
          <a href={REQUEST_URL} className="mono">
            Request an article →
          </a>
        </p>
        <p className="request-copy">
          Pick the next articles: open a request — most-👍 goes first.
        </p>
      </section>

      <section className="atlas-section" id="atlas">
        <div className="eyebrow-a">
          <span>The atlas</span>
          <span>Maps articles, not borders</span>
        </div>
        <h2 className="disp">The record, mapped.</h2>
        <HomeHero flags={flags} atlasEntries={atlasEntries} />
      </section>

      <section className="signup" id="signup">
        <h2 className="disp">Get the digest</h2>
        <p className="mono">
          Occasional digest of new analyses. Unsubscribe anytime, no tracking pixels.
        </p>
        <EmailForm />
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
