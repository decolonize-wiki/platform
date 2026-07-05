import type { Analysis } from "../../src/schema/analysis.js";

type Flag = Analysis["flags"][number];

export type QuoteStrike =
  | { kind: "term"; before: string; term: string; stamp: string; after: string }
  | { kind: "whole" };

// Cards always strike *something* — unlike FlagBlock.QuoteBody, which falls
// back to plain (unstruck) text for long no-strike quotes because the on-page
// .struck rule is white-space:nowrap. Cards have no nowrap constraint (the
// length-bucketed font sizes already fit the whole quote to the canvas), so
// the whole-quote strike stays the fallback here, including when flag.strike
// is present but its term isn't found in the quote (schema drift only —
// AnalysisSchema's superRefine makes this unreachable for valid data).
export function splitQuoteForStrike(flag: Flag): QuoteStrike {
  if (flag.strike) {
    const at = flag.quote.indexOf(flag.strike.term);
    if (at >= 0) {
      return {
        kind: "term",
        before: flag.quote.slice(0, at),
        term: flag.strike.term,
        stamp: flag.strike.stamp,
        after: flag.quote.slice(at + flag.strike.term.length),
      };
    }
  }
  return { kind: "whole" };
}

export type StrikeToken = { text: string; kind: "plain" | "struck" | "stamp" };

// Satori lays flex siblings out as blocks, not inline text — multi-word spans
// beside a stamp render as narrow columns with the stamp stretched to row
// height. The card therefore renders the quote as one wrapping flex row of
// per-word tokens; this produces that word list.
export function strikeTokens(s: Extract<QuoteStrike, { kind: "term" }>): StrikeToken[] {
  const words = (text: string) => text.split(/\s+/).filter(Boolean);

  // A term ending mid-word or followed directly by punctuation ("explored,")
  // would leave a floating fragment after the stamp; extend the strike over it.
  const termWords = words(s.term);
  let after = s.after;
  const glued = after.match(/^\S+/);
  if (glued) {
    termWords[termWords.length - 1] += glued[0];
    after = after.slice(glued[0].length);
  }

  const tokens: StrikeToken[] = [
    ...words(s.before).map((text) => ({ text, kind: "plain" as const })),
    ...termWords.map((text) => ({ text, kind: "struck" as const })),
    { text: s.stamp, kind: "stamp" },
    ...words(after).map((text) => ({ text, kind: "plain" as const })),
  ];

  tokens[0] = { ...tokens[0], text: `“${tokens[0].text}` };
  const last = tokens.length - 1;
  tokens[last] = { ...tokens[last], text: `${tokens[last].text}”` };
  return tokens;
}
