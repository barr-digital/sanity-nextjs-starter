import {defineQuery} from 'next-sanity'

/**
 * GROQ Fragments
 * Reusable query fragments for consistent data fetching
 */

// Image object with all properties (asset, hotspot, crop, alt)
const imageFragment = /* groq */ `{
  asset,
  hotspot,
  crop,
  alt
}`

// Link fragment with dereferenced page slug
const linkFragment = /* groq */ `{
  _type,
  label,
  linkType,
  href,
  custom,
  "pageSlug": page->slug.current,
  "pageType": page->_type,
  openInNewTab,
  tooltip
}`

// PortableText fragment with link annotations
const portableTextFragment = /* groq */ `{
  ...,
  markDefs[]{
    ...,
    _type == "link" => {
      _type,
      label,
      linkType,
      href,
      custom,
      "pageSlug": page->slug.current,
      "pageType": page->_type,
      openInNewTab,
      tooltip
    }
  }
}`

// Page builder blocks fragment
// Add specific block handling as you create them
// TODO: Add more block type handlers (heroBlock, textBlock, etc.)
const pageBuilderFragment = /* groq */ `{
  ...,
  _type == 'exampleBlock' => {
    ...,
    title,
    text
  }
}`

/**
 * Global Queries
 */

// Settings singleton
export const settingsQuery = defineQuery(`
  *[_type == "settings" && language == $lang][0]{
    title,
    description,
    ogImage${imageFragment}
  }
`)

// Header singleton
// TODO: Add menu fields as you build the header (menuItems with linkFragment)
export const headerQuery = defineQuery(`
  *[_type == "header" && language == $lang][0]{
    _id,
    _type,
  }
`)

// Footer singleton
// TODO: Add footer fields as you build it (links[] with linkFragment)
export const footerQuery = defineQuery(`
  *[_type == "footer" && language == $lang][0]{
    _id,
    _type,
  }
`)

/**
 * Page Queries
 */

// Homepage query
export const homepageQuery = defineQuery(`
  *[_type == "homepage" && language == $lang][0]{
    _id,
    _type,
    title,
    seo{
      seoTitle,
      seoDescription,
      seoImage${imageFragment},
    },
    "pageBuilder": pageBuilder[]${pageBuilderFragment}
  }
`)

/**
 * Static Generation Queries
 */

// Sitemap data query
export const sitemapDataQuery = defineQuery(`
  *[defined(slug.current) && language == $lang]{
    "slug": slug.current,
    _type,
    _updatedAt
  }
`)
