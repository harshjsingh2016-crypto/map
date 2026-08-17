// Client state: SSE connection, board model (via the shared reducer),
// staggered presentation of live batches, and layouted React Flow elements.
import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'
// @ts-ignore — shared plain-JS modules
import { createEmptyBoard, applyOp, applyBatch } from '../shared/reduce.mjs'
import { computeBoardLayout } from './layout'
import type { ThemeName } from './theme'

export type Status =
  | 'connecting'   // SSE not yet open
  | 'ready'        // board loaded (possibly empty)
  | 'no-board'     // no boards exist yet
  | 'disconnected' // SSE dropped, retrying

export interface BoardRef {
  id: string        // "<folder>/<name>"
  folder: string | null
  name: string
}

interface MapStore {
  boards: BoardRef[]
  active: string | null      // Claude's write target (boards/.active)
  folder: string | null      // working folder (boards/.folder)
  selected: string | null    // board id shown in the UI
  followActive: boolean
  status: Status
  logErrors: string[]

  nodes: Node[]
  edges: Edge[]
  boardTitle: string
  boardStyle: { background?: string; theme?: ThemeName }
  newNodeIds: string[]       // set by the last layout pass — drives camera + pop-in
  layoutSeq: number          // bumps every time a layout lands (camera effect trigger)

  viewCollapsed: Record<string, boolean>
  toggleCollapsed: (rfNodeId: string, current: boolean) => void
  selectBoard: (name: string) => void
  setFollowActive: (v: boolean) => void
}

// `?board=<folder>/<name>` pins the view to one board instead of following
// Claude's active pointer. scripts/export.mjs relies on it to target a board
// deterministically; it also works as a plain deep link.
const params =
  typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams()
const pinnedBoard = params.get('board')

// `?theme=light|dark` overrides the board's own theme for this view only —
// nothing is written back to the log. scripts/export.mjs uses it for
// paper-friendly PDFs, since node colors are baked in at layout time and a
// CSS class swap alone would not recolor them.
const pinnedTheme: ThemeName | null =
  params.get('theme') === 'light' ? 'light' : params.get('theme') === 'dark' ? 'dark' : null

// Mutable model lives outside zustand; the store only holds render output.
let model: any = createEmptyBoard()
let es: EventSource | null = null
let opQueue: any[] = []
let pumping = false
let layoutTimer: ReturnType<typeof setTimeout> | null = null
let lastLayoutAt = 0

// During a staggered burst every op would otherwise trigger its own elk run.
// Throttling to this interval keeps a 40-op batch at ~8 layouts instead of 40,
// which is what keeps large batches inside the speed budget.
const LAYOUT_THROTTLE_MS = 130

export const useMapStore = create<MapStore>((set, get) => ({
  boards: [],
  active: null,
  folder: null,
  selected: pinnedBoard,
  followActive: !pinnedBoard,
  status: 'connecting',
  logErrors: [],
  nodes: [],
  edges: [],
  boardTitle: '',
  boardStyle: {},
  newNodeIds: [],
  layoutSeq: 0,
  viewCollapsed: {},
  toggleCollapsed: (rfNodeId, current) => {
    set((s) => ({ viewCollapsed: { ...s.viewCollapsed, [rfNodeId]: !current } }))
    scheduleLayout(set, get, 0)
  },
  selectBoard: (name) => {
    if (name === get().selected) return
    set({ selected: name, followActive: name === get().active, viewCollapsed: {}, logErrors: [] })
    connect(set, get)
  },
  setFollowActive: (v) => {
    set({ followActive: v })
    const { active, selected } = get()
    if (v && active && active !== selected) {
      set({ selected: active, viewCollapsed: {}, logErrors: [] })
      connect(set, get)
    }
  },
}))

function scheduleLayout(set: any, get: any, delay = 60) {
  // Never let a burst of ops starve the canvas: if the last layout was recent,
  // wait out the remainder of the throttle window rather than re-running now.
  const sinceLast = Date.now() - lastLayoutAt
  const wait = Math.max(delay, LAYOUT_THROTTLE_MS - sinceLast)
  if (layoutTimer) clearTimeout(layoutTimer)
  layoutTimer = setTimeout(async () => {
    lastLayoutAt = Date.now()
    const theme: ThemeName = pinnedTheme ?? (model.style?.theme === 'light' ? 'light' : 'dark')
    const result = await computeBoardLayout(model, theme, get().viewCollapsed)
    if (!result) return // superseded
    const prevIds = new Set(get().nodes.map((n: Node) => n.id))
    const newIds = result.nodes.filter((n) => !prevIds.has(n.id) && n.type !== 'widgetFrame').map((n) => n.id)
    set({
      nodes: result.nodes,
      edges: result.edges,
      boardTitle: model.title,
      boardStyle: { ...model.style, theme },
      newNodeIds: newIds,
      layoutSeq: get().layoutSeq + 1,
    })
  }, wait)
}

/**
 * Reveal queued ops progressively instead of in one pop-in. State on the wire
 * is already batch-atomic; this is pure presentation.
 *
 * Small batches advance one op per tick. Large ones advance in chunks so the
 * number of visual steps stays bounded — 40 ops at one-per-tick would spend
 * over a second just ticking, blowing the batch's time budget.
 */
const STEP_MS = 45
const MAX_STEPS = 14

function pump(set: any, get: any) {
  if (pumping) return
  pumping = true
  const chunk = Math.max(1, Math.ceil(opQueue.length / MAX_STEPS))
  const step = () => {
    if (!opQueue.length) { pumping = false; return }
    for (let i = 0; i < chunk && opQueue.length; i++) {
      try {
        applyOp(model, opQueue.shift(), { strict: false })
      } catch (e) {
        console.warn('op skipped:', e)
      }
    }
    scheduleLayout(set, get, 20)
    if (opQueue.length) setTimeout(step, STEP_MS)
    else pumping = false
  }
  step()
}

function resetModel() {
  model = createEmptyBoard()
  opQueue = []
  pumping = false
}

// The server heartbeats every 4s. If nothing arrives for this long the stream
// is dead even if the socket looks open — a dev proxy in front of a restarted
// server keeps the connection alive, so EventSource never fires `error` and
// would otherwise stall silently forever.
const STALL_MS = 13000
let watchdog: ReturnType<typeof setInterval> | null = null
let retryTimer: ReturnType<typeof setTimeout> | null = null
let lastMessageAt = 0

function connect(set: any, get: any) {
  es?.close()
  if (watchdog) clearInterval(watchdog)
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  resetModel()
  set({ nodes: [], edges: [], boardTitle: '', boardStyle: {}, status: 'connecting', newNodeIds: [] })

  const board = get().selected
  es = new EventSource(`/api/events${board ? `?board=${encodeURIComponent(board)}` : ''}`)

  lastMessageAt = Date.now()
  const touch = () => { lastMessageAt = Date.now() }
  for (const name of ['ping', 'message', 'boards', 'init', 'batch', 'snapshot', 'reset', 'logerror']) {
    es.addEventListener(name, touch)
  }
  watchdog = setInterval(() => {
    if (Date.now() - lastMessageAt < STALL_MS) return
    set({ status: 'disconnected' })
    connect(set, get) // tear down and re-establish; the server re-sends init
  }, 3000)

  es.addEventListener('boards', (ev) => {
    const data = JSON.parse((ev as MessageEvent).data)
    const st = get()
    const ids: string[] = (data.boards as BoardRef[]).map((b) => b.id)
    set({ boards: data.boards, active: data.active, folder: data.folder })
    if (!ids.length) {
      set({ status: 'no-board', selected: null })
      return
    }
    // Follow Claude's active pointer, or pick a first board if none selected.
    if (st.followActive && data.active && data.active !== st.selected && ids.includes(data.active)) {
      set({ selected: data.active, viewCollapsed: {}, logErrors: [] })
      connect(set, get)
    } else if (!st.selected) {
      // `.active` can outlive its board file (deleted, renamed, moved) — never
      // select a board that isn't actually there.
      const target = ids.includes(data.active) ? data.active : ids[0]
      set({ selected: target, viewCollapsed: {}, logErrors: [] })
      connect(set, get)
    }
  })

  es.addEventListener('init', (ev) => {
    const data = JSON.parse((ev as MessageEvent).data)
    resetModel()
    for (const entry of data.entries) {
      if (entry.type === 'batch') applyBatch(model, entry.data, { strict: false })
      else if (entry.type === 'snapshot') {
        model = structuredClone(entry.data.state)
        model.lastBatchId = entry.data.batchId
      }
    }
    set({ status: 'ready', logErrors: data.errors || [] })
    scheduleLayout(set, get, 0)
  })

  es.addEventListener('batch', (ev) => {
    const data = JSON.parse((ev as MessageEvent).data)
    const ops = data.entry.data.ops as any[]
    model.lastBatchId = data.entry.data.batchId
    opQueue.push(...ops)
    pump(useMapStore.setState, useMapStore.getState)
  })

  es.addEventListener('reset', () => {
    // Truncation (undo) — init follows immediately; just clear.
    resetModel()
  })

  es.addEventListener('logerror', (ev) => {
    const data = JSON.parse((ev as MessageEvent).data)
    set({ logErrors: [...get().logErrors, data.message] })
  })

  es.onerror = () => {
    set({ status: 'disconnected' })
    // A dev proxy in front of a dead server answers with a plain error
    // response rather than dropping the socket, which puts EventSource into
    // CLOSED — a terminal state it never retries out of. Drive the retry
    // ourselves; if the stream merely blipped, EventSource is reconnecting
    // on its own and the stall watchdog remains the backstop.
    if (es?.readyState === EventSource.CLOSED && !retryTimer) {
      retryTimer = setTimeout(() => { retryTimer = null; connect(set, get) }, 2000)
    }
  }
}

export function startConnection() {
  connect(useMapStore.setState, useMapStore.getState)
}
