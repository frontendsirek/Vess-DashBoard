type ApiErrorBody = {
  description?: string
  message?: string
}

type ApiEnvelopeLike<T> = {
  isSuccess: boolean
  message?: string
  data?: T
  error?: ApiErrorBody
}

/** Throws when envelope reports failure (does not require `data`). */
export function throwIfApiEnvelopeError(
  envelope: ApiEnvelopeLike<unknown>,
  fallbackMessage = 'Request failed.',
): void {
  if (!envelope.isSuccess) {
    throw new Error(envelope.error?.description ?? envelope.message ?? fallbackMessage)
  }
}

/** Throws when envelope reports failure (keeps envelope shape for callers that need metadata). */
export function throwIfApiEnvelopeFailed<T>(
  envelope: ApiEnvelopeLike<T>,
  fallbackMessage = 'Request failed.',
): asserts envelope is ApiEnvelopeLike<T> & { isSuccess: true; data: T } {
  if (!envelope.isSuccess) {
    throw new Error(envelope.error?.description ?? envelope.message ?? fallbackMessage)
  }
  if (envelope.data === undefined || envelope.data === null) {
    throw new Error(envelope.message ?? fallbackMessage)
  }
}

/** Throws when envelope reports failure or omits `data`. */
export function assertApiEnvelopeSuccess<T>(
  envelope: ApiEnvelopeLike<T>,
  fallbackMessage = 'Request failed.',
): T {
  if (!envelope.isSuccess) {
    throw new Error(envelope.error?.description ?? envelope.message ?? fallbackMessage)
  }
  if (envelope.data === undefined || envelope.data === null) {
    throw new Error(envelope.message ?? fallbackMessage)
  }
  return envelope.data
}

/** User-facing message from a failed envelope (no throw). */
export function envelopeErrorMessage(
  envelope: ApiEnvelopeLike<unknown>,
  fallbackMessage = 'Request failed.',
): string {
  return envelope.error?.description ?? envelope.message ?? fallbackMessage
}
