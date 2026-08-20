import imageUrlBuilder from '@sanity/image-url'
import { Box, Flex, Stack, Text } from '@sanity/ui'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { type ObjectInputProps, type StringInputProps, useClient, useFormValue } from 'sanity'
import { CharCounterInput } from './char-counter-input'
import { CollapsibleCardInput } from './collapsible-card-input'
import { useSettingsFallback } from './settings-fallback'
import { OgPreview, SerpPreview, getSiteHost } from './social-preview-cards'
import {
  DESCR_SOFT_MAX,
  DESCR_SOFT_MIN,
  TITLE_SOFT_MAX,
  TITLE_SOFT_MIN,
  countCharacters,
  isEmpty,
  toneFor,
  truncate,
  type SeoValue,
} from './seo-helpers'

function CounterBadge({
  count,
  soft,
  label,
}: {
  count: number
  soft: { min: number; max: number }
  label: string
}) {
  const tone = toneFor(count, soft)
  return (
    <Text
      size={0}
      muted={tone === 'muted'}
      {...(tone !== 'muted' ? { style: { color: undefined } } : {})}
    >
      <span
        style={{ color: tone === 'ok' ? '#3fa94a' : tone === 'warning' ? '#e07b00' : undefined }}
      >
        {label} {count}/{soft.max}
      </span>
    </Text>
  )
}

type SeoCardProps = {
  value: SeoValue | undefined
  imageUrl: string | null
  resolvedTitle: string
  resolvedDescription: string
  displayImageUrl: string | null
  anyFromFallback: boolean
}

function SeoCard({
  value,
  resolvedTitle,
  resolvedDescription,
  displayImageUrl,
  anyFromFallback,
}: SeoCardProps) {
  const empty = isEmpty(value)
  const titleCount = countCharacters(value?.seoTitle)
  const descrCount = countCharacters(value?.seoDescription)

  if (empty) {
    return (
      <Flex align="center" gap={4}>
        <Box>
          <Search size={20} />
        </Box>
        <Box flex={1}>
          <Text size={1} weight="medium" muted>
            Empty SEO — click to edit
          </Text>
        </Box>
      </Flex>
    )
  }

  return (
    <Flex align="flex-start" gap={4}>
      {displayImageUrl ? (
        <div
          style={{
            width: 96,
            aspectRatio: '16 / 9',
            borderRadius: 4,
            background: `url(${displayImageUrl}) center/cover`,
            flexShrink: 0,
          }}
        />
      ) : (
        <Box paddingTop={1}>
          <Search size={20} />
        </Box>
      )}
      <Box flex={1}>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={1} weight="medium">
            {resolvedTitle}
          </Text>
          {anyFromFallback && (
            <Text size={0} muted>
              Using Settings defaults
            </Text>
          )}
        </Flex>
        {resolvedDescription && (
          <Box marginTop={2}>
            <Text size={0} muted>
              {truncate(resolvedDescription, 140)}
            </Text>
          </Box>
        )}
        <Box marginTop={3}>
          <Flex gap={4}>
            <CounterBadge
              label="Title"
              count={titleCount}
              soft={{ min: TITLE_SOFT_MIN, max: TITLE_SOFT_MAX }}
            />
            <CounterBadge
              label="Description"
              count={descrCount}
              soft={{ min: DESCR_SOFT_MIN, max: DESCR_SOFT_MAX }}
            />
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

export function SeoTitleInput(props: StringInputProps) {
  return <CharCounterInput {...props} min={TITLE_SOFT_MIN} max={TITLE_SOFT_MAX} />
}

export function SeoDescriptionInput(props: StringInputProps) {
  return <CharCounterInput {...props} min={DESCR_SOFT_MIN} max={DESCR_SOFT_MAX} />
}

export function SeoInput(props: ObjectInputProps) {
  const value = props.value as SeoValue | undefined
  const language = useFormValue(['language']) as string | undefined
  const host = getSiteHost()

  const client = useClient({ apiVersion: '2025-09-25' })
  const imageUrl = value?.seoImage?.asset?._ref
    ? imageUrlBuilder(client).image(value.seoImage).width(600).url()
    : null

  const {
    title: settingsTitle,
    description: settingsDescription,
    ogImageUrl: fallbackImageUrl,
  } = useSettingsFallback(language)

  // Resolve with explicit fallback chain: page SEO → site Settings → placeholder
  const titleFromFallback = !value?.seoTitle
  const descriptionFromFallback = !value?.seoDescription
  const imageFromFallback = !imageUrl

  const resolvedTitle = value?.seoTitle || settingsTitle || 'Untitled page'
  const resolvedDescription = value?.seoDescription || settingsDescription || ''
  const displayImageUrl = imageUrl || fallbackImageUrl

  // Flags only light up when the fallback *actually* provided a value
  const titleActuallyFallback = titleFromFallback && !!settingsTitle
  const descriptionActuallyFallback = descriptionFromFallback && !!settingsDescription
  const imageActuallyFallback = imageFromFallback && !!fallbackImageUrl

  const anyFromFallback =
    titleActuallyFallback || descriptionActuallyFallback || imageActuallyFallback

  const renderForm = (renderDefault: () => ReactNode) => (
    <Stack gap={4}>
      <SerpPreview
        title={resolvedTitle}
        description={resolvedDescription || 'No meta description provided.'}
        host={host}
        titleFromFallback={titleActuallyFallback}
        descriptionFromFallback={descriptionActuallyFallback}
      />
      <OgPreview
        title={resolvedTitle}
        description={resolvedDescription}
        host={host}
        imageUrl={displayImageUrl}
        titleFromFallback={titleActuallyFallback}
        descriptionFromFallback={descriptionActuallyFallback}
        imageFromFallback={imageActuallyFallback}
      />
      <Box>{renderDefault()}</Box>
    </Stack>
  )

  return (
    <CollapsibleCardInput
      {...props}
      renderCard={() => (
        <SeoCard
          value={value}
          imageUrl={imageUrl}
          resolvedTitle={resolvedTitle}
          resolvedDescription={resolvedDescription}
          displayImageUrl={displayImageUrl}
          anyFromFallback={anyFromFallback}
        />
      )}
      renderForm={renderForm}
    />
  )
}
