import React from 'react'
import { ExampleBlock } from '@/components/blocks/example-block'
import type { ExtractPageBuilderType, PageBuilderBlock } from '@/types/sanity'

type BlockType = {
  _type: string
  _key: string
}

// Each key must be a page-builder block _type, and its component must accept that
// block's shape: a typo in a key or a mismatched component fails type-check.
type BlockComponents = {
  [K in PageBuilderBlock['_type']]?: React.ComponentType<{
    block: ExtractPageBuilderType<K>
    index: number
  }>
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
 * 1. Create a new block component in components/blocks/ (e.g., text-block.tsx),
 *    typed with ExtractPageBuilderType<'textBlock'>
 * 2. Import it in this file
 * 3. Add it to the getBlocks() map with the same key as your Sanity schema _type
 *
 * Example:
 * ```tsx
 * import { TextBlock } from '@/components/blocks/text-block'
 *
 * const getBlocks = () => ({
 *   exampleBlock: ExampleBlock,
 *   textBlock: TextBlock,  // Add your new block here
 * });
 * ```
 */
const getBlocks = () =>
  ({
    exampleBlock: ExampleBlock,
    // TODO: Add your custom block types here
    // textBlock: TextBlock,
    // heroBlock: HeroBlock,
    // etc.
  }) satisfies BlockComponents

type BlocksMap = ReturnType<typeof getBlocks>

export const BlockRenderer = ({ block, index }: BlockProps) => {
  const Blocks = getBlocks()

  // Check if a component exists for this block type
  if (block._type in Blocks) {
    // Indexing the map by a runtime _type yields a union of components whose `block`
    // props are mutually exclusive, which no single block value can satisfy. The map
    // is keyed by _type, so each component does receive its own block shape.
    const BlockComponent = Blocks[block._type as keyof BlocksMap] as React.ComponentType<{
      block: BlockType
      index: number
    }>
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
        Create a component in /components/blocks/ and register it in block-renderer.tsx
      </p>
    </div>
  )
}
