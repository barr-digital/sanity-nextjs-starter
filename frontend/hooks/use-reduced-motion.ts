'use client'

import { useMediaQuery } from './use-media-query'

/**
 * Returns `true` when the OS reports `prefers-reduced-motion: reduce`.
 *
 * Honor this in any animation/transition: skip parallax, drop staggers,
 * shorten durations to ~0. Built on `useMediaQuery` so the value updates
 * live if the user toggles the setting.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
