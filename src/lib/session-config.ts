/**
 * Session & Idle Timer Configuration
 * All values are in milliseconds unless otherwise noted.
 *
 * Override via environment variables with VITE_SESSION_ prefix:
 *   VITE_SESSION_IDLE_TIMEOUT=900000      (15 minutes)
 *   VITE_SESSION_PROMPT_BEFORE_IDLE=60000  (60 seconds warning)
 */

const getEnvNumber = (key: string, fallback: number): number => {
  const raw = import.meta.env[key]
  if (raw === undefined) return fallback
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) ? fallback : parsed
}

export const SESSION_CONFIG = {
  /** How long (ms) of inactivity before auto-logout. Default: 15 minutes */
  IDLE_TIMEOUT: getEnvNumber('VITE_SESSION_IDLE_TIMEOUT', 15 * 60 * 1000),

  /** Show warning dialog this many ms before idle timeout. Default: 60 seconds */
  PROMPT_BEFORE_IDLE: getEnvNumber('VITE_SESSION_PROMPT_BEFORE_IDLE', 60 * 1000),

  /** Throttle interval (ms) for idle checks. Default: 1 second */
  IDLE_CHECK_THROTTLE: getEnvNumber('VITE_SESSION_IDLE_CHECK_THROTTLE', 1000),

  /** Emergency threshold (seconds): refresh IMMEDIATELY if token expires within this. Default: 120s */
  TOKEN_EMERGENCY_THRESHOLD: getEnvNumber('VITE_SESSION_TOKEN_EMERGENCY_THRESHOLD', 2 * 60),

  /** Normal advance (seconds): refresh token this many seconds before expiry. Default: 60s */
  TOKEN_REFRESH_ADVANCE: getEnvNumber('VITE_SESSION_TOKEN_REFRESH_ADVANCE', 60),

  /** Background check interval (ms): how often to decode JWT and check expiry. Default: 60s */
  TOKEN_REFRESH_CHECK_INTERVAL: getEnvNumber('VITE_SESSION_TOKEN_REFRESH_CHECK_INTERVAL', 60 * 1000),
} as const
