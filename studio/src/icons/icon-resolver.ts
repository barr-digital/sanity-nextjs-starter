import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>

const toPascalCase = (raw: string): string =>
  raw
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

const isRenderableIcon = (value: unknown): value is LucideIcon => {
  if (!value) return false
  const t = typeof value
  // Lucide icons are forwardRef components (objects with $$typeof) in recent
  // versions, or plain functions in older ones — accept both.
  return t === 'function' || t === 'object'
}

/**
 * Resolve a Lucide icon by name (accepts PascalCase, kebab-case, or snake_case).
 * Returns a safe fallback if the name is unknown.
 */
export const resolveIcon = (name: string | null | undefined): LucideIcon => {
  if (!name) return icons.HelpCircle as LucideIcon

  const candidates = [name, toPascalCase(name), `${toPascalCase(name)}Icon`]
  for (const candidate of candidates) {
    const Icon = icons[candidate]
    if (isRenderableIcon(Icon)) return Icon
  }
  return icons.HelpCircle as LucideIcon
}
