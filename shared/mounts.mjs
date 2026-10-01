// Mounted projects. Map's projects.json lists other repos that keep their own
// boards/ and wiki/ in Map's layout; Map reads them in place and never writes
// to them. A root with no projects.json (every project root) has no mounts,
// so all of this collapses to the single-root behaviour of log.mjs.
import fs from 'node:fs'
import path from 'node:path'
import {
  boardsDir, boardPath, listBoards, listFolders, parseBoardId, getActiveBoard,
} from './log.mjs'

export const REGISTRY_FILE = 'projects.json'
export const LOCAL_REGISTRY_FILE = 'projects.local.json'

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

/**
 * Registry entries as { alias, path, remote, folders, present }. `path` is
 * absolute (a relative one resolves against `root`); projects.local.json
 * ({alias: path}, untracked) overrides it per machine. `folders` is the
 * declared list plus whatever the checkout actually holds — declared so the
 * write guard still knows a folder is taken when the checkout is absent.
 */
export function readRegistry(root) {
  const reg = readJson(path.join(root, REGISTRY_FILE))
  if (!reg || !Array.isArray(reg.projects)) return []
  const local = readJson(path.join(root, LOCAL_REGISTRY_FILE)) || {}
  return reg.projects
    .filter((p) => p && typeof p.alias === 'string' && (p.path || local[p.alias]))
    .map((p) => {
      const abs = path.resolve(root, local[p.alias] || p.path)
      const present = fs.existsSync(abs)
      const declared = Array.isArray(p.folders) ? p.folders : []
      const found = present ? listFolders(abs) : []
      return {
        alias: p.alias,
        path: abs,
        remote: p.remote || null,
        folders: [...new Set([...declared, ...found])],
        present,
      }
    })
}

/** The registry entry that claims `folder`, or null when no project does. */
export function folderOwner(root, folder) {
  if (!folder) return null
  return readRegistry(root).find((p) => p.folders.includes(folder)) || null
}

/**
 * Every board this root can see: its own plus each present mount's, as
 * { id, folder, name, createdAt, source, readonly }. `source` is the project
 * alias (null for the root's own boards). A folder claimed twice goes to the
 * root itself first, then to the earlier registry entry; the loser's boards
 * are dropped and the clash is reported in `errors`. Projects whose checkout
 * is not on this machine are listed in `missing`.
 */
export function listAllBoards(root) {
  const own = listBoards(root).map((b) => ({ ...b, source: null, readonly: false }))
  const taken = new Map(listFolders(root).map((f) => [f, 'this repo']))
  const boards = [...own]
  const errors = []
  const missing = []
  for (const p of readRegistry(root)) {
    if (!p.present) { missing.push(p.alias); continue }
    const clashed = new Set()
    for (const b of listBoards(p.path)) {
      if (!b.folder) continue // loose root-level boards are not mountable
      const holder = taken.get(b.folder)
      if (holder && holder !== p.alias) {
        if (!clashed.has(b.folder)) {
          clashed.add(b.folder)
          errors.push(`folder "${b.folder}" is claimed by both ${holder} and ${p.alias}; showing the one from ${holder}`)
        }
        continue
      }
      taken.set(b.folder, p.alias)
      boards.push({ ...b, source: p.alias, readonly: true })
    }
  }
  boards.sort((a, b) =>
    (a.folder || '').localeCompare(b.folder || '') || a.name.localeCompare(b.name))
  return { boards, errors, missing }
}

const SAFE_SEGMENT = /^[^\\/:.][^\\/:]*$/

/**
 * Resolve "folder/name" or a bare unique name across this root and its
 * mounts. Returns { id, matches, path, root, mounted, alias }. An id that
 * names no existing board still gets the path it would live at (so callers
 * can print "does not exist" or create it) — unless a segment could step
 * outside boards/, in which case path is null.
 */
export function resolveBoard(root, input) {
  const { boards } = listAllBoards(root)
  const { folder, name } = parseBoardId(input)
  let hit = null
  let matches = []
  if (folder) {
    hit = boards.find((b) => b.folder === folder && b.name === name) || null
    matches = hit ? [hit] : []
  } else {
    matches = boards.filter((b) => b.name === name)
    hit = matches.length === 1 ? matches[0] : null
  }
  const id = hit ? hit.id : null
  const target = id || String(input || '')
  const t = parseBoardId(target)
  const safe = SAFE_SEGMENT.test(t.name) && (!t.folder || SAFE_SEGMENT.test(t.folder))
  let owner = null
  if (hit) {
    if (hit.source) owner = readRegistry(root).find((p) => p.alias === hit.source) || null
  } else {
    owner = folderOwner(root, t.folder)
  }
  const base = owner ? owner.path : root
  return {
    id,
    matches,
    path: safe ? boardPath(base, target) : null,
    root: base,
    mounted: !!owner,
    alias: owner ? owner.alias : null,
  }
}

/**
 * Throws when `idOrFolder` belongs to a mounted project. Map reads mounts; the
 * project's own sessions write them, by pointing the scripts at that root.
 */
export function assertWritable(root, idOrFolder) {
  const s = String(idOrFolder || '')
  const isId = s.includes('/')
  const folder = isId ? parseBoardId(s).folder : s
  const owner = folderOwner(root, folder)
  if (!owner) return
  const what = isId ? `board "${s}"` : `folder "${folder}"`
  throw new Error(mountRefusal(what, { alias: owner.alias, root: owner.path }))
}

/** The one message every write script gives for a mounted target. */
export function mountRefusal(what, { alias, root }) {
  return `${what} belongs to mounted project ${alias} — rerun with --root "${root}"`
}

/**
 * The board most recently made a write target across this root and its
 * mounts: the newest .active file that names a board which exists. This is
 * what a viewer should follow — a project session drawing on its own
 * blueprint moves its own .active, never Map's.
 */
export function newestActive(root) {
  const roots = [root, ...readRegistry(root).filter((p) => p.present).map((p) => p.path)]
  const known = new Set(listAllBoards(root).boards.map((b) => b.id))
  let best = null
  for (const r of roots) {
    const id = getActiveBoard(r)
    if (!id || !known.has(id)) continue
    let mtime = 0
    try { mtime = fs.statSync(path.join(boardsDir(r), '.active')).mtimeMs } catch { /* raced */ }
    if (!best || mtime > best.mtime) best = { id, mtime }
  }
  return best ? best.id : getActiveBoard(root)
}

/** `ts` of the last complete batch in a board log, or 0. Reads only the tail. */
export function lastBatchTs(file) {
  let fd
  try {
    fd = fs.openSync(file, 'r')
    const CHUNK = 64 * 1024
    let pos = fs.fstatSync(fd).size
    let tail = ''
    while (pos > 0) {
      const len = Math.min(CHUNK, pos)
      pos -= len
      const buf = Buffer.alloc(len)
      fs.readSync(fd, buf, 0, len, pos)
      tail = buf.toString('utf8') + tail
      const lines = tail.split('\n').filter((l) => l.trim())
      // The first fragment may be cut mid-line unless we reached the file start.
      const usable = pos === 0 ? lines : lines.slice(1)
      for (let i = usable.length - 1; i >= 0; i--) {
        try {
          const ts = JSON.parse(usable[i]).ts
          if (Number.isFinite(ts)) return ts
        } catch { /* partial trailing line */ }
      }
    }
    return 0
  } catch {
    return 0
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* already gone */ }
  }
}
