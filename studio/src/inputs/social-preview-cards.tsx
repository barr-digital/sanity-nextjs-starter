import { Card, Flex, Stack, Text } from '@sanity/ui'
import { DESCR_SOFT_MAX, TITLE_SOFT_MAX, truncate } from './seo-helpers'

/**
 * Reusable preview cards for SEO / social sharing.
 *
 * Shared between `SeoInput` (per-page SEO object) and `SettingsInput`
 * (site-wide default SEO). Props are plain strings/URLs with optional
 * `from-fallback` flags — no schema-specific value shape — so the cards
 * are portable across projects and future preview surfaces.
 *
 * The fallback flags drive a single "Defaults from Settings" hint in the
 * card header when any of title/description/image is coming from the
 * site defaults rather than the page itself.
 */

type FallbackFlags = {
  titleFromFallback?: boolean
  descriptionFromFallback?: boolean
  imageFromFallback?: boolean
}

function fallbackHint({
  titleFromFallback,
  descriptionFromFallback,
  imageFromFallback,
}: FallbackFlags): string | null {
  const parts: string[] = []
  if (titleFromFallback) parts.push('title')
  if (descriptionFromFallback) parts.push('description')
  if (imageFromFallback) parts.push('image')
  if (parts.length === 0) return null
  return `${parts.join(' + ')} from Settings`
}

type SerpPreviewProps = FallbackFlags & {
  title: string
  description: string
  host: string
  label?: string
}

export function SerpPreview({
  title,
  description,
  host,
  label = 'Google search preview',
  ...fallback
}: SerpPreviewProps) {
  const hint = fallbackHint(fallback)

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={0} muted weight="medium">
            {label}
          </Text>
          {hint && (
            <Text size={0} muted>
              {hint}
            </Text>
          )}
        </Flex>
        <Stack space={2}>
          <Text size={0} style={{ color: '#202124' }}>
            {host}
          </Text>
          <div>
            <span style={{ color: '#1a0dab', fontSize: 18, fontWeight: 400, lineHeight: '24px' }}>
              {truncate(title, TITLE_SOFT_MAX + 10)}
            </span>
          </div>
          <Text size={1} style={{ color: '#4d5156' }}>
            {truncate(description, DESCR_SOFT_MAX + 20)}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}

type OgPreviewProps = FallbackFlags & {
  title: string
  description: string
  host: string
  imageUrl: string | null
  label?: string
}

export function OgPreview({
  title,
  description,
  host,
  imageUrl,
  label = 'Social share preview',
  ...fallback
}: OgPreviewProps) {
  const hint = fallbackHint(fallback)

  return (
    <Card padding={4} radius={2} shadow={1}>
      <Stack space={3}>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={0} muted weight="medium">
            {label}
          </Text>
          {hint && (
            <Text size={0} muted>
              {hint}
            </Text>
          )}
        </Flex>
        <div
          style={{
            border: '1px solid #dadde1',
            borderRadius: 8,
            overflow: 'hidden',
            maxWidth: 520,
          }}
        >
          <div
            style={{
              background: imageUrl ? `url(${imageUrl}) center/cover` : '#e4e6eb',
              aspectRatio: '1200 / 630',
              width: '100%',
            }}
          />
          <div style={{ padding: '12px 16px', background: '#f0f2f5' }}>
            <div
              style={{
                fontSize: 12,
                color: '#606770',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {host}
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: '#1c1e21',
                marginTop: 4,
                lineHeight: 1.3,
              }}
            >
              {truncate(title, 80)}
            </div>
            {description && (
              <div style={{ fontSize: 13, color: '#606770', marginTop: 4, lineHeight: 1.4 }}>
                {truncate(description, 140)}
              </div>
            )}
          </div>
        </div>
      </Stack>
    </Card>
  )
}

export function getSiteHost(): string {
  const preview = process.env.SANITY_STUDIO_PREVIEW_URL
  if (!preview) return 'yoursite.com'
  try {
    return new URL(preview).host
  } catch {
    return 'yoursite.com'
  }
}
