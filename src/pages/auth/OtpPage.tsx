import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OtpInput } from '@/components/auth/OtpInput'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'
import { isAxiosError } from 'axios'

const OTP_DURATION_SECONDS = 5 * 60

export default function OtpPage() {
  const navigate = useNavigate()
  const { pendingEmail, setTokens, clearPendingEmail } = useAuthStore()
  const [otpValue, setOtpValue] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION_SECONDS)
  const [isVerifying, setIsVerifying] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Redirect if no email was stashed from sign-in
  useEffect(() => {
    if (!pendingEmail) {
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

  async function handleResend() {
    if (!pendingEmail) return
    setApiError(null)
    try {
      await authService.login({ email: pendingEmail, password: '' })
    } catch {
      // Best-effort — the server will re-send the OTP
    }
    setSecondsLeft(OTP_DURATION_SECONDS)
  }

  async function handleVerify() {
    if (otpValue.length < 6 || !pendingEmail) return
    setIsVerifying(true)
    setApiError(null)

    try {
      const res = await authService.verifyOtp({
        email: pendingEmail,
        otp: otpValue,
      })

      const { access_token, refresh_token } = res.data.data
      setTokens(access_token, refresh_token)
      clearPendingEmail()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          'Invalid verification code'
        setApiError(String(msg))
      } else {
        setApiError('Verification failed. Please try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-vess-primary-500 px-6 py-12 sm:px-10">
      {/* Outer Container: gap-64px between back button and content (matches Figma 768:13199) */}
      <div className="flex w-full max-w-[539px] flex-col items-start gap-16">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/auth/sign-in')}
          className="flex items-center gap-4 text-[18px] font-light leading-[21.6px] text-vess-grey-50 transition-opacity hover:opacity-80"
        >
          <ArrowBackIcon />
          Back
        </button>

        {/* Content Container: gap-72px, items-center (matches Figma 768:13204) */}
        <div className="flex w-full flex-col items-center gap-[72px]">
          {/* Header: gap-12px, items-start */}
          <header className="flex w-full flex-col items-start gap-3">
            <h1 className="text-[28px] font-medium leading-tight text-vess-grey-50 sm:text-[39px] sm:leading-[46.8px]">
              Security Verification
            </h1>
            <p className="text-[16px] font-light leading-[21.6px] text-vess-grey-400 sm:text-[18px]">
              Enter the 6-digit code sent to your email: {pendingEmail ?? ''}
            </p>
          </header>

          {/* Error banner */}
          {apiError && (
            <div className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-400">
              {apiError}
            </div>
          )}

          {/* Code Input: gap-12px, w-full */}
          <OtpInput length={6} onChange={setOtpValue} />

          {/* Footer: gap-40px, items-center, w-full */}
          <div className="flex w-full flex-col items-center gap-10">
            {/* Timer Container: gap-16px, items-center, w-full */}
            <div className="flex w-full flex-col items-center gap-4">
              <button
                type="button"
                onClick={handleVerify}
                disabled={otpValue.length < 6 || isVerifying || secondsLeft === 0}
                className="flex h-[50px] w-full items-center justify-center rounded-lg bg-vess-secondary-500 px-16 text-[15px] font-semibold leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifying ? 'Verifying...' : 'Verify code'}
              </button>
              <p className="whitespace-nowrap text-[15px] font-light leading-[18px] text-vess-grey-400">
                Code expires in {formatTime(secondsLeft)}
              </p>
            </div>

            {/* Resend prompt — inline span layout to mirror Figma */}
            <p className="whitespace-nowrap text-[15px] font-light leading-[18px] text-vess-grey-50">
              <span>Didn&apos;t receive it? </span>
              <button
                type="button"
                onClick={handleResend}
                className="font-light text-vess-secondary-500 transition-opacity hover:opacity-80"
              >
                Resend Code
              </button>
            </p>
          </div>
        </div>
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
