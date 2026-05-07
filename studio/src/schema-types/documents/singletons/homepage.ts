import { defineType } from 'sanity'
import { basePage } from '../base-page'
import { pageBuilderBlocks, pageBuilderFieldOptions } from '../../blocks/config'
import { iconForSlot } from '../../../icons'

/**
 * Homepage Singleton
 *
 * This is a single document for the homepage content.
 * It includes a pageBuilder field for flexible content management.
 *
 * Singletons are single documents displayed not in a collection.
 * Learn more: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
 */

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: iconForSlot('homepage'),
  fields: [
    ...basePage.fields,
    {
      name: 'pageBuilder',
      title: 'Page Builder',
      type: 'array',
      description: 'Build your homepage by adding and arranging blocks',
      of: pageBuilderBlocks,
      options: pageBuilderFieldOptions,
    },
  ],
  // Lingua nel `title` (non `subtitle`): Studio mostra il subtitle solo nelle
  // liste, non nell'header del documento aperto. Mettendola nel title la lingua
  // resta visibile ovunque (sidebar + breadcrumb Studio).
  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      const lang = language === 'en' ? 'English' : language === 'it' ? 'Italian' : null
      return {
        title: lang ? `Homepage · ${lang}` : 'Homepage',
      }
    },
  },
})
