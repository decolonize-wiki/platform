import { loadAllAnalyses } from "./data";
import { liveRevisionIds } from "./freshness";
import { liveQuoteChecks } from "./live-quotes";
import type { Analysis } from "@schema/analysis";

// Module-level promises memoize per build process, so the data repo is
// scanned once and the Wikipedia freshness API is hit with one batched call
// instead of once per page render.
let analysesPromise: Promise<Analysis[]> | undefined;
let livePromise: Promise<Map<string, number>> | undefined;
let checksPromise: Promise<Map<string, string[]>> | undefined;

export function getAllAnalyses(): Promise<Analysis[]> {
  analysesPromise ??= loadAllAnalyses();
  return analysesPromise;
}

export function getLiveRevisionIds(): Promise<Map<string, number>> {
  livePromise ??= getAllAnalyses().then((all) =>
    // Freshness is English-only until multi-language ships: liveRevisionIds hits
    // one Wikipedia host, so titles from other languages would resolve against
    // the wrong wiki. Restrict to en analyses rather than silently mis-mapping.
    liveRevisionIds([
      ...new Set(
        all.filter((a) => a.language === "en").map((a) => a.article.title),
      ),
    ]),
  );
  return livePromise;
}

// Keyed by analysisKey (lang/slug/seq) → flag ids whose quote no longer
// appears in the live article. Absent key = article unchanged or live text
// unavailable. English-only for the same reason as getLiveRevisionIds.
export function getLiveQuoteChecks(): Promise<Map<string, string[]>> {
  checksPromise ??= Promise.all([getAllAnalyses(), getLiveRevisionIds()]).then(
    ([all, live]) => liveQuoteChecks(all, live),
  );
  return checksPromise;
}
