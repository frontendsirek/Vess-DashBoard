/**
 * Canonical color tokens. HSL triples (space-separated, no `hsl()`) feed CSS variables
 * for Tailwind + shadcn-style components. Hex mirrors are for non-Tailwind use (e.g. charts).
 */
export const colors = {
  light: {
    text: '#6b6375',
    textHeading: '#08060d',
    background: '#ffffff',
    codeBackground: '#f4f3ec',
    accent: '#aa3bff',
    accentBackground: 'rgba(170, 59, 255, 0.1)',
    accentBorder: 'rgba(170, 59, 255, 0.5)',
    socialBackground: 'rgba(244, 243, 236, 0.5)',
    border: '#e5e4e7',
  },
  dark: {
    text: '#9ca3af',
    textHeading: '#f3f4f6',
    background: '#16171d',
    codeBackground: '#1f2028',
    accent: '#c084fc',
    accentBackground: 'rgba(192, 132, 252, 0.15)',
    accentBorder: 'rgba(192, 132, 252, 0.5)',
    socialBackground: 'rgba(47, 48, 58, 0.5)',
    border: '#2e303a',
  },
} as const

/** HSL values for `hsl(var(--token) / <alpha-value>)` in Tailwind */
export const themeHsl = {
  light: {
    background: '0 0% 100%',
    foreground: '260 29% 4%',
    card: '0 0% 100%',
    cardForeground: '260 29% 4%',
    popover: '0 0% 100%',
    popoverForeground: '260 29% 4%',
    primary: '274 100% 55%',
    primaryForeground: '0 0% 100%',
    secondary: '48 20% 94%',
    secondaryForeground: '260 29% 4%',
    muted: '48 20% 94%',
    mutedForeground: '265 8% 43%',
    accent: '48 20% 94%',
    accentForeground: '260 29% 4%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
    border: '280 5% 90%',
    input: '280 5% 90%',
    ring: '274 100% 55%',
  },
  dark: {
    background: '235 11% 10%',
    foreground: '220 14% 96%',
    card: '235 11% 10%',
    cardForeground: '220 14% 96%',
    popover: '235 11% 10%',
    popoverForeground: '220 14% 96%',
    primary: '270 95% 75%',
    primaryForeground: '235 11% 10%',
    secondary: '235 10% 15%',
    secondaryForeground: '220 14% 96%',
    muted: '235 10% 15%',
    mutedForeground: '218 11% 65%',
    accent: '235 10% 15%',
    accentForeground: '220 14% 96%',
    destructive: '0 72% 71%',
    destructiveForeground: '235 11% 10%',
    border: '235 10% 19%',
    input: '235 10% 19%',
    ring: '270 95% 75%',
  },
} as const

export type ColorMode = keyof typeof themeHsl
