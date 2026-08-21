#!/usr/bin/env node
// Wiki maintenance. Articles live flat at wiki/<concept>.md plus wiki/index.md.
//
//   node scripts/wiki.mjs list    articles with title, boards, updated; orphans flagged
//   node scripts/wiki.mjs check   dead links, index drift, format errors (exit 1)
//
// Articles are hand-authored prose — nothing here generates content.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listBoards } from '../shared/log.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const WIKI = path.join(ROOT, 'wiki')
const cmd = process.argv[2]

const FILENAME = /^[a-z0-9][a-z0-9-]*\.md$/
const BOARD_ID = /^[a-z0-9][a-z0-9-]*\/[a-z0-9][a-z0-9-]*$/
const LINK = /\]\(([^)#\s]+\.md)(#[^)]*)?\)/g

function readWiki() {
  if (!fs.existsSync(WIKI)) return null
  const files = fs.readdirSync(WIKI).filter((f) => f.endsWith('.md'))
  const pages = new Map()
  for (const file of files) {
    const text = fs.readFileSync(path.join(WIKI, file), 'utf8')
    pages.set(file, parsePage(file, text))
  }
  return pages
}

function parsePage(file, text) {
  const page = { file, text, boards: null, updated: null, h1s: [], links: [], hasFrontmatter: false }
  let body = text
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (fm) {
    page.hasFrontmatter = true
    body = text.slice(fm[0].length)
    const boards = fm[1].match(/^boards:\s*\[([^\]]*)\]\s*$/m)
    if (boards) page.boards = boards[1].split(',').map((s) => s.trim()).filter(Boolean)
    const updated = fm[1].match(/^updated:\s*(\S+)\s*$/m)
    if (updated) page.updated = updated[1]
  }
  for (const line of body.split('\n')) {
    if (/^# \S/.test(line)) page.h1s.push(line.replace(/^# /, '').trim())
  }
  for (const m of body.matchAll(LINK)) page.links.push(m[1])
  return page
}

const pages = readWiki()
if (!pages || !pages.size) {
  console.log('(no wiki yet — wiki/ is empty or missing)')
  process.exit(0)
}

const errors = []
const warnings = []
const index = pages.get('index.md')
if (!index) errors.push('wiki/index.md is missing')

let knownBoards = new Set()
try { knownBoards = new Set(listBoards(ROOT).map((b) => b.id)) } catch { /* no boards dir */ }

for (const [file, page] of pages) {
  const isIndex = file === 'index.md'
  if (!FILENAME.test(file)) errors.push(`${file}: filename must be kebab-case`)
  if (page.h1s.length !== 1) errors.push(`${file}: expected exactly one H1, found ${page.h1s.length}`)
  for (const target of page.links) {
    if (/^[a-z]+:/.test(target)) continue // http(s) etc.
    const resolved = path.resolve(WIKI, target)
    if (!fs.existsSync(resolved)) errors.push(`${file}: dead link -> ${target}`)
  }
  if (isIndex) continue
  if (!page.hasFrontmatter) { errors.push(`${file}: missing frontmatter`); continue }
  if (!page.boards || !page.boards.length) errors.push(`${file}: frontmatter needs boards: [folder/name, ...]`)
  else {
    for (const id of page.boards) {
      if (!BOARD_ID.test(id)) errors.push(`${file}: bad board id "${id}" (want folder/name)`)
      else if (knownBoards.size && !knownBoards.has(id)) warnings.push(`${file}: board "${id}" not on this machine`)
    }
  }
  if (!page.updated || !/^\d{4}-\d{2}-\d{2}$/.test(page.updated)) {
    errors.push(`${file}: frontmatter needs updated: YYYY-MM-DD`)
  }
  if (index && !index.links.includes(file)) errors.push(`${file}: orphan — not linked from index.md`)
}

switch (cmd) {
  case 'list': {
    for (const [file, page] of pages) {
      if (file === 'index.md') continue
      const orphan = index && !index.links.includes(file) ? '  [ORPHAN]' : ''
      console.log(`${file}  "${page.h1s[0] || '?'}"  boards: ${(page.boards || []).join(', ') || '-'}  updated: ${page.updated || '-'}${orphan}`)
    }
    console.log(`\n${pages.size - (index ? 1 : 0)} articles${errors.length ? `, ${errors.length} problem(s) — run check` : ''}`)
    break
  }
  case 'check': {
    for (const w of warnings) console.log(`warn: ${w}`)
    if (errors.length) {
      for (const e of errors) console.error(`ERROR: ${e}`)
      process.exit(1)
    }
    console.log(`wiki ok — ${pages.size - (index ? 1 : 0)} articles, index current${warnings.length ? `, ${warnings.length} warning(s)` : ''}`)
    break
  }
  default:
    console.error('usage: node scripts/wiki.mjs <list|check>')
    process.exit(1)
}
