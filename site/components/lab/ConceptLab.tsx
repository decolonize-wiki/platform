"use client";
import { useState } from "react";
import { RedactionWall } from "./RedactionWall";
import { InkBleed } from "./InkBleed";
import { AtlasGlobe } from "./AtlasGlobe";

// Concept-lab shell: swaps between three self-contained signature-hero drafts
// behind a persistent switcher. Draft-only surface (/lab, noindex).

type ConceptId = "wall" | "ink" | "atlas";

const CONCEPTS: { id: ConceptId; no: string; name: string }[] = [
  { id: "wall", no: "01", name: "Redaction Wall" },
  { id: "ink", no: "02", name: "Ink Bleed" },
  { id: "atlas", no: "03", name: "Atlas" },
];

function WallScene() {
  return (
    <>
      <div className="lab-bg">
        <RedactionWall />
      </div>
      <div className="lab-vignette" aria-hidden="true" />
      <header className="lab-mast">
        <span className="disp">Decolonize.wiki</span>
        <span className="mono">The archive · read line by line</span>
      </header>
      <div className="lab-overlay">
        <div className="lab-eyebrow mono">Read line by line · every quote verbatim</div>
        <h1 className="disp lab-h1">
          Discovered<span className="lab-q">?</span>
        </h1>
        <p className="lab-lede">
          Wikipedia still says it. We read the world&rsquo;s encyclopedia line by
          line, against a public methodology built on a century of decolonial
          thought — <b>and publish the receipts.</b>
        </p>
        <a className="cta lab-cta" href="/en">
          Open the archive →
        </a>
      </div>
    </>
  );
}

export function ConceptLab() {
  const [active, setActive] = useState<ConceptId>("wall");

  return (
    <div className="lab-stage">
      {active === "wall" && <WallScene />}
      {active === "ink" && <InkBleed />}
      {active === "atlas" && <AtlasGlobe />}

      <nav className="lab-switch" aria-label="Concept switcher">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            className={c.id === active ? "on" : ""}
            onClick={() => setActive(c.id)}
          >
            <span className="no">{c.no}</span>
            <span className="nm">{c.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
