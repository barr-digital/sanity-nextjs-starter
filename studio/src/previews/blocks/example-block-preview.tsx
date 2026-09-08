import React from 'react'
import type { PreviewProps } from 'sanity'
import { MockupCanvas, MockText, tokens, type MockLine } from './mockup'

/**
 * Example block mockup — the pattern every block preview follows (one file
 * per block in this folder): a miniature of the block's real section layout,
 * built from the primitives in ./mockup.tsx, so editors recognize blocks by
 * shape in the PageBuilder list. Wire it in the block schema via
 * `components: { preview: <Block>Preview }`.
 *
 * Keep the mockup in sync with the frontend component AND with the fields
 * listed in the block's `preview: autoSelect([...])` — only selected fields
 * reach this component as props.
 */
export function ExampleBlockPreview(props: PreviewProps) {
  const title = (props as { title?: string }).title
  const text = (props as { text?: string }).text
  const textLines: MockLine[] = text
    ? [{ key: 'text', spans: [{ key: 's0', text, highlight: false }] }]
    : []

  return (
    <MockupCanvas label="Example block">
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 6,
          color: title ? tokens.grey100 : tokens.grey400,
          fontStyle: title ? 'normal' : 'italic',
        }}
      >
        {title || 'Title'}
      </div>
      <MockText lines={textLines} placeholder="Body text…" maxLines={2} />
    </MockupCanvas>
  )
}
