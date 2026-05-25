import { z } from 'zod'

export const signInFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInFormValues = z.infer<typeof signInFormSchema>

export const signInFormDefaultValues: SignInFormValues = {
  email: '',
  password: '',
}
