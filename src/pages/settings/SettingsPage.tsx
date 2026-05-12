import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import {
  AlertsIcon,
  CloseIcon,
  SettingsIcon,
} from '@/components/icons'
import {
  teamMembers,
  notificationPreferences,
  thresholdSettings,
  type TeamMember,
  type NotificationPreference,
  type ThresholdSetting,
} from '@/data/alerts-mock'
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
            {active === 'notifications' && <NotificationsSettings />}
            {active === 'thresholds' && <ThresholdsSettings />}
            {active === 'security' && <SecuritySettings />}
          </section>
        </div>
      </div>
    </>
  )
}

function NotificationsSettings() {
  const [prefs, setPrefs] = useState(notificationPreferences)

  function toggleChannel(prefId: string, channel: 'email' | 'sms' | 'push') {
    setPrefs((prev) =>
      prev.map((p) =>
        p.id === prefId ? { ...p, [channel]: !p[channel] } : p,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
          Notification Preferences
        </h3>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Choose how you want to be notified for each event type
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead className="text-[13px] text-vess-grey-800">
            <tr className="border-b border-vess-grey-200">
              <th className="py-3 font-medium">Event</th>
              <th className="py-3 text-center font-medium">Email</th>
              <th className="py-3 text-center font-medium">SMS</th>
              <th className="py-3 text-center font-medium">Push</th>
            </tr>
          </thead>
          <tbody>
            {prefs.map((pref) => (
              <NotificationRow
                key={pref.id}
                pref={pref}
                onToggle={(channel) => toggleChannel(pref.id, channel)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NotificationRow({
  pref,
  onToggle,
}: {
  pref: NotificationPreference
  onToggle: (channel: 'email' | 'sms' | 'push') => void
}) {
  return (
    <tr className="border-b border-vess-grey-200/70">
      <td className="py-4">
        <p className="font-medium text-vess-grey-950">{pref.label}</p>
        <p className="mt-0.5 text-[12px] text-vess-grey-500">{pref.description}</p>
      </td>
      {(['email', 'sms', 'push'] as const).map((ch) => (
        <td key={ch} className="py-4 text-center">
          <button
            type="button"
            onClick={() => onToggle(ch)}
            aria-label={`Toggle ${ch} for ${pref.label}`}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
              pref[ch] ? 'bg-vess-green-500' : 'bg-vess-grey-300',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform',
                pref[ch] ? 'translate-x-[22px]' : 'translate-x-[2px]',
                'mt-[2px]',
              )}
            />
          </button>
        </td>
      ))}
    </tr>
  )
}

function ThresholdsSettings() {
  const [thresholds, setThresholds] = useState(thresholdSettings)

  function updateValue(thresholdId: string, newValue: number) {
    setThresholds((prev) =>
      prev.map((t) => (t.id === thresholdId ? { ...t, value: newValue } : t)),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">
          Alert Thresholds
        </h3>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Configure when alerts should be triggered based on device metrics
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {thresholds.map((threshold) => (
          <ThresholdCard
            key={threshold.id}
            threshold={threshold}
            onChange={(val) => updateValue(threshold.id, val)}
          />
        ))}
      </div>
    </div>
  )
}

function ThresholdCard({
  threshold,
  onChange,
}: {
  threshold: ThresholdSetting
  onChange: (value: number) => void
}) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[15px] font-semibold text-vess-grey-950">
            {threshold.label}
          </h4>
          <p className="mt-0.5 text-[13px] text-vess-grey-500">{threshold.description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-vess-grey-200 bg-vess-grey-50 px-3 py-1.5">
          <input
            type="number"
            value={threshold.value}
            min={threshold.min}
            max={threshold.max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 bg-transparent text-right text-[14px] font-medium text-vess-grey-950 outline-none"
          />
          <span className="text-[13px] text-vess-grey-500">{threshold.unit}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={threshold.min}
          max={threshold.max}
          value={threshold.value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-vess-grey-200 accent-vess-primary-500"
        />
        <span className="shrink-0 text-[12px] text-vess-grey-500">
          {threshold.min}–{threshold.max} {threshold.unit}
        </span>
      </div>
    </article>
  )
}

function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-[18px] font-semibold leading-6 text-vess-grey-950">Security</h3>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Manage your password and security preferences
        </p>
      </div>

      <div className="rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5">
        <h4 className="text-[15px] font-semibold text-vess-grey-950">Change Password</h4>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Update your password to keep your account secure
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          <button
            type="button"
            className="w-fit rounded-xl bg-vess-primary-500 px-6 py-2.5 text-[14px] font-medium text-vess-grey-50 transition-colors hover:bg-vess-primary-400"
          >
            Update Password
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5">
        <h4 className="text-[15px] font-semibold text-vess-grey-950">
          Two-Factor Authentication
        </h4>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Add an extra layer of security to your account
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-vess-green-50 px-2 py-0.5 text-[12px] font-medium text-vess-green-800">
              Enabled
            </span>
            <span className="text-[13px] text-vess-grey-800">
              Authenticator app configured
            </span>
          </div>
          <button
            type="button"
            className="rounded-lg border border-vess-grey-200 px-3 py-1.5 text-[13px] font-medium text-vess-grey-800 transition-colors hover:bg-vess-grey-100"
          >
            Reconfigure
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-vess-grey-200 bg-vess-grey-50 p-5">
        <h4 className="text-[15px] font-semibold text-vess-grey-950">Active Sessions</h4>
        <p className="mt-1 text-[13px] text-vess-grey-500">
          Manage devices where you&apos;re currently signed in
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <SessionRow
            device="Chrome on macOS"
            location="Lagos, Nigeria"
            lastActive="Now"
            current
          />
          <SessionRow
            device="Safari on iPhone"
            location="Lagos, Nigeria"
            lastActive="2 hours ago"
          />
          <SessionRow
            device="Firefox on Windows"
            location="Abuja, Nigeria"
            lastActive="3 days ago"
          />
        </div>
        <button
          type="button"
          className="mt-4 text-[13px] font-medium text-vess-red-500 transition-opacity hover:opacity-80"
        >
          Sign out all other sessions
        </button>
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-vess-grey-800">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-vess-grey-200 bg-vess-grey-50 px-4 py-2.5 text-[14px] text-vess-grey-950 outline-none transition-colors focus:border-vess-primary-500"
      />
    </div>
  )
}

function SessionRow({
  device,
  location,
  lastActive,
  current,
}: {
  device: string
  location: string
  lastActive: string
  current?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-vess-grey-200/60 bg-vess-grey-50 px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-medium text-vess-grey-950">{device}</p>
          {current && (
            <span className="rounded-md bg-vess-green-50 px-2 py-0.5 text-[11px] font-medium text-vess-green-800">
              Current
            </span>
          )}
        </div>
        <p className="text-[12px] text-vess-grey-500">
          {location} · {lastActive}
        </p>
      </div>
      {!current && (
        <button
          type="button"
          className="text-[13px] font-medium text-vess-red-500 transition-opacity hover:opacity-80"
        >
          Revoke
        </button>
      )}
    </div>
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
            placeholder="Search users..."
            className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-vess-grey-500"
          />
        </div>
        <FilterSelect label="Role" />
        <FilterSelect label="Status" />
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

function FilterSelect({ label }: { label: string }) {
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
