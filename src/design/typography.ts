export const fontFamily = {
  sans: ["'Plus Jakarta Sans'", "system-ui", "'Segoe UI'", "Roboto", "sans-serif"] as const,
  heading: ["'Plus Jakarta Sans'", "system-ui", "'Segoe UI'", "Roboto", "sans-serif"] as const,
  mono: ["ui-monospace", "Consolas", "monospace"] as const,
}

export const fontSize = {
  /** Base body */
  base: "1.125rem",
  baseMobile: "1rem",
  /** Page / hero title */
  title: "3.5rem",
  titleMobile: "2.25rem",
  /** Section heading */
  heading: "1.5rem",
  headingMobile: "1.25rem",
  /** Inline code */
  code: "0.9375rem",
} as const

export const lineHeight = {
  body: "1.45",
  headingTight: "1.18",
  code: "1.35",
} as const

export const letterSpacing = {
  body: "0.18px",
  title: "-1.68px",
  titleMobile: "-0.05em",
  heading: "-0.24px",
} as const
