# Changelog

All notable changes to this starter will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/barr-digital/sanity-nextjs-starter/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/barr-digital/sanity-nextjs-starter/releases/tag/v0.1.0
