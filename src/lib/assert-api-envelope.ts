type ApiErrorBody = {
  description?: string
  message?: string
  detail?: unknown
}

type ApiEnvelopeLike<T> = {
  isSuccess?: boolean
  success?: boolean
  /** Live auth-service uses `"success"` / `"error"` string status. */
  status?: string
  message?: string
  data?: T
  error?: ApiErrorBody
  detail?: unknown
}

function normalizeEnvelopeStatus(status: unknown): 'success' | 'failure' | 'unknown' {
  if (typeof status !== 'string') return 'unknown'
  const lower = status.trim().toLowerCase()
  if (lower === 'success' || lower === 'ok') return 'success'
  if (lower === 'error' || lower === 'failed' || lower === 'failure') return 'failure'
  return 'unknown'
}

/** Auth: `status: "success"` or `success: true`; device/test: `isSuccess: true`. */
export function isEnvelopeSuccessful(envelope: ApiEnvelopeLike<unknown>): boolean {
  if (envelope.isSuccess === true || envelope.success === true) return true
  if (envelope.isSuccess === false || envelope.success === false) return false

  const statusNorm = normalizeEnvelopeStatus(envelope.status)
  if (statusNorm === 'success') return true
  if (statusNorm === 'failure') return false

  return false
}

export function isEnvelopeFailed(envelope: ApiEnvelopeLike<unknown>): boolean {
  return !isEnvelopeSuccessful(envelope)
}

/** Explicit failure flags only — used where ambiguous envelopes must not trigger side effects. */
export function isExplicitEnvelopeFailure(body: Record<string, unknown>): boolean {
  if (body.isSuccess === false || body.success === false) return true
  return normalizeEnvelopeStatus(body.status) === 'failure'
}

function envelopeFieldErrorsFromData(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined

  const parts: string[] = []
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const msgs = value.map(String).map((s) => s.trim()).filter(Boolean)
      if (msgs.length > 0) parts.push(`${key}: ${msgs.join(', ')}`)
    } else if (typeof value === 'string' && value.trim()) {
      parts.push(`${key}: ${value.trim()}`)
    }
  }

  return parts.length > 0 ? parts.join('; ') : undefined
}

function envelopeFailureText(
  envelope: ApiEnvelopeLike<unknown>,
  fallbackMessage: string,
): string {
  const err = envelope.error
  if (err?.description?.trim()) return err.description.trim()
  if (err?.message?.trim()) return err.message.trim()

  if (envelope.detail !== undefined && envelope.detail !== null) {
    const detail =
      typeof envelope.detail === 'string' ?
        envelope.detail.trim()
      : Array.isArray(envelope.detail) ?
        envelope.detail.map(String).join('; ')
      : ''
    if (detail.length > 0) return detail
  }

  const topMessage = envelope.message?.trim()
  const fieldErrors = envelopeFieldErrorsFromData(envelope.data)
  if (topMessage && fieldErrors) return `${topMessage}: ${fieldErrors}`
  if (topMessage) return topMessage
  if (fieldErrors) return fieldErrors

  return fallbackMessage
}

/** Throws when envelope reports failure (does not require `data`). */
export function throwIfApiEnvelopeError(
  envelope: ApiEnvelopeLike<unknown>,
  fallbackMessage = 'Request failed.',
): void {
  if (isEnvelopeFailed(envelope)) {
    throw new Error(envelopeFailureText(envelope, fallbackMessage))
  }
}

/** Throws when envelope reports failure (keeps envelope shape for callers that need metadata). */
export function throwIfApiEnvelopeFailed<T>(
  envelope: ApiEnvelopeLike<T>,
  fallbackMessage = 'Request failed.',
): asserts envelope is ApiEnvelopeLike<T> & { data: T } {
  if (isEnvelopeFailed(envelope)) {
    throw new Error(envelopeFailureText(envelope, fallbackMessage))
  }
  if (envelope.data === undefined || envelope.data === null) {
    throw new Error(fallbackMessage)
  }
}

/** Throws when envelope reports failure or omits `data`. */
export function assertApiEnvelopeSuccess<T>(
  envelope: ApiEnvelopeLike<T>,
  fallbackMessage = 'Request failed.',
): T {
  if (isEnvelopeFailed(envelope)) {
    throw new Error(envelopeFailureText(envelope, fallbackMessage))
  }
  if (envelope.data === undefined || envelope.data === null) {
    throw new Error(fallbackMessage)
  }
  return envelope.data
}

/** User-facing message from a failed envelope (no throw). */
export function envelopeErrorMessage(
  envelope: ApiEnvelopeLike<unknown>,
  fallbackMessage = 'Request failed.',
): string {
  if (isEnvelopeFailed(envelope)) {
    return envelopeFailureText(envelope, fallbackMessage)
  }
  return fallbackMessage
}
