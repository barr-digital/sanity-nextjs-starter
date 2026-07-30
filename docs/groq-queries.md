# GROQ — queries, projections & fragments

Conventions for reading content from Sanity. Read this before writing or changing any query.

All queries live in **`frontend/sanity/lib/queries.ts`** and are written with `defineQuery` (required for typegen). The frontend runs them through the project's fetch helper (`sanity/lib/live.ts` / `client.ts`) — never with an ad-hoc client.

## Projection rules

1. **`...` pulls all top-level fields.** string/text/image objects/arrays of primitives already arrive complete — don't re-project them.
2. **Project explicitly** only for:
   - **references** (`->`): e.g. `"pageSlug": page->slug.current`
   - **derived assets**: e.g. `"fileUrl": file.asset->url`
   - **arrays of objects** with fields to resolve: `items[]{ ..., "fileUrl": file.asset->url }`
3. **Per-block projections** inside `pageBuilder[]` use a conditional spread by type:

   ```groq
   "pageBuilder": pageBuilder[] {
     ...,
     _type == "textBlock" => { ..., cta ${linkFragment} },
     _type == "galleryBlock" => { ..., images[] ${imageFragment} }
   }
   ```

4. **Replicate the projection in every query that renders the block** (or keep a single shared page-builder fragment interpolated everywhere). A projection present in one query and missing in another is the #1 cause of "the field is empty only on one page".

## Reusable fragments

Define fragments as template strings at the top of `queries.ts` and interpolate them. Prefix with `/* groq */` — it enables highlighting and typegen parsing.

The starter ships four fragments — reuse them, don't re-project the shapes inline:

- `imageFragment` — for every `img` field
- `linkFragment` — for every `link` field (dereferences the page reference)
- `portableTextFragment` — rich text with link `markDefs` resolved
- `pageBuilderFragment` — per-block conditional projections

```ts
const imageFragment = /* groq */ `{ asset, hotspot, crop, alt }`

const linkFragment = /* groq */ `{
  _type, label, linkType, href, custom, anchor,
  "pageSlug": page->slug.current,
  "pageType": page->_type,
  openInNewTab
}`

const pageBuilderFragment = /* groq */ `{
  ...,
  _type == "textBlock" => { ..., cta ${linkFragment} }
}`
```

When adding a block, **extend `pageBuilderFragment`** — don't create a separate query per block. New recurring shapes (e.g. the `seo` projection, see [seo-and-metadata.md](seo-and-metadata.md)) get their own fragment following the same pattern. One fragment, reused — never duplicate the shape inline.

## i18n: language filter & coalesce

With document-level internationalization every page query filters by language, passed as a param:

```ts
export const homepageQuery = defineQuery(`
  *[_type == "homepage" && language == $lang][0]{
    "title": coalesce(breadcrumbLabel, title),
    "pageBuilder": pageBuilder[] ${pageBuilderFragment}
  }
`)
```

- Always pass `$lang` from the route's locale — never hardcode a locale in a query.
- Use `coalesce(a, b)` for field-level fallbacks (alternate field, or default-language value for internationalized-array fields) so downstream code reads a single key.

## After modifying a query

1. `npm run typegen --workspace=frontend` (schema unchanged → typegen is enough).
2. Update field usage in the component.
3. `npm run type-check`.

> Verify queries against the live schema with **Vision** in the Studio or the Sanity MCP (`query_documents`). Don't guess field names: read them from `studio/src/schema-types/` or `get_schema`. If a query mentions a type that doesn't exist in the schema, it's a leftover — see [conventions-and-pitfalls.md](conventions-and-pitfalls.md).
