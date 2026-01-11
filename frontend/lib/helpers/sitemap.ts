import {client} from '@/sanity/lib/client'
import {routing} from '@/i18n/routing'

export interface StaticParam {
  locale: string
  slug?: string[]
}

/**
 * Generate all static params for a given locale
 * This is the single source of truth for all routes
 *
 * TODO: Update this function when you add new page types
 */
export async function generateStaticParamsForLocale(locale: string): Promise<StaticParam[]> {
  const result: StaticParam[] = []

  // Add home page (undefined slug)
  result.push({locale, slug: undefined})

  // TODO: Add regular pages when you create them
  // Example for fetching pages with slugs:
  // const pages = await client.fetch(
  //   `*[_type in ["aboutPage", "contactPage"] && language == $lang]{ "slug": slug.current, _type }`,
  //   { lang: locale }
  // );
  //
  // if (pages && Array.isArray(pages)) {
  //   pages.forEach((page: { slug: string | null; _type: string }) => {
  //     if (!page.slug || page.slug.trim() === "" || page.slug === "/") {
  //       return;
  //     }
  //     result.push({
  //       locale,
  //       slug: page.slug.split("/").filter((s: string) => s && s.trim() !== ""),
  //     });
  //   });
  // }

  // TODO: Add collection items with their parent prefix
  // Example for projects:
  // const projects = await client.fetch(
  //   `*[_type == "project" && language == $lang]{ "slug": slug.current }`,
  //   { lang: locale }
  // );
  // const projectsPageSlug = "projects"; // or fetch from your projects listing page
  //
  // if (projects && Array.isArray(projects)) {
  //   projects.forEach((project: { slug: string | null }) => {
  //     if (!project.slug || project.slug.trim() === "") {
  //       return;
  //     }
  //     result.push({
  //       locale,
  //       slug: [projectsPageSlug, project.slug],
  //     });
  //   });
  // }

  return result
}

/**
 * Generate all static params for all locales
 */
export async function generateAllStaticParams(): Promise<StaticParam[]> {
  const allParams: StaticParam[] = []

  for (const locale of routing.locales) {
    const params = await generateStaticParamsForLocale(locale)
    allParams.push(...params)
  }

  return allParams
}
