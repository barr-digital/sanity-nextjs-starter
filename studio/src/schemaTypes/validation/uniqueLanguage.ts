import {ValidationContext} from 'sanity'

/**
 * Validation rule to ensure only one document exists per language for singleton types
 * @param value - The language value being validated
 * @param context - Sanity validation context
 * @returns true if valid, error message if invalid
 */
export async function validateUniqueLanguage(
  value: string | undefined,
  context: ValidationContext,
): Promise<true | string> {
  if (!value) return true

  const {document, getClient} = context
  if (!document?._type || !document?._id) return true

  // Exclude validation for collection types (insert your collection types here)
  const excludedTypes = ['']
  if (excludedTypes.includes(document._type)) return true

  const client = getClient({apiVersion: process.env.SANITY_API_VERSION || '2025-09-25'})

  // Get the base ID without drafts prefix
  const baseId = document._id.replace('drafts.', '')
  const draftId = `drafts.${baseId}`

  // Count documents with same type and language, excluding current document (both draft and published versions)
  const query = `count(*[
    _type == $docType &&
    language == $language &&
    !(_id in [$draftId, $publishedId])
  ])`

  const count = await client.fetch<number>(query, {
    docType: document._type,
    language: value,
    draftId: draftId,
    publishedId: baseId,
  })

  if (count > 0) {
    return `Esiste già un documento ${document._type} per la lingua "${value}". Ogni lingua può avere un solo documento.`
  }

  return true
}
