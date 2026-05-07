import { Box, Flex, Text } from '@sanity/ui'
import { useEffect } from 'react'
import { type FormPatch, type ObjectInputProps, set, unset } from 'sanity'
import { CollapsibleCardInput } from './collapsible-card-input'
import { isEmpty, resolveIcon, resolvePreview, type LinkValue } from './link-helpers'

function LinkCard({ value }: { value: LinkValue | undefined }) {
  const empty = isEmpty(value)
  const Icon = resolveIcon(value)
  const label = value?.label || (empty ? 'Empty link — click to edit' : 'Untitled link')
  const preview = resolvePreview(value)

  return (
    <Flex align="center" gap={4}>
      <Box>
        <Icon size={20} />
      </Box>
      <Box flex={1}>
        <Text size={1} weight="medium" muted={empty}>
          {label}
        </Text>
        {preview && (
          <Box marginTop={2}>
            <Text size={0} muted>
              {preview}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  )
}

function isArrayItem(path: ObjectInputProps['path']): boolean {
  if (path.length === 0) return false
  const last = path[path.length - 1]
  return typeof last === 'object' && last !== null && '_key' in last
}

type DetectedTarget = {
  linkType: 'href' | 'custom'
  field: 'href' | 'custom'
  value: string
}

function detectTarget(raw: string): DetectedTarget | null {
  const trimmed = raw.trimStart()
  if (/^https?:\/\//i.test(trimmed)) return { linkType: 'href', field: 'href', value: raw }
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return { linkType: 'custom', field: 'custom', value: raw }
  }
  return null
}

const CHECKED_FIELDS = ['href', 'custom'] as const

export function LinkInput(props: ObjectInputProps) {
  const value = props.value as LinkValue | undefined
  const { onChange } = props

  useEffect(() => {
    if (!value) return

    for (const field of CHECKED_FIELDS) {
      const current = value[field]
      if (typeof current !== 'string') continue
      const target = detectTarget(current)
      if (!target) continue
      const alreadyCorrect = value.linkType === target.linkType && field === target.field
      if (alreadyCorrect) continue

      const patches: FormPatch[] = [
        set(target.value, [target.field]),
        set(target.linkType, ['linkType']),
      ]
      if (field !== target.field) patches.push(unset([field]))
      onChange(patches)
      return
    }

    const stalePatches: FormPatch[] = []
    if (value.linkType !== 'href' && value.href) stalePatches.push(unset(['href']))
    if (value.linkType !== 'custom' && value.custom) stalePatches.push(unset(['custom']))
    // `anchor` is valid for both 'anchor' and 'page' link types — only strip
    // when neither is selected.
    if (value.linkType !== 'anchor' && value.linkType !== 'page' && value.anchor) {
      stalePatches.push(unset(['anchor']))
    }
    if (value.linkType !== 'page' && value.page?._ref) stalePatches.push(unset(['page']))
    if (value.linkType !== 'file' && value.file?.asset?._ref) stalePatches.push(unset(['file']))
    if (stalePatches.length > 0) onChange(stalePatches)
  }, [value, onChange])

  return (
    <CollapsibleCardInput
      {...props}
      defaultExpanded={isArrayItem(props.path)}
      renderCard={() => <LinkCard value={value} />}
    />
  )
}
