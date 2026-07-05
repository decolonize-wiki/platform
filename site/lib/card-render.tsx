import type { Analysis } from "@schema/analysis";
import { CATEGORY_NAMES } from "./categories";
import { splitQuoteForStrike, strikeTokens } from "./card-strike";
import { buildAttribution } from "./card-attribution";

type Flag = Analysis["flags"][number];

export const BLACK = "#0d0d0d";
export const PAPER = "#f4f2ec";
export const HOT = "#ff3b1f";

export type CardFormat = {
  medium: "post" | "story" | "square";
  size: { width: number; height: number };
  padding: string;
  eyebrowSize: number;
  quoteBucket: (len: number) => number;
  rewriteBucket: (len: number) => number;
  footerSize: number;
};

// Length-bucketed font sizing, not measured/clamped text — the pattern
// established by the original 1080×1350 card (see CLAUDE.md's Satori
// pitfall). Buckets are hand-tuned seeds per canvas, finalized against
// rendered PNGs (verification step), not derived from a formula.
export const CARD_FORMATS: Record<CardFormat["medium"], CardFormat> = {
  post: {
    medium: "post",
    size: { width: 1080, height: 1350 },
    padding: "64px 72px 48px",
    eyebrowSize: 24,
    quoteBucket: (len) => (len > 280 ? 40 : len > 140 ? 52 : 68),
    rewriteBucket: (len) => (len > 180 ? 30 : len > 100 ? 34 : 40),
    footerSize: 20,
  },
  story: {
    medium: "story",
    size: { width: 1080, height: 1920 },
    padding: "120px 80px 72px",
    eyebrowSize: 28,
    quoteBucket: (len) => (len > 320 ? 48 : len > 160 ? 64 : 84),
    rewriteBucket: (len) => (len > 180 ? 34 : len > 100 ? 40 : 48),
    footerSize: 22,
  },
  square: {
    medium: "square",
    size: { width: 1080, height: 1080 },
    padding: "56px 64px 44px",
    eyebrowSize: 22,
    quoteBucket: (len) => (len > 240 ? 36 : len > 120 ? 46 : 60),
    rewriteBucket: (len) => (len > 180 ? 26 : len > 100 ? 30 : 36),
    footerSize: 18,
  },
};

export function renderFlagCard(args: {
  flag: Flag;
  index: number;
  total: number;
  analysis: Analysis;
  lang: string;
  slug: string;
  seq: string;
  format: CardFormat;
}) {
  const { flag, index, total, analysis, lang, slug, seq, format } = args;
  const quoteSize = format.quoteBucket(flag.quote.length);
  const rewriteSize = format.rewriteBucket(flag.rewrite.length);
  const strike = splitQuoteForStrike(flag);
  const attribution = buildAttribution({
    title: analysis.article.title,
    lang,
    slug,
    seq,
    medium: format.medium,
  });

  return (
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
          padding: format.padding,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: format.eyebrowSize,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "sans-serif",
            color: BLACK,
          }}
        >
          {`Flag ${index + 1} of ${total} · ${CATEGORY_NAMES[flag.categoryId]}`}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontSize: quoteSize,
            lineHeight: 1.15,
          }}
        >
          {strike.kind === "whole" ? (
            <span style={{ textDecoration: "line-through", textDecorationColor: HOT }}>
              {`“${flag.quote}”`}
            </span>
          ) : (
            // One span per word: Satori treats flex siblings as blocks, so
            // multi-word spans don't reflow around the stamp (see strikeTokens).
            strikeTokens(strike).map((tok, i) => (
              <span
                key={i}
                style={
                  tok.kind === "struck"
                    ? {
                        textDecoration: "line-through",
                        textDecorationColor: HOT,
                        marginRight: Math.round(quoteSize * 0.3),
                      }
                    : tok.kind === "stamp"
                      ? {
                          backgroundColor: HOT,
                          color: BLACK,
                          fontFamily: "'Arial Narrow',Haettenschweiler,Impact,sans-serif",
                          fontStyle: "normal",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          transform: "rotate(-1.5deg)",
                          padding: "0 0.25em",
                          marginRight: Math.round(quoteSize * 0.3),
                        }
                      : { marginRight: Math.round(quoteSize * 0.3) }
                }
              >
                {tok.text}
              </span>
            ))
          )}
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
          fontSize: format.footerSize,
          fontFamily: "monospace",
          color: BLACK,
        }}
      >
        {attribution}
      </div>
    </div>
  );
}
