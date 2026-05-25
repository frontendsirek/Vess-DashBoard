import { BellIcon } from '@/components/icons'
import { useProfileQuery } from '@/hooks/auth/use-profile-query'
import { useRouteTopbarMeta } from '@/hooks/use-route-topbar-meta'
import { userInitialsFromProfile, userRoleLabelFromProfile } from '@/lib/user-display'

export function Topbar() {
  const meta = useRouteTopbarMeta()
  const { data: profile } = useProfileQuery()

  if (!meta?.title) return null

  const userEmail = profile?.email ?? '—'
  const userInitials = userInitialsFromProfile(profile)
  const userRole = userRoleLabelFromProfile(profile)

  return (
    <header className="flex w-full items-center justify-between bg-vess-grey-50 px-5 py-5">
      <div className="flex flex-col justify-center gap-1.5">
        <h1 className="text-[20px] font-medium leading-[24px] text-vess-grey-950">
          {meta.title}
        </h1>
        {meta.subtitle ? (
          <p className="text-[13px] font-light leading-[15.6px] text-vess-grey-500">
            {meta.subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-[45px] items-center justify-center rounded-full bg-vess-grey-100 text-vess-grey-950 transition-colors hover:bg-vess-grey-200"
        >
          <BellIcon className="size-[22px]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex size-[45px] items-center justify-center rounded-full bg-vess-primary-500 text-[18px] font-medium leading-[21.6px] text-vess-grey-50">
            {userInitials}
          </div>
          <div className="flex flex-col items-start justify-center gap-1.5">
            <p className="text-[15px] font-medium leading-[18px] text-vess-grey-950">
              {userEmail}
            </p>
            <span className="rounded-full bg-vess-primary-50 px-1.5 py-1 text-[10px] font-normal leading-[12px] tracking-[0.4px] text-vess-primary-500">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
