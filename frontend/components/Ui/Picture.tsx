'use client'

import Image from 'next/image'
import {useState} from 'react'
import {urlForImage} from '@/sanity/lib/utils'
import type {SanityImageCrop, SanityImageHotspot} from '@/sanity.types'

type SanityImage = {
  asset: {
    _ref: string
    _type: 'reference'
    _weak?: boolean
  } | null
  hotspot?: SanityImageHotspot | null
  crop?: SanityImageCrop | null
  alt?: string | null
}

interface PictureProps {
  // Can accept either a direct src string OR a Sanity image object
  src?: string
  image?: SanityImage | null
  alt?: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  loading?: 'lazy' | 'eager'
  sizes?: string
  objectFit?: 'cover' | 'contain'
  style?: React.CSSProperties
  quality?: number
  fadeIn?: boolean
}

/**
 * Picture component - Optimized image component for Sanity images
 *
 * Supports both Sanity image objects and direct URLs.
 * Includes optional fade-in animation on load.
 * Handles hotspot and crop from Sanity.
 *
 * Example with Sanity image:
 * <Picture image={sanityImageObject} alt="Description" fill />
 *
 * Example with direct URL:
 * <Picture src="/image.jpg" alt="Description" width={800} height={600} />
 */
export const Picture = ({
  src,
  image,
  alt,
  objectFit,
  className,
  width,
  height,
  fill,
  priority,
  loading,
  sizes,
  style,
  quality,
  fadeIn = true,
}: PictureProps) => {
  const [loaded, setLoaded] = useState(fadeIn ? false : true)

  // Determine the final src URL
  let finalSrc = src
  let finalAlt = alt

  // If image object is provided, use urlForImage to generate the URL
  if (image && !src) {
    const imageUrl = urlForImage(image)?.url()
    if (imageUrl) {
      finalSrc = imageUrl
    }

    // Use alt from image object if not provided as prop
    if (!alt && image.alt) {
      finalAlt = image.alt
    }
  }

  // Return null if no valid src could be determined
  if (!finalSrc) {
    return null
  }

  const imageClasses = [
    objectFit === 'contain' ? 'object-contain' : objectFit === 'cover' ? 'object-cover' : '',
    fadeIn ? 'transition-opacity duration-300' : '',
    loaded ? 'opacity-100' : 'opacity-0',
    className || '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Image
      src={finalSrc}
      alt={finalAlt || ''}
      fill={fill}
      width={width}
      height={height}
      priority={priority}
      loading={loading}
      sizes={sizes}
      quality={quality}
      className={imageClasses}
      style={style}
      onLoad={() => {
        setLoaded(true)
      }}
    />
  )
}
