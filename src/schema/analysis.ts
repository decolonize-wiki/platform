import { z } from "zod";

export const CATEGORY_IDS = [
  "discovery-framing",
  "agentless-passive",
  "euphemism",
  "pre-contact-erasure",
  "one-sided-sourcing",
  "toponymic-colonialism",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const FlagSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  categoryId: z.enum(CATEGORY_IDS),
  quote: z.string().min(10),
  anchorBefore: z.string(),
  anchorAfter: z.string(),
  explanation: z.string().min(30),
  rewrite: z.string().min(5),
});

export const ContextFactSchema = z.object({
  fact: z.string().min(20),
  sourceId: z.string().min(3), // must exist in methodology SOURCES.md — checked by owner review
});

export const NamingNoteSchema = z.object({
  text: z.string().min(20),
  attestation: z.string().min(10), // whose name, for what, how we know
});

export const AnalysisSchema = z
  .object({
    schemaVersion: z.literal(1),
    language: z.string().length(2),
    article: z.object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      revisionId: z.number().int().positive(),
      fetchedAt: z.iso.datetime(),
      url: z.url(),
    }),
    methodologyVersion: z.string().regex(/^v\d+\.\d+$/),
    sequence: z.number().int().positive(),
    model: z.string().min(3),
    status: z.enum(["draft", "published", "superseded"]),
    summary: z.object({
      paragraph: z.string().min(50),
      flagCounts: z.partialRecord(
        z.enum(CATEGORY_IDS),
        z.number().int().positive(),
      ),
    }),
    flags: z.array(FlagSchema).min(1),
    contextFacts: z.array(ContextFactSchema).max(3),
    namingNote: NamingNoteSchema.optional(),
  })
  .superRefine((a, ctx) => {
    const actual: Record<string, number> = {};
    for (const f of a.flags)
      actual[f.categoryId] = (actual[f.categoryId] ?? 0) + 1;
    const declared = a.summary.flagCounts as Record<string, number>;
    const keys = new Set([...Object.keys(actual), ...Object.keys(declared)]);
    for (const k of keys) {
      if ((actual[k] ?? 0) !== (declared[k] ?? 0)) {
        ctx.addIssue({
          code: "custom",
          message: `flagCounts mismatch for ${k}: declared ${declared[k] ?? 0}, actual ${actual[k] ?? 0}`,
        });
      }
    }
    const ids = a.flags.map((f) => f.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: "custom", message: "duplicate flag ids" });
    }
  });

export type Analysis = z.infer<typeof AnalysisSchema>;
