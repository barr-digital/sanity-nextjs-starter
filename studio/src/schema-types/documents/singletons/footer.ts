import { defineType } from 'sanity'
import { validateUniqueLanguage } from '../../validation/unique-language'
import { iconForSlot } from '../../../icons'

/**
 * Footer Singleton
 *
 * Global footer configuration for the site.
 * Only one instance per language is allowed.
 *
 * TODO: Add your footer fields here (links, social media, copyright, etc.)
 */
export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: iconForSlot('footer'),
  fields: [
    {
      name: 'language',
      type: 'string',
      hidden: true,
      validation: (Rule) => Rule.required().custom(validateUniqueLanguage),
    },
    // TODO: Add your footer fields here
    // Example copyright field:
    // {
    //   name: "copyright",
    //   title: "Copyright Text",
    //   type: "string",
    // },
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      const lang = language === 'en' ? 'English' : language === 'it' ? 'Italian' : null
      return {
        title: lang ? `Footer · ${lang}` : 'Footer',
      }
    },
  },
})
