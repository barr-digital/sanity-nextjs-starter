import {defineType} from 'sanity'

export const seo = defineType({
  name: 'seo',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fields: [
    {
      name: 'seoTitle',
      type: 'string',
    },
    {
      name: 'seoDescription',
      type: 'text',
      rows: 3,
    },
    {
      name: 'seoKeywords',
      type: 'array',
      of: [
        {
          name: 'value',
          type: 'string',
        },
      ],
    },
    {
      name: 'seoImage',
      type: 'img',
    },
  ],
})
