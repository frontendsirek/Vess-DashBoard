import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { applyThemeHslVariables, resolveInitialColorMode } from '@/lib/theme'
import { AppProviders } from '@/providers/app-providers'
import App from '@/App'
import '@/index.css'

applyThemeHslVariables(resolveInitialColorMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
