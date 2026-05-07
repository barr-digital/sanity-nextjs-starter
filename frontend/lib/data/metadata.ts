import 'server-only'

import { routing } from '@/i18n/routing'
import { translateSlug } from '@/lib/data/translations'

/**
 * Resolves the site's canonical origin. Single source of truth — use this
 * everywhere instead of reading any env variable or `headers()` directly.
 *
 * Resolution order:
 * 1. `VERCEL_PROJECT_PRODUCTION_URL` — auto-injected by Vercel at both build
 *    and runtime; always points to the production domain (custom domain or
 *    `*.vercel.app`) even on preview deploys, exactly as Vercel recommends
 *    for OG/canonical/sitemap URLs.
 * 2. Request headers (`host` + `x-forwarded-proto`) — fallback for local
 *    dev or non-Vercel hosts. Note: calling `headers()` opts the calling
 *    Server Component / Route Handler into dynamic rendering.
 * 3. `NEXT_PUBLIC_SITE_URL` — last-resort static fallback (e.g. for build
 *    contexts outside a request, like `app/sitemap.ts` running at build).
 */
export async function getMetadataBase(): Promise<URL | undefined> {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    try {
      return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    } catch {
      // ignore invalid URL
    }
  }

  try {
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'https'

    if (host) {
      return new URL(`${protocol}://${host}`)
    }
  } catch {
    // Headers not available (e.g., during static generation outside a request context)
  }

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
 * Build canonical URL path from locale and slug. Pure function (no I/O):
 * lives here for co-location with `getMetadataBase` since metadata callers
 * always need both. Encodes special characters in slug parts so non-ASCII
 * URLs (e.g. "quiénes-somos") survive the round trip.
 */
export function buildCanonicalPath(
  locale: string,
  slug: string[] | undefined,
  defaultLocale: string,
): string {
  const localePrefix = locale === defaultLocale ? '' : `/${locale}`

  const cleanSlug = slug?.filter((s) => s && typeof s === 'string' && s.trim().length > 0) || []
  const encodedSlug = cleanSlug.map((s) => encodeURIComponent(s))
  const slugPath = encodedSlug.length > 0 ? `/${encodedSlug.join('/')}` : ''

  const path = `${localePrefix}${slugPath}`
  const normalized = path.replace(/\/+/g, '/')

  return normalized || '/'
}

/**
 * Build the `alternates.languages` map for a Sanity-backed page.
 *
 * Resolves translated slugs for every other locale via the
 * `@sanity/document-internationalization` plugin (`translation.metadata`).
 * Locales without a translation are omitted — Google prefers a missing
 * hreflang over a wrong one. The default locale entry is duplicated under
 * `x-default` when present (signal to crawlers).
 *
 * Pass the result as `alternates.languages` in `generateMetadata`. Combine
 * with `alternates.canonical = buildCanonicalPath(...)` for the current
 * locale's own canonical URL.
 */
export async function buildAlternateLanguages({
  currentSlug,
  currentLocale,
}: {
  currentSlug: string[] | undefined
  currentLocale: string
}): Promise<Record<string, string>> {
  const { locales, defaultLocale } = routing
  const languages: Record<string, string> = {}

  languages[currentLocale] = buildCanonicalPath(currentLocale, currentSlug, defaultLocale)

  await Promise.all(
    locales
      .filter((locale) => locale !== currentLocale)
      .map(async (locale) => {
        const { slug, found } = await translateSlug(currentSlug, currentLocale, locale)
        if (!found || slug === null) return
        const slugArray = slug === '' ? undefined : slug.split('/').filter(Boolean)
        languages[locale] = buildCanonicalPath(locale, slugArray, defaultLocale)
      }),
  )

  if (languages[defaultLocale]) {
    languages['x-default'] = languages[defaultLocale]
  }

  return languages
}
