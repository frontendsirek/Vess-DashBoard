import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { applyThemeHslVariables, resolveInitialColorMode } from '@/lib/theme'
import { AppProviders } from '@/providers/app-providers'
import { router } from '@/router'
import '@/index.css'

applyThemeHslVariables(resolveInitialColorMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  </StrictMode>,
)
