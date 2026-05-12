import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const periodOptions = ['Today', 'Yesterday', 'Last 7 days'] as const

type DeviceListPeriodSelectProps = {
  value: string
  onValueChange: (value: string) => void
}

/** Matches Figma 707:21132 — period control in the list card header. */
export function DeviceListPeriodSelect({ value, onValueChange }: DeviceListPeriodSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          'h-auto w-fit min-w-0 gap-2 rounded-[400px] border-0 bg-transparent px-3 py-3 text-[18px] font-normal leading-[21.6px] shadow-none hover:bg-vess-grey-100/60 focus:ring-0 focus:ring-offset-0 data-[state=open]:bg-vess-grey-100/60',
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {periodOptions.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
