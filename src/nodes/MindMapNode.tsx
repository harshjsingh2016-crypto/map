import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { elementColors, FlagBadge, SuggestionChip } from './common'
import { useMapStore } from '../store'

export default memo(function MindMapNode({ id, data }: NodeProps) {
  const { node, theme, collapsed, hiddenCount, hasChildren, isRoot } = data as any
  const toggleCollapsed = useMapStore((s) => s.toggleCollapsed)
  const c = elementColors(node.style, node.kind, theme)

  return (
    <div
      className={`mind-node ${isRoot ? 'root' : ''}`}
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
      <span className="mind-label">
        {node.label}
        <FlagBadge flag={node.flag} />
      </span>
      {node.detail && <div className="flow-detail">{node.detail}</div>}
      {hasChildren && (
        <button
          className="collapse-toggle"
          title={collapsed ? `expand (${hiddenCount} hidden)` : 'collapse branch'}
          onClick={(e) => { e.stopPropagation(); toggleCollapsed(id, collapsed) }}
        >
          {collapsed ? `+${hiddenCount}` : '–'}
        </button>
      )}
      <SuggestionChip kind={node.kind} />
    </div>
  )
})
