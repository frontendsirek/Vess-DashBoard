import * as React from 'react'
import { cn } from '@/lib/utils'
import { type InputVariant } from './text-input'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  variant?: InputVariant
  className?: string
  disabled?: boolean
}

const variantStyles: Record<InputVariant, { box: string; boxChecked: string; label: string }> = {
  default: {
    box: 'border-input',
    boxChecked: 'border-primary bg-primary',
    label: 'text-foreground',
  },
  dark: {
    box: 'border-vess-primary-400',
    boxChecked: 'border-vess-secondary-500 bg-vess-secondary-500',
    label: 'text-vess-grey-50',
  },
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, label, variant = 'default', className, disabled }, ref) => {
    const styles = variantStyles[variant]

    return (
      <div className={cn('flex items-center gap-3', className)}>
        <button
          ref={ref}
          type="button"
          role="checkbox"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange(!checked)}
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            checked ? styles.boxChecked : styles.box,
          )}
        >
          {checked && (
            <svg
              className="size-3 text-white"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        {label && (
          <span className={cn('text-[13px] font-light leading-[18px]', styles.label)}>
            {label}
          </span>
        )}
      </div>
    )
  },
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
