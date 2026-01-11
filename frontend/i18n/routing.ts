import {defineRouting} from 'next-intl/routing'
import {createNavigation} from 'next-intl/navigation'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['it'],

  // Used when no locale matches
  defaultLocale: 'it',

  // The `pathnames` property is intentionally omitted as we use catch-all routes
  // All routes will be handled by [[...slug]]

  localePrefix: 'as-needed',

  // Disable locale detection - users must explicitly select language
  localeDetection: false,
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} = createNavigation(routing)
