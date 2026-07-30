# SEO & metadata

How every page gets correct metadata. Read this when adding a routed page type or touching metadata, sitemap or robots. Goal: every page has a non-empty `<title>` and `<meta name="description">`, a **correct per-page canonical**, and sane fallbacks — with `noIndex` respected everywhere.

## How it works

- **Global defaults** — the root/locale `layout.tsx` `generateMetadata` sets: `metadataBase`, a `title` template (`%s | ${settings.title}`) + default title, the global description and default OG image — sourced from the `settings` singleton. Because the template appends the site name automatically, **never include it in a document's `seoTitle`**. Site-wide JSON-LD (e.g. Organization) also lives here.
- **`metadataBase`** is resolved by `getMetadataBase()` in `frontend/lib/data/metadata.ts` — Vercel-aware (`VERCEL_PROJECT_PRODUCTION_URL` → request headers → `NEXT_PUBLIC_SITE_URL` fallback). Use it everywhere; never read env vars or `headers()` directly for URLs.
- **Per-page** — each route's `generateMetadata` builds metadata from the document's `seo` object through the shared helpers in `frontend/lib/data/metadata.ts`: `buildCanonicalPath(locale, slug, defaultLocale)` for the canonical and `buildAlternateLanguages(...)` for hreflang (sibling slugs resolved via `translation.metadata`). Don't reimplement metadata per page — route everything through these.
- **The key gotcha** — the helper must **omit keys it has no value for**. Returning `title: undefined` from a page _clears_ the layout default (removes the tag). **Leave keys out to inherit**; only set them when the CMS provides content.
- Fetches that feed metadata must not leak stega-encoded strings into `<title>`/meta — use the non-stega fetch option for metadata queries.

## The `seo` CMS object

Defined once as an object type (`studio/src/schema-types/objects/seo.ts`) and included in the shared base page schema — so every page type inherits it:

| Field            | Type             | Notes                                                                                        |
| ---------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| `seoTitle`       | string (~60 max) | overrides the title; site name appended by the template — don't include it                   |
| `seoDescription` | text (~160 max)  | overrides the description                                                                    |
| `seoKeywords`    | array of strings | optional, mostly ignored by engines                                                          |
| `seoImage`       | `img`            | social share image (1200×630); falls back to `settings.ogImage`                              |
| `noIndex`        | boolean          | _per-project addition (not in the starter object yet)_ — excludes from index **and** sitemap |

Project it into queries via a reusable `seo` fragment (see [groq-queries.md](groq-queries.md)) — the same fragment in every page query.

Typical route wiring:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const [page, metadataBase, languages] = await Promise.all([
    fetchPage(slug, locale), // query must include the seo fragment
    getMetadataBase(),
    buildAlternateLanguages({ currentSlug: slug, currentLocale: locale }),
  ])
  const canonical = buildCanonicalPath(locale, slug, routing.defaultLocale)
  // build Metadata from page.seo — omit keys with no value (inherit the defaults)
}
```

## Canonical & OG

- Canonical = site origin + the page's localized path, always via `buildCanonicalPath` — never hand-written per page.
- With multiple locales, emit `alternates.languages` (hreflang) via `buildAlternateLanguages` — it resolves each sibling document's localized slug through `translation.metadata` (slugs differ per locale).
- OG: per-page `seoImage` when set, otherwise the global default; OG title/description follow the same omit-to-inherit rule.

## JSON-LD

Structured-data builders live in `frontend/lib/data/json-ld.ts`: `buildOrganizationJsonLd` (site-wide, emitted from the layout/homepage) and `buildBreadcrumbJsonLd` (locale-aware absolute URLs). Add new schema types there — one builder per type, data fetched via GROQ, never hardcoded — and validate with Google's Rich Results Test and validator.schema.org.

## Sitemap & robots

- **`frontend/app/sitemap.ts`** builds absolute URLs from `the site URL (`NEXT_PUBLIC_SITE_URL`/`getMetadataBase()`, set per project)`, maps document types to routes (singletons → fixed paths, collections → `/<slug>`) and **excludes `noIndex` documents**. Keep the type→route mapping in sync with the App Router folders — a new routed type must be added here.
- **`frontend/app/robots.ts`** allows crawling in production and points to the sitemap. Non-production deployments (previews) must not be indexable.

## When adding a new routed page type

1. Spread the base page schema → the `seo` object is **inherited**, nothing to add.
2. Include the `seo` fragment in the type's query.
3. The route's `generateMetadata` calls the shared helper with the page's path.
4. Add the type to the `sitemap.ts` mapping (it will respect `noIndex`).

## Favicons & app icons

App Router auto-detects conventional files — no code needed: `app/icon.png` (512×512, browser tab — Next.js downscales to 16/32/48), `app/apple-icon.png` (180×180, iOS home screen), optional `public/favicon.ico` (multi-res legacy fallback). PNGs: square, **opaque background** (no transparency — some browsers/iOS fill it), ~10% inner padding, brand-colored so it reads at 16×16.

> Don't reinvent metadata handling per page: one helper, one `seo` fragment, one sitemap mapping.
