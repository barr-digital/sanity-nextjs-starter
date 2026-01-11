import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {homepageQuery} from '@/sanity/lib/queries'
import {PageBuilder} from '@/components/Layout'
import {HomePage} from '@/app/_pages'
import {resolveOpenGraphImage} from '@/sanity/lib/utils'
import {
  getMetadataBase,
  buildCanonicalPath,
  generateStaticParamsForLocale,
} from '@/lib/helpers.server'
import {routing} from '@/i18n/routing'

type Props = {
  params: Promise<{
    locale: string
    slug?: string[]
  }>
}

/**
 * Main page component that handles all routes through the catch-all pattern.
 * It receives the locale and optional slug segments from the URL.
 *
 * Examples of routes handled:
 * - / or /it → homepage (locale: "it", slug: undefined)
 * - /en/about → about page (locale: "en", slug: ["about"])
 * - /it/projects/project-name → project detail (locale: "it", slug: ["projects", "project-name"])
 *
 * HOW TO ADD NEW PAGE TYPES:
 *
 * 1. Create the page schema in studio/src/schemaTypes/documents/
 *    Example: aboutPage.ts with fields like title, slug, pageBuilder, etc.
 *
 * 2. Add the GROQ query in frontend/sanity/lib/queries.ts
 *    Example:
 *    export const aboutPageQuery = defineQuery(`
 *      *[_type == "aboutPage" && slug.current == $slug && language == $lang][0]{
 *        _id,
 *        _type,
 *        title,
 *        pageBuilder[]{ ... },
 *      }
 *    `)
 *
 * 3. Create a page component in frontend/app/_pages/
 *    Example: AboutPage.tsx that renders the content using PageBuilder
 *
 * 4. Update this file:
 *    - Add logic to fetch the page by slug
 *    - Add a case in renderPageComponent() to render your page component
 *
 * For collection pages (like projects listing):
 * - Follow the same steps but fetch all items in the collection
 * - Pass them as props to your listing page component
 */

/**
 * Generate metadata for the page.
 * Learn more: https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params

  const metadataBase = await getMetadataBase()
  const canonicalPath = buildCanonicalPath(locale, slug, routing.defaultLocale)

  // 1. Homepage (no slug)
  if (!slug || slug.length === 0) {
    const {data: homepage} = await sanityFetch({
      query: homepageQuery,
      params: {lang: locale},
    })

    if (!homepage) {
      return {
        metadataBase,
        alternates: {
          canonical: canonicalPath,
        },
      }
    }

    const ogImage = resolveOpenGraphImage(homepage?.seo?.seoImage)

    return {
      metadataBase,
      ...(homepage?.seo?.seoTitle && {title: homepage.seo.seoTitle}),
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
      },
    }
  }

  // 2. TODO: Add metadata for other page types when you create them
  // Example for other pages:
  // const slugPath = slug.join("/");
  // const { data: content } = await sanityFetch({
  //   query: pageBySlugQuery,
  //   params: { lang: locale, slug: slugPath },
  // });
  //
  // if (!content) {
  //   return {
  //     metadataBase,
  //     alternates: {
  //       canonical: canonicalPath,
  //     },
  //   };
  // }
  //
  // const seo = "seo" in content ? content.seo : null;
  // const title = "title" in content ? content.title : null;
  // const ogImage = resolveOpenGraphImage(seo?.seoImage);
  // const pageTitle = seo?.seoTitle || (title ? String(title) : undefined);
  //
  // return {
  //   metadataBase,
  //   ...(pageTitle && { title: pageTitle }),
  //   ...(seo?.seoDescription && { description: seo.seoDescription }),
  //   ...(ogImage && {
  //     openGraph: {
  //       images: [ogImage],
  //     },
  //   }),
  //   alternates: {
  //     canonical: canonicalPath,
  //   },
  // };

  // For now, return basic metadata for non-homepage routes
  return {
    metadataBase,
    alternates: {
      canonical: canonicalPath,
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
function renderPageComponent(content: any, items?: any) {
  switch (content._type) {
    case 'homepage':
      return <HomePage page={content} />
    // TODO: Add more page types as you create them
    // case "aboutPage":
    //   return <AboutPage page={content} />;
    // case "contactPage":
    //   return <ContactPage page={content} />;
    // case "projectsListing":
    //   return <ProjectsListingPage page={content} items={items} />;
    // case "projectDetail":
    //   return <ProjectDetailPage page={content} />;
    default:
      // Fallback to PageBuilder for any document with a pageBuilder field
      return <PageBuilder page={content} />
  }
}

export default async function Page({params}: Props) {
  const {locale, slug} = await params

  // 1. Homepage (no slug)
  if (!slug || slug.length === 0) {
    const {data: homepage} = await sanityFetch({
      query: homepageQuery,
      params: {lang: locale},
    })

    if (!homepage) {
      notFound()
    }

    return renderPageComponent(homepage)
  }

  // 2. TODO: Add logic for other pages
  // For now, return 404 for any non-homepage routes
  // When you add more pages, fetch them here based on the slug
  //
  // Example for single pages:
  // const slugPath = slug.join("/");
  // const { data: content } = await sanityFetch({
  //   query: pageBySlugQuery,
  //   params: { lang: locale, slug: slugPath },
  // });
  //
  // Example for collection items (2-part slugs like /projects/project-name):
  // if (slug.length === 2) {
  //   const [collectionSlug, itemSlug] = slug;
  //   // Fetch collection item by slug
  // }

  notFound()
}

/**
 * Generate static params for all content
 * Uses the shared helper function to ensure consistency with sitemap
 */
export async function generateStaticParams({
  params,
}: {
  params: {locale: string}
}): Promise<{slug?: string[]}[]> {
  const {locale} = params
  const allParams = await generateStaticParamsForLocale(locale)
  // Return only the slug part (locale is already in the route)
  return allParams.map((param) => ({slug: param.slug}))
}
