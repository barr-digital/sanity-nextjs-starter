# Code conventions & pitfalls

Naming, component and Sanity conventions, production cautions, and the starter-cleanup checklist. Read this on first contact with the codebase and before any rename/removal.

## The three component categories

Everything you build is one of these — each has its own flow:

1. **Page-builder blocks** (`components/blocks/`) — editor-composable page sections. Full creation chain (schema → registry → types → component → renderer): [page-builder-blocks.md](page-builder-blocks.md).
2. **Layout components** (`components/layout/`) — header, footer, nav: present on every page, driven by a Sanity **singleton**. Flow: singleton schema (+ registry, `SINGLETON_TYPES`, structure entry) → GROQ query → component → fetched in `app/[locale]/layout.tsx`, data passed down as props.
3. **UI primitives** (`components/ui/`) — Button, Card, `Picture`, `Link`, `Text`, `Skeleton`, … No direct Sanity data: everything arrives via props. Check what exists before creating one.

From a Figma frame, decide the category first: editor adds/removes it per page → block; on every page → layout; atomic reusable element → UI primitive.

## Conventions

### Naming

- **Files and folders: kebab-case** (`example-block.tsx`, `block-renderer.tsx`).
- **Schema/block `name`: camelCase** (`textBlock`) — the key linking schema → query → renderer. Must match everywhere; grep it when changing.
- **No barrel files**: import from the concrete file. The schema registry (`schema-types/index.ts`) is the one deliberate registry.
- **Branches**: `feat/…`, `fix/…`, `chore/…` — in this repo from `main` (there is no `development` branch; projects cloned from the starter branch from `development`). **UI copy is Italian** (default locale `it`); code, identifiers and docs are English.

### Components

- Match the props signature and typing style of neighboring blocks; if you want to improve typing (e.g. adopt generated result types), do it consistently or discuss first — no one-off patterns.
- Images: through the Sanity image helpers + the shared `Picture` component. Meaningful `alt` for content images; `alt=""` only for decorative ones.
- Links/CTAs: the shared `Link`/button component driven by the `link` object — no ad-hoc `<a>` for CMS links.
- Style: Tailwind v4, tokens first — see [styling-and-design-tokens.md](styling-and-design-tokens.md).
- **SVGs as React components**; UI icons from `lucide-react`.
- **Server Component by default**; `"use client"` only for interactivity. Semantic HTML (`section`, `nav`, `article`, …).
- File order: imports → props `type` → component (hooks, handlers, JSX). ~100 lines max — split above that.

### TypeScript

- **`type` by default**, `interface` only when extending. **Zero `any`** — use `unknown` or the generated Sanity types.
- Block props: `ExtractPageBuilderType<'blockName'>` from `frontend/types/sanity.ts` (which also exports `PageBuilderBlock` and `DereferencedLink`, the link shape after GROQ dereferencing).
- No generic names (`data`, `item`, `handleClick`) without context; constants in `UPPER_SNAKE_CASE`.

### Server Actions, server-only reads & forms

- **Server Actions**: `frontend/actions/*.ts` — top-level, one file per domain, `"use server"` at the top. Type input as `unknown`, validate with `schema.safeParse(input)` as the first line, return `{ success: boolean; error?: string }` — never throw at the client.
- **RSC-only reads**: `frontend/lib/data/*.ts` with `import 'server-only'` as the first line — for functions called **only** by Server Components (no needless RPC endpoint, no client leak). Called from Client Components too (live filters, load-more)? → it belongs in `actions/` as a Server Action.
- **zod schemas**: `frontend/schema/*.ts` (singular folder name), shared between the RHF form and its action. Never `lib/actions/` or `lib/schemas/` — legacy patterns.

### i18n & routing (next-intl)

- The middleware lives in **`frontend/proxy.ts`** (the Next.js 16 name) — don't recreate `middleware.ts`. Adding a locale means updating `i18n/routing.ts` **and** the matcher in `proxy.ts`.
- `localePrefix: 'as-needed'` (default locale unprefixed) and `localeDetection: false` (users pick the language explicitly) — don't change without discussion.
- Navigation always via the wrappers exported by `i18n/routing.ts`, never `next/navigation`.
- Slugs are **per-locale** (same document, different slug per language). The language switcher resolves the sibling document via `translateSlug` (`frontend/lib/data/translations.ts`, uses `translation.metadata`) — never switch with `<Link href={pathname} locale={…}>`: it assumes identical slugs across locales and 404s when they differ.
- New i18n document type: register it in **both** `documentInternationalization.schemaTypes` and `languageFilter.documentTypes` in `studio/sanity.config.tsx`, then create one document per language from the Studio (the plugin links them via `translation.metadata`).

### Loading & async state

- Placeholders: the `Skeleton` primitive (`components/ui/skeleton.tsx`), sized/shaped via `className` to mirror the real component.
- Route boundaries: `app/[locale]/error.tsx` (with retry) + global `app/not-found.tsx`. **No catch-all `loading.tsx`** — deliberate; add a per-route one only where a page has heavy fetches and benefits from a targeted skeleton.
- Submitting forms: disable the button and show a spinner (lucide `Loader2` + `animate-spin`); with RHF read `form.formState.isSubmitting`.

### Sanity

- Always `defineType`/`defineField` in schemas, `defineQuery` in GROQ.
- Content images use the **`img`** object type (never raw `image`), links/CTAs the **`link`** object — see [sanity-schema-and-types.md](sanity-schema-and-types.md).
- Every block/document has a meaningful preview for the editor (blocks: the SmartBlockPreview convention).
- i18n: page queries filter by `language == $lang`; never hardcode a locale.

## Production: what NOT to break

The `production` dataset is live for editors and the site; schema experiments belong on the `development` dataset via the dual-environment setup (see [deploy-and-env.md](deploy-and-env.md)).

- **Additive is safe**: new blocks, fields, pages don't impact existing content.
- **Removing/renaming a field/type `name`**: existing data stays in the dataset but becomes invisible/unread. Never "for cleanliness" without weighing the impact — flag it and confirm.
- **Never** run mutations/patch/delete on the dataset (including Sanity MCP `patch_documents`, delete, `discard_drafts`) without explicit confirmation.
- `sanity deploy` makes the schema immediately live for editors: only additive or deliberate changes, deployed by the Tech Lead.
- Adding `validation: Rule.required()` on a populated type marks existing documents invalid in the Studio — introduce cautiously.

## Starter template leftovers — cleanup checklist

**In this repo the items below are deliberate placeholders — never "fix" them here.** This is the canonical checklist that projects cloned from the starter run at project start (and shouldn't take leftovers as a model later):

- [ ] **Root `package.json`**: `name`, `description`, `keywords`, `homepage`/`bugs` repo URLs → project values. Same for any starter name in `frontend/package.json` / `studio/package.json`.
- [ ] **`sanity-template.json`** (starter-marketplace manifest): delete.
- [ ] **README / CHANGELOG / DEVELOPMENT.md**: replace or delete the starter versions — a project's docs live in `CLAUDE.md` + `docs/`.
- [ ] **Sanity project ID**: real project ID in `frontend/.env` and `studio/.env` (from `.env.example`) and any fallback in `studio/sanity.cli.ts` / `sanity.config.tsx` (`<your project ID>` placeholders).
- [ ] **Locales**: `frontend/i18n/routing.ts` (`locales`, `defaultLocale`) and the Studio i18n plugin config match the project's languages.
- [ ] **Global metadata**: default title/description/OG image in the locale `layout.tsx` and the `settings` singleton → project values, the project's site URL as canonical base.
- [ ] **`exampleBlock`**: remove once real blocks exist — schema file, entry in `schema-types/index.ts`, entry in `blocks/config.ts`, GROQ branch in `queries.ts`, component in `components/blocks/`, entry in `block-renderer.tsx` (full chain, both directions).
- [ ] **Demo/test routes and content**: remove any test route under `app/[locale]/`, placeholder pages and demo documents in the dataset.
- [ ] **`TODO` scaffolding comments** (queries, header/footer, renderer): resolve or remove as the real implementation lands.
- [ ] **Favicons / OG image / public assets**: replace starter placeholders with project assets.

> If a query or config mentions a type that doesn't exist in `studio/src/schema-types/`, it's almost certainly a leftover. **Trust only the real schema.**

## Verify before "done"

1. `npm run type-check` (both workspaces) green.
2. `npm run lint` green.
3. Types regenerated if schema/queries changed.
4. grep across the repo for changed names → no orphan usages.
5. Block/page renders correctly in dev or preview (user runs `npm run dev`).
