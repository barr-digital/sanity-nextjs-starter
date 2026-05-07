import { defineType } from 'sanity'
import { validateUniqueLanguage } from '../../validation/unique-language'
import { iconForSlot } from '../../../icons'

/**
 * Header Singleton
 *
 * Global header configuration for the site.
 * Only one instance per language is allowed.
 *
 * TODO: Add your header fields here (navigation, logo, etc.)
 */
export const header = defineType({
  name: 'header',
  title: 'Header',
  type: 'document',
  icon: iconForSlot('header'),
  fields: [
    {
      name: 'language',
      type: 'string',
      hidden: true,
      validation: (Rule) => Rule.required().custom(validateUniqueLanguage),
    },
    // TODO: Add your header fields here
    // Example navigation field:
    // {
    //   name: "navigation",
    //   title: "Navigation",
    //   type: "array",
    //   of: [{ type: "link" }],
    // },
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      const lang = language === 'en' ? 'English' : language === 'it' ? 'Italian' : null
      return {
        title: lang ? `Header · ${lang}` : 'Header',
      }
    },
  },
})
