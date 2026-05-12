import type { ReactNode } from 'react'

type ManagementCardRowProps = {
  label: string
  children: ReactNode
}

/** Shared label/value row for management grid cards (Test + Device). */
export function ManagementCardRow({ label, children }: ManagementCardRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="shrink-0 font-normal text-vess-grey-500">{label}</dt>
      <dd className="min-w-0 text-right font-normal text-vess-grey-950">{children}</dd>
    </div>
  )
}
