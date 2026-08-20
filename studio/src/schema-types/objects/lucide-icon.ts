import { defineType } from 'sanity'
import { LucideIconInput } from '../../inputs/lucide-icon-input'

/**
 * Lucide icon — editor-selectable icon field.
 *
 * Replaces `sanity-plugin-lucide-icon-picker` (unmaintained, Sanity v3 only,
 * imports @sanity/ui exports removed in v4). Keeps the same type `name`
 * (`lucide-icon`) and stored value (kebab-case string) so `studio-icons.ts`
 * and existing dataset values need no changes.
 */
export const lucideIcon = defineType({
  name: 'lucide-icon',
  title: 'Lucide Icon',
  type: 'string',
  components: { input: LucideIconInput },
})
