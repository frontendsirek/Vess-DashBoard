import { forwardRef } from 'react'
import PhoneInput, { type Value } from 'react-phone-number-input'
import { cn } from '@/lib/utils'

const VessPhoneNumberField = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  function VessPhoneNumberField({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          'PhoneInputInput min-w-0 flex-1 border-0 bg-transparent text-[13px] text-vess-grey-950 placeholder:text-vess-grey-400 outline-none ring-0 focus:ring-0',
          className,
        )}
      />
    )
  },
)

export type VessPhoneInputProps = Omit<
  React.ComponentProps<typeof PhoneInput>,
  'inputComponent' | 'international' | 'onChange'
> &
  Partial<Pick<React.ComponentProps<typeof PhoneInput>, 'onChange'>> & {
    /** When omitted, VeSS default is Nigeria (product default). */
    defaultCountry?: React.ComponentProps<typeof PhoneInput>['defaultCountry']
  }

/**
 * International phone field styled with VeSS tokens (register device, future forms).
 * Root matches other fields: 50px row, grey-100 border, primary focus ring.
 */
export function VessPhoneInput({
  className,
  defaultCountry = 'NG',
  onChange,
  ...props
}: VessPhoneInputProps) {
  return (
    <PhoneInput
      international
      defaultCountry={defaultCountry}
      limitMaxLength
      inputComponent={VessPhoneNumberField}
      countryCallingCodeEditable={false}
      className={cn('vess-phone-field', className)}
      {...props}
      onChange={onChange ?? (() => undefined)}
    />
  )
}

export type { Value as PhoneInputValue }
