import React from 'react'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
  children: React.ReactNode
}

/**
 * Text component - A flexible text wrapper
 *
 * Allows you to render different HTML tags while maintaining consistent styling.
 * Useful for semantic HTML while keeping your styling consistent.
 *
 * Example:
 * <Text tag="h1" className="text-4xl font-bold">Heading</Text>
 * <Text tag="p" className="text-base">Paragraph</Text>
 */
export function Text({tag = 'p', children, className = '', style, ...props}: TextProps) {
  const Tag = tag as React.ElementType

  return (
    <Tag className={className} style={{...style}} {...props}>
      {children}
    </Tag>
  )
}
