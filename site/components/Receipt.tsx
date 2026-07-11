import type { Analysis } from "@schema/analysis";

export function Receipt({
  analysis,
  liveRevisionId,
  missingFlagIds,
}: {
  analysis: Analysis;
  liveRevisionId?: number;
  /** Flag ids whose quote no longer appears in the live article; undefined = not checked. */
  missingFlagIds?: string[];
}) {
  const { article } = analysis;
  const changed =
    liveRevisionId !== undefined && liveRevisionId !== article.revisionId;
  const total = analysis.flags.length;
  return (
    <section className="receipt mono">
      {changed ? (
        <p className="banner">
          {missingFlagIds === undefined || total === 0 ? (
            <>
              This article has changed since this analysis (live revision{" "}
              {liveRevisionId}).
            </>
          ) : missingFlagIds.length === 0 ? (
            <>
              Edited since this analysis (live revision {liveRevisionId}) —
              every flagged passage is still present.
            </>
          ) : (
            <>
              Edited since this analysis — {total - missingFlagIds.length} of{" "}
              {total} flagged {total === 1 ? "passage" : "passages"} still
              present. {missingFlagIds.length} may have been addressed.
            </>
          )}
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
