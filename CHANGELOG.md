# Changelog

All notable changes to this starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/barr-digital/sanity-nextjs-starter/releases/tag/v0.1.0
