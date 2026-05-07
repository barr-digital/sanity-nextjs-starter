import { FileDown, FileText, Hash, Link as LinkIcon, Mail, Phone } from 'lucide-react'
import type { ComponentType } from 'react'

export type LinkValue = {
  label?: string
  linkType?: 'href' | 'custom' | 'anchor' | 'page' | 'file'
  href?: string
  custom?: string
  anchor?: string
  page?: { _ref?: string }
  file?: { asset?: { _ref?: string } }
  openInNewTab?: boolean
}

export function resolveIcon(value: LinkValue | undefined): ComponentType<{ size?: number }> {
  if (!value?.linkType) return LinkIcon
  if (value.linkType === 'href') return LinkIcon
  if (value.linkType === 'custom') {
    if (value.custom?.startsWith('mailto:')) return Mail
    if (value.custom?.startsWith('tel:')) return Phone
    return LinkIcon
  }
  if (value.linkType === 'anchor') return Hash
  if (value.linkType === 'page') return FileText
  if (value.linkType === 'file') return FileDown
  return LinkIcon
}

export function resolvePreview(value: LinkValue | undefined): string | null {
  if (!value?.linkType) return null
  if (value.linkType === 'href') return value.href || null
  if (value.linkType === 'custom') return value.custom || null
  if (value.linkType === 'anchor') return value.anchor ? `#${value.anchor}` : null
  if (value.linkType === 'page') {
    if (!value.page?._ref) return null
    return value.anchor ? `Internal page · #${value.anchor}` : 'Internal page'
  }
  if (value.linkType === 'file') return value.file?.asset?._ref ? 'Uploaded file' : null
  return null
}

export function isEmpty(value: LinkValue | undefined): boolean {
  if (!value?.linkType) return true
  if (value.linkType === 'href') return !value.href
  if (value.linkType === 'custom') return !value.custom
  if (value.linkType === 'anchor') return !value.anchor
  if (value.linkType === 'page') return !value.page?._ref
  if (value.linkType === 'file') return !value.file?.asset?._ref
  return true
}

/**
 * A link is "uncommitted" when the editor has not provided either a label or
 * a target value. Used by validation to skip required-field errors on links
 * that exist only because the input was expanded — e.g. `linkType` auto-set
 * to "href" by `initialValue` and the editor closed the form without filling
 * anything. In that state we want optional-cta fields to publish silently.
 */
export function isUncommitted(value: LinkValue | undefined): boolean {
  if (!value) return true
  return (
    !value.label &&
    !value.href &&
    !value.custom &&
    !value.anchor &&
    !value.page?._ref &&
    !value.file?.asset?._ref
  )
}
