// Repo-consistency: every collection entry has committed variants + dims.
// Fails until `npm run build-art` has been run and its outputs committed.
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ART_COLLECTION } from "../site/lib/art/collection.js";
import { ART_DIMS } from "../site/lib/art/manifest.js";
import { WIDTHS, variantFile } from "../scripts/art/art-helpers.js";

describe("generated art assets", () => {
  it("every entry has dims with sane values", () => {
    for (const e of ART_COLLECTION) {
      const d = ART_DIMS[e.id];
      expect(d, `missing dims for ${e.id}`).toBeTruthy();
      expect(d.w).toBeGreaterThan(0);
      expect(d.h).toBeGreaterThan(0);
      expect(d.widths).toEqual(WIDTHS);
    }
  });

  it("every variant file exists in site/public/art", () => {
    for (const e of ART_COLLECTION) {
      for (const w of WIDTHS) {
        const p = join("site", "public", "art", variantFile(e.id, w));
        expect(existsSync(p), `missing ${p}`).toBe(true);
      }
    }
  });
});
