import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { resolveColor, themeDefaults } from '../theme'
import { elementColors, FlagBadge } from './common'

export default memo(function TimelineCard({ data }: NodeProps) {
  const { widget, theme } = data as any
  const td = themeDefaults(theme)
  const border = resolveColor(widget.style?.border, 'border', theme) || td.cardBorder
  const items = [...widget.nodeOrder].sort(
    (a: string, b: string) => (widget.nodes[a].order ?? 1e9) - (widget.nodes[b].order ?? 1e9),
  )
  return (
    <div className="timeline-card" style={{ background: td.cardBg, borderColor: border, color: td.text }}>
      <div className="card-title">
        <span className="widget-type-icon">◆</span>{widget.title}
      </div>
      <div className="timeline-track">
        <div className="timeline-line" style={{ background: border }} />
        {items.map((nid: string) => {
          const n = widget.nodes[nid]
          const c = elementColors(n.style, n.kind, theme)
          return (
            <div key={nid} className="timeline-item" style={{ opacity: c.opacity }}>
              {n.marker && <div className="timeline-marker" style={{ color: td.subtleText }}>{n.marker}</div>}
              <div className="timeline-dot" style={{ background: c.borderColor }} />
              <div
                className="timeline-label"
                style={{
                  background: c.background, borderColor: c.borderColor,
                  borderStyle: c.borderStyle, color: c.color,
                }}
              >
                {n.label}
                <FlagBadge flag={n.flag} />
                {n.kind === 'suggestion' && <span className="suggestion-chip inline">suggestion</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
