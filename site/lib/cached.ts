import { loadAllAnalyses } from "./data";
import { liveRevisionIds } from "./freshness";
import type { Analysis } from "@schema/analysis";

// Module-level promises memoize per build process, so the data repo is
// scanned once and the Wikipedia freshness API is hit with one batched call
// instead of once per page render.
let analysesPromise: Promise<Analysis[]> | undefined;
let livePromise: Promise<Map<string, number>> | undefined;

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
