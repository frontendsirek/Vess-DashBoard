import { DayPicker, getDefaultClassNames, type DayPickerProps } from 'react-day-picker'
import { cn } from '@/lib/utils'

const defaultClassNames = getDefaultClassNames()

export type CalendarProps = DayPickerProps

/** Single-month calendar; styles from `react-day-picker/style.css` + VESS overrides. */
export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-0', className)}
      classNames={{
        ...defaultClassNames,
        root: cn(defaultClassNames.root, 'font-sans'),
        months: cn(defaultClassNames.months, 'relative flex flex-col sm:flex-row', classNames?.months),
        month: cn(defaultClassNames.month, classNames?.month),
        month_caption: cn(defaultClassNames.month_caption, 'mb-2 flex h-9 items-center justify-center px-1', classNames?.month_caption),
        caption_label: cn(defaultClassNames.caption_label, 'text-[13px] font-medium text-vess-grey-950', classNames?.caption_label),
        nav: cn(defaultClassNames.nav, 'absolute inset-x-0 top-1 flex items-center justify-between px-1', classNames?.nav),
        button_previous: cn(
          defaultClassNames.button_previous,
          'inline-flex size-8 items-center justify-center rounded-md text-vess-grey-950 hover:bg-vess-grey-100',
          classNames?.button_previous,
        ),
        button_next: cn(
          defaultClassNames.button_next,
          'inline-flex size-8 items-center justify-center rounded-md text-vess-grey-950 hover:bg-vess-grey-100',
          classNames?.button_next,
        ),
        month_grid: cn(defaultClassNames.month_grid, 'w-full border-collapse', classNames?.month_grid),
        weekdays: cn(defaultClassNames.weekdays, 'flex justify-center gap-0.5', classNames?.weekdays),
        weekday: cn(
          defaultClassNames.weekday,
          'flex size-8 items-center justify-center text-[11px] font-normal text-vess-grey-500',
          classNames?.weekday,
        ),
        week: cn(defaultClassNames.week, 'mt-0.5 flex w-full justify-center gap-0.5', classNames?.week),
        day: cn(defaultClassNames.day, 'flex size-8 items-center justify-center p-0', classNames?.day),
        day_button: cn(
          defaultClassNames.day_button,
          'flex size-8 items-center justify-center rounded-md text-[13px] font-normal text-vess-grey-950 hover:bg-vess-grey-100 focus:outline-none focus:ring-2 focus:ring-vess-primary-500',
          classNames?.day_button,
        ),
        today: cn(defaultClassNames.today, 'font-semibold text-vess-primary-500', classNames?.today),
        selected: cn(
          defaultClassNames.selected,
          '[&_button]:bg-vess-primary-500 [&_button]:text-vess-grey-50 [&_button]:hover:bg-vess-primary-500',
          classNames?.selected,
        ),
        outside: cn(defaultClassNames.outside, 'text-vess-grey-400', classNames?.outside),
        disabled: cn(defaultClassNames.disabled, 'pointer-events-none opacity-30', classNames?.disabled),
        hidden: cn(defaultClassNames.hidden, 'invisible', classNames?.hidden),
        ...classNames,
      }}
      {...props}
    />
  )
}
