import React from 'react'
import { useWorkspace } from 'sanity'
import { SmartBlockPreview } from './smart-block-preview'

/**
 * Factory for the "Add item" menu card in the PageBuilder.
 *
 * Returns a component that, when rendered as a block's `icon`, shows the
 * SmartBlockPreview in template-placeholder mode (no values) so the editor
 * sees the block's structure before picking it.
 *
 * The `icon:` slot on an object type is used by Sanity only in the Add Item
 * menu of arrays. For everything else inside the PageBuilder, the richer
 * `components.preview` on the same schema takes over.
 */
export function makeBlockAddItemPreview(typeName: string) {
  return function BlockAddItemPreview() {
    const workspace = useWorkspace()
    const schemaType = workspace.schema.get(typeName)
    if (!schemaType) return null

    const PreviewComponent = SmartBlockPreview as unknown as React.ComponentType<{
      schemaType: unknown
    }>

    return (
      <div
        style={{
          width: 500,
          maxWidth: '100%',
          pointerEvents: 'none',
        }}
      >
        <PreviewComponent schemaType={schemaType} />
      </div>
    )
  }
}
