import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { elementColors, FlagBadge, SuggestionChip } from './common'

export default memo(function FlowNode({ data }: NodeProps) {
  const { node, theme } = data as any
  const c = elementColors(node.style, node.kind, theme)
  const shape = node.shape || 'process'

  const handles = (
    <>
      <Handle type="target" position={Position.Top} className="hidden-handle" />
      <Handle type="source" position={Position.Bottom} className="hidden-handle" />
      <Handle type="target" position={Position.Left} id="l" className="hidden-handle" />
      <Handle type="source" position={Position.Right} id="r" className="hidden-handle" />
    </>
  )

  if (shape === 'decision') {
    return (
      <div className="flow-node decision" style={{ opacity: c.opacity }}>
        {handles}
        <svg className="diamond-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
          <polygon
            points="50,1 99,30 50,59 1,30"
            fill={c.background}
            stroke={c.borderColor}
            strokeWidth={1.6}
            strokeDasharray={c.borderStyle === 'dashed' ? '5 3' : undefined}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="diamond-label" style={{ color: c.color }}>
          {node.label}
          <FlagBadge flag={node.flag} />
        </div>
        <SuggestionChip kind={node.kind} />
      </div>
    )
  }

  const radius = shape === 'start' || shape === 'end' ? 999 : shape === 'io' ? 3 : 8
  const skew = shape === 'io' ? 'skewX(-8deg)' : undefined
  return (
    <div
      className={`flow-node box ${shape}`}
      style={{
        background: c.background,
        borderColor: c.borderColor,
        borderStyle: c.borderStyle,
        color: c.color,
        opacity: c.opacity,
        borderRadius: radius,
        transform: skew,
      }}
    >
      {handles}
      <div style={{ transform: skew ? 'skewX(8deg)' : undefined }}>
        <span className="flow-label">{node.label}<FlagBadge flag={node.flag} /></span>
        {node.detail && <div className="flow-detail">{node.detail}</div>}
      </div>
      <SuggestionChip kind={node.kind} />
    </div>
  )
})
