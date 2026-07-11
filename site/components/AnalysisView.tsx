import Link from "next/link";
import type { Analysis } from "@schema/analysis";
import { FlagBlock, CATEGORY_NAMES } from "./FlagBlock";
import { Receipt } from "./Receipt";
import { RepoLink } from "./RepoLink";

export function AnalysisView({
  analysis,
  liveRevisionId,
  missingFlagIds,
  latestSeq,
}: {
  analysis: Analysis;
  liveRevisionId?: number;
  /** Flag ids whose quote no longer appears in the live article; undefined = not checked. */
  missingFlagIds?: string[];
  latestSeq: number;
}) {
  const { article, summary } = analysis;
  const total = analysis.flags.length;
  const missing = new Set(missingFlagIds ?? []);
  const counts = Object.entries(summary.flagCounts) as Array<
    [keyof typeof CATEGORY_NAMES, number]
  >;
  const superseded = analysis.sequence < latestSeq;
  const fetched = article.fetchedAt.slice(0, 10);

  return (
    <>
      <header className="mast">
        <Link href="/en" className="disp" style={{ textDecoration: "none" }}>
          Decolonize.wiki
        </Link>
        <span className="mono">
          Open methodology · <em>{analysis.methodologyVersion}</em> · CC BY-SA
        </span>
      </header>

      <main id="main">
      {superseded ? (
        <p className="banner mono" style={{ margin: 0 }}>
          Superseded —{" "}
          <Link href={`/${analysis.language}/${article.slug}`}>
            read the latest analysis
          </Link>
        </p>
      ) : null}

      <section className="hero">
        <div className="eyebrow">
          <span>Analysis №{analysis.sequence}</span>
          <span>
            Wikipedia · “{article.title}” · rev <em>{article.revisionId}</em>
          </span>
          <span>Fetched {fetched}</span>
          <span>Methodology {analysis.methodologyVersion}</span>
        </div>
        <h1 className="disp">{article.title}</h1>
        <p>
          <b>
            {total} {total === 1 ? "flag" : "flags"}. Read the receipts.
          </b>
        </p>
      </section>

      <div className="stats">
        <div>
          <div className="n">{total}</div>
          <div className="l">Flags published</div>
        </div>
        {counts.map(([id, n]) => (
          <div key={id}>
            <div className="n">{n}</div>
            <div className="l">{CATEGORY_NAMES[id]}</div>
          </div>
        ))}
      </div>

      <section className="paper">
        <div className="eyebrow-p">
          <span>The receipts</span>
          <span>Every quote verbatim from rev {article.revisionId}</span>
        </div>
        <h2>Read the evidence.</h2>
        <p className="lede-p">{summary.paragraph}</p>

        {counts.length > 0 ? (
          <div className="pills">
            {counts.map(([id, n]) => (
              <span className="pill" key={id}>
                {CATEGORY_NAMES[id]} <b>{n}</b>
              </span>
            ))}
          </div>
        ) : null}

        {analysis.flags.map((flag, i) => (
          <FlagBlock
            key={flag.id}
            flag={flag}
            index={i}
            lang={analysis.language}
            slug={article.slug}
            seq={String(analysis.sequence)}
            liveChanged={missing.has(flag.id)}
          />
        ))}

        {analysis.namingNote ? (
          <div className="naming-p">
            <b>On the name</b>
            {analysis.namingNote.text}
            <b style={{ marginTop: "14px" }}>Attestation</b>
            {analysis.namingNote.attestation}
          </div>
        ) : null}
      </section>

      {analysis.contextFacts && analysis.contextFacts.length > 0 ? (
        <section className="facts">
          <h2 className="disp">Context the article doesn’t give you.</h2>
          <ul>
            {analysis.contextFacts.map((f) => (
              <li key={f.sourceId + f.fact.slice(0, 20)}>
                {f.fact}
                <span className="src">Source · {f.sourceId}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Receipt
        analysis={analysis}
        liveRevisionId={liveRevisionId}
        missingFlagIds={missingFlagIds}
      />
      </main>

      <footer className="mfoot">
        <span>
          Methodology {analysis.methodologyVersion} · not affiliated with the
          Wikimedia Foundation
        </span>
        <span>
          We critique articles, not editors · quotes CC BY-SA · this page
          critiques rev {article.revisionId} — the live article may have changed{" "}
          <em>· CC BY-SA</em> · <RepoLink />
        </span>
      </footer>
    </>
  );
}
