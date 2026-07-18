import { artById, creditLine } from "../lib/art/collection";
import { ART_DIMS } from "../lib/art/manifest";

// Server component: static markup only. Art is content — real alt text and a
// provenance credit on every piece (spec requirement).
export function ArtFigure({
  id,
  sizes = "(max-width:760px) 92vw, 44vw",
}: {
  id: string;
  sizes?: string;
}) {
  const e = artById(id); // throws on typo — fails the static build loudly
  const d = ART_DIMS[id];
  if (!d) return null; // variants not generated yet: render nothing, not a broken img
  return (
    <figure className="artfig">
      <img
        src={`/art/${id}-${d.widths[0]}.webp`}
        srcSet={d.widths.map((w) => `/art/${id}-${w}.webp ${w}w`).join(", ")}
        sizes={sizes}
        width={d.w}
        height={d.h}
        loading="lazy"
        decoding="async"
        alt={e.alt}
      />
      <figcaption className="mono">{creditLine(e)}</figcaption>
    </figure>
  );
}
