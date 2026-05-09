import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import {
  AlertsIcon,
  CloseIcon,
  SettingsIcon,
} from '@/components/icons'
import { teamMembers, type TeamMember } from '@/data/alerts-mock'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'notifications', label: 'Notifications', icon: AlertsIcon },
  { id: 'thresholds', label: 'Alert Thresholds', icon: SettingsIcon },
  { id: 'users', label: 'User Management', icon: SettingsIcon },
  { id: 'security', label: 'Security', icon: SettingsIcon },
] as const

type SectionId = (typeof sections)[number]['id']

export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('users')

  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Configure notifications, thresholds, and system preferences"
      />

      <div className="flex flex-col gap-6 px-5 py-6">
        <header className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-[24px] font-semibold leading-[30px] text-vess-grey-950">
              Settings
            </h2>
            <p className="text-[13px] font-light text-vess-grey-800">
              Configure notifications, thresholds, and system preferences
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-vess-primary-500 px-4 py-2.5 text-[14px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
          >
            Save changes
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav className="flex flex-col gap-2 rounded-2xl bg-vess-grey-50 p-3">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = s.id === active
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActive(s.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-vess-grey-100 text-vess-grey-950'
                      : 'text-vess-grey-800 hover:bg-vess-grey-100/60',
                  )}
                >
                  <Icon className="size-5" />
                  {s.label}
                </button>
              )
            })}
          </nav>

          <section className="rounded-2xl bg-vess-grey-50 p-6">
            {active === 'users' && <UserManagement />}
            {active === 'notifications' && <Placeholder title="Notifications" />}
            {active === 'thresholds' && <Placeholder title="Alert Thresholds" />}
            {active === 'security' && <Placeholder title="Security" />}
          </section>
        </div>
      </div>
    </>
  )
}

function UserManagement() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
          User Management
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-vess-primary-500 px-4 py-2 text-[13px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
        >
          + Invite users
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3 py-2">
          <input
            placeholder="Search devices....."
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-vess-grey-500"
          />
        </div>
        <Select label="Role" />
        <Select label="Status" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="text-[13px] text-vess-grey-800">
            <tr className="border-b border-vess-grey-200">
              <th className="py-3 font-medium">User</th>
              <th className="py-3 font-medium">Role</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Last login</th>
              <th className="py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRow({ user }: { user: TeamMember }) {
  const isActive = user.status === 'Active'
  return (
    <tr className="border-b border-vess-grey-200/70">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-vess-primary-500 text-[12px] font-medium text-vess-grey-50">
            {user.initials}
          </div>
          <div>
            <p className="font-medium text-vess-grey-950">{user.name}</p>
            <p className="text-[12px] text-vess-grey-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-[13px] tracking-[0.4px] text-vess-grey-800">{user.role}</td>
      <td className="py-4">
        <span
          className={cn(
            'rounded-md px-2 py-0.5 text-[12px] font-medium',
            isActive
              ? 'bg-vess-green-50 text-vess-green-800'
              : 'bg-vess-red-50 text-vess-red-500',
          )}
        >
          {user.status}
        </span>
      </td>
      <td className="py-4 text-vess-grey-800">{user.lastLogin}</td>
      <td className="py-4">
        <button
          type="button"
          aria-label={`Remove ${user.name}`}
          className="text-vess-grey-500 transition-colors hover:text-vess-red-500"
        >
          <CloseIcon className="size-4" />
        </button>
      </td>
    </tr>
  )
}

function Select({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-3 py-2 text-[13px] font-medium text-vess-grey-800"
    >
      {label}
      <span aria-hidden>▾</span>
    </button>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-[16px] font-medium text-vess-grey-950">{title}</p>
      <p className="text-[13px] text-vess-grey-500">Coming next.</p>
    </div>
  )
}
