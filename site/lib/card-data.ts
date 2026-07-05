import type { Analysis } from "../../src/schema/analysis.js";

type Flag = Analysis["flags"][number];
type CardParams = { lang: string; slug: string; seq: string };

export function findAnalysis(
  all: Analysis[],
  p: CardParams,
): Analysis | undefined {
  return all.find(
    (a) =>
      a.language === p.lang &&
      a.article.slug === p.slug &&
      String(a.sequence) === p.seq,
  );
}

export function findFlag(analysis: Analysis, flagId: string): Flag | undefined {
  return analysis.flags.find((f) => f.id === flagId);
}

export function flagCardParams(
  all: Analysis[],
): Array<{ lang: string; slug: string; seq: string; flagId: string }> {
  return all.flatMap((a) =>
    a.flags.map((f) => ({
      lang: a.language,
      slug: a.article.slug,
      seq: String(a.sequence),
      flagId: f.id,
    })),
  );
}
