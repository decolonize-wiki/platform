import type { Analysis } from "@schema/analysis";

type Flag = Analysis["flags"][number];

export const CATEGORY_NAMES: Record<Flag["categoryId"], string> = {
  "discovery-framing": "Discovery framing",
  "agentless-passive": "Agentless passive",
  euphemism: "Euphemism",
  "one-sided-sourcing": "One-sided sourcing",
  "pre-contact-erasure": "Pre-contact erasure",
  "toponymic-colonialism": "Toponymic colonialism",
};
