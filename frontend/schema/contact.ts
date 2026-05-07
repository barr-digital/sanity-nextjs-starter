import { z } from 'zod'

/**
 * Validation schema for the example contact form.
 *
 * Lives at the top level (`frontend/schema/`, singular) so it can be imported
 * by both the client form (RHF + zodResolver) and the Server Action that
 * receives the submission. Sharing the schema keeps client-side UX feedback
 * and server-side validation in lockstep.
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Enter a valid email address'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long (max 2000 characters)'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
