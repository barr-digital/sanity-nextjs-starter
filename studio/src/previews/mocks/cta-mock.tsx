import React from 'react'

type CtaMockProps = {
  label?: string
  onDark?: boolean
}

export const CtaMock = ({ label, onDark }: CtaMockProps) => {
  if (!label) return null
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '5px 12px',
        background: onDark ? 'white' : '#111',
        color: onDark ? '#111' : 'white',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 500,
        width: 'fit-content',
      }}
    >
      {label}
    </span>
  )
}
