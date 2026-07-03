# Batch analysis session instructions

How an analysis is produced. Run inside Claude Code from the platform repo,
with the methodology and data repos as siblings. One article per pass.

## Inputs

- Article title (from the batch list or a request issue)
- Methodology: read EVERY file in `../decolonize-methodology/categories/`
  (skip SCHEMA.md) at the CURRENT tagged version, plus SOURCES.md

## Steps

1. **Fetch:** `npm run fetch-article -- "<Title>"`. Record the printed
   metadata (slug, revisionId, fetchedAt, url). This also stores the
   revision's wikitext (`<revisionId>.wikitext`), which carries the
   `<ref>` citation data; if the CLI warns that no revision content came
   back, note it and proceed — citation checks then fall back to in-text
   attribution only.
2. **Analyze (pass 1):** read the stored extract in full. For each category
   file, apply its "Flag when" criteria and — before flagging anything —
   its "Do NOT flag when" exclusions. When in doubt, do not flag. For each
   flag produce: verbatim quote (copy exactly from the extract), ~5 words of
   anchor text before and after, category id, explanation in plain language,
   suggested rewrite. Draft the summary paragraph, up to 3 context facts
   (ONLY facts verifiable against SOURCES.md entries, with sourceId), and a
   naming note if the toponymic criteria apply (attestation + scope
   required).
   For any one-sided-sourcing candidate, locate the flagged sentence in
   the stored wikitext and read its `<ref>` tags before deciding: the
   category's "cited only to colonizer accounts" test is about those
   citations. If the wikitext is unavailable or the refs are ambiguous,
   the flag may still stand on in-text attribution alone — say so
   explicitly in the explanation.
3. **Adversarial pass (pass 2):** in a FRESH context (subagent), argue
   against every flag as a skeptical historian and experienced Wikipedia
   editor: is the quote exact? does an exclusion apply? would a fair-minded
   historian object? Drop or fix any flag that loses the argument. Record
   dropped flags and why in the session summary for the owner.
4. **Assemble:** write `../decolonize-data/analyses/en/<slug>/<seq>.json`
   per the schema in `src/schema/analysis.ts`, with `status: "draft"`. `<seq>` = 1 + highest
   existing sequence for that slug (1 if none). Flag ids:
   `<slug>-<seq>-<categoryId>-<n>`. If a prior analysis exists and a quote
   persists unchanged, reuse its flag id.
5. **Verify:** `npm run verify-analysis -- <path>`. Fix and re-run until it
   exits 0. Never weaken a quote to make it pass — a quote that cannot be
   found verbatim is wrong.
6. **Owner review (blocking):** present every flag (quote, category,
   explanation, rewrite), the dropped-flag list, context facts with sources,
   and the naming note. The owner edits/approves. Nothing is committed
   without approval. Approval is recorded by flipping `status` from
   `"draft"` to `"published"` (re-run verify after the flip).
7. **Publish:** commit the analysis + extract to the data repo:
   `git add analyses extracts && git commit -m "data: <slug> #<seq> (rev <revisionId>, methodology <version>)"`

## Hard rules

- Quotes are verbatim or they are wrong.
- Exclusions beat criteria; doubt means no flag.
- Context facts without a SOURCES.md sourceId are dropped, not softened.
  But dropping is not the end of it: when a flag, rewrite, or context
  fact is blocked only by a missing source, research candidate scholarly
  sources (websearch is fine) and open a PR against the methodology repo
  adding the source to SOURCES.md with full bibliographic data, per
  GOVERNANCE.md. Record the blocked item in the session summary so the
  analysis can be revised once the owner merges the PR. Never use a
  source in an analysis before it is merged into SOURCES.md.
- Never claim credit for Wikipedia edits; see the engagement policy.

## Methodology feedback (candidate categories)

When a pass encounters a real colonial-framing pattern that NO existing
category covers (e.g. delegitimizing labels for anti-colonial resisters),
record it as a candidate in the session summary — do not flag it, do not
stretch an existing category to fit.

The bar for promoting a candidate to a methodology issue/PR is deliberately
high — the methodology must not grow just because a rule exists to grow it:

1. The pattern has been independently recorded in analyses of at least TWO
   different articles (one occurrence is an anecdote, not a category).
2. No existing category's criteria could be amended to cover it more simply
   than adding a new one (prefer amending; DRY applies to taxonomies).
3. It can be defined with testable "Flag when" criteria AND "Do NOT flag
   when" exclusions, grounded in the cited decolonial literature.

Candidates that meet the bar become a GitHub issue on the methodology repo
(owner triage), then a PR per GOVERNANCE.md. Candidates that never recur
simply age out — that is the correct outcome, not a failure.
