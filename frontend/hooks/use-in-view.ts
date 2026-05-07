'use client'

import { useEffect, useState, type RefObject } from 'react'

export type UseInViewOptions = {
  /** Disconnect after the first intersection. Defaults to `true`. */
  once?: boolean
  /** Fraction of the element that must be visible (0–1). Defaults to `0.3`. */
  amount?: number
  /** `IntersectionObserver` rootMargin string (e.g. `'-80px 0px'`). */
  rootMargin?: string
}

/**
 * Returns `true` when the element referenced by `ref` enters the viewport.
 *
 * Wrapper on `IntersectionObserver` with BARR defaults (`once: true`,
 * `amount: 0.3`). For motion-driven animations, this hook keeps the starter
 * dependency-free — when you adopt the optional `motion` package (see
 * `convenzioni.md` §"Animation system"), swap to `useInView` from
 * `motion/react` for richer features (preset support, viewport tokens).
 */
export function useInView<T extends Element = Element>(
  ref: RefObject<T | null>,
  { once = true, amount = 0.3, rootMargin }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold: amount, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, once, amount, rootMargin])

  return inView
}
