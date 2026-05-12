import { apiClient } from '@/lib/axios-client'
import type { ApiEnvelope, PaginatedResponse } from '@/types/api'
import type {
  ApiUser,
  ChangePasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  LoginResponse,
  LogoutPayload,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
  VerifyOtpPayload,
} from '@/types/user'

const AUTH_PREFIX = '/auth/api/v1/auth'
const USERS_PREFIX = '/auth/api/v1/users'

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export const authService = {
  /* ── Authentication ── */

  register(payload: RegisterPayload) {
    return apiClient.post<ApiEnvelope<RegisterResponse>>(
      `${AUTH_PREFIX}/register/`,
      payload,
    )
  },

  verifyOtp(payload: VerifyOtpPayload) {
    return apiClient.post<ApiEnvelope<LoginResponse>>(
      `${AUTH_PREFIX}/verify-otp/`,
      payload,
    )
  },

  login(payload: LoginPayload) {
    return apiClient.post<ApiEnvelope<LoginResponse>>(
      `${AUTH_PREFIX}/login/`,
      payload,
    )
  },

  googleLogin(payload: GoogleLoginPayload) {
    return apiClient.post<ApiEnvelope<LoginResponse>>(
      `${AUTH_PREFIX}/google/`,
      payload,
    )
  },

  refreshToken(refreshToken: string) {
    return apiClient.post<ApiEnvelope<{ access: string; refresh: string }>>(
      `${AUTH_PREFIX}/refresh/`,
      { refresh: refreshToken },
    )
  },

  logout(payload: LogoutPayload, accessToken: string) {
    return apiClient.post(`${AUTH_PREFIX}/logout/`, payload, {
      headers: authHeader(accessToken),
    })
  },

  requestPasswordReset(payload: PasswordResetRequestPayload) {
    return apiClient.post<ApiEnvelope<{ token_for_testing?: string }>>(
      `${AUTH_PREFIX}/password-reset/`,
      payload,
    )
  },

  confirmPasswordReset(payload: PasswordResetConfirmPayload) {
    return apiClient.post(
      `${AUTH_PREFIX}/password-reset/confirm/`,
      payload,
    )
  },

  /* ── Health ── */

  health() {
    return apiClient.get(`${AUTH_PREFIX}/health/`)
  },

  /* ── Users ── */

  getProfile(accessToken: string) {
    return apiClient.get<ApiEnvelope<ApiUser>>(`${USERS_PREFIX}/me/`, {
      headers: authHeader(accessToken),
    })
  },

  updateProfile(payload: UpdateProfilePayload, accessToken: string) {
    return apiClient.put<ApiEnvelope<ApiUser>>(`${USERS_PREFIX}/me/`, payload, {
      headers: authHeader(accessToken),
    })
  },

  changePassword(payload: ChangePasswordPayload, accessToken: string) {
    return apiClient.post(`${USERS_PREFIX}/change-password/`, payload, {
      headers: authHeader(accessToken),
    })
  },

  listUsers(accessToken: string, search?: string) {
    return apiClient.get<PaginatedResponse<ApiUser>>(USERS_PREFIX + '/', {
      headers: authHeader(accessToken),
      params: search ? { search } : undefined,
    })
  },

  getUserById(userId: number, accessToken: string) {
    return apiClient.get<ApiEnvelope<ApiUser>>(`${USERS_PREFIX}/${userId}/`, {
      headers: authHeader(accessToken),
    })
  },

  updateUserById(userId: number, payload: UpdateProfilePayload, accessToken: string) {
    return apiClient.put<ApiEnvelope<ApiUser>>(
      `${USERS_PREFIX}/${userId}/`,
      payload,
      { headers: authHeader(accessToken) },
    )
  },
}
