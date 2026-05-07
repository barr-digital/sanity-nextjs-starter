'use client'

import { useCallback, useEffect, useRef } from 'react'

function getFocusable(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('inert') && el.offsetParent !== null,
  )
}

export function useFocusTrap<T extends HTMLElement>(isOpen: boolean) {
  const ref = useRef<T>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null

    const timeoutId = window.setTimeout(() => {
      const first = getFocusable(ref.current)[0]
      first?.focus()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
      previouslyFocusedRef.current?.focus()
    }
  }, [isOpen])

  const onKeyDown = useCallback((e: React.KeyboardEvent<T>) => {
    if (e.key !== 'Tab') return
    const focusables = getFocusable(ref.current)
    if (focusables.length === 0) {
      e.preventDefault()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (!first || !last) return

    const active = document.activeElement as HTMLElement | null
    if (e.shiftKey) {
      if (active === first || !ref.current?.contains(active)) {
        e.preventDefault()
        last.focus()
      }
    } else if (active === last) {
      e.preventDefault()
      first.focus()
    }
  }, [])

  return { ref, onKeyDown }
}
