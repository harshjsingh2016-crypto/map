import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { resolveColor, themeDefaults } from '../theme'
import { elementColors, FlagBadge } from './common'

const CELLS: Array<'tl' | 'tr' | 'bl' | 'br'> = ['tl', 'tr', 'bl', 'br']

export default memo(function QuadrantCard({ data }: NodeProps) {
  const { widget, theme } = data as any
  const td = themeDefaults(theme)
  const border = resolveColor(widget.style?.border, 'border', theme) || td.cardBorder

  const item = (nid: string) => {
    const n = widget.nodes[nid]
    const c = elementColors(n.style, n.kind, theme)
    return (
      <div
        key={nid}
        className="quad-item"
        style={{
          background: c.background, borderColor: c.borderColor,
          borderStyle: c.borderStyle, color: c.color, opacity: c.opacity,
        }}
      >
        {n.label}
        <FlagBadge flag={n.flag} />
      </div>
    )
  }

  return (
    <div className="quadrant-card" style={{ background: td.cardBg, borderColor: border, color: td.text }}>
      <div className="card-title">
        <span className="widget-type-icon">◧</span>{widget.title}
      </div>
      <div className="quad-y-label" style={{ color: td.subtleText }}>{widget.axes.yLabel} →</div>
      <div className="quad-grid-wrap">
        <div className="quad-grid" style={{ borderColor: border }}>
          {CELLS.map((cell) => (
            <div key={cell} className={`quad-cell ${cell}`} style={{ borderColor: border }}>
              {widget.nodeOrder.filter((nid: string) => widget.nodes[nid].cell === cell).map(item)}
            </div>
          ))}
        </div>
      </div>
      <div className="quad-x-label" style={{ color: td.subtleText }}>{widget.axes.xLabel} →</div>
    </div>
  )
})
