import { HomepageQueryResult } from '@/sanity.types'

export type PageBuilderBlock = NonNullable<NonNullable<HomepageQueryResult>['pageBuilder']>[number]
export type ExtractPageBuilderType<T extends PageBuilderBlock['_type']> = Extract<
  PageBuilderBlock,
  { _type: T }
>

// Represents a Link after GROQ dereferencing (page becomes pageSlug string)
export type DereferencedLink = {
  _key?: string
  _type: 'link'
  label?: string | null
  linkType?: 'href' | 'page' | 'custom' | 'anchor' | 'file' | null
  href?: string | null
  custom?: string | null
  anchor?: string | null
  pageSlug?: string | null
  pageType?: string | null
  fileUrl?: string | null
  openInNewTab?: boolean | null
  tooltip?: string | null
}
