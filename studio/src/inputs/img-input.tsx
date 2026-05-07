import imageUrlBuilder from '@sanity/image-url'
import { Box, Flex, Text } from '@sanity/ui'
import { Image as ImageIcon } from 'lucide-react'
import { type ObjectInputProps, useClient } from 'sanity'
import { CollapsibleCardInput } from './collapsible-card-input'
import { isEmpty, parseDimensions, type ImgValue } from './img-helpers'

function ImgCard({ value, imageUrl }: { value: ImgValue | undefined; imageUrl: string | null }) {
  const empty = isEmpty(value)

  if (empty) {
    return (
      <Flex align="center" gap={4}>
        <Box>
          <ImageIcon size={20} />
        </Box>
        <Box flex={1}>
          <Text size={1} weight="medium" muted>
            Empty image — click to upload
          </Text>
        </Box>
      </Flex>
    )
  }

  const dims = parseDimensions(value?.asset?._ref)
  const alt = value?.alt

  return (
    <Flex align="center" gap={4}>
      <div
        style={{
          width: 96,
          aspectRatio: '16 / 9',
          borderRadius: 4,
          background: imageUrl ? `url(${imageUrl}) center/cover` : '#e4e6eb',
          flexShrink: 0,
        }}
      />
      <Box flex={1}>
        <Text size={1} weight="medium" muted={!alt}>
          {alt || 'No alt text'}
        </Text>
        {dims && (
          <Box marginTop={2}>
            <Text size={0} muted>
              {dims.width} × {dims.height} px
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  )
}

export function ImgInput(props: ObjectInputProps) {
  const value = props.value as ImgValue | undefined

  const client = useClient({ apiVersion: '2025-09-25' })
  const imageUrl = value?.asset?._ref ? imageUrlBuilder(client).image(value).width(300).url() : null

  return (
    <CollapsibleCardInput
      {...props}
      renderCard={() => <ImgCard value={value} imageUrl={imageUrl} />}
    />
  )
}
