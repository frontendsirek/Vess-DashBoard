import {
  assertApiEnvelopeSuccess,
  isEnvelopeFailed,
} from '@/lib/assert-api-envelope'
import type { ApiUser } from '@/types/user'

function isApiUserShape(value: unknown): value is ApiUser {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.email === 'string' && record.email.trim().length > 0
}

/** GET `/users/me/` — flat user body or `{ status, data: user }` envelope. */
export function parseApiUserProfile(body: unknown): ApiUser | null {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>

  if (isApiUserShape(record)) return record

  if (!isEnvelopeFailed(record)) {
    try {
      const data = assertApiEnvelopeSuccess(record as { data?: ApiUser })
      if (isApiUserShape(data)) return data
    } catch {
      // fall through
    }
  }

  const nested = record.data
  if (isApiUserShape(nested)) return nested

  return null
}
