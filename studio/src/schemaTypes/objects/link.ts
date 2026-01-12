import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

/**
 * Link schema object. This link object lets the user first select the type of link and then
 * enter the URL or page reference - depending on the type selected.
 *
 * TODO: Add more link types as you create new document types (e.g., posts, projects, etc.)
 *
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
    },
    {
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'href',
      options: {
        list: [
          {title: 'URL', value: 'href'},
          {title: 'Custom', value: 'custom'},
          {title: 'Anchor', value: 'anchor'},
          // TODO: Add page type when you create a page document
          // {title: 'Page', value: 'page'},
        ],
        layout: 'radio',
      },
    },
    {
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'href',
      validation: (Rule) =>
        // Custom validation to ensure URL is provided if the link type is 'href'
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'href' && !value) {
            return 'URL is required when Link Type is URL'
          }
          return true
        }),
    },
    defineField({
      name: 'custom',
      title: 'Custom',
      type: 'string',
      hidden: ({parent}) => parent?.linkType !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'custom' && !value) return "L'URL è obbligatorio"

          const allowedSchemes = ['mailto:', 'tel:']
          const isValid = allowedSchemes.some(
            (scheme) => value?.startsWith(scheme) || context.parent?.linkType !== 'custom',
          )

          return isValid || `L'URL deve iniziare con "mailto:" o "tel:"`
        }),
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor ID',
      type: 'string',
      hidden: ({parent}) => parent?.linkType !== 'anchor',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.linkType === 'anchor' && !value) {
            return 'Anchor ID is required when Link Type is Anchor'
          }
          // Validate that the anchor doesn't start with #
          if (value?.startsWith('#')) {
            return 'Non inserire il simbolo #, verrà aggiunto automaticamente'
          }
          // Validate format (only alphanumeric, hyphens, underscores)
          if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
            return "L'anchor ID può contenere solo lettere, numeri, trattini e underscore"
          }
          return true
        }),
    }),

    // TODO: Add page reference field when you create a page document type
    // defineField({
    //   name: 'page',
    //   title: 'Page',
    //   type: 'reference',
    //   to: [{type: 'page'}],
    //   hidden: ({parent}) => parent?.linkType !== 'page',
    //   validation: (Rule) =>
    //     Rule.custom((value, context: any) => {
    //       if (context.parent?.linkType === 'page' && !value) {
    //         return 'Page reference is required when Link Type is Page'
    //       }
    //       return true
    //     }),
    // }),
    {
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    },
  ],
})
