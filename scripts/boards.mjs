#!/usr/bin/env node
// Board and folder management. Boards live at boards/<folder>/<name>.board.jsonl.
//
//   node scripts/boards.mjs list                       list folders and their boards
//   node scripts/boards.mjs folders                    list folders only
//   node scripts/boards.mjs folder <name>              switch working folder (creates it)
//   node scripts/boards.mjs create <name> [--folder f] new board in f (default: working folder)
//   node scripts/boards.mjs use <folder/name|name>     switch active board
//   node scripts/boards.mjs move <folder/name|name> <folder>
//   node scripts/boards.mjs rename <folder/name|name> <newName>
//
// Add --root <dir> to manage another project's boards. Without it, folders
// that belong to a mounted project (projects.json) are listed but read-only.
import fs from 'node:fs'
import path from 'node:path'
import {
  listBoards, listFolders, boardPath, boardsDir, boardId, parseBoardId,
  getActiveBoard, setActiveBoard, getActiveFolder, setActiveFolder,
  DEFAULT_FOLDER,
} from '../shared/log.mjs'
import { listAllBoards, resolveBoard, assertWritable, readRegistry } from '../shared/mounts.mjs'
import { resolveRoot } from '../shared/root.mjs'

const { root: ROOT, argv } = resolveRoot()
const [cmd, a, b] = argv
const folderFlag = (() => {
  const i = argv.indexOf('--folder')
  return i > -1 ? argv[i + 1] : null
})()

const NAME = /^[a-z0-9][a-z0-9-]*$/
const die = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1) }

function resolveOrDie(input) {
  const { id, matches } = resolveBoard(ROOT, input)
  if (id) return id
  if (matches.length > 1) {
    die(`"${input}" exists in more than one folder: ${matches.map((m) => m.id).join(', ')}. Use the full folder/name.`)
  }
  die(`board "${input}" does not exist. Existing: ${listAllBoards(ROOT).boards.map((x) => x.id).join(', ') || '(none)'}`)
}

// Mounted projects are read-only from this root; their own sessions write them.
function writableOrDie(idOrFolder) {
  try { assertWritable(ROOT, idOrFolder) } catch (e) { die(e.message) }
}

switch (cmd) {
  case 'list': {
    const active = getActiveBoard(ROOT)
    const workingFolder = getActiveFolder(ROOT)
    const { boards, errors, missing } = listAllBoards(ROOT)
    if (!boards.length) console.log('(no boards yet)')
    const byFolder = new Map()
    for (const bd of boards) {
      const key = bd.folder || '(no folder)'
      if (!byFolder.has(key)) byFolder.set(key, [])
      byFolder.get(key).push(bd)
    }
    for (const [folder, items] of byFolder) {
      const source = items[0].source
      console.log(`${folder}${source ? `  [${source}, read-only here]` : ''}${folder === workingFolder ? '  <- working folder' : ''}`)
      for (const bd of items) console.log(`  ${bd.id === active ? '* ' : '  '}${bd.name}`)
    }
    for (const alias of missing) {
      const p = readRegistry(ROOT).find((x) => x.alias === alias)
      console.log(`(${alias}: not on this machine — ${p.folders.join(', ') || 'no folders declared'})`)
    }
    for (const e of errors) console.log(`WARNING: ${e}`)
    break
  }

  case 'folders': {
    const working = getActiveFolder(ROOT)
    const folders = listFolders(ROOT)
    if (!folders.length) { console.log('(no folders yet)'); break }
    for (const f of folders) console.log(`${f === working ? '* ' : '  '}${f}`)
    break
  }

  case 'folder': {
    if (!a) die('usage: boards.mjs folder <name>')
    if (!NAME.test(a)) die(`folder name must be kebab-case: "${a}"`)
    writableOrDie(a)
    setActiveFolder(ROOT, a)
    const inFolder = listBoards(ROOT).filter((x) => x.folder === a)
    console.log(`working folder: ${a}${inFolder.length ? ` (${inFolder.map((x) => x.name).join(', ')})` : ' (empty)'}`)
    break
  }

  case 'create': {
    if (!a) die('usage: boards.mjs create <name> [--folder <folder>]')
    if (!NAME.test(a)) die(`board name must be kebab-case (lowercase letters, digits, hyphens): "${a}"`)
    const folder = folderFlag || getActiveFolder(ROOT) || DEFAULT_FOLDER
    if (!NAME.test(folder)) die(`folder name must be kebab-case: "${folder}"`)
    writableOrDie(folder)
    const id = boardId(folder, a)
    const p = boardPath(ROOT, id)
    if (fs.existsSync(p)) die(`board "${id}" already exists`)
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, '', 'utf8')
    setActiveBoard(ROOT, id)
    console.log(`created board "${id}" (now active) -> ${p}`)
    break
  }

  case 'use': {
    if (!a) die('usage: boards.mjs use <folder/name|name>')
    const id = resolveOrDie(a)
    writableOrDie(id)
    setActiveBoard(ROOT, id)
    console.log(`active board: ${id}`)
    break
  }

  case 'move': {
    if (!a || !b) die('usage: boards.mjs move <folder/name|name> <folder>')
    if (!NAME.test(b)) die(`folder name must be kebab-case: "${b}"`)
    const id = resolveOrDie(a)
    writableOrDie(id)
    writableOrDie(b)
    const { name } = parseBoardId(id)
    const to = boardId(b, name)
    if (fs.existsSync(boardPath(ROOT, to))) die(`board "${to}" already exists`)
    fs.mkdirSync(path.join(boardsDir(ROOT), b), { recursive: true })
    fs.renameSync(boardPath(ROOT, id), boardPath(ROOT, to))
    if (getActiveBoard(ROOT) === id) setActiveBoard(ROOT, to)
    console.log(`moved "${id}" -> "${to}"`)
    break
  }

  case 'rename': {
    if (!a || !b) die('usage: boards.mjs rename <folder/name|name> <newName>')
    if (!NAME.test(b)) die(`board name must be kebab-case: "${b}"`)
    const id = resolveOrDie(a)
    writableOrDie(id)
    const { folder } = parseBoardId(id)
    const to = folder ? boardId(folder, b) : b
    if (fs.existsSync(boardPath(ROOT, to))) die(`board "${to}" already exists`)
    fs.renameSync(boardPath(ROOT, id), boardPath(ROOT, to))
    if (getActiveBoard(ROOT) === id) setActiveBoard(ROOT, to)
    console.log(`renamed "${id}" -> "${to}"`)
    break
  }

  default:
    console.log([
      'usage:',
      '  boards.mjs list',
      '  boards.mjs folders',
      '  boards.mjs folder <name>                 switch working folder (creates it)',
      '  boards.mjs create <name> [--folder <f>]  new board in the working folder',
      '  boards.mjs use <folder/name|name>        switch active board',
      '  boards.mjs move <folder/name|name> <folder>',
      '  boards.mjs rename <folder/name|name> <newName>',
      '  ... plus [--root <dir>] to act on another project (default: Map itself)',
    ].join('\n'))
}
