import React from 'react'

type ParagraphMockProps = {
  text: string
  onDark?: boolean
  maxLines?: number
}

export const ParagraphMock = ({ text, onDark, maxLines = 3 }: ParagraphMockProps) => {
  if (!text) return null
  return (
    <div
      style={{
        color: onDark ? 'rgba(255,255,255,0.85)' : '#555',
        fontSize: 12,
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        maxWidth: 500,
      }}
    >
      {text}
    </div>
  )
}
