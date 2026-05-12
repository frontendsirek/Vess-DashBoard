import { format, isValid, parse } from 'date-fns'

/** Matches schedule placeholders / wizard display (e.g. 13/03/2026 17:44). */
export const SCHEDULE_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm'

export function parseScheduleDateTime(value: string): Date | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = parse(trimmed, SCHEDULE_DATETIME_FORMAT, new Date())
  return isValid(parsed) ? parsed : undefined
}

export function formatScheduleDateTime(date: Date): string {
  return format(date, SCHEDULE_DATETIME_FORMAT)
}
