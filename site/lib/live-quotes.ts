import { verifyQuotes } from "../../src/lib/verify-quotes.js";

const UA = "decolonize.wiki site build (https://github.com/decolonize-wiki/platform)";

// Structural subset of Analysis so tests don't need schema-valid fixtures.
export type AnalysisLike = {
  language: string;
  sequence: number;
  article: { title: string; slug: string; revisionId: number };
  flags: ReadonlyArray<{ id: string; quote: string }>;
};

export function analysisKey(a: AnalysisLike): string {
  return `${a.language}/${a.article.slug}/${a.sequence}`;
}

// TextExtracts caps whole-page extracts at one page per request, so live text
// is fetched per title. Same params as the pinned fetch (src/lib/wikipedia.ts)
// so quotes are compared against the identical text format.
async function liveExtract(title: string, lang: string): Promise<string | undefined> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "extracts",
    explaintext: "1",
    redirects: "1",
    titles: title,
  });
  try {
    const res = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`, {
      headers: { "user-agent": UA },
    });
    if (!res.ok) return undefined;
    const body = (await res.json()) as {
      query?: { pages?: Array<{ extract?: string }> };
    };
    return body.query?.pages?.[0]?.extract;
  } catch {
    return undefined;
  }
}

/**
 * For each analysis whose article has been edited since its pinned revision,
 * re-verify every flag's quote against the live extract. Returns a map from
 * analysisKey to the flag ids whose quotes no longer appear verbatim (empty
 * array = every flagged passage still present). Analyses whose live text
 * could not be fetched are absent, so the UI falls back to the plain
 * "changed since this analysis" notice instead of claiming anything.
 */
export async function liveQuoteChecks(
  analyses: ReadonlyArray<AnalysisLike>,
  liveRevisionIds: Map<string, number>,
  lang = "en",
): Promise<Map<string, string[]>> {
  const changed = analyses.filter((a) => {
    if (a.language !== lang) return false;
    const live = liveRevisionIds.get(a.article.title);
    return live !== undefined && live !== a.article.revisionId;
  });
  const extracts = new Map<string, string>();
  await Promise.all(
    [...new Set(changed.map((a) => a.article.title))].map(async (title) => {
      const extract = await liveExtract(title, lang);
      if (extract !== undefined) extracts.set(title, extract);
    }),
  );
  const map = new Map<string, string[]>();
  for (const a of changed) {
    const extract = extracts.get(a.article.title);
    if (extract === undefined) continue;
    const missing = verifyQuotes(extract, a.flags)
      .filter((r) => !r.found)
      .map((r) => r.id);
    map.set(analysisKey(a), missing);
  }
  return map;
}
