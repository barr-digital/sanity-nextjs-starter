import { defineField, defineType } from 'sanity'
import { iconForSlot } from '../../icons'
import { LinkInput } from '../../inputs/link-input'
import {
  isEmpty,
  isUncommitted,
  resolveIcon,
  resolvePreview,
  type LinkValue,
} from '../../inputs/link-helpers'

/**
 * Link schema object. Multi-type link picker: URL, mailto/tel, anchor, internal page,
 * uploaded file. The custom `LinkInput` collapses the form into a card preview when
 * not focused and auto-detects URL vs mailto/tel as the editor types.
 *
 * Page references default to `homepage` because the starter only ships one document
 * type. Add your own collections (e.g. `aboutPage`, `blogPost`) to the `to: [...]`
 * list when you create them.
 *
 * Learn more: https://www.sanity.io/docs/object-type
 */

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: iconForSlot('link'),
  components: { input: LinkInput },
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
    },
    {
      name: 'linkType',
      title: 'Link Type',
      type: 'string',
      initialValue: 'href',
      options: {
        list: [
          { title: 'URL', value: 'href' },
          { title: 'Custom', value: 'custom' },
          { title: 'Anchor', value: 'anchor' },
          { title: 'Page', value: 'page' },
          { title: 'File', value: 'file' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'href',
      title: 'URL',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'href',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkValue | undefined
          if (parent?.linkType !== 'href') return true
          if (isUncommitted(parent)) return true
          if (!value) return 'URL is required when Link Type is URL'
          return true
        }),
    },
    defineField({
      name: 'custom',
      title: 'Custom',
      type: 'string',
      description: 'Use for "mailto:you@example.com" or "tel:+39..." links.',
      hidden: ({ parent }) => parent?.linkType !== 'custom',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkValue | undefined
          if (parent?.linkType !== 'custom') return true
          if (isUncommitted(parent)) return true
          if (!value) return 'A value is required when Link Type is Custom'

          const allowedSchemes = ['mailto:', 'tel:']
          const isValid = allowedSchemes.some((scheme) => value.startsWith(scheme))

          return isValid || 'Value must start with "mailto:" or "tel:"'
        }),
    }),
    defineField({
      name: 'anchor',
      title: 'Anchor ID',
      type: 'string',
      description:
        'Section ID without #. With Link Type "Anchor" alone: targets a section on the current page. With Link Type "Page": optional, jumps to a section on the referenced page.',
      hidden: ({ parent }) => parent?.linkType !== 'anchor' && parent?.linkType !== 'page',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkValue | undefined
          // Required only for the standalone Anchor link type. For Page links
          // it is optional (page reference alone is a valid link).
          if (parent?.linkType === 'anchor') {
            if (isUncommitted(parent)) return true
            if (!value) return 'Anchor ID is required when Link Type is Anchor'
          }
          if (typeof value !== 'string' || !value) return true
          if (value.startsWith('#')) {
            return 'Do not include the # symbol — it is added automatically'
          }
          if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return 'Anchor ID can only contain letters, numbers, hyphens and underscores'
          }
          return true
        }),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      // TODO: extend with your own document types as you create them
      // (e.g. { type: 'aboutPage' }, { type: 'blogPost' })
      to: [{ type: 'homepage' }],
      hidden: ({ parent }) => parent?.linkType !== 'page',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkValue | undefined
          if (parent?.linkType !== 'page') return true
          if (isUncommitted(parent)) return true
          if (!value) return 'Page reference is required when Link Type is Page'
          return true
        }),
    }),
    defineField({
      name: 'file',
      title: 'File',
      type: 'file',
      description: 'Upload a downloadable file (PDF, doc, etc.).',
      hidden: ({ parent }) => parent?.linkType !== 'file',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as LinkValue | undefined
          if (parent?.linkType !== 'file') return true
          if (isUncommitted(parent)) return true
          if (!value) return 'A file is required when Link Type is File'
          return true
        }),
    }),
    {
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      label: 'label',
      linkType: 'linkType',
      href: 'href',
      custom: 'custom',
      anchor: 'anchor',
      pageRef: 'page._ref',
      fileRef: 'file.asset._ref',
    },
    prepare({ label, linkType, href, custom, anchor, pageRef, fileRef }) {
      const value = {
        label,
        linkType,
        href,
        custom,
        anchor,
        page: pageRef ? { _ref: pageRef } : undefined,
        file: fileRef ? { asset: { _ref: fileRef } } : undefined,
      }
      const empty = isEmpty(value)
      return {
        title: label || (empty ? 'Empty link' : 'Untitled link'),
        subtitle: resolvePreview(value) || undefined,
        media: resolveIcon(value),
      }
    },
  },
})
