import { ImageResponse } from "next/og";
import { getAllAnalyses } from "../../../../../../lib/cached";
import { CATEGORY_NAMES } from "../../../../../../components/FlagBlock";

type Params = { lang: string; slug: string; seq: string; flagId: string };

const BLACK = "#0d0d0d";
const PAPER = "#f4f2ec";
const HOT = "#ff3b1f";

// Prerender one card per flag at build time so this GET handler never reads the
// data repo at request time on Vercel, where env-driven fs reads aren't
// file-traced into the function bundle.
export const dynamic = "force-static";

export async function generateStaticParams(): Promise<Params[]> {
  const all = await getAllAnalyses();
  return all.flatMap((a) =>
    a.flags.map((f) => ({
      lang: a.language,
      slug: a.article.slug,
      seq: String(a.sequence),
      flagId: f.id,
    })),
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> },
) {
  const p = await params;
  const all = await getAllAnalyses();
  const analysis = all.find(
    (a) =>
      a.language === p.lang &&
      a.article.slug === p.slug &&
      String(a.sequence) === p.seq,
  );
  const flag = analysis?.flags.find((f) => f.id === p.flagId);
  if (!analysis || !flag) {
    return Response.json({ error: "flag not found" }, { status: 404 });
  }

  const index = analysis.flags.indexOf(flag);
  const attribution = `${analysis.article.title} · text: Wikipedia, CC BY-SA · decolonize.wiki/${p.lang}/${p.slug}/${p.seq}?utm_source=card&utm_medium=flag`;

  const quoteSize =
    flag.quote.length > 280 ? 40 : flag.quote.length > 140 ? 52 : 68;
  const rewriteSize =
    flag.rewrite.length > 180 ? 30 : flag.rewrite.length > 100 ? 34 : 40;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: PAPER,
          color: BLACK,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "sans-serif",
              color: BLACK,
            }}
          >
            {`Flag ${index + 1} of ${analysis.flags.length} · ${CATEGORY_NAMES[flag.categoryId]}`}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: quoteSize,
              lineHeight: 1.15,
              textDecoration: "line-through",
              textDecorationColor: HOT,
            }}
          >
            {`“${flag.quote}”`}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                fontFamily: "sans-serif",
                color: HOT,
              }}
            >
              Rewrite
            </div>
            <div
              style={{
                display: "flex",
                backgroundColor: HOT,
                color: BLACK,
                padding: "24px 28px",
                fontSize: rewriteSize,
                lineHeight: 1.2,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
              }}
            >
              {flag.rewrite}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            borderTop: `2px solid ${BLACK}`,
            padding: "18px 72px",
            fontSize: 20,
            fontFamily: "monospace",
            color: BLACK,
          }}
        >
          {attribution}
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  );
}
