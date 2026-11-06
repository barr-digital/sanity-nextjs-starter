import 'server-only'

import { sanityFetch } from '@/sanity/lib/live'
import { slugTranslationQuery } from '@/sanity/lib/queries'

/**
 * Result of slug translation lookup
 */
export type SlugTranslationResult = {
  /** The translated slug path (without locale prefix) */
  slug: string | null
  /** Whether the translation was found */
  found: boolean
}

/**
 * Translates a slug from one language to another by finding the equivalent document in Sanity.
 *
 * This function uses the @sanity/document-internationalization plugin to find translated versions
 * of documents across languages. It handles different types of content:
 * - Home page (empty slug)
 * - Regular pages (about, contact, etc.)
 * - Collection pages (future: projects, sectors, etc.)
 * - Collection items (future: individual projects and sectors)
 *
 * How it works:
 * 1. Finds the current document by slug and fromLocale
 * 2. Queries translation.metadata to find the translated document ID
 * 3. Fetches the translated document's slug
 * 4. Returns the translated slug or null if not found
 *
 * @param currentSlug - The current slug path (e.g., "about" or "projects/project-name")
 * @param fromLocale - The current locale (e.g., "it")
 * @param toLocale - The target locale (e.g., "en")
 * @returns The translated slug or null if not found
 */
export async function translateSlug(
  currentSlug: string | string[] | undefined,
  fromLocale: string,
  toLocale: string,
): Promise<SlugTranslationResult> {
  // Handle home page - always exists in all languages
  if (!currentSlug || currentSlug.length === 0) {
    return { slug: '', found: true }
  }

  // Convert to string if array
  const slugPath = Array.isArray(currentSlug) ? currentSlug.join('/') : currentSlug

  // Handle empty string
  if (!slugPath || slugPath.trim() === '') {
    return { slug: '', found: true }
  }

  try {
    // Case 1: Try to find as a regular page or collection page (full slug match)
    // This uses the @sanity/document-internationalization plugin's translation.metadata
    // sanityFetch, not client.fetch: this runs on every request (hreflang in
    // generateMetadata, language switcher Server Action). The raw client skips
    // the Next.js Data Cache and burns the Sanity API quota.
    const { data: currentPage } = await sanityFetch({
      query: slugTranslationQuery,
      params: { slug: slugPath, fromLang: fromLocale, toLang: toLocale },
      stega: false,
    })

    // If we found a translation through the document-internationalization plugin
    if (currentPage?.translatedDoc?.slug) {
      return { slug: currentPage.translatedDoc.slug, found: true }
    }

    // Case 2: Collection item (e.g., "projects/project-name")
    // TODO: Implement when you add collection types like project, sector, etc.
    // This section would handle URLs with 2 parts: collection/item
    //
    // Example implementation:
    // if (slugParts.length === 2) {
    //   const [collectionSlug, itemSlug] = slugParts;
    //
    //   // Find the item in the current language
    //   const itemQuery = `*[_type in ["project", "sector"] && slug.current == $itemSlug && language == $fromLang][0]{
    //     _id,
    //     _type,
    //     "slug": slug.current,
    //     "translatedItem": *[_type == "translation.metadata" && ^._id in translations[].value._ref][0]
    //       .translations[_key == $toLang][0].value->{
    //         "slug": slug.current
    //       }
    //   }`;
    //
    //   const { data: result } = await sanityFetch({
    //     query: itemQuery,
    //     params: { itemSlug, fromLang: fromLocale, toLang: toLocale },
    //     stega: false,
    //   });
    //
    //   if (result?.translatedItem?.slug) {
    //     // Determine parent collection type and fetch parent translation
    //     const parentType = result._type === "project" ? "projectsListing" : "sectorsListing";
    //     const parentQuery = `*[_type == $parentType && language == $toLang][0]{
    //       "slug": slug.current
    //     }`;
    //
    //     const { data: translatedParent } = await sanityFetch({
    //       query: parentQuery,
    //       params: { parentType, toLang: toLocale },
    //       stega: false,
    //     });
    //
    //     if (translatedParent?.slug) {
    //       return {
    //         slug: `${translatedParent.slug}/${result.translatedItem.slug}`,
    //         found: true,
    //       };
    //     }
    //   }
    // }

    // Not found - return null to trigger fallback to homepage
    return { slug: null, found: false }
  } catch (error) {
    console.error('Error translating slug:', error)
    return { slug: null, found: false }
  }
}
