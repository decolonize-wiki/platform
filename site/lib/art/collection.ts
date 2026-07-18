// The curated Tier-1 art collection. Hand-written and deliberately small:
// coverage is not the goal, potency is (see the 2026-07-13 design spec, Part 2).
// Variants on disk are generated from this file by `npm run build-art`.

export type ArtEntry = {
  id: string; // slug; variant files are /art/<id>-<width>.webp
  title: string;
  year: string; // "1968" or "c. 1971"
  source: "NMAAHC";
  objectNumber: string; // Smithsonian accession, e.g. "2015.97.27.39"
  license: "CC0";
  alt: string;
  context: string; // 2–3 sentences of verified historical context, shown on the art page
  regions: string[];
  themes: string[];
  idsId?: string; // IDS delivery id, recorded so re-runs don't depend on the rate-limited search API
};

export const ART_COLLECTION: ArtEntry[] = [
  {
    id: "free-huey-1968",
    title: "Free Huey rally poster",
    year: "1968",
    source: "NMAAHC",
    objectNumber: "2019.28.20",
    license: "CC0",
    alt: "Poster for the 1968 Free Huey rally at De Fremery Park in Oakland, demanding the release of Black Panther Party co-founder Huey P. Newton",
    context:
      "When Black Panther Party co-founder Huey P. Newton stood trial in 1968, the party turned his defense into a national campaign. This poster calls supporters to a Free Huey rally at De Fremery Park in Oakland — with Eldridge Cleaver, Bobby Seale and Stokely Carmichael among the billed speakers.",
    regions: ["north-america"],
    themes: ["black-power", "political-prisoners"],
    idsId: "NMAAHC-2019_28_20_001",
  },
  {
    id: "honor-king-1968",
    title: "Honor King: End Racism placard",
    year: "1968",
    source: "NMAAHC",
    objectNumber: "2017.71.5",
    license: "CC0",
    alt: "Placard reading HONOR KING: END RACISM, carried by Arthur J. Schmidt in the 1968 Memphis march for Dr. King, held in support of the sanitation workers' strike",
    context:
      "Dr. Martin Luther King Jr. came to Memphis to stand with the city's striking Black sanitation workers, and was assassinated there on April 4, 1968. Days later, marchers carried placards like this one through Memphis alongside the strike's famous I AM A MAN signs.",
    regions: ["north-america"],
    themes: ["civil-rights", "labor"],
    idsId: "NMAAHC-2017_71_5_001",
  },
  {
    id: "mpla-anniversary-1975",
    title: "MPLA 19th anniversary flier",
    year: "1975",
    source: "NMAAHC",
    objectNumber: "2015.97.27.62",
    license: "CC0",
    alt: "Flier commemorating the 19th anniversary of the MPLA, Angola's liberation movement, illustrated with two MPLA members and issued in New York City, December 1975",
    context:
      "Weeks after Angola declared independence from Portugal in November 1975, New York solidarity organizers marked nineteen years of the MPLA, the movement that had fought the colonial war. The program promised a history of the struggle and an analysis of the forces still ranged against it — including the United States, apartheid South Africa, and the rival FNLA and UNITA.",
    regions: ["africa"],
    themes: ["anti-colonial-liberation", "solidarity"],
    idsId: "NMAAHC-2015_97_27_62_001",
  },
  {
    id: "young-lords-1971",
    title: "Young Lords Party: Health, Food, Housing, Education",
    year: "c. 1971",
    source: "NMAAHC",
    objectNumber: "2018.35.3",
    license: "CC0",
    alt: "Young Lords Party poster stacking four illustrated rifles labeled Health, Food, Housing, and Education above the party's insignia, circa 1971",
    context:
      "The Young Lords grew from a Chicago street organization into a revolutionary party of Puerto Rican youth, running free-breakfast programs and health clinics in New York while demanding self-determination for Puerto Rico. This poster renders their platform — health, food, housing, education — as the weapons of the struggle.",
    regions: ["north-america", "caribbean"],
    themes: ["self-determination", "community-organizing"],
    idsId: "NMAAHC-2018_35_3_001",
  },
  {
    id: "negro-exposition-1940",
    title: "American Negro Exposition poster",
    year: "1940",
    source: "NMAAHC",
    objectNumber: "2015.178",
    license: "CC0",
    alt: "Poster for the 1940 American Negro Exposition in Chicago, marking 75 years of Black achievement since emancipation",
    context:
      "Chicago's American Negro Exposition of 1940 marked seventy-five years since emancipation with a Black-organized fair of art, science, industry and history — Black achievement presented on Black terms, decades before mainstream institutions would make room for it.",
    regions: ["north-america"],
    themes: ["black-achievement", "public-memory"],
    idsId: "NMAAHC-CE95F87171C92_2001",
  },
  {
    id: "naacp-broadside-1922",
    title: "For the Good of America (NAACP broadside)",
    year: "1922",
    source: "NMAAHC",
    objectNumber: "2011.57.9",
    license: "CC0",
    alt: "NAACP anti-lynching broadside headed 'For the Good of America,' documenting 3,436 people lynched in the United States from 1889 to 1922",
    context:
      "The NAACP bought newspaper space to publish the arithmetic of lynching — 3,436 people killed between 1889 and 1922 — while pressing for the Dyer Anti-Lynching Bill, which passed the House only to die by filibuster in the Senate. Publishing the receipts is an old tactic; this site stands in that lineage.",
    regions: ["north-america"],
    themes: ["anti-lynching", "documentation"],
    idsId: "NMAAHC-2011_57_9_001",
  },
];

export function artById(id: string): ArtEntry {
  const e = ART_COLLECTION.find((a) => a.id === id);
  if (!e) throw new Error(`unknown art id: ${id}`);
  return e;
}

export function creditLine(e: ArtEntry): string {
  return `${e.title}, ${e.year} · NMAAHC ${e.objectNumber} · CC0`;
}

export function objectUrl(e: ArtEntry): string {
  return `https://nmaahc.si.edu/object/nmaahc_${e.objectNumber}`;
}
