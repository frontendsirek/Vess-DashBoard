import { useEffect, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'
import { TOKEN_KEYS, useAuthStore } from '@/stores/auth-store'
import { parseTokenPairFromAuthEnvelope } from '@/lib/api-auth-errors'
import { SESSION_CONFIG } from '@/lib/session-config'

interface JwtPayload {
  exp: number
  [key: string]: unknown
}

function getTimeUntilExpiry(token: string): number | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    if (!decoded.exp) return null
    return decoded.exp - Math.floor(Date.now() / 1000)
  } catch {
    return null
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * Proactive token refresh hook.
 * Decodes the JWT access token to read its `exp` claim, then schedules
 * a refresh BEFORE the token actually expires — avoiding 401 errors.
 *
 * Logic:
 * 1. Every TOKEN_REFRESH_CHECK_INTERVAL (default 60s) decode the JWT
 * 2. If expiry < EMERGENCY_THRESHOLD (2 min) → refresh immediately
 * 3. If expiry < REFRESH_ADVANCE (1 min) → refresh now
 * 4. Otherwise → wait for next check
 */
export function useProactiveTokenRefresh() {
  const isRefreshingRef = useRef(false)

  useEffect(() => {
    async function checkAndRefresh() {
      if (isRefreshingRef.current) return

      const accessToken = localStorage.getItem(TOKEN_KEYS.access)
      if (!accessToken) return

      const timeRemaining = getTimeUntilExpiry(accessToken)
      if (timeRemaining === null) return

      // Token still has plenty of time
      if (timeRemaining > SESSION_CONFIG.TOKEN_EMERGENCY_THRESHOLD) return

      // Token is within emergency or advance threshold — refresh now
      const refreshToken = localStorage.getItem(TOKEN_KEYS.refresh)
      if (!refreshToken) return

      isRefreshingRef.current = true

      try {
        const { data } = await axios.post(
          `${baseURL}/auth/api/v1/auth/refresh/`,
          { refresh: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const tokens = parseTokenPairFromAuthEnvelope(data)
        if (tokens) {
          useAuthStore.getState().setTokens(tokens.access, tokens.refresh)
        }
      } catch {
        // If proactive refresh fails, the reactive 401 interceptor will catch it later
      } finally {
        isRefreshingRef.current = false
      }
    }

    // Run immediately on mount
    checkAndRefresh()

    // Then check periodically
    const interval = setInterval(checkAndRefresh, SESSION_CONFIG.TOKEN_REFRESH_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])
}
