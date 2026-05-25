import type { ApiUser } from '@/types/user'

export function userInitialsFromProfile(
  user: Pick<ApiUser, 'first_name' | 'last_name'> | null | undefined,
): string {
  if (!user) return '—'
  const first = user.first_name?.trim()[0] ?? ''
  const last = user.last_name?.trim()[0] ?? ''
  const initials = `${first}${last}`.toUpperCase()
  return initials.length > 0 ? initials : '—'
}

export function userRoleLabelFromProfile(user: ApiUser | null | undefined): string {
  if (!user) return 'User'
  if (user.is_staff) return 'Administrator'

  const role = user.roles?.[0]
  if (typeof role === 'string' && role.trim()) {
    const normalized = role.trim()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  return 'User'
}
