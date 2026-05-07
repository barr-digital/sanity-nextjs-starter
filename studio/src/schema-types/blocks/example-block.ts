import { defineType } from 'sanity'
import { SmartBlockPreview, autoSelect } from '../../previews/smart-block-preview'
import { makeBlockAddItemPreview } from '../../previews/block-add-item-preview'

/**
 * Example Block
 *
 * Reference block schema demonstrating the BARR PageBuilder block convention:
 *
 *   icon:       makeBlockAddItemPreview('<blockName>')   // rich preview in the "Add item" menu
 *   components: { preview: SmartBlockPreview }           // rich preview in the PageBuilder list
 *   preview:    autoSelect([...field names])             // auto-build preview.select
 *
 * Do NOT define `preview.prepare()` on a block — it conflicts with
 * `components.preview` and overrides the SmartBlockPreview rendering.
 *
 * To create a new block:
 * 1. Copy this file and rename it (e.g., textBlock.ts)
 * 2. Update the name, title, fields — keep the three preview hooks above
 * 3. Add the block name to `studio/src/icons/slots.ts` so editors can pick its icon
 * 4. Export it in schemaTypes/index.ts
 * 5. Add the block type to pageBuilderBlocks in blocks/config.ts
 * 6. Create the corresponding React component in frontend/components/blocks/
 * 7. Register it in frontend/components/layout/block-renderer.tsx
 */

export const exampleBlock = defineType({
  name: 'exampleBlock',
  title: 'Example Block',
  type: 'object',
  icon: makeBlockAddItemPreview('exampleBlock'),
  components: { preview: SmartBlockPreview },
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
