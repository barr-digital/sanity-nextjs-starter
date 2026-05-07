# Changelog

All notable changes to this starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-05-07

SEO suite — every starter-derived site gets production-grade hreflang, robots.txt, JSON-LD helpers, and a Vercel-aware `metadataBase`.

### Added

- **`buildAlternateLanguages({ currentSlug, currentLocale })`** in `frontend/lib/data/metadata.ts` — resolves translated slugs for every other locale via `@sanity/document-internationalization` (`translation.metadata`), omits locales without a translation (Google prefers a missing hreflang over a wrong one), duplicates the default locale entry as `x-default`. Wired into `generateMetadata` for the homepage; downstream page types inherit by calling the same helper.
- **`app/robots.ts`** — generates `/robots.txt` at the canonical origin. Includes the sitemap reference and a commented-out `disallow: ['/admin', '/api/private']` template (uncomment when you add an admin area or auth-walled routes).
- **`frontend/lib/data/json-ld.ts`** — two helpers for schema.org structured data:
  - `buildOrganizationJsonLd({ name, description, logoUrl, ogImageUrl }, baseUrl)` — universal "this site represents X" signal. Address/contactPoint intentionally omitted (varies by country/project; extend inline at the call site if needed).
  - `buildBreadcrumbJsonLd(items, baseUrl)` — `BreadcrumbList` JSON-LD object, ready to embed via `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(...) }} />`. No UI component shipped — the visual representation varies too much per design.

### Changed

- **Moved + marker added**: `frontend/lib/helpers/metadata.ts` → `frontend/lib/data/metadata.ts` with `import 'server-only'` as the first line. `getMetadataBase` and `buildCanonicalPath` are now co-located with `buildAlternateLanguages`. Updated consumers: `app/[locale]/[[...slug]]/page.tsx` and `app/sitemap.ts`.
- **`getMetadataBase` resolution order rewritten** (Vercel-first):
  1. `VERCEL_PROJECT_PRODUCTION_URL` — auto-injected by Vercel, always points at the production domain even on preview deploys.
  2. Request `headers()` (`host` + `x-forwarded-proto`) — fallback for local dev or non-Vercel hosts.
  3. `NEXT_PUBLIC_SITE_URL` — last-resort static fallback for build contexts outside a request.
- **`generateMetadata` for the homepage** now passes `alternates.languages` (built via `buildAlternateLanguages`) alongside `alternates.canonical`. Existing fallback path (when the homepage document is missing) also includes the languages map.

### Notes

- `frontend/lib/helpers/sitemap.ts` stays in `helpers/` (pipeline helper, not a domain read).
- `metadataBase` is now reliable across preview deploys: Vercel preview URLs no longer leak into OG images / canonical URLs.

## [0.4.0] - 2026-05-07

**Breaking** — naming refactor of frontend folders + form stack landing + Guideline BARR aligned.

If you cloned the starter before v0.4.0, the import paths below have moved. Run a search-and-replace across your project:

| Old path                         | New path                             |
| -------------------------------- | ------------------------------------ |
| `@/lib/actions/translate-slug`   | `@/actions/translate-slug`           |
| `@/lib/helpers/slug-translation` | `@/lib/data/translations`            |
| (none — new folder)              | `@/lib/data/<domain>` (RSC-only)     |
| (none — new folder)              | `@/actions/<domain>` (Server Action) |
| (none — new folder)              | `@/schema/<domain>` (zod)            |

### Added

- **`frontend/actions/`** at the top level — all Server Actions (`"use server"`) live here, one file per domain. Replaces `frontend/lib/actions/`.
- **`frontend/lib/data/`** — RSC-only reads with `import 'server-only'` as the first line (bundler enforcement: a Client Component that imports a `lib/data/` file fails the build). Domain-agnostic: Sanity reads, Supabase reads, external API reads, all live here when called only from Server Components.
- **`frontend/schema/`** (singular) — shared zod schemas, imported by both client forms (RHF + zodResolver) and Server Actions. Starts with `contact.ts`.
- **Form stack dependencies**: `zod@^4.4.3`, `react-hook-form@^7.75.0`, `@hookform/resolvers@^5.2.2`, `class-variance-authority@^0.7.1`.
- **Example contact form** as the BARR pattern reference:
  - `frontend/schema/contact.ts` — zod schema
  - `frontend/actions/contact.ts` — Server Action with `safeParse(input)` as the first line, returns `{ success, error? }` (never throws toward the client)
  - `frontend/components/forms/contact-form.tsx` — client component with React Hook Form + zodResolver, loading state, server error display, post-submit acknowledgment

### Changed

- **Moved**: `frontend/lib/actions/translate-slug.ts` → `frontend/actions/translate-slug.ts`. Updated the single consumer (`frontend/hooks/use-language-change.ts`).
- **Moved + marker added**: `frontend/lib/helpers/slug-translation.ts` → `frontend/lib/data/translations.ts` with `import 'server-only'` as the first line. The Server Action wrapping it (`actions/translate-slug.ts`) now imports from `@/lib/data/translations`.

### Documentation

- **BARR Development Guideline updated** in the BARR knowledge vault (`operativo/guideline.md` + `operativo/stack/nextjs-app-router.md`):
  1. "Base comune" lists `lib/data/` as the home for RSC-only reads.
  2. New section "Dove vive una lettura: `lib/data/` vs `actions/`" with the practical decisional rule.
  3. "Dove posizionare i file speciali" — reformulated the `loading.tsx` rule: only per-route, never catch-all (aligned with labochem ADR 2026-04-18 and the starter v0.6.0 boundary plan).

### Notes

- `frontend/lib/helpers/` survives — `metadata.ts` and `sitemap.ts` are pipeline helpers (not domain reads), they keep their location.
- The `page` reference in `link` schema still defaults to `[{ type: 'homepage' }]` only (extend with your own document types).

## [0.3.0] - 2026-05-07

Studio custom inputs (Ondata 2 of the BARR preset). Object inputs collapse into card previews when not focused; SEO and Settings get rich inline social previews + character counters; the live `useSettingsFallback` hook keeps page-level SEO defaults synced.

### Added

- **`CollapsibleCardInput`** primitive (`studio/src/inputs/collapsible-card-input.tsx`) — every reusable object input (`link`, `img`, `seo`) now shows a card preview when collapsed and expands inline on click. Supports the `renderCard` prop and an opt-in `renderForm` for inputs that need to swap the form too.
- **`CharCounterInput`** (`studio/src/inputs/char-counter-input.tsx`) — string/text input with soft-min/soft-max character feedback (used by `seo`).
- **`LinkInput`** + **`link-helpers.ts`** — auto-detects URL vs `mailto:`/`tel:` as the editor types, strips stale fields when `linkType` changes, and resolves a Lucide icon based on the link kind.
- **`ImgInput`** + **`img-helpers.ts`** — image upload UX with preview card.
- **`SeoInput`** + `SeoTitleInput` + `SeoDescriptionInput` + **`seo-helpers.ts`** — collapsible SEO with SERP preview + Open Graph card preview + character counters. Resolves `seoTitle`/`seoDescription`/`seoImage` from the live `settings` singleton when empty (visible "Using Settings defaults" hint).
- **`SettingsInput`** + **`settings-fallback.ts`** + **`social-preview-cards.tsx`** — the `settings` singleton now shows live SERP + OG previews above its form fields.
- **New schema features**:
  - `link`: added `page` (reference, defaults to `homepage` — extend with your own document types) and `file` (uploaded asset) link types. Added rich `preview.prepare` with icon resolution.
  - `seo`: added per-field descriptions and `Meta title` / `Meta description` field titles.

### Changed

- **`link.ts`** — `components: { input: LinkInput }`, `icon: iconForSlot('link')`, validation rewritten with `isUncommitted` so empty CTAs publish silently when `linkType` is auto-set by `initialValue`. The `anchor` field is now also valid (optional) for `linkType === 'page'`.
- **`image.ts`** — `components: { input: ImgInput }`. Removed the custom `validation` on `alt` (the `ImgInput` UX now communicates the requirement; explicit alt validation belongs at the consumer field, not the type).
- **`seo.ts`** — `components: { input: SeoInput }`, per-field `components: { input: SeoTitleInput | SeoDescriptionInput }`. Removed `options.collapsible` (the `CollapsibleCardInput` handles collapse).
- **`settings.ts`** — `components: { input: SettingsInput }`. Field descriptions rewritten to clarify their fallback role.

## [0.2.0] - 2026-05-07

Studio foundations: editor-driven icons + universal block previews + bug fix on singleton creation + `basePage` schema split. First substantial preset BARR import from the labochem pilot.

### Added

- **Editor-driven icon system** — `studio/src/icons/` (5 files: `dynamic-icon`, `icon-config-provider`, `icon-resolver`, `slots`, `index`). Editors pick Lucide icons via right-click anywhere in the Studio. Slots registered for the starter scope (`homepage`, `header`, `footer`, `settings`, `globalsAndSettings` folder, `exampleBlock`, `link`, `studioIcons`). Default icon `HelpCircle` ("?") invites editors to personalize.
- **Universal block preview system** — `studio/src/previews/` (`smart-block-preview`, `block-add-item-preview`, `mocks/` with 6 mock components: `card-grid`, `cta`, `form`, `paragraph`, `search`, `video`). Every PageBuilder block gets rich automatic previews in both the list view and the "Add item" menu, with role inference from Sanity types.
- **`studioIcons` singleton** (`studio/src/schema-types/documents/singletons/studio-icons.ts`) — registered in `SINGLETON_TYPES`, hidden from sidebar (editable via right-click only), excluded from i18n (icons are design-system, not content).
- **`breadcrumbLabel` field on `basePage`** — short label for breadcrumbs alongside `title`. Slug source falls back: `title || breadcrumbLabel`. Frontend GROQ uses `coalesce(breadcrumbLabel, title)` so legacy and new documents both resolve.
- **Studio dependencies**: `lucide-react@^0.562.0`, `sanity-plugin-lucide-icon-picker@^1.0.3`, `@sanity/image-url@^2.1.1`.
- **`.npmrc` with `legacy-peer-deps=true`** — required because `sanity-plugin-lucide-icon-picker@1.0.3` declares `peerDependencies.sanity: '^3'` while the starter is on `sanity@^5.x`. The plugin works fine; the peer declaration is just stale.

### Changed

- **`studio/sanity.config.ts` → `sanity.config.tsx`** — JSX is now used to mount `StudioLayout` (wraps the default Studio layout with `IconConfigProvider`). The `lucideIconPicker()` plugin is registered alongside the existing ones.
- **`structure/index.ts`** — every sidebar `S.listItem()` now uses `iconForSlot('xxx')` instead of `@sanity/icons` imports. `studioIcons` and the missing entries are added to `EXCLUDED_TYPES`.
- **All singletons (`homepage`, `header`, `footer`, `settings`)** — preview now embeds the language inline in the `title` (e.g. `"Homepage · Italian"`) instead of in `subtitle` (which Studio shows only in lists, not in the document header). Icons migrated to `iconForSlot()`.
- **`example-block.ts`** — refactored to the BARR PageBuilder convention: `icon: makeBlockAddItemPreview('exampleBlock')` + `components: { preview: SmartBlockPreview }` + `preview: autoSelect([...])`. The previous `preview.prepare()` was removed (incompatible with `components.preview`).
- **`pageBuilderFieldOptions`** — switched insert menu from `grid` to `list` view (with `SmartBlockPreview`, list view scrolls better than grid).
- **`schemaTypes` array + `SINGLETON_TYPES`** — `studioIcons` registered as singleton.
- **`homepageQuery`** uses `"title": coalesce(breadcrumbLabel, title)` for downstream code that reads `.title` regardless of which field is set.

### Fixed

- **Bug: singleton creation ignored selected language in `LanguageFilteredList`** — the previous code used `router.navigateIntent('create', { template, language })`, but the `documentInternationalization` plugin overrode the `language` parameter with the configured default (always `it`). Replaced with `client.create({ _type, language })` direct + `navigateIntent('edit')` to bypass the template system. The bug affected every singleton created from the custom list.

## [0.1.0] - 2026-05-07

Baseline release dello starter come fonte versionata. Niente nuove feature: setup di versionamento + igienizzazioni minimali dello stack.

### Added

- Versionamento attivo: root `package.json` con `"version": "0.1.0"` e `"private": true`.
- `tw-animate-css@^1.4.0` in `frontend/package.json` + `@import 'tw-animate-css'` in `frontend/app/globals.css`.
- `tailwind-merge@^3.5.0` in `frontend/package.json` (smart Tailwind class conflict resolution).
- `CHANGELOG.md` alla root, formato Keep a Changelog.

### Changed

- `studio/package.json` versione `1.0.0` → `0.1.0` (riallineamento per coerenza con la roadmap; `1.0.0` era default Sanity init senza significato).
- `frontend/utils/cn.ts` aggiornato per usare `clsx` + `twMerge` (era solo `clsx`).

### Removed

- `sanity-image@^1.0.0` da `frontend/package.json` (legacy, nessun import nel codice).

[Unreleased]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/barr-digital/sanity-nextjs-starter/releases/tag/v0.1.0
