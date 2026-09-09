'use client'

import type { StegaBranded, StegaCleaned } from 'next-sanity'
import { PageBuilder } from '@/components/layout/page-builder'
import { HomepageQueryResult } from '@/sanity.types'

// Widened for stega — see the matching comment on PageContent in
// app/[locale]/[[...slug]]/page.tsx, which is what actually passes `page` here.
type HomePageProps = {
  page: StegaCleaned<HomepageQueryResult> | StegaBranded<HomepageQueryResult> | null
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
export const HomePage = ({ page }: HomePageProps) => {
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
      {/* No placeholder markup above the PageBuilder: anything rendered here
          adds invisible spacing between the header and the first block. */}

      {/* Page Builder renders all sections from the homepage schema */}
      <PageBuilder page={pageData} />
    </>
  )
}
