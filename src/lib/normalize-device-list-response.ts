import type { PaginatedResponse } from '@/types/api'

/** Device search may return a bare array or the standard paginated `{ results }` envelope. */
export function normalizeDeviceListResults<T>(
  data: T[] | PaginatedResponse<T> | null | undefined,
): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
  }
  return []
}
