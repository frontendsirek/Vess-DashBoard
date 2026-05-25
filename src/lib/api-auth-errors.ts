/** VeSS-style envelope auth failures (often HTTP 200 with `isSuccess: false`). */
export function isAuthEnvelopeError(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false

  const record = body as Record<string, unknown>
  if (record.isSuccess !== false) return false

  const err = record.error
  if (err && typeof err === 'object') {
    const code = (err as Record<string, unknown>).code
    if (typeof code === 'string' && code.trim().toLowerCase() === 'unauthorized') {
      return true
    }
  }

  const fragments: string[] = []
  if (typeof record.message === 'string') fragments.push(record.message)
  if (err && typeof err === 'object') {
    const description = (err as Record<string, unknown>).description
    if (typeof description === 'string') fragments.push(description)
  }

  const combined = fragments.join(' ').toLowerCase()
  return (
    combined.includes('token has expired') ||
    combined.includes('unauthorized') ||
    combined.includes('not authenticated') ||
    combined.includes('invalid token')
  )
}

export function parseTokenPairFromRefreshResponse(body: unknown): { access: string; refresh: string } | null {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>
  if (record.isSuccess === false) return null

  const inner =
    record.data && typeof record.data === 'object' ?
      (record.data as Record<string, unknown>)
    : record

  const access = inner.access ?? inner.access_token
  const refresh = inner.refresh ?? inner.refresh_token

  if (typeof access === 'string' && access.length > 0 && typeof refresh === 'string' && refresh.length > 0) {
    return { access, refresh }
  }

  return null
}
