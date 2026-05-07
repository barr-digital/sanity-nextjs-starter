import { defineField, defineType } from 'sanity'
import { validateUniqueLanguage } from '../../validation/unique-language'
import { iconForSlot } from '../../../icons'
import { SettingsInput } from '../../../inputs/settings-input'

/**
 * Settings schema Singleton.  Singletons are single documents that are displayed not in a collection, handy for things like site settings and other global configurations.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const settings = defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  icon: iconForSlot('settings'),
  components: { input: SettingsInput },
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
      description:
        'Name of the site. Appended to page titles ("Page — Site Title") and used as default title on pages that don\'t set their own.',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      description:
        "Default description used on pages that don't set their own SEO description. Aim for 150–160 characters.",
    },
    {
      name: 'ogImage',
      title: 'Default Social Image',
      type: 'img',
      description:
        "Default social share image used on pages that don't set their own. Recommended 1200×630px.",
    },
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      const lang = language === 'en' ? 'English' : language === 'it' ? 'Italian' : null
      return {
        title: lang ? `Settings · ${lang}` : 'Settings',
      }
    },
  },
})
