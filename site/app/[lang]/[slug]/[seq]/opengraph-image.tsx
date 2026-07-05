import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getAllAnalyses } from "../../../../lib/cached";
import { findAnalysis } from "../../../../lib/card-data";
import { buildAttribution } from "../../../../lib/card-attribution";
import { CATEGORY_NAMES } from "../../../../components/FlagBlock";
import type { Analysis } from "@schema/analysis";

export const alt = "decolonize.wiki analysis verdict card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender the card at build time (params inherited from the route segment's
// generateStaticParams) so it never reads the data repo at request time on
// Vercel, where env-driven fs reads aren't file-traced into the function bundle.
export const dynamic = "force-static";

type Params = { lang: string; slug: string; seq: string };
type CategoryId = Analysis["flags"][number]["categoryId"];

const BLACK = "#0d0d0d";
const PAPER = "#f4f2ec";
const HOT = "#ff3b1f";

export default async function Image({ params }: { params: Promise<Params> }) {
  const p = await params;
  const all = await getAllAnalyses();
  const analysis = findAnalysis(all, p);
  if (!analysis) notFound();
  const flagCount = analysis.flags.length;
  const title = analysis.article.title;
  const categories = [
    ...new Set(analysis.flags.map((f) => f.categoryId)),
  ] as CategoryId[];
  const attribution = buildAttribution({
    title,
    lang: p.lang,
    slug: p.slug,
    seq: p.seq,
    medium: "og",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: BLACK,
          color: PAPER,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px 40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: HOT,
                fontWeight: 800,
              }}
            >
              decolonize.wiki
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: title.length > 22 ? 96 : 128,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: -3,
                textTransform: "uppercase",
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
            <div
              style={{
                display: "flex",
                fontSize: 200,
                lineHeight: 0.85,
                fontWeight: 800,
                color: HOT,
                letterSpacing: -6,
              }}
            >
              {flagCount}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                paddingBottom: 22,
              }}
            >
              {flagCount === 0 ? "Clean — 0 flags" : flagCount === 1 ? "Flag" : "Flags"}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {categories.map((c) => (
              <div
                key={c}
                style={{
                  display: "flex",
                  border: `2px solid ${PAPER}`,
                  borderRadius: 4,
                  padding: "8px 16px",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {CATEGORY_NAMES[c]}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            borderTop: `2px solid ${HOT}`,
            padding: "18px 64px",
            fontSize: 22,
            fontFamily: "monospace",
            color: PAPER,
          }}
        >
          {attribution}
        </div>
      </div>
    ),
    { ...size },
  );
}
