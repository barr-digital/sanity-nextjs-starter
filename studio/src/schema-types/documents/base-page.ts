import { defineField, defineType } from 'sanity'
import { validateUniqueLanguage } from '../validation/unique-language'

/**
 * Base page schema with common fields that can be extended by other document types.
 *
 * Provides both `title` (page title / H1) and `breadcrumbLabel` (short label for
 * breadcrumbs) so projects can use whichever semantics fit: pages with a real
 * title reuse `title`, singletons that only need navigation labels can exclude
 * `title` from their own field mapping and use `breadcrumbLabel` only.
 *
 * The slug source falls back intelligently: it reads from `title` first, then
 * from `breadcrumbLabel`, so both patterns produce a valid slug suggestion.
 *
 * GROQ convention: when consuming pages downstream, alias the rendered label
 * with `"title": coalesce(breadcrumbLabel, title)` so legacy documents (only
 * `title`) and new documents (only `breadcrumbLabel`) both resolve.
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
      name: 'breadcrumbLabel',
      title: 'Breadcrumb label',
      type: 'string',
      description:
        'Short label shown on breadcrumbs across the site. Leave empty to use the page title.',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) =>
          (doc as { title?: string; breadcrumbLabel?: string }).title ||
          (doc as { title?: string; breadcrumbLabel?: string }).breadcrumbLabel ||
          '',
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
