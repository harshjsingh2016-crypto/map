// Folder groups: buckets of folders for the app's sidebar ("Scaler" holding scalar,
// scalar-2 and scalar-primers). View configuration only — nothing here touches a board
// or the write target. Kept in boards/.groups.json so sync.mjs carries it between
// laptops with the boards themselves.
//
//   { "version": 1, "groups": [{ "id": "scaler", "label": "Scaler", "folders": ["scalar"] }] }
//
// A group may name a folder that is absent on this machine (a mount not cloned here);
// the client hides it, and the file keeps it so the other laptop still sees it grouped.
import fs from 'node:fs'
import path from 'node:path'
import { boardsDir } from './log.mjs'

export const GROUPS_FILE = '.groups.json'
const ID = /^[a-z0-9][a-z0-9-]{0,39}$/
const MAX_GROUPS = 50

export const groupsPath = (root) => path.join(boardsDir(root), GROUPS_FILE)

/**
 * Validate and canonicalise a group list. Throws on a bad shape; quietly drops a
 * folder already claimed by an earlier group, so a folder sits in one bucket only.
 */
export function normalizeGroups(input) {
  if (!Array.isArray(input)) throw new Error('groups must be an array')
  if (input.length > MAX_GROUPS) throw new Error(`at most ${MAX_GROUPS} groups`)
  const ids = new Set()
  const claimed = new Set()
  return input.map((g, i) => {
    if (!g || typeof g !== 'object') throw new Error(`group ${i} is not an object`)
    const id = String(g.id || '')
    if (!ID.test(id)) throw new Error(`group ${i}: id "${id}" must be kebab-case, at most 40 chars`)
    if (ids.has(id)) throw new Error(`group ${i}: duplicate id "${id}"`)
    ids.add(id)
    const label = String(g.label || '').trim()
    if (!label || label.length > 40) throw new Error(`group "${id}": label must be 1-40 chars`)
    if (!Array.isArray(g.folders)) throw new Error(`group "${id}": folders must be an array`)
    const folders = []
    for (const f of g.folders) {
      if (typeof f !== 'string' || !f || f.length > 100) throw new Error(`group "${id}": bad folder name`)
      if (claimed.has(f)) continue
      claimed.add(f)
      folders.push(f)
    }
    return { id, label, folders }
  })
}

/** Read the groups file. A missing file is no groups; a broken one is reported, not fatal. */
export function readGroups(root) {
  let raw
  try { raw = fs.readFileSync(groupsPath(root), 'utf8') } catch { return { groups: [], error: null } }
  try {
    return { groups: normalizeGroups(JSON.parse(raw).groups), error: null }
  } catch (e) {
    return { groups: [], error: `${GROUPS_FILE}: ${e.message}` }
  }
}

/** Validate, then write atomically so a watcher never reads half a file. */
export function writeGroups(root, input) {
  const groups = normalizeGroups(input)
  const file = groupsPath(root)
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify({ version: 1, groups }, null, 2) + '\n')
  fs.renameSync(tmp, file)
  return groups
}
