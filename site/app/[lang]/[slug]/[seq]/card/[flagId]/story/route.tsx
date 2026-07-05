import { ImageResponse } from "next/og";
import { getAllAnalyses } from "../../../../../../../lib/cached";
import { findAnalysis, findFlag, flagCardParams } from "../../../../../../../lib/card-data";
import { renderFlagCard, CARD_FORMATS } from "../../../../../../../lib/card-render";

type Params = { lang: string; slug: string; seq: string; flagId: string };

// Prerender one card per flag at build time so this GET handler never reads the
// data repo at request time on Vercel, where env-driven fs reads aren't
// file-traced into the function bundle.
export const dynamic = "force-static";

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllAnalyses();
  return flagCardParams(all);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const all = await getAllAnalyses();
  const analysis = findAnalysis(all, p);
  const flag = analysis && findFlag(analysis, p.flagId);
  if (!analysis || !flag) {
    return Response.json({ error: "flag not found" }, { status: 404 });
  }

  const index = analysis.flags.indexOf(flag);
  const format = CARD_FORMATS.story;

  return new ImageResponse(
    renderFlagCard({
      flag,
      index,
      total: analysis.flags.length,
      analysis,
      lang: p.lang,
      slug: p.slug,
      seq: p.seq,
      format,
    }),
    format.size,
  );
}
