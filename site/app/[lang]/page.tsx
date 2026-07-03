import type { Metadata } from "next";
import Link from "next/link";
import { getAllAnalyses } from "../../lib/cached";
import { latestFor } from "../../lib/data";
import { CATEGORY_NAMES } from "../../components/FlagBlock";
import { Library } from "../../components/Library";
import type { Analysis } from "@schema/analysis";

const MISSION =
  "Wikipedia still says it. We read the world's encyclopedia line by line, against a public methodology built on a century of decolonial thought — and publish the receipts.";

type Params = { lang: string };

export function generateStaticParams(): Params[] {
  return [{ lang: "en" }];
}

export const metadata: Metadata = {
  title: "decolonize.wiki — the receipts on colonial framing",
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
  const version = latest[0]?.methodologyVersion ?? "v0.1";

  const entries = latest.map((a) => ({
    title: a.article.title,
    slug: a.article.slug,
    lang: a.language,
    seq: a.sequence,
    flagCount: a.flags.length,
    categories: [...new Set(a.flags.map((f) => CATEGORY_NAMES[f.categoryId]))],
  }));

  return (
    <>
      <header className="mast">
        <span className="disp">Decolonize.wiki</span>
        <span className="mono">
          Open methodology · <em>{version}</em> · CC BY-SA
        </span>
      </header>

      <section className="hero">
        <h1 className="disp">
          {"Disco­vered"}
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
      </section>

      <div className="stats">
        <div>
          <div className="n">{latest.length}</div>
          <div className="l">Analyses published</div>
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
      </section>

      <footer className="mfoot">
        <span>An open project · AGPL / CC BY-SA</span>
        <span>
          Not affiliated with the Wikimedia Foundation · analyses critique
          articles, not editors
        </span>
        <a href="https://github.com/sponsors">Donate</a>
      </footer>
    </>
  );
}
