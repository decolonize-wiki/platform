import { describe, it, expect } from "vitest";
import { parseCategory, parseSourcesTable } from "../site/lib/methodology.js";

describe("parseCategory", () => {
  it("splits frontmatter from body", () => {
    const md = [
      "---",
      "id: euphemism",
      "name: Euphemism",
      "added: v0.1",
      "---",
      "",
      "## Definition",
      "",
      "Softened vocabulary for conquest.",
    ].join("\n");
    const cat = parseCategory(md);
    expect(cat.id).toBe("euphemism");
    expect(cat.name).toBe("Euphemism");
    expect(cat.body).toBe("## Definition\n\nSoftened vocabulary for conquest.");
  });

  it("tolerates a body with its own --- and colons", () => {
    const md = "---\nid: x\nname: X\n---\n\nA line: with a colon.";
    const cat = parseCategory(md);
    expect(cat.id).toBe("x");
    expect(cat.body).toBe("A line: with a colon.");
  });
});

describe("parseSourcesTable", () => {
  it("parses rows and skips header + separator", () => {
    const md = [
      "# Sources",
      "",
      "| id | source |",
      "|---|---|",
      "| said-1978 | Edward Said, *Orientalism*, Pantheon, 1978 |",
      "| ngugi-1986 | Ngũgĩ wa Thiong'o, *Decolonising the Mind*, 1986 |",
    ].join("\n");
    const sources = parseSourcesTable(md);
    expect(sources).toHaveLength(2);
    expect(sources[0]).toEqual({
      id: "said-1978",
      citation: "Edward Said, *Orientalism*, Pantheon, 1978",
    });
    expect(sources[1].id).toBe("ngugi-1986");
  });
});
