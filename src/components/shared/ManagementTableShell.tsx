import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const MANAGEMENT_TABLE_HEAD_ROW_CLASS =
  'bg-vess-grey-100 text-[13px] font-normal leading-[18px] text-vess-grey-950'

/** Row dividers: 1px (device list and similar tables). */
export const MANAGEMENT_TABLE_BODY_DIVIDE_STANDARD_CLASS =
  'divide-y divide-vess-grey-100 bg-vess-grey-50 text-[13px] font-normal leading-[18px] text-vess-grey-950'

/** Row dividers: 2px (device test history). */
export const MANAGEMENT_TABLE_BODY_DIVIDE_HEAVY_CLASS =
  'divide-y-2 divide-vess-grey-100 bg-vess-grey-50 text-[13px] text-vess-grey-950'

type ManagementTableShellProps = {
  className?: string
  children: ReactNode
}

export function ManagementTableShell({ className, children }: ManagementTableShellProps) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border-2 border-vess-grey-100', className)}>
      {children}
    </div>
  )
}

export function ManagementTableSelectColumnPlaceholder() {
  return (
    <div
      className="size-5 shrink-0 rounded border border-vess-grey-200 bg-vess-grey-50"
      aria-hidden
    />
  )
}
