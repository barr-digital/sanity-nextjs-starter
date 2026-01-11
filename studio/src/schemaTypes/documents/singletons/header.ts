import {defineType} from 'sanity'
import {validateUniqueLanguage} from '../../validation/uniqueLanguage'

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
    select: {
      title: 'title',
      language: 'language',
    },
    prepare({title, language}) {
      return {
        title: title || 'Header',
        subtitle: language ? `Language: ${language.toUpperCase()}` : 'No language set',
      }
    },
  },
})
