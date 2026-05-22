import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatApiMutationError } from '@/lib/format-api-mutation-error'

/**
 * TanStack Query client with shared Sonner toasts:
 * - **Mutations**: `toast.error` on failure unless `meta: { suppressErrorToast: true }`
 * - **Queries**: `toast.error` only when `meta: { toastOnError: true }`
 */
export function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.options.meta?.suppressErrorToast) return
        const msg = formatApiMutationError(error)
        toast.error(msg.trim().length > 0 ? msg : 'Something went wrong. Please try again.')
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!query.meta?.toastOnError) return
        const msg = formatApiMutationError(error)
        toast.error(msg.trim().length > 0 ? msg : 'Something went wrong. Please try again.')
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
