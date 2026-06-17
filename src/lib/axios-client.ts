import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { isAuthEnvelopeError, parseTokenPairFromAuthEnvelope } from '@/lib/api-auth-errors'
import { TOKEN_KEYS, useAuthStore } from '@/stores/auth-store'

/** API base URL — always proxied through /api.
 *  • Dev  → Vite dev server proxies /api to the backend (see vite.config.ts)
 *  • Prod → Vercel serverless function proxies /api to the backend */
const baseURL = '/api'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

const UNAUTHENTICATED_AUTH_PATHS = [
  '/auth/api/v1/auth/register/',
  '/auth/api/v1/auth/verify-otp/',
  '/auth/api/v1/auth/login/',
  '/auth/api/v1/auth/google/',
  '/auth/api/v1/auth/refresh/',
  '/auth/api/v1/auth/password-reset/',
  '/auth/api/v1/auth/password-reset/confirm/',
]

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let isRefreshing = false
let pendingQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function shouldAttachAccessToken(config: InternalAxiosRequestConfig): boolean {
  const url = config.url ?? ''
  if (UNAUTHENTICATED_AUTH_PATHS.some((path) => url.includes(path))) {
    return false
  }
  if (config.headers.Authorization) {
    return false
  }
  if (config.headers['X-API-Key']) {
    return false
  }
  return true
}

function isAuthEndpoint(config: InternalAxiosRequestConfig): boolean {
  return (config.url ?? '').includes('/auth/api/v1/auth/')
}

function processPendingQueue(token: string | null, error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  pendingQueue = []
}

function clearSessionAndRedirect() {
  useAuthStore.getState().clearTokens()
  if (window.location.pathname !== '/auth/sign-in') {
    window.location.href = '/auth/sign-in'
  }
}

function waitForRefreshToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    pendingQueue.push({ resolve, reject })
  })
}

async function fetchRefreshTokens(refreshToken: string): Promise<{ access: string; refresh: string }> {
  const { data } = await axios.post(
    `${baseURL}/auth/api/v1/auth/refresh/`,
    { refresh: refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )

  const tokens = parseTokenPairFromAuthEnvelope(data)
  if (!tokens) {
    throw new Error('Could not refresh session.')
  }

  return tokens
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem(TOKEN_KEYS.refresh)
  if (!refreshToken) {
    clearSessionAndRedirect()
    throw new Error('Session expired. Please sign in again.')
  }

  if (isRefreshing) {
    return waitForRefreshToken()
  }

  isRefreshing = true

  try {
    const tokens = await fetchRefreshTokens(refreshToken)
    useAuthStore.getState().setTokens(tokens.access, tokens.refresh)
    processPendingQueue(tokens.access, null)
    return tokens.access
  } catch (refreshError) {
    processPendingQueue(null, refreshError)
    clearSessionAndRedirect()
    throw refreshError
  } finally {
    isRefreshing = false
  }
}

async function retryRequestAfterRefresh(config: RetryableRequestConfig): Promise<AxiosResponse> {
  if (config._retry || isAuthEndpoint(config)) {
    return Promise.reject(new Error('Session expired. Please sign in again.'))
  }

  config._retry = true
  const accessToken = await refreshAccessToken()
  config.headers.Authorization = `Bearer ${accessToken}`
  return apiClient(config)
}

function shouldAttemptTokenRefresh(config: RetryableRequestConfig): boolean {
  return !config._retry && !isAuthEndpoint(config)
}

apiClient.interceptors.request.use((config) => {
  if (!shouldAttachAccessToken(config)) {
    return config
  }

  const token = localStorage.getItem(TOKEN_KEYS.access)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  async (response) => {
    if (!shouldAttemptTokenRefresh(response.config as RetryableRequestConfig)) {
      return response
    }

    if (isAuthEnvelopeError(response.data)) {
      return retryRequestAfterRefresh(response.config as RetryableRequestConfig)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    if (!originalRequest || !shouldAttemptTokenRefresh(originalRequest)) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    try {
      return await retryRequestAfterRefresh(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
