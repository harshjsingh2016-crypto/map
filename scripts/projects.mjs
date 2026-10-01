#!/usr/bin/env node
// Mounted projects: other repos that keep their own boards/ and wiki/ in Map's
// layout. Map reads them in place (projects.json) and never writes to them.
//
//   node scripts/projects.mjs list
//   node scripts/projects.mjs add <alias> <path> [--folders a,b] [--remote <url>]
//   node scripts/projects.mjs remove <alias>
//   node scripts/projects.mjs sync [--clone]   fast-forward each checkout (pull only)
//   node scripts/projects.mjs status           where each project stands
//
// sync never commits or pushes, and one project's failure never fails the run:
// a dirty, diverged, offline or absent checkout prints a WARN and is skipped.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { listBoards, listFolders, boardPath } from '../shared/log.mjs'
import { readRegistry, lastBatchTs, REGISTRY_FILE } from '../shared/mounts.mjs'
import { resolveRoot, samePath } from '../shared/root.mjs'

const { root: ROOT, argv } = resolveRoot()
const [cmd, a, b] = argv
const flag = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i > -1 ? argv[i + 1] : null
}
const NAME = /^[a-z0-9][a-z0-9-]*$/
const die = (msg) => { console.error(`ERROR: ${msg}`); process.exit(1) }

const REG = path.join(ROOT, REGISTRY_FILE)
function readRaw() {
  try {
    const reg = JSON.parse(fs.readFileSync(REG, 'utf8'))
    if (Array.isArray(reg.projects)) return reg
  } catch { /* first use */ }
  return { version: 1, projects: [] }
}
const writeRaw = (reg) => fs.writeFileSync(REG, JSON.stringify(reg, null, 2) + '\n', 'utf8')

const gitIn = (dir, ...args) =>
  execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
const gitSafe = (dir, ...args) => { try { return gitIn(dir, ...args) } catch { return null } }

// A directory inside someone else's repo answers git commands with that repo's
// state, which would make every number below a lie about the wrong project.
function ownRepo(dir) {
  const top = gitSafe(dir, 'rev-parse', '--show-toplevel')
  return !!top && samePath(top, dir)
}

const day = (ts) => (ts ? new Date(ts).toISOString().slice(0, 10) : '-')

function wikiStats(dir) {
  const wiki = path.join(dir, 'wiki')
  if (!fs.existsSync(wiki)) return { count: 0, updated: null }
  let count = 0
  let updated = null
  for (const f of fs.readdirSync(wiki)) {
    if (!f.endsWith('.md') || f === 'index.md') continue
    count++
    const m = fs.readFileSync(path.join(wiki, f), 'utf8').match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m)
    if (m && (!updated || m[1] > updated)) updated = m[1]
  }
  return { count, updated }
}

switch (cmd) {
  case 'list': {
    const reg = readRegistry(ROOT)
    if (!reg.length) { console.log('(no mounted projects — add one with `projects.mjs add <alias> <path>`)'); break }
    for (const p of reg) {
      console.log(`${p.alias}${p.present ? '' : '  [missing on this machine]'}`)
      console.log(`  path:    ${p.path}`)
      console.log(`  folders: ${p.folders.join(', ') || '(none yet)'}`)
      if (p.remote) console.log(`  remote:  ${p.remote}`)
    }
    break
  }

  case 'add': {
    if (!a || !b) die('usage: projects.mjs add <alias> <path> [--folders a,b] [--remote <url>]')
    if (!NAME.test(a)) die(`alias must be kebab-case: "${a}"`)
    const abs = path.resolve(b)
    const reg = readRaw()
    if (reg.projects.some((p) => p.alias === a)) die(`project "${a}" is already registered`)
    if (samePath(abs, ROOT)) die('that is this repo — a project cannot mount itself')
    const present = fs.existsSync(abs)
    if (present && !ownRepo(abs)) {
      die(`${abs} is not the top of its own git repo — its boards could not sync. Run \`git init\` there (and add a remote) first.`)
    }
    const folders = (flag('folders') || a).split(',').map((s) => s.trim()).filter(Boolean)
    for (const f of folders) if (!NAME.test(f)) die(`folder name must be kebab-case: "${f}"`)
    // A folder name is the first half of every board id, so it has one owner.
    for (const f of folders) {
      if (listFolders(ROOT).includes(f)) die(`folder "${f}" already exists in this repo's boards/ — move it into the project first`)
      const other = readRegistry(ROOT).find((p) => p.folders.includes(f))
      if (other) die(`folder "${f}" already belongs to project ${other.alias}`)
    }
    const remote = flag('remote') || (present ? gitSafe(abs, 'remote', 'get-url', 'origin') : null)
    reg.projects.push({ alias: a, path: abs.replace(/\\/g, '/'), remote: remote || null, folders })
    writeRaw(reg)
    console.log(`mounted ${a} -> ${abs} (folders: ${folders.join(', ')})${present ? '' : ' — not on this machine yet'}${remote ? '' : ' — no git remote recorded'}`)
    break
  }

  case 'remove': {
    if (!a) die('usage: projects.mjs remove <alias>')
    const reg = readRaw()
    if (!reg.projects.some((p) => p.alias === a)) die(`no project "${a}"`)
    reg.projects = reg.projects.filter((p) => p.alias !== a)
    writeRaw(reg)
    console.log(`unmounted ${a} (its files are untouched)`)
    break
  }

  case 'sync': {
    const clone = argv.includes('--clone')
    const reg = readRegistry(ROOT)
    if (!reg.length) break
    for (const p of reg) {
      const tag = `[projects] ${p.alias}:`
      try {
        if (!p.present) {
          if (clone && p.remote) {
            fs.mkdirSync(path.dirname(p.path), { recursive: true })
            execFileSync('git', ['clone', p.remote, p.path], { stdio: ['ignore', 'pipe', 'pipe'] })
            console.log(`${tag} cloned from ${p.remote}`)
          } else {
            console.log(`${tag} WARN: not on this machine${p.remote ? ' — `projects.mjs sync --clone` fetches it' : ''}`)
          }
          continue
        }
        if (!ownRepo(p.path)) { console.log(`${tag} WARN: not its own git repo — skipped`); continue }
        if (gitSafe(p.path, 'rev-parse', '--abbrev-ref', '@{u}') === null) { console.log(`${tag} WARN: no upstream branch — skipped`); continue }
        if (gitSafe(p.path, 'fetch') === null) { console.log(`${tag} WARN: fetch failed (offline?) — showing local state`); continue }
        const behind = gitSafe(p.path, 'log', '..@{u}', '--oneline')
        if (!behind) { console.log(`${tag} up to date`); continue }
        // Fast-forward only, and git itself refuses when a local change is in the way.
        gitIn(p.path, 'merge', '--ff-only', '@{u}')
        console.log(`${tag} pulled ${behind.split('\n').length} commit(s)`)
      } catch (e) {
        const why = String(e.stderr || e.message || '').trim().split('\n')[0]
        console.log(`${tag} WARN: not updated — ${why || 'git refused'}`)
      }
    }
    break
  }

  case 'status': {
    const reg = readRegistry(ROOT)
    if (!reg.length) { console.log('(no mounted projects)'); break }
    for (const p of reg) {
      if (!p.present) {
        console.log(`${p.alias}: missing on this machine (${p.path}) — folders: ${p.folders.join(', ') || '-'}`)
        continue
      }
      const boards = listBoards(p.path).filter((x) => x.folder)
      const w = wikiStats(p.path)
      let gitLine = 'not its own git repo'
      if (ownRepo(p.path)) {
        const dirty = gitSafe(p.path, 'status', '--porcelain', '--', 'boards', 'wiki', 'walkthroughs')
        const ahead = gitSafe(p.path, 'log', '@{u}..', '--oneline')
        const behind = gitSafe(p.path, 'log', '..@{u}', '--oneline')
        const n = (s) => (s ? s.split('\n').length : 0)
        gitLine = ahead === null && behind === null
          ? `no upstream${dirty ? `, ${n(dirty)} uncommitted` : ''}`
          : `ahead ${n(ahead)}, behind ${n(behind)}${dirty ? `, ${n(dirty)} uncommitted` : ''} (as of last fetch)`
      }
      console.log(`${p.alias}: ${boards.length} board(s), wiki ${w.count} article(s)${w.updated ? ` (latest ${w.updated})` : ''}, git ${gitLine}`)
      for (const bd of boards) {
        console.log(`  ${bd.id}  last batch ${day(lastBatchTs(boardPath(p.path, bd.id)))}`)
      }
    }
    break
  }

  default:
    console.log([
      'usage:',
      '  projects.mjs list',
      '  projects.mjs add <alias> <path> [--folders a,b] [--remote <url>]',
      '  projects.mjs remove <alias>',
      '  projects.mjs sync [--clone]',
      '  projects.mjs status',
    ].join('\n'))
}
