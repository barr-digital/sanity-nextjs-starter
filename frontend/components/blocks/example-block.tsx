/**
 * ExampleBlock - A reference block component
 *
 * This is an example block to demonstrate how to create PageBuilder blocks.
 * You can use this as a template when creating your own block types.
 *
 * To create a new block:
 * 1. Copy this file and rename it (e.g., TextBlock.tsx)
 * 2. Update the component name and logic
 * 3. Create the corresponding Sanity schema in studio/src/schemaTypes/blocks/
 * 4. Add it to pageBuilderBlocks in studio/src/schemaTypes/blocks/config.ts
 * 5. Register it in BlockRenderer.tsx
 *
 * Block Structure:
 * - Receives `block` prop with all data from Sanity
 * - Can be styled with Tailwind or your preferred CSS approach
 * - Should handle null/undefined data gracefully
 */

type ExampleBlockProps = {
  block: {
    _key: string
    _type: string
    title?: string
    text?: string
  }
  index: number
}

export const ExampleBlock = ({ block, index }: ExampleBlockProps) => {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="border-black-500 rounded border-l-4 bg-gray-100 p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            {block.title || 'Example Block'}
          </h2>
          <p className="text-gray-800">
            {block.text ||
              'This is an example block. Replace this component with your own designs.'}
          </p>
          <p className="mt-4 font-mono text-sm text-gray-800">
            Block type: {block._type} | Index: {index}
          </p>
        </div>
      </div>
    </section>
  )
}
