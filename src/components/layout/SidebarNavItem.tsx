import { type ComponentType, type SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>

type SidebarNavItemProps = {
  icon: IconComponent
  label: string
  to: string
  collapsed?: boolean
  end?: boolean
}

export function SidebarNavItem({
  icon: Icon,
  label,
  to,
  collapsed = false,
  end,
}: SidebarNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center rounded-lg px-4 py-3 transition-colors',
          collapsed ? 'justify-center' : 'gap-4',
          isActive
            ? 'bg-vess-primary-400 text-vess-grey-50'
            : 'text-vess-grey-500 hover:bg-vess-primary-400/40 hover:text-vess-grey-50',
        )
      }
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
    >
      <Icon className="size-[25px]" aria-hidden />
      {!collapsed && (
        <span className="text-[18px] font-medium leading-[21.6px] whitespace-nowrap">
          {label}
        </span>
      )}
    </NavLink>
  )
}
