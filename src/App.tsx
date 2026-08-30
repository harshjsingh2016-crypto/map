import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, MiniMap, Controls, ControlButton,
  useReactFlow, useUpdateNodeInternals, PanOnScrollMode, type Node,
} from '@xyflow/react'
import { useMapStore, startConnection } from './store'
import { resolveBoardBackground, themeDefaults } from './theme'
import FlowNode from './nodes/FlowNode'
import MindMapNode from './nodes/MindMapNode'
import SchemaNode from './nodes/SchemaNode'
import WidgetFrame, { GroupBox } from './nodes/WidgetFrame'
import NoteCard from './nodes/NoteCard'
import TableCard from './nodes/TableCard'
import TimelineCard from './nodes/TimelineCard'
import QuadrantCard from './nodes/QuadrantCard'

/** Label for boards that sit outside any folder. */
const NO_FOLDER = '(no folder)'

/** Camera limits. Shared by React Flow and the button-held wheel zoom below. */
const MIN_ZOOM = 0.08
const MAX_ZOOM = 2.5

// Follow-active reveal. Tweakables:
//   REVEAL_ZOOM     zoom used when centring a new widget — sized for reading,
//                   not for seeing the whole board.
//   REVEAL_HOLD_MS  dwell on each widget before moving to the next one.
//   REVEAL_SETTLE_MS  wait for a staggered batch to stop growing before the
//                   first move, so we frame the finished widget, not its first
//                   node.
//   USER_IDLE_MS    a real pan/zoom by the user postpones the queue this long.
//   REVEAL_PAD      screen margin kept around a widget too big for REVEAL_ZOOM.
const REVEAL_ZOOM = 1.2
const REVEAL_HOLD_MS = 5000
const REVEAL_SETTLE_MS = 500
const USER_IDLE_MS = 5000
const REVEAL_PAD = 60
//   BURST_GAP_MS    arrivals farther apart than this belong to different
//                   bursts. Anything still queued from an older burst is stale
//                   — "the last created" is the point, not a tour of history.
//                   One batch spreads its layout passes over well under this.
//   MAX_REVEAL_STOPS  ceiling for a single huge burst; the oldest stops go.
const BURST_GAP_MS = 2500
const MAX_REVEAL_STOPS = 8
//   REVEAL_MOVE_MS  length of the glide between stops.
const REVEAL_MOVE_MS = 500

/** Widget a layout node belongs to: `c:<wid>` for cards, `n:<wid>:<id>` otherwise. */
function widgetOf(rfNodeId: string): string {
  return rfNodeId.startsWith('c:') ? rfNodeId.slice(2) : rfNodeId.split(':')[1] || rfNodeId
}

const nodeTypes = {
  flowNode: FlowNode,
  mindNode: MindMapNode,
  schemaNode: SchemaNode,
  widgetFrame: WidgetFrame,
  groupBox: GroupBox,
  noteCard: NoteCard,
  tableCard: TableCard,
  timelineCard: TimelineCard,
  quadrantCard: QuadrantCard,
}

/** Absolute position of a node, walking the parent chain. */
function absPos(node: Node, byId: Map<string, Node>): { x: number; y: number } {
  let x = node.position.x
  let y = node.position.y
  let p = node.parentId ? byId.get(node.parentId) : undefined
  while (p) {
    x += p.position.x
    y += p.position.y
    p = p.parentId ? byId.get(p.parentId) : undefined
  }
  return { x, y }
}

/**
 * Innermost scrollable ancestor of `target` that can still move in the
 * wheel's direction, or null. Walking outward mirrors what the browser's own
 * scroll chaining does, so an element found here is the one the native
 * default action will scroll. Returning null at the end of a card's scroll
 * range is deliberate: the wheel then falls through to panning the board.
 */
function scrollableUnder(target: EventTarget | null, stop: HTMLElement, dx: number, dy: number): HTMLElement | null {
  let el = target instanceof HTMLElement ? target : null
  while (el && el !== stop) {
    const cs = getComputedStyle(el)
    const scrollableY = cs.overflowY === 'auto' || cs.overflowY === 'scroll'
    const scrollableX = cs.overflowX === 'auto' || cs.overflowX === 'scroll'
    const roomY = el.scrollHeight - el.clientHeight
    const roomX = el.scrollWidth - el.clientWidth
    if (dy && scrollableY && roomY > 1 && (dy < 0 ? el.scrollTop > 0 : el.scrollTop < roomY - 1)) return el
    if (dx && scrollableX && roomX > 1 && (dx < 0 ? el.scrollLeft > 0 : el.scrollLeft < roomX - 1)) return el
    el = el.parentElement
  }
  return null
}

function Canvas() {
  const { nodes, edges, boardStyle, newNodeIds, layoutSeq, status, followActive, viewCommand } = useMapStore()
  const rf = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const lastUserMove = useRef(0)
  const hadNodes = useRef(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const zoomHeld = useRef(false)
  const nodesRef = useRef(nodes)
  const revealQueue = useRef<{ widgetId: string; ids: string[] }[]>([])
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRevealAt = useRef(0)
  const lastEnqueueAt = useRef(0)
  const lastCreated = useRef<string[] | null>(null)
  // Deliberate camera stops only — reveals and jumps, never raw pans. Stored
  // as node ids, not viewports, so stepping back re-frames for the window's
  // current size instead of restoring a stale rectangle.
  const history = useRef<string[][]>([])
  const historyAt = useRef(-1)
  const tween = useRef<ReturnType<typeof setInterval> | null>(null)
  const glideTarget = useRef<{ x: number; y: number; zoom: number } | null>(null)
  nodesRef.current = nodes

  // React Flow measures nodes with a ResizeObserver, which browsers do not
  // run while a tab is hidden — and this board is usually in a background
  // window while the user converses. Without measurements, edges never draw.
  // Force a measure after each layout and again when the tab becomes visible.
  useEffect(() => {
    if (!nodes.length) return
    const ids = nodes.map((n) => n.id)
    const remeasure = () => updateNodeInternals(ids)
    const t = setTimeout(remeasure, 0)
    document.addEventListener('visibilitychange', remeasure)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', remeasure)
    }
  }, [layoutSeq]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle for scripts/export.mjs: it reads node geometry and pins the
  // viewport at zoom 1 before printing. Local tooling only.
  useEffect(() => {
    ;(window as any).__mapExport = { rf }
  }, [rf])

  const stopGlide = useCallback(() => {
    if (tween.current) { clearInterval(tween.current); tween.current = null }
    glideTarget.current = null
  }, [])


  // A real gesture stops any glide in flight and restarts the idle window.
  const userTookOver = useCallback(() => {
    lastUserMove.current = Date.now()
    stopGlide()
  }, [stopGlide])

  // Camera glide, driven by rAF over instant setViewport calls. React Flow's
  // own animated setViewport goes through a d3 transition, which silently does
  // nothing when the board window was hidden or zero-sized as the pane came up
  // — exactly the state this board sits in while the user is conversing.
  const glideTo = useCallback((to: { x: number; y: number; zoom: number }, ms: number) => {
    stopGlide()
    const from = rf.getViewport()
    const t0 = performance.now()
    // Deliberately an interval, not requestAnimationFrame. This board spends
    // most of its life in a window that is backgrounded or collapsed, where
    // rAF is starved outright — a frame-driven tween stops mid-flight and
    // parks the camera between two widgets. A timer keeps running (throttled
    // to ~1s), and since that is already past `ms`, the first tick lands the
    // exact target. Smooth when watched, correct when not.
    glideTarget.current = to
    tween.current = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / ms)
      if (p >= 1) { stopGlide(); rf.setViewport(to); return }
      const e = 1 - Math.pow(1 - p, 3)
      rf.setViewport({
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
        zoom: from.zoom + (to.zoom - from.zoom) * e,
      })
    }, 16)
  }, [rf, stopGlide])

  /**
   * Centre `ids` at a readable zoom. Shared by the reveal queue and the
   * jump-to-latest control so both frame content identically. No-ops when the
   * window has no size to frame against, or when the ids are all gone.
   */
  const frameNodes = useCallback((
    ids: string[],
    ms: number,
    { record = true, maxZoom = REVEAL_ZOOM, pad = REVEAL_PAD }: { record?: boolean; maxZoom?: number; pad?: number } = {},
  ): boolean => {
    const el = wrapRef.current
    if (!el) return false
    const vw = el.clientWidth, vh = el.clientHeight
    if (vw < 1 || vh < 1) return false
    const byId = new Map(nodesRef.current.map((n) => [n.id, n]))
    const fresh = ids.map((id) => byId.get(id)).filter(Boolean) as Node[]
    if (!fresh.length) return false
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of fresh) {
      const { x, y } = absPos(n, byId)
      const w = Number(n.style?.width) || 150
      const h = Number(n.style?.height) || 50
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h)
    }
    // Readable zoom, backed off only far enough to fit something oversized.
    const zoom = Math.max(MIN_ZOOM, Math.min(
      maxZoom,
      (vw - pad * 2) / Math.max(1, maxX - minX),
      (vh - pad * 2) / Math.max(1, maxY - minY),
    ))
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(zoom)) return false
    if (record) {
      // Stepping back and then landing somewhere new drops the forward tail,
      // the way browser history does.
      history.current.splice(historyAt.current + 1)
      history.current.push(ids)
      historyAt.current = history.current.length - 1
    }
    glideTo({ x: vw / 2 - cx * zoom, y: vh / 2 - cy * zoom, zoom }, ms)
    return true
  }, [glideTo])

  /**
   * Step through the visited stops. `delta` is signed, so `-2` is two back.
   * Deliberately drops the pending reveal queue: asking to go back is a
   * statement that you want the sequence under your own control, and a tour
   * resuming five seconds later would undo it. The jump control is always
   * there to catch back up to the newest content.
   */
  const stepHistory = useCallback((delta: number) => {
    revealQueue.current = []
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null }
    lastUserMove.current = Date.now()
    const next = Math.max(0, Math.min(history.current.length - 1, historyAt.current + delta))
    if (next === historyAt.current || !history.current[next]) return
    historyAt.current = next
    frameNodes(history.current[next], REVEAL_MOVE_MS, { record: false })
  }, [frameNodes])

  /**
   * Jump to the newest content — the control button and the wheel click. An
   * explicit "take me to the latest" makes any queued tour moot, so the queue
   * is dropped rather than left to pull the camera away a few seconds later.
   * Falls back to the last widget on the board when nothing has been written
   * this session, so the control still works on a board just opened.
   */
  const goToLatest = useCallback(() => {
    revealQueue.current = []
    if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null }
    lastUserMove.current = Date.now()
    let ids = lastCreated.current
    if (!ids?.length) {
      const last = [...nodesRef.current].reverse()
        .find((n) => n.type !== 'widgetFrame' && widgetOf(n.id) !== 'w-status')
      ids = last ? [last.id] : null
    }
    if (ids?.length) frameNodes(ids, REVEAL_MOVE_MS)
  }, [frameNodes])

  // Navigation: the wheel pans (React Flow's panOnScroll), and holding the
  // left mouse button turns the same wheel into zoom. React Flow can only
  // gate zoom behind a *keyboard* key, so the button-held case is handled
  // here: intercept the wheel in the capture phase before d3-zoom sees it
  // and scale the viewport around the pointer.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const down = (e: PointerEvent) => { if (e.button === 0) zoomHeld.current = true }
    const up = () => { zoomHeld.current = false }
    // Wheel click jumps to the latest widget. Caught on mousedown, where
    // preventDefault is what actually suppresses Chrome's autoscroll cursor;
    // stopping it here also keeps React Flow from starting a middle-drag pan.
    // Wheel click jumps to the latest widget; the thumb buttons step the view
    // history. Caught on mousedown, where preventDefault is what actually
    // suppresses Chrome's autoscroll cursor and its back/forward navigation;
    // stopping it here also keeps React Flow from starting a middle-drag pan.
    const EXTRA_BUTTONS = new Set([1, 3, 4])
    const middle = (e: MouseEvent) => {
      if (!EXTRA_BUTTONS.has(e.button)) return
      e.preventDefault()
      e.stopPropagation()
      if (e.button === 1) goToLatest()
      else stepHistory(e.button === 3 ? -1 : 1)
    }
    const noAux = (e: MouseEvent) => { if (EXTRA_BUTTONS.has(e.button)) e.preventDefault() }
    const wheel = (e: WheelEvent) => {
      // Leave the minimap and the zoom buttons to their own handlers.
      const t = e.target as HTMLElement | null
      if (t?.closest?.('.react-flow__minimap, .react-flow__controls')) return
      if (!zoomHeld.current) {
        // Cursor over a card that can still scroll (a long note, a tall
        // table, a full quadrant cell): scroll it instead of panning. Once
        // that card hits its end — or has no overflow at all — nothing is
        // found here and the wheel pans the board as usual. The scroll is
        // applied by hand rather than left to the browser's default action,
        // which latches a gesture to one scroller and then ignores the card.
        const box = scrollableUnder(e.target, el, e.deltaX, e.deltaY)
        if (!box) return
        e.preventDefault()
        e.stopPropagation()
        const step = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? box.clientHeight : 1
        box.scrollTop += e.deltaY * step
        box.scrollLeft += e.deltaX * step
        return
      }
      e.preventDefault()
      e.stopPropagation()
      const rect = el.getBoundingClientRect()
      // deltaMode: 0 pixels, 1 lines, 2 pages.
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1
      const vp = rf.getViewport()
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, vp.zoom * Math.exp(-e.deltaY * unit * 0.002)))
      if (next === vp.zoom) return
      // Keep the board point under the cursor pinned while scaling.
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      const k = next / vp.zoom
      stopGlide()
      rf.setViewport({ x: px - (px - vp.x) * k, y: py - (py - vp.y) * k, zoom: next })
      lastUserMove.current = Date.now()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('mousedown', middle, { capture: true })
    el.addEventListener('auxclick', noAux, { capture: true })
    el.addEventListener('wheel', wheel, { capture: true, passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('blur', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('mousedown', middle, { capture: true } as any)
      el.removeEventListener('auxclick', noAux, { capture: true } as any)
      el.removeEventListener('wheel', wheel, { capture: true } as any)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('blur', up)
    }
  }, [rf, goToLatest, stepHistory, stopGlide])

  /**
   * Camera commands from chat (`scripts/view.mjs` -> POST /api/view -> SSE).
   * `focus` accepts a widget id, a bare node id, or a full layout node id, so
   * "focus w-status" and "focus n-learning" both work without the caller
   * knowing how ids are shaped internally.
   */
  useEffect(() => {
    if (!viewCommand) return
    const { action, target, count } = viewCommand
    if (action === 'latest') { goToLatest(); return }
    if (action === 'back') { stepHistory(-count); return }
    if (action === 'forward') { stepHistory(count); return }
    if (action === 'fit') {
      // Framed here rather than through rf.fitView, which animates via a d3
      // transition — the same starved-frame path the glide had to abandon.
      revealQueue.current = []
      if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null }
      lastUserMove.current = Date.now()
      frameNodes(nodesRef.current.map((n) => n.id), REVEAL_MOVE_MS, { maxZoom: 1, pad: 40 })
      return
    }
    if (action === 'focus' && target) {
      const ids = nodesRef.current
        .filter((n) => n.type !== 'widgetFrame' &&
          (n.id === target || widgetOf(n.id) === target || n.id.endsWith(`:${target}`)))
        .map((n) => n.id)
      if (!ids.length) { console.warn(`view focus: nothing on this board matches "${target}"`); return }
      revealQueue.current = []
      if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null }
      lastUserMove.current = Date.now()
      frameNodes(ids, REVEAL_MOVE_MS)
    }
  }, [viewCommand?.seq]) // eslint-disable-line react-hooks/exhaustive-deps

  // Follow-active reveal queue. Each widget that gained content becomes one
  // stop: the camera centres it at a readable zoom, holds REVEAL_HOLD_MS, then
  // moves to the next. Widget-level granularity means ten nodes added to one
  // flowchart is a single stop, while three new cards are three.
  const runReveal = useCallback(() => {
    revealTimer.current = null
    const el = wrapRef.current
    if (!el) return
    if (!useMapStore.getState().followActive) { revealQueue.current = []; return }

    // A real gesture always wins: postpone rather than drop, so nothing the
    // user was shown mid-pan is silently lost.
    const sinceUser = Date.now() - lastUserMove.current
    if (sinceUser < USER_IDLE_MS) {
      revealTimer.current = setTimeout(runReveal, USER_IDLE_MS - sinceUser)
      return
    }
    const sinceReveal = Date.now() - lastRevealAt.current
    if (sinceReveal < REVEAL_HOLD_MS) {
      revealTimer.current = setTimeout(runReveal, REVEAL_HOLD_MS - sinceReveal)
      return
    }
    if (!revealQueue.current.length) return
    // The board window is routinely collapsed or backgrounded while the user
    // converses, and then it has no size to frame anything against. Hold the
    // queue rather than aiming the camera at a zero-sized viewport.
    if (document.hidden || el.clientWidth < 1 || el.clientHeight < 1) {
      revealTimer.current = setTimeout(runReveal, 1000)
      return
    }
    const stop = revealQueue.current.shift()!
    const framed = frameNodes(stop.ids, REVEAL_MOVE_MS)
    if (framed) lastRevealAt.current = Date.now()
    // A stop whose nodes have since vanished costs no dwell — move straight on.
    if (revealQueue.current.length) {
      revealTimer.current = setTimeout(runReveal, framed ? REVEAL_HOLD_MS : 0)
    }
  }, [frameNodes])

  // A window hidden mid-glide would otherwise leave the camera between two
  // widgets until it is looked at again. Land it now; the framing is what
  // matters, the travel is not.
  useEffect(() => {
    const onHide = () => {
      if (!document.hidden || !glideTarget.current) return
      const to = glideTarget.current
      stopGlide()
      rf.setViewport(to)
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [rf, stopGlide])

  useEffect(() => () => {
    if (revealTimer.current) clearTimeout(revealTimer.current)
    stopGlide()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!nodes.length) {
      hadNodes.current = false
      revealQueue.current = []
      lastCreated.current = null
      history.current = []
      historyAt.current = -1
      if (revealTimer.current) { clearTimeout(revealTimer.current); revealTimer.current = null }
      return
    }
    // Cold start (board opened or switched) frames the whole board once. Its
    // nodes are all "new", which is not something to walk through one by one.
    if (!hadNodes.current) {
      hadNodes.current = true
      revealQueue.current = []
      requestAnimationFrame(() => rf.fitView({ padding: 0.12, duration: 400, maxZoom: 1 }))
      return
    }
    if (!newNodeIds.length) return

    // A gap since the last arrival means the queue is holding an older burst:
    // drop it. Content written minutes ago — often while this window sat
    // hidden — is not what the user came back to see.
    const now = Date.now()
    if (now - lastEnqueueAt.current > BURST_GAP_MS) revealQueue.current = []
    lastEnqueueAt.current = now

    // Group the new nodes by widget, keeping layout order. A widget already
    // waiting in the queue absorbs the additions instead of queueing twice —
    // a staggered batch reports the same widget on every layout pass.
    for (const id of newNodeIds) {
      const widgetId = widgetOf(id)
      const pending = revealQueue.current.find((s) => s.widgetId === widgetId)
      if (pending) { if (!pending.ids.includes(id)) pending.ids.push(id) }
      else revealQueue.current.push({ widgetId, ids: [id] })
    }
    if (revealQueue.current.length > MAX_REVEAL_STOPS) {
      revealQueue.current.splice(0, revealQueue.current.length - MAX_REVEAL_STOPS)
    }
    // What the jump control aims at, kept whether or not follow is on and
    // whether or not the queue ever gets to play it.
    const newest = revealQueue.current[revealQueue.current.length - 1]
    if (newest) lastCreated.current = newest.ids
    if (!followActive) { revealQueue.current = []; return }
    if (!revealTimer.current) revealTimer.current = setTimeout(runReveal, REVEAL_SETTLE_MS)
  }, [layoutSeq]) // eslint-disable-line react-hooks/exhaustive-deps

  const theme = boardStyle.theme === 'light' ? 'light' : 'dark'
  const bg = resolveBoardBackground(boardStyle.background, theme)
  const td = themeDefaults(theme)

  return (
    <div ref={wrapRef} className={`canvas-wrap theme-${theme}`} style={{ background: bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnDoubleClick={false}
        // Wheel pans the board (vertical wheel and a tilt/side wheel both
        // work); zoom is ctrl+wheel, the controls, or wheel with the left
        // mouse button held — see the effect above.
        zoomOnScroll={false}
        panOnScroll
        panOnScrollMode={PanOnScrollMode.Free}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        proOptions={{ hideAttribution: true }}
        // A null event means we moved the camera ourselves; only real user
        // gestures should suppress auto-panning. Tracked through the whole
        // gesture so a slow pan doesn't expire the window mid-drag.
        onMoveStart={(ev) => { if (ev) userTookOver() }}
        onMove={(ev) => { if (ev) userTookOver() }}
        onMoveEnd={(ev) => { if (ev) userTookOver() }}
      >
        <Background color={theme === 'dark' ? '#262c49' : '#d8dde6'} gap={24} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => (theme === 'dark' ? '#3a4066' : '#c6cedb')}
          maskColor={theme === 'dark' ? 'rgba(10,12,26,0.75)' : 'rgba(240,242,246,0.7)'}
          style={{ background: td.cardBg }}
        />
        <Controls showInteractive={false}>
          <ControlButton
            onClick={() => stepHistory(-1)}
            title="Back to the previous view (or your mouse's back button)"
            aria-label="Back to the previous view"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="4" y="7" width="9" height="2" />
              <rect x="3" y="6" width="2" height="4" /><rect x="4" y="5" width="2" height="2" />
              <rect x="4" y="9" width="2" height="2" /><rect x="5" y="4" width="2" height="2" />
              <rect x="5" y="10" width="2" height="2" />
            </svg>
          </ControlButton>
          <ControlButton
            onClick={() => stepHistory(1)}
            title="Forward to the next view (or your mouse's forward button)"
            aria-label="Forward to the next view"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="3" y="7" width="9" height="2" />
              <rect x="11" y="6" width="2" height="4" /><rect x="10" y="5" width="2" height="2" />
              <rect x="10" y="9" width="2" height="2" /><rect x="9" y="4" width="2" height="2" />
              <rect x="9" y="10" width="2" height="2" />
            </svg>
          </ControlButton>
          <ControlButton
            onClick={goToLatest}
            title="Jump to the latest widget (or click the mouse wheel)"
            aria-label="Jump to the latest widget"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <rect x="1" y="1" width="5" height="2" /><rect x="1" y="1" width="2" height="5" />
              <rect x="10" y="1" width="5" height="2" /><rect x="13" y="1" width="2" height="5" />
              <rect x="1" y="13" width="5" height="2" /><rect x="1" y="10" width="2" height="5" />
              <rect x="10" y="13" width="5" height="2" /><rect x="13" y="10" width="2" height="5" />
              <rect x="6" y="6" width="4" height="4" />
            </svg>
          </ControlButton>
        </Controls>
      </ReactFlow>
      {status === 'ready' && nodes.length === 0 && (
        <div className="overlay-state">
          <div className="overlay-card">
            <h2>Empty board</h2>
            <p>Start describing an idea in the Claude Code conversation — it will appear here as it's mapped.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const {
    boards, active, folder, selected, followActive, status, logErrors,
    boardTitle, selectBoard, setFollowActive, boardStyle,
  } = useMapStore()

  useEffect(() => { startConnection() }, [])

  const theme = boardStyle.theme === 'light' ? 'light' : 'dark'
  // Folder of the board on screen, which is what the picker should reflect.
  const shownFolder = boards.find((b) => b.id === selected)?.folder || folder
  const folders = [...new Set(boards.map((b) => b.folder || NO_FOLDER))]
  const viewFolder = shownFolder || NO_FOLDER
  // The board picker is scoped to the folder on screen.
  const folderBoards = boards.filter((b) => (b.folder || NO_FOLDER) === viewFolder)
  const activeFolder = boards.find((b) => b.id === active)?.folder || NO_FOLDER

  // Switching folder is a view change, not a write-target change: land on
  // Claude's active board when it lives here, otherwise the first one.
  const selectFolder = (f: string) => {
    const inFolder = boards.filter((b) => (b.folder || NO_FOLDER) === f)
    const target = inFolder.find((b) => b.id === active) || inFolder[0]
    if (target) selectBoard(target.id)
  }

  return (
    <div className={`app theme-${theme}`}>
      <header className="topbar">
        <span className="logo">Map</span>
        {folders.length > 0 && (
          <label className="folder-chip" title="Folder — scopes the board list below">
            <span className="folder-pixel" />
            <select
              className="folder-select"
              value={viewFolder}
              onChange={(e) => selectFolder(e.target.value)}
            >
              {folders.map((f) => (
                <option key={f} value={f}>{f}{f === activeFolder ? ' ●' : ''}</option>
              ))}
            </select>
            <span className="chip-caret">▾</span>
          </label>
        )}
        <span className="board-title">{boardTitle || selected || ''}</span>
        <div className="topbar-right">
          {boards.length > 0 && (
            <>
              <label className="follow-label" title="Switch to the board Claude is writing to, and centre each new widget as it lands">
                <input
                  type="checkbox"
                  checked={followActive}
                  onChange={(e) => setFollowActive(e.target.checked)}
                />
                follow active
              </label>
              <select
                value={selected || ''}
                onChange={(e) => selectBoard(e.target.value)}
                title="Boards in the selected folder"
              >
                {folderBoards.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}{b.id === active ? ' ●' : ''}</option>
                ))}
              </select>
            </>
          )}
          <span className={`conn-dot ${status}`} title={status} />
        </div>
      </header>

      {status === 'disconnected' && (
        <div className="banner warn">Server unreachable — reconnecting…</div>
      )}
      {logErrors.length > 0 && (
        <div className="banner error">
          Board file problem: {logErrors[0]}{logErrors.length > 1 ? ` (+${logErrors.length - 1} more)` : ''}
        </div>
      )}

      {status === 'no-board' ? (
        <div className="overlay-state static">
          <div className="overlay-card">
            <h2>No boards yet</h2>
            <p>Create one from the conversation, or run:</p>
            <code>node scripts/boards.mjs create my-first-board --folder my-folder</code>
          </div>
        </div>
      ) : (
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      )}
    </div>
  )
}
