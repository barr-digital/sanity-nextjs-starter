import '../globals.css'

import type {Metadata} from 'next'
import {toPlainText} from 'next-sanity'
import {notFound} from 'next/navigation'
import {setRequestLocale} from 'next-intl/server'
import {Inter} from 'next/font/google'

import {sanityFetch, SanityLive} from '@/sanity/lib/live'
import {settingsQuery} from '@/sanity/lib/queries'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {routing} from '@/i18n/routing'
import {handleError} from '@/sanity/lib/live-error'
import {NextIntlClientProvider} from 'next-intl'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

type Props = {
  children: React.ReactNode
  params: Promise<{locale: string}>
}

// Generate static params for all supported locales
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

/**
 * Generate metadata for the page.
 * This will be called for each locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params

  const {data: settings} = await sanityFetch({
    query: settingsQuery,
    params: {lang: locale},
    // Metadata should never contain stega
    stega: false,
  })

  const title = settings?.title || ''
  const description = settings?.description || ''

  const ogImage = resolveOpenGraphImage(settings?.ogImage)

  return {
    title: {
      template: `%s | ${title}`,
      default: title,
    },
    description: typeof description === 'string' ? description : toPlainText(description),
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  // Enable static rendering for this locale
  setRequestLocale(locale)

  return (
    <NextIntlClientProvider>
      <html lang={locale} className={inter.variable}>
        <body>
          <section className="min-h-screen">
            {/* SanityLive enables real-time content updates */}
            <SanityLive onError={handleError} />
            {/* TODO: Add Header component */}
            <main className="">{children}</main>
            {/* TODO: Add Footer component */}
          </section>
        </body>
      </html>
    </NextIntlClientProvider>
  )
}
