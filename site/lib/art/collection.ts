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
  regions: string[];
  themes: string[];
};

export const ART_COLLECTION: ArtEntry[] = [
  {
    id: "free-huey-1968",
    title: "Free Huey rally poster",
    year: "1968",
    source: "NMAAHC",
    objectNumber: "2019.28.20",
    license: "CC0",
    alt: "Poster for a 1968 Free Huey rally at the Oakland Auditorium, demanding the release of Black Panther Party co-founder Huey P. Newton",
    regions: ["north-america"],
    themes: ["black-power", "political-prisoners"],
  },
  {
    id: "honor-king-1968",
    title: "Honor King: End Racism! placard",
    year: "1968",
    source: "NMAAHC",
    objectNumber: "2017.71.5",
    license: "CC0",
    alt: "Placard reading HONOR KING: END RACISM!, carried in the 1968 Memphis sanitation workers' strike after Dr. King's assassination",
    regions: ["north-america"],
    themes: ["civil-rights", "labor"],
  },
  {
    id: "vitoria-e-certa-1976",
    title: "A Vitória é Certa (MPLA)",
    year: "1976",
    source: "NMAAHC",
    objectNumber: "2015.97.27.39",
    license: "CC0",
    alt: "Poster supporting Angola's MPLA declaring 'A Vitória é Certa' — victory is certain — from the anti-colonial liberation struggle, 1976",
    regions: ["africa"],
    themes: ["anti-colonial-liberation", "solidarity"],
  },
  {
    id: "young-lords-1971",
    title: "Young Lords Party poster",
    year: "c. 1971",
    source: "NMAAHC",
    objectNumber: "2018.35.3",
    license: "CC0",
    alt: "Young Lords Party poster calling for Puerto Rican self-determination, circa 1971",
    regions: ["north-america", "caribbean"],
    themes: ["self-determination", "community-organizing"],
  },
  {
    id: "negro-exposition-1940",
    title: "American Negro Exposition poster",
    year: "1940",
    source: "NMAAHC",
    objectNumber: "2015.178",
    license: "CC0",
    alt: "Poster for the 1940 American Negro Exposition in Chicago, marking 75 years of Black achievement since emancipation",
    regions: ["north-america"],
    themes: ["black-achievement", "public-memory"],
  },
  {
    id: "naacp-broadside-1922",
    title: "The Shame of America (NAACP broadside)",
    year: "1922",
    source: "NMAAHC",
    objectNumber: "2011.57.9",
    license: "CC0",
    alt: "NAACP broadside 'The Shame of America' documenting lynching statistics, published as a newspaper advertisement in 1922",
    regions: ["north-america"],
    themes: ["anti-lynching", "documentation"],
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
