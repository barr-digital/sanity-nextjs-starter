import React from 'react'
import {LanguageFilteredList} from './LanguageFilteredList'
import {StructureContext} from '../contexts/StructureContext'

interface StructureWrapperProps {
  documentType: string
  title: string
  schemaType: string
  filter?: string
  children?: React.ReactNode
}

/**
 * Wrapper component that provides context for language-filtered lists
 * Used in the Studio structure to display documents grouped by language
 */
export function StructureWrapper({
  documentType,
  title,
  schemaType,
  filter,
  children,
}: StructureWrapperProps) {
  const contextValue = {documentType, title, schemaType}

  return (
    <StructureContext.Provider value={contextValue}>
      {children || <LanguageFilteredList filter={filter} />}
    </StructureContext.Provider>
  )
}
