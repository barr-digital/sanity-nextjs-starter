import { useMemo, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import { Box, Button, Card, Flex, Grid, Stack, Text, TextInput } from '@sanity/ui'
import { set, unset } from 'sanity'
import type { StringInputProps } from 'sanity'
import { resolveIcon } from '../icons/icon-resolver'

/**
 * Lucide icon picker input — replacement for the unmaintained
 * `sanity-plugin-lucide-icon-picker` (Sanity v3 only, breaks on @sanity/ui v4).
 *
 * The field stores the icon name in **kebab-case** (same format the old plugin
 * used, e.g. `file-text`), so existing `studioIcons` data stays valid and
 * `resolveIcon` (which accepts kebab-case) keeps working unchanged.
 */
const toKebab = (name: string): string => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const allIconNames = Object.keys(LucideIcons)
  .filter((key) => {
    const candidate = (LucideIcons as unknown as Record<string, unknown>)[key]
    return (
      typeof candidate === 'object' &&
      candidate !== null &&
      '$$typeof' in candidate &&
      !key.endsWith('Icon') &&
      !key.startsWith('Lucide') &&
      key !== 'createLucideIcon' &&
      key !== 'default'
    )
  })
  .sort()

export function LucideIconInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props
  const [query, setQuery] = useState('')

  const Selected = resolveIcon(value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const source = q ? allIconNames.filter((n) => n.toLowerCase().includes(q)) : allIconNames
    return source.slice(0, 120)
  }, [query])

  return (
    <Stack gap={3}>
      <Flex align="center" gap={3}>
        <Card padding={2} radius={2} border tone="default">
          <Selected size={20} />
        </Card>
        <Box flex={1}>
          <Text size={1} muted>
            {value || 'No icon selected'}
          </Text>
        </Box>
        {value && !readOnly ? (
          <Button
            mode="ghost"
            tone="critical"
            fontSize={1}
            padding={2}
            text="Clear"
            onClick={() => onChange(unset())}
          />
        ) : null}
      </Flex>
      {!readOnly ? (
        <>
          <TextInput
            placeholder="Search Lucide icons…"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            fontSize={1}
          />
          <Box style={{ maxHeight: 260, overflowY: 'auto' }}>
            <Grid gap={1} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {filtered.map((name) => {
                const Icon = resolveIcon(name)
                const isActive = toKebab(name) === value
                return (
                  <Card
                    key={name}
                    as="button"
                    padding={2}
                    radius={2}
                    tone={isActive ? 'primary' : 'default'}
                    onClick={() => onChange(set(toKebab(name)))}
                    title={name}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    <Flex direction="column" align="center" gap={2}>
                      <Icon size={18} />
                      <span style={{ fontSize: 9, textAlign: 'center', wordBreak: 'break-word' }}>
                        {name}
                      </span>
                    </Flex>
                  </Card>
                )
              })}
            </Grid>
          </Box>
        </>
      ) : null}
    </Stack>
  )
}
