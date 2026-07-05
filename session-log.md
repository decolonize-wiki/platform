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

