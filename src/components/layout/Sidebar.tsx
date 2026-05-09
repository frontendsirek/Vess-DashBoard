import {
  AlertsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  DeviceIcon,
  LogoutIcon,
  MonitoringIcon,
  RemoteDeviceIcon,
  ReportsIcon,
  SettingsIcon,
  TestManagementIcon,
  VessLogoFull,
  VessLogoMark,
  VessLogoMark2,
} from '@/components/icons'
import { SidebarNavItem } from '@/components/layout/SidebarNavItem'
import { MobileAppCard } from '@/components/layout/MobileAppCard'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'

const primaryNav = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/test-management', label: 'Test Management', icon: TestManagementIcon },
  { to: '/device-management', label: 'Device Management', icon: DeviceIcon },
  { to: '/real-time-monitoring', label: 'Real-time Monitoring', icon: MonitoringIcon },
  { to: '/alerts', label: 'Alerts & Notifications', icon: AlertsIcon },
  { to: '/reports', label: 'Reports & Analytics', icon: ReportsIcon },
  { to: '/remote-device-control', label: 'Remote Device Control', icon: RemoteDeviceIcon },
] as const

const secondaryNav = [
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
  { to: '/logout', label: 'Logout', icon: LogoutIcon },
] as const

export function Sidebar() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col justify-between overflow-y-auto bg-vess-primary-500 px-4 py-8 transition-[width] duration-200 ease-out',
        sidebarOpen ? 'w-[300px]' : 'w-[88px]',
      )}
      aria-label="Primary"
    >
      <div className="flex flex-col gap-11">
        <div
          className={cn(
            'flex items-center',
            sidebarOpen ? 'justify-between' : 'flex-row justify-center items-start gap-4',
          )}
        >
          {sidebarOpen ? (
            <VessLogoFull className="h-[22px] w-[74px] text-vess-grey-50" />
          ) : (
            <VessLogoMark className="size-8 text-vess-secondary-500" />
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="flex size-[22px] items-center justify-center rounded-md text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
          >
            {sidebarOpen ? (
              <ChevronLeftIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {primaryNav.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={!sidebarOpen}
              end={'end' in item ? item.end : undefined}
            />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-5">
        <nav className="flex flex-col gap-3">
          {secondaryNav.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              collapsed={!sidebarOpen}
            />
          ))}
        </nav>
        {sidebarOpen ? (
          <MobileAppCard />
        ) : (
          <div className="flex w-full justify-center">
            <div className="flex size-[50px] items-center py-10 px-8 justify-center rounded-md bg-vess-primary-400">
              <VessLogoMark2 className="size-10" />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
