# Next.js + Sanity Starter with i18n & PageBuilder

[![Version](https://img.shields.io/github/v/tag/barr-digital/sanity-nextjs-starter?label=version&sort=semver)](https://github.com/barr-digital/sanity-nextjs-starter/releases)
[![Changelog](https://img.shields.io/badge/changelog-keep--a--changelog-orange)](./CHANGELOG.md)

A production-ready starter template combining **Next.js 16**, **Sanity v5**, **internationalization** (next-intl), a flexible **PageBuilder system**, **Tailwind CSS v4**, and **Sanity Live Content API**. Perfect for building scalable, multi-language content-driven websites.

## Stack

- **Next.js 16** (App Router, React Server Components)
- **Sanity v5** (headless CMS with real-time collaboration)
- **TypeScript** (full type safety across frontend and studio)
- **Tailwind CSS v4** (CSS-first approach, with `tailwind-merge` + `tw-animate-css`)
- **next-intl** (document-level i18n, Italian default)
- **Monorepo** (npm workspaces: `frontend/` + `studio/`)

## Prerequisites

- Node.js 18+ and npm
- A Sanity account ([sign up for free](https://www.sanity.io/get-started))

## Setup

### 1. Initialize with Sanity CLI

```bash
npm create sanity@latest -- --template barr-digital/sanity-nextjs-starter
```

The CLI guides you through creating a Sanity project, dataset, and environment variables.

### 2. Manual setup (alternative)

```bash
git clone https://github.com/barr-digital/sanity-nextjs-starter.git my-project
cd my-project
npm install

# Configure environment variables
cp frontend/.env.example frontend/.env.local
cp studio/.env.example studio/.env
# Fill in your Sanity project ID, dataset, and API token
```

### 3. Start development

```bash
npm run dev
```

This starts both:

- **Frontend**: http://localhost:3000
- **Studio**: http://localhost:3333

## Architecture

```
.
├── frontend/                     # Next.js application
│   ├── app/
│   │   ├── [locale]/[[...slug]]/ # Catch-all localized routes
│   │   ├── [locale]/error.tsx    # Per-locale error boundary (with retry)
│   │   ├── not-found.tsx         # Global 404 page
│   │   ├── robots.ts             # /robots.txt generator
│   │   ├── sitemap.ts            # /sitemap.xml generator
│   │   ├── _pages/               # Page components (home-page.tsx, ...)
│   │   └── styles/               # Tailwind CSS modules
│   ├── actions/                  # Server Actions ("use server"), top-level
│   ├── components/
│   │   ├── blocks/               # PageBuilder block components
│   │   ├── forms/                # Form components (contact-form, ...)
│   │   ├── layout/               # Layout components (page-builder, block-renderer)
│   │   └── ui/                   # UI components (link, picture, text, ...)
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── data/                 # RSC-only reads (`import 'server-only'`)
│   │   └── helpers/              # Pipeline helpers (metadata, sitemap)
│   ├── schema/                   # Shared zod schemas (RHF + Server Actions)
│   ├── types/                    # Shared TypeScript types
│   ├── utils/                    # Utility functions (cn, ...)
│   ├── sanity/
│   │   └── lib/                  # Sanity client, queries, utils
│   └── i18n/                     # Internationalization config
│
└── studio/                       # Sanity Studio
    └── src/
        ├── schema-types/         # Content schemas
        │   ├── blocks/           # PageBuilder block schemas
        │   ├── documents/
        │   │   ├── singletons/   # Single-instance documents (homepage, header, footer, settings)
        │   │   └── collections/  # Multi-instance documents (future: pages, posts, ...)
        │   ├── objects/          # Reusable object types (link, image, seo)
        │   └── validation/       # Custom validation rules
        ├── components/           # Custom Studio components
        ├── contexts/             # React contexts for Studio
        ├── icons/                # Editor-driven icon system (Lucide picker)
        ├── inputs/               # Custom inputs (link, img, seo, settings) + helpers
        ├── previews/             # Universal block preview system + mocks
        ├── structure/            # Studio structure (sidebar navigation)
        └── templates/            # Document templates for i18n
```

## Studio architecture

The Studio ships with two reusable systems out-of-the-box. Both are conventions for any new project derived from this starter — see `convenzioni.md` in the BARR vault for the full rules.

### Editor-driven icons

Every document type, singleton, sidebar folder, and PageBuilder block uses `iconForSlot('mySlot')` instead of importing from `@sanity/icons`. Editors customize icons via right-click anywhere in the Studio (Lucide picker). Icons live in the `studioIcons` singleton (hidden from sidebar, edited via the right-click menu).

Add a new slot in `studio/src/icons/slots.ts` whenever you introduce a new type or folder. Default icon is `HelpCircle` ("?") — it invites editors to personalize.

### Universal block previews

Every PageBuilder block gets a rich, automatic preview in both the list view and the "Add item" menu via `SmartBlockPreview` + Sanity type introspection. Convention for every new block:

```ts
import { SmartBlockPreview, autoSelect } from '../../previews/smart-block-preview'
import { makeBlockAddItemPreview } from '../../previews/block-add-item-preview'

export const myBlock = defineType({
  name: 'myBlock',
  type: 'object',
  icon: makeBlockAddItemPreview('myBlock'),
  components: { preview: SmartBlockPreview },
  preview: autoSelect(['title', 'image', 'cta' /* ...all field names */]),
  fields: [
    /* ... */
  ],
})
```

Do **not** add `preview.prepare()` on a block — it conflicts with `components.preview`. The `example-block` in `studio/src/schema-types/blocks/` is the reference template.

### Custom inputs for reusable objects

The `link`, `img`, `seo`, and `settings` schemas wire into custom inputs that share a common UX pattern:

- **`CollapsibleCardInput`** primitive — every reusable object collapses into a card preview when not focused; click expands the form inline.
- **`LinkInput`** — auto-detects URL vs `mailto:`/`tel:` as you type, swaps `linkType` accordingly, strips stale fields.
- **`SeoInput`** — collapsible SEO with SERP + Open Graph card previews and 50–60 / 150–160 character counters; resolves empty `seoTitle`/`seoDescription`/`seoImage` from the live `settings` singleton ("Using Settings defaults" hint).
- **`SettingsInput`** — the `settings` singleton renders SERP + OG previews above its form fields. The `useSettingsFallback(language)` hook subscribes to live changes and powers the SEO fallback above.

When you add a new reusable object that benefits from card-collapse UX, build it on top of `CollapsibleCardInput` — see `link-input.tsx` and `img-input.tsx` as references.

## Adding a New PageBuilder Block

Five steps:

1. **Create the schema** in `studio/src/schema-types/blocks/my-block.ts` — copy the convention from `example-block.ts` (`SmartBlockPreview` + `autoSelect` + `makeBlockAddItemPreview`).

2. **Register it** in `studio/src/schema-types/index.ts` and add `{ type: 'myBlock' }` to `pageBuilderBlocks` in `studio/src/schema-types/blocks/config.ts`.

3. **Add the icon slot** in `studio/src/icons/slots.ts` so editors can pick the icon via right-click.

4. **Create the component** in `frontend/components/blocks/my-block.tsx`.

5. **Register it** in `frontend/components/layout/block-renderer.tsx` and extend `pageBuilderFragment` in `frontend/sanity/lib/queries.ts` if the block has dereferenced fields.

## Data fetching and forms

Three top-level folders hold the read/write boundary:

- **`frontend/lib/data/<domain>.ts`** — RSC-only reads. The first line is `import 'server-only'` (the bundler fails the build if a Client Component imports the file). Use this when the function is called only from Server Components — no `"use server"`, no RPC endpoint exposed to the client.
- **`frontend/actions/<domain>.ts`** — Server Actions (`"use server"` first line). Use this when the function is also called from Client Components (filters, load more, form submissions). Always validate input with zod as the first line: `const parsed = schema.safeParse(input)`. Return `{ success, error? }` — never throw toward the client.
- **`frontend/schema/<domain>.ts`** — shared zod schemas (singular folder). Imported by both client forms (`react-hook-form` + `@hookform/resolvers/zod`) and the matching Server Action, so client UX and server validation stay in sync.

The form stack is wired up: `zod`, `react-hook-form`, `@hookform/resolvers`, `class-variance-authority`. The reference contact form lives at `frontend/components/forms/contact-form.tsx` (drop it into a page or wrap it in a PageBuilder block).

## SEO

Production-grade SEO out of the box. Three pieces, all in `frontend/lib/data/`:

- **`getMetadataBase()`** — Vercel-first resolution: `VERCEL_PROJECT_PRODUCTION_URL` → request `headers()` → `NEXT_PUBLIC_SITE_URL`. Preview deploys never leak into canonical / OG image URLs.
- **`buildAlternateLanguages({ currentSlug, currentLocale })`** — resolves translated slugs via Sanity's `translation.metadata`, omits locales without a translation (Google prefers a missing hreflang over a wrong one), duplicates the default locale entry as `x-default`. Pass it directly to `alternates.languages` in `generateMetadata`.
- **`buildOrganizationJsonLd(data, baseUrl)`** + **`buildBreadcrumbJsonLd(items, baseUrl)`** in `lib/data/json-ld.ts` — schema.org structured data helpers. Embed the returned object via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />`. Helpers only — no UI component shipped (visual representation varies per design).

`app/robots.ts` is wired up with the sitemap reference and a commented `disallow` template — uncomment when you add an admin area or auth-walled routes.

Validate JSON-LD with [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/).

## Error boundaries, skeleton, hooks

- **`app/[locale]/error.tsx`** — per-locale error boundary with a retry button. Catches unhandled errors thrown during rendering of any descendant route segment.
- **`app/not-found.tsx`** — global 404. Lives at the root (not under `[locale]/`) so it also catches routes outside any locale.
- **No `loading.tsx` catch-all** — add a `loading.tsx` only per-route when a page benefits from a targeted skeleton. Generic skeletons shared across unrelated pages do more harm than good.
- **`components/ui/skeleton.tsx`** — minimal placeholder primitive (`bg-neutral-100 animate-pulse rounded-md`). Override sizing via `className`.

Six universal DOM/UI hooks live in `frontend/hooks/`, dependency-free:

| Hook               | Use                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- |
| `useClickOutside`  | Close popovers/dropdowns on outside click. Supports `ignoreSelector` for toggles.  |
| `useEscapeClose`   | Close dialogs/sheets on `Escape`.                                                  |
| `useFocusTrap`     | Tab-loop inside a container, restore previously-focused element on unmount.        |
| `useInView`        | Native `IntersectionObserver`. Swap to `motion/react` if you adopt the motion lib. |
| `useMediaQuery`    | `useSyncExternalStore` wrapper on `matchMedia`. Live updates on preference change. |
| `useReducedMotion` | Boolean from `(prefers-reduced-motion: reduce)`. Honor in every animation.         |

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable                        | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID                             |
| `NEXT_PUBLIC_SANITY_DATASET`    | Dataset name (e.g., `production`)             |
| `SANITY_API_READ_TOKEN`         | API token with read access (for live preview) |
| `NEXT_PUBLIC_SITE_URL`          | Production URL (for SEO/sitemap)              |

### Studio (`studio/.env`)

| Variable                   | Description       |
| -------------------------- | ----------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project ID |
| `SANITY_STUDIO_DATASET`    | Dataset name      |

## Available Commands

| Command                       | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `npm run dev`                 | Start frontend + studio in parallel          |
| `npm run format`              | Format all files with Prettier               |
| `npm run lint`                | Lint frontend with ESLint                    |
| `npm run type-check`          | TypeScript check across all workspaces       |
| `npm run build -w frontend`   | Build the frontend for production            |
| `npm run typegen -w frontend` | Generate TypeScript types from Sanity schema |
| `npm run deploy -w studio`    | Deploy Studio to `*.sanity.studio`           |

## Deployment

### Studio

```bash
npm run deploy -w studio
```

First deploy prompts for a unique hostname (e.g., `my-project.sanity.studio`).

### Frontend (Vercel)

1. Push to GitHub
2. Import in Vercel with **Root Directory** set to `frontend`
3. Set environment variables listed above

## Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Detailed development guide
- **[CHANGELOG.md](CHANGELOG.md)** - Release notes (Keep a Changelog)
- **[Sanity Documentation](https://www.sanity.io/docs)**
- **[Next.js Documentation](https://nextjs.org/docs)**
- **[next-intl Documentation](https://next-intl-docs.vercel.app/)**

## Versioning

This starter follows [Semantic Versioning](https://semver.org/). Releases are documented in [CHANGELOG.md](CHANGELOG.md) (Keep a Changelog format) and tagged in git as `vX.Y.Z`.

The current minor cadence (`v0.x.y`) is deliberate: the API will stabilize at `v1.0.0` after the starter has been used as the base for a second BARR project (round-trip validation). Until then, every minor bump is shippable but may include intentional breaking changes — read the CHANGELOG before pulling updates into a derived project.

## License

MIT

---

**Built by [Luca Gennaro - Barr Digital](https://github.com/luca-gennaro)**
