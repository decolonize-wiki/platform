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
      <dl>
        <div>
          <dt>Article</dt>
          <dd>
            <a href={article.url}>{article.url}</a>
          </dd>
        </div>
        <div>
          <dt>Pinned revision</dt>
          <dd>{article.revisionId}</dd>
        </div>
        <div>
          <dt>Fetched</dt>
          <dd>{article.fetchedAt.slice(0, 10)}</dd>
        </div>
        <div>
          <dt>Methodology</dt>
          <dd>{analysis.methodologyVersion}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{analysis.status}</dd>
        </div>
        <div>
          <dt>Flags</dt>
          <dd>{analysis.flags.length}</dd>
        </div>
      </dl>
    </section>
  );
}
