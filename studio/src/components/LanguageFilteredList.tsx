import React, {useState, useMemo} from 'react'
import {useClient} from 'sanity'
import {Stack, Card, Text, Select, Box, Flex, Button} from '@sanity/ui'
import {EditIcon, AddIcon} from '@sanity/icons'
import {useRouter} from 'sanity/router'
import {useStructureContext} from '../contexts/StructureContext'
import {StructureWrapper} from './StructureWrapper'
import {SINGLETON_TYPES} from '../schemaTypes'

interface Document {
  _id: string
  _type: string
  title?: string
  language: string | null | undefined
  _updatedAt: string
  slug?: string
}

/**
 * Language-filtered list component for Studio
 * Displays documents grouped by language with filtering capability
 */
export function LanguageFilteredList(props: {filter?: string}) {
  const {documentType, title} = useStructureContext()
  const client = useClient()
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState<string>('it')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch documents
  React.useEffect(() => {
    if (!documentType) return

    const fetchDocuments = async () => {
      try {
        setLoading(true)

        // Query includes both published and draft documents
        let query = `*[_type == "${documentType}"]`

        // Add custom filter if provided
        if (props.filter) {
          query += `[${props.filter}]`
        }

        query += ` | order(_updatedAt desc) {
          _id, _type, title, language, _updatedAt,
          "slug": slug.current
        }`

        const result = await client.fetch<Document[]>(query)
        setDocuments(result)
      } catch (error) {
        console.error('Error fetching documents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [client, documentType])

  // Filter documents by selected language
  const filteredDocuments = useMemo(() => {
    if (selectedLanguage === 'all') return documents
    return documents.filter((doc) => doc.language && doc.language === selectedLanguage)
  }, [documents, selectedLanguage])

  const getDocumentTitle = (doc: Document) => {
    if (!documentType) return doc.title || 'Untitled'

    // Customize titles for specific document types
    if (documentType === 'homepage') {
      return 'Homepage'
    }
    if (['header', 'footer', 'settings'].includes(documentType)) {
      return doc.title || title
    }
    return doc.title || 'Untitled'
  }

  const handleDocumentClick = (docId: string) => {
    if (!documentType) return
    router.navigateIntent('edit', {id: docId, type: documentType})
  }

  const getLanguageLabel = (language: string) => {
    switch (language) {
      case 'it':
        return '🇮🇹 Italiano'
      case 'en':
        return '🇬🇧 English'
      case 'es':
        return '🇪🇸 Español'
      case 'fr':
        return '🇫🇷 Français'
      default:
        return language
    }
  }

  const isDraft = (docId: string) => {
    return docId.startsWith('drafts.')
  }

  // Display create button logic
  const shouldShowCreateButton = () => {
    if (!documentType) return false

    const isSingleton = SINGLETON_TYPES.includes(documentType as any)

    if (isSingleton) {
      // For singletons, show the button only if there are no documents for the selected language
      if (selectedLanguage === 'all') {
        return documents.length === 0
      }
      return !documents.some((doc) => doc.language && doc.language === selectedLanguage)
    }

    // For normal documents, show the button always
    return true
  }

  const handleCreateDocument = () => {
    if (!documentType) return

    const isSingleton = SINGLETON_TYPES.includes(documentType as any)

    // Use the selected language or 'it' by default
    const language = selectedLanguage === 'all' ? 'it' : selectedLanguage

    if (isSingleton) {
      // For singletons, use the language template
      router.navigateIntent('create', {
        type: documentType,
        template: `${documentType}-with-language`,
        language,
      })
    } else {
      // For all other documents, pass the language
      router.navigateIntent('create', {type: documentType, language})
    }
  }

  if (loading)
    return (
      <Box padding={4}>
        <Text>Loading...</Text>
      </Box>
    )

  return (
    <Stack space={4} padding={4}>
      <Flex justify="space-between" align="center">
        <Text size={3} weight="semibold">
          {title}
        </Text>
        <Flex gap={3} align="center">
          <Select
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.currentTarget.value)}
            style={{minWidth: '150px'}}
          >
            <option value="all">🌐 All Languages</option>
            <option value="it">🇮🇹 Italiano</option>
            {/* TODO: Add more languages when you configure them in sanity.config.ts */}
            {/* <option value="en">🇬🇧 English</option> */}
            {/* <option value="es">🇪🇸 Español</option> */}
            {/* <option value="fr">🇫🇷 Français</option> */}
          </Select>
          {shouldShowCreateButton() && (
            <Button
              mode="ghost"
              icon={AddIcon}
              text="Create new"
              onClick={handleCreateDocument}
              tone="primary"
            />
          )}
        </Flex>
      </Flex>

      <Stack space={2}>
        {filteredDocuments.length === 0 ? (
          <Card padding={4} radius={2} shadow={1}>
            <Text align="center" muted>
              No documents found for this language
            </Text>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card
              key={doc._id}
              padding={3}
              radius={2}
              shadow={1}
              style={{cursor: 'pointer'}}
              onClick={() => handleDocumentClick(doc._id)}
            >
              <Flex align="center" gap={3}>
                <Box flex={1}>
                  <Stack space={4}>
                    <Text weight="semibold">
                      {getDocumentTitle(doc)} - {doc.language?.toUpperCase()}
                    </Text>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Text size={1} muted>
                        {doc.language ? getLanguageLabel(doc.language) : 'No language'}
                      </Text>
                      <Text size={1} muted>
                        •
                      </Text>
                      {isDraft(doc._id) ? (
                        <Text size={1} style={{color: '#f59e0b'}}>
                          Draft
                        </Text>
                      ) : (
                        <Text size={1} style={{color: '#10b981'}}>
                          Published
                        </Text>
                      )}
                      <Text size={1} muted>
                        •
                      </Text>
                      <Text size={1} muted>
                        Updated: {new Date(doc._updatedAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </Stack>
                </Box>
                <EditIcon width={24} height={24} />
              </Flex>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  )
}

/**
 * Wrapper components for specific document types
 * Add your custom document types here as you create them
 *
 * Example:
 * export function AboutPageList() {
 *   return (
 *     <StructureWrapper
 *       documentType="aboutPage"
 *       title="About Page"
 *       schemaType="aboutPage"
 *     />
 *   );
 * }
 */

// Homepage
export function HomepageList() {
  return <StructureWrapper documentType="homepage" title="Homepage" schemaType="homepage" />
}

// Header
export function HeaderList() {
  return <StructureWrapper documentType="header" title="Header" schemaType="header" />
}

// Footer
export function FooterList() {
  return <StructureWrapper documentType="footer" title="Footer" schemaType="footer" />
}

// Settings
export function SettingsList() {
  return <StructureWrapper documentType="settings" title="Settings" schemaType="settings" />
}
