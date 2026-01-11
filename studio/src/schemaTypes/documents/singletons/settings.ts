import {CogIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {validateUniqueLanguage} from '../../validation/uniqueLanguage'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    {
      name: 'language',
      type: 'string',
      hidden: true,
      validation: (Rule) => Rule.required().custom(validateUniqueLanguage),
    },
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'Title for this site',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      description: 'Description for this site',
    },
    {
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'img',
      description: 'Displayed on social cards and search engine results.',
    },
  ],
  preview: {
    select: {
      language: 'language',
    },
    prepare({language}) {
      return {
        title: 'Settings',
        subtitle: language ? `Language: ${language.toUpperCase()}` : 'No language set',
      }
    },
  },
})
