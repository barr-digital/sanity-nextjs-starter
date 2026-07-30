# Server actions — `actions/*`

How to write mutations in BARR webapps. Every create/update/delete/side-effect goes through a Server Action in `actions/<domain>.ts`. Reads live in `lib/data/*` (see `docs/data-layer.md`).

## Skeleton

Every action file starts with `'use server'` as the very first line and every action follows the same 5-step shape: auth → validate → business rules → write → revalidate.

```ts
'use server'

import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/lib/auth-server'
import { createServerClient } from '@/lib/supabase/server'
import { createItemSchema, type CreateItemInput } from '@/schema/item'
import type { ActionResult } from '@/types/action-result'

export async function createItem(input: CreateItemInput): Promise<ActionResult> {
  // 1) Auth
  const session = await requireAuth()
  if (!session) return { success: false, error: 'Non autorizzato' }

  // 2) Validate — never trust the client, even if the form already validated
  const parsed = createItemSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  // 3) Business rules (ownership, caps, cross-row constraints)
  // ...

  // 4) Write
  const supabase = await createServerClient()
  const { error } = await supabase.from('item').insert({ name: parsed.data.name })
  if (error) {
    console.error('Supabase item insert error:', error)
    return { success: false, error: 'Errore durante la creazione' }
  }

  // 5) Revalidate + return
  revalidatePath('/items')
  return { success: true }
}
```

## `ActionResult<T>`

Define it once in `types/action-result.ts`:

```ts
export type ActionResult<T = void> = [T] extends [void]
  ? { success: true } | { success: false; error: string; code?: string }
  : { success: true; data: T } | { success: false; error: string }
```

Two shapes:

- **No data**: `ActionResult` — supports an optional `code` for typed errors the client can branch on (e.g. switch UI state instead of just toasting).
- **With data**: `ActionResult<{ id: number }>` — returns the created resource.

Error messages in `error` are **user-facing → Italian**. Never return raw Supabase errors to the client — log them server-side and map to a friendly message.

## Validation

- Use the **same Zod schema** as the form (`schema/<domain>.ts`). The action always re-parses with `safeParse`.
- On failure, return the first issue's message: `parsed.error.issues[0].message` — one error at a time, in Italian.
- Cross-field constraints (`end_date >= start_date`, mutually exclusive fields) go in the schema via `.refine()` / `.superRefine()`, so client and server agree by construction.

## Ownership checks

For `update` and `delete`, always verify the target row belongs to the current user (or the caller has an elevated role) **before** writing:

```ts
const { data: existing } = await supabase
  .from('item')
  .select('id, owner_id')
  .eq('id', id)
  .maybeSingle()

if (!existing) return { success: false, error: 'Elemento non trovato' }
if (existing.owner_id !== session.userId) {
  return { success: false, error: 'Non puoi modificare elementi di altri utenti' }
}
```

## Revalidation

When an action changes data shown elsewhere, call `revalidatePath()` for each affected route. Don't over-invalidate — `revalidatePath('/')` wipes too much cache. Forgetting it means the user submits, the dialog closes, and the page still shows stale data.

## Calling actions from the client

Client components call actions directly and branch on `result.success`. Wrap in `useTransition` when you want a pending state:

```tsx
'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

import { createItem } from '@/actions/item'

export function CreateItemButton({ values }: { values: CreateItemInput }) {
  const [isPending, startTransition] = useTransition()

  const handleCreate = () =>
    startTransition(async () => {
      const result = await createItem(values)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Creato')
    })

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creazione…' : 'Crea'}
    </button>
  )
}
```

With react-hook-form, `form.handleSubmit(onSubmit)` where `onSubmit` awaits the action works the same way — `form.formState.isSubmitting` gives you the pending state (see `docs/ui-patterns.md`).

## Don't

- Don't write to the DB outside of `actions/*`. One-off scripts live in `scripts/` and are documented separately.
- Don't skip Zod because "the form already validates". The action is the trust boundary.
- Don't return raw errors to the client — map to a user-friendly Italian message.
- Don't forget `revalidatePath`.
- Don't add permission logic ad-hoc inside actions. Centralise it in a shared helper (e.g. `lib/permissions.ts`) so every action enforces the same rules.
