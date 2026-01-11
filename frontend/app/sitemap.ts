import {MetadataRoute} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {sitemapDataQuery} from '@/sanity/lib/queries'
import {routing} from '@/i18n/routing'
import {getMetadataBase, buildCanonicalPath, generateAllStaticParams} from '@/lib/helpers.server'

/**
 * This file creates a sitemap (sitemap.xml) for the application.
 * It includes all pages for all supported locales.
 *
 * Uses the same static params generation as the page routes to ensure consistency.
 *
 * Learn more about sitemaps in Next.js:
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get baseUrl using the same logic as metadata
  const metadataBase = await getMetadataBase()
  let baseUrl =
    metadataBase?.toString() || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Remove trailing slash from baseUrl to avoid double slashes
  baseUrl = baseUrl.replace(/\/+$/, '')

  // Generate all static params (single source of truth)
  const allParams = await generateAllStaticParams()

  // Get lastModified dates for documents with slugs
  const lastModifiedMap = new Map<string, Date>()
  for (const locale of routing.locales) {
    const {data} = await sanityFetch({
      query: sitemapDataQuery,
      params: {lang: locale},
    })
    if (data) {
      for (const item of data) {
        const key = `${locale}:${item.slug}`
        lastModifiedMap.set(key, new Date(item._updatedAt))
      }
    }
  }

  // Build sitemap entries from static params
  const sitemapEntries: MetadataRoute.Sitemap = []
  const seenUrls = new Set<string>()

  for (const param of allParams) {
    const {locale, slug} = param
    const path = buildCanonicalPath(locale, slug, routing.defaultLocale)
    const url = `${baseUrl}${path}`

    // Skip duplicates
    if (seenUrls.has(url)) {
      continue
    }
    seenUrls.add(url)

    // Determine priority and lastModified
    let priority = 0.8
    let changeFrequency: 'monthly' | 'weekly' = 'monthly'
    let lastModified = new Date()

    if (!slug || slug.length === 0) {
      // Homepage
      priority = 1
    }
    // TODO: Add more specific priority/changeFrequency logic when you add collection pages
    // Example:
    // else if (slug.length === 2) {
    //   // Collection items (e.g., projects/project-name)
    //   priority = 0.6;
    //   changeFrequency = "weekly";
    //   const key = `${locale}:${slug[1]}`;
    //   const itemLastModified = lastModifiedMap.get(key);
    //   if (itemLastModified) {
    //     lastModified = itemLastModified;
    //   }
    // }

    sitemapEntries.push({
      url,
      lastModified,
      changeFrequency,
      priority,
    })
  }

  return sitemapEntries
}
