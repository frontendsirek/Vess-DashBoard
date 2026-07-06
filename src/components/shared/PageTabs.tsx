import { cn } from '@/lib/utils'

type PageTabsProps<T extends string> = {
  tabs: readonly { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
}

export function PageTabs<T extends string>({ tabs, active, onChange }: PageTabsProps<T>) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl bg-vess-grey-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-lg px-4 py-2 text-[12px] font-medium leading-[18px] transition-colors',
            active === tab.id
              ? 'bg-vess-primary-500 text-vess-grey-50'
              : 'text-vess-grey-800 hover:bg-vess-grey-200',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
