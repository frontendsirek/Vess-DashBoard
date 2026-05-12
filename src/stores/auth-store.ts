import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const TOKEN_KEYS = {
  access: 'vess_access_token',
  refresh: 'vess_refresh_token',
} as const

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  /** Email stashed between sign-in → OTP screens */
  pendingEmail: string | null

  setTokens: (access: string, refresh: string) => void
  clearTokens: () => void
  setPendingEmail: (email: string) => void
  clearPendingEmail: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      pendingEmail: null,

      setTokens(access, refresh) {
        localStorage.setItem(TOKEN_KEYS.access, access)
        localStorage.setItem(TOKEN_KEYS.refresh, refresh)
        set({ accessToken: access, refreshToken: refresh })
      },

      clearTokens() {
        localStorage.removeItem(TOKEN_KEYS.access)
        localStorage.removeItem(TOKEN_KEYS.refresh)
        set({ accessToken: null, refreshToken: null, pendingEmail: null })
      },

      setPendingEmail(email) {
        set({ pendingEmail: email })
      },

      clearPendingEmail() {
        set({ pendingEmail: null })
      },

      isAuthenticated() {
        return !!get().accessToken
      },
    }),
    {
      name: 'vess-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)

/** Constant token keys — shared with axios interceptor */
export { TOKEN_KEYS }
