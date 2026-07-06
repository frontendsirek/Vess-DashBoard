import * as React from 'react'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type InputVariant } from './text-input'

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  required?: boolean
  error?: string
  variant?: InputVariant
}

const variantStyles: Record<InputVariant, { label: string; input: string; toggle: string; error: string }> = {
  default: {
    label: 'text-foreground',
    input:
      'border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
    toggle: 'text-muted-foreground hover:text-foreground',
    error: 'text-destructive',
  },
  dark: {
    label: 'text-vess-grey-50',
    input:
      'border-vess-primary-400 bg-vess-primary-600 text-vess-grey-50 placeholder:text-vess-grey-200/20 focus:border-vess-secondary-500',
    toggle: 'text-vess-grey-400 hover:text-vess-grey-50',
    error: 'text-vess-red-500',
  },
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, required, error, variant = 'default', id, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    const styles = variantStyles[variant]

    return (
      <div className="flex flex-col gap-3">
        {label && (
          <label
            htmlFor={inputId}
            className={cn('flex items-center gap-1 text-[16px] leading-[21.6px]', styles.label)}
          >
            {label}
            {required && (
              <span className={variant === 'dark' ? 'text-vess-red-500' : 'text-destructive'}>
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={cn(
              'h-[50px] w-full rounded-lg border px-4 pr-12 text-[13px] outline-none transition-colors',
              styles.input,
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 transition-colors',
              styles.toggle,
            )}
            aria-label={visible ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className={cn('text-[11px]', styles.error)} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
