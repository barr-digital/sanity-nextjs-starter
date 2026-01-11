/**
 * Get metadataBase URL from request headers or environment variable
 */
export async function getMetadataBase(): Promise<URL | undefined> {
  try {
    const {headers} = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'

    if (host) {
      return new URL(`${protocol}://${host}`)
    }
  } catch {
    // Headers not available (e.g., during static generation)
  }

  // Fallback to env variable if headers are not available
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL)
    } catch {
      // ignore invalid URL
    }
  }

  return undefined
}

/**
 * Build canonical URL path from locale and slug
 */
export function buildCanonicalPath(
  locale: string,
  slug: string[] | undefined,
  defaultLocale: string,
): string {
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`

  // Filter out empty strings, trim, and build slug path
  const cleanSlug = slug?.filter((s) => s && typeof s === 'string' && s.trim().length > 0) || []
  // Encode each slug part to handle special characters (e.g., "quiénes-somos" → "qui%C3%A9nes-somos")
  const encodedSlug = cleanSlug.map((s) => encodeURIComponent(s))
  const slugPath = encodedSlug.length > 0 ? `/${encodedSlug.join('/')}` : ''

  // Combine and normalize: remove any double slashes
  const path = `${localePrefix}${slugPath}`
  // Replace multiple slashes with single slash, but preserve leading slash
  const normalized = path.replace(/\/+/g, '/')

  // Ensure we always return at least "/"
  return normalized || '/'
}
