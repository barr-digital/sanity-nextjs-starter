import React from 'react'

type VideoMockProps = {
  filename?: string
  onDark?: boolean
}

export const VideoMock = ({ filename, onDark }: VideoMockProps) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      background: onDark ? 'rgba(255,255,255,0.2)' : '#eee',
      color: onDark ? 'white' : '#555',
      borderRadius: 4,
      fontSize: 11,
      width: 'fit-content',
    }}
  >
    <span>▶</span>
    <span style={{ opacity: 0.8 }}>{filename || 'video'}</span>
  </div>
)
