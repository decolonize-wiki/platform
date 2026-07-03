import { describe, it, expect } from "vitest";
import { slugify } from "../src/lib/slugify.js";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("History of Brazil")).toBe("history-of-brazil");
  });
  it("strips diacritics", () => {
    expect(slugify("São Tomé and Príncipe")).toBe("sao-tome-and-principe");
  });
  it("drops punctuation and collapses hyphens", () => {
    expect(slugify("Congo (Léopoldville) — history")).toBe(
      "congo-leopoldville-history",
    );
  });
});
