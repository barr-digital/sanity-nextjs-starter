'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { submitContactForm } from '@/actions/contact'
import { contactFormSchema, type ContactFormValues } from '@/schema/contact'
import { cn } from '@/utils/cn'

/**
 * Example contact form — reference for the BARR form pattern:
 *
 *   schema (zod)              → frontend/schema/contact.ts
 *   Server Action             → frontend/actions/contact.ts
 *   client component (RHF)    → this file
 *
 * The schema is shared, so client-side error messages and server-side
 * validation stay aligned. The Server Action returns `{ success, error? }` —
 * never throws toward the client.
 *
 * Drop this component into a page or wrap it in a PageBuilder block as needed;
 * it is intentionally standalone (no Sanity coupling).
 */
export function ContactForm({ className }: { className?: string }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setServerError(null)
    const result = await submitContactForm(values)
    if (!result.success) {
      setServerError(result.error)
      return
    }
    setSubmitted(true)
    reset()
  }

  if (submitted) {
    return (
      <div className={cn('rounded-lg border border-neutral-200 bg-neutral-50 p-6', className)}>
        <p className="text-sm">Thanks — your message has been received.</p>
        <button
          type="button"
          className="mt-4 text-sm underline"
          onClick={() => setSubmitted(false)}
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-4', className)}
      noValidate
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="contact-name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          {...register('name')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          {...register('message')}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          aria-invalid={errors.message ? 'true' : 'false'}
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
