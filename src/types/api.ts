/** Standard paginated response from both auth-service and device-service. */
export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Standard envelope for single-resource responses (auth-service, test-service, etc.). */
export type ApiEnvelopeError = {
  code?: string
  description?: string
  message?: string
}

export type ApiEnvelope<T = unknown> = {
  /** Device/test services */
  isSuccess?: boolean
  /** Auth service (Postman examples) */
  success?: boolean
  /** Live auth-service: `"success"` | `"error"` */
  status?: string
  message?: string
  data?: T
  error?: ApiEnvelopeError
}
