/**
 * Icon slots — single source of truth for every icon slot in the Studio.
 *
 * Each slot has a default Lucide icon name (used as fallback while the
 * `studioIcons` singleton is loading, or when the editor hasn't chosen a
 * value yet). Editors can override any slot via right-click on the icon
 * anywhere in the Studio, or via the Studio Icons singleton.
 *
 * Add a slot here whenever you introduce a new document type, singleton,
 * pageBuilder block, or sidebar folder that needs an editor-controllable icon.
 */

export type IconSlot = {
  name: string
  label: string
  defaultIcon: string
  description?: string
}

/**
 * Fallback icon shown everywhere until an editor picks something else
 * via right-click. The "?" is intentional — it invites editors to personalize.
 */
export const FALLBACK_ICON = 'HelpCircle'

const SLOTS = [
  // Singletons
  { name: 'homepage', label: 'Homepage', defaultIcon: FALLBACK_ICON },
  { name: 'header', label: 'Header', defaultIcon: FALLBACK_ICON },
  { name: 'footer', label: 'Footer', defaultIcon: FALLBACK_ICON },
  { name: 'settings', label: 'Settings', defaultIcon: FALLBACK_ICON },
  // Sidebar folders
  {
    name: 'globalsAndSettings',
    label: 'Globals and Settings',
    defaultIcon: FALLBACK_ICON,
    description: 'Icon for the "Globals and Settings" folder in the sidebar',
  },
  // PageBuilder blocks
  { name: 'exampleBlock', label: 'Example block', defaultIcon: FALLBACK_ICON },
  // Reusable objects
  { name: 'link', label: 'Link', defaultIcon: FALLBACK_ICON },
  {
    name: 'studioIcons',
    label: 'Studio Icons',
    defaultIcon: FALLBACK_ICON,
    description: 'Icon for the Studio Icons singleton itself',
  },
] as const

export type IconSlotName = (typeof SLOTS)[number]['name']

export const iconSlots: readonly IconSlot[] = SLOTS

export const iconSlotNames: IconSlotName[] = SLOTS.map((s) => s.name)

export const getSlotDefault = (name: IconSlotName): string =>
  iconSlots.find((s) => s.name === name)?.defaultIcon ?? 'Box'
