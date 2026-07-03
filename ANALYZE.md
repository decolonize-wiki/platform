# Batch analysis session instructions

How an analysis is produced. Run inside Claude Code from the platform repo,
with the methodology and data repos as siblings. One article per pass.

## Inputs

- Article title (from the batch list or a request issue)
- Methodology: read EVERY file in `../decolonize-methodology/categories/`
  (skip SCHEMA.md) at the CURRENT tagged version, plus SOURCES.md

## Steps

1. **Fetch:** `npm run fetch-article -- "<Title>"`. Record the printed
   metadata (slug, revisionId, fetchedAt, url).
2. **Analyze (pass 1):** read the stored extract in full. For each category
   file, apply its "Flag when" criteria and — before flagging anything —
   its "Do NOT flag when" exclusions. When in doubt, do not flag. For each
   flag produce: verbatim quote (copy exactly from the extract), ~5 words of
   anchor text before and after, category id, explanation in plain language,
   suggested rewrite. Draft the summary paragraph, up to 3 context facts
   (ONLY facts verifiable against SOURCES.md entries, with sourceId), and a
   naming note if the toponymic criteria apply (attestation + scope
   required).
3. **Adversarial pass (pass 2):** in a FRESH context (subagent), argue
   against every flag as a skeptical historian and experienced Wikipedia
   editor: is the quote exact? does an exclusion apply? would a fair-minded
   historian object? Drop or fix any flag that loses the argument. Record
   dropped flags and why in the session summary for the owner.
4. **Assemble:** write `../decolonize-data/analyses/en/<slug>/<seq>.json`
   per the schema in `src/schema/analysis.ts`. `<seq>` = 1 + highest
   existing sequence for that slug (1 if none). Flag ids:
   `<slug>-<seq>-<categoryId>-<n>`. If a prior analysis exists and a quote
   persists unchanged, reuse its flag id.
5. **Verify:** `npm run verify-analysis -- <path>`. Fix and re-run until it
   exits 0. Never weaken a quote to make it pass — a quote that cannot be
   found verbatim is wrong.
6. **Owner review (blocking):** present every flag (quote, category,
   explanation, rewrite), the dropped-flag list, context facts with sources,
   and the naming note. The owner edits/approves. Nothing is committed
   without approval.
7. **Publish:** commit the analysis + extract to the data repo:
   `git add analyses extracts && git commit -m "data: <slug> #<seq> (rev <revisionId>, methodology <version>)"`

## Hard rules

- Quotes are verbatim or they are wrong.
- Exclusions beat criteria; doubt means no flag.
- Context facts without a SOURCES.md sourceId are dropped, not softened.
- Never claim credit for Wikipedia edits; see the engagement policy.
