import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LoginGlobe } from '@/components/auth/LoginGlobe'
import { TextInput } from '@/components/ui/text-input'
import { PasswordInput } from '@/components/ui/password-input'
import { Checkbox } from '@/components/ui/checkbox'
import { VessLogoFull } from '@/components/icons'

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function onSubmit(_data: SignInFormValues) {
    navigate('/auth/verify')
  }

  return (
    <div className="flex min-h-screen w-full bg-vess-primary-500">
      {/* Left Panel - Marketing (hidden on mobile/tablet) */}
      <aside className="relative hidden h-screen w-[745px] shrink-0 overflow-hidden border-r border-vess-primary-400 bg-vess-primary-500 lg:block xl:w-[52%]">
        {/* Globe circle - decorative, behind content */}
        <div className="pointer-events-none absolute right-[-58.5px] top-1/2 z-0 size-[619px] -translate-y-1/2 overflow-hidden rounded-full opacity-40">
          <LoginGlobe />
        </div>

        {/* Content block - absolute positioned, vertically centered */}
        <div className="absolute left-[51px] top-1/2 z-10 flex w-[590px] -translate-y-1/2 flex-col gap-[104px]">
          <VessLogoFull className="h-[27.874px] w-[96.331px] shrink-0 text-vess-grey-50" />

          <div className="flex h-[725px] w-full flex-col justify-between">
            {/* Top: welcome message + paragraph */}
            <div className="flex flex-col gap-11">
              <div className="flex flex-col gap-3">
                <p className="whitespace-nowrap text-[18px] font-medium leading-[21.6px] text-vess-secondary-500">
                  NETWORK QUALITY MONITORING
                </p>
                <h1 className="text-[49px] font-bold leading-[58.8px] text-vess-grey-50">
                  Real networks.<br />
                  Real devices.<br />
                  Real insights.
                </h1>
              </div>
              <p className="text-[20px] leading-[24px] text-vess-grey-400">
                Monitor voice, SMS, and data service quality across your device fleet in real time. Automated testing. Instant alerts. Actionable intelligence.
              </p>
            </div>

            {/* Bottom: stats row */}
            <div className="flex w-full items-center justify-between whitespace-nowrap">
              <div className="flex flex-col gap-3">
                <span className="text-[25px] font-semibold leading-[30px] text-vess-grey-50">48</span>
                <span className="text-[18px] leading-[21.6px] text-vess-grey-400">Devices monitored</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[25px] font-semibold leading-[30px] text-vess-grey-50">98.5%</span>
                <span className="text-[18px] leading-[21.6px] text-vess-grey-400">Avg success rate</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[25px] font-semibold leading-[30px] text-vess-grey-50">&lt;2s</span>
                <span className="text-[18px] leading-[21.6px] text-vess-grey-400">Alert latency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom-left accent line */}
        <div className="absolute bottom-[44px] left-[44px] z-10 h-[2px] w-[200px] bg-gradient-to-r from-vess-secondary-500 via-vess-secondary-500/50 to-transparent" />
      </aside>

      {/* Right Panel - Sign In Form */}
      <section className="flex min-h-screen flex-1 items-center justify-center bg-vess-primary-500 px-6 py-12 sm:px-10">
        <div className="w-full max-w-[539px]">
          {/* Mobile-only logo */}
          <div className="mb-12 lg:hidden">
            <VessLogoFull className="h-[27.874px] w-[96.331px] shrink-0" />
          </div>

          <div className="flex flex-col gap-[72px]">
            {/* Header */}
            <div className="flex flex-col gap-3">
              <h2 className="text-[32px] font-medium leading-tight text-vess-grey-50 sm:text-[39px] sm:leading-[46.8px]">
                Sign in
              </h2>
              <p className="text-[18px] leading-[21.6px] text-vess-grey-400">
                Access your monitoring dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8" noValidate>
              {/* Email */}
              <TextInput
                label="Email address"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                variant="dark"
                error={errors.email?.message}
                {...register('email')}
              />

              {/* Password + Remember me */}
              <div className="flex flex-col gap-6">
                <PasswordInput
                  label="Password"
                  autoComplete="current-password"
                  required
                  variant="dark"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  label="Remember me"
                  variant="dark"
                />
              </div>

              {/* Sign in button + OR + social */}
              <div className="flex flex-col items-center gap-10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-[50px] w-full rounded-lg bg-vess-secondary-500 text-[15px] font-semibold text-vess-grey-50 transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  Sign in
                </button>

                <div className="flex w-full items-center gap-3">
                  <div className="h-px flex-1 bg-vess-primary-400" />
                  <span className="text-[15px] font-light leading-[18px] text-vess-grey-400">OR</span>
                  <div className="h-px flex-1 bg-vess-primary-400" />
                </div>

                <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-5">
                  <button
                    type="button"
                    className="flex h-[50px] flex-1 items-center justify-center gap-3 rounded-lg border border-vess-primary-400 bg-vess-primary-600 px-5 text-[15px] font-medium text-vess-grey-50 transition-colors hover:border-vess-grey-400"
                  >
                    <GoogleIcon />
                    Sign in with Google
                  </button>
                  <button
                    type="button"
                    className="flex h-[50px] flex-1 items-center justify-center gap-3 rounded-lg border border-vess-primary-400 bg-vess-primary-600 px-5 text-[15px] font-medium text-vess-grey-50 transition-colors hover:border-vess-grey-400"
                  >
                    <MicrosoftIcon />
                    Sign in with Microsoft
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="size-[17px]" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg className="size-[17px]" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  )
}
