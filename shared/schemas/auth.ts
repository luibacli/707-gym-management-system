import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
  password: z.string().min(1, { error: 'Enter your password.' }),
})

export type LoginInput = z.infer<typeof loginSchema>

// Used by the staff account CLI (BR-A2). Minimum length is a security default, not a client requirement.
export const staffPasswordSchema = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters.' })
