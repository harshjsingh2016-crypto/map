// Shared op schemas — the single source of truth for the board op vocabulary.
// Used by scripts/apply-ops.mjs (write gate), server, and the React client.
import { z } from 'zod'

export const LOG_VERSION = 1

export const WIDGET_TYPES = ['flowchart', 'mindmap', 'note', 'table', 'schema', 'timeline', 'quadrant']

// Widget types whose content is nodes (+ optionally edges)
export const NODE_BEARING = ['flowchart', 'mindmap', 'schema', 'timeline', 'quadrant']
// Widget types that support edges (mindmap edges are derived from parentId)
export const EDGE_BEARING = ['flowchart', 'schema']

export const PALETTE_TOKENS = [
  'slate', 'gray', 'red', 'orange', 'amber', 'yellow', 'green', 'teal',
  'cyan', 'blue', 'indigo', 'violet', 'purple', 'pink', 'rose',
]

const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
const color = z.string().refine(
  (v) => PALETTE_TOKENS.includes(v) || hex.test(v),
  { message: `color must be a palette token (${PALETTE_TOKENS.join(', ')}) or hex like #1e3a5f` },
)

export const styleSchema = z.object({
  fill: color.optional(),
  border: color.optional(),
  text: color.optional(),
  stroke: color.optional(),
  lineStyle: z.enum(['solid', 'dashed']).optional(),
  arrow: z.enum(['none', 'end', 'both']).optional(),
}).strict()

const kind = z.enum(['user', 'suggestion'])
const id = z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/, 'ids must be alphanumeric/_/-')

const schemaField = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  key: z.enum(['pk', 'fk']).optional(),
}).strict()

const cellValue = z.union([
  z.string(), z.number(), z.boolean(), z.null(),
  z.object({ value: z.union([z.string(), z.number(), z.boolean(), z.null()]), style: styleSchema.optional() }).strict(),
])

export const opSchemas = {
  board_set_title: z.object({ op: z.literal('board_set_title'), title: z.string().min(1) }).strict(),
  board_set_style: z.object({
    op: z.literal('board_set_style'),
    background: color.optional(),
    theme: z.enum(['light', 'dark']).optional(),
  }).strict(),

  widget_create: z.object({
    op: z.literal('widget_create'),
    id, type: z.enum(WIDGET_TYPES), title: z.string().min(1),
    style: styleSchema.optional(),
  }).strict(),
  widget_update: z.object({
    op: z.literal('widget_update'),
    id, title: z.string().min(1).optional(), style: styleSchema.optional(),
  }).strict(),
  widget_delete: z.object({ op: z.literal('widget_delete'), id }).strict(),

  group_add: z.object({
    op: z.literal('group_add'),
    widgetId: id, id, label: z.string().min(1), style: styleSchema.optional(),
  }).strict(),
  group_remove: z.object({ op: z.literal('group_remove'), widgetId: id, id }).strict(),

  node_add: z.object({
    op: z.literal('node_add'),
    widgetId: id, id, label: z.string().min(1),
    shape: z.enum(['process', 'decision', 'start', 'end', 'io']).optional(), // flowchart
    kind: kind.optional(),                    // default: user
    style: styleSchema.optional(),
    groupId: id.optional(),                   // flowchart groups
    parentId: id.optional(),                  // mindmap hierarchy
    cell: z.enum(['tl', 'tr', 'bl', 'br']).optional(), // quadrant
    marker: z.string().optional(),            // timeline date/phase marker
    order: z.number().optional(),             // timeline ordering
    fields: z.array(schemaField).optional(),  // schema entities
    detail: z.string().optional(),            // optional secondary text on any node
  }).strict(),
  node_update: z.object({
    op: z.literal('node_update'),
    widgetId: id, id,
    label: z.string().min(1).optional(),
    shape: z.enum(['process', 'decision', 'start', 'end', 'io']).optional(),
    kind: kind.optional(),
    style: styleSchema.optional(),
    groupId: id.nullable().optional(),
    parentId: id.nullable().optional(),       // reparent (mindmap); subtree follows
    cell: z.enum(['tl', 'tr', 'bl', 'br']).optional(),
    marker: z.string().nullable().optional(),
    order: z.number().optional(),
    fields: z.array(schemaField).optional(),
    detail: z.string().nullable().optional(),
    collapsed: z.boolean().optional(),        // mindmap branch collapse
  }).strict(),
  node_remove: z.object({ op: z.literal('node_remove'), widgetId: id, id }).strict(),

  edge_add: z.object({
    op: z.literal('edge_add'),
    widgetId: id, id: id.optional(),
    source: id, target: id,
    label: z.string().optional(),             // branch labels (Yes/No) on decision edges
    kind: kind.optional(),
    style: styleSchema.optional(),
  }).strict(),
  edge_remove: z.object({
    op: z.literal('edge_remove'),
    widgetId: id, id: id.optional(),
    source: id.optional(), target: id.optional(),
  }).strict(),

  table_set_columns: z.object({
    op: z.literal('table_set_columns'),
    widgetId: id,
    columns: z.array(z.object({ id, label: z.string().min(1), style: styleSchema.optional() }).strict()).min(1),
  }).strict(),
  row_add: z.object({
    op: z.literal('row_add'),
    widgetId: id, id,
    cells: z.record(z.string(), cellValue),
    kind: kind.optional(),
    style: styleSchema.optional(),
  }).strict(),
  row_update: z.object({
    op: z.literal('row_update'),
    widgetId: id, id,
    cells: z.record(z.string(), cellValue).optional(),
    kind: kind.optional(),
    style: styleSchema.optional(),
  }).strict(),
  row_remove: z.object({ op: z.literal('row_remove'), widgetId: id, id }).strict(),
  cell_update: z.object({
    op: z.literal('cell_update'),
    widgetId: id, rowId: id, colId: id,
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
    style: styleSchema.optional(),
  }).strict(),

  note_set_content: z.object({ op: z.literal('note_set_content'), widgetId: id, markdown: z.string() }).strict(),
  note_append: z.object({ op: z.literal('note_append'), widgetId: id, markdown: z.string() }).strict(),

  quadrant_set_axes: z.object({
    op: z.literal('quadrant_set_axes'),
    widgetId: id, xLabel: z.string().min(1), yLabel: z.string().min(1),
  }).strict(),

  suggestion_accept: z.object({
    op: z.literal('suggestion_accept'),
    widgetId: id, id,
    label: z.string().min(1).optional(),      // "accept with edits"
  }).strict(),
  suggestion_reject: z.object({ op: z.literal('suggestion_reject'), widgetId: id, id }).strict(),

  node_flag: z.object({
    op: z.literal('node_flag'),
    widgetId: id, id, question: z.string().min(1),
  }).strict(),
  node_unflag: z.object({ op: z.literal('node_unflag'), widgetId: id, id }).strict(),

  node_move: z.object({
    op: z.literal('node_move'),
    id, fromWidgetId: id, toWidgetId: id,
  }).strict(),
}

export const opSchema = z.discriminatedUnion('op', Object.values(opSchemas))

export const batchSchema = z.object({
  v: z.literal(LOG_VERSION),
  ts: z.number(),
  batchId: z.number().int().positive(),
  ops: z.array(opSchema).min(1),
}).strict()

export const snapshotSchema = z.object({
  v: z.literal(LOG_VERSION),
  type: z.literal('snapshot'),
  ts: z.number(),
  batchId: z.number().int().nonnegative(), // last batch included in this snapshot
  state: z.any(),
}).strict()

/** Parse one JSONL line into {type:'batch'|'snapshot', data} or throw a descriptive error. */
export function parseLogLine(line, lineNo) {
  let raw
  try {
    raw = JSON.parse(line)
  } catch (e) {
    throw new Error(`line ${lineNo}: not valid JSON — ${e.message}`)
  }
  if (raw.v !== LOG_VERSION) {
    throw new Error(`line ${lineNo}: unknown log version ${JSON.stringify(raw.v)} (this reader supports v${LOG_VERSION})`)
  }
  if (raw.type === 'snapshot') {
    const res = snapshotSchema.safeParse(raw)
    if (!res.success) throw new Error(`line ${lineNo}: invalid snapshot — ${res.error.issues[0]?.message}`)
    return { type: 'snapshot', data: res.data }
  }
  const res = batchSchema.safeParse(raw)
  if (!res.success) {
    const issue = res.error.issues[0]
    throw new Error(`line ${lineNo}: invalid batch — ${issue?.path?.join('.')}: ${issue?.message}`)
  }
  return { type: 'batch', data: res.data }
}
