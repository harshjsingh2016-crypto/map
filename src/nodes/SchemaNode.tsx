import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { elementColors, FlagBadge, SuggestionChip } from './common'

export default memo(function SchemaNode({ data }: NodeProps) {
  const { node, theme } = data as any
  const c = elementColors(node.style, node.kind, theme)
  return (
    <div
      className="schema-node"
      style={{
        background: c.background,
        borderColor: c.borderColor,
        borderStyle: c.borderStyle,
        color: c.color,
        opacity: c.opacity,
      }}
    >
      <Handle type="target" position={Position.Left} className="hidden-handle" />
      <Handle type="source" position={Position.Right} className="hidden-handle" />
      <div className="schema-title" style={{ borderColor: c.borderColor }}>
        {node.label}
        <FlagBadge flag={node.flag} />
      </div>
      <div className="schema-fields">
        {(node.fields || []).map((f: any, i: number) => (
          <div key={i} className="schema-field">
            <span className="schema-key">{f.key === 'pk' ? '🔑' : f.key === 'fk' ? '↗' : ''}</span>
            <span>{f.name}</span>
            {f.type && <span className="schema-type">{f.type}</span>}
          </div>
        ))}
      </div>
      <SuggestionChip kind={node.kind} />
    </div>
  )
})
