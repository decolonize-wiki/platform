import type { Analysis } from "@schema/analysis";
import { Strike } from "./Strike";

type Flag = Analysis["flags"][number];

export const CATEGORY_NAMES: Record<Flag["categoryId"], string> = {
  "discovery-framing": "Discovery framing",
  "agentless-passive": "Agentless passive",
  euphemism: "Euphemism",
  "one-sided-sourcing": "One-sided sourcing",
  "pre-contact-erasure": "Pre-contact erasure",
  "toponymic-colonialism": "Toponymic colonialism",
};

function wordCount(s: string): number {
  return s.trim().split(/\s+/).length;
}

// Anchors are contiguous slices of the source with boundary whitespace dropped,
// so most junctions need a space restored — except where the next slice opens
// with attaching punctuation (e.g. anchorAfter ", and…") or the previous slice
// ends with an opening bracket/quote, where the source had none.
const OPENS = new Set(["(", "[", "{", "“", "‘", "¿", "¡"]);
const CLOSES = new Set([",", ".", ";", ":", "!", "?", ")", "]", "}", "”", "’", "…", "%"]);
function junction(prev: string, next: string): string {
  if (!prev || !next) return "";
  if (CLOSES.has(next[0]) || OPENS.has(prev[prev.length - 1])) return "";
  return " ";
}

export function FlagBlock({ flag, index }: { flag: Flag; index: number }) {
  const disputeUrl = `https://github.com/decolonize-wiki/methodology/issues/new?title=${encodeURIComponent(`Dispute: ${flag.id}`)}&labels=dispute`;
  // .struck is white-space:nowrap (the animated strike line must not wrap),
  // so only short quotes can be struck whole without overflowing on phones.
  const strikeWhole = wordCount(flag.quote) <= 6;
  const beforeGap = junction(flag.anchorBefore, flag.quote);
  const afterGap = junction(flag.quote, flag.anchorAfter);
  return (
    <article className="flagblock" id={flag.id}>
      <blockquote className="quote">
        {"“"}
        {flag.anchorBefore ? (
          <>
            <span className="anch">{flag.anchorBefore}</span>
            {beforeGap}
          </>
        ) : null}
        {strikeWhole ? <Strike term={flag.quote} /> : flag.quote}
        {flag.anchorAfter ? (
          <>
            {afterGap}
            <span className="anch">{flag.anchorAfter}</span>
          </>
        ) : null}
        {"”"}
      </blockquote>
      <div className="flagline">
        <b>
          Flag {index + 1} · {CATEGORY_NAMES[flag.categoryId]}
        </b>
        <a href={disputeUrl}>dispute this flag</a>
      </div>
      <p className="why">{flag.explanation}</p>
      <div className="rw">
        <b>Suggested rewrite</b>
        <span>{flag.rewrite}</span>
      </div>
    </article>
  );
}
