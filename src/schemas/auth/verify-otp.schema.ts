import { z } from 'zod'

export const verifyOtpFormSchema = z.object({
  otp: z
    .string()
    .trim()
    .length(6, 'Enter the 6-digit verification code'),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpFormSchema>

export const verifyOtpFormDefaultValues: VerifyOtpFormValues = {
  otp: '',
}
