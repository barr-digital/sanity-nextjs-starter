export const TITLE_SOFT_MIN = 30
export const TITLE_SOFT_MAX = 60
export const DESCR_SOFT_MIN = 120
export const DESCR_SOFT_MAX = 160

export type SeoValue = {
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  seoImage?: {
    asset?: { _ref?: string; _type?: string }
    alt?: string
  }
}

export function isEmpty(value: SeoValue | undefined): boolean {
  if (!value) return true
  return !value.seoTitle && !value.seoDescription && !value.seoImage?.asset?._ref
}

export function countCharacters(s: string | undefined): number {
  return (s || '').length
}

export function truncate(s: string | undefined, max: number): string {
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

export type CounterTone = 'muted' | 'ok' | 'warning'

export function toneFor(count: number, soft: { min: number; max: number }): CounterTone {
  if (count === 0) return 'muted'
  if (count < soft.min) return 'warning'
  if (count > soft.max) return 'warning'
  return 'ok'
}
