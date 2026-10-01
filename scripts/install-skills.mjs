#!/usr/bin/env node
// Install Map's skills for every project on this machine.
//   node scripts/install-skills.mjs            -> ~/.claude/skills/<name>/SKILL.md
//   node scripts/install-skills.mjs --dest <dir>
//
// A skill is how a session in another repo learns to use Map's tools without
// a copy of Map: it carries the conventions and the commands, with this
// checkout's path filled in. Re-run after pulling changes to skills/, and once
// on each machine — the installed copy is generated, skills/ is the source.
//
// map-blueprint is assembled here from its own head.md plus the drawing
// reference sections of CLAUDE.md, so the op vocabulary has one source.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { MAP_HOME } from '../shared/root.mjs'

const argv = process.argv.slice(2)
const destFlag = argv.indexOf('--dest')
const DEST = destFlag > -1 ? path.resolve(argv[destFlag + 1]) : path.join(os.homedir(), '.claude', 'skills')
const SRC = path.join(MAP_HOME, 'skills')
const HOME_POSIX = MAP_HOME.replace(/\\/g, '/')

/** The `## <title>` section of CLAUDE.md, up to the next `## ` or `---` rule. */
function claudeSection(title) {
  const lines = fs.readFileSync(path.join(MAP_HOME, 'CLAUDE.md'), 'utf8').split(/\r?\n/)
  const start = lines.findIndex((l) => l === `## ${title}`)
  if (start < 0) throw new Error(`CLAUDE.md has no "## ${title}" section`)
  let end = lines.findIndex((l, i) => i > start && (/^## /.test(l) || l === '---'))
  if (end < 0) end = lines.length
  return lines.slice(start, end).join('\n').trimEnd()
}

function build(name) {
  const dir = path.join(SRC, name)
  if (name === 'map-blueprint') {
    const head = fs.readFileSync(path.join(dir, 'head.md'), 'utf8').trimEnd()
    const ref = ['Choosing the widget type', 'Content rules', 'Op reference'].map(claudeSection)
    return [head, ...ref].join('\n\n') + '\n'
  }
  return fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8')
}

for (const name of fs.readdirSync(SRC)) {
  if (!fs.statSync(path.join(SRC, name)).isDirectory()) continue
  const text = build(name).split('{{MAP_HOME}}').join(HOME_POSIX)
  const out = path.join(DEST, name)
  fs.mkdirSync(out, { recursive: true })
  fs.writeFileSync(path.join(out, 'SKILL.md'), text, 'utf8')
  console.log(`installed ${name} -> ${path.join(out, 'SKILL.md')}`)
}
