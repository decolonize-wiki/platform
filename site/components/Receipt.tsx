import type { Analysis } from "@schema/analysis";

export function Receipt({
  analysis,
  liveRevisionId,
}: {
  analysis: Analysis;
  liveRevisionId?: number;
}) {
  const { article } = analysis;
  const changed =
    liveRevisionId !== undefined && liveRevisionId !== article.revisionId;
  return (
    <section className="receipt mono">
      {changed ? (
        <p className="banner">
          This article has changed since this analysis (live revision{" "}
          {liveRevisionId}).
        </p>
      ) : null}
      <ul>
        <li>
          Article · <a href={article.url}>{article.url}</a>
        </li>
        <li>Pinned revision · {article.revisionId}</li>
        <li>Fetched · {article.fetchedAt.slice(0, 10)}</li>
        <li>Methodology · {analysis.methodologyVersion}</li>
        <li>Status · {analysis.status}</li>
        <li>Flags · {analysis.flags.length}</li>
      </ul>
    </section>
  );
}
