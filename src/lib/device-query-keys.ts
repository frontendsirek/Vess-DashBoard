export const deviceQueryKeys = {
  all: ['devices'] as const,
  kpiCounts: (accessToken: string | null) =>
    [...deviceQueryKeys.all, 'kpi-counts', accessToken] as const,
  list: (accessToken: string | null, params: unknown) =>
    [...deviceQueryKeys.all, 'list', accessToken, params] as const,
  search: (accessToken: string | null, query: string) =>
    [...deviceQueryKeys.all, 'search', accessToken, query] as const,
  detail: (accessToken: string | null, deviceId: string) =>
    [...deviceQueryKeys.all, 'detail', accessToken, deviceId] as const,
}
