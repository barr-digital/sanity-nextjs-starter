// Singletons
import { settings } from './documents/singletons/settings'
import { homepage } from './documents/singletons/homepage'
import { header } from './documents/singletons/header'
import { footer } from './documents/singletons/footer'
import { studioIcons } from './documents/singletons/studio-icons'

// Objects
import { link } from './objects/link'
import { image } from './objects/image'
import { seo } from './objects/seo'
import { lucideIcon } from './objects/lucide-icon'

// Base Documents
import { basePage } from './documents/base-page'

// Blocks (PageBuilder)
import { exampleBlock } from './blocks/example-block'

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
  studioIcons,

  // Objects (reusable types)
  link,
  image,
  seo,
  lucideIcon,

  // Blocks (PageBuilder blocks)
  exampleBlock,
  // TODO: Add your custom block types here
  // TODO: Add document types as needed (e.g., page, post, etc.)
]

/**
 * Singleton document types
 * These are document types that should only have one instance per language.
 * `studioIcons` is also a singleton but is NOT translated — icons are a design
 * system concern, shared across all languages. It is excluded from the sidebar
 * (see EXCLUDED_TYPES in structure/index.ts) and edited via right-click menu.
 */
export const SINGLETON_TYPES = ['homepage', 'header', 'footer', 'settings', 'studioIcons'] as const
