import { resolveColor, themeDefaults, type ThemeName, type ElementStyle } from '../theme'

export function elementColors(style: ElementStyle | undefined, kind: string | undefined, theme: ThemeName) {
  const td = themeDefaults(theme)
  const suggestion = kind === 'suggestion'
  return {
    background: resolveColor(style?.fill, 'fill', theme) || td.cardBg,
    borderColor: resolveColor(style?.border, 'border', theme) || td.cardBorder,
    color: resolveColor(style?.text, 'text', theme) || td.text,
    borderStyle: suggestion ? ('dashed' as const) : ('solid' as const),
    opacity: suggestion ? 0.78 : 1,
  }
}

export function FlagBadge({ flag }: { flag?: { question: string } }) {
  if (!flag) return null
  return (
    <span className="flag-badge" title={flag.question}>
      ?
      <span className="flag-pop">{flag.question}</span>
    </span>
  )
}

export function SuggestionChip({ kind }: { kind?: string }) {
  if (kind !== 'suggestion') return null
  return <span className="suggestion-chip">suggestion</span>
}
