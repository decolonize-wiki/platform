import { describe, it, expect } from "vitest";
import {
  WIDTHS,
  searchUrl,
  idsUrl,
  variantFile,
  pickIdsId,
  manifestTs,
} from "../scripts/art/art-helpers.js";

const searchFixture = {
  response: {
    rows: [
      { content: { descriptiveNonRepeating: { online_media: { media: [] } } } },
      {
        content: {
          descriptiveNonRepeating: {
            online_media: { media: [{ idsId: "NMAAHC-2015_97_27_39" }] },
          },
          freetext: { identifier: [{ content: "2015.97.27.39" }] },
        },
      },
    ],
  },
};

describe("art-helpers", () => {
  it("widths are 640 and 1280", () => {
    expect(WIDTHS).toEqual([640, 1280]);
  });

  it("searchUrl embeds key, unit filter and quoted accession", () => {
    const u = searchUrl("2015.97.27.39", "DEMO_KEY");
    expect(u).toContain("api.si.edu/openaccess/api/v1.0/search");
    expect(u).toContain("api_key=DEMO_KEY");
    expect(u).toContain(encodeURIComponent('"2015.97.27.39" AND unit_code:NMAAHC'));
  });

  it("idsUrl targets the delivery service with max size", () => {
    expect(idsUrl("NMAAHC-x", 1600)).toBe(
      "https://ids.si.edu/ids/deliveryService?id=NMAAHC-x&max=1600",
    );
  });

  it("variantFile derives the on-disk name", () => {
    expect(variantFile("free-huey-1968", 640)).toBe("free-huey-1968-640.webp");
  });

  it("pickIdsId prefers the row whose identifier matches the accession", () => {
    expect(pickIdsId(searchFixture, "2015.97.27.39")).toBe("NMAAHC-2015_97_27_39");
  });

  it("pickIdsId returns null when no row has media", () => {
    expect(pickIdsId({ response: { rows: [] } }, "x")).toBeNull();
  });

  it("manifestTs emits a generated, parseable TS module", () => {
    const src = manifestTs({ a: { w: 640, h: 900, widths: [640, 1280] } });
    expect(src).toContain("GENERATED");
    expect(src).toContain('"w": 640');
    expect(src.trim().endsWith(";")).toBe(true);
  });
});
