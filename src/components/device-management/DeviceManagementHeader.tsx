import { RegisterDeviceAddIcon } from '@/components/icons'

type DeviceManagementHeaderProps = {
  onRegisterDevice?: () => void
}

export function DeviceManagementHeader({ onRegisterDevice }: DeviceManagementHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[31px] font-medium leading-[37.2px] text-vess-grey-950">Device Management</h1>
      <button
        type="button"
        onClick={onRegisterDevice}
        className="inline-flex items-center gap-2 rounded-xl bg-vess-primary-500 px-4 py-3 text-[15px] font-medium leading-[18px] text-vess-grey-50 transition-opacity hover:opacity-90"
      >
        <RegisterDeviceAddIcon className="size-5" />
        <span>Register Device</span>
      </button>
    </div>
  )
}
