// Palette tokens → theme-aware colors. Raw hex passes through unchanged.

export type ThemeName = 'light' | 'dark'

type TokenColors = { fill: string; border: string; text: string }

const LIGHT: Record<string, TokenColors> = {
  slate:  { fill: '#f1f5f9', border: '#64748b', text: '#1e293b' },
  gray:   { fill: '#f3f4f6', border: '#6b7280', text: '#1f2937' },
  red:    { fill: '#fee2e2', border: '#ef4444', text: '#7f1d1d' },
  orange: { fill: '#ffedd5', border: '#f97316', text: '#7c2d12' },
  amber:  { fill: '#fef3c7', border: '#f59e0b', text: '#78350f' },
  yellow: { fill: '#fef9c3', border: '#eab308', text: '#713f12' },
  green:  { fill: '#dcfce7', border: '#22c55e', text: '#14532d' },
  teal:   { fill: '#ccfbf1', border: '#14b8a6', text: '#134e4a' },
  cyan:   { fill: '#cffafe', border: '#06b6d4', text: '#164e63' },
  blue:   { fill: '#dbeafe', border: '#3b82f6', text: '#1e3a8a' },
  indigo: { fill: '#e0e7ff', border: '#6366f1', text: '#312e81' },
  violet: { fill: '#ede9fe', border: '#8b5cf6', text: '#4c1d95' },
  purple: { fill: '#f3e8ff', border: '#a855f7', text: '#581c87' },
  pink:   { fill: '#fce7f3', border: '#ec4899', text: '#831843' },
  rose:   { fill: '#ffe4e6', border: '#f43f5e', text: '#881337' },
}

const DARK: Record<string, TokenColors> = {
  slate:  { fill: '#293548', border: '#94a3b8', text: '#e2e8f0' },
  gray:   { fill: '#2b3038', border: '#9ca3af', text: '#e5e7eb' },
  red:    { fill: '#4c1f1f', border: '#f87171', text: '#fecaca' },
  orange: { fill: '#4a2a12', border: '#fb923c', text: '#fed7aa' },
  amber:  { fill: '#453412', border: '#fbbf24', text: '#fde68a' },
  yellow: { fill: '#3f3a12', border: '#facc15', text: '#fef08a' },
  green:  { fill: '#14361f', border: '#4ade80', text: '#bbf7d0' },
  teal:   { fill: '#113632', border: '#2dd4bf', text: '#99f6e4' },
  cyan:   { fill: '#0e3440', border: '#22d3ee', text: '#a5f3fc' },
  blue:   { fill: '#1a2f4e', border: '#60a5fa', text: '#bfdbfe' },
  indigo: { fill: '#272a52', border: '#818cf8', text: '#c7d2fe' },
  violet: { fill: '#31254d', border: '#a78bfa', text: '#ddd6fe' },
  purple: { fill: '#371f4d', border: '#c084fc', text: '#e9d5ff' },
  pink:   { fill: '#431c30', border: '#f472b6', text: '#fbcfe8' },
  rose:   { fill: '#451a24', border: '#fb7185', text: '#fecdd3' },
}

export interface ElementStyle {
  fill?: string
  border?: string
  text?: string
  stroke?: string
  lineStyle?: 'solid' | 'dashed'
  arrow?: 'none' | 'end' | 'both'
}

const isHex = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)

export function resolveColor(
  value: string | undefined,
  role: keyof TokenColors,
  theme: ThemeName,
): string | undefined {
  if (!value) return undefined
  if (isHex(value)) return value
  const palette = theme === 'dark' ? DARK : LIGHT
  return palette[value]?.[role]
}

/** Default surface colors per theme. Dark is Neo-Kyoto night (design.md ground tokens). */
export function themeDefaults(theme: ThemeName) {
  return theme === 'dark'
    ? {
        canvasBg: '#10142b',
        cardBg: '#1b2038',
        cardBorder: '#3a4066',
        text: '#e8ecff',
        subtleText: '#9aa3c7',
        frameBg: 'rgba(255,255,255,0.02)',
        frameBorder: '#3a4066',
        edge: '#8a93bf',
        groupBg: 'rgba(255,255,255,0.03)',
      }
    : {
        canvasBg: '#f7f8fa',
        cardBg: '#ffffff',
        cardBorder: '#d3d9e3',
        text: '#1f2937',
        subtleText: '#6b7280',
        frameBg: 'rgba(0,0,0,0.015)',
        frameBorder: '#dde2ea',
        edge: '#7c8594',
        groupBg: 'rgba(0,0,0,0.03)',
      }
}

export function resolveBoardBackground(value: string | undefined, theme: ThemeName): string {
  if (!value) return themeDefaults(theme).canvasBg
  if (isHex(value)) return value
  return resolveColor(value, 'fill', theme) || themeDefaults(theme).canvasBg
}
