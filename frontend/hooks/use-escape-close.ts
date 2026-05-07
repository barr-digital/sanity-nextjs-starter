'use client'

import { useEffect } from 'react'

export function useEscapeClose(isOpen: boolean, onClose: () => void, enabled = true) {
  useEffect(() => {
    if (!isOpen || !enabled) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, enabled, onClose])
}
