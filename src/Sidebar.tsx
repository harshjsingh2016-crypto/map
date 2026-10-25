// Left drawer: every folder (this repo's and mounted projects'), bucketed into
// collapsible groups, each folder expanding to its boards. Choosing a board is a view
// change, like the header pickers; the write target still moves only in conversation.
// Group membership is shared (boards/.groups.json, synced); which groups and folders are
// open is a per-laptop convenience kept in localStorage.
import { useEffect, useMemo, useState } from 'react'
import type { DragEvent, KeyboardEvent } from 'react'
import { useMapStore } from './store'
import type { BoardRef, FolderGroup } from './store'

/** Label for boards that sit outside any folder. */
export const NO_FOLDER = '(no folder)'
export const folderOf = (b: BoardRef) => b.folder || NO_FOLDER

/** Newest board first — the one you just made is the one you want. */
export const byNewest = (a: BoardRef, b: BoardRef) =>
  (b.createdAt || 0) - (a.createdAt || 0) || a.name.localeCompare(b.name)

const FOLDER_MIME = 'application/x-map-folder'
const GROUP_MIME = 'application/x-map-group'

function loadFlags(key: string): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(key) || '{}') || {} } catch { return {} }
}
function usePersistedFlags(key: string) {
  const [flags, setFlags] = useState<Record<string, boolean>>(() => loadFlags(key))
  const toggle = (k: string, current: boolean) => setFlags((f) => {
    const next = { ...f, [k]: !current }
    try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* private window */ }
    return next
  })
  return [flags, toggle] as const
}

function slugify(label: string, taken: Set<string>) {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'group'
  let id = base
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`
  return id
}

/** Take a folder out of every group, then insert it into `toId` (null = ungrouped). */
function placeFolder(groups: FolderGroup[], folder: string, toId: string | null, before?: string) {
  return groups.map((g) => {
    const folders = g.folders.filter((f) => f !== folder)
    if (g.id !== toId) return { ...g, folders }
    const at = before ? folders.indexOf(before) : -1
    if (at < 0) folders.push(folder)
    else folders.splice(at, 0, folder)
    return { ...g, folders }
  })
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { boards, active, selected, groups, groupsError, saveGroups, selectBoard } = useMapStore()
  const [collapsedGroups, toggleGroup] = usePersistedFlags('map.sidebar.collapsedGroups')
  const [openFolders, toggleFolder] = usePersistedFlags('map.sidebar.openFolders')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [creating, setCreating] = useState<{ folder?: string } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [dropKey, setDropKey] = useState<string | null>(null)

  const byFolder = useMemo(() => {
    const m = new Map<string, BoardRef[]>()
    for (const b of boards) m.set(folderOf(b), [...(m.get(folderOf(b)) || []), b])
    for (const list of m.values()) list.sort(byNewest)
    return m
  }, [boards])
  const grouped = new Set(groups.flatMap((g) => g.folders))
  const ungrouped = [...byFolder.keys()].filter((f) => !grouped.has(f)).sort()
  const shownFolder = boards.find((b) => b.id === selected)
  const activeFolder = boards.find((b) => b.id === active)
  const groupOf = (f: string) => groups.find((g) => g.folders.includes(f))?.id ?? null

  // A click anywhere else closes the folder menu.
  useEffect(() => {
    if (!menuFor) return
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.sb-menu, .sb-more')) setMenuFor(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuFor])

  const commitCreate = () => {
    const label = draft.trim()
    if (label) {
      const id = slugify(label, new Set(groups.map((g) => g.id)))
      let next = [...groups, { id, label: label.slice(0, 40), folders: [] as string[] }]
      if (creating?.folder) next = placeFolder(next, creating.folder, id)
      saveGroups(next)
    }
    setCreating(null); setDraft('')
  }
  const commitRename = () => {
    const label = draft.trim().slice(0, 40)
    if (label && renaming) saveGroups(groups.map((g) => (g.id === renaming ? { ...g, label } : g)))
    setRenaming(null); setDraft('')
  }
  const inputKeys = (commit: () => void, cancel: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation() // keep Escape from also closing the drawer
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') cancel()
  }

  // ---- drag and drop: folders into groups (or before a folder), groups before groups ----
  const dragProps = (mime: string, value: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.dataTransfer.setData(mime, value)
      e.dataTransfer.effectAllowed = 'move'
      setMenuFor(null)
    },
    onDragEnd: () => setDropKey(null),
  })
  const dropProps = (key: string, accepts: string[], onDrop: (mime: string, value: string) => void) => ({
    onDragOver: (e: DragEvent) => {
      if (!accepts.some((m) => e.dataTransfer.types.includes(m))) return
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = 'move'
      if (dropKey !== key) setDropKey(key)
    },
    onDragLeave: (e: DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDropKey((k) => (k === key ? null : k))
    },
    onDrop: (e: DragEvent) => {
      const mime = accepts.find((m) => e.dataTransfer.types.includes(m))
      if (!mime) return
      e.preventDefault()
      e.stopPropagation()
      setDropKey(null)
      onDrop(mime, e.dataTransfer.getData(mime))
    },
  })
  const moveGroupBefore = (id: string, beforeId: string | null) => {
    if (id === beforeId) return
    const moving = groups.find((g) => g.id === id)
    if (!moving) return
    const rest = groups.filter((g) => g.id !== id)
    const at = beforeId ? rest.findIndex((g) => g.id === beforeId) : -1
    rest.splice(at < 0 ? rest.length : at, 0, moving)
    saveGroups(rest)
  }
  const dropFolder = (folder: string, toId: string | null, before?: string) => {
    if (folder === before) return
    saveGroups(placeFolder(groups, folder, toId, before))
  }

  const renderFolder = (f: string, groupId: string | null) => {
    const list = byFolder.get(f) || []
    const source = list[0]?.source
    const isOpen = openFolders[f] ?? folderOf(shownFolder || ({} as BoardRef)) === f
    const key = `folder:${f}`
    return (
      <li key={f} className="sb-folder-item">
        <div
          className={`sb-row sb-folder${dropKey === key ? ' drop-before' : ''}`}
          {...dragProps(FOLDER_MIME, f)}
          {...dropProps(key, [FOLDER_MIME], (_m, v) => dropFolder(v, groupId, f))}
        >
          <button className="sb-toggle" aria-expanded={isOpen} onClick={() => toggleFolder(f, isOpen)}>
            <span className="sb-caret">{isOpen ? '▾' : '▸'}</span>
            <span className="folder-pixel" />
            <span className="sb-name">{f}</span>
            {source && <span className="sb-tag" title={`Mounted from ${source} — read-only here`}>{source}</span>}
            {activeFolder && folderOf(activeFolder) === f && <span className="sb-active" title="Claude is writing here">●</span>}
            <span className="sb-count">{list.length}</span>
          </button>
          <button className="sb-more" title="Move to a group" onClick={() => setMenuFor(menuFor === f ? null : f)}>⋯</button>
          {menuFor === f && (
            <div className="sb-menu" role="menu">
              {groups.filter((g) => g.id !== groupId).map((g) => (
                <button key={g.id} role="menuitem" onClick={() => { dropFolder(f, g.id); setMenuFor(null) }}>
                  Move to {g.label}
                </button>
              ))}
              {groupId && (
                <button role="menuitem" onClick={() => { dropFolder(f, null); setMenuFor(null) }}>Remove from group</button>
              )}
              <button role="menuitem" onClick={() => { setCreating({ folder: f }); setDraft(''); setMenuFor(null) }}>
                New group with this folder
              </button>
            </div>
          )}
        </div>
        {isOpen && (
          <ul className="sb-boards">
            {list.map((b) => (
              <li key={b.id}>
                <button
                  className={`sb-row sb-board${b.id === selected ? ' selected' : ''}`}
                  onClick={() => selectBoard(b.id)}
                  title={b.readonly ? `${b.id} — read-only here` : b.id}
                >
                  <span className="sb-name">{b.name}</span>
                  {b.id === active && <span className="sb-active" title="Claude is writing here">●</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <aside
      className={`sidebar${open ? ' open' : ''}`}
      aria-hidden={!open}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div className="sb-head">
        <span className="sb-title">Folders</span>
        <button className="sb-btn" onClick={() => { setCreating({}); setDraft('') }}>+ Group</button>
        <button className="sb-btn sb-close" title="Close (Esc)" onClick={onClose}>×</button>
      </div>

      {groupsError && <div className="sb-error">{groupsError}</div>}

      <div className="sb-scroll">
        {creating && (
          <div className="sb-create">
            <input
              autoFocus
              value={draft}
              maxLength={40}
              placeholder={creating.folder ? `New group for ${creating.folder}` : 'Group name'}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={inputKeys(commitCreate, () => { setCreating(null); setDraft('') })}
              onBlur={commitCreate}
            />
          </div>
        )}

        {groups.map((g) => {
          const present = g.folders.filter((f) => byFolder.has(f))
          const isCollapsed = !!collapsedGroups[g.id]
          const key = `group:${g.id}`
          return (
            <section
              key={g.id}
              className={`sb-group${dropKey === key ? ' drop-into' : ''}`}
              {...dropProps(key, [FOLDER_MIME, GROUP_MIME], (mime, v) =>
                mime === GROUP_MIME ? moveGroupBefore(v, g.id) : dropFolder(v, g.id))}
            >
              <div className="sb-row sb-group-head" {...dragProps(GROUP_MIME, g.id)}>
                {renaming === g.id ? (
                  <input
                    className="sb-rename"
                    autoFocus
                    value={draft}
                    maxLength={40}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={inputKeys(commitRename, () => { setRenaming(null); setDraft('') })}
                    onBlur={commitRename}
                  />
                ) : (
                  <button
                    className="sb-toggle"
                    aria-expanded={!isCollapsed}
                    onClick={() => toggleGroup(g.id, isCollapsed)}
                    onDoubleClick={() => { setRenaming(g.id); setDraft(g.label) }}
                    title="Double-click to rename"
                  >
                    <span className="sb-caret">{isCollapsed ? '▸' : '▾'}</span>
                    <span className="sb-name">{g.label}</span>
                    <span className="sb-count">{present.length}</span>
                  </button>
                )}
                <button className="sb-more" title="Rename group" onClick={() => { setRenaming(g.id); setDraft(g.label) }}>✎</button>
                <button
                  className="sb-more"
                  title="Delete group — its folders move to Ungrouped"
                  onClick={() => saveGroups(groups.filter((x) => x.id !== g.id))}
                >×</button>
              </div>
              {!isCollapsed && (
                <ul className="sb-folders">
                  {present.map((f) => renderFolder(f, g.id))}
                  {present.length === 0 && <li className="sb-empty">Drop a folder here</li>}
                </ul>
              )}
            </section>
          )
        })}

        {(ungrouped.length > 0 || groups.length > 0) && (
          <section
            className={`sb-group sb-ungrouped${dropKey === 'ungrouped' ? ' drop-into' : ''}`}
            {...dropProps('ungrouped', [FOLDER_MIME, GROUP_MIME], (mime, v) =>
              mime === GROUP_MIME ? moveGroupBefore(v, null) : dropFolder(v, null))}
          >
            {groups.length > 0 && <div className="sb-section-label">Ungrouped</div>}
            <ul className="sb-folders">
              {ungrouped.map((f) => renderFolder(f, null))}
              {ungrouped.length === 0 && <li className="sb-empty">Every folder is in a group</li>}
            </ul>
          </section>
        )}
      </div>

      <div className="sb-foot">Drag folders between groups · drag a group to reorder</div>
    </aside>
  )
}
