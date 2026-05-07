import { defineField, defineType } from 'sanity'
import { iconSlots } from '../../../icons/slots'
import { iconForSlot } from '../../../icons'

/**
 * Studio Icons Singleton
 *
 * Global icon configuration for the Studio itself (not content).
 * Every document type / singleton / block can have its icon overridden
 * from here. Changes are reflected live across the Studio via the
 * IconConfigProvider (no reload needed).
 *
 * This singleton is NOT localized — icons are a design system concern,
 * shared across all languages.
 */
export const studioIcons = defineType({
  name: 'studioIcons',
  title: 'Studio Icons',
  type: 'document',
  icon: iconForSlot('studioIcons'),
  fields: iconSlots.map((slot) =>
    defineField({
      name: slot.name,
      title: slot.label,
      type: 'lucide-icon',
      description: slot.description ?? `Icon shown for ${slot.label} across the Studio UI.`,
      initialValue: slot.defaultIcon,
    }),
  ),
  preview: {
    prepare: () => ({
      title: 'Studio Icons',
      subtitle: 'Editor-selectable Lucide icons for every Studio slot',
    }),
  },
})
