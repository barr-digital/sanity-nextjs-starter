# Sanity schema, type generation & Studio deploy

How the type pipeline works and how to keep it in sync. Read this before any schema or query change. Core rule: **types are generated, the schema is the source of truth.**

## The pipeline, two steps

```
schema TS (studio/src/schema-types/**)
        │  sanity schema extract --enforce-required-fields
        ▼
studio/schema.json                       ← JSON representation of the schema
        │  sanity typegen generate  (reads schema.json + the frontend GROQ)
        ▼
frontend/sanity.types.ts                 ← TS types for documents, objects and queries
```

`typegen` reads every `defineQuery` in the frontend and generates a `…Result` type per query (e.g. `HomepageQueryResult`). Always write queries with `defineQuery` (see [groq-queries.md](groq-queries.md)). **Never edit `sanity.types.ts` by hand.**

On the frontend, `frontend/types/sanity.ts` derives the hand-written helper types: `PageBuilderBlock` (union of block types), `ExtractPageBuilderType<'blockName'>` (props type for one block component) and `DereferencedLink` (link shape after GROQ dereferencing). Use these — don't re-derive types ad hoc.

## Commands

```bash
npm run extract-types --workspace=studio    # regenerate studio/schema.json
npm run typegen --workspace=frontend        # regenerate frontend/sanity.types.ts
```

Automatic: the frontend's `predev`/`prebuild` run `typegen`; the studio's `prebuild` runs `extract-types`.

**Limitation to remember**: the frontend `predev` regenerates types _from the current `schema.json`_. If you changed a schema and didn't re-run `extract-types`, typegen works off a stale schema. So: **schema changed → extract (studio) → typegen (frontend)**, in that order.

## When to regenerate (Claude decides — the user shouldn't have to ask)

- After adding/changing/removing a field or type → **extract + typegen**.
- After changing a GROQ query (`queries.ts`) → just `typegen` (schema unchanged).
- Not needed for markup/style-only changes.

Final check: `npm run type-check`. If types don't match component usage, almost always a pipeline step or a query projection is missing.

## Schema organization

```
studio/src/schema-types/
├── index.ts                 # registry: imports + schemaTypes array (Singletons / Objects / Blocks / Documents)
├── documents/
│   ├── base-page.ts         # shared page fields: title, slug, seo, language
│   ├── singletons/          # homepage, header, footer, settings, …
│   └── collections/         # multi-instance document types (e.g. page, post)
├── objects/                 # reusable field types: link, img, seo
└── blocks/                  # page-builder blocks + config.ts (pageBuilderBlocks array)
```

- **Singleton** = one document per type (per language, if internationalized), attached in the sidebar via `structure/`. To add one: schema in `documents/singletons/`, register in `index.ts`, add to the singleton list, entry in the structure.
- **Collection** = multi-instance document type, reached by slug in the frontend, listed in the sidebar.
- **Object** = reusable structure living inside a field.
- **Block** = an object allowed inside `pageBuilder` (see [page-builder-blocks.md](page-builder-blocks.md)).

Conventions:

- Kebab-case filenames, camelCase type `name`s.
- Always `defineType`/`defineField`; every field gets a `title` (and a `description` only when the label isn't enough — no filler descriptions).
- All schema strings (`title`, `description`, custom `validation` messages) in **English**.
- `initialValue` only for **structural choices** (booleans, technical enums) — never for UI strings, which are content and vary per language.
- Every block/document has a meaningful preview for the editor.
- Page types share fields by spreading the base page schema (`documents/base-page.ts`: `language` with unique-language validation, `title`, `breadcrumbLabel`, `slug` with per-language uniqueness, `seo`) — new page types inherit `seo` (see [seo-and-metadata.md](seo-and-metadata.md)) instead of redefining it.
- Adding `validation: Rule.required()` on a populated type marks existing documents invalid in the Studio — introduce `required` cautiously.

## Reusable objects (already defined)

| Name   | What                                                                         | Frontend counterpart              |
| ------ | ---------------------------------------------------------------------------- | --------------------------------- |
| `img`  | image with `alt`, hotspot/crop, custom card input                            | `Picture` component               |
| `link` | multi-type link: external URL, `custom` (mailto/tel), anchor, page reference | `Link` component + `linkResolver` |
| `seo`  | `seoTitle`, `seoDescription`, `seoKeywords`, `seoImage`                      | shared metadata helper            |

- **Use `type: 'img'` for every content image, never raw `type: 'image'`** — it carries the alt field and the custom input.
- **Use `type: 'link'` for every CTA/nav link.** When you add a routed document type, add it to the `to: [...]` reference list in `objects/link.ts`.
- Extend the shared object (or add a new one in `objects/`) instead of forking variants inline in a block schema.

## Studio UI conventions (custom systems in the starter)

- **Icon slots** — document/structure/block icons are editor-driven: use `icon: iconForSlot('slotName')` (from `studio/src/icons`) and add the slot in `studio/src/icons/slots.ts`. Never hardcode `@sanity/icons` imports. Editors override any icon via right-click in the Studio (backed by the non-localized `studioIcons` singleton); default is the `HelpCircle` "?" until customized.
- **Block previews** — every page-builder block follows the SmartBlockPreview convention (`icon: makeBlockAddItemPreview(...)`, `components: { preview: SmartBlockPreview }`, `preview: autoSelect([...])` — snippet in [page-builder-blocks.md](page-builder-blocks.md)). **Never add `preview.prepare()` to a block**: it conflicts with `components.preview`. Preview roles are inferred from field types; force one with `options: { previewRole: '…' }`, and add new roles as mocks in `studio/src/previews/mocks/`.
- **Object inputs** — the reusable objects (`link`, `img`, `seo`) use `CollapsibleCardInput` (`studio/src/inputs/collapsible-card-input.tsx`): a preview card when closed, the full form on click. New custom object inputs should wrap the same primitive; pass `defaultExpanded` when the object is an array item to avoid a double click inside array dialogs.
- **Optional pattern (not in the starter)**: on long documents, prefer `groups` (horizontal tabs) over collapsible fieldsets; hide the default tab with `{ ...ALL_FIELDS_GROUP, hidden: true }` and give every visible field a `group`.

## Studio deploy

`sanity deploy` publishes the Studio **build and schema** to the Sanity host (`SANITY_STUDIO_STUDIO_HOST`). **It does not touch dataset content**, but the new schema is immediately live for editors.

```bash
npm run deploy --workspace=studio     # = sanity deploy
```

- **Policy: Claude never deploys on its own.** Test schema changes **locally** with `npm run dev:studio` (the local Studio runs the new schema without deploying). The production deploy is run by the **Tech Lead after PR review/merge** — this keeps the live Studio schema in sync with merged code.
- Keep deployed changes additive or deliberate: dataset strategy and cautions in [deploy-and-env.md](deploy-and-env.md) and [conventions-and-pitfalls.md](conventions-and-pitfalls.md).
- The **Sanity MCP** can inspect the live schema (`get_schema`) and run read queries; deploys and mutations stay approval-gated.
