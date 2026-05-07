# Changelog

All notable changes to this starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/barr-digital/sanity-nextjs-starter/releases/tag/v0.1.0
