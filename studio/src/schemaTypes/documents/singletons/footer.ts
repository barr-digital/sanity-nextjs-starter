import {defineType} from 'sanity'
import {validateUniqueLanguage} from '../../validation/uniqueLanguage'

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
    select: {
      title: 'title',
      language: 'language',
    },
    prepare({title, language}) {
      return {
        title: title || 'Footer',
        subtitle: language ? `Language: ${language.toUpperCase()}` : 'No language set',
      }
    },
  },
})
