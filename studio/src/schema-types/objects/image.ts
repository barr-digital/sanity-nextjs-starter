import { defineType } from 'sanity'
import { ImgInput } from '../../inputs/img-input'

export const image = defineType({
  name: 'img',
  title: 'Image',
  type: 'image',
  components: { input: ImgInput },
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'string',
      title: 'Alternative text',
      description: 'Important for SEO and accessibility. Leave empty for purely decorative images.',
    },
  ],
  preview: {
    select: {
      asset: 'asset',
      fileName: 'asset.originalFilename',
      alt: 'alt',
    },
    prepare({ asset, fileName, alt }) {
      return {
        title: fileName || 'No filename',
        subtitle: alt || 'No alt text',
        media: asset,
      }
    },
  },
})
