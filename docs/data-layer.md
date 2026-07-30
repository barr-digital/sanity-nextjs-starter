# Data layer — `lib/data/*`

How to write read-only data functions in BARR webapps. Read this before adding any new fetch logic. Reads live here; mutations live in `actions/*` (see `docs/server-actions.md`).

## Rules

1. **Every file starts with `import 'server-only'` as the first line.** Next.js enforces it: accidentally importing a `lib/data/*` file from a client component fails at build time.

   ```ts
   import 'server-only'

   import { requireAuth } from '@/lib/auth-server'
   import { createServerClient } from '@/lib/supabase/server'
   ```

2. **Auth check at the top of every public function.** Call the project's auth helper (`requireAuth(allowedRoles?)` or equivalent) first. On failure, return `null` — never throw for authorisation. Callers (page or action) decide what to do with `null`, typically `notFound()` from `next/navigation`.

3. **Use the server Supabase client by default** (`createServerClient()`, RLS active). The admin/service-role client is never the default — only for specific operations that genuinely need to bypass RLS, and only server-side.

4. **No mutations.** `lib/data/*` only reads. Writes belong in `actions/*`. The split is meaningful: when you grep for places that change a row, you only look in `actions/`.

5. **No imports from `components/`.** The data layer doesn't know about the UI.

## Return conventions

- **Single record by id**: `T | null` (null when not found OR not authorised). Use `.maybeSingle()`.
- **List**: `T[]` (empty array on no results) or `null` on auth failure. Don't conflate "empty list" with "not authorised".
- **Infrastructure errors** (DB connection, query syntax): log with `console.error` and `throw new Error('<user-facing message in Italian>')`. The route's `loading.tsx` / `error.tsx` boundary catches it.

## Typed returns, derived fields, joins

Export the return type from the same file. When a consumer needs a field that isn't a raw column, compute it in the data layer and expose it as a derived field — don't push the computation into components.

For joins, use Supabase's nested-select syntax with aliases so the response shape is stable and easy to type:

```ts
.select('date, hours, item:item_id(id, name), owner:owner_id(id, name)')
```

## Ordering and pagination

- Lists shown to the user must always have an explicit `.order()`. Without `ORDER BY`, Postgres returns heap order — not guaranteed. Add a secondary key when the primary can tie:

  ```ts
  .order('date', { ascending: true })
  .order('created_at', { ascending: true })
  ```

- PostgREST caps a query at 1000 rows by default. If a query might exceed that, paginate explicitly with `.range(from, from + PAGE - 1)`.

## Full example — typical `lib/data/<domain>.ts`

```ts
import 'server-only'

import { requireAuth } from '@/lib/auth-server'
import { createServerClient } from '@/lib/supabase/server'

// 1) Types exposed to consumers
export type ItemRow = {
  id: number
  name: string
  // derived field, not a raw DB column
  is_active: boolean
}

// 2) Public functions
export async function getItems(): Promise<ItemRow[] | null> {
  const session = await requireAuth()
  if (!session) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('item')
    .select('id, name, status')
    .order('name', { ascending: true })

  if (error) {
    console.error('Supabase item list error:', error)
    throw new Error('Errore nel recupero dei dati')
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    is_active: r.status === 'active',
  }))
}

export async function getItemById(id: number): Promise<ItemRow | null> {
  const session = await requireAuth()
  if (!session) return null

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('item')
    .select('id, name, status')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Supabase item by id error:', error)
    throw new Error('Errore nel recupero dei dati')
  }

  if (!data) return null
  return { id: data.id, name: data.name, is_active: data.status === 'active' }
}
```

## Shared identity / business helpers

When both the data layer and an action need the same resolution logic (e.g. "which user is this data for", cross-row totals used by a validation cap), put the helper in `lib/data/<domain>.ts` and import it from the action. Keep the logic in one place — never duplicate it between reads and writes.
