'use client'

import {SanityDocument} from 'next-sanity'
import {useOptimistic} from 'next-sanity/hooks'
import {BlockRenderer} from '@/components/Layout/BlockRenderer'

type PageBuilderBlock = {
  _key: string
  _type: string
}

type PageData = {
  _id: string
  _type: string
  pageBuilder?: PageBuilderBlock[]
}

type PageBuilderProps = {
  page: PageData | null
}

/**
 * The PageBuilder component renders blocks from the `pageBuilder` field in your Sanity documents.
 *
 * It uses Sanity's live preview capabilities to enable real-time visual editing.
 * When someone makes an edit in the Studio, the page updates automatically.
 *
 * How to use:
 * 1. Add a `pageBuilder` field to your Sanity document schema
 * 2. Define block types in your schema (e.g., textBlock, heroBlock, etc.)
 * 3. Create corresponding React components for each block type
 * 4. Register your block components in BlockRenderer.tsx
 */
export const PageBuilder = ({page}: PageBuilderProps) => {
  const pageBuilderBlocks = useOptimistic<PageBuilderBlock[] | undefined, SanityDocument<PageData>>(
    page?.pageBuilder || [],
    (currentBlocks, action) => {
      // The action contains updated document data from Sanity
      // when someone makes an edit in the Studio

      // If the edit was to a different document, ignore it
      if (action.id !== page?._id) {
        return currentBlocks
      }

      // If there are blocks in the updated document, use them
      if (action.document.pageBuilder) {
        // Reconcile References to maintain React state
        // Learn more: https://www.sanity.io/docs/enabling-drag-and-drop
        return action.document.pageBuilder.map(
          (block) => currentBlocks?.find((b) => b._key === block?._key) || block,
        )
      }

      // Otherwise keep the current blocks
      return currentBlocks
    },
  )

  if (!page || !pageBuilderBlocks || pageBuilderBlocks.length === 0) {
    return null
  }

  return (
    <div>
      {pageBuilderBlocks.map((block: any, index: number) => (
        <BlockRenderer
          key={block._key}
          index={index}
          block={block}
          pageId={page._id}
          pageType={page._type}
        />
      ))}
    </div>
  )
}
