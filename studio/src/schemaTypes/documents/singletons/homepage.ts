import {HomeIcon} from '@sanity/icons'
import {defineType} from 'sanity'
import {basePage} from '../basePage'
import {pageBuilderBlocks, pageBuilderFieldOptions} from '../../blocks'

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
  icon: HomeIcon,
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
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Homepage',
      }
    },
  },
})
