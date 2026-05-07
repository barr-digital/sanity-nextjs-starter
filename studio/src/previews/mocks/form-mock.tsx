import React from 'react'

type FormMockProps = {
  fieldLabels: string[]
  submitLabel?: string
  onDark?: boolean
}

export const FormMock = ({ fieldLabels, submitLabel, onDark }: FormMockProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 320 }}>
    {fieldLabels.slice(0, 3).map((label, i) => (
      <div
        key={i}
        style={{
          background: onDark ? 'rgba(255,255,255,0.95)' : '#fff',
          padding: '5px 10px',
          borderRadius: 4,
          fontSize: 10,
          color: '#888',
          boxShadow: onDark ? 'none' : 'inset 0 0 0 1px #e0e0e0',
        }}
      >
        {label}
      </div>
    ))}
    {submitLabel && (
      <div
        style={{
          display: 'inline-block',
          padding: '5px 12px',
          background: '#111',
          color: 'white',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 500,
          width: 'fit-content',
          marginTop: 2,
        }}
      >
        {submitLabel}
      </div>
    )}
  </div>
)
