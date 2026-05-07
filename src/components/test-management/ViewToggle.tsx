import { GridViewIcon, ListViewIcon } from '@/components/icons'
import { type TestManagementView } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

type ViewToggleProps = {
  value: TestManagementView
  onChange: (view: TestManagementView) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Switch view"
      className="flex items-center gap-2 rounded-lg bg-vess-grey-100 p-1"
    >
      <ToggleButton
        active={value === 'list'}
        label="List view"
        onClick={() => onChange('list')}
      >
        <ListViewIcon className="size-5" />
      </ToggleButton>
      <ToggleButton
        active={value === 'grid'}
        label="Grid view"
        onClick={() => onChange('grid')}
      >
        <GridViewIcon className="size-5" />
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
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex size-9 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-vess-primary-500 text-vess-grey-50'
          : 'text-vess-grey-500 hover:text-vess-grey-950',
      )}
    >
      {children}
    </button>
  )
}
