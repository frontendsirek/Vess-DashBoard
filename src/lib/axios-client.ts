import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { TOKEN_KEYS } from '@/stores/auth-store'

/** API origin (same in dev and prod). Set `VITE_API_BASE_URL` in `.env` — no trailing slash. */
const baseURL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

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

/* ── Token-refresh interceptor ── */

let isRefreshing = false
let pendingQueue: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function processPendingQueue(token: string | null, error: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only intercept 401s that aren't already retries and aren't auth endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/api/v1/auth/')
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem(TOKEN_KEYS.refresh)
    if (!refreshToken) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(
        `${baseURL}/auth/api/v1/auth/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const newAccess: string = data.data.access
      const newRefresh: string = data.data.refresh

      localStorage.setItem(TOKEN_KEYS.access, newAccess)
      localStorage.setItem(TOKEN_KEYS.refresh, newRefresh)

      originalRequest.headers.Authorization = `Bearer ${newAccess}`
      processPendingQueue(newAccess, null)

      return apiClient(originalRequest)
    } catch (refreshError) {
      processPendingQueue(null, refreshError)
      localStorage.removeItem(TOKEN_KEYS.access)
      localStorage.removeItem(TOKEN_KEYS.refresh)
      window.location.href = '/auth/sign-in'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
