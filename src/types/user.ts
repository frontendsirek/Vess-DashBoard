export type UserRole = 'admin' | 'operator' | 'viewer'

export type UserStatus = 'active' | 'inactive'

export type ApiUser = {
  id: number | string
  email: string
  first_name: string
  last_name: string
  roles?: string[]
  is_active: boolean
  is_staff?: boolean
  date_joined?: string
  last_login?: string | null
}

export type UpdateProfilePayload = {
  first_name?: string
  last_name?: string
}

export type ChangePasswordPayload = {
  current_password: string
  new_password: string
  new_password_confirm: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  access_token?: string
  refresh_token?: string
  access?: string
  refresh?: string
  requires_otp?: boolean
  otp_required?: boolean
  require_otp?: boolean
}

export type LogoutPayload = {
  refresh_token: string
}

export type RegisterPayload = {
  email: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

export type RegisterResponse = {
  user: ApiUser
  otp_for_testing?: string
}

export type VerifyOtpPayload = {
  email: string
  otp: string
}

export type GoogleLoginPayload = {
  id_token: string
}

export type PasswordResetRequestPayload = {
  email: string
}

export type PasswordResetConfirmPayload = {
  email: string
  token: string
  new_password: string
}
