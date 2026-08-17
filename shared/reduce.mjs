// Shared reducer: ops → board state. Single source of truth for both
// scripts/apply-ops.mjs (strict mode: throws descriptive validation errors,
// used as the referential-validation gate) and the client store (tolerant
// mode: pre-validated log, skip bad ops with a warning).
import { NODE_BEARING, EDGE_BEARING } from './ops.mjs'

export function createEmptyBoard() {
  return {
    title: '',
    style: {},          // { background?, theme? }
    widgets: {},        // id -> widget
    widgetOrder: [],
    lastBatchId: 0,
  }
}

function createWidget(op) {
  const w = { id: op.id, type: op.type, title: op.title, style: op.style || {} }
  if (NODE_BEARING.includes(op.type)) {
    w.nodes = {}
    w.nodeOrder = []
  }
  if (EDGE_BEARING.includes(op.type)) {
    w.edges = {}
    w.edgeOrder = []
  }
  if (op.type === 'flowchart') w.groups = {}
  if (op.type === 'table') { w.columns = []; w.rows = {}; w.rowOrder = [] }
  if (op.type === 'note') w.content = ''
  if (op.type === 'quadrant') w.axes = { xLabel: '', yLabel: '' }
  return w
}

class OpError extends Error {}

function fail(msg) { throw new OpError(msg) }

function getWidget(state, widgetId, opName) {
  const w = state.widgets[widgetId]
  if (!w) fail(`${opName}: widget "${widgetId}" does not exist`)
  return w
}

function normCell(v) {
  return (v !== null && typeof v === 'object') ? { value: v.value, style: v.style } : { value: v }
}

/** Collect a mindmap subtree (node + descendants via parentId). */
function subtreeIds(widget, rootId) {
  const ids = [rootId]
  const queue = [rootId]
  while (queue.length) {
    const cur = queue.shift()
    for (const nid of widget.nodeOrder) {
      if (widget.nodes[nid]?.parentId === cur) { ids.push(nid); queue.push(nid) }
    }
  }
  return ids
}

/**
 * Apply one op to state, mutating it. In strict mode, referential problems
 * throw OpError with a self-correction-friendly message. Returns a list of
 * warning strings (e.g. dropped edges on node_move).
 */
export function applyOp(state, op, { strict = true } = {}) {
  const warnings = []
  const run = () => {
    switch (op.op) {
      case 'board_set_title':
        state.title = op.title
        break
      case 'board_set_style':
        if (op.background !== undefined) state.style.background = op.background
        if (op.theme !== undefined) state.style.theme = op.theme
        break

      case 'widget_create': {
        if (state.widgets[op.id]) fail(`widget_create: widget id "${op.id}" already exists`)
        state.widgets[op.id] = createWidget(op)
        state.widgetOrder.push(op.id)
        break
      }
      case 'widget_update': {
        const w = getWidget(state, op.id, 'widget_update')
        if (op.title !== undefined) w.title = op.title
        if (op.style !== undefined) w.style = { ...w.style, ...op.style }
        break
      }
      case 'widget_delete': {
        getWidget(state, op.id, 'widget_delete')
        delete state.widgets[op.id]
        state.widgetOrder = state.widgetOrder.filter((i) => i !== op.id)
        break
      }

      case 'group_add': {
        const w = getWidget(state, op.widgetId, 'group_add')
        if (w.type !== 'flowchart') fail(`group_add: widget "${op.widgetId}" is a ${w.type}; groups are only supported on flowcharts`)
        if (w.groups[op.id]) fail(`group_add: group id "${op.id}" already exists in widget "${op.widgetId}"`)
        if (w.nodes[op.id]) fail(`group_add: id "${op.id}" collides with a node id in widget "${op.widgetId}"`)
        w.groups[op.id] = { id: op.id, label: op.label, style: op.style || {} }
        break
      }
      case 'group_remove': {
        const w = getWidget(state, op.widgetId, 'group_remove')
        if (!w.groups?.[op.id]) fail(`group_remove: group "${op.id}" does not exist in widget "${op.widgetId}"`)
        delete w.groups[op.id]
        for (const nid of w.nodeOrder) if (w.nodes[nid].groupId === op.id) delete w.nodes[nid].groupId
        break
      }

      case 'node_add': {
        const w = getWidget(state, op.widgetId, 'node_add')
        if (!NODE_BEARING.includes(w.type)) fail(`node_add: widget "${op.widgetId}" is a ${w.type}; node ops apply to ${NODE_BEARING.join('/')} widgets`)
        if (w.nodes[op.id]) fail(`node_add: node id "${op.id}" already exists in widget "${op.widgetId}"`)
        if (op.groupId !== undefined) {
          if (w.type !== 'flowchart') fail(`node_add: groupId is only valid on flowchart nodes (widget "${op.widgetId}" is a ${w.type})`)
          if (!w.groups[op.groupId]) fail(`node_add: group "${op.groupId}" does not exist in widget "${op.widgetId}" — create it first with group_add`)
        }
        if (op.parentId !== undefined) {
          if (w.type !== 'mindmap') fail(`node_add: parentId is only valid on mindmap nodes (widget "${op.widgetId}" is a ${w.type})`)
          if (!w.nodes[op.parentId]) fail(`node_add: parent node "${op.parentId}" does not exist in widget "${op.widgetId}"`)
        }
        if (op.cell !== undefined && w.type !== 'quadrant') fail(`node_add: cell is only valid on quadrant items (widget "${op.widgetId}" is a ${w.type})`)
        if (w.type === 'quadrant' && op.cell === undefined) fail(`node_add: quadrant items need a cell ("tl"|"tr"|"bl"|"br")`)
        const { op: _o, widgetId: _w, ...node } = op
        node.kind = node.kind || 'user'
        w.nodes[op.id] = node
        w.nodeOrder.push(op.id)
        break
      }
      case 'node_update': {
        const w = getWidget(state, op.widgetId, 'node_update')
        const n = w.nodes?.[op.id]
        if (!n) fail(`node_update: node "${op.id}" does not exist in widget "${op.widgetId}"`)
        if (op.groupId != null && !w.groups?.[op.groupId]) fail(`node_update: group "${op.groupId}" does not exist in widget "${op.widgetId}"`)
        if (op.parentId != null) {
          if (w.type !== 'mindmap') fail(`node_update: parentId is only valid on mindmap nodes`)
          if (!w.nodes[op.parentId]) fail(`node_update: parent node "${op.parentId}" does not exist in widget "${op.widgetId}"`)
          if (subtreeIds(w, op.id).includes(op.parentId)) fail(`node_update: reparenting "${op.id}" under "${op.parentId}" would create a cycle`)
        }
        const { op: _o, widgetId: _w, id: _i, ...patch } = op
        for (const [k, v] of Object.entries(patch)) {
          if (v === null) delete n[k]
          else if (k === 'style') n.style = { ...n.style, ...v }
          else n[k] = v
        }
        break
      }
      case 'node_remove': {
        const w = getWidget(state, op.widgetId, 'node_remove')
        if (!w.nodes?.[op.id]) fail(`node_remove: node "${op.id}" does not exist in widget "${op.widgetId}"`)
        const removed = w.type === 'mindmap' ? subtreeIds(w, op.id) : [op.id]
        for (const rid of removed) {
          delete w.nodes[rid]
          w.nodeOrder = w.nodeOrder.filter((i) => i !== rid)
        }
        if (w.edges) {
          for (const eid of [...w.edgeOrder]) {
            const e = w.edges[eid]
            if (removed.includes(e.source) || removed.includes(e.target)) {
              delete w.edges[eid]
              w.edgeOrder = w.edgeOrder.filter((i) => i !== eid)
            }
          }
        }
        break
      }

      case 'edge_add': {
        const w = getWidget(state, op.widgetId, 'edge_add')
        if (!EDGE_BEARING.includes(w.type)) {
          if (w.type === 'mindmap') fail(`edge_add: mindmap edges are derived from parentId — use node_add/node_update with parentId instead`)
          fail(`edge_add: widget "${op.widgetId}" is a ${w.type}; edges apply to ${EDGE_BEARING.join('/')} widgets`)
        }
        if (!w.nodes[op.source]) fail(`edge_add: source node "${op.source}" does not exist in widget "${op.widgetId}" (cross-widget edges are a known V1 limitation — edges must connect nodes within the same widget)`)
        if (!w.nodes[op.target]) fail(`edge_add: target node "${op.target}" does not exist in widget "${op.widgetId}" (cross-widget edges are a known V1 limitation — edges must connect nodes within the same widget)`)
        const eid = op.id || `${op.source}__${op.target}`
        if (w.edges[eid]) fail(`edge_add: edge "${eid}" already exists in widget "${op.widgetId}"`)
        const { op: _o, widgetId: _w, ...edge } = op
        edge.id = eid
        edge.kind = edge.kind || 'user'
        w.edges[eid] = edge
        w.edgeOrder.push(eid)
        break
      }
      case 'edge_remove': {
        const w = getWidget(state, op.widgetId, 'edge_remove')
        const eid = op.id || (op.source && op.target ? `${op.source}__${op.target}` : null)
        if (!eid) fail(`edge_remove: provide either id or source+target`)
        if (!w.edges?.[eid]) fail(`edge_remove: edge "${eid}" does not exist in widget "${op.widgetId}"`)
        delete w.edges[eid]
        w.edgeOrder = w.edgeOrder.filter((i) => i !== eid)
        break
      }

      case 'table_set_columns': {
        const w = getWidget(state, op.widgetId, 'table_set_columns')
        if (w.type !== 'table') fail(`table_set_columns: widget "${op.widgetId}" is a ${w.type}, not a table`)
        w.columns = op.columns.map((c) => ({ ...c }))
        break
      }
      case 'row_add': {
        const w = getWidget(state, op.widgetId, 'row_add')
        if (w.type !== 'table') fail(`row_add: widget "${op.widgetId}" is a ${w.type}, not a table — table ops only apply to table widgets`)
        if (!w.columns.length) fail(`row_add: table "${op.widgetId}" has no columns yet — call table_set_columns first`)
        if (w.rows[op.id]) fail(`row_add: row id "${op.id}" already exists in table "${op.widgetId}"`)
        const colIds = new Set(w.columns.map((c) => c.id))
        for (const key of Object.keys(op.cells)) {
          if (!colIds.has(key)) fail(`row_add: cell column "${key}" is not a column of table "${op.widgetId}" (columns: ${[...colIds].join(', ')})`)
        }
        const cells = {}
        for (const [k, v] of Object.entries(op.cells)) cells[k] = normCell(v)
        w.rows[op.id] = { id: op.id, cells, kind: op.kind || 'user', style: op.style }
        w.rowOrder.push(op.id)
        break
      }
      case 'row_update': {
        const w = getWidget(state, op.widgetId, 'row_update')
        const r = w.rows?.[op.id]
        if (!r) fail(`row_update: row "${op.id}" does not exist in table "${op.widgetId}"`)
        if (op.cells) {
          const colIds = new Set(w.columns.map((c) => c.id))
          for (const [k, v] of Object.entries(op.cells)) {
            if (!colIds.has(k)) fail(`row_update: cell column "${k}" is not a column of table "${op.widgetId}"`)
            r.cells[k] = normCell(v)
          }
        }
        if (op.kind) r.kind = op.kind
        if (op.style) r.style = { ...r.style, ...op.style }
        break
      }
      case 'row_remove': {
        const w = getWidget(state, op.widgetId, 'row_remove')
        if (!w.rows?.[op.id]) fail(`row_remove: row "${op.id}" does not exist in table "${op.widgetId}"`)
        delete w.rows[op.id]
        w.rowOrder = w.rowOrder.filter((i) => i !== op.id)
        break
      }
      case 'cell_update': {
        const w = getWidget(state, op.widgetId, 'cell_update')
        const r = w.rows?.[op.rowId]
        if (!r) fail(`cell_update: row "${op.rowId}" does not exist in table "${op.widgetId}"`)
        if (!w.columns.some((c) => c.id === op.colId)) fail(`cell_update: column "${op.colId}" is not a column of table "${op.widgetId}"`)
        const cell = r.cells[op.colId] || { value: null }
        if (op.value !== undefined) cell.value = op.value
        if (op.style !== undefined) cell.style = { ...cell.style, ...op.style }
        r.cells[op.colId] = cell
        break
      }

      case 'note_set_content': {
        const w = getWidget(state, op.widgetId, 'note_set_content')
        if (w.type !== 'note') fail(`note_set_content: widget "${op.widgetId}" is a ${w.type}, not a note`)
        w.content = op.markdown
        break
      }
      case 'note_append': {
        const w = getWidget(state, op.widgetId, 'note_append')
        if (w.type !== 'note') fail(`note_append: widget "${op.widgetId}" is a ${w.type}, not a note`)
        w.content = w.content ? `${w.content}\n\n${op.markdown}` : op.markdown
        break
      }

      case 'quadrant_set_axes': {
        const w = getWidget(state, op.widgetId, 'quadrant_set_axes')
        if (w.type !== 'quadrant') fail(`quadrant_set_axes: widget "${op.widgetId}" is a ${w.type}, not a quadrant`)
        w.axes = { xLabel: op.xLabel, yLabel: op.yLabel }
        break
      }

      case 'suggestion_accept': {
        const w = getWidget(state, op.widgetId, 'suggestion_accept')
        const el = w.nodes?.[op.id] || w.rows?.[op.id] || w.edges?.[op.id]
        if (!el) fail(`suggestion_accept: no node/row/edge "${op.id}" in widget "${op.widgetId}"`)
        if (el.kind !== 'suggestion') fail(`suggestion_accept: "${op.id}" is not a suggestion (kind: ${el.kind})`)
        el.kind = 'user'
        if (op.label && 'label' in el) el.label = op.label
        break
      }
      case 'suggestion_reject': {
        const w = getWidget(state, op.widgetId, 'suggestion_reject')
        const el = w.nodes?.[op.id] || w.rows?.[op.id] || w.edges?.[op.id]
        if (!el) fail(`suggestion_reject: no node/row/edge "${op.id}" in widget "${op.widgetId}"`)
        if (el.kind !== 'suggestion') fail(`suggestion_reject: "${op.id}" is not a suggestion (kind: ${el.kind})`)
        if (w.nodes?.[op.id]) applyOp(state, { op: 'node_remove', widgetId: op.widgetId, id: op.id }, { strict: true })
        else if (w.rows?.[op.id]) applyOp(state, { op: 'row_remove', widgetId: op.widgetId, id: op.id }, { strict: true })
        else applyOp(state, { op: 'edge_remove', widgetId: op.widgetId, id: op.id }, { strict: true })
        break
      }

      case 'node_flag': {
        const w = getWidget(state, op.widgetId, 'node_flag')
        const n = w.nodes?.[op.id]
        if (!n) fail(`node_flag: node "${op.id}" does not exist in widget "${op.widgetId}"`)
        n.flag = { question: op.question }
        break
      }
      case 'node_unflag': {
        const w = getWidget(state, op.widgetId, 'node_unflag')
        const n = w.nodes?.[op.id]
        if (!n) fail(`node_unflag: node "${op.id}" does not exist in widget "${op.widgetId}"`)
        delete n.flag
        break
      }

      case 'node_move': {
        const from = getWidget(state, op.fromWidgetId, 'node_move')
        const to = getWidget(state, op.toWidgetId, 'node_move')
        const n = from.nodes?.[op.id]
        if (!n) fail(`node_move: node "${op.id}" does not exist in widget "${op.fromWidgetId}"`)
        if (!NODE_BEARING.includes(to.type)) fail(`node_move: target widget "${op.toWidgetId}" is a ${to.type} and cannot hold nodes (compatible targets: ${NODE_BEARING.join(', ')})`)
        if (to.nodes[op.id]) fail(`node_move: node id "${op.id}" already exists in target widget "${op.toWidgetId}"`)
        if (to.type === 'quadrant') fail(`node_move: moving into a quadrant is not supported (items need a cell) — use node_add on the quadrant instead`)
        // Drop edges attached in the source widget, with a warning.
        if (from.edges) {
          for (const eid of [...from.edgeOrder]) {
            const e = from.edges[eid]
            if (e.source === op.id || e.target === op.id) {
              delete from.edges[eid]
              from.edgeOrder = from.edgeOrder.filter((i) => i !== eid)
              warnings.push(`node_move: dropped edge "${eid}" (${e.source} → ${e.target}) — edges cannot cross widgets in V1`)
            }
          }
        }
        // Reparent mindmap children of the moved node to its parent (or root).
        if (from.type === 'mindmap') {
          for (const nid of from.nodeOrder) {
            if (from.nodes[nid]?.parentId === op.id) {
              if (n.parentId) from.nodes[nid].parentId = n.parentId
              else delete from.nodes[nid].parentId
              warnings.push(`node_move: child "${nid}" reparented to "${n.parentId || '(root)'}" in "${op.fromWidgetId}"`)
            }
          }
        }
        delete from.nodes[op.id]
        from.nodeOrder = from.nodeOrder.filter((i) => i !== op.id)
        // Strip fields that don't transfer across widget types.
        const moved = { id: n.id, label: n.label, kind: n.kind, style: n.style, detail: n.detail, flag: n.flag }
        if (to.type === 'flowchart' && n.shape) moved.shape = n.shape
        if (to.type === 'schema' && n.fields) moved.fields = n.fields
        if (to.type === 'timeline') { moved.marker = n.marker; moved.order = n.order }
        for (const k of Object.keys(moved)) if (moved[k] === undefined) delete moved[k]
        to.nodes[op.id] = moved
        to.nodeOrder.push(op.id)
        break
      }

      default:
        fail(`unknown op "${op.op}"`)
    }
  }

  if (strict) {
    run()
  } else {
    try { run() } catch (e) {
      if (e instanceof OpError) warnings.push(`skipped bad op: ${e.message}`)
      else throw e
    }
  }
  return warnings
}

/** Apply a validated batch. Returns warnings. */
export function applyBatch(state, batch, opts) {
  const warnings = []
  for (const op of batch.ops) warnings.push(...applyOp(state, op, opts))
  state.lastBatchId = batch.batchId
  return warnings
}

/** Materialize state from parsed log entries (snapshot-aware). */
export function materialize(entries, opts = { strict: false }) {
  let state = createEmptyBoard()
  let startIdx = 0
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].type === 'snapshot') {
      state = structuredClone(entries[i].data.state)
      state.lastBatchId = entries[i].data.batchId
      startIdx = i + 1
      break
    }
  }
  const warnings = []
  for (let i = startIdx; i < entries.length; i++) {
    if (entries[i].type === 'batch') warnings.push(...applyBatch(state, entries[i].data, opts))
  }
  return { state, warnings }
}

export { OpError }
