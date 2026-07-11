import type { Analysis } from "@schema/analysis";
import { Strike } from "./Strike";
import { ShareFlag } from "./ShareFlag";
import { CATEGORY_NAMES } from "../lib/categories";

export { CATEGORY_NAMES };

type Flag = Analysis["flags"][number];

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

// The quote body: a term-level strike (struck term + inline hot stamp for its
// replacement) when flag.strike is present; otherwise whole-quote strike for
// short quotes and plain text for long ones (.struck is nowrap, so a long whole
// quote would overflow on phones — term strikes are short, so always allowed).
function QuoteBody({ flag }: { flag: Flag }) {
  if (flag.strike) {
    const at = flag.quote.indexOf(flag.strike.term);
    if (at >= 0) {
      return (
        <>
          {flag.quote.slice(0, at)}
          <Strike term={flag.strike.term} />{" "}
          <span className="fix">{flag.strike.stamp}</span>
          {flag.quote.slice(at + flag.strike.term.length)}
        </>
      );
    }
  }
  return wordCount(flag.quote) <= 6 ? <Strike term={flag.quote} /> : <>{flag.quote}</>;
}

export function FlagBlock({
  flag,
  index,
  lang,
  slug,
  seq,
  liveChanged,
}: {
  flag: Flag;
  index: number;
  lang: string;
  slug: string;
  seq: string;
  /** True when this flag's quote no longer appears in the live article. */
  liveChanged?: boolean;
}) {
  const disputeUrl = `https://github.com/decolonize-wiki/methodology/issues/new?title=${encodeURIComponent(`Dispute: ${flag.id}`)}&labels=dispute`;
  const beforeGap = junction(flag.anchorBefore, flag.quote);
  const afterGap = junction(flag.quote, flag.anchorAfter);
  return (
    <article className="flagblock" id={flag.id}>
      <div className="flaghead">
        <span className="flagnum">{String(index + 1).padStart(2, "0")}</span>
        <span className="stamp">{CATEGORY_NAMES[flag.categoryId]}</span>
      </div>
      <blockquote className="quote">
        {"“"}
        {flag.anchorBefore ? (
          <>
            <span className="anch">{flag.anchorBefore}</span>
            {beforeGap}
          </>
        ) : null}
        <QuoteBody flag={flag} />
        {flag.anchorAfter ? (
          <>
            {afterGap}
            <span className="anch">{flag.anchorAfter}</span>
          </>
        ) : null}
        {"”"}
      </blockquote>
      <p className="why">{flag.explanation}</p>
      <div className="rw">
        <b>Suggested rewrite</b>
        <span>{flag.rewrite}</span>
      </div>
      <div className="flagline">
        {liveChanged ? (
          <span className="livenote">
            Passage changed in the live article — may have been addressed
          </span>
        ) : null}
        <a href={disputeUrl}>dispute this flag</a>
        <ShareFlag lang={lang} slug={slug} seq={seq} flagId={flag.id} articleSlug={slug} />
      </div>
    </article>
  );
}
