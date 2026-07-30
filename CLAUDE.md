> Type: website · Stage: complete · Init: barr-init v0.1.0 · 2026-07-30

# BARR Sanity + Next.js Starter

Operating guide for working on this codebase with Claude Code. Every line carries information — no filler.

## Project

**This repository is the starter template itself** — the base every BARR website project is cloned from (via `/barr-init`). It is not a client project: placeholders, the example block and TODO markers are deliberate features that projects replace at init. Changes here propagate to every future project, so favor generality and document intent.

npm-workspaces monorepo:

- **`studio/`** — Sanity Studio: content schema, structure, previews.
- **`frontend/`** — Next.js (App Router): renders content via GROQ + generated types.

Page content is assembled with a **page builder**: a `pageBuilder` array of "blocks" composed by editors in the Studio and rendered in order by the frontend.

Folder structure (essentials):

```
studio/src/
├── schema-types/
│   ├── index.ts              # registry of ALL schema types (imports + array)
│   ├── documents/            # base-page.ts + singletons/ + collections/
│   ├── objects/              # reusable field types: link, img, seo
│   └── blocks/               # page-builder BLOCKS + config.ts (allowed blocks)
├── inputs/ previews/ icons/  # custom Studio UI: card inputs, block previews, icon slots
├── structure/                # Studio sidebar tree
└── sanity.config.tsx         # Studio config, plugins (i18n type registration lives here)

frontend/
├── app/[locale]/             # localized routes (next-intl), layout + catch-all slug
├── app/_pages/               # page component per document type (home-page.tsx, …)
├── app/sitemap.ts            # absolute URLs from the site URL, excludes noIndex
├── app/robots.ts             # robots rules + sitemap pointer
├── components/
│   ├── layout/               # page-builder.tsx + block-renderer.tsx (maps _type → component)
│   ├── blocks/               # one file per page-builder block
│   └── ui/                   # shared primitives: picture, link, text, portable-text, skeleton, …
├── actions/                  # Server Actions ("use server") — one file per domain
├── schema/                   # zod form schemas (singular folder name)
├── lib/data/                 # RSC-only reads (`import 'server-only'`) + metadata/json-ld helpers
├── hooks/                    # custom hooks, one file per hook
├── sanity/lib/queries.ts     # all GROQ (defineQuery) + reusable fragments
├── types/sanity.ts           # manual helper types: ExtractPageBuilderType, DereferencedLink
├── utils/cn.ts               # cn() = clsx + tailwind-merge
├── i18n/routing.ts           # locales + navigation wrappers (Link, useRouter, …)
├── proxy.ts                  # next-intl middleware (Next.js 16 name for middleware.ts)
└── sanity.types.ts           # GENERATED — never edit by hand
```

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4**, CSS-first config (`@theme` in CSS files, no `tailwind.config`)
- **Sanity 5** + **next-sanity** (typed queries, live content)
- **next-intl** for i18n — locale(s): `it` (default: `it`); routed via `app/[locale]/`
- Icons via `lucide-react`; images via `@sanity/image-url` (Sanity CDN)
- Forms: **react-hook-form + zod**; also available: `sonner` (toasts), `clsx` + `tailwind-merge` via `cn()`, `date-fns`

## Hard constraints

- **Never force push.**
- **Never push directly to `main`** — always a working branch + PR.
- **Never deploy schema changes to a production dataset without explicit approval** (`sanity deploy` makes the schema live for editors immediately).
- **Never run mutations/patch/delete on a dataset** (including via the Sanity MCP) without explicit confirmation.
- **Secrets stay server-side**: never print, commit, or paste tokens (`SANITY_API_READ_TOKEN` etc.) in chat or code.
- **Keep the starter project-agnostic**: no client-specific content; placeholders (`<your project ID>`, empty `SANITY_STUDIO_STUDIO_HOST`, `exampleBlock`, TODO markers) are features projects consume at init — they must survive every change.

## The page builder is the core concept

Page documents expose a `pageBuilder` array of block objects. Adding or changing a block is an **ordered chain of touchpoints** spanning both workspaces — skipping a step causes a silent bug (empty data, stale types, or the "block not implemented" placeholder):

1. **Sanity schema** — `studio/src/schema-types/blocks/<block-name>.ts`
2. **Register + allow** — schema registry (`schema-types/index.ts`) and `pageBuilderBlocks` in `blocks/config.ts`
3. **Extract schema** — `npm run extract-types --workspace=studio` → `studio/schema.json`
4. **GROQ fragment** — projection in `frontend/sanity/lib/queries.ts` (only if references/derived fields)
5. **Typegen** — `npm run typegen --workspace=frontend` → `frontend/sanity.types.ts`
6. **React component** — `frontend/components/blocks/<block-name>.tsx`
7. **Register in the renderer** — blocks map in `frontend/components/layout/block-renderer.tsx` (key = schema `name`)
8. **Verify** — block renders in dev/preview; `type-check` green

→ Full step-by-step with snippets: **[page-builder-blocks.md](docs/page-builder-blocks.md)**

## Golden rules

1. **Production datasets are live.** Prefer additive changes; removing/renaming schema fields hides live data — do it deliberately and flag it. Schema experiments go through the `development` dataset first (see [deploy-and-env.md](docs/deploy-and-env.md)).
2. **Never edit `frontend/sanity.types.ts` by hand** — it's generated. Change schema/queries → regenerate.
3. **Schema first, typegen second.** After any schema change: `extract-types` (studio) → `typegen` (frontend), in that order. Claude decides when — the user shouldn't have to ask.
4. **Targeted edits**, not whole-file rewrites.
5. **Verify before "done":** `npm run type-check` and `npm run lint` must pass; grep the repo for leftover usages of changed names.
6. **Follow nearby conventions** — naming, component signature, Tailwind style. Don't introduce new patterns (routing, state, libraries) without discussion.
7. **Reuse design tokens and existing helpers** — typography utilities, `Picture`/`Link` UI components, `urlFor` image helpers, color tokens. Don't hardcode sizes/colors when a token exists.
8. **SEO by default**: every routed page gets per-page metadata through the shared metadata helper; leave keys out to inherit global defaults — never return `undefined`.
9. **No irreversible actions without confirmation**: commit, push, deploy, dataset mutations.
10. **If a task touches more than 3 files, list them and wait for confirmation** before proceeding.

## Key conventions

- **Every component is one of three categories** — page-builder block, layout component (singleton-driven), or UI primitive — each with its own creation flow: see [conventions-and-pitfalls.md](docs/conventions-and-pitfalls.md).
- **Files and folders: kebab-case** (`example-block.tsx`, `block-renderer.tsx`).
- **Schema/block `name`: camelCase** (`exampleBlock`) — it's the key linking schema → query → renderer; must match everywhere.
- Block components are typed with `ExtractPageBuilderType<'blockName'>` (from `types/sanity.ts`) and receive `{ block, index }` from the renderer — **no data fetching inside blocks**.
- **i18n navigation via the wrappers in `i18n/routing.ts`** (`Link`, `redirect`, `usePathname`, `useRouter`) — never from `next/navigation`.
- **No barrel files.** Import from the concrete file. (The schema registry `schema-types/index.ts` is the one deliberate registry, not a barrel.)
- **SVGs as React components**; UI icons from `lucide-react`. `public/` SVGs are for logos/brand assets only.
- **Images always through the Sanity CDN** (`@sanity/image-url` helpers + the shared `Picture` component) — never raw asset URLs or local content images.
- **UI copy is Italian**; code, identifiers, comments and docs are English.
- Sanity: always `defineType`/`defineField` in schemas, `defineQuery` in GROQ; every block has a meaningful preview.

## Commands

Run from the repo root (npm workspaces):

```bash
npm run dev            # frontend (:3000) + studio (:3333) in parallel
npm run dev:next       # frontend only
npm run dev:studio     # studio only
npm run type-check     # tsc --noEmit across both workspaces
npm run lint           # ESLint (frontend)
npm run format         # Prettier write

npm run extract-types --workspace=studio   # schema → studio/schema.json
npm run typegen --workspace=frontend       # schema.json + queries → frontend/sanity.types.ts
npm run deploy:dev --workspace=studio      # dev Studio → development dataset
npm run deploy:prod --workspace=studio     # production Studio (approval required — Tech Lead)
```

> **Long-running dev servers are run by the user.** Don't start `npm run dev` yourself — ask the user to run it and report what they see.
> The frontend `predev`/`prebuild` run `typegen` automatically but do **not** re-extract the schema: after a schema change, extract first.

## Figma workflow

Figma links are not stored in docs — paste the **node-id of the block/page** in chat when opening a UI task. Claude reads the design with the **Figma MCP** (design context, screenshot, variables) to derive layout, editable fields, spacing and assets, mapping colors/typography onto the existing **design tokens** before writing schema or component. Design drives _which fields_ the schema needs and _how_ to render them.

## Git workflow

- Branches: `<type>/kebab-case-name` (`feat/…`, `fix/…`, `chore/…`), always from an **up-to-date `main`** — this repo has no `development` branch (projects cloned from the starter do; there, branch from `development`).
- **Commit messages in English**, imperative, scoped to the change.
- Push the branch, open a PR **against `main`**.
- **Merging is done only by the Tech Lead** after review — same for releases (`release/vX.Y.Z` branches, `CHANGELOG.md` in Keep a Changelog format) and Studio deploys.
- Commit, push and PR creation happen **only with explicit confirmation**.
- Task flows (framing, block creation, closing checks) are handled by the **BARR plugin skills** — use them when available.

## Document index

- [page-builder-blocks.md](docs/page-builder-blocks.md) — create/modify a page-builder block: the full touchpoint chain with snippets
- [sanity-schema-and-types.md](docs/sanity-schema-and-types.md) — schema conventions, extract-types → typegen pipeline, Studio deploy
- [groq-queries.md](docs/groq-queries.md) — GROQ conventions: explicit projections, reusable fragments, references, i18n coalesce
- [seo-and-metadata.md](docs/seo-and-metadata.md) — per-page metadata, canonical, OG, sitemap, robots
- [styling-and-design-tokens.md](docs/styling-and-design-tokens.md) — design tokens, Tailwind v4 CSS-first, typography utilities
- [deploy-and-env.md](docs/deploy-and-env.md) — env vars, dual-environment deploy (dev/production Studio + datasets), Vercel
- [conventions-and-pitfalls.md](docs/conventions-and-pitfalls.md) — the three component categories, code conventions, i18n pitfalls, production cautions, starter-leftover checklist
- [conventions.md](docs/conventions.md), [data-layer.md](docs/data-layer.md), [server-actions.md](docs/server-actions.md) — shared BARR conventions (naming, data layer, Server Actions)

Setup/extension guides for humans live in `README.md` and `DEVELOPMENT.md`; this file + `docs/` are the operational truth for Claude.
