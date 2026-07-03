import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllAnalyses, getLiveRevisionIds } from "../../../lib/cached";
import { latestFor } from "../../../lib/data";
import { AnalysisView } from "../../../components/AnalysisView";
import { JsonLd } from "../../../components/JsonLd";
import { analysisJsonLd } from "../../../lib/structured-data";

const SITE = "https://decolonize.wiki";

type Params = { lang: string; slug: string };

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllAnalyses();
  const seen = new Set<string>();
  const out: Params[] = [];
  for (const a of all) {
    if (a.status !== "published") continue;
    const key = `${a.language}/${a.article.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ lang: a.language, slug: a.article.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const p = await params;
  const analysis = latestFor(await getAllAnalyses(), p.lang, p.slug);
  if (!analysis) return {};
  const firstSentence =
    analysis.summary.paragraph.match(/^.*?[.!?](?=\s|$)/)?.[0] ??
    analysis.summary.paragraph;
  return {
    title: `${analysis.article.title} — decolonial analysis #${analysis.sequence}`,
    description: firstSentence,
    alternates: { canonical: `/${p.lang}/${p.slug}` },
    // the latest-alias segment has no opengraph-image.tsx of its own — point shares at the verdict card
    openGraph: {
      type: "article",
      images: [`/${p.lang}/${p.slug}/${analysis.sequence}/opengraph-image`],
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const analysis = latestFor(await getAllAnalyses(), p.lang, p.slug);
  if (!analysis) notFound();
  const live = await getLiveRevisionIds();
  const pageUrl = `${SITE}/${p.lang}/${p.slug}`;
  const imageUrl = `${SITE}/${p.lang}/${p.slug}/${analysis.sequence}/opengraph-image`;
  return (
    <>
      {analysisJsonLd(analysis, pageUrl, imageUrl).map((ld, i) => (
        <JsonLd key={i} data={ld} />
      ))}
      <AnalysisView
        analysis={analysis}
        liveRevisionId={live.get(analysis.article.title)}
        latestSeq={analysis.sequence}
      />
    </>
  );
}
