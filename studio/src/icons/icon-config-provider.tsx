import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'
import type { IconSlotName } from './slots'

type IconMap = Partial<Record<IconSlotName, string>>

type IconConfigContextValue = {
  iconMap: IconMap
  loading: boolean
  setIcon: (slot: IconSlotName, iconName: string) => Promise<void>
}

const IconConfigContext = createContext<IconConfigContextValue | null>(null)

const SINGLETON_ID = 'studioIcons'
const API_VERSION = '2025-09-25'

export function IconConfigProvider({ children }: { children: React.ReactNode }) {
  const client = useClient({ apiVersion: API_VERSION })
  const [iconMap, setIconMap] = useState<IconMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const extractIconName = (value: unknown): string | null => {
      if (typeof value === 'string') return value
      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>
        if (typeof record.name === 'string') return record.name
        if (typeof record.iconName === 'string') return record.iconName
      }
      return null
    }

    const applySnapshot = (snapshot: Record<string, unknown> | null | undefined) => {
      if (cancelled || !snapshot) return
      const next: IconMap = {}
      for (const [key, value] of Object.entries(snapshot)) {
        if (key.startsWith('_')) continue
        const iconName = extractIconName(value)
        if (iconName) next[key as IconSlotName] = iconName
      }
      setIconMap(next)
    }

    // Query both draft and published, prefer the draft so unsaved edits preview live.
    const query = `*[_id in [$draft, $published]] | order(_updatedAt desc)[0]`
    const params = { draft: `drafts.${SINGLETON_ID}`, published: SINGLETON_ID }

    client
      .fetch<Record<string, unknown> | null>(query, params)
      .then((doc) => {
        applySnapshot(doc)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    const subscription = client
      .listen(query, params, { includeResult: true, visibility: 'query' })
      .subscribe((update) => {
        if ('result' in update && update.result) {
          applySnapshot(update.result as Record<string, unknown>)
        }
      })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [client])

  const value = useMemo<IconConfigContextValue>(
    () => ({
      iconMap,
      loading,
      setIcon: async (slot, iconName) => {
        await client.createIfNotExists({ _id: SINGLETON_ID, _type: 'studioIcons' })
        await client
          .patch(SINGLETON_ID)
          .set({ [slot]: iconName })
          .commit()
      },
    }),
    [iconMap, loading, client],
  )

  return <IconConfigContext.Provider value={value}>{children}</IconConfigContext.Provider>
}

export function useIconConfig(): IconConfigContextValue {
  const ctx = useContext(IconConfigContext)
  if (!ctx) {
    return {
      iconMap: {},
      loading: false,
      setIcon: async () => {
        // no-op when provider not mounted (e.g. during schema extraction)
      },
    }
  }
  return ctx
}
