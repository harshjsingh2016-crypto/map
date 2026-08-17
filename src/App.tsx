import { useEffect, useRef } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, MiniMap, Controls,
  useReactFlow, useUpdateNodeInternals, type Node,
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

function Canvas() {
  const { nodes, edges, boardStyle, newNodeIds, layoutSeq, status } = useMapStore()
  const rf = useReactFlow()
  const updateNodeInternals = useUpdateNodeInternals()
  const lastUserMove = useRef(0)
  const hadNodes = useRef(false)

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

  // Camera policy: user interaction always wins. Auto-move only when idle
  // >5s, and only pan to newly added content — never re-fit mid-session.
  useEffect(() => {
    if (!nodes.length) { hadNodes.current = false; return }
    const firstContent = !hadNodes.current
    hadNodes.current = true
    if (firstContent) {
      requestAnimationFrame(() => rf.fitView({ padding: 0.12, duration: 400, maxZoom: 1 }))
      return
    }
    if (!newNodeIds.length) return
    if (Date.now() - lastUserMove.current < 5000) return
    const byId = new Map(nodes.map((n) => [n.id, n]))
    const fresh = newNodeIds.map((id) => byId.get(id)).filter(Boolean) as Node[]
    if (!fresh.length) return
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of fresh) {
      const { x, y } = absPos(n, byId)
      const w = Number(n.style?.width) || 150
      const h = Number(n.style?.height) || 50
      minX = Math.min(minX, x); minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h)
    }
    const zoom = rf.getViewport().zoom
    rf.setCenter((minX + maxX) / 2, (minY + maxY) / 2, { zoom, duration: 500 })
  }, [layoutSeq]) // eslint-disable-line react-hooks/exhaustive-deps

  const theme = boardStyle.theme === 'light' ? 'light' : 'dark'
  const bg = resolveBoardBackground(boardStyle.background, theme)
  const td = themeDefaults(theme)

  return (
    <div className={`canvas-wrap theme-${theme}`} style={{ background: bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnDoubleClick={false}
        minZoom={0.08}
        proOptions={{ hideAttribution: true }}
        // A null event means we moved the camera ourselves; only real user
        // gestures should suppress auto-panning. Tracked through the whole
        // gesture so a slow pan doesn't expire the window mid-drag.
        onMoveStart={(ev) => { if (ev) lastUserMove.current = Date.now() }}
        onMove={(ev) => { if (ev) lastUserMove.current = Date.now() }}
        onMoveEnd={(ev) => { if (ev) lastUserMove.current = Date.now() }}
      >
        <Background color={theme === 'dark' ? '#262c49' : '#d8dde6'} gap={24} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => (theme === 'dark' ? '#3a4066' : '#c6cedb')}
          maskColor={theme === 'dark' ? 'rgba(10,12,26,0.75)' : 'rgba(240,242,246,0.7)'}
          style={{ background: td.cardBg }}
        />
        <Controls showInteractive={false} />
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
              <label className="follow-label" title="Automatically switch to the board Claude is writing to">
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
