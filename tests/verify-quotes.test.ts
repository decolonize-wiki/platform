import { describe, it, expect } from "vitest";
import { verifyQuotes } from "../src/lib/verify-quotes.js";

const extract =
  "The colonial era began when Brazil was discovered by\nPedro Álvares Cabral in 1500, who claimed the area.";

describe("verifyQuotes", () => {
  it("finds an exact quote across whitespace differences", () => {
    const r = verifyQuotes(extract, [
      {
        id: "f1",
        quote: "Brazil was discovered by Pedro Álvares Cabral in 1500",
      },
    ]);
    expect(r).toEqual([{ id: "f1", found: true }]);
  });
  it("rejects a paraphrased quote", () => {
    const r = verifyQuotes(extract, [
      { id: "f2", quote: "Brazil was found by Cabral in 1500" },
    ]);
    expect(r).toEqual([{ id: "f2", found: false }]);
  });
});
