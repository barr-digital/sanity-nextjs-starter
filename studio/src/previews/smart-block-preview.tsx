import React, { useMemo } from 'react'
import type { PreviewProps } from 'sanity'
import { useClient } from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import { Badge, Card, Stack, Text } from '@sanity/ui'
import { SearchMock } from './mocks/search-mock'
import { CtaMock } from './mocks/cta-mock'
import { ParagraphMock } from './mocks/paragraph-mock'
import { VideoMock } from './mocks/video-mock'
import { CardGridMock } from './mocks/card-grid-mock'

/**
 * SmartBlockPreview
 *
 * Universal preview component for PageBuilder blocks. Works fully offline
 * inside the Studio, no frontend server required.
 *
 * ZERO-CONFIG: works on any block schema of any project without modifications.
 *
 * Layout derivation (in order):
 *   1. Explicit: read `options.previewRole` on each field
 *   2. Inferred: fall back to heuristics based on field type
 *
 * Available roles (put in field's `options.previewRole`):
 *   - 'title'           → big heading
 *   - 'subtitle'        → muted subtitle under title
 *   - 'paragraph'       → 3-line excerpt
 *   - 'image'           → background image with overlay
 *   - 'cta'             → CTA button (default for type: 'link')
 *   - 'search-input'    → search bar placeholder mock
 *   - 'search-button'   → button attached to search-input
 *   - 'helper-text'     → small muted text
 *   - 'form-field'      → stacked input mockups
 *   - 'submit-button'   → dark CTA standalone
 *   - 'card-grid'       → thumbnail grid from array of items with image
 *   - 'video-file'      → video pill with filename
 *   - 'skip'            → ignore in preview
 *
 * Usage on a block schema:
 *   preview: autoSelect([...fieldNames]),
 *   components: { preview: SmartBlockPreview }
 *
 * Do NOT import this file in new projects — it lives in the shared BARR preset.
 * Annotate your schema fields with options.previewRole instead.
 */

type AnyRecord = Record<string, unknown>

type Role =
  | 'title'
  | 'subtitle'
  | 'paragraph'
  | 'image'
  | 'cta'
  | 'search-input'
  | 'search-button'
  | 'helper-text'
  | 'form-field'
  | 'submit-button'
  | 'card-grid'
  | 'video-file'
  | 'skip'

type SanityField = {
  name: string
  type: { name?: string; jsonType?: string; options?: any; of?: any[] } | string
  options?: { previewRole?: Role; accept?: string }
}

const typeNameOf = (field: SanityField): string => {
  if (typeof field.type === 'string') return field.type
  return field.type?.name ?? field.type?.jsonType ?? ''
}

const readPreviewRole = (field: SanityField): Role | null => {
  const fromField = (field.options?.previewRole as Role | undefined) ?? null
  if (fromField) return fromField
  // Sanity moves most options under type.options at runtime — read from there too.
  if (typeof field.type === 'object') {
    const fromType = ((field.type as any)?.options?.previewRole as Role | undefined) ?? null
    if (fromType) return fromType
  }
  return null
}

const isPortableTextArray = (field: SanityField): boolean => {
  if (typeof field.type === 'string') return false
  const of = field.type?.of ?? []
  return Array.isArray(of) && of.some((m: any) => m?.name === 'block' || m?.type === 'block')
}

const isArrayOfObjects = (field: SanityField): boolean => {
  if (typeof field.type === 'string') return false
  if (field.type?.jsonType !== 'array' && field.type?.name !== 'array') return false
  const of = field.type?.of ?? []
  return (
    Array.isArray(of) &&
    of.some((m: any) => m?.jsonType === 'object' || m?.name === 'object' || m?.fields)
  )
}

const isVideoFileField = (field: SanityField): boolean => {
  if (typeNameOf(field) !== 'file') return false
  const accept =
    field.options?.accept ??
    (typeof field.type === 'object' ? (field.type as any)?.options?.accept : '')
  return typeof accept === 'string' && accept.startsWith('video')
}

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value : null

const extractPortableText = (value: unknown): string => {
  if (!Array.isArray(value)) return ''
  return value
    .filter((b: any) => b?._type === 'block')
    .map((b: any) => (b.children ?? []).map((c: any) => c?.text ?? '').join(''))
    .join(' ')
    .trim()
}

const resolveText = (value: unknown): string => {
  const str = getString(value)
  if (str) return str
  const portable = extractPortableText(value)
  if (portable) return portable
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>
    return getString(obj.placeholder) ?? getString(obj.label) ?? getString(obj.text) ?? ''
  }
  return ''
}

/**
 * Infer role when the field has no explicit previewRole annotation.
 */
const inferRole = (
  field: SanityField,
  state: { titleSeen: boolean; subtitleSeen: boolean },
): Role | null => {
  const t = typeNameOf(field)
  if (t === 'img' || t === 'image') return 'image'
  if (t === 'link') return 'cta'
  if (isVideoFileField(field)) return 'video-file'
  if (t === 'text') return 'paragraph'
  if (t === 'array') {
    if (isPortableTextArray(field)) return 'paragraph'
    if (isArrayOfObjects(field)) return 'card-grid'
    return null
  }
  if (t === 'string') {
    if (!state.titleSeen) {
      state.titleSeen = true
      return 'title'
    }
    if (!state.subtitleSeen) {
      state.subtitleSeen = true
      return 'subtitle'
    }
    return null
  }
  return null
}

/**
 * Convert a block type name (camelCase) into a human-readable title.
 * e.g. 'cardsBlock' → 'Cards', 'textCtaBlock' → 'Text Cta', 'heroBlock' → 'Hero'
 */
function humanizeBlockTypeName(typeName: string): string {
  const stripped = typeName.replace(/Block$/, '')
  const spaced = stripped.replace(/([A-Z])/g, ' $1').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * Helper: build preview { select, prepare } for a block type.
 * - `select` includes every field + `_type` (used to derive the breadcrumb title)
 * - `prepare` passes every field through to SmartBlockPreview untouched,
 *    and sets `title` from the schema type name so breadcrumb/reference lists
 *    don't show "Untitled" when the block has no `title` field.
 */
export const autoSelect = (fieldNames: string[]) => ({
  select: fieldNames.reduce<Record<string, string>>(
    (acc, name) => {
      acc[name] = name
      return acc
    },
    { _blockType: '_type' },
  ),
  prepare(selection: Record<string, unknown>) {
    const { _blockType, ...rest } = selection
    return {
      ...rest,
      title: humanizeBlockTypeName(String(_blockType || 'Block')),
    }
  },
})

export function SmartBlockPreview(props: PreviewProps) {
  const client = useClient({ apiVersion: '2025-09-25' })
  const urlFor = useMemo(() => imageUrlBuilder(client), [client])

  const schema = (props as any).schemaType as
    { title?: string; name?: string; fields?: SanityField[] } | undefined
  const fields = schema?.fields ?? []
  const blockLabel = schema?.title ?? schema?.name ?? 'Block'

  const getValue = (name: string): unknown => (props as unknown as AnyRecord)[name]

  // Assign roles
  const state = { titleSeen: false, subtitleSeen: false }
  const rolesMap = fields.map((field) => {
    const explicitRole = readPreviewRole(field)
    const role = explicitRole ?? inferRole(field, state)
    return { field, role, value: getValue(field.name) }
  })

  const byRole = (role: Role) => rolesMap.find((r) => r.role === role)
  const allByRole = (role: Role) => rolesMap.filter((r) => r.role === role)
  const hasRole = (role: Role) => rolesMap.some((r) => r.role === role)

  // Image as background
  const imageEntry = byRole('image')
  const imageValue = imageEntry?.value as any
  const imageUrl = imageValue?.asset?._ref
    ? urlFor.image(imageValue).width(800).height(400).fit('crop').url()
    : null
  const hasImage = Boolean(imageUrl)

  // Video as fallback background (when image is missing)
  const videoBgEntry = byRole('video-file')
  const videoBgValue = videoBgEntry?.value as any
  const videoRef: string | undefined = videoBgValue?.asset?._ref
  const videoUrl = useMemo(() => {
    if (!videoRef) return null
    const { projectId, dataset } = client.config()
    if (!projectId || !dataset) return null
    // file-<id>-<ext> → <id>.<ext>
    const stripped = videoRef.replace(/^file-/, '').replace(/-([a-z0-9]+)$/i, '.$1')
    return `https://cdn.sanity.io/files/${projectId}/${dataset}/${stripped}`
  }, [videoRef, client])
  // Priority: video first (more faithful to the site), image as fallback
  const useVideoAsBackground = Boolean(videoUrl)
  const useImageAsBackground = !useVideoAsBackground && hasImage
  const hasVisualBackground = useVideoAsBackground || useImageAsBackground

  // Text sections
  const titleText = resolveText(byRole('title')?.value)
  const subtitleText = resolveText(byRole('subtitle')?.value)
  const paragraphText = resolveText(byRole('paragraph')?.value)
  const helperText = resolveText(byRole('helper-text')?.value)

  // Search mock pair
  const searchInput = byRole('search-input')
  const searchButton = byRole('search-button')
  const searchPlaceholder = resolveText(searchInput?.value)
  const searchButtonLabel = resolveText(searchButton?.value)
  const hasSearch = Boolean(searchInput || searchButton)

  // CTA buttons (links)
  const ctas = allByRole('cta')

  // Submit button (explicit)
  const submitButton = byRole('submit-button')
  const submitLabel = resolveText(submitButton?.value)

  // Form fields (explicit)
  const formFields = allByRole('form-field')
  const formLabels = formFields.map((f) => resolveText(f.value) || f.field.name).filter(Boolean)

  // Card grid
  const cardGridEntry = byRole('card-grid')
  const cardItems = Array.isArray(cardGridEntry?.value) ? (cardGridEntry!.value as any[]) : []
  const thumbnails = cardItems.slice(0, 4).map((item: any) => {
    const imageField = item?.image ?? item?.backgroundImage ?? item?.thumbnail ?? item?.media
    if (imageField?.asset?._ref) {
      return urlFor.image(imageField).width(200).height(200).fit('crop').url()
    }
    return null
  })
  const cardLabels = cardItems.slice(0, 4).map((item: any) => {
    return item?.label ?? item?.title ?? item?.link?.label ?? null
  })

  // Video pill (only show as inline label when the video is NOT already used as background)
  const videoFilename = videoRef && !useVideoAsBackground ? 'Video background' : null

  // Always render the block's structural template, using placeholders for empty values.
  // This keeps newly-added blocks recognizable by shape even before the editor populates them.
  const hasTitleRole = hasRole('title')
  const hasSubtitleRole = hasRole('subtitle')
  const hasParagraphRole = hasRole('paragraph')
  const hasSearchRole = Boolean(searchInput || searchButton)
  const hasHelperTextRole = hasRole('helper-text')
  const hasFormRole = allByRole('form-field').length > 0
  const hasCardGridRole = hasRole('card-grid')
  const hasCtaRole = ctas.length > 0

  const placeholderColor = (onDark: boolean) => (onDark ? 'rgba(255,255,255,0.45)' : '#bbb')

  return (
    <Card
      radius={2}
      tone="transparent"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: hasVisualBackground ? 140 : 110,
        background: useVideoAsBackground
          ? '#000'
          : useImageAsBackground
            ? `url(${imageUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, #f6f6f6 0%, #ebebeb 100%)',
      }}
    >
      {useVideoAsBackground && videoUrl && (
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
      {hasVisualBackground && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      )}

      <div style={{ position: 'relative', padding: 16 }}>
        <Stack gap={3}>
          <div>
            <Badge tone="primary" fontSize={0}>
              {blockLabel}
            </Badge>
          </div>

          {hasTitleRole && (
            <div
              style={{
                color: titleText
                  ? hasVisualBackground
                    ? 'white'
                    : '#111'
                  : placeholderColor(hasVisualBackground),
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.25,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                maxWidth: '100%',
                fontStyle: titleText ? 'normal' : 'italic',
              }}
            >
              {titleText || 'Title'}
            </div>
          )}

          {hasSubtitleRole && (
            <Text
              size={1}
              style={{
                color: subtitleText
                  ? hasVisualBackground
                    ? 'rgba(255,255,255,0.85)'
                    : '#555'
                  : placeholderColor(hasVisualBackground),
                lineHeight: 1.4,
                fontStyle: subtitleText ? 'normal' : 'italic',
              }}
            >
              {subtitleText || 'Subtitle'}
            </Text>
          )}

          {hasParagraphRole && (
            <ParagraphMock
              text={paragraphText || 'Paragraph content will appear here once you start writing…'}
              onDark={hasVisualBackground}
            />
          )}

          {hasSearchRole && (
            <SearchMock
              placeholder={searchPlaceholder}
              buttonLabel={searchButtonLabel}
              onDark={hasVisualBackground}
            />
          )}

          {hasFormRole && (
            <FormFieldsWrapper
              labels={formLabels.length > 0 ? formLabels : ['Field', 'Field', 'Field']}
              submitLabel={submitLabel || 'Submit'}
              onDark={hasVisualBackground}
            />
          )}

          {hasCardGridRole && (
            <CardGridMock
              thumbnails={thumbnails.length > 0 ? thumbnails : [null, null, null]}
              labels={cardLabels}
              onDark={hasVisualBackground}
            />
          )}

          {hasHelperTextRole && (
            <Text
              size={0}
              style={{
                color: helperText
                  ? hasVisualBackground
                    ? 'rgba(255,255,255,0.7)'
                    : '#888'
                  : placeholderColor(hasVisualBackground),
                lineHeight: 1.3,
                fontStyle: helperText ? 'normal' : 'italic',
              }}
            >
              {helperText || 'Helper text'}
            </Text>
          )}

          {videoFilename && <VideoMock filename={videoFilename} onDark={hasVisualBackground} />}

          {hasCtaRole && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ctas.map((entry) => {
                const link = entry.value as { label?: string } | undefined
                return (
                  <CtaMock
                    key={entry.field.name}
                    label={link?.label || 'Button'}
                    onDark={hasVisualBackground}
                  />
                )
              })}
            </div>
          )}
        </Stack>
      </div>
    </Card>
  )
}

// Avoid inline circular issue with FormMock (wrap minimal):
import { FormMock } from './mocks/form-mock'
const FormFieldsWrapper = ({
  labels,
  submitLabel,
  onDark,
}: {
  labels: string[]
  submitLabel?: string
  onDark: boolean
}) => <FormMock fieldLabels={labels} submitLabel={submitLabel} onDark={onDark} />
