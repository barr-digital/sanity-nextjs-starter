import { defineType } from 'sanity'
import { SeoDescriptionInput, SeoInput, SeoTitleInput } from '../../inputs/seo-input'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  components: { input: SeoInput },
  fields: [
    {
      name: 'seoTitle',
      title: 'Meta title',
      type: 'string',
      components: { input: SeoTitleInput },
      description:
        'Shown in browser tabs and as the headline in search results. If empty, the Site Title from Settings is used. Aim for 50–60 characters.',
    },
    {
      name: 'seoDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      components: { input: SeoDescriptionInput },
      description:
        'Summary shown under the title in search results. If empty, the Site Description from Settings is used. Aim for 150–160 characters.',
    },
    {
      name: 'seoKeywords',
      title: 'Keywords',
      type: 'array',
      of: [
        {
          name: 'value',
          type: 'string',
        },
      ],
      description:
        'Optional — most search engines ignore this, but some internal tools still use it.',
    },
    {
      name: 'seoImage',
      title: 'Social share image',
      type: 'img',
      description:
        'Shown when the page is shared on social media. If empty, the default social image from Settings is used. Recommended 1200×630px.',
    },
  ],
})
