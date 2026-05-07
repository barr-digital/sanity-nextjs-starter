'use server'

import { contactFormSchema } from '@/schema/contact'

type SubmitContactResult = { success: true } | { success: false; error: string }

/**
 * Example Server Action: validate a contact form payload and acknowledge receipt.
 *
 * The first line is always `schema.safeParse(input)` — never accept untyped
 * input from the client. The function intentionally types `input` as
 * `unknown`: any object the client sends is validated, mistyped fields fail
 * loudly, and the success branch operates on a fully typed value.
 *
 * Replace the side-effect block with your own integration (Resend, CRM,
 * webhook, ticketing tool, etc.) without changing the contract.
 */
export async function submitContactForm(input: unknown): Promise<SubmitContactResult> {
  const parsed = contactFormSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Invalid form data' }
  }

  const { name, email, message } = parsed.data

  // TODO: replace with your real side effect.
  // Examples:
  //   - send an email via Resend / Nodemailer
  //   - push to a CRM / ticketing API
  //   - persist to a DB or queue
  console.log('[contact-form] submission received', { name, email, messageLength: message.length })

  return { success: true }
}
