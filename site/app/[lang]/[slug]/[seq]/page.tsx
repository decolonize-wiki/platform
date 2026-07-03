import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAnalyses, getLiveRevisionIds } from "../../../../lib/cached";
import { latestFor } from "../../../../lib/data";
import { AnalysisView } from "../../../../components/AnalysisView";

type Params = { lang: string; slug: string; seq: string };

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllAnalyses();
  return all.map((a) => ({
    lang: a.language,
    slug: a.article.slug,
    seq: String(a.sequence),
  }));
}

async function find(params: Params) {
  const all = await getAllAnalyses();
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
  const { all, analysis } = await find(p);
  if (!analysis) return {};
  const firstSentence =
    analysis.summary.paragraph.match(/^.*?[.!?](?=\s|$)/)?.[0] ??
    analysis.summary.paragraph;
  const isLatest =
    latestFor(all, p.lang, p.slug)?.sequence === analysis.sequence;
  return {
    title: `${analysis.article.title} — decolonize.wiki analysis #${analysis.sequence}`,
    description: firstSentence,
    alternates: {
      canonical: isLatest
        ? `/${p.lang}/${p.slug}`
        : `/${p.lang}/${p.slug}/${p.seq}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { all, analysis } = await find(p);
  if (!analysis) notFound();
  const latest = latestFor(all, p.lang, p.slug);
  const latestSeq = latest?.sequence ?? analysis.sequence;
  const live = await getLiveRevisionIds();
  return (
    <AnalysisView
      analysis={analysis}
      liveRevisionId={live.get(analysis.article.title)}
      latestSeq={latestSeq}
    />
  );
}
