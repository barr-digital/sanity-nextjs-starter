export type ImgValue = {
  asset?: { _ref?: string; _type?: string }
  alt?: string
  hotspot?: { x?: number; y?: number; height?: number; width?: number }
  crop?: { top?: number; bottom?: number; left?: number; right?: number }
}

export function isEmpty(value: ImgValue | undefined): boolean {
  return !value?.asset?._ref
}

export function parseDimensions(ref: string | undefined): { width: number; height: number } | null {
  if (!ref) return null
  const match = ref.match(/^image-[^-]+-(\d+)x(\d+)-/)
  if (!match) return null
  return { width: Number.parseInt(match[1], 10), height: Number.parseInt(match[2], 10) }
}
