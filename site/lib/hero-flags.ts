import type { Analysis } from "../../src/schema/analysis.js";

export type HeroFlag = { quote: string; rewrite: string; category: string; article: string };

// Deterministic (no Math.random): stable output keeps static builds reproducible.
export function heroFlags(analyses: Analysis[], limit = 40): HeroFlag[] {
  return analyses
    .filter((a) => a.language === "en" && a.status === "published")
    .flatMap((a) =>
      a.flags
        .filter((f) => f.quote && f.rewrite)
        .map((f) => ({
          quote: f.quote,
          rewrite: f.rewrite as string,
          category: f.categoryId,
          article: a.article.title,
        })),
    )
    .sort((x, y) => (x.article + x.quote).localeCompare(y.article + y.quote))
    .slice(0, limit);
}
