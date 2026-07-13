import type { Metadata } from "next";
import { ConceptLab } from "../../components/lab/ConceptLab";

// Draft-only surface for comparing signature-hero concepts on localhost.
// Unlisted + noindex — not part of the public site.
export const metadata: Metadata = {
  title: "Concept lab — decolonize.wiki",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <ConceptLab />;
}
