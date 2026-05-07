import 'server-only'

/**
 * JSON-LD structured data helpers (schema.org).
 *
 * These return plain objects ready to embed in a page via:
 *
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
 *
 * Helpers, not components: the rendering surface (where to mount the
 * `<script>`, whether to also render visual breadcrumbs, layout choices)
 * varies too much per project for a one-size-fits-all UI.
 *
 * Validate output with:
 *   - https://search.google.com/test/rich-results
 *   - https://validator.schema.org/
 */

export type OrganizationData = {
  /** Site / organization name (typically `settings.title`). */
  name: string
  /** Optional plain-language description (typically `settings.description`). */
  description?: string
  /** Absolute URL of the brand logo. */
  logoUrl?: string | null
  /** Absolute URL of the default social share image (typically `settings.ogImage`). */
  ogImageUrl?: string | null
}

/**
 * Build an `Organization` JSON-LD object — the universal "this site
 * represents X" signal. Mount on the homepage at minimum; some sites mount
 * it on every page. Address/contactPoint are intentionally omitted: format
 * varies by country and per-project. If you need them, extend the returned
 * object inline at the call site.
 */
export function buildOrganizationJsonLd(
  data: OrganizationData,
  baseUrl: string | URL,
): Record<string, unknown> {
  const url = typeof baseUrl === 'string' ? baseUrl.replace(/\/+$/, '') : baseUrl.origin

  const json: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: url || undefined,
  }

  if (data.description) json.description = data.description
  if (data.logoUrl) json.logo = data.logoUrl
  if (data.ogImageUrl) json.image = data.ogImageUrl

  return json
}

export type BreadcrumbJsonLdItem = {
  /** Visible label for the breadcrumb step. */
  name: string
  /** Path relative to `baseUrl` (e.g. `/en/about`). Omit on the last item. */
  href?: string
}

/**
 * Build a `BreadcrumbList` JSON-LD object. Pair this with whatever
 * breadcrumb component you render — the visual representation is yours,
 * the SEO signal is here.
 *
 * The last item is rendered without `item` (URL) by convention: it is the
 * current page, and Google prefers no URL for the leaf.
 */
export function buildBreadcrumbJsonLd(
  items: BreadcrumbJsonLdItem[],
  baseUrl: string | URL,
): Record<string, unknown> | null {
  if (items.length === 0) return null

  const url = typeof baseUrl === 'string' ? baseUrl.replace(/\/+$/, '') : baseUrl.origin

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const position = index + 1
      const isLast = index === items.length - 1
      if (!item.href || isLast) {
        return {
          '@type': 'ListItem',
          position,
          name: item.name,
        }
      }
      return {
        '@type': 'ListItem',
        position,
        name: item.name,
        item: `${url}${item.href}`,
      }
    }),
  }
}
