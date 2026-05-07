import { type ColorMode, themeHsl } from '@/design/colors'

const cssVarMap: Record<keyof (typeof themeHsl)['light'], string> = {
  background: '--background',
  foreground: '--foreground',
  card: '--card',
  cardForeground: '--card-foreground',
  popover: '--popover',
  popoverForeground: '--popover-foreground',
  primary: '--primary',
  primaryForeground: '--primary-foreground',
  secondary: '--secondary',
  secondaryForeground: '--secondary-foreground',
  muted: '--muted',
  mutedForeground: '--muted-foreground',
  accent: '--accent',
  accentForeground: '--accent-foreground',
  destructive: '--destructive',
  destructiveForeground: '--destructive-foreground',
  border: '--border',
  input: '--input',
  ring: '--ring',
}

export function applyThemeHslVariables(mode: ColorMode) {
  const tokens = themeHsl[mode]
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  for (const key of Object.keys(cssVarMap) as (keyof typeof tokens)[]) {
    const varName = cssVarMap[key]
    root.style.setProperty(varName, tokens[key])
  }
}

/** Match `prefers-color-scheme` for initial paint before user preference exists. */
export function resolveInitialColorMode(): ColorMode {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
