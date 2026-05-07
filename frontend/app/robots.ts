import type { MetadataRoute } from 'next'
import { getMetadataBase } from '@/lib/data/metadata'

/**
 * `robots.txt` generator.
 *
 * Resolves the site's canonical origin via `getMetadataBase()` so the
 * sitemap reference always points at the production domain (Vercel), not at
 * a preview deploy or `localhost`.
 *
 * The example `Disallow` entry below is commented out as a teaching
 * template — uncomment and adapt when you add an admin area, an auth-walled
 * route group, or anything else you want excluded from search results.
 *
 * Learn more: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const metadataBase = await getMetadataBase()
  const baseUrl = metadataBase?.toString().replace(/\/+$/, '') || ''

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // disallow: ['/admin', '/api/private'],
      },
    ],
    sitemap: baseUrl ? `${baseUrl}/sitemap.xml` : undefined,
  }
}
