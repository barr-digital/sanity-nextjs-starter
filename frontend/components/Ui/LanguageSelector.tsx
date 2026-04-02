'use client'

import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { useState, useRef, useEffect } from 'react'
import { useLanguageChange } from '@/hooks/useLanguageChange'
import { ChevronDownIcon } from 'lucide-react'

/**
 * Get display name for a locale
 * Customize this function to show full language names if needed
 */
const getLanguageName = (locale: string) => locale.toUpperCase()

/**
 * LanguageSelector component
 *
 * A simple dropdown for switching between available languages.
 * Includes click-outside detection to close the dropdown.
 *
 * TODO: Customize styling to match your design system
 * TODO: Update getLanguageName() to show full language names if needed
 * TODO: Consider adding keyboard navigation (arrow keys, Enter, Escape)
 *
 * Example usage:
 * <LanguageSelector />
 */
export const LanguageSelector = () => {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const { handleLanguageChange: changeLanguage } = useLanguageChange()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = async (newLocale: string) => {
    setIsOpen(false)
    await changeLanguage(newLocale)
  }

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <span>{getLanguageName(locale)}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 min-w-[80px] overflow-hidden rounded border border-gray-300 bg-white shadow-lg">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                loc === locale ? 'font-bold' : ''
              }`}
            >
              {getLanguageName(loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
