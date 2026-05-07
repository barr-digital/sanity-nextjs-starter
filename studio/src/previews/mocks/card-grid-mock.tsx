import React from 'react'

type CardGridMockProps = {
  thumbnails: (string | null)[]
  labels?: (string | null)[]
  onDark?: boolean
}

export const CardGridMock = ({ thumbnails, labels, onDark }: CardGridMockProps) => {
  const slots = thumbnails.slice(0, 4)
  if (slots.length === 0) return null
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(slots.length, 4)}, 1fr)`,
        gap: 6,
        maxWidth: 400,
      }}
    >
      {slots.map((url, i) => (
        <div
          key={i}
          style={{
            aspectRatio: '1',
            background: url
              ? `url(${url}) center/cover no-repeat`
              : onDark
                ? 'rgba(255,255,255,0.3)'
                : '#ddd',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {labels?.[i] && (
            <div
              style={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                right: 2,
                fontSize: 9,
                color: 'white',
                background: 'rgba(0,0,0,0.5)',
                padding: '1px 4px',
                borderRadius: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {labels[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
