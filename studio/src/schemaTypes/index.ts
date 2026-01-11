// Singletons
import {settings} from './documents/singletons/settings'
import {homepage} from './documents/singletons/homepage'
import {header} from './documents/singletons/header'
import {footer} from './documents/singletons/footer'

// Objects
import {link} from './objects/link'
import {image} from './objects/image'
import {seo} from './objects/seo'

// Base Documents
import {basePage} from './documents/basePage'

// Blocks (PageBuilder)
import {exampleBlock} from './blocks/exampleBlock'

/**
 * Schema Types
 *
 * This array exports all schema types used in the Sanity Studio.
 * Order matters for the Studio UI - types appear in this order.
 *
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const schemaTypes = [
  // Singletons (single documents)
  homepage,
  header,
  footer,
  settings,

  // Objects (reusable types)
  link,
  image,
  seo,

  // Blocks (PageBuilder blocks)
  exampleBlock,
  // TODO: Add your custom block types here
  // TODO: Add document types as needed (e.g., page, post, etc.)
]

/**
 * Singleton document types
 * These are document types that should only have one instance per language
 */
export const SINGLETON_TYPES = ['homepage', 'header', 'footer', 'settings'] as const
