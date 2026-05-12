/** Standard paginated response from both auth-service and device-service. */
export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Standard envelope for single-resource responses. */
export type ApiEnvelope<T> = {
  status: string
  message: string
  data: T
}
