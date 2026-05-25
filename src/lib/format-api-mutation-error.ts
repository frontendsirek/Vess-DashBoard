import { isAxiosError } from 'axios'
import { envelopeErrorMessage, isEnvelopeFailed } from '@/lib/assert-api-envelope'

export type FormatApiMutationErrorOptions = {
  /** When `error` is not an `Error` or Axios error-shaped value */
  fallback?: string
}

function nonEmptyTrimmed(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const t = value.trim()
  return t.length > 0 ? t : undefined
}

/** DRF / VeSS envelopes — strings, `{ detail }` arrays, nested `{ error.description }`. */
function stringifyPayloadFragment(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined

  const direct = nonEmptyTrimmed(value)
  if (direct !== undefined) return direct

  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  if (Array.isArray(value)) {
    const parts = value.map((entry) => stringifyPayloadFragment(entry)).filter(Boolean)
    return parts.length > 0 ? parts.join('; ') : undefined
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>

    const directDesc =
      nonEmptyTrimmed(record.description) ?? nonEmptyTrimmed(record.message)
    if (directDesc !== undefined) return directDesc

    const nestedErr = record.error
    if (nestedErr !== null && nestedErr !== undefined && typeof nestedErr === 'object') {
      const errObj = nestedErr as Record<string, unknown>
      const nested =
        nonEmptyTrimmed(errObj.description) ??
        nonEmptyTrimmed(errObj.message) ??
        stringifyPayloadFragment(errObj.detail)
      if (nested !== undefined) return nested
    }

    const skipKeys = new Set([
      'meta',
      '_meta',
      'isSuccess',
      'success',
      'status',
      'code',
      'timestamp',
      'data',
      'errors',
      'items',
      'pagination',
    ])
    const parts: string[] = []
    for (const [key, nested] of Object.entries(record)) {
      if (skipKeys.has(key)) continue
      const s = stringifyPayloadFragment(nested)
      if (s) parts.push(`${key}: ${s}`)
    }
    return parts.length > 0 ? parts.join('; ') : undefined
  }

  return undefined
}

function messageFromResponseBody(data: unknown): string | undefined {
  if (typeof data === 'string') return nonEmptyTrimmed(data)
  if (!data || typeof data !== 'object') return undefined

  const obj = data as Record<string, unknown>

  /** Failed envelopes: prefer nested `error`, then top-level `message` / field `data`. */
  if (isEnvelopeFailed(obj)) {
    const err = obj.error
    if (err !== null && err !== undefined && typeof err === 'object') {
      const errObj = err as Record<string, unknown>
      const fromErr =
        nonEmptyTrimmed(errObj.description) ?? nonEmptyTrimmed(errObj.message)
      if (fromErr !== undefined) return fromErr
    }

    const fromDetail = stringifyPayloadFragment(obj.detail)
    if (fromDetail !== undefined) return fromDetail

    const fromEnvelope = envelopeErrorMessage(obj, '')
    if (fromEnvelope.trim()) return fromEnvelope

    return undefined
  }

  const fromDetail = stringifyPayloadFragment(obj.detail)
  if (fromDetail !== undefined) return fromDetail

  const err = obj.error
  if (err !== null && err !== undefined && typeof err === 'object') {
    const envelope = stringifyPayloadFragment(err)
    if (envelope !== undefined) return envelope
  }

  const fromMessage = nonEmptyTrimmed(obj.message)
  if (fromMessage !== undefined) return fromMessage

  return stringifyPayloadFragment(data)
}

function stripGenericAxiosStatusHint(message: string): string | undefined {
  const t = message.trim()
  if (/^Request failed with status code\s+\d+$/i.test(t)) return undefined
  return t.length > 0 ? t : undefined
}

/**
 * User-facing API/mutation failure copy for Sonner and inline banners.
 */
export function formatApiMutationError(
  error: unknown,
  options?: FormatApiMutationErrorOptions,
): string {
  const fallback =
    options?.fallback ?? 'Something went wrong. Please try again.'
  if (isAxiosError(error)) {
    const fromPayload = messageFromResponseBody(error.response?.data)
    const fromAxios = stripGenericAxiosStatusHint(error.message ?? '')
    const status = error.response?.status
    let primary =
      nonEmptyTrimmed(fromPayload ?? '') ??
      nonEmptyTrimmed(fromAxios ?? '') ??
      nonEmptyTrimmed((error.message ?? '').trim())

    if (
      (status === 401 || status === 403) &&
      primary &&
      /^login successful$/i.test(primary)
    ) {
      primary = undefined
    }

    return primary ?? fallback
  }
  if (error instanceof Error) {
    const m = nonEmptyTrimmed(error.message)
    return m ?? fallback
  }
  return fallback
}
