#!/usr/bin/env node
// Hand boards, their wiki articles and their walkthrough sidecars over to the
// project they belong to. Run from Map; the project must already be registered
// (projects.mjs add) and checked out on this machine.
//
//   node scripts/migrate.mjs --boards damensch/qvs-agent --project qvs-agent [--as qvs-agent]
//   node scripts/migrate.mjs --folders scalar,scalar-2,scalar-primers --project armor
//   ... add --dry-run to print the plan and change nothing
//
// --boards moves the named boards into ONE folder of the project (--as, default
// the project's first declared folder). --folders moves whole folders, names
// kept. Move everything that belongs together in one run: links between
// articles that travel together survive, links to anything left behind do not.
//
// What moves with a board:
//   - a wiki article whose FIRST listed board is being moved. Ids it lists that
//     are not going to the project are dropped from `boards:`.
//   - a walkthroughs/*.progress.md whose `Board:` line names it.
// What gets rewritten:
//   - `boards:` ids, old -> new, in moved and staying articles alike.
//   - a link that would cross repos becomes its link text plus "(in the X wiki)".
//     Wiki links never cross repos; each one is listed so the wording can be
//     improved by hand.
//   - both index.md files: moved entries leave Map's and land in the project's
//     under the same heading.
// Nothing is committed. Review, then `sync.mjs push` here and
// `sync.mjs push --root <project>` there.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { boardPath, boardsDir, boardId, parseBoardId, listBoards, getActiveBoard, setActiveBoard } from '../shared/log.mjs'
import { readRegistry, REGISTRY_FILE } from '../shared/mounts.mjs'
import { MAP_HOME, resolveRoot } from '../shared/root.mjs'

// --root exists for the test suite; in real use this runs against Map itself.
const { root: ROOT, argv } = resolveRoot()
const flag = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : null
}
const DRY = argv.includes('--dry-run')
const die = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1) }
const list = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean)
const NAME = /^[a-z0-9][a-z0-9-]*$/

const alias = flag('project')
if (!alias) die('usage: migrate.mjs (--boards a/b,c/d | --folders f,g) --project <alias> [--as <folder>] [--dry-run]')
const project = readRegistry(ROOT).find((p) => p.alias === alias)
if (!project) die(`no mounted project "${alias}" — register it first: node scripts/projects.mjs add ${alias} <path>`)
if (!project.present) die(`project ${alias} is not on this machine (${project.path}) — run this where it is checked out`)

// ---- which boards, and what they become ------------------------------------
const own = listBoards(ROOT)
const idMap = new Map() // old id -> new id
if (flag('folders')) {
  for (const folder of list(flag('folders'))) {
    const inFolder = own.filter((b) => b.folder === folder)
    if (!inFolder.length) die(`no boards in folder "${folder}" here`)
    for (const b of inFolder) idMap.set(b.id, b.id)
  }
} else if (flag('boards')) {
  const target = flag('as') || project.folders[0] || alias
  if (!NAME.test(target)) die(`folder name must be kebab-case: "${target}"`)
  for (const id of list(flag('boards'))) {
    const b = own.find((x) => x.id === id)
    if (!b) die(`no board "${id}" here (want folder/name)`)
    idMap.set(id, boardId(target, b.name))
  }
} else {
  die('name what to move: --boards a/b,c/d or --folders f,g')
}
for (const [from, to] of idMap) {
  if (fs.existsSync(boardPath(project.path, to))) die(`${alias} already has a board "${to}" (moving ${from})`)
}
const newFolders = [...new Set([...idMap.values()].map((id) => parseBoardId(id).folder))]
const oldFolders = [...new Set([...idMap.keys()].map((id) => parseBoardId(id).folder))]
// A folder name has one owner. A folder that keeps boards here cannot also be the project's.
for (const f of newFolders) {
  const staying = own.filter((b) => b.folder === f && !idMap.has(b.id))
  if (staying.length) die(`folder "${f}" would exist in both places — ${staying.map((b) => b.id).join(', ')} stay here. Move them too, or use --as.`)
}

// ---- wiki ------------------------------------------------------------------
const WIKI = path.join(ROOT, 'wiki')
const DEST_WIKI = path.join(project.path, 'wiki')
const FM_BOARDS = /^boards:\s*\[([^\]]*)\]\s*$/m
const LINK = /\[([^\]]+)\]\(([^)#\s]+\.md)(#[^)]*)?\)/g
const readIf = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null)

const articles = new Map() // file -> { text, boards }
if (fs.existsSync(WIKI)) {
  for (const f of fs.readdirSync(WIKI)) {
    if (!f.endsWith('.md') || f === 'index.md') continue
    const text = fs.readFileSync(path.join(WIKI, f), 'utf8')
    const m = text.match(FM_BOARDS)
    articles.set(f, { text, boards: m ? list(m[1]) : [] })
  }
}
const moving = new Set([...articles].filter(([, a]) => idMap.has(a.boards[0])).map(([f]) => f))
const destHas = new Set(fs.existsSync(DEST_WIKI) ? fs.readdirSync(DEST_WIKI).filter((f) => f.endsWith('.md')) : [])
for (const f of moving) if (destHas.has(f)) die(`${alias} already has wiki/${f} — reconcile the two by hand first`)

const notes = []
const out = new Map() // absolute path -> new content
const remove = []     // absolute paths

for (const [f, a] of articles) {
  const isMoving = moving.has(f)
  let text = a.text
  // boards: line
  const kept = []
  for (const id of a.boards) {
    if (idMap.has(id)) kept.push(idMap.get(id))
    else if (isMoving) notes.push(`${f}: dropped board "${id}" from boards: (stays in Map) — name it in prose if it matters`)
    else kept.push(id)
  }
  if (a.boards.some((id) => idMap.has(id)) || isMoving) {
    text = text.replace(FM_BOARDS, `boards: [${[...new Set(kept)].join(', ')}]`)
  }
  // links that would now cross repos
  text = text.replace(LINK, (whole, label, target) => {
    if (/^[a-z]+:/.test(target) || target.includes('/')) return whole
    const targetMoves = moving.has(target)
    const reachable = isMoving ? targetMoves || destHas.has(target) : !targetMoves
    if (reachable || target === 'index.md') return whole
    const where = isMoving ? 'Map' : alias
    notes.push(`${f}: link to ${target} now crosses repos — reworded as "${label} (in the ${where} wiki)"`)
    return `${label} (in the ${where} wiki)`
  })
  if (isMoving) {
    out.set(path.join(DEST_WIKI, f), text)
    remove.push(path.join(WIKI, f))
  } else if (text !== a.text) {
    out.set(path.join(WIKI, f), text)
  }
}

// index.md on both sides: moved entries travel under their heading.
const mapIndex = readIf(path.join(WIKI, 'index.md'))
if (mapIndex !== null && moving.size) {
  const keep = []
  const carried = [] // { heading, line }
  let heading = null
  for (const line of mapIndex.split('\n')) {
    if (/^## /.test(line)) heading = line
    const links = [...line.matchAll(LINK)].map((m) => m[2])
    if (links.length && links.every((t) => moving.has(t))) { carried.push({ heading, line }); continue }
    keep.push(line)
  }
  // Drop headings left with nothing under them.
  const pruned = []
  for (let i = 0; i < keep.length; i++) {
    if (/^## /.test(keep[i])) {
      let j = i + 1
      while (j < keep.length && !keep[j].trim()) j++
      if (j >= keep.length || /^## /.test(keep[j])) { i = j - 1; continue }
    }
    pruned.push(keep[i])
  }
  out.set(path.join(WIKI, 'index.md'), pruned.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n')

  let dest = readIf(path.join(DEST_WIKI, 'index.md'))
  if (dest === null) {
    dest = `# Wiki\n\nThe account of this project: what it is for, how it is built and why, where it stands and what is next. Distilled from the boards under \`boards/\`.\n`
  }
  const destLines = dest.trimEnd().split('\n')
  for (const { heading, line } of carried) {
    const h = heading || '## Articles'
    let at = destLines.findIndex((l) => l === h)
    if (at < 0) { destLines.push('', h, ''); at = destLines.length - 2 }
    let end = at + 1
    while (end < destLines.length && !/^## /.test(destLines[end])) end++
    while (end > at + 1 && !destLines[end - 1].trim()) end--
    // An empty section still gets its blank line between heading and first entry.
    if (end === at + 1) destLines.splice(end++, 0, '')
    destLines.splice(end, 0, line)
  }
  out.set(path.join(DEST_WIKI, 'index.md'), destLines.join('\n') + '\n')
}

// ---- walkthrough sidecars --------------------------------------------------
const WALK = path.join(ROOT, 'walkthroughs')
const sidecars = []
if (fs.existsSync(WALK)) {
  for (const f of fs.readdirSync(WALK)) {
    const text = fs.readFileSync(path.join(WALK, f), 'utf8')
    const m = text.match(/^Board:\s*(\S+)\s*$/m)
    if (!m || !idMap.has(m[1])) continue
    sidecars.push(f)
    out.set(path.join(project.path, 'walkthroughs', f), text.replace(m[0], `Board: ${idMap.get(m[1])}`))
    remove.push(path.join(WALK, f))
  }
}

// ---- report ----------------------------------------------------------------
console.log(`${DRY ? 'DRY RUN — would move' : 'Moving'} to ${alias} (${project.path}):`)
for (const [from, to] of idMap) console.log(`  board    ${from}${from === to ? '' : `  ->  ${to}`}`)
for (const f of moving) console.log(`  article  ${f}`)
for (const f of sidecars) console.log(`  sidecar  ${f}`)
console.log(`  ${idMap.size} board(s), ${moving.size} article(s), ${sidecars.length} sidecar(s)`)
const edited = [...out.keys()].filter((p) => p.startsWith(WIKI) && !p.endsWith('index.md'))
if (edited.length) console.log(`Staying in Map but edited: ${edited.map((p) => path.basename(p)).join(', ')}`)
if (notes.length) {
  console.log('Needs a human read:')
  for (const n of notes) console.log(`  - ${n}`)
}
if (DRY) process.exit(0)

// ---- apply -----------------------------------------------------------------
for (const [from, to] of idMap) {
  const dest = boardPath(project.path, to)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(boardPath(ROOT, from), dest)
  fs.unlinkSync(boardPath(ROOT, from))
}
for (const f of oldFolders) {
  const dir = path.join(boardsDir(ROOT), f)
  if (fs.existsSync(dir) && !fs.readdirSync(dir).length) fs.rmdirSync(dir)
}
for (const [file, text] of out) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text, 'utf8')
}
for (const file of remove) fs.unlinkSync(file)

// The registry learns the folders, so the write guard covers them from now on.
{
  const file = path.join(ROOT, REGISTRY_FILE)
  const reg = JSON.parse(fs.readFileSync(file, 'utf8'))
  const entry = reg.projects.find((p) => p.alias === alias)
  entry.folders = [...new Set([...(entry.folders || []), ...newFolders])]
  fs.writeFileSync(file, JSON.stringify(reg, null, 2) + '\n', 'utf8')
}
// Map's write target can never be a mounted board; hand the pointer to the project.
const active = getActiveBoard(ROOT)
if (active && idMap.has(active)) {
  fs.unlinkSync(path.join(boardsDir(ROOT), '.active'))
  setActiveBoard(project.path, idMap.get(active))
  console.log(`Map's active board moved with it — pick a new one here with boards.mjs use`)
}

for (const [label, args] of [['Map', []], [alias, ['--root', project.path]]]) {
  try {
    const res = execFileSync('node', [path.join(MAP_HOME, 'scripts', 'wiki.mjs'), ...(args.length ? args : ['--root', ROOT]), 'check'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    console.log(`wiki check (${label}): ${res.trim().split('\n').pop()}`)
  } catch (e) {
    console.log(`wiki check (${label}) FAILED:\n${e.stdout || ''}${e.stderr || ''}`)
  }
}
console.log(`Done. Nothing is committed — review both repos, then:\n  node scripts/sync.mjs push\n  node scripts/sync.mjs push --root "${project.path}"`)
