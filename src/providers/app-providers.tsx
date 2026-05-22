import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode, useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { createQueryClient } from '@/lib/query-client'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      {import.meta.env.DEV ? (
        <ReactQueryDevtools
          buttonPosition="bottom-right"
          initialIsOpen={false}
        />
      ) : null}
    </QueryClientProvider>
  )
}
