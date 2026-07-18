import { describe, it, expect } from "vitest";
import { ART_COLLECTION, artById, creditLine, objectUrl } from "../site/lib/art/collection.js";

describe("ART_COLLECTION", () => {
  it("has six entries with unique ids", () => {
    const ids = ART_COLLECTION.map((e) => e.id);
    expect(ids.length).toBe(6);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry is complete", () => {
    for (const e of ART_COLLECTION) {
      expect(e.title.length).toBeGreaterThan(0);
      expect(e.year).toMatch(/^(c\. )?\d{4}$/);
      expect(e.objectNumber).toMatch(/^\d{4}\.\d+/);
      expect(e.alt.length).toBeGreaterThan(20);
      expect(e.context.length).toBeGreaterThan(80);
      expect(e.regions.length).toBeGreaterThan(0);
      expect(e.themes.length).toBeGreaterThan(0);
      expect(e.source).toBe("NMAAHC");
      expect(e.license).toBe("CC0");
    }
  });

  it("artById returns the entry or throws", () => {
    expect(artById("mpla-anniversary-1975").objectNumber).toBe("2015.97.27.62");
    expect(() => artById("nope")).toThrow(/unknown art id/);
  });

  it("creditLine carries provenance", () => {
    const line = creditLine(artById("naacp-broadside-1922"));
    expect(line).toContain("1922");
    expect(line).toContain("NMAAHC 2011.57.9");
    expect(line).toContain("CC0");
  });

  it("objectUrl points at the piece's NMAAHC record", () => {
    expect(objectUrl(artById("free-huey-1968"))).toBe(
      "https://nmaahc.si.edu/object/nmaahc_2019.28.20",
    );
  });
});
