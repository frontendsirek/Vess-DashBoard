import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VessPhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import { cn } from '@/lib/utils'
import { registerDeviceGroupOptions } from '@/data/device-management'

export const DEVICE_CONFIG_GROUP_NONE = '__none__'

export const deviceConfigurationInputClass =
  'h-[50px] w-full rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-[15px] text-vess-grey-950 placeholder:text-vess-grey-400 outline-none transition-colors focus:border-vess-primary-500 focus:ring-2 focus:ring-vess-primary-500/20'

export function DeviceConfigurationFieldLabel({
  children,
  required,
  className,
}: {
  children: string
  required?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px] text-vess-grey-950',
        className,
      )}
    >
      <span>{children}</span>
      {required && <span className="text-vess-red-500">*</span>}
    </div>
  )
}

export function DeviceConfigurationFieldLabelLight({ children }: { children: string }) {
  return (
    <span className="text-[15px] font-light leading-[18px] text-vess-grey-950">{children}</span>
  )
}

export type DeviceConfigurationDetectedLocation = {
  headline: string
  city: string
  coordinates: string
}

export type DeviceConfigurationFormProps = {
  deviceName: string
  onDeviceNameChange: (value: string) => void
  locationMode: 'detected' | 'manual'
  onLocationModeChange: (mode: 'detected' | 'manual') => void
  detectedLocation: DeviceConfigurationDetectedLocation
  locationManual: string
  onLocationManualChange: (value: string) => void
  deviceGroup: string
  onDeviceGroupChange: (value: string) => void
  msisdn: PhoneInputValue | undefined
  onMsisdnChange: (value: PhoneInputValue | undefined) => void
  tags: string
  onTagsChange: (value: string) => void
  lowBatteryPercent: number
  onLowBatteryPercentChange: (value: number) => void
  offlineMinutes: number
  onOfflineMinutesChange: (value: number) => void
}

export function DeviceConfigurationForm({
  deviceName,
  onDeviceNameChange,
  locationMode,
  onLocationModeChange,
  detectedLocation,
  locationManual,
  onLocationManualChange,
  deviceGroup,
  onDeviceGroupChange,
  msisdn,
  onMsisdnChange,
  tags,
  onTagsChange,
  lowBatteryPercent,
  onLowBatteryPercentChange,
  offlineMinutes,
  onOfflineMinutesChange,
}: DeviceConfigurationFormProps) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-3">
        <DeviceConfigurationFieldLabel required={false}>Device name</DeviceConfigurationFieldLabel>
        <input
          type="text"
          value={deviceName}
          onChange={(e) => onDeviceNameChange(e.target.value)}
          className={deviceConfigurationInputClass}
          placeholder="e.g. Lagos-Central-01"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <DeviceConfigurationFieldLabel required={false}>Location</DeviceConfigurationFieldLabel>
          {locationMode === 'detected' ? (
            <div className="flex h-[101px] flex-col justify-center gap-2 rounded-lg border border-vess-grey-200 bg-vess-grey-100 px-4 py-3">
              <p className="text-[20px] font-medium leading-6 text-vess-grey-950">
                {detectedLocation.headline}
              </p>
              <div className="flex flex-wrap gap-6 text-[15px] leading-[18px] text-vess-grey-950">
                <span className="font-light">{detectedLocation.city}</span>
                <span className="font-normal">{detectedLocation.coordinates}</span>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={locationManual}
              onChange={(e) => onLocationManualChange(e.target.value)}
              className={deviceConfigurationInputClass}
              placeholder="Enter city or site"
              autoComplete="off"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onLocationModeChange('detected')}
            className={cn(
              'inline-flex h-12 items-center justify-center rounded-lg px-6 text-[15px] font-medium leading-[18px] transition-colors',
              locationMode === 'detected'
                ? 'bg-vess-primary-500 text-vess-grey-50 hover:opacity-90'
                : 'border-2 border-vess-grey-100 bg-vess-grey-50 text-vess-grey-950 hover:bg-vess-grey-100',
            )}
          >
            Use detected location
          </button>
          <button
            type="button"
            onClick={() => onLocationModeChange('manual')}
            className={cn(
              'inline-flex h-12 items-center justify-center rounded-lg px-6 text-[15px] font-medium leading-[18px] transition-colors',
              locationMode === 'manual'
                ? 'bg-vess-primary-500 text-vess-grey-50 hover:opacity-90'
                : 'border-2 border-vess-grey-100 bg-vess-grey-50 text-vess-grey-950 hover:bg-vess-grey-100',
            )}
          >
            Enter manually
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <DeviceConfigurationFieldLabel required={false}>Device group (optional)</DeviceConfigurationFieldLabel>
          <Select
            value={deviceGroup || DEVICE_CONFIG_GROUP_NONE}
            onValueChange={(v) => onDeviceGroupChange(v === DEVICE_CONFIG_GROUP_NONE ? '' : v)}
          >
            <SelectTrigger className="h-[50px] w-full rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-[15px] font-normal text-vess-grey-950">
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {registerDeviceGroupOptions.map((opt) => (
                <SelectItem key={opt.value || 'none'} value={opt.value || DEVICE_CONFIG_GROUP_NONE}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3">
          <DeviceConfigurationFieldLabel required={false}>MSISDN</DeviceConfigurationFieldLabel>
          <VessPhoneInput
            value={msisdn}
            onChange={onMsisdnChange}
            placeholder="801 234 5678"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DeviceConfigurationFieldLabel required={false}>Tags (comma-operated)</DeviceConfigurationFieldLabel>
        <input
          type="text"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          className={deviceConfigurationInputClass}
          placeholder="lagos, tier-1, priority"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-3">
        <DeviceConfigurationFieldLabel required={false}>Alert thresholds</DeviceConfigurationFieldLabel>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <DeviceConfigurationFieldLabelLight>Low battery (%)</DeviceConfigurationFieldLabelLight>
            <input
              type="number"
              min={1}
              max={100}
              value={lowBatteryPercent}
              onChange={(e) => onLowBatteryPercentChange(Number(e.target.value) || 0)}
              className={deviceConfigurationInputClass}
            />
          </div>
          <div className="flex flex-col gap-3">
            <DeviceConfigurationFieldLabelLight>Offline duration (minutes)</DeviceConfigurationFieldLabelLight>
            <input
              type="number"
              min={1}
              value={offlineMinutes}
              onChange={(e) => onOfflineMinutesChange(Number(e.target.value) || 0)}
              className={deviceConfigurationInputClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
