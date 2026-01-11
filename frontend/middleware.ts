import createMiddleware from 'next-intl/middleware'
import {routing} from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/',
    '/(it)/:path*', // TODO: Add more locales as needed (e.g., "/(it|en|es|fr)/:path*")
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
}
