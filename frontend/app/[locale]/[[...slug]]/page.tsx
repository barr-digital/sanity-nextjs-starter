import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { homepageQuery } from '@/sanity/lib/queries'
import { PageBuilder } from '@/components/layout/page-builder'
import { HomePage } from '@/app/_pages/home-page'
import { resolveOpenGraphImage } from '@/sanity/lib/utils'
import { getMetadataBase, buildCanonicalPath, buildAlternateLanguages } from '@/lib/data/metadata'
import { generateStaticParamsForLocale } from '@/lib/data/sitemap'
import { routing } from '@/i18n/routing'
import type { HomepageQueryResult } from '@/sanity.types'

type Props = {
  params: Promise<{
    locale: string
    slug?: string[]
  }>
}

/**
 * Catch-all page component. Handles all routes via [locale]/[[...slug]].
 *
 * To add a new page type:
 * 1. Create schema in studio/src/schema-types/documents/
 * 2. Add GROQ query in frontend/sanity/lib/queries.ts
 * 3. Create page component in frontend/app/_pages/
 * 4. Add fetch logic + case in renderPageComponent() below
 */

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params

  const [metadataBase, languages] = await Promise.all([
    getMetadataBase(),
    buildAlternateLanguages({ currentSlug: slug, currentLocale: locale }),
  ])
  const canonicalPath = buildCanonicalPath(locale, slug, routing.defaultLocale)

  // 1. Homepage (no slug)
  if (!slug || slug.length === 0) {
    const { data: homepage } = await sanityFetch({
      query: homepageQuery,
      params: { lang: locale },
    })

    if (!homepage) {
      return {
        metadataBase,
        alternates: {
          canonical: canonicalPath,
          languages,
        },
      }
    }

    const ogImage = resolveOpenGraphImage(homepage?.seo?.seoImage)

    return {
      metadataBase,
      ...(homepage?.seo?.seoTitle && { title: homepage.seo.seoTitle }),
      ...(homepage?.seo?.seoDescription && {
        description: homepage.seo.seoDescription,
      }),
      ...(ogImage && {
        openGraph: {
          images: [ogImage],
        },
      }),
      alternates: {
        canonical: canonicalPath,
        languages,
      },
    }
  }

  // TODO: Add metadata for other page types (fetch by slug, extract seo fields)
  return {
    metadataBase,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
  }
}

/**
 * Helper function to render the correct page component based on document type
 *
 * Add your page types here as you create them.
 * Each case should correspond to a document _type from your Sanity schema.
 *
 * Example for adding new page types:
 * case "aboutPage":
 *   return <AboutPage page={content} />;
 * case "projectsListing":
 *   return <ProjectsListingPage page={content} items={items} />;
 */
// Add new page query result types to this union as you create them
type PageContent = NonNullable<HomepageQueryResult>

function renderPageComponent(content: PageContent) {
  switch (content._type) {
    case 'homepage':
      return <HomePage page={content} />
    // TODO: Add more page types as you create them
    default:
      return <PageBuilder page={content} />
  }
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params

  // 1. Homepage (no slug)
  if (!slug || slug.length === 0) {
    const { data: homepage } = await sanityFetch({
      query: homepageQuery,
      params: { lang: locale },
    })

    if (!homepage) {
      notFound()
    }

    return renderPageComponent(homepage)
  }

  // TODO: Add logic for other page types (fetch by slug, render via renderPageComponent)

  notFound()
}

/**
 * Generate static params for all content
 * Uses the shared helper function to ensure consistency with sitemap
 */
export async function generateStaticParams({
  params,
}: {
  params: { locale: string }
}): Promise<{ slug?: string[] }[]> {
  const { locale } = params
  const allParams = await generateStaticParamsForLocale(locale)
  // Return only the slug part (locale is already in the route)
  return allParams.map((param) => ({ slug: param.slug }))
}
