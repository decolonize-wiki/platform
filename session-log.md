## 2026-07-19 · splash approved and live, art layer built and shipped, methodology v0.2 tagged

- Splash visual polish pass (single-line wall, row ladder, tamer bloom, Anton h1); owner approved; ff-merged feat/signature-hero to main and pushed (live).
- Art layer (Tier 1) built via subagent-driven development from the 2026-07-18 plan: manifest of 6 CC0 NMAAHC pieces, sharp fetch/duotone pipeline (npm run build-art, idsId pinning), 12 committed webp variants, ArtFigure component.
- Provenance audit: reviewers caught fabricated/wrong data in 3 of 6 planned entries; all 6 re-verified against real NMAAHC records (one piece replaced: MPLA 19th-anniversary flier 2015.97.27.62).
- Owner redirect mid-flight: interlude section replaced by a hero art slider (right of DISCOVERED?) + new /en/art collection page with verified context per piece; methodology opener band (1922 NAACP broadside) kept.
- /flow:deep-review: 2 BREAKS found and fixed (1280 variants actually 1028-1264px wide due to longest-edge IDS max param; hero caption wrap over art), 0 SECURITY; merged to main, pushed, verified live on www.decolonize.wiki/en/art.
- Deck polish round (owner feedback): uniform paper mats, next-card peek behind gradient veil, hover/focus pause, lazy low-priority first slide, dynamic-lang brand link (df6fc08, pushed).
- Methodology repo: reviewed PRs #2 (delegitimizing-labels) and #3 (ethnographic-present) — no real flaws; merged both, fixed 2 doc nits, tagged and pushed v0.2 (7 categories now).
- Date spot-check closed via Wayback: Young Lords "ca. 1971" and MPLA "December 12, 1975" match the museum records.
- CLAUDE.md discovered to be gitignored (local-only); longest-edge image-API pitfall recorded there locally.

## 2026-07-13 · Methodology v0.2 PRs and signature-hero concept chosen

Resumed the paused research session and moved it into decisions + drafting.

Methodology (../decolonize-methodology, two PRs open, awaiting owner merge):
- PR #2 promote-delegitimizing-labels: added the 7th category
  categories/delegitimizing-labels.md (added: v0.2), cleared its CANDIDATES.md
  row, recorded the ruling in DECISIONS.md. Grounded in guha-1983 + mudimbe-1988.
  Closes issue #1.
- PR #3 add-ethnographic-present: added categories/ethnographic-present.md
  (added: v0.2) plus fabian-1983 and modest-lelijveld-2018 to SOURCES.md.
- Disjoint files, merge in any order, both fold into v0.2. Owner action:
  merge both + git tag v0.2 (the PRs do not tag).

Signature hero (this repo, branch feat/signature-hero, local commit only):
- Brainstormed (superpowers:brainstorming) then built THREE live interactive
  hero drafts behind a switcher on an unlisted noindex /lab route: 01 Redaction
  Wall (Three.js corridor of real colonial quotes struck in glowing red), 02
  Ink Bleed (SVG wet-ink editorial rewrite), 03 Atlas globe (Three.js).
- Owner chose Concept 01 as the direction. Verified all three visually on
  localhost via Playwright.
- Added three + troika-three-text (+ @types/three) to site/package.json.
- Draft only: hardcoded lab-flags, troika default font, whole-page cohesion +
  pixel polish still pending. Committed to the branch, not pushed, not merged.

Wrote a comprehensive implementation plan + the still-open art-direction (A/B/C)
decision into session-progress.md for tomorrow.

## 2026-07-05 · share-card generation UI (post/story/square, term strikes, share links) + growth brainstorm parked

- Share-card feature built via full agent pipeline (investigate -> plan -> code -> review):
  - New per-flag card formats: story 1080x1920 and square 1080x1080 routes under card/[flagId]/, both force-static + generateStaticParams (confirmed static in build).
  - Term-level strike-and-correct now renders on all three per-flag card formats (retrofit of the existing 1080x1350). Satori cannot reflow multi-word sibling spans; quote renders as a word-token flex row (strikeTokens in site/lib/card-strike.ts). Verified visually: 5 flags x 3 formats incl. edge cases (term at quote start, comma glued to term).
  - DRY extraction: site/lib/categories.ts, card-data.ts, card-attribution.ts, card-strike.ts, card-render.tsx (single renderFlagCard + CARD_FORMATS specs). utm_medium renamed flag->post; og unchanged.
  - ShareFlag.tsx client component in FlagBlock's flagline: Post/Story/Square <a download> links + copy-link button; 44px tap targets; no h-overflow at 360px.
  - 3 new vitest suites (attribution, strike/tokens, card-data); 44 tests green; tsc clean root+site; build 92/92 static.
  - Reviewer: 1 BREAKS (pre-fix stamp overlap, fixed + re-verified), 2 MINOR accepted as-is.
- CLAUDE.md Known Pitfalls gained the Satori word-tokenization lesson.
- Owner reviewed live: cards work but are "not quite what I was expecting" - visual iteration pending next session (no specifics given yet). Owner chose to push/deploy anyway.
- Growth/community brainstorm (superpowers:brainstorming) ran but NO design doc written - owner will decide later. Directions converged so far: email list first; ~0h/week ops so everything self-running; claim handles on IG/TikTok/Bluesky/X but only Bluesky automated; five bridges for link-less platforms (vanity URLs like /brazil, handle on cards, QR code, sticker zone, search); landing-page email conversion + notify-me-on-request; Remotion+ElevenLabs auto-video as phase 2.
- Deleted reviewer debris (.playwright-mcp/, mobile-flagline.png) before commit.

