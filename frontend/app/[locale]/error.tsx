'use client'

import { useEffect } from 'react'

type LocaleErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Per-locale error boundary. Renders when an unhandled error is thrown
 * during rendering of any descendant route segment. The `reset` callback
 * re-renders the segment without a full page reload.
 *
 * Localize the strings below when you wire `next-intl` messages
 * (`errors.unexpected.{title,description,retry}` is the BARR namespace
 * convention).
 */
export default function LocaleError({ error, reset }: LocaleErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-12 text-center md:px-8">
      <h1 className="text-3xl font-semibold text-neutral-900 md:text-4xl">Something went wrong</h1>
      <p className="max-w-lg text-base text-neutral-600">
        An unexpected error occurred while loading this page. You can try again, or come back later.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </section>
  )
}
