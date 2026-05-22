/** Non-empty trimmed string helper for envelopes (`message`, nested fields). */
function nonEmptyTrimmed(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const t = value.trim()
  return t.length > 0 ? t : undefined
}

/**
 * Prefer server `message` on success payloads (VeSS envelopes, etc.).
 */
function extractSuccessMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined
  const obj = payload as Record<string, unknown>
  const top = nonEmptyTrimmed(obj.message)
  if (top !== undefined) return top
  return undefined
}

/**
 * Prefer `message` from the API JSON body when present and non-empty; otherwise use `fallback`.
 */
export function resolveApiSuccessMessage(payload: unknown, fallback: string): string {
  return extractSuccessMessage(payload) ?? fallback
}
