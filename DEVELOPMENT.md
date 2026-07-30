# Development Guide

Human-oriented guide to set up, run and extend a project built from this starter. It stays deliberately short: **the operational truth for conventions and patterns lives in [`CLAUDE.md`](CLAUDE.md) and [`docs/`](docs/)** — this file tells you where things are and in which order to do them.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Common Workflows](#common-workflows)
- [Code Standards](#code-standards)
- [Deployment](#deployment)
- [Need Help?](#need-help)

---

## Getting Started

1. **Install** (npm workspaces, from the repo root):

   ```bash
   npm install
   ```

2. **Environment variables** — copy the examples and fill in the real values (from the Tech Lead):

   ```bash
   cp frontend/.env.example frontend/.env.local
   cp studio/.env.example studio/.env          # shared: project ID, preview URL
   # per-environment (dataset + studio hostname):
   # studio/.env.development and studio/.env.production — see studio/.env.example
   ```

3. **Run** — frontend (`:3000`) and Studio (`:3333`) in parallel:

   ```bash
   npm run dev            # both
   npm run dev:next       # frontend only
   npm run dev:studio     # studio only
   ```

   The local Studio runs in `development` mode and points at the `development` dataset out of the box.

## Project Structure

npm-workspaces monorepo with two workspaces:

- **`studio/`** — Sanity Studio: schema (`src/schema-types/`), sidebar structure, block previews.
- **`frontend/`** — Next.js App Router: localized routes (`app/[locale]/`), page-builder rendering, GROQ queries with generated types.

Pages are assembled by editors with a **page builder** (an array of blocks) and rendered in order by the frontend. The full annotated folder tree lives in [`CLAUDE.md`](CLAUDE.md#project).

## Common Workflows

### Add a page-builder block

The most frequent task. It's an ordered chain across both workspaces — skipping a step causes a silent bug:

schema (`studio/src/schema-types/blocks/<block-name>.ts`) → register in `schema-types/index.ts` + `blocks/config.ts` → `npm run extract-types -w studio` → GROQ fragment in `frontend/sanity/lib/queries.ts` (if needed) → `npm run typegen -w frontend` → component in `frontend/components/blocks/<block-name>.tsx` → register in `components/layout/block-renderer.tsx` → verify.

→ Full step-by-step with snippets: [`docs/page-builder-blocks.md`](docs/page-builder-blocks.md)

### Add a new page type

1. **Schema** — new document in `studio/src/schema-types/documents/` (`singletons/` for one-off pages, `collections/` for multi-instance). Spread the shared base page (`base-page.ts`): title, slug, language and `seo` come for free. Add the `pageBuilder` field from `blocks/config.ts`.
2. **Register** — add it to the registry in `schema-types/index.ts`; singletons also go in `SINGLETON_TYPES` and the sidebar (`src/structure/`). i18n types must be registered in **both** plugin configs in `sanity.config.tsx`.
3. **Types** — `npm run extract-types -w studio` then `npm run typegen -w frontend`.
4. **Query** — add `<entity>Query` in `frontend/sanity/lib/queries.ts` with `defineQuery`, reusing the shared fragments (including the `seo` fragment).
5. **Page component** — one file in `frontend/app/_pages/` (e.g. `about-page.tsx`) rendering the PageBuilder.
6. **Route wiring** — the catch-all `app/[locale]/[[...slug]]/page.tsx` resolves every page: add the fetch + case in its `generateMetadata` and render switch.
7. **Static params & sitemap** — add the type to `frontend/lib/data/sitemap.ts` (single source of truth for routes; `app/sitemap.ts` follows it automatically).

### Collection pages (listing + items)

Same flow as a page type, with documents in `documents/collections/` and item routes as `<listing-slug>/<item-slug>`. Slugs are **per-locale**; the language switcher resolves sibling documents via `translateSlug` (`frontend/lib/data/translations.ts`) — see the i18n pitfalls in [`docs/conventions-and-pitfalls.md`](docs/conventions-and-pitfalls.md).

### SEO & metadata

Every page type inherits the `seo` object from the base page schema; routes build metadata through the shared helpers in `frontend/lib/data/metadata.ts`. Key rule: **omit keys to inherit the global defaults** — never return `undefined`.

→ [`docs/seo-and-metadata.md`](docs/seo-and-metadata.md)

### Images

Content images use the `img` object type in schemas and the shared `Picture` component (`frontend/components/ui/picture.tsx`) in the frontend — always through the Sanity CDN, never raw asset URLs.

→ [`docs/conventions-and-pitfalls.md`](docs/conventions-and-pitfalls.md)

### Internationalization

Adding a locale touches three places: `frontend/i18n/routing.ts` (`locales`), the matcher in `frontend/proxy.ts`, and both i18n plugin configs in `studio/sanity.config.tsx`. Navigation always goes through the wrappers exported by `i18n/routing.ts` — never `next/navigation`.

→ i18n pitfalls (per-locale slugs, language switcher): [`docs/conventions-and-pitfalls.md`](docs/conventions-and-pitfalls.md)

### TypeScript & generated types

`frontend/sanity.types.ts` is **generated — never edit it by hand**. After any schema or query change:

```bash
npm run extract-types --workspace=studio   # schema → studio/schema.json
npm run typegen --workspace=frontend       # schema.json + queries → sanity.types.ts
```

Block components are typed with `ExtractPageBuilderType<'blockName'>` from `frontend/types/sanity.ts`.

→ [`docs/sanity-schema-and-types.md`](docs/sanity-schema-and-types.md)

## Code Standards

Naming, component categories, data layer, Server Actions and TypeScript rules are documented once and enforced in review:

- [`docs/conventions.md`](docs/conventions.md) — shared BARR conventions (kebab-case files, no barrel files, component structure)
- [`docs/conventions-and-pitfalls.md`](docs/conventions-and-pitfalls.md) — the three component categories, Sanity conventions, production cautions, starter-leftover checklist
- [`docs/data-layer.md`](docs/data-layer.md) / [`docs/server-actions.md`](docs/server-actions.md) — `lib/data/` reads (`server-only`) vs `actions/` mutations (`"use server"`)
- [`docs/styling-and-design-tokens.md`](docs/styling-and-design-tokens.md) — Tailwind v4 CSS-first, `t-*` typography utilities, color tokens
- [`docs/groq-queries.md`](docs/groq-queries.md) — query and fragment conventions

Before declaring anything done:

```bash
npm run type-check   # both workspaces
npm run lint
```

plus regenerated types if schema/queries changed, and a grep for leftover usages of anything renamed.

## Deployment

### Studio Deployment

Deploy your Sanity Studio to a hosted `*.sanity.studio` URL for production use.

#### First Time Deployment

The Studio deploys to two separate environments: a dev Studio (pointing at the `development` dataset) and a production Studio (pointing at `production`). Per-environment config (dataset + hostname) lives in `studio/.env.development` and `studio/.env.production` — see `studio/.env.example`.

1. **Build and deploy each studio:**

   ```bash
   npm run deploy:dev --workspace=studio # dev Studio → development dataset
   npm run deploy:prod --workspace=studio # production Studio → production dataset
   ```

2. **Choose a hostname:**

   Set the hostnames via `SANITY_STUDIO_STUDIO_HOST` in the two env files (e.g., `my-project-dev` and `my-project`); the CLI asks for one on first deploy if unset.

   Your studios will be available at: `https://my-project-dev.sanity.studio` and `https://my-project.sanity.studio`

   **Important notes about hostnames:**
   - Studio hostnames are **globally unique** across all Sanity projects worldwide
   - They are NOT scoped to your account or organization
   - Similar to domain names - if someone else is using it, you can't use it
   - Choose specific names: `yourcompany-project`, `client-cms`, `brandname-studio`
   - Generic names like `test`, `demo`, `project` are likely taken

3. **Save the appId:**

   After successful deployment, Sanity will display an `appId`. Add it to `studio/sanity.cli.ts`:

   ```typescript
   export default defineCliConfig({
     api: {
       projectId,
       dataset,
     },
     deployment: {
       appId: 'YOUR_APP_ID_HERE', // From deploy output
       autoUpdates: true,
     },
   })
   ```

   This prevents the CLI from prompting for the application ID on future deploys.

   **Note:** the `appId` identifies a single deployed Studio app, so with two environments don't hardcode one in `sanity.cli.ts` — set it per environment (e.g., `SANITY_STUDIO_APP_ID` in the two env files) or leave it unset.

#### Subsequent Deployments

Simply run the deploy script for the environment you want to update:

```bash
npm run deploy:dev --workspace=studio # from a feature branch, to try schema changes
npm run deploy:prod --workspace=studio # from main, once the changes are merged
```

Deploying one Studio never affects the other.

#### Troubleshooting

**Error: "Hostname already taken"**

- The hostname is globally unique and someone else is using it
- Try adding your company/project name: `barr-digital-projectname`
- Or use a more specific identifier

**Error: "Cannot read properties of undefined (reading 'length')"**

- This happens when `studioHost` is set to an empty string `''` in `sanity.cli.ts`
- Either remove the `studioHost` field or set it to a proper value
- Use the `--hostname` flag: `npx sanity deploy --hostname your-name`

### Frontend Deployment (Vercel)

1. **Push to GitHub:**

   ```bash
   git push origin main
   ```

2. **Import in Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your repository
   - Set **Root Directory** to `frontend`

3. **Configure Environment Variables:**

   Add these in Vercel's project settings:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=your-read-token
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

   **How to get the read token:**

   ```bash
   cd studio
   npx sanity manage
   ```

   Then go to **API** → **Tokens** → **Add API token** with "Read" permissions.

4. **Deploy:**
   Vercel will automatically deploy on push to your main branch.

### Environment-Specific Deployments

`studio/sanity.cli.ts` and `studio/sanity.config.tsx` already read `SANITY_STUDIO_DATASET` and `SANITY_STUDIO_STUDIO_HOST` from the environment. The deploy scripts select which env file gets loaded:

- `npm run deploy:dev` sets `SANITY_ACTIVE_ENV=development`, so the CLI loads `studio/.env.development`
- `npm run deploy:prod` runs in the default `production` mode, so the CLI loads `studio/.env.production`

`sanity dev` also runs in `development` mode, so the local Studio points at the `development` dataset out of the box. Values shared across environments (project ID, preview URL) stay in `studio/.env`.

Create the `development` dataset once per project:

```bash
npx sanity dataset create development
# Optionally seed it with production content:
npx sanity dataset export production prod.tar.gz && npx sanity dataset import prod.tar.gz development
```

On Vercel, set `NEXT_PUBLIC_SANITY_DATASET=development` for the Preview environment and `production` for Production, so preview deploys of feature branches run end-to-end against the dev dataset and the new schema.

### Schema Change Workflow

There is only **one** schema, and it lives in the code (`studio/src/schema-types/`). The two environments are just two snapshots of it at different points in the git flow: the production Studio runs the schema as it is on `main`, the dev Studio runs it as it is on your feature branch. Datasets have no structure of their own — they are plain document stores. The structure travels via git merge + deploy, never between datasets.

Lifecycle of a schema change:

1. **Feature branch** — edit the schemas in `studio/src/schema-types/`.
2. **Test locally** — `npm run dev`: the local Studio loads `.env.development` and points at the `development` dataset. Try the new structure, create test content, check the frontend queries.
3. **Test online (optional)** — `npm run deploy:dev -w studio` updates the dev Studio so editors/clients can try the new structure. The Vercel preview deploy of the branch points at the same dataset, so the change is testable end-to-end.
4. **Merge to `main`** — then `npm run deploy:prod -w studio`: the production Studio gets the new structure. Existing documents in the `production` dataset are untouched; editors see the new fields empty and fill them in.
5. **Breaking changes only** (renamed field, changed type, restructured object) — existing production documents still have the old shape. Write a [content migration](https://www.sanity.io/docs/content-migration) (`npx sanity migration create`) and run it against `production` at release time, coordinated with the frontend deploy that reads the new shape.

Rules of thumb:

- `deploy:dev` runs from feature branches, `deploy:prod` only from `main`
- Never change production directly: everything goes dev → merge → prod
- Additive changes (new fields, new types) are painless; renames and type changes need a migration
- The `development` dataset is disposable: when it accumulates stale test content, wipe it and re-clone it from production (`sanity dataset export` + `import`)
- Frontend-only work doesn't touch this flow at all — no Studio deploy needed

---

## Need Help?

- [`CLAUDE.md`](CLAUDE.md) + [`docs/`](docs/) — conventions and patterns for this codebase (source of truth)
- [Sanity documentation](https://www.sanity.io/docs) · [Next.js documentation](https://nextjs.org/docs) · [next-intl documentation](https://next-intl.dev)
- BARR: Development Guideline in the knowledge vault (`operativo/guideline.md`)
