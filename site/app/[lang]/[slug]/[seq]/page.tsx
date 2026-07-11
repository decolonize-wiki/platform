import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllAnalyses,
  getLiveQuoteChecks,
  getLiveRevisionIds,
} from "../../../../lib/cached";
import { latestFor } from "../../../../lib/data";
import { analysisKey } from "../../../../lib/live-quotes";
import { AnalysisView } from "../../../../components/AnalysisView";
import { JsonLd } from "../../../../components/JsonLd";
import { analysisJsonLd } from "../../../../lib/structured-data";

const SITE = "https://decolonize.wiki";

type Params = { lang: string; slug: string; seq: string };

export const dynamicParams = false;

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
    title: `${analysis.article.title} — decolonial analysis #${analysis.sequence}`,
    description: firstSentence,
    alternates: {
      canonical: isLatest
        ? `/${p.lang}/${p.slug}`
        : `/${p.lang}/${p.slug}/${p.seq}`,
    },
    openGraph: { type: "article" },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const { all, analysis } = await find(p);
  if (!analysis) notFound();
  const latest = latestFor(all, p.lang, p.slug);
  const latestSeq = latest?.sequence ?? analysis.sequence;
  const live = await getLiveRevisionIds();
  const checks = await getLiveQuoteChecks();
  const isLatest = latest?.sequence === analysis.sequence;
  const pageUrl = isLatest
    ? `${SITE}/${p.lang}/${p.slug}`
    : `${SITE}/${p.lang}/${p.slug}/${p.seq}`;
  const imageUrl = `${SITE}/${p.lang}/${p.slug}/${p.seq}/opengraph-image`;
  return (
    <>
      {analysisJsonLd(analysis, pageUrl, imageUrl).map((ld, i) => (
        <JsonLd key={i} data={ld} />
      ))}
      <AnalysisView
        analysis={analysis}
        liveRevisionId={live.get(analysis.article.title)}
        missingFlagIds={checks.get(analysisKey(analysis))}
        latestSeq={latestSeq}
      />
    </>
  );
}
