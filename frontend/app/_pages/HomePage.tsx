'use client'

import {PageBuilder} from '@/components/Layout'
import {Text} from '@/components/Ui'
import {HomepageQueryResult} from '@/sanity.types'

type HomePageProps = {
  page: HomepageQueryResult | null
}

/**
 * HomePage Component
 *
 * This component renders the homepage content.
 * It uses the PageBuilder to render all sections defined in the homepage schema.
 *
 * You can extend this component to add custom sections before/after the PageBuilder,
 * similar to how it's done in the despe-website (hero slider, sectors, sponsor, etc.)
 *
 * Example:
 * export const HomePage = ({ page }: HomePageProps) => {
 *   if (!page) return null;
 *
 *   return (
 *     <>
 *       {page.heroSection && <HeroSection {...page.heroSection} />}
 *       <PageBuilder page={page} />
 *       {page.ctaSection && <CTASection {...page.ctaSection} />}
 *     </>
 *   );
 * };
 */
export const HomePage = ({page}: HomePageProps) => {
  if (!page) {
    return null
  }

  // Transform the page data to match PageBuilder's expected type
  // Convert null to undefined for pageBuilder field
  const pageData = {
    ...page,
    pageBuilder: page.pageBuilder || undefined,
  }

  return (
    <>
      {/* TODO: Add custom homepage sections here if needed */}
      {/* Example: Hero, Featured Content, CTA, etc. */}
      <Text tag="h1">Homepage</Text>

      {/* Page Builder renders all sections from the homepage schema */}
      <PageBuilder page={pageData} />
    </>
  )
}
