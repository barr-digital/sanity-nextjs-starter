import { HomepageQueryResult } from '@/sanity.types'

export type PageBuilderBlock = NonNullable<NonNullable<HomepageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderBlock['_type']> = Extract<
  PageBuilderBlock,
  { _type: T }
>

// Represents a Link after GROQ dereferencing (page becomes pageSlug string)
export type DereferencedLink = {
  _type: 'link'
  linkType?: 'href' | 'page' | 'custom' | 'anchor'
  href?: string
  custom?: string | null
  anchor?: string | null
  pageSlug?: string | null
  pageType?: string | null
  openInNewTab?: boolean
  tooltip?: string | null
}
