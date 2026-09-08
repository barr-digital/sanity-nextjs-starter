import React, { useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'

/**
 * Shared primitives for the per-block mockup previews: each PageBuilder
 * block renders a miniature of its real section layout (dark shell, same
 * structure and accents as the site) so editors recognize blocks by shape.
 *
 * `tokens` mirrors the project's color tokens (frontend styles). The values
 * below are neutral defaults with the BARR accent — swap the accent entries
 * for the project palette when the design tokens land.
 */
export const tokens = {
  grey100: '#f7f7f7',
  grey200: '#d9d9d9',
  grey400: '#8b8b8b',
  grey700: '#242424',
  grey800: '#080808',
  primary200: '#ccbfff',
  primary300: '#a68fff',
}

export type MockSpan = { key: string; text: string; highlight: boolean }
export type MockLine = { key: string; spans: MockSpan[] }

/** Portable Text → one MockLine per block, highlight marks preserved. */
export function ptToLines(value: unknown): MockLine[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((block: any) => block?._type === 'block')
    .map((block: any, i: number) => ({
      key: block._key ?? String(i),
      spans: (block.children ?? []).map((child: any, j: number) => ({
        key: child._key ?? String(j),
        text: child?.text ?? '',
        highlight: Array.isArray(child?.marks) && child.marks.includes('highlight'),
      })),
    }))
}

export function ptPlain(value: unknown): string {
  return ptToLines(value)
    .map((line) => line.spans.map((span) => span.text).join(''))
    .join(' ')
    .trim()
}

/** Dark section shell with the block name as a tiny corner tag. */
export function MockupCanvas({
  label,
  minHeight = 96,
  children,
}: {
  label: string
  minHeight?: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: tokens.grey800,
        minHeight,
        padding: '10px 12px 12px',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'monospace',
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: tokens.primary200,
            background: 'rgba(204, 191, 255, 0.14)',
            border: '1px solid rgba(204, 191, 255, 0.35)',
            borderRadius: 999,
            padding: '3px 10px',
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

/**
 * Text with the site's highlight accent. `lines` from ptToLines; when the
 * value is empty a muted placeholder keeps the layout recognizable.
 */
export function MockText({
  lines,
  placeholder,
  fontSize = 12,
  center = false,
  maxLines = 3,
  color = tokens.grey100,
}: {
  lines: MockLine[]
  placeholder: string
  fontSize?: number
  center?: boolean
  maxLines?: number
  color?: string
}) {
  const empty = lines.length === 0 || lines.every((l) => l.spans.every((s) => !s.text.trim()))
  return (
    <div
      style={{
        fontSize,
        lineHeight: 1.35,
        color: empty ? tokens.grey400 : color,
        fontStyle: empty ? 'italic' : 'normal',
        textAlign: center ? 'center' : 'left',
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {empty
        ? placeholder
        : lines.map((line) => (
            <span key={line.key} style={{ display: 'block' }}>
              {line.spans.map((span) =>
                span.highlight ? (
                  <span key={span.key} style={{ color: tokens.primary300 }}>
                    {span.text}
                  </span>
                ) : (
                  <React.Fragment key={span.key}>{span.text}</React.Fragment>
                ),
              )}
            </span>
          ))}
    </div>
  )
}

/** Crops a Sanity image value to a CDN URL (null when unset). */
export function useImg() {
  const client = useClient({ apiVersion: '2025-09-25' })
  const builder = useMemo(() => imageUrlBuilder(client), [client])
  return (image: unknown, w: number, h: number): string | null => {
    const img = image as { asset?: { _ref?: string } } | undefined
    if (!img?.asset?._ref) return null
    return builder.image(img).width(w).height(h).fit('crop').url()
  }
}

/**
 * Resolves an array of references from a preview value into documents
 * (order preserved). This is what lets reference blocks show real titles
 * and images instead of empty placeholders.
 */
export function useRefDocs<T extends { _id: string }>(value: unknown, projection: string): T[] {
  const client = useClient({ apiVersion: '2025-09-25' })
  const key = useMemo(() => {
    if (!Array.isArray(value)) return ''
    return value
      .map((ref: any) => ref?._ref)
      .filter(Boolean)
      .join(',')
  }, [value])
  const [docs, setDocs] = useState<T[]>([])

  useEffect(() => {
    if (!key) {
      setDocs([])
      return
    }
    let cancelled = false
    const ids = key.split(',')
    client
      .fetch(`*[_id in $ids]{_id, ${projection}}`, { ids })
      .then((result: T[]) => {
        if (cancelled) return
        const byId = new Map(result.map((doc) => [doc._id, doc]))
        setDocs(ids.map((id) => byId.get(id)).filter(Boolean) as T[])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [client, key, projection])

  return docs
}

/** Small image tile with a grey-700 fallback when the image is missing. */
export function MockThumb({
  url,
  width = 32,
  height = 32,
  radius = 4,
  children,
}: {
  url?: string | null
  width?: number | string
  height?: number
  radius?: number
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        flexShrink: 0,
        borderRadius: radius,
        overflow: 'hidden',
        background: url ? `url(${url}) center/cover no-repeat` : tokens.grey700,
      }}
    >
      {children}
    </div>
  )
}

/** The site's tag pill (grey-700, tiny mono uppercase). */
export function MockTag({ text }: { text: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: tokens.grey700,
        color: tokens.grey100,
        borderRadius: 6,
        padding: '2px 7px',
        fontFamily: 'monospace',
        fontSize: 8,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}

/** The site's small mono uppercase label (eyebrows, filters, tags). */
export function MockEyebrow({ text, placeholder }: { text?: string | null; placeholder: string }) {
  return (
    <div
      style={{
        fontFamily: 'monospace',
        fontSize: 9,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: tokens.grey400,
        fontStyle: text ? 'normal' : 'italic',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {text || placeholder}
    </div>
  )
}
