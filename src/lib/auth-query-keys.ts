export const authQueryKeys = {
  all: ['auth'] as const,
  profile: (accessToken: string | null) => [...authQueryKeys.all, 'profile', accessToken] as const,
  login: () => [...authQueryKeys.all, 'login'] as const,
  verifyOtp: () => [...authQueryKeys.all, 'verify-otp'] as const,
  resendOtp: () => [...authQueryKeys.all, 'resend-otp'] as const,
  logout: () => [...authQueryKeys.all, 'logout'] as const,
}
