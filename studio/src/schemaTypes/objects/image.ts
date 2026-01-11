import {defineType} from 'sanity'

export const image = defineType({
  name: 'img',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative text',
      description: 'Important for SEO and accessibility.',
      validation: (rule) => {
        return rule.custom((alt, context) => {
          if ((context.document?.img as any)?.asset?._ref && !alt) {
            return 'Required'
          }
          return true
        })
      },
    },
  ],
  preview: {
    select: {
      asset: 'asset',
      fileName: 'asset.originalFilename',
      alt: 'alt',
    },
    prepare({asset, fileName, alt}) {
      return {
        title: fileName || 'No filename',
        subtitle: alt || 'No alt text',
        media: asset,
      }
    },
  },
})
