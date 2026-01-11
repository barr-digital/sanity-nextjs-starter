/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {languageTemplates, resolveInitialValue} from './src/templates'
import {documentInternationalization} from '@sanity/document-internationalization'
import {languageFilter} from '@sanity/language-filter'
import {media} from 'sanity-plugin-media'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Sanity + Next.js Starter Template',

  projectId,
  dataset,

  plugins: [
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Document internationalization plugin
    documentInternationalization({
      supportedLanguages: [
        {id: 'it', title: 'Italian'},
        // TODO: Add more languages as needed
        // { id: "en", title: "English" },
        // { id: "es", title: "Spanish" },
        // { id: "fr", title: "French" },
      ],
      schemaTypes: ['homepage', 'header', 'footer', 'settings'],
    }),
    // Language filter plugin for the Studio UI
    languageFilter({
      supportedLanguages: [
        {id: 'it', title: 'Italian'},
        // TODO: Add more languages as needed
      ],
      defaultLanguages: ['it'],
      documentTypes: ['homepage', 'header', 'footer', 'settings'],
    }),
    // Media library plugin for better asset management
    media(),
    // Vision plugin for testing GROQ queries
    visionTool(),
  ],

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
    templates: languageTemplates,
  },

  // Document initial value configuration
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type === 'global') {
        return prev
      }
      return prev
    },
    // Initial values for documents
    // This is called when creating documents via the studio
    initialValueTemplates: languageTemplates,
  },
})
