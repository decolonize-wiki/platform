// Real verbatim flags from published analyses (../decolonize-data), used by
// the concept-lab hero drafts. Draft-only: the shipped hero would read these
// from getAllAnalyses() rather than hardcoding.

export type LabFlag = {
  article: string;
  category: string;
  quote: string;
  rewrite: string;
};

export const LAB_FLAGS: LabFlag[] = [
  {
    article: "Atlantic slave trade",
    category: "discovery-framing",
    quote: "the new discoverers of these lands",
    rewrite: "the Europeans arriving in these already-inhabited lands",
  },
  {
    article: "Christopher Columbus",
    category: "euphemism",
    quote: "were largely replaced by Europeans and Africans",
    rewrite:
      "were killed by disease, enslavement, and colonial violence, then displaced",
  },
  {
    article: "Brazil",
    category: "discovery-framing",
    quote: "when Brazil was first explored, conquered and settled by the Portuguese",
    rewrite: "when the Portuguese reached, conquered and settled Brazil",
  },
  {
    article: "Brazil",
    category: "discovery-framing",
    quote: "most extensive virgin tropical forest",
    rewrite: "most extensive old-growth tropical forest",
  },
  {
    article: "Nigeria",
    category: "euphemism",
    quote: "pacifying the heartland of the Sokoto Caliphate",
    rewrite: "subduing the heartland of the Sokoto Caliphate by force",
  },
  {
    article: "Scramble for Africa",
    category: "euphemism",
    quote: "About half of the territory was pacified in 1892",
    rewrite: "Portuguese forces brought about half of the territory under control by 1892",
  },
  {
    article: "Scramble for Africa",
    category: "discovery-framing",
    quote: "he discovered the sea route to India",
    rewrite: "he became the first European to reach India by sea",
  },
  {
    article: "Democratic Republic of the Congo",
    category: "euphemism",
    quote: "King Leopold II of Belgium acquired rights to the Congo territory",
    rewrite:
      "King Leopold II secured European recognition of his claim to the Congo",
  },
  {
    article: "Haiti",
    category: "euphemism",
    quote: "vast numbers of those enslaved imported from Africa",
    rewrite:
      "vast numbers of enslaved Africans trafficked to the colony by French slave traders",
  },
  {
    article: "Jamaica",
    category: "agentless-passive",
    quote: "many Maroons were expelled to Nova Scotia",
    rewrite: "the British colonial authorities deported many Maroons to Nova Scotia",
  },
  {
    article: "Atlantic slave trade",
    category: "euphemism",
    quote: "The first enslaved Africans arrived in continental North America",
    rewrite:
      "European colonizers first brought enslaved Africans to continental North America",
  },
  {
    article: "Scramble for Africa",
    category: "agentless-passive",
    quote: "120,000 workers died over the ten years of construction",
    rewrite:
      "120,000 conscripted Egyptian labourers died over the ten years of construction",
  },
  {
    article: "Haiti",
    category: "one-sided-sourcing",
    quote: "the settlers were later killed by the Taíno",
    rewrite:
      "according to the surviving Spanish accounts, the settlers were later killed by the Taíno",
  },
  {
    article: "Democratic Republic of the Congo",
    category: "euphemism",
    quote: "the reparations was reduced to $90 million in 1838",
    rewrite: "the indemnity was reduced to $90 million in 1838",
  },
];
