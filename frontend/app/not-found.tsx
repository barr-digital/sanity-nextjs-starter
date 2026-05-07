import Link from 'next/link'

/**
 * Global 404 page. Lives at `app/not-found.tsx` (not under `[locale]/`) so it
 * also catches requests outside any localized segment.
 *
 * Uses the plain Next.js `<Link>` (not the localized wrapper from
 * `i18n/routing`) because the user could land here from a route that has no
 * matching locale at all. The `/` link delegates locale resolution to the
 * proxy + `localePrefix: 'as-needed'`.
 */
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <section className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-12 text-center md:px-8">
          <p className="text-sm font-semibold tracking-wider text-neutral-500 uppercase">404</p>
          <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">Page not found</h1>
          <p className="max-w-lg text-base text-neutral-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to home
          </Link>
        </section>
      </body>
    </html>
  )
}
