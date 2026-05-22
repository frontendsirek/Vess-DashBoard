import { useCallback, useState } from 'react'

export type BrowserGeolocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; latitude: number; longitude: number }

function messageForGeolocationError(code: number, fallbackMessage: string): string {
  switch (code) {
    case 1:
      return 'Location access denied. Allow location for this site in your browser settings, then try again.'
    case 2:
      return 'Position unavailable. Move to an area with a clearer GPS signal.'
    case 3:
      return 'Location request timed out. Try again.'
    default:
      return fallbackMessage || 'Could not read your location.'
  }
}

/**
 * Wraps {@link navigator.geolocation} for one-shot position reads from a user gesture.
 * Intended for registration / edit flows (HTTPS required by most browsers).
 */
export function useBrowserGeolocation() {
  const [state, setState] = useState<BrowserGeolocationState>({ status: 'idle' })

  const requestPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation is not supported in this browser.',
      })
      return
    }

    setState({ status: 'loading' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setState({
            status: 'error',
            message: 'Received invalid coordinates from the browser.',
          })
          return
        }
        setState({ status: 'success', latitude, longitude })
      },
      (err) => {
        setState({
          status: 'error',
          message: messageForGeolocationError(err.code, err.message),
        })
      },
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
    )
  }, [])

  const reset = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, requestPosition, reset }
}
