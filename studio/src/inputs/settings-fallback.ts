import { useEffect, useState } from 'react'
import imageUrlBuilder from '@sanity/image-url'
import { useClient } from 'sanity'

type SanityImageRef = {
  asset?: { _ref?: string; _type?: string }
}

type SettingsFallback = {
  title?: string
  description?: string
  ogImage?: SanityImageRef
}

/**
 * Subscribes to the `settings` singleton for the given language and returns
 * the fields that are commonly used as fallback on pages (title, description,
 * OG image URL).
 *
 * Reusable across projects: reads only the three fields guaranteed to exist
 * in the BARR `settings` base schema. Extra project-specific fields are
 * ignored.
 */
export function useSettingsFallback(language: string | undefined): {
  title?: string
  description?: string
  ogImageUrl: string | null
  loading: boolean
} {
  const client = useClient({ apiVersion: '2025-09-25' })
  const [data, setData] = useState<SettingsFallback | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!language) {
      setData(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const query = `*[_type == "settings" && language == $lang][0]{ title, description, ogImage }`
    const params = { lang: language }

    setLoading(true)

    client.fetch<SettingsFallback>(query, params).then(
      (result) => {
        if (!cancelled) {
          setData(result ?? null)
          setLoading(false)
        }
      },
      () => {
        if (!cancelled) {
          setData(null)
          setLoading(false)
        }
      },
    )

    const subscription = client
      .listen(query, params, { includeResult: true, visibility: 'query' })
      .subscribe({
        next: (event) => {
          if (cancelled) return
          if ('result' in event && event.result !== undefined) {
            setData((event.result as SettingsFallback) ?? null)
          }
        },
      })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [client, language])

  const ogImageUrl = data?.ogImage?.asset?._ref
    ? imageUrlBuilder(client).image(data.ogImage).width(600).url()
    : null

  return {
    title: data?.title,
    description: data?.description,
    ogImageUrl,
    loading,
  }
}
