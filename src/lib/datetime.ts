import { format, isValid, parse } from 'date-fns'

/** Matches schedule placeholders / wizard display (e.g. 13/03/2026 17:44). */
export const SCHEDULE_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm'

/** Test detail last execution / recent execution timestamps (e.g. 13/03/2026, 16:45:23). */
export const TEST_DETAIL_EXECUTION_DATETIME_FORMAT = 'dd/MM/yyyy, HH:mm:ss'

export function parseScheduleDateTime(value: string): Date | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = parse(trimmed, SCHEDULE_DATETIME_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

export function formatScheduleDateTime(date: Date): string {
  return format(date, SCHEDULE_DATETIME_FORMAT)
}

export function formatTestDetailExecutionDateTime(iso: string | null | undefined): string | undefined {
  if (!iso?.trim()) return undefined
  const parsed = new Date(iso)
  return isValid(parsed) ? format(parsed, TEST_DETAIL_EXECUTION_DATETIME_FORMAT) : undefined
}
