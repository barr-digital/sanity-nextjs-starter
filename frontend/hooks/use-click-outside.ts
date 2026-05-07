'use client'

import { useEffect, type RefObject } from 'react'

type UseClickOutsideOptions = {
  enabled?: boolean
  ignoreSelector?: string
}

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
  { enabled = true, ignoreSelector }: UseClickOutsideOptions = {},
) {
  useEffect(() => {
    if (!enabled) return
    const handle = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (ref.current?.contains(target)) return
      if (ignoreSelector && target.closest(ignoreSelector)) return
      onOutside()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [enabled, onOutside, ignoreSelector, ref])
}
