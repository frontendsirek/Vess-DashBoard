import { useEffect, useState } from 'react'

/** Delay after typing stops before committing value for API-backed search/filter. */
export const SEARCH_DEBOUNCE_MS = 500

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value)
    }, delayMs)
    return () => {
      window.clearTimeout(id)
    }
  }, [value, delayMs])

  return debounced
}
