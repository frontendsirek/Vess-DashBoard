export const deviceQueryKeys = {
  all: ['devices'] as const,
  stats: (accessToken: string | null) =>
    [...deviceQueryKeys.all, 'stats', accessToken] as const,
  list: (accessToken: string | null, params: unknown) =>
    [...deviceQueryKeys.all, 'list', accessToken, params] as const,
  search: (accessToken: string | null, query: string) =>
    [...deviceQueryKeys.all, 'search', accessToken, query] as const,
  detail: (accessToken: string | null, deviceId: string) =>
    [...deviceQueryKeys.all, 'detail', accessToken, deviceId] as const,
  logs: (accessToken: string | null, deviceId: string, params: unknown) =>
    [...deviceQueryKeys.all, 'logs', accessToken, deviceId, params] as const,
  testHistory: (accessToken: string | null, deviceId: string, params: unknown) =>
    [...deviceQueryKeys.all, 'testHistory', accessToken, deviceId, params] as const,
  testSummary: (accessToken: string | null, deviceId: string) =>
    [...deviceQueryKeys.all, 'testSummary', accessToken, deviceId] as const,
  remoteSession: (accessToken: string | null, deviceId: string) =>
    [...deviceQueryKeys.all, 'remoteSession', accessToken, deviceId] as const,
}
