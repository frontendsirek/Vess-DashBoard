import { Toaster as Sonner } from 'sonner'
import { cn } from '@/lib/utils'

/** Global toast host — VeSS-aligned surfaces (design tokens via Tailwind `vess.*`). */
export function Toaster() {
  return (
    <Sonner
      position="top-right"
      closeButton
      visibleToasts={5}
      toastOptions={{
        classNames: {
          toast: cn(
            'rounded-xl border-2 border-vess-grey-200 bg-vess-grey-50 px-4 py-3 shadow-lg',
            '[&_[data-description]]:text-[11px] [&_[data-description]]:text-vess-grey-800',
          ),
          title: 'text-[13px] font-medium text-vess-grey-950',
          description: 'text-[11px] font-normal text-vess-grey-800',
          error: '!border-vess-red-200 !bg-vess-red-50 !text-red-500',
          success: '!border-vess-green-200 !bg-vess-green-50 !text-green-500',
          closeButton:
            '!border-vess-grey-200 !bg-vess-grey-50 text-vess-grey-950 hover:!bg-vess-grey-100',
        },
      }}
    />
  )
}
