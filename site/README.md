# decolonize.wiki — site

The public site for [decolonize.wiki](https://decolonize.wiki). It is a Next.js 15
app that renders a static build from the analysis JSON in the **decolonize-data**
repo and the methodology content in the **decolonize-methodology** repo. There is
no database: every page is generated from files at build time.

Licensed **AGPL-3.0** (analysis content in the data repo is CC BY-SA; the site
renders it with the required attribution).

## Local development

The site reads two sibling checkouts by default:

```
GitHub/
  decolonize-wiki/        # this repo (npm workspace root)
    site/
  decolonize-data/        # analysis JSON + source extracts
  decolonize-methodology/ # categories, sources, governance docs
```

```bash
git clone https://github.com/decolonize-wiki/wiki
git clone https://github.com/decolonize-wiki/data
git clone https://github.com/decolonize-wiki/methodology

cd wiki
npm install          # run at the repo root — it is an npm workspace
npm run dev -w site  # http://localhost:3000
```

Without the sibling checkouts the build cannot find data. Point the site at
checkouts elsewhere with `DATA_DIR` / `METHODOLOGY_DIR` (see below).

## Environment variables

| Var | Used by | Purpose |
|-----|---------|---------|
| `DATA_DIR` | build/runtime | Path to the decolonize-data checkout. Default: `../../decolonize-data` relative to `site/`. |
| `METHODOLOGY_DIR` | build/runtime | Path to the decolonize-methodology checkout. Default: `../../decolonize-methodology`. |
| `DATA_TARBALL_URL` | build (prebuild) | If set, `scripts/prebuild-data.mjs` downloads and extracts this tarball into `site/.data`. Value: `https://codeload.github.com/decolonize-wiki/data/tar.gz/refs/heads/main` |
| `METHODOLOGY_TARBALL_URL` | build (prebuild) | Same, extracts into `site/.methodology`. Value: `https://codeload.github.com/decolonize-wiki/methodology/tar.gz/refs/heads/main` |
| `RESEND_API_KEY` | runtime | Resend API key for the `/api/subscribe` email-capture route. If unset the route returns 503. |
| `RESEND_AUDIENCE_ID` | runtime | Resend audience the subscriber is added to. |

### How the tarball prebuild fits together

On Vercel there are no sibling checkouts, so `npm run build` first runs
`node scripts/prebuild-data.mjs`, which downloads whichever `*_TARBALL_URL` vars
are set into fixed dirs (`site/.data`, `site/.methodology`). You then point the
build at those dirs by **pairing** each tarball URL with its matching dir var:

```
DATA_TARBALL_URL=https://codeload.github.com/decolonize-wiki/data/tar.gz/refs/heads/main
DATA_DIR=.data
METHODOLOGY_TARBALL_URL=https://codeload.github.com/decolonize-wiki/methodology/tar.gz/refs/heads/main
METHODOLOGY_DIR=.methodology
```

If a `*_TARBALL_URL` is unset, the prebuild no-ops for that repo and the local
sibling (via the default `DATA_DIR`/`METHODOLOGY_DIR`) is used instead. A tarball
URL that is set but fails to download or extract is a **hard build failure** —
the site is never built from stale or empty data. Both `.data/` and
`.methodology/` are gitignored.

Only **published** analyses that have been pushed to the data repo appear in the
tarball; drafts are local-only. As of this writing that is 7 article slugs.

## Vercel setup

- **Root Directory**: `site`. Keep "Include files outside the Root Directory"
  enabled (the default) — the site imports the shared schema from `../../src`
  and needs the workspace root's lockfile.
- **Install Command**: leave as the default. Vercel detects the npm workspace and
  installs from the repo root, so `site` resolves its hoisted dependencies. (If a
  future Vercel change isolates the Root Directory and install fails, set the
  install command to `cd .. && npm install`.)
- **Build Command**: `npm run build` (the default; it runs the prebuild then
  `next build`).
- **Environment variables**: set `DATA_TARBALL_URL`, `METHODOLOGY_TARBALL_URL`,
  `DATA_DIR=.data`, `METHODOLOGY_DIR=.methodology`, plus `RESEND_API_KEY` and
  `RESEND_AUDIENCE_ID`.

`vercel.json` is intentionally absent — the Root Directory is set in the Vercel
dashboard, not in a config file.

### Redeploy on data changes (deploy hook)

Pushing a new analysis to the data repo should redeploy the site:

1. In the Vercel project: **Settings → Git → Deploy Hooks**, create a hook for
   the `main` branch and copy its URL.
2. In the **decolonize-data** repo: **Settings → Webhooks → Add webhook**, paste
   the deploy hook URL, content type `application/json`, trigger on **push**
   events.

### Domain

`decolonize.wiki` is attached to the Vercel project under **Settings → Domains**.

## Email capture (Resend)

The `/api/subscribe` route adds a contact to a Resend audience. Configure
**double opt-in** (confirmation email) on the audience in the Resend dashboard so
subscribers confirm before they are active.

> **Known gap: the subscribe endpoint has no rate limiting yet.** It validates
> the email shape and returns 503 when Resend env vars are absent, but nothing
> throttles requests. Mitigations: double opt-in contains most abuse (unconfirmed
> contacts stay inactive), and a Vercel WAF / IP-window rule can be added in
> front of the route. Add proper rate limiting before wide promotion.
