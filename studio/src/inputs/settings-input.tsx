import imageUrlBuilder from '@sanity/image-url'
import { Stack } from '@sanity/ui'
import { type ObjectInputProps, useClient } from 'sanity'
import { OgPreview, SerpPreview, getSiteHost } from './social-preview-cards'

/**
 * Custom input for the `settings` singleton.
 *
 * Shows SERP + social share preview cards driven by the three fields
 * guaranteed to exist on the BARR base `settings` schema: `title`,
 * `description`, `ogImage`. Extra project-specific fields (e.g. a
 * `notificationEmail`, contact info) are passed through untouched via
 * `renderDefault` — the input adds UI around the form, it doesn't replace it.
 *
 * Safe to drop into any project using the BARR preset: missing fields
 * degrade to placeholder strings, no crash.
 */

type SanityImageRef = {
  asset?: { _ref?: string; _type?: string }
}

type SettingsValue = {
  title?: string
  description?: string
  ogImage?: SanityImageRef
}

export function SettingsInput(props: ObjectInputProps) {
  const value = props.value as SettingsValue | undefined
  const host = getSiteHost()
  const client = useClient({ apiVersion: '2025-09-25' })

  const imageUrl = value?.ogImage?.asset?._ref
    ? imageUrlBuilder(client).image(value.ogImage).width(600).url()
    : null

  const title = value?.title || 'Untitled site'
  const description = value?.description || 'No site description provided.'

  return (
    <Stack space={4}>
      <SerpPreview
        title={title}
        description={description}
        host={host}
        label="Default search preview"
      />
      <OgPreview
        title={title}
        description={description}
        host={host}
        imageUrl={imageUrl}
        label="Default social share preview"
      />
      {props.renderDefault(props)}
    </Stack>
  )
}
