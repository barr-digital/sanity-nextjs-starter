# Environment variables, deploy & dataset strategy

Where config lives and how the two workspaces ship. Read this before touching env vars, deploys or anything dataset-related.

## Environment variables

Real `.env` files are **not committed** (gitignored). `.env.example` files exist in both workspaces; real values come from the Tech Lead and are configured locally, on Vercel (frontend) and on Sanity (studio host). In this repo all project-specific values are deliberate placeholders (`<your project ID>` etc.) — they must stay placeholders.

### `frontend/.env`

```
NEXT_PUBLIC_SANITY_PROJECT_ID   # project ID (Required)
NEXT_PUBLIC_SANITY_DATASET      # "production" | "development" — per environment (Required)
NEXT_PUBLIC_SANITY_API_VERSION  # e.g. 2025-09-25 (Optional)
NEXT_PUBLIC_SANITY_STUDIO_URL   # Studio URL, default http://localhost:3333
NEXT_PUBLIC_SITE_URL            # canonical site URL — fallback only: on Vercel, getMetadataBase() auto-resolves the production URL
SANITY_API_READ_TOKEN           # read token for draft/preview (Required) — SECRET
```

### `studio/.env*` — split per environment

The Studio uses mode-based env files (loaded by the Sanity CLI per command mode):

```
.env                # shared: SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_PREVIEW_URL
.env.development    # SANITY_STUDIO_DATASET=development, SANITY_STUDIO_STUDIO_HOST=<project>-dev
.env.production     # SANITY_STUDIO_DATASET=production,  SANITY_STUDIO_STUDIO_HOST=<project>
```

`sanity dev` and `npm run deploy:dev` load `.env.development`; `npm run deploy:prod` (production mode) loads `.env.production`. The per-mode files hold no secrets, so projects may commit them.

> `SANITY_API_READ_TOKEN` is a secret: never print, commit, or paste it in chat. Same for any other token.

## Dataset strategy — dual environment

The starter ships a **two-dataset setup**: `production` (live content) and `development` (disposable testing ground). There is only one schema and it lives in the code — datasets are plain document stores; structure travels via git merge + deploy, never between datasets. Full lifecycle: see "Schema Change Workflow" in `DEVELOPMENT.md`.

Rules:

- **The `production` dataset is live** for editors and the site. Schema experiments happen against `development` first.
- **Additive changes are safe**: adding a block, a field, a type breaks nothing existing.
- **Removing or renaming** a field/type `name` does not delete data, but orphans/hides it in the Studio — existing production documents need a content migration (`npx sanity migration create`), run at release time.
- **Never** run mutations/patch/delete on a dataset (including via the Sanity MCP) without explicit confirmation.
- The `development` dataset is disposable: wipe and re-clone from production when it gets stale (`sanity dataset export` + `import`).
- One-time per project: `npx sanity dataset create development`.

## Deploy

### Studio → Sanity host (two environments)

```bash
npm run deploy:dev --workspace=studio    # dev Studio → development dataset (from feature/dev branches)
npm run deploy:prod --workspace=studio   # production Studio → production dataset (from main only)
```

**Policy: Claude never runs `sanity deploy` on its own.** The production deploy is run by the **Tech Lead after PR review/merge**, keeping the live Studio schema in sync with merged code. Deploying one Studio never affects the other.

### Frontend → Vercel

- Vercel is connected to the GitHub repo; framework preset: Next.js.
- **Branch push → automatic preview deploy** (preview URL on the PR). Set `NEXT_PUBLIC_SANITY_DATASET=development` on the Preview environment so previews run against the dev dataset end-to-end.
- **Production** updates when the Vercel-configured Production branch is merged (typically `main`), with `NEXT_PUBLIC_SANITY_DATASET=production`. Verify in the Vercel dashboard which branch is Production before assuming.
- All `frontend/.env` variables must exist in the Vercel project settings (with `NEXT_PUBLIC_SITE_URL` set to the real domain in Production).
- `prebuild` runs `typegen`: the build fails if schema/queries and types are inconsistent — a safety net, not a substitute for local `type-check`.

## Git flow (operational)

**This repo has no `development` branch**: working branches start from an up-to-date `main` and PRs target `main`. Projects cloned from the starter use the standard BARR flow (branch from `development`, PR against `development`).

```bash
git checkout main && git pull             # in this repo; projects: development
git checkout -b feat/<kebab-name>         # or fix/, chore/ — include task ID if available
# … work …
npm run type-check && npm run lint        # must pass
git add -p && git commit -m "…"           # English, with confirmation
git push -u origin feat/<kebab-name>      # with confirmation
```

Merges are the Tech Lead's call. Releases are tagged via `release/vX.Y.Z` branches and tracked in `CHANGELOG.md` (Keep a Changelog).

## Pre-PR checklist

- [ ] Branch started from up-to-date `main`
- [ ] Types regenerated if schema/queries changed (extract → typegen)
- [ ] `npm run type-check` and `npm run lint` green
- [ ] grep of changed names for leftover usages
- [ ] No `.env`/secrets in the diff
- [ ] Placeholders (`<your project ID>`, example block, TODO markers) preserved — they are the product
