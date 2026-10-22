// A flowchart edge drawn along the route elk computed, not one React Flow re-routes.
// React Flow's own edges ignore everything elk decided about an edge: a link that skips
// a layer is redrawn as a fresh smoothstep from handle to handle and cuts straight
// through whatever sits in between, and its label lands at that path's midpoint
// instead of in the gap elk reserved. Here the points and the label box come from
// the layout, stored relative to the widget frame, and only the frame's live
// position is read from React Flow — so packing can still move the frame.
import { memo } from 'react'
import { BaseEdge, EdgeLabelRenderer, useInternalNode, type EdgeProps } from '@xyflow/react'

export type ElkEdgeData = {
  frameId: string
  points: { x: number; y: number }[]
  label?: { text: string; x: number; y: number; width: number; height: number }
  labelColors: { text: string; bg: string }
}

const CORNER = 6

// Orthogonal polyline with small rounded corners, the look smoothstep edges had.
function roundedPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i - 1], c = pts[i], n = pts[i + 1]
    const inLen = Math.hypot(c.x - p.x, c.y - p.y)
    const outLen = Math.hypot(n.x - c.x, n.y - c.y)
    const r = Math.min(CORNER, inLen / 2, outLen / 2)
    if (r < 0.5) { d += ` L ${c.x} ${c.y}`; continue }
    const a = { x: c.x - ((c.x - p.x) / inLen) * r, y: c.y - ((c.y - p.y) / inLen) * r }
    const b = { x: c.x + ((n.x - c.x) / outLen) * r, y: c.y + ((n.y - c.y) / outLen) * r }
    d += ` L ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`
  }
  const last = pts[pts.length - 1]
  return d + ` L ${last.x} ${last.y}`
}

function ElkEdge({ id, data, style, markerEnd, markerStart }: EdgeProps) {
  const d = data as ElkEdgeData
  const frame = useInternalNode(d.frameId)
  if (!frame) return null
  const { x: fx, y: fy } = frame.internals.positionAbsolute
  const path = roundedPath(d.points.map((p) => ({ x: p.x + fx, y: p.y + fy })))
  const l = d.label
  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} markerStart={markerStart} />
      {l && (
        <EdgeLabelRenderer>
          <div
            className="elk-edge-label nodrag nopan"
            style={{
              transform: `translate(${l.x + fx}px, ${l.y + fy}px)`,
              width: l.width,
              height: l.height,
              color: d.labelColors.text,
              background: d.labelColors.bg,
            }}
          >
            {l.text}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(ElkEdge)
