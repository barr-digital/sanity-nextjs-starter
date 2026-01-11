'use server'

import {translateSlug, SlugTranslationResult} from '../helpers/slug-translation'

/**
 * Server action to translate a slug from one language to another.
 * This action is called from client components and runs on the server.
 *
 * @param currentSlug - The current slug path
 * @param fromLocale - The current locale
 * @param toLocale - The target locale
 * @returns The translation result
 */
export async function translateSlugAction(
  currentSlug: string,
  fromLocale: string,
  toLocale: string,
): Promise<SlugTranslationResult> {
  return translateSlug(currentSlug, fromLocale, toLocale)
}
