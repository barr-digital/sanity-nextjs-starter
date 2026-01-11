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

export const ExampleBlock = ({block, index}: ExampleBlockProps) => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 border-l-4 border-black-500 p-6 rounded">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {block.title || 'Example Block'}
          </h2>
          <p className="text-gray-800">
            {block.text ||
              'This is an example block. Replace this component with your own designs.'}
          </p>
          <p className="text-sm text-gray-800 mt-4 font-mono">
            Block type: {block._type} | Index: {index}
          </p>
        </div>
      </div>
    </section>
  )
}
