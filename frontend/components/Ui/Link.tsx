import {Link as I18nLink} from '@/i18n/routing'
import {linkResolver} from '@/sanity/lib/utils'

interface LinkProps {
  link: any
  children: React.ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

/**
 * Link component - Smart link that handles both internal and external URLs
 *
 * Automatically determines if a link is internal (uses next-intl Link)
 * or external (uses regular <a> tag).
 *
 * Example:
 * <Link link={sanityLinkObject} className="underline">
 *   Click here
 * </Link>
 */
export const Link = ({link, children, className = '', onMouseEnter, onMouseLeave}: LinkProps) => {
  // Resolve the link URL
  const resolvedLink = linkResolver(link)

  if (!resolvedLink) {
    // No valid link, just render children
    return <>{children}</>
  }

  // Check if it's an external URL (starts with http:// or https://)
  const isExternal = resolvedLink.startsWith('http://') || resolvedLink.startsWith('https://')

  // Check if it's an anchor link (starts with #)
  const isAnchor = resolvedLink.startsWith('#')

  // For external URLs, use a regular <a> tag
  if (isExternal || isAnchor) {
    return (
      <a
        href={resolvedLink}
        target={link?.openInNewTab ? '_blank' : undefined}
        rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </a>
    )
  }

  // For internal links, use I18nLink (locale-aware)
  return (
    <I18nLink
      href={resolvedLink}
      target={link?.openInNewTab ? '_blank' : undefined}
      rel={link?.openInNewTab ? 'noopener noreferrer' : undefined}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </I18nLink>
  )
}
