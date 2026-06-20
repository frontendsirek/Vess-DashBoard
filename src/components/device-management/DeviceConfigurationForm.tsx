import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { VessPhoneInput, type PhoneInputValue } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFormContext, useWatch } from 'react-hook-form'
import type { DeviceConfigurationFormValues } from '@/schemas/device/device-configuration-form.schema'
import { cn } from '@/lib/utils'
import { formatDeviceCoordinatesDisplay, registerDeviceGroupOptions } from '@/data/device-management'
import type { BrowserGeolocationState } from '@/hooks/use-browser-geolocation'

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

export type DeviceConfigurationGeolocationControls = {
  status: BrowserGeolocationState['status']
  errorMessage?: string
  latitude: number | null
  longitude: number | null
  onRequestPosition: () => void
}

/** Must render under `<Form {...useForm()}>` (`FormProvider`). */
export function DeviceConfigurationForm({
  mode = 'register',
  detectedLocationPreview,
  geolocationControls,
}: {
  /** Whether this form is used for registration or editing. Controls IMEI required state. */
  mode?: 'register' | 'edit'
  /**
   * Detected-location card contents: server-backed (edit) until the browser succeeds,
   * then parents usually replace this with formatted GPS coordinates.
   */
  detectedLocationPreview: DeviceConfigurationDetectedLocation | null
  geolocationControls: DeviceConfigurationGeolocationControls
}) {
  const { control, setValue } = useFormContext<DeviceConfigurationFormValues>()
  const locationMode = useWatch({ control, name: 'locationMode' }) ?? 'detected'
  const { status, errorMessage, latitude, longitude, onRequestPosition } = geolocationControls
  const hasCoords = latitude != null && longitude != null

  return (
    <div className="flex flex-col gap-8 rounded-2xl border-2 border-vess-grey-100 bg-vess-grey-50 px-4 py-6 md:px-6">
      <FormField
        control={control}
        name="deviceName"
        render={({ field }) => (
          <FormItem>
            <DeviceConfigurationFieldLabel required={false}>Device name</DeviceConfigurationFieldLabel>
            <FormControl>
              <input
                {...field}
                type="text"
                className={deviceConfigurationInputClass}
                placeholder="e.g. Lagos-Central-01"
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="text-[13px] font-normal text-vess-red-800" />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <DeviceConfigurationFieldLabel required={false}>Location</DeviceConfigurationFieldLabel>
          {locationMode === 'detected' ?
            status === 'loading' ?
              <div className="flex min-h-[101px] flex-col justify-center rounded-lg border border-vess-grey-200 bg-vess-grey-100 px-4 py-3">
                <p className="text-[15px] font-normal leading-[18px] text-vess-grey-950">Reading location…</p>
                <p className="mt-1 text-[13px] font-light leading-[18px] text-vess-grey-800">
                  Keep this browser tab in the foreground until we receive GPS.
                </p>
              </div>
            : detectedLocationPreview ?
              <div className="flex flex-col gap-2">
                <div className="flex min-h-[101px] flex-col justify-center gap-2 rounded-lg border border-vess-grey-200 bg-vess-grey-100 px-4 py-3">
                  <p className="text-[20px] font-medium leading-6 text-vess-grey-950">
                    {detectedLocationPreview.headline}
                  </p>
                  <div className="flex flex-wrap gap-6 text-[15px] leading-[18px] text-vess-grey-950">
                    <span className="font-light">{detectedLocationPreview.city}</span>
                    <span className="font-normal">{detectedLocationPreview.coordinates}</span>
                  </div>
                </div>
                {status === 'error' && errorMessage ?
                  <p className="text-[13px] font-normal leading-[18px] text-vess-red-800" role="alert">
                    {errorMessage} Tap "Use detected location" below to try again.
                  </p>
                : null}
              </div>
            : status === 'error' && errorMessage ?
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-vess-grey-300 bg-vess-grey-100 px-4 py-3">
                <p className="text-[13px] font-normal leading-[18px] text-vess-red-800" role="alert">
                  {errorMessage}
                </p>
                <p className="text-[15px] font-light leading-[18px] text-vess-grey-800">
                  Tap "Use detected location" below to retry.
                </p>
              </div>
            : <div className="flex min-h-[101px] flex-col justify-center rounded-lg border border-dashed border-vess-grey-300 bg-vess-grey-100 px-4 py-3">
                <p className="text-[15px] font-light leading-[18px] text-vess-grey-800">
                  No position captured yet. Tap "Use detected location" below - your browser will ask to share GPS.
                </p>
              </div>
          : <div className="flex flex-col gap-2">
              <FormField
                control={control}
                name="locationManual"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        type="text"
                        className={deviceConfigurationInputClass}
                        placeholder="Enter city or site"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage className="text-[13px] font-normal text-vess-red-800" />
                  </FormItem>
                )}
              />
              {hasCoords ?
                <p className="text-[13px] font-light leading-[18px] text-vess-grey-800">
                  GPS coordinates:{' '}
                  <span className="font-normal text-vess-grey-950">
                    {formatDeviceCoordinatesDisplay(latitude as number, longitude as number)}
                  </span>
                  . Tap "Use detected location" below to refresh from this computer.
                </p>
              : <p className="text-[13px] font-light leading-[18px] text-vess-grey-800">
                  Tap "Use detected location" below to capture GPS coordinates. This field is the location label only (it does not look up
                  coordinates).
                </p>}
            </div>
          }
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => {
              setValue('locationMode', 'detected', { shouldDirty: true, shouldValidate: true })
              void onRequestPosition()
            }}
            className={cn(
              'inline-flex h-12 items-center justify-center rounded-lg px-6 text-[15px] font-medium leading-[18px] transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              locationMode === 'detected'
                ? 'bg-vess-primary-500 text-vess-grey-50 hover:opacity-90'
                : 'border-2 border-vess-grey-100 bg-vess-grey-50 text-vess-grey-950 hover:bg-vess-grey-100',
            )}
          >
            Use detected location
          </button>
          <button
            type="button"
            onClick={() => setValue('locationMode', 'manual', { shouldDirty: true, shouldValidate: true })}
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
        <FormField
          control={control}
          name="deviceGroup"
          render={({ field }) => (
            <FormItem>
              <DeviceConfigurationFieldLabel required={false}>
                Device group (optional)
              </DeviceConfigurationFieldLabel>
              <Select
                value={field.value || DEVICE_CONFIG_GROUP_NONE}
                onValueChange={(v) => field.onChange(v === DEVICE_CONFIG_GROUP_NONE ? '' : v)}
              >
                <FormControl>
                  <SelectTrigger className="h-[50px] w-full rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4 text-[15px] font-normal text-vess-grey-950">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {registerDeviceGroupOptions.map((opt) => (
                    <SelectItem key={opt.value || 'none'} value={opt.value || DEVICE_CONFIG_GROUP_NONE}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[13px] font-normal text-vess-red-800" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="msisdn"
          render={({ field }) => (
            <FormItem>
              <DeviceConfigurationFieldLabel required={false}>MSISDN</DeviceConfigurationFieldLabel>
              <FormControl>
                <VessPhoneInput
                  value={field.value as PhoneInputValue | undefined}
                  onChange={(v) => field.onChange(v ?? '')}
                  placeholder="801 234 5678"
                  autoComplete="tel"
                />
              </FormControl>
              <FormMessage className="text-[13px] font-normal text-vess-red-800" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="imei"
        render={({ field }) => (
          <FormItem>
            <DeviceConfigurationFieldLabel required={mode === 'register'}>
              IMEI
            </DeviceConfigurationFieldLabel>
            <FormControl>
              <input
                {...field}
                type="text"
                inputMode="numeric"
                maxLength={15}
                className={deviceConfigurationInputClass}
                placeholder="e.g. 353456789012345"
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="text-[13px] font-normal text-vess-red-800" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <DeviceConfigurationFieldLabel required={false}>Tags (comma-operated)</DeviceConfigurationFieldLabel>
            <FormControl>
              <input
                {...field}
                type="text"
                className={deviceConfigurationInputClass}
                placeholder="lagos, tier-1, priority"
                autoComplete="off"
              />
            </FormControl>
            <FormMessage className="text-[13px] font-normal text-vess-red-800" />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-3">
        <DeviceConfigurationFieldLabel required={false}>Alert thresholds</DeviceConfigurationFieldLabel>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FormField
            control={control}
            name="lowBatteryPercent"
            render={({ field }) => (
              <FormItem>
                <DeviceConfigurationFieldLabelLight>Low battery (%)</DeviceConfigurationFieldLabelLight>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className={deviceConfigurationInputClass}
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      field.onChange(Number.isFinite(n) ? n : field.value)
                    }}
                  />
                </FormControl>
                <FormMessage className="text-[13px] font-normal text-vess-red-800" />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="offlineMinutes"
            render={({ field }) => (
              <FormItem>
                <DeviceConfigurationFieldLabelLight>Offline duration (minutes)</DeviceConfigurationFieldLabelLight>
                <FormControl>
                  <input
                    type="number"
                    min={1}
                    className={deviceConfigurationInputClass}
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(e) => {
                      const n = Number.parseInt(e.target.value, 10)
                      field.onChange(Number.isFinite(n) ? n : field.value)
                    }}
                  />
                </FormControl>
                <FormMessage className="text-[13px] font-normal text-vess-red-800" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}
