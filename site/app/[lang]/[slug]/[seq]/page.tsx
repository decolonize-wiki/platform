import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadAllAnalyses, latestFor } from "../../../../lib/data";
import { liveRevisionIds } from "../../../../lib/freshness";
import { AnalysisView } from "../../../../components/AnalysisView";

type Params = { lang: string; slug: string; seq: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await loadAllAnalyses();
  return all.map((a) => ({
    lang: a.language,
    slug: a.article.slug,
    seq: String(a.sequence),
  }));
}

async function find(params: Params) {
  const all = await loadAllAnalyses();
  const analysis = all.find(
    (a) =>
      a.language === params.lang &&
      a.article.slug === params.slug &&
      String(a.sequence) === params.seq,
  );
  return { all, analysis };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const p = await params;
  const { analysis } = await find(p);
  if (!analysis) return {};
  const firstSentence =
    analysis.summary.paragraph.match(/^.*?[.!?](?=\s|$)/)?.[0] ??
    analysis.summary.paragraph;
  return {
    title: `${analysis.article.title} — decolonize.wiki analysis #${analysis.sequence}`,
    description: firstSentence,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { all, analysis } = await find(p);
  if (!analysis) notFound();
  const latest = latestFor(all, p.lang, p.slug);
  const latestSeq = latest?.sequence ?? analysis.sequence;
  const live = await liveRevisionIds([analysis.article.title]);
  return (
    <AnalysisView
      analysis={analysis}
      liveRevisionId={live.get(analysis.article.title)}
      latestSeq={latestSeq}
    />
  );
}
