export const testQueryKeys = {
  all: ['tests'] as const,
  list: (accessToken: string | null, params?: unknown) =>
    [...testQueryKeys.all, 'list', accessToken, params] as const,
  detail: (accessToken: string | null, testId: string) =>
    [...testQueryKeys.all, 'detail', accessToken, testId] as const,
}
