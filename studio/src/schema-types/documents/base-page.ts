import { defineField, defineType } from 'sanity'
import { validateUniqueLanguage } from '../validation/unique-language'

/**
 * Base page schema with common fields that can be extended by other document types.
 *
 * Note: `breadcrumbLabel` was removed on purpose (as barr-website-v3 did) —
 * BARR designs have no breadcrumbs, and the field only confused editors
 * (it showed up on every page, homepage included). If a project ever needs
 * breadcrumbs, re-add the field here plus the GROQ convention
 * `"title": coalesce(breadcrumbLabel, title)` in its queries.
 */
export const basePage = defineType({
  name: 'basePage',
  type: 'document',
  fields: [
    {
      name: 'language',
      type: 'string',
      hidden: true,
      validation: (Rule) => Rule.required().custom(validateUniqueLanguage),
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Page title — used as H1, default SEO title, and slug source.',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) => (doc as { title?: string }).title || '',
        maxLength: 96,
        // Custom isUnique function following Sanity's official documentation pattern
        // https://www.sanity.io/docs/slug-type
        isUnique: async (slug, context) => {
          const { document, getClient } = context
          const client = getClient({
            apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
          })
          const language = document?.language
          const documentType = document?._type

          if (!language || !documentType) {
            return true // Skip validation if language or type is not set
          }

          // Get the document ID without the drafts prefix
          const id = document._id.replace(/^drafts\./, '')
          const params = {
            draft: `drafts.${id}`,
            published: id,
            slug: slug,
            documentType,
            language,
          }

          // Query to check if slug exists for the same language and document type
          // Following Sanity's official documentation pattern
          const query = `!defined(*[!(_id in [$draft, $published]) && _type == $documentType && slug.current == $slug && language == $language][0]._id)`
          const result = await client.fetch(query, params)
          return result
        },
      },
      validation: (rule) => rule.required(),
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    },
  ],
})
