import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { CalendarIcon } from '@/components/icons'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatScheduleDateTime, parseScheduleDateTime, SCHEDULE_DATETIME_FORMAT } from '@/lib/datetime'
import { cn } from '@/lib/utils'

export type DateTimePickerFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  id?: string
}

export function DateTimePickerField({
  value,
  onChange,
  disabled,
  placeholder = 'dd/mm/yyyy  00:00',
  id,
}: DateTimePickerFieldProps) {
  const [open, setOpen] = useState(false)

  const parsed = useMemo(() => parseScheduleDateTime(value), [value])
  const timeStr = parsed ? format(parsed, 'HH:mm') : '00:00'

  function applyDateAndTime(datePart: Date, timePart: string) {
    const [h, m] = timePart.split(':').map((x) => Number.parseInt(x, 10))
    const next = new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), h || 0, m || 0, 0, 0)
    onChange(formatScheduleDateTime(next))
  }

  function handleDaySelect(date: Date | undefined) {
    if (!date) return
    applyDateAndTime(date, timeStr)
  }

  function handleTimeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const t = event.target.value
    const base = parsed ?? new Date()
    applyDateAndTime(base, t)
  }

  const display = parsed ? format(parsed, SCHEDULE_DATETIME_FORMAT) : ''

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={(next) => {
        if (!disabled) setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-[50px] w-full items-center justify-between rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-vess-primary-500 disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <span
            className={cn(
              'w-full min-w-0 truncate text-[15px] font-normal leading-[18px]',
              display ? 'text-vess-grey-950' : 'text-vess-grey-950 opacity-20',
            )}
          >
            {display || placeholder}
          </span>
          <CalendarIcon className="size-[22px] shrink-0 text-vess-grey-950" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col gap-3" align="start">
        <Calendar
          mode="single"
          required={false}
          selected={parsed}
          onSelect={handleDaySelect}
          defaultMonth={parsed ?? new Date()}
        />
        <div className="flex items-center gap-3 border-t border-vess-grey-200 pt-3">
          <span className="shrink-0 text-[15px] font-normal leading-[18px] text-vess-grey-950">Time</span>
          <input
            type="time"
            value={timeStr}
            onChange={handleTimeChange}
            disabled={disabled}
            className="h-10 min-w-0 flex-1 rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-3 text-[15px] font-normal leading-[18px] text-vess-grey-950 outline-none focus-visible:ring-2 focus-visible:ring-vess-primary-500"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
