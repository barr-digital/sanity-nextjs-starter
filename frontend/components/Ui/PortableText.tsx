import {PortableText as SanityPortableText, PortableTextComponents} from 'next-sanity'
import {Link} from './Link'

/**
 * Custom components for rendering Portable Text
 *
 * TODO: Customize these components to match your design
 * Add more custom components as needed (images, callouts, etc.)
 */
const components: PortableTextComponents = {
  marks: {
    // Handle link annotations
    link: ({children, value}) => {
      return (
        <Link link={value} className="underline hover:no-underline">
          {children}
        </Link>
      )
    },
  },
  block: {
    // Customize block styles
    normal: ({children}) => <p className="mb-4">{children}</p>,
    h1: ({children}) => <h1 className="text-4xl font-bold mb-6">{children}</h1>,
    h2: ({children}) => <h2 className="text-3xl font-bold mb-5">{children}</h2>,
    h3: ({children}) => <h3 className="text-2xl font-bold mb-4">{children}</h3>,
    h4: ({children}) => <h4 className="text-xl font-bold mb-3">{children}</h4>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({children}) => <ul className="list-disc list-inside mb-4">{children}</ul>,
    number: ({children}) => <ol className="list-decimal list-inside mb-4">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li className="mb-2">{children}</li>,
    number: ({children}) => <li className="mb-2">{children}</li>,
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
export const PortableText = ({value, className = ''}: PortableTextProps) => {
  if (!value) return null

  return (
    <div className={className}>
      <SanityPortableText value={value} components={components} />
    </div>
  )
}
