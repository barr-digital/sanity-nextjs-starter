import {Link} from '@/sanity.types'
import {dataset, projectId} from '@/sanity/lib/api'
import imageUrlBuilder from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {DereferencedLink} from '@/sanity/lib/types'
import {getImageDimensions} from '@sanity/asset-utils'

const builder = imageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

/**
 * Generate optimized image URL from Sanity image object
 * Automatically applies format optimization and handles crop/hotspot
 */
export function urlForImage(source: any) {
  // Ensure that source image contains a valid reference
  if (!source?.asset?._ref) {
    return undefined
  }

  const imageRef = source?.asset?._ref
  const crop = source.crop

  // Get the image's original dimensions
  const {width, height} = getImageDimensions(imageRef)

  if (Boolean(crop)) {
    // Compute the cropped image's area
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)))
    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)))

    // Compute the cropped image's position
    const left = Math.floor(width * crop.left)
    const top = Math.floor(height * crop.top)

    // Return cropped image URL
    return builder?.image(source).rect(left, top, croppedWidth, croppedHeight).auto('format')
  }

  return builder?.image(source).auto('format')
}

export function resolveOpenGraphImage(
  image?: SanityImageSource | null,
  width = 1200,
  height = 627,
) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url()
  if (!url) return
  return {url, alt: (image as {alt?: string})?.alt || '', width, height}
}

/**
 * Resolve a link object to a URL string
 *
 * Supports:
 * - External URLs (href type)
 * - Internal page references (page type) - dereferenced in GROQ as pageSlug
 * - Custom links (custom type) - mailto:, tel:, etc.
 */
export function linkResolver(link: Link | DereferencedLink | undefined) {
  if (!link) return null

  // If linkType is not set but href is, set linkType to "href"
  // This happens when pasting links in the portable text editor
  if (!link.linkType && link.href) {
    link.linkType = 'href'
  }

  switch (link.linkType) {
    case 'href':
      return link.href || null

    case 'custom':
      // Custom links (mailto:, tel:, etc.)
      const customUrl = (link as any).custom
      return customUrl || null

    case 'page':
      // pageSlug comes from the GROQ query
      // Example: "pageSlug": page->slug.current
      const pageSlug = (link as any).pageSlug

      if (!pageSlug || typeof pageSlug !== 'string') {
        return null
      }

      // Use the slug directly for all pages
      // Examples: "about" → "/about", "contact" → "/contact"
      return `/${pageSlug}`

    case 'anchor':
      // Anchor links (e.g., #chi-siamo)
      const anchorId = (link as any).anchor
      if (!anchorId || typeof anchorId !== 'string') {
        return null
      }
      return `#${anchorId}`

    default:
      return null
  }
}
