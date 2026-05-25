import { useMatches } from 'react-router-dom'
import type { AppRouteHandle } from '@/types/route-handle'

/** Deepest matched route with a `handle.title` or `handle.hideTopbar`. */
export function useRouteTopbarMeta(): AppRouteHandle | null {
  const matches = useMatches()

  for (let index = matches.length - 1; index >= 0; index -= 1) {
    const handle = matches[index].handle as AppRouteHandle | undefined
    if (!handle) continue
    if (handle.hideTopbar || handle.title) return handle
  }

  return null
}
