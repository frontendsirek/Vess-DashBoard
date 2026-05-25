import type { Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ConfigureFormValues } from '@/schemas/create-test/configure.schema'
import type { ApiDevice } from '@/types/device'

const NONE = '__none__'

const formMessageClassName = 'text-[13px] font-normal leading-[16px] text-vess-red-500'

type TestConfigureDeviceFormFieldProps = {
  control: Control<ConfigureFormValues>
  name: 'sourceDevice' | 'destinationDevice'
  label: string
  devices: ApiDevice[]
  isLoading?: boolean
  isError?: boolean
  loadErrorMessage?: string
  onCreateDevice: () => void
}

export function TestConfigureDeviceFormField({
  control,
  name,
  label,
  devices,
  isLoading = false,
  isError = false,
  loadErrorMessage = 'Could not load devices. Try again.',
  onCreateDevice,
}: TestConfigureDeviceFormFieldProps) {
  const selectPlaceholder = isLoading ? 'Loading devices…' : 'Select device'

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedMissing =
          Boolean(field.value) && !devices.some((device) => device.device_id === field.value)

        return (
          <FormItem className="flex w-full flex-col gap-3 space-y-0">
            <div className="flex flex-wrap items-start gap-1 text-[18px] font-normal leading-[21.6px]">
              <span className="text-vess-grey-950">{label}</span>
              <span className="text-vess-red-500">*</span>
            </div>
            <FormControl>
              <div className="flex flex-col gap-1.5">
                <Select
                  value={field.value ? field.value : NONE}
                  onValueChange={(value) => field.onChange(value === NONE ? '' : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{selectPlaceholder}</SelectItem>
                    {selectedMissing && field.value ?
                      <SelectItem value={field.value}>{field.value}</SelectItem>
                    : null}
                    {devices.map((device) => (
                      <SelectItem key={device.device_id} value={device.device_id}>
                        {device.device_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex h-[88px] flex-col items-center justify-center rounded-lg border-2 border-vess-grey-100 bg-vess-grey-50 px-4">
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[15px] font-light leading-[18px] text-vess-grey-500">
                    <span>No Device Found?</span>
                    <button
                      type="button"
                      onClick={onCreateDevice}
                      className="text-[15px] font-light text-vess-primary-500 underline decoration-solid"
                    >
                      Create New device
                    </button>
                  </div>
                </div>
              </div>
            </FormControl>
            {isError ?
              <p className={formMessageClassName} role="alert">
                {loadErrorMessage}
              </p>
            : null}
            <FormMessage className={formMessageClassName} />
          </FormItem>
        )
      }}
    />
  )
}
