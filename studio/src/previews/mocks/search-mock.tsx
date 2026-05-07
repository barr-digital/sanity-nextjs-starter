import React from 'react'

type SearchMockProps = {
  placeholder?: string
  buttonLabel?: string
  onDark?: boolean
}

export const SearchMock = ({ placeholder, buttonLabel, onDark }: SearchMockProps) => (
  <div style={{ display: 'flex', gap: 4, maxWidth: 360 }}>
    <div
      style={{
        flex: 1,
        background: onDark ? 'rgba(255,255,255,0.95)' : '#fff',
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 11,
        color: '#888',
        boxShadow: onDark ? 'none' : 'inset 0 0 0 1px #e0e0e0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {placeholder || 'Search...'}
    </div>
    {buttonLabel && (
      <div
        style={{
          background: '#111',
          color: 'white',
          padding: '6px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {buttonLabel}
      </div>
    )}
  </div>
)
