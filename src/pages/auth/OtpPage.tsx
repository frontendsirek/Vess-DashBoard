import { useCallback, useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { OtpInput } from '@/components/auth/OtpInput'
import { useResendOtpMutation } from '@/hooks/auth/use-resend-otp-mutation'
import { useVerifyOtpMutation } from '@/hooks/auth/use-verify-otp-mutation'
import {
  verifyOtpFormDefaultValues,
  verifyOtpFormSchema,
  type VerifyOtpFormValues,
} from '@/schemas/auth/verify-otp.schema'
import { useAuthStore } from '@/stores/auth-store'

const OTP_DURATION_SECONDS = 5 * 60

export default function OtpPage() {
  const navigate = useNavigate()
  const pendingEmail = useAuthStore((s) => s.pendingEmail)
  const pendingOtpForTesting = useAuthStore((s) => s.pendingOtpForTesting)
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS)
  const [otpInputKey, setOtpInputKey] = useState(0)

  const verifyOtpMutation = useVerifyOtpMutation()
  const resendOtpMutation = useResendOtpMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpFormSchema),
    defaultValues: verifyOtpFormDefaultValues,
    mode: 'onSubmit',
  })

  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken
    if (!pendingEmail && !accessToken) {
      navigate('/auth/sign-in', { replace: true })
    }
  }, [pendingEmail, navigate])

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [])

  function onSubmit(values: VerifyOtpFormValues) {
    if (!pendingEmail) return
    const challengeToken = useAuthStore.getState().challengeToken
    if (!challengeToken) return
    verifyOtpMutation.mutate({
      email: pendingEmail,
      otp: values.otp.trim(),
      challenge_token: challengeToken,
    })
  }

  function handleResend() {
    if (!pendingEmail) return
    resendOtpMutation.mutate(pendingEmail, {
      onSuccess: () => {
        setSecondsLeft(OTP_DURATION_SECONDS)
        reset(verifyOtpFormDefaultValues)
        setOtpInputKey((key) => key + 1)
      },
    })
  }

  if (!pendingEmail) {
    return null
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-vess-primary-500 px-6 py-12 sm:px-10">
      <div className="flex w-full max-w-[539px] flex-col items-start gap-16">
        <button
          type="button"
          onClick={() => navigate('/auth/sign-in')}
          className="flex items-center gap-4 text-[16px] font-light leading-[21.6px] text-vess-grey-50 transition-opacity hover:opacity-80"
        >
          <ArrowBackIcon />
          Back
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center gap-[72px]"
          noValidate
        >
          <header className="flex w-full flex-col items-start gap-3">
            <h1 className="text-[26px] font-medium leading-tight text-vess-grey-50 sm:text-[37px] sm:leading-[46.8px]">
              Security Verification
            </h1>
            <p className="text-[14px] font-light leading-[21.6px] text-vess-grey-400 sm:text-[16px]">
              Enter the 6-digit code sent to your email: {pendingEmail}
            </p>
            {pendingOtpForTesting && (
              <p className="mt-2 rounded-md border border-yellow-600/40 bg-yellow-900/30 px-3 py-2 text-[12px] font-mono text-yellow-300">
                🧪 Test OTP: <span className="font-bold tracking-widest">{pendingOtpForTesting}</span>
              </p>
            )}
          </header>

          <div className="flex w-full flex-col gap-3">
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <OtpInput key={otpInputKey} length={6} onChange={field.onChange} />
              )}
            />
            {errors.otp?.message ? (
              <p className="text-[12px] text-red-400" role="alert">
                {errors.otp.message}
              </p>
            ) : null}
          </div>

          <div className="flex w-full flex-col items-center gap-10">
            <div className="flex w-full flex-col items-center gap-4">
              <button
                type="submit"
                disabled={verifyOtpMutation.isPending || secondsLeft === 0}
                className="flex h-[50px] w-full items-center justify-center rounded-lg bg-vess-secondary-500 px-16 text-[13px] font-semibold leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyOtpMutation.isPending ? 'Verifying…' : 'Verify code'}
              </button>
              <p className="whitespace-nowrap text-[13px] font-light leading-[18px] text-vess-grey-400">
                Code expires in {formatTime(secondsLeft)}
              </p>
            </div>

            <p className="whitespace-nowrap text-[13px] font-light leading-[18px] text-vess-grey-50">
              <span>Didn&apos;t receive it? </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtpMutation.isPending}
                className="font-light text-vess-secondary-500 transition-opacity hover:opacity-80 disabled:opacity-60"
              >
                {resendOtpMutation.isPending ? 'Sending…' : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

function ArrowBackIcon() {
  return (
    <svg
      className="size-6 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
        fill="currentColor"
      />
    </svg>
  )
}
