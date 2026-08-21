// Per-widget elkjs layout + board-level shelf packing → React Flow nodes/edges.
// Deterministic: same board state always yields the same layout, which is the
// backbone of position stability (unchanged structure → unchanged positions);
// changed positions animate via CSS transitions on the node transform.
import ELK from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'
import { MarkerType } from '@xyflow/react'
import { resolveColor, themeDefaults, type ThemeName } from './theme'

const elk = new ELK()

const FRAME_PAD = 22
const FRAME_TITLE = 40
const ROW_MAX_WIDTH = 2300
const PACK_GAP = 110

const textW = (s: string) => (s?.length || 0) * 7.2

// Height added by wrapped `detail` text at a given node width. Detail renders
// ~2px smaller than the label, so it fits a few more characters per line.
function detailHeight(detail: string | undefined, width: number) {
  if (!detail) return 0
  const perLine = Math.max(12, Math.floor((width - 22) / 5.6))
  return Math.ceil(detail.length / perLine) * 14 + 4
}

// Lines the `label` wraps to at a given node width. The label renders at 12px
// with 1.25 line-height inside ~10px side padding and a 2px border, so a box
// sized for one line hides the rest — text overflows the frame and ends up
// under the suggestion chip and the collapse toggle.
function labelLines(label: string | undefined, width: number, pad: number) {
  const perLine = Math.max(8, Math.floor((width - pad) / 7.2))
  return Math.max(1, Math.ceil((label?.length || 0) / perLine))
}

// Edge labels draw as an 11px monospace `<text>` (0.6em advance) sitting in a
// 5x3-padded background box. elk reserves no room for a label it has not been
// given dimensions for, so long ones ended up drawn over the nodes around them
// — measure them the way the renderer will and hand elk the size.
const EDGE_LABEL_CHAR = 6.6
const EDGE_LABEL_LINE = 13.2
const EDGE_LABEL_PAD = { x: 5, y: 3 }

function elkEdgeLabels(label: string | undefined) {
  if (!label) return {}
  return {
    labels: [{
      text: label,
      width: label.length * EDGE_LABEL_CHAR + EDGE_LABEL_PAD.x * 2,
      height: EDGE_LABEL_LINE + EDGE_LABEL_PAD.y * 2,
    }],
  }
}

// React Flow draws the label centred on its own path midpoint, so ask elk to
// reserve the space the same way. Note this buys clearance, not placement: RF
// re-routes every edge itself and ignores elk's label coordinates, so a label
// still lands wherever RF's midpoint falls inside the space elk opened up.
const EDGE_LABEL_OPTS = {
  'elk.edgeLabels.placement': 'CENTER',
  'elk.edgeLabels.inline': 'true',
  'elk.spacing.edgeLabel': '4',
}

function flowNodeSize(n: any) {
  if (n.shape === 'decision') {
    const w = Math.min(Math.max(textW(n.label) * 0.8 + 70, 150), 240)
    return { width: w, height: 84 }
  }
  const wantsWide = n.detail ? Math.max(textW(n.label) + 36, 210) : textW(n.label) + 36
  const base = Math.min(Math.max(wantsWide, 130), 260)
  if (n.shape === 'start' || n.shape === 'end') return { width: Math.max(base * 0.8, 110), height: 42 }
  const labelH = (labelLines(n.label, base, 26) - 1) * 16
  return { width: base, height: 40 + labelH + detailHeight(n.detail, base) || 46 }
}

function mindNodeSize(n: any) {
  // With a definition attached, widen first so the text wraps a couple of
  // lines rather than into a tall ribbon.
  const wantsWide = n.detail ? Math.max(textW(n.label) + 30, 230) : textW(n.label) + 30
  const width = Math.min(Math.max(wantsWide, 90), 270)
  // Base heights below are the one-line values (15 + 15 = 30, 23 + 15 = 38);
  // extra lines grow the box instead of overflowing it.
  const labelH = labelLines(n.label, width, 24) * 15
  const height = n.detail ? 15 + labelH + detailHeight(n.detail, width) : 23 + labelH
  return { width, height }
}

function schemaNodeSize(n: any) {
  const fieldW = Math.max(...(n.fields || []).map((f: any) => textW(`${f.name} ${f.type || ''}`) + 50), textW(n.label) + 40, 160)
  return { width: Math.min(fieldW, 280), height: 38 + (n.fields?.length || 0) * 22 + 8 }
}

function cardSize(w: any): { width: number; height: number } {
  if (w.type === 'note') {
    const len = w.content?.length || 0
    const lines = (w.content?.match(/\n/g)?.length || 0) + Math.ceil(len / 46)
    return { width: 380, height: Math.min(Math.max(90 + lines * 21, 120), 640) }
  }
  if (w.type === 'table') {
    const cols: any[] = w.columns || []
    const colWidths = cols.map((c) => {
      let m = textW(c.label) + 28
      for (const rid of w.rowOrder) {
        const v = w.rows[rid]?.cells?.[c.id]?.value
        m = Math.max(m, textW(String(v ?? '')) + 28)
      }
      return Math.min(Math.max(m, 90), 230)
    })
    const width = Math.min(Math.max(colWidths.reduce((a, b) => a + b, 0) + 26, 300), 950)
    return { width, height: Math.min(66 + w.rowOrder.length * 37, 620) }
  }
  if (w.type === 'timeline') {
    const n = w.nodeOrder.length
    return { width: Math.min(Math.max(n * 200 + 70, 440), 1500), height: 210 }
  }
  if (w.type === 'quadrant') return { width: 580, height: 480 }
  return { width: 380, height: 200 }
}

interface WidgetLayout {
  size: { width: number; height: number }
  nodes: Node[]
  edges: Edge[]
}

function edgeStyleProps(e: any, theme: ThemeName, defaultColor: string) {
  const stroke = resolveColor(e.style?.stroke, 'border', theme) || defaultColor
  const arrow = e.style?.arrow || 'end'
  const dashed = e.style?.lineStyle === 'dashed' || e.kind === 'suggestion'
  return {
    style: {
      stroke,
      strokeWidth: 1.6,
      strokeDasharray: dashed ? '6 4' : undefined,
      opacity: e.kind === 'suggestion' ? 0.65 : 1,
    },
    markerEnd: arrow === 'none' ? undefined : { type: MarkerType.ArrowClosed, color: stroke, width: 17, height: 17 },
    markerStart: arrow === 'both' ? { type: MarkerType.ArrowClosed, color: stroke, width: 17, height: 17 } : undefined,
  }
}

async function layoutGraphWidget(w: any, theme: ThemeName, viewCollapsed: Record<string, boolean>): Promise<WidgetLayout> {
  const td = themeDefaults(theme)
  const frameId = `f:${w.id}`

  if (w.type === 'mindmap') {
    // Effective collapse = local view toggle overriding the op-set value.
    const effCollapsed = (nid: string) => viewCollapsed[`n:${w.id}:${nid}`] ?? !!w.nodes[nid].collapsed
    const childrenOf = (pid: string | null) => w.nodeOrder.filter((nid: string) => (w.nodes[nid].parentId || null) === pid)
    const visible = new Set<string>()
    const hiddenCount: Record<string, number> = {}
    const countDesc = (nid: string): number =>
      childrenOf(nid).reduce((acc: number, c: string) => acc + 1 + countDesc(c), 0)
    const walk = (pid: string | null) => {
      for (const nid of childrenOf(pid)) {
        visible.add(nid)
        if (effCollapsed(nid)) hiddenCount[nid] = countDesc(nid)
        else walk(nid)
      }
    }
    walk(null)

    const children = [...visible].map((nid) => ({ id: nid, ...mindNodeSize(w.nodes[nid]) }))
    const elkEdges = [...visible]
      .filter((nid) => w.nodes[nid].parentId && visible.has(w.nodes[nid].parentId))
      .map((nid) => ({ id: `me_${nid}`, sources: [w.nodes[nid].parentId], targets: [nid] }))
    const g = await elk.layout({
      id: w.id,
      layoutOptions: {
        'elk.algorithm': 'mrtree',
        'elk.direction': 'RIGHT',
        // Nodes carrying a `detail` body are much taller than bare labels,
        // so siblings need real breathing room or branches crowd each other.
        'elk.spacing.nodeNode': '54',
      },
      children,
      edges: elkEdges,
    })
    const nodes: Node[] = (g.children || []).map((c: any) => ({
      id: `n:${w.id}:${c.id}`,
      type: 'mindNode',
      position: { x: c.x + FRAME_PAD, y: c.y + FRAME_PAD + FRAME_TITLE },
      parentId: frameId,
      draggable: false,
      connectable: false,
      data: {
        node: w.nodes[c.id], theme, widgetId: w.id,
        collapsed: effCollapsed(c.id), hiddenCount: hiddenCount[c.id] || 0,
        hasChildren: childrenOf(c.id).length > 0,
        isRoot: !w.nodes[c.id].parentId,
      },
      width: c.width, height: c.height,
      style: { width: c.width, height: c.height },
    }))
    const edges: Edge[] = elkEdges.map((e: any) => ({
      id: `e:${w.id}:${e.id}`,
      source: `n:${w.id}:${e.sources[0]}`,
      target: `n:${w.id}:${e.targets[0]}`,
      type: 'default',
      ...edgeStyleProps(w.nodes[e.targets[0]].kind === 'suggestion' ? { kind: 'suggestion' } : {}, theme, td.edge),
    }))
    return { size: { width: (g.width || 200) + FRAME_PAD * 2, height: (g.height || 100) + FRAME_PAD * 2 + FRAME_TITLE }, nodes, edges }
  }

  if (w.type === 'flowchart') {
    const sizeOf = (nid: string) => flowNodeSize(w.nodes[nid])
    const grouped: Record<string, string[]> = {}
    const ungrouped: string[] = []
    for (const nid of w.nodeOrder) {
      const g = w.nodes[nid].groupId
      if (g && w.groups[g]) (grouped[g] ||= []).push(nid)
      else ungrouped.push(nid)
    }
    const children: any[] = [
      ...Object.entries(grouped).map(([gid, nids]) => ({
        id: `grp_${gid}`,
        layoutOptions: {
          'elk.padding': '[top=44,left=18,bottom=18,right=18]',
        },
        children: nids.map((nid) => ({ id: nid, ...sizeOf(nid) })),
      })),
      ...ungrouped.map((nid) => ({ id: nid, ...sizeOf(nid) })),
    ]
    const g = await elk.layout({
      id: w.id,
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
        'elk.spacing.nodeNode': '34',
        'elk.layered.spacing.nodeNodeBetweenLayers': '44',
        'elk.spacing.componentComponent': '50',
        ...EDGE_LABEL_OPTS,
      },
      children,
      edges: w.edgeOrder.map((eid: string) => ({
        id: eid, sources: [w.edges[eid].source], targets: [w.edges[eid].target],
        ...elkEdgeLabels(w.edges[eid].label),
      })),
    })

    const nodes: Node[] = []
    const place = (c: any, parentRF: string, offX: number, offY: number) => {
      if (c.id.startsWith('grp_')) {
        const gid = c.id.slice(4)
        nodes.push({
          id: `g:${w.id}:${gid}`,
          type: 'groupBox',
          position: { x: c.x + offX, y: c.y + offY },
          parentId: parentRF,
          draggable: false,
          connectable: false,
          selectable: false,
          data: { group: w.groups[gid], theme },
          width: c.width, height: c.height,
      style: { width: c.width, height: c.height },
        })
        for (const cc of c.children || []) place(cc, `g:${w.id}:${gid}`, 0, 0)
      } else {
        nodes.push({
          id: `n:${w.id}:${c.id}`,
          type: 'flowNode',
          position: { x: c.x + offX, y: c.y + offY },
          parentId: parentRF,
          draggable: false,
          connectable: false,
          data: { node: w.nodes[c.id], theme, widgetId: w.id },
          width: c.width, height: c.height,
      style: { width: c.width, height: c.height },
        })
      }
    }
    for (const c of g.children || []) place(c, frameId, FRAME_PAD, FRAME_PAD + FRAME_TITLE)

    const edges: Edge[] = w.edgeOrder.map((eid: string) => {
      const e = w.edges[eid]
      const props = edgeStyleProps(e, theme, td.edge)
      return {
        id: `e:${w.id}:${eid}`,
        source: `n:${w.id}:${e.source}`,
        target: `n:${w.id}:${e.target}`,
        type: 'smoothstep',
        label: e.label,
        labelStyle: { fill: td.text, fontSize: 11, fontWeight: 600 },
        labelBgStyle: { fill: td.cardBg, fillOpacity: 0.9 },
        labelBgPadding: [5, 3] as [number, number],
        labelBgBorderRadius: 4,
        ...props,
      }
    })
    return { size: { width: (g.width || 200) + FRAME_PAD * 2, height: (g.height || 100) + FRAME_PAD * 2 + FRAME_TITLE }, nodes, edges }
  }

  // schema
  const g = await elk.layout({
    id: w.id,
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '46',
      'elk.layered.spacing.nodeNodeBetweenLayers': '70',
      ...EDGE_LABEL_OPTS,
    },
    children: w.nodeOrder.map((nid: string) => ({ id: nid, ...schemaNodeSize(w.nodes[nid]) })),
    edges: w.edgeOrder.map((eid: string) => ({
      id: eid, sources: [w.edges[eid].source], targets: [w.edges[eid].target],
      ...elkEdgeLabels(w.edges[eid].label),
    })),
  })
  const nodes: Node[] = (g.children || []).map((c: any) => ({
    id: `n:${w.id}:${c.id}`,
    type: 'schemaNode',
    position: { x: c.x + FRAME_PAD, y: c.y + FRAME_PAD + FRAME_TITLE },
    parentId: frameId,
    draggable: false,
    connectable: false,
    data: { node: w.nodes[c.id], theme, widgetId: w.id },
    width: c.width, height: c.height,
      style: { width: c.width, height: c.height },
  }))
  const edges: Edge[] = w.edgeOrder.map((eid: string) => {
    const e = w.edges[eid]
    return {
      id: `e:${w.id}:${eid}`,
      source: `n:${w.id}:${e.source}`,
      target: `n:${w.id}:${e.target}`,
      type: 'default',
      label: e.label,
      labelStyle: { fill: themeDefaults(theme).text, fontSize: 11 },
      labelBgStyle: { fill: themeDefaults(theme).cardBg, fillOpacity: 0.9 },
      ...edgeStyleProps(e, theme, themeDefaults(theme).edge),
    }
  })
  return { size: { width: (g.width || 220) + FRAME_PAD * 2, height: (g.height || 120) + FRAME_PAD * 2 + FRAME_TITLE }, nodes, edges }
}

let runCounter = 0

export async function computeBoardLayout(
  model: any,
  theme: ThemeName,
  viewCollapsed: Record<string, boolean>,
): Promise<{ nodes: Node[]; edges: Edge[] } | null> {
  const run = ++runCounter
  const perWidget: { id: string; layout: WidgetLayout; widget: any }[] = []

  for (const wid of model.widgetOrder) {
    const w = model.widgets[wid]
    if (['flowchart', 'mindmap', 'schema'].includes(w.type)) {
      perWidget.push({ id: wid, layout: await layoutGraphWidget(w, theme, viewCollapsed), widget: w })
    } else {
      const size = cardSize(w)
      perWidget.push({
        id: wid,
        widget: w,
        layout: {
          size,
          nodes: [{
            id: `c:${wid}`,
            type: `${w.type}Card`,
            position: { x: 0, y: 0 }, // packing fills this in
            draggable: false,
            connectable: false,
            data: { widget: w, theme },
            width: size.width, height: size.height,
            style: { width: size.width, height: size.height },
          }],
          edges: [],
        },
      })
    }
    if (run !== runCounter) return null // superseded by a newer layout run
  }

  // Bottom-left-fill packing: each widget drops into the highest free slot,
  // so short cards tuck beside tall diagrams instead of leaving dead rows.
  // Deterministic in widget order, so positions stay stable as the board grows.
  const nodes: Node[] = []
  const edges: Edge[] = []
  const boardWidth = Math.max(ROW_MAX_WIDTH, ...perWidget.map((p) => p.layout.size.width))
  const skyline: { x: number; width: number; height: number }[] = [{ x: 0, width: boardWidth, height: 0 }]

  const place = (width: number, height: number) => {
    const candidates = skyline.map((s) => s.x).filter((cx) => cx + width <= boardWidth + 0.5)
    if (!candidates.length) candidates.push(0)
    let best = { x: 0, y: Infinity }
    for (const cx of candidates) {
      let top = 0
      for (const s of skyline) {
        if (s.x + s.width <= cx || s.x >= cx + width) continue
        top = Math.max(top, s.height)
      }
      if (top < best.y - 0.5) best = { x: cx, y: top }
    }
    // Raise the skyline over the occupied span.
    const spanStart = best.x
    const spanEnd = best.x + width + PACK_GAP
    const newTop = best.y + height + PACK_GAP
    const next: typeof skyline = []
    for (const s of skyline) {
      const sEnd = s.x + s.width
      if (sEnd <= spanStart || s.x >= spanEnd) { next.push(s); continue }
      if (s.x < spanStart) next.push({ x: s.x, width: spanStart - s.x, height: s.height })
      if (sEnd > spanEnd) next.push({ x: spanEnd, width: sEnd - spanEnd, height: s.height })
    }
    next.push({ x: spanStart, width: Math.min(width + PACK_GAP, boardWidth - spanStart), height: newTop })
    next.sort((a, b) => a.x - b.x)
    skyline.length = 0
    skyline.push(...next)
    return best
  }

  for (const { id, layout, widget } of perWidget) {
    const { width, height } = layout.size
    const { x, y } = place(width, height)
    const isFramed = ['flowchart', 'mindmap', 'schema'].includes(widget.type)
    if (isFramed) {
      nodes.push({
        id: `f:${id}`,
        type: 'widgetFrame',
        position: { x, y },
        draggable: false,
        connectable: false,
        selectable: false,
        data: { widget, theme },
        width, height,
        style: { width, height },
      })
      nodes.push(...layout.nodes)
    } else {
      nodes.push(...layout.nodes.map((n) => ({ ...n, position: { x, y } })))
    }
    edges.push(...layout.edges)
  }
  if (run !== runCounter) return null
  return { nodes, edges }
}
