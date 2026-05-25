import '@tanstack/react-query'

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Skip global Sonner `toast.error` from `createQueryClient` */
      suppressErrorToast?: boolean
      /** Override default mutation error toast copy */
      errorFallback?: string
    }
    queryMeta: {
      /** Opt in: show Sonner `toast.error` when this query fails */
      toastOnError?: boolean
    }
  }
}
