import {createContext, useContext} from 'react'

interface StructureContextType {
  documentType: string | null
  title: string
  schemaType: string
}

const StructureContext = createContext<StructureContextType | null>(null)

export function useStructureContext() {
  const context = useContext(StructureContext)
  if (!context) {
    throw new Error('useStructureContext must be used within StructureWrapper')
  }
  return context
}

export {StructureContext}
