import {Template} from 'sanity'
import {SINGLETON_TYPES} from '../schemaTypes'

/**
 * Initial value templates for singleton documents with language support.
 * These templates allow passing a language parameter when creating documents.
 *
 * Note: Since parameterized templates only work in Structure Builder,
 * we also need to handle language from URL parameters in the resolver.
 */

/**
 * Generate templates for all singleton types.
 * Each template accepts a language parameter and sets it as the initial value.
 */
export const languageTemplates: Template[] = SINGLETON_TYPES.map((schemaType) => ({
  id: `${schemaType}-with-language`,
  title: `${schemaType} (with language)`,
  schemaType: schemaType as string,
  parameters: [{name: 'language', type: 'string'}],
  value: (params: {language?: string}) => ({
    language: params.language || 'it',
  }),
}))

/**
 * Resolver function to handle initial values from URL parameters.
 * This is called when documents are created via navigateIntent.
 */
export function resolveInitialValue(context: any) {
  const {schemaType} = context

  // Only apply to singleton types
  if (!SINGLETON_TYPES.includes(schemaType as any)) {
    return undefined
  }

  // Try to get language from URL search params
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const language = urlParams.get('language')

    if (language) {
      return {
        language,
      }
    }
  }

  // Default to "it" if no language specified
  return {
    language: 'it',
  }
}
