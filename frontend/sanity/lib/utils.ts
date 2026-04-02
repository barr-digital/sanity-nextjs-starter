import { Link } from '@/sanity.types'
import { dataset, projectId } from '@/sanity/lib/api'
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { DereferencedLink } from '@/sanity/lib/types'
import { getImageDimensions } from '@sanity/asset-utils'

type SanityImageWithCrop = {
  asset?: { _ref?: string; _type?: string } | null
  crop?: { left: number; right: number; top: number; bottom: number } | null
}

const builder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

/**
 * Generate optimized image URL from Sanity image object
 * Automatically applies format optimization and handles crop/hotspot
 */
export function urlForImage(source: SanityImageWithCrop) {
  if (!source?.asset?._ref) {
    return undefined
  }

  const imageRef = source.asset._ref
  const crop = source.crop

  // Get the image's original dimensions
  const { width, height } = getImageDimensions(imageRef)

  if (crop) {
    const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)))
    const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)))
    const left = Math.floor(width * crop.left)
    const top = Math.floor(height * crop.top)

    return builder?.image(source).rect(left, top, croppedWidth, croppedHeight).auto('format')
  }

  return builder?.image(source).auto('format')
}

export function resolveOpenGraphImage(
  image?: (SanityImageWithCrop & { alt?: string | null }) | null,
  width = 1200,
  height = 627,
) {
  if (!image) return
  const url = urlForImage(image)?.width(1200).height(627).fit('crop').url()
  if (!url) return
  return { url, alt: image.alt || '', width, height }
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

  // If linkType is not set but href is, infer "href" type
  // This happens when pasting links in the portable text editor
  const linkType = !link.linkType && link.href ? 'href' : link.linkType

  switch (linkType) {
    case 'href':
      return link.href || null

    case 'custom': {
      const customUrl = 'custom' in link ? link.custom : undefined
      return customUrl || null
    }

    case 'page': {
      const pageSlug = 'pageSlug' in link ? link.pageSlug : undefined
      if (!pageSlug || typeof pageSlug !== 'string') {
        return null
      }
      return `/${pageSlug}`
    }

    case 'anchor': {
      const anchorId = 'anchor' in link ? link.anchor : undefined
      if (!anchorId || typeof anchorId !== 'string') {
        return null
      }
      return `#${anchorId}`
    }

    default:
      return null
  }
}
