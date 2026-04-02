import React from 'react'
import { ExampleBlock } from '@/components/blocks/example-block'

type BlockType = {
  _type: string
  _key: string
}

type BlockProps = {
  index: number
  block: BlockType
  pageId: string
  pageType: string
}

/**
 * BlockRenderer maps block types to their corresponding React components.
 *
 * How to add a new block type:
 * 1. Create a new block component in components/Blocks/ (e.g., TextBlock.tsx)
 * 2. Import it in this file
 * 3. Add it to the getBlocks() map with the same key as your Sanity schema _type
 *
 * Example:
 * ```tsx
 * import { TextBlock } from "@/components/Blocks/TextBlock";
 *
 * const getBlocks = () => ({
 *   exampleBlock: ExampleBlock,
 *   textBlock: TextBlock,  // Add your new block here
 * });
 * ```
 */
const getBlocks = () => ({
  exampleBlock: ExampleBlock,
  // TODO: Add your custom block types here
  // textBlock: TextBlock,
  // heroBlock: HeroBlock,
  // etc.
})

type BlocksMap = ReturnType<typeof getBlocks>

export const BlockRenderer = ({ block, index, pageId, pageType }: BlockProps) => {
  const Blocks = getBlocks()

  // Check if a component exists for this block type
  if (block._type in Blocks) {
    const BlockComponent = Blocks[block._type as keyof BlocksMap]
    return (
      <div key={block._key}>
        {React.createElement(BlockComponent, {
          key: block._key,
          block: block,
          index: index,
        })}
      </div>
    )
  }

  // Block component doesn't exist - show a placeholder
  return (
    <div
      key={block._key}
      className="my-4 w-full rounded border-2 border-dashed border-gray-300 bg-gray-100 p-10 text-center text-gray-600"
    >
      <p className="font-mono text-sm">
        Block type &ldquo;{block._type}&rdquo; has not been implemented yet.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Create a component in /components/Blocks/{block._type}.tsx and register it in
        BlockRenderer.tsx
      </p>
    </div>
  )
}
