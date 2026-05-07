import {
  useCallback,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'

interface OtpInputProps {
  length?: number
  onChange: (value: string) => void
}

export function OtpInput({ length = 6, onChange }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(() => Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus()
      }
    },
    [length],
  )

  const updateValues = useCallback(
    (newValues: string[]) => {
      setValues(newValues)
      onChange(newValues.join(''))
    },
    [onChange],
  )

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d?$/.test(char)) return
      const newValues = [...values]
      newValues[index] = char
      updateValues(newValues)
      if (char && index < length - 1) {
        focusInput(index + 1)
      }
    },
    [values, length, focusInput, updateValues],
  )

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        const newValues = [...values]
        if (!values[index] && index > 0) {
          focusInput(index - 1)
          newValues[index - 1] = ''
        } else {
          newValues[index] = ''
        }
        updateValues(newValues)
      } else if (e.key === 'ArrowLeft' && index > 0) {
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        focusInput(index + 1)
      }
    },
    [values, length, focusInput, updateValues],
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (!pasted) return
      const newValues = [...values]
      for (let i = 0; i < pasted.length; i++) {
        newValues[i] = pasted[i]
      }
      updateValues(newValues)
      focusInput(Math.min(pasted.length, length - 1))
    },
    [values, length, focusInput, updateValues],
  )

  return (
    <div className="flex w-full items-start gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="h-[56px] w-0 flex-1 rounded-lg border-2 border-vess-primary-400 bg-vess-primary-600 text-center text-[24px] font-semibold text-vess-grey-50 outline-none transition-colors focus:border-vess-secondary-500 sm:h-[73px]"
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  )
}
