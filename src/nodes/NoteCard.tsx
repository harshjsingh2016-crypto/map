import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import ReactMarkdown from 'react-markdown'
import { resolveColor, themeDefaults } from '../theme'

export default memo(function NoteCard({ data }: NodeProps) {
  const { widget, theme } = data as any
  const td = themeDefaults(theme)
  // Dark default: an amber-lit window on the night facade (Neo-Kyoto warm relief)
  const bg = resolveColor(widget.style?.fill, 'fill', theme) || (theme === 'dark' ? '#2b2318' : '#fffbe8')
  const border = resolveColor(widget.style?.border, 'border', theme) || (theme === 'dark' ? '#a67534' : '#e6d999')
  const color = resolveColor(widget.style?.text, 'text', theme) || td.text
  return (
    <div className="note-card" style={{ background: bg, borderColor: border, color }}>
      <div className="card-title" style={{ color }}>
        <span className="widget-type-icon">≡</span>{widget.title}
      </div>
      <div className="note-content">
        <ReactMarkdown>{widget.content || '*…*'}</ReactMarkdown>
      </div>
    </div>
  )
})
