# Page Builder — creating and modifying a block

Step-by-step for adding or changing a page-builder block. Read this before any block task: the chain spans `studio/` and `frontend/`, and a skipped step is a silent bug (empty data, stale types, or the "block not implemented" placeholder).

> UI task? Paste the **Figma node-id** of the block in chat first. Claude reads the design via the Figma MCP to derive fields, layout and assets before writing code.

## The chain, in order

### 1. Block schema — `studio/src/schema-types/blocks/<block-name>.ts`

One file per block, kebab-case filename, **camelCase `name`** — the key linking schema ↔ query ↔ renderer. Use `defineType`/`defineField` and the SmartBlockPreview convention (see the example block in the repo):

```ts
import { defineType, defineField } from 'sanity'
import { SmartBlockPreview, autoSelect } from '../../previews/smart-block-preview'
import { makeBlockAddItemPreview } from '../../previews/block-add-item-preview'

export const textBlock = defineType({
  name: 'textBlock', // ← unique block key, camelCase
  title: 'Text Block',
  type: 'object',
  icon: makeBlockAddItemPreview('textBlock'), // rich preview in the "Add item" menu
  components: { preview: SmartBlockPreview }, // rich preview in the pageBuilder list
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
    defineField({ name: 'image', title: 'Image', type: 'img' }), // 'img', not 'image'
    defineField({ name: 'cta', title: 'CTA', type: 'link' }),
  ],
  preview: autoSelect(['title', 'text', 'image', 'cta']), // generates preview.select
})
```

**No `preview.prepare()` on blocks** — it conflicts with `SmartBlockPreview`. Preview roles are inferred from field types; force one with `options: { previewRole: '…' }`. Also add the block's icon slot in `studio/src/icons/slots.ts`.

### 2. Register + allow in the page builder

- **Registry**: import + entry in the schema array in `studio/src/schema-types/index.ts` (Blocks section).
- **Page builder**: add `{ type: 'textBlock' }` to `pageBuilderBlocks` in `studio/src/schema-types/blocks/config.ts`. Every page type that uses that array gets the block automatically.

### 3. Extract the schema

```bash
npm run extract-types --workspace=studio   # schema → studio/schema.json
```

### 4. GROQ fragment — `frontend/sanity/lib/queries.ts` _(only when needed)_

`pageBuilder` is fetched with a spread (`...`), so plain fields (string, text, image objects, arrays of primitives) already come through. **Add an explicit branch only** to resolve references (`->`) or derived asset values, inside the shared page-builder fragment:

```ts
const pageBuilderFragment = /* groq */ `{
  ...,
  _type == 'textBlock' => {
    ...,
    cta ${linkFragment},
    "fileUrl": file.asset->url
  }
}`
```

The fragment is interpolated into **every query that renders the page builder** — if the project has per-page queries instead, replicate the projection in each. See [groq-queries.md](groq-queries.md).

### 5. Regenerate types

```bash
npm run typegen --workspace=frontend       # schema.json + queries → frontend/sanity.types.ts
```

Order matters: extract (step 3) before typegen. Details: [sanity-schema-and-types.md](sanity-schema-and-types.md).

### 6. Component — `frontend/components/blocks/<block-name>.tsx`

Blocks receive `{ block, index }` from the renderer and **never fetch data themselves** (`PageBuilder` uses next-sanity's `useOptimistic`, so props-driven blocks stay live-preview-compatible). Type props with `ExtractPageBuilderType`; reuse `Picture`, the shared link/button component and typography tokens — see [styling-and-design-tokens.md](styling-and-design-tokens.md).

```tsx
import type { ExtractPageBuilderType } from '@/types/sanity'

type TextBlockProps = { block: ExtractPageBuilderType<'textBlock'>; index: number }

export const TextBlock = ({ block }: TextBlockProps) => (
  <section className="…">
    <h2 className="t-h2">{block.title}</h2>
    <p className="t-p">{block.text}</p>
  </section>
)
```

### 7. Register in the renderer — `frontend/components/layout/block-renderer.tsx`

Import + entry in the blocks map. **The key must equal the schema `name`** (step 1):

```tsx
const getBlocks = () => ({
  exampleBlock: ExampleBlock,
  textBlock: TextBlock, // key = schema name
})
```

A mismatch or missing entry shows the dashed _"Block type 'textBlock' has not been implemented"_ placeholder — the #1 symptom of a broken step 7. The blocks map and the schema registry must stay in sync.

### 8. Verify — preview

Ask the user to run `npm run dev` and add the block in the Studio: it must render on the frontend (and in the Studio preview/Presentation if enabled). `npm run type-check` must be green.

## Quick checklist

- [ ] 1. Schema in `blocks/<block-name>.ts` (camelCase `name`, SmartBlockPreview convention, icon slot in `icons/slots.ts`)
- [ ] 2. Registered in `schema-types/index.ts` + `pageBuilderBlocks` in `blocks/config.ts`
- [ ] 3. `extract-types` run (studio)
- [ ] 4. GROQ branch in the page-builder fragment (only if references/derived)
- [ ] 5. `typegen` run (frontend)
- [ ] 6. Component in `components/blocks/<block-name>.tsx`
- [ ] 7. Entry in `block-renderer.tsx` with key = schema `name`
- [ ] 8. `type-check` green, block visible in dev/preview

## Modifying an existing block

- **Adding a field**: schema (1) → extract (3) → projection if reference/derived (4) → typegen (5) → use in component (6). Additive = safe in production.
- **Renaming/removing a field**: existing data stays in the dataset but is no longer read — mind production. See [conventions-and-pitfalls.md](conventions-and-pitfalls.md).
- After any change: grep the field/block `name` across the repo for leftover usages.
