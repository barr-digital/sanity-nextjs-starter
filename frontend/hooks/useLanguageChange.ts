import {useState} from 'react'
import {useLocale} from 'next-intl'
import {usePathname, useRouter} from '@/i18n/routing'
import {translateSlugAction} from '@/lib/actions/translate-slug'

/**
 * Custom hook for handling language changes with slug translation.
 *
 * This hook centralizes the logic for switching languages by:
 * 1. Translating the current page's slug to the target language
 * 2. Navigating to the translated page if found
 * 3. Falling back to the home page if translation is not available
 *
 * @returns An object containing:
 * - handleLanguageChange: Function to change language with slug translation
 * - isTranslating: Boolean indicating if a translation is in progress
 */
export const useLanguageChange = () => {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isTranslating, setIsTranslating] = useState(false)

  const handleLanguageChange = async (newLocale: string) => {
    setIsTranslating(true)

    try {
      // Extract slug from pathname (remove leading slash)
      const currentSlug = pathname.startsWith('/') ? pathname.slice(1) : pathname

      // Translate the slug to the target language using server action
      const result = await translateSlugAction(currentSlug, locale, newLocale)

      if (result.found && result.slug !== null) {
        // Navigate to the translated slug
        router.push(`/${result.slug}`, {locale: newLocale})
      } else {
        // Fallback to home page if translation not found
        router.push('/', {locale: newLocale})
      }
    } catch (error) {
      console.error('Error translating slug:', error)
      // Fallback to home page on error
      router.push('/', {locale: newLocale})
    } finally {
      setIsTranslating(false)
    }
  }

  return {
    handleLanguageChange,
    isTranslating,
  }
}
