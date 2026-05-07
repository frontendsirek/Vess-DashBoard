import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Menu, Moon, PanelRightClose, PanelRightOpen, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type ColorMode, themeHsl } from '@/design/colors'
import { apiClient } from '@/lib/axios-client'
import { applyThemeHslVariables, resolveInitialColorMode } from '@/lib/theme'
import { useUiStore } from '@/stores/ui-store'

type DemoUser = {
  id: number
  name: string
  email: string
}

const workspaceFormSchema = z.object({
  workspaceName: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(64, 'Name must be at most 64 characters.'),
})

type WorkspaceFormValues = z.infer<typeof workspaceFormSchema>

function App() {
  const sidebarOpen = useUiStore((state) => state.sidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const [colorMode, setColorMode] = useState<ColorMode>(() =>
    resolveInitialColorMode(),
  )

  useEffect(() => {
    applyThemeHslVariables(colorMode)
  }, [colorMode])

  const userQuery = useQuery({
    queryKey: ['demo-user'],
    queryFn: async () => {
      const { data } = await apiClient.get<DemoUser>(
        'https://jsonplaceholder.typicode.com/users/1',
      )
      return data
    },
  })

  const pingMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.get<DemoUser>(
        'https://jsonplaceholder.typicode.com/users/1',
      )
      return data
    },
  })

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceFormSchema),
    defaultValues: { workspaceName: '' },
  })

  function onWorkspaceSubmit(_values: WorkspaceFormValues) {
    form.reset({ workspaceName: '' })
  }

  function cycleTheme() {
    setColorMode((previous) => (previous === 'light' ? 'dark' : 'light'))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            onClick={toggleSidebar}
          >
            <Menu className="size-4" aria-hidden />
          </Button>
          <h1 className="font-heading text-lg font-semibold tracking-tight md:text-xl">
            Vess dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cycleTheme}
            aria-label={
              colorMode === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
            }
          >
            {colorMode === 'light' ? (
              <Moon className="mr-2 size-4" aria-hidden />
            ) : (
              <Sun className="mr-2 size-4" aria-hidden />
            )}
            Theme
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <PanelRightClose className="mr-2 size-4" aria-hidden />
            ) : (
              <PanelRightOpen className="mr-2 size-4" aria-hidden />
            )}
            Sidebar
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`border-r border-border bg-card transition-[width,opacity] duration-200 ease-out md:block ${
            sidebarOpen
              ? 'w-full max-w-[280px] px-4 py-6 opacity-100 md:w-64'
              : 'pointer-events-none w-0 max-w-0 overflow-hidden px-0 py-6 opacity-0 md:pointer-events-none md:w-0 md:px-0'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <p className="text-sm font-medium text-card-foreground">Navigation</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Place dashboard routes and modules here.
          </p>
        </aside>

        <main className="flex-1 space-y-6 p-4 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>TanStack Query + Axios</CardTitle>
                <CardDescription>
                  Sample request using the shared Axios instance (
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    src/lib/axios-client.ts
                  </code>
                  ).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading user…</p>
                ) : null}
                {userQuery.isError ? (
                  <p className="text-sm text-destructive" role="alert">
                    Could not load demo user.
                  </p>
                ) : null}
                {userQuery.data ? (
                  <div className="text-sm">
                    <p>
                      <span className="text-muted-foreground">Name: </span>
                      {userQuery.data.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Email: </span>
                      {userQuery.data.email}
                    </p>
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pingMutation.isPending}
                  onClick={() => pingMutation.mutate()}
                >
                  {pingMutation.isPending ? 'Refetching…' : 'Refetch via mutation'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zustand</CardTitle>
                <CardDescription>
                  Client UI state (persisted sidebar) lives in{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    src/stores/ui-store.ts
                  </code>
                  .
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Sidebar is{' '}
                  <span className="font-medium text-card-foreground">
                    {sidebarOpen ? 'open' : 'collapsed'}
                  </span>
                  .
                </p>
                <p className="text-muted-foreground">
                  Theme tokens are applied from{' '}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">
                    src/design/colors.ts
                  </code>{' '}
                  (
                  {Object.keys(themeHsl.light).length} HSL variables per mode).
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>React Hook Form</CardTitle>
              <CardDescription>
                Validated with Zod via{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  @hookform/resolvers
                </code>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(onWorkspaceSubmit)}
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="workspaceName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workspace name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Operations"
                            autoComplete="organization"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Shown for demo validation only; not sent to a server yet.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Save</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default App
