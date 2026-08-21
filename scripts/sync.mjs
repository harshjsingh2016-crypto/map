#!/usr/bin/env node
// Two-laptop sync for boards/ and wiki/ (the user alternates machines, never simultaneous).
//
//   node scripts/sync.mjs pull     reconcile: push local dirty work, then fast-forward pull
//   node scripts/sync.mjs push     commit boards/ + wiki/ changes and push
//   node scripts/sync.mjs status   ahead/behind + dirty sync-scope files
//
// pull runs before the dev server starts; push runs when it exits (see scripts/dev.mjs).
// Network failures warn but never block work — the next pull's reconcile catches up.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCOPE = ['boards', 'wiki']
const cmd = process.argv[2]

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
const gitSafe = (...args) => { try { return git(...args) } catch { return null } }

function dirty() {
  const out = gitSafe('status', '--porcelain', '--', ...SCOPE)
  return out ? out.split('\n').filter(Boolean) : []
}

function commitAndPush(label) {
  git('add', '--', ...SCOPE)
  const staged = gitSafe('diff', '--cached', '--name-only')
  if (!staged) { console.log('[sync] nothing to commit'); return true }
  const files = staged.split('\n').filter(Boolean)
  const date = new Date().toISOString().slice(0, 10)
  git('commit', '-m', `sync: ${date} ${label} (${files.length} file${files.length === 1 ? '' : 's'})`)
  console.log(`[sync] committed ${files.length} file(s)`)
  try {
    git('push')
    console.log('[sync] pushed to origin')
    return true
  } catch {
    console.log('[sync] WARN: push failed (offline?) — commit is local, next pull will push it')
    return false
  }
}

switch (cmd) {
  case 'push': {
    commitAndPush('boards + wiki')
    break
  }

  case 'pull': {
    // 1. Local dirty or unpushed work is always the newest (machines never run
    //    simultaneously) — commit and push it before pulling.
    if (dirty().length || gitSafe('log', '@{u}..', '--oneline')) commitAndPush('catch-up')
    // 2. Fast-forward only. A divergence means the never-simultaneous assumption broke;
    //    board logs must not be auto-merged.
    if (gitSafe('fetch') === null) {
      console.log('[sync] WARN: fetch failed (offline?) — starting with local state')
      break
    }
    const behind = gitSafe('log', '..@{u}', '--oneline')
    if (!behind) { console.log('[sync] up to date with origin'); break }
    try {
      git('merge', '--ff-only', '@{u}')
      console.log(`[sync] pulled ${behind.split('\n').length} commit(s) from origin`)
    } catch {
      console.error('[sync] ERROR: local and origin have diverged — resolve manually (git status / git log --oneline --all) before working')
      process.exit(1)
    }
    break
  }

  case 'status': {
    const d = dirty()
    console.log(d.length ? `dirty:\n${d.join('\n')}` : 'clean')
    gitSafe('fetch')
    const ahead = gitSafe('log', '@{u}..', '--oneline')
    const behind = gitSafe('log', '..@{u}', '--oneline')
    console.log(`ahead: ${ahead ? ahead.split('\n').length : 0}, behind: ${behind ? behind.split('\n').length : 0}`)
    break
  }

  default:
    console.error('usage: node scripts/sync.mjs <pull|push|status>')
    process.exit(1)
}
