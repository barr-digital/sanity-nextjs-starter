import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const requested = await requestLocale

  // Ensure that a valid locale is used
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    // One catalog per locale in frontend/messages/ (BARR namespace convention,
    // e.g. errors.unexpected.{title,description,retry}). Add keys as UI labels
    // appear — icon-only buttons need accessible names in every language.
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
