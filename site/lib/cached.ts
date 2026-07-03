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
    liveRevisionIds([...new Set(all.map((a) => a.article.title))]),
  );
  return livePromise;
}
