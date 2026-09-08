import { defineType } from 'sanity'
import { autoSelect } from '../../previews/smart-block-preview'
import { makeBlockAddItemPreview } from '../../previews/block-add-item-preview'
import { ExampleBlockPreview } from '../../previews/blocks/example-block-preview'

/**
 * Example Block
 *
 * Reference block schema demonstrating the BARR PageBuilder block convention
 * (the barr-website-v3 pattern):
 *
 *   icon:       makeBlockAddItemPreview('<blockName>')   // rich preview in the "Add item" menu
 *   components: { preview: <Block>Preview }              // per-block MOCKUP preview in the PageBuilder list
 *                                                        // (previews/blocks/<block-name>-preview.tsx, built on ./mockup.tsx)
 *   preview:    autoSelect([...field names])             // auto-build preview.select — feeds the mockup's props
 *
 * While a block's mockup preview is not built yet, `SmartBlockPreview`
 * (from previews/smart-block-preview) is the acceptable bootstrap fallback —
 * replace it before the block ships.
 *
 * Do NOT define `preview.prepare()` on a block — it conflicts with
 * `components.preview` and overrides the custom rendering.
 *
 * To create a new block:
 * 1. Copy this file and rename it (e.g., textBlock.ts)
 * 2. Update the name, title, fields — keep the three preview hooks above
 * 3. Create the mockup preview in `previews/blocks/<block-name>-preview.tsx`
 *    (miniature of the real section layout — see example-block-preview.tsx)
 * 4. Add the block name to `studio/src/icons/slots.ts` so editors can pick its icon
 * 5. Export it in schemaTypes/index.ts
 * 6. Add the block type to pageBuilderBlocks in blocks/config.ts
 * 7. Create the corresponding React component in frontend/components/blocks/
 * 8. Register it in frontend/components/layout/block-renderer.tsx
 */

export const exampleBlock = defineType({
  name: 'exampleBlock',
  title: 'Example Block',
  type: 'object',
  icon: makeBlockAddItemPreview('exampleBlock'),
  components: { preview: ExampleBlockPreview },
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The heading for this block',
    },
    {
      name: 'text',
      title: 'Text',
      type: 'text',
      description: 'The body text for this block',
      rows: 3,
    },
  ],
  preview: autoSelect(['title', 'text']),
})
