import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputVariant = 'default' | 'dark'

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  required?: boolean
  error?: string
  variant?: InputVariant
}

const variantStyles: Record<InputVariant, { wrapper: string; label: string; input: string; error: string }> = {
  default: {
    wrapper: '',
    label: 'text-foreground',
    input:
      'border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
    error: 'text-destructive',
  },
  dark: {
    wrapper: '',
    label: 'text-vess-grey-50',
    input:
      'border-vess-primary-400 bg-vess-primary-600 text-vess-grey-50 placeholder:text-vess-grey-200/20 focus:border-vess-secondary-500',
    error: 'text-vess-red-500',
  },
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, required, error, variant = 'default', id, ...props }, ref) => {
    const inputId = id ?? React.useId()
    const styles = variantStyles[variant]

    return (
      <div className={cn('flex flex-col gap-3', styles.wrapper)}>
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
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-[50px] w-full rounded-lg border px-4 text-[13px] outline-none transition-colors',
            styles.input,
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className={cn('text-[11px]', styles.error)} role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
TextInput.displayName = 'TextInput'

export { TextInput }
