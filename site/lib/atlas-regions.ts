// The atlas is a STYLIZED 64x24 dot grid — it maps articles, not borders.
// A "region" is a loose patch of the grid that reads as roughly the right part
// of the world; cells are [row, colStart, colEnd] (inclusive), row 0 = north.
export type RegionCell = readonly [row: number, colStart: number, colEnd: number];

export const REGION_CELLS: Record<string, RegionCell[]> = {
  "south-america": [
    [11, 17, 22],
    [12, 16, 23],
    [13, 16, 23],
    [14, 17, 22],
    [15, 17, 21],
    [16, 18, 20],
    [17, 18, 20],
    [18, 18, 19],
  ],
  caribbean: [
    [9, 13, 18],
    [10, 14, 17],
  ],
  "west-africa": [
    [8, 29, 34],
    [9, 30, 35],
    [10, 31, 35],
  ],
  "central-africa": [
    [10, 34, 38],
    [11, 34, 39],
    [12, 35, 39],
  ],
  "southern-africa": [
    [13, 34, 39],
    [14, 34, 39],
    [15, 35, 38],
    [16, 35, 37],
  ],
  "africa-wide": [
    [7, 31, 37],
    [8, 30, 39],
    [9, 30, 40],
    [10, 31, 40],
    [11, 32, 40],
    [12, 33, 40],
    [13, 34, 39],
    [14, 34, 39],
    [15, 35, 38],
    [16, 35, 37],
  ],
  // Mid-ocean band between the Americas and Africa — the Middle Passage.
  atlantic: [
    [9, 24, 28],
    [10, 24, 29],
    [11, 25, 29],
    [12, 25, 28],
  ],
};

// Display name shown in the info box under the article title.
export const REGION_NAMES: Record<string, string> = {
  "south-america": "South America",
  caribbean: "Caribbean",
  "west-africa": "West Africa",
  "central-africa": "Central Africa",
  "southern-africa": "Southern Africa",
  "africa-wide": "Africa",
  atlantic: "The Atlantic",
};

// Current corpus → region. New slugs get added here as the corpus grows;
// an unlisted slug simply doesn't light up (the atlas maps articles, not borders).
export const SLUG_REGION: Record<string, string> = {
  brazil: "south-america",
  haiti: "caribbean",
  jamaica: "caribbean",
  "christopher-columbus": "caribbean",
  "democratic-republic-of-the-congo": "central-africa",
  "kingdom-of-benin": "west-africa",
  nigeria: "west-africa",
  "mali-empire": "west-africa",
  "scramble-for-africa": "africa-wide",
  "south-africa": "southern-africa",
  "atlantic-slave-trade": "atlantic",
};
