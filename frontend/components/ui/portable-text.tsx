import { PortableText as SanityPortableText, PortableTextComponents } from 'next-sanity'
import { Link } from './link'

/**
 * Custom components for rendering Portable Text
 *
 * TODO: Customize these components to match your design
 * Add more custom components as needed (images, callouts, etc.)
 */
const components: PortableTextComponents = {
  marks: {
    // Handle link annotations
    link: ({ children, value }) => {
      return (
        <Link link={value} className="underline hover:no-underline">
          {children}
        </Link>
      )
    },
  },
  block: {
    // Customize block styles
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h1: ({ children }) => <h1 className="mb-6 text-4xl font-bold">{children}</h1>,
    h2: ({ children }) => <h2 className="mb-5 text-3xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-4 text-2xl font-bold">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-3 text-xl font-bold">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-inside list-disc">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 list-inside list-decimal">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-2">{children}</li>,
    number: ({ children }) => <li className="mb-2">{children}</li>,
  },
}

interface PortableTextProps {
  value: any
  className?: string
}

/**
 * PortableText component - Renders rich text from Sanity
 *
 * Includes support for:
 * - Text formatting (bold, italic, etc.)
 * - Headings (h1-h4)
 * - Lists (bullet, numbered)
 * - Links (internal and external)
 * - Blockquotes
 *
 * Example:
 * <PortableText value={sanityPortableTextArray} />
 */
export const PortableText = ({ value, className = '' }: PortableTextProps) => {
  if (!value) return null

  return (
    <div className={className}>
      <SanityPortableText value={value} components={components} />
    </div>
  )
}
