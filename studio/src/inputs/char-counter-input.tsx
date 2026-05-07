import { Box, Flex, Stack, Text } from '@sanity/ui'
import type { StringInputProps } from 'sanity'

type CharCounterInputProps = StringInputProps & {
  max: number
  min?: number
}

export function CharCounterInput(props: CharCounterInputProps) {
  const { max, min, ...rest } = props
  const value = typeof rest.value === 'string' ? rest.value : ''
  const count = value.length

  const tone = count === 0 ? 'muted' : (min && count < min) || count > max ? 'warning' : 'ok'

  const color = tone === 'ok' ? '#3fa94a' : tone === 'warning' ? '#e07b00' : undefined

  return (
    <Stack space={2}>
      <Box>{rest.renderDefault(rest)}</Box>
      <Flex justify="flex-end">
        <Text size={0} muted={tone === 'muted'} style={{ color }}>
          {count}/{max}
        </Text>
      </Flex>
    </Stack>
  )
}
