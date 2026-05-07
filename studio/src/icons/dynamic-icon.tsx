import React, { useMemo, useRef, useState } from 'react'
import * as LucideIcons from 'lucide-react'
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Popover,
  Spinner,
  Stack,
  Text,
  TextInput,
  useClickOutsideEvent,
  useToast,
} from '@sanity/ui'
import type { IconSlotName } from './slots'
import { getSlotDefault } from './slots'
import { resolveIcon } from './icon-resolver'
import { useIconConfig } from './icon-config-provider'

type DynamicIconProps = {
  slot: IconSlotName
  size?: number
}

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

const POPULAR_ICONS = [
  'House',
  'Package',
  'FileText',
  'ShoppingCart',
  'Settings',
  'PanelTop',
  'PanelBottom',
  'Palette',
  'User',
  'Users',
  'Mail',
  'Phone',
  'MapPin',
  'Link',
  'Image',
  'Video',
  'Music',
  'Calendar',
  'Clock',
  'Star',
  'Heart',
  'Bookmark',
  'Tag',
  'Folder',
  'File',
  'Search',
  'Filter',
  'Download',
  'Upload',
  'Share2',
  'Copy',
  'Edit',
  'Trash2',
  'Plus',
  'Minus',
  'X',
  'Check',
  'ChevronRight',
  'ArrowRight',
  'ExternalLink',
  'Globe',
  'Flag',
  'Bell',
  'Lock',
  'Shield',
  'Zap',
  'Flame',
  'Sparkles',
  'Award',
  'Gift',
]

export function DynamicIcon({ slot, size = 16 }: DynamicIconProps) {
  const { iconMap, setIcon } = useIconConfig()
  const selectedName = iconMap[slot] ?? getSlotDefault(slot)
  const Icon = resolveIcon(selectedName)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const toast = useToast()

  useClickOutsideEvent(
    () => setOpen(false),
    () => [popoverRef.current, triggerRef.current],
  )

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return POPULAR_ICONS.filter((name) => allIconNames.includes(name))
    return allIconNames.filter((name) => name.toLowerCase().includes(normalizedQuery)).slice(0, 200)
  }, [query])

  const handleSelect = async (iconName: string) => {
    setSaving(true)
    try {
      await setIcon(slot, iconName)
      toast.push({
        status: 'success',
        title: `Icon updated`,
        description: `${slot} → ${iconName}`,
      })
      setOpen(false)
      setQuery('')
    } catch (error) {
      toast.push({
        status: 'error',
        title: 'Failed to update icon',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setSaving(false)
    }
  }

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  const pickerContent = (
    <Box
      ref={popoverRef}
      padding={3}
      onClick={stop}
      onMouseDown={stop}
      onMouseUp={stop}
      onKeyDown={stop}
      onContextMenu={stop}
      style={{ width: 360, maxHeight: 480, overflow: 'hidden' }}
    >
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Text size={1} weight="semibold">
            Change icon
          </Text>
          <Text size={0} muted>
            slot: {slot}
          </Text>
        </Flex>
        <TextInput
          placeholder="Search Lucide icons..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          autoFocus
          fontSize={1}
        />
        {saving ? (
          <Flex justify="center" padding={4}>
            <Spinner muted />
          </Flex>
        ) : (
          <Box style={{ maxHeight: 340, overflowY: 'auto' }}>
            <Grid columns={3} gap={1} style={{ gridAutoRows: 'auto' }}>
              {filteredIcons.map((name) => {
                const Candidate = resolveIcon(name)
                const isActive = name === selectedName
                return (
                  <Card
                    key={name}
                    as="button"
                    radius={2}
                    tone={isActive ? 'primary' : 'default'}
                    onClick={() => handleSelect(name)}
                    title={name}
                    style={{
                      cursor: 'pointer',
                      border: 'none',
                      background: isActive ? undefined : 'transparent',
                      padding: '10px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      minHeight: 80,
                      overflow: 'visible',
                    }}
                  >
                    <Candidate size={20} />
                    <span
                      style={{
                        fontSize: 10,
                        lineHeight: 1.25,
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                        opacity: isActive ? 1 : 0.75,
                      }}
                    >
                      {name}
                    </span>
                  </Card>
                )
              })}
            </Grid>
            {filteredIcons.length === 0 && (
              <Flex justify="center" padding={4}>
                <Text size={1} muted>
                  No icons match "{query}"
                </Text>
              </Flex>
            )}
          </Box>
        )}
        <Text size={0} muted>
          Right-click any icon in the Studio to change it from here.
        </Text>
      </Stack>
    </Box>
  )

  return (
    <Popover content={pickerContent} open={open} placement="bottom" portal>
      <span
        ref={triggerRef}
        title="Right-click to change icon"
        onContextMenu={(e) => {
          e.preventDefault()
          setOpen((prev) => !prev)
        }}
        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon size={size} />
      </span>
    </Popover>
  )
}

/**
 * Factory: returns a memoized component bound to a specific slot.
 * Use in `defineType({ icon: iconForSlot('homepage') })`.
 */
export function iconForSlot(slot: IconSlotName) {
  return function SlotIcon() {
    return <DynamicIcon slot={slot} />
  }
}
