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
NEXT_PUBLIC_SITE_URL            # canonical site URL — optional override (Production only) when the canonical differs from Vercel's auto-pick (e.g. www canonical + apex redirect); otherwise leave unset, getMetadataBase() auto-resolves
SANITY_API_READ_TOKEN           # read token for draft/preview (Required) — SECRET
```

### Studio environments — the map lives in committed code

The environment → dataset/host map does NOT live in env files: it is committed, because `.env*` files are gitignored (BARR guard hook) and a fresh clone must still resolve the right Studio. Three pieces:

- **`studio/package.json` scripts** set `SANITY_ACTIVE_ENV` and `SANITY_STUDIO_DATASET` explicitly per command (`dev` and `deploy:dev` → development, `deploy:prod` → production).
- **`studio/sanity.cli.ts`** hardcodes the per-environment fallbacks (projectId, studioHost, appId — public identifiers, not secrets; filled by /barr-init). **Every default is development**: production must be asked for by name. Without the appId fallbacks, a clone without env files would create a _third_ Sanity application on deploy instead of updating one of ours.
- **`studio/sanity.config.tsx`** defaults the dataset to `development` for the same reason.

Env vars still win everywhere: `.env` holds the shared values (see `studio/.env.example`), and optional gitignored `.env.development`/`.env.production` files can override per mode (`sanity dev`/`deploy:dev` load `.env.development`; `deploy:prod` loads `.env.production`).

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
- All `frontend/.env` variables must exist in the Vercel project settings (`NEXT_PUBLIC_SITE_URL` only if the project needs the canonical override — Production only).
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
