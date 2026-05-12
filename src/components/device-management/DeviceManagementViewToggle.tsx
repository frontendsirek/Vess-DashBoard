import type { ReactNode } from 'react'
import {
  DeviceManagementGridViewIcon,
  DeviceManagementListViewIcon,
} from '@/components/icons'
import { type DeviceManagementView } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

type DeviceManagementViewToggleProps = {
  value: DeviceManagementView
  onChange: (view: DeviceManagementView) => void
}

export function DeviceManagementViewToggle({
  value,
  onChange,
}: DeviceManagementViewToggleProps) {
  return (
    <div role="group" aria-label="Switch device view" className="flex items-center gap-2">
      <ToggleButton
        active={value === 'list'}
        label="List view"
        onClick={() => onChange('list')}
      >
        <DeviceManagementListViewIcon className="size-6" />
      </ToggleButton>
      <ToggleButton
        active={value === 'grid'}
        label="Grid view"
        onClick={() => onChange('grid')}
      >
        <DeviceManagementGridViewIcon className="size-6" />
      </ToggleButton>
    </div>
  )
}

function ToggleButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-vess-primary-500 text-vess-grey-50' : 'border-2 border-vess-grey-100 bg-vess-grey-50 text-vess-grey-950',
      )}
    >
      {children}
    </button>
  )
}
