import { useEffect, useState } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { AlertCircle, Clock, LogOut } from 'lucide-react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { SESSION_CONFIG } from '@/lib/session-config'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

/**
 * IdleTimeoutGuard
 * Tracks user inactivity inside authenticated routes.
 * Shows a branded warning dialog with countdown before auto-logout.
 */
export function IdleTimeoutGuard() {
  const clearTokens = useAuthStore((s) => s.clearTokens)
  const [remaining, setRemaining] = useState(SESSION_CONFIG.IDLE_TIMEOUT / 1000)
  const [showModal, setShowModal] = useState(false)

  const progressPercent = (() => {
    const promptSec = SESSION_CONFIG.PROMPT_BEFORE_IDLE / 1000
    const elapsed = promptSec - remaining
    return Math.min(100, Math.max(0, (elapsed / promptSec) * 100))
  })()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleLogout = () => {
    setShowModal(false)
    clearTokens()
    window.location.href = '/auth/sign-in'
  }

  const onIdle = () => {
    handleLogout()
  }

  const onPrompt = () => {
    setShowModal(true)
  }

  const onActive = () => {
    setShowModal(false)
  }

  const { getRemainingTime, reset } = useIdleTimer({
    onIdle,
    onPrompt,
    onActive,
    timeout: SESSION_CONFIG.IDLE_TIMEOUT,
    promptBeforeIdle: SESSION_CONFIG.PROMPT_BEFORE_IDLE,
    throttle: SESSION_CONFIG.IDLE_CHECK_THROTTLE,
  })

  const handleStayLoggedIn = () => {
    reset()
    setShowModal(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(Math.ceil(getRemainingTime() / 1000))
    }, SESSION_CONFIG.IDLE_CHECK_THROTTLE)
    return () => clearInterval(interval)
  }, [getRemainingTime])

  useEffect(() => {
    if (remaining < 1 && showModal) {
      handleLogout()
    }
  }, [remaining, showModal])

  return (
    <DialogPrimitive.Root open={showModal}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-border bg-card p-6 shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Session Timeout Warning
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your session will expire due to inactivity
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Time Remaining
                </div>
                <span className="font-mono text-2xl font-bold text-destructive">
                  {formatTime(remaining)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              Click{' '}
              <span className="font-semibold text-foreground">
                &quot;Stay Logged In&quot;
              </span>{' '}
              to continue your session. You will be automatically logged out for
              security if you don&apos;t respond.
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <button
                type="button"
                onClick={handleStayLoggedIn}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
