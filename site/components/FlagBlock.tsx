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

export function FlagBlock({ flag, index }: { flag: Flag; index: number }) {
  const disputeUrl = `https://github.com/decolonize-wiki/methodology/issues/new?title=${encodeURIComponent(`Dispute: ${flag.id}`)}&labels=dispute`;
  const strikeWhole = wordCount(flag.quote) <= 6;
  return (
    <article className="flagblock" id={flag.id}>
      <blockquote className="quote">
        {"“"}
        {flag.anchorBefore ? <span className="anch">{flag.anchorBefore}</span> : null}
        {strikeWhole ? <Strike term={flag.quote} /> : flag.quote}
        {flag.anchorAfter ? <span className="anch">{flag.anchorAfter}</span> : null}
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
