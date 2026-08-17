import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { resolveColor, themeDefaults } from '../theme'

// Pixel glyphs, not emoji (Neo-Kyoto: signs, not stickers)
const TYPE_ICONS: Record<string, string> = {
  flowchart: '⊳', mindmap: '⁂', schema: '▤', note: '≡',
  table: '▦', timeline: '◆', quadrant: '◧',
}

export default memo(function WidgetFrame({ data }: NodeProps) {
  const { widget, theme } = data as any
  const td = themeDefaults(theme)
  const border = resolveColor(widget.style?.border, 'border', theme) || td.frameBorder
  const headerColor = resolveColor(widget.style?.text, 'text', theme) || td.subtleText
  return (
    <div className="widget-frame" style={{ borderColor: border, background: td.frameBg }}>
      <div className="widget-frame-title" style={{ color: headerColor }}>
        <span className="widget-type-icon">{TYPE_ICONS[widget.type] || '▢'}</span>
        {widget.title}
      </div>
    </div>
  )
})

export const GroupBox = memo(function GroupBox({ data }: NodeProps) {
  const { group, theme } = data as any
  const td = themeDefaults(theme)
  const border = resolveColor(group.style?.border, 'border', theme) || td.cardBorder
  const bg = resolveColor(group.style?.fill, 'fill', theme) || td.groupBg
  const color = resolveColor(group.style?.text, 'text', theme) || td.subtleText
  return (
    <div className="group-box" style={{ borderColor: border, background: bg }}>
      <div className="group-box-label" style={{ color }}>{group.label}</div>
    </div>
  )
})
