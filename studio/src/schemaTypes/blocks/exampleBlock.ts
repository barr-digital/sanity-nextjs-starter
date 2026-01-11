import {defineType} from 'sanity'

/**
 * Example Block
 *
 * This is a reference block schema to demonstrate how to create PageBuilder blocks.
 * Use this as a template when creating your own block types.
 *
 * To create a new block:
 * 1. Copy this file and rename it (e.g., textBlock.ts)
 * 2. Update the name, title, and fields
 * 3. Export it in schemaTypes/blocks/index.ts
 * 4. Add the block type to pageBuilderBlocks in blocks/config.ts
 * 5. Register the block in schemaTypes/index.ts
 * 6. Create the corresponding React component in frontend/components/Blocks/
 * 7. Register it in frontend/components/Layout/BlockRenderer.tsx
 */

export const exampleBlock = defineType({
  name: 'exampleBlock',
  title: 'Example Block',
  type: 'object',
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
  preview: {
    select: {
      title: 'title',
      text: 'text',
    },
    prepare({title, text}) {
      return {
        title: title || 'Example Block',
        subtitle: text ? text.substring(0, 60) + '...' : 'No text provided',
      }
    },
  },
})
