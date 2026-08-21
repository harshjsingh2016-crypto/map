#!/usr/bin/env node
// Dev wrapper: pull latest boards + wiki from origin, run the servers, push on exit.
// The push/pull pair lives here (the parent process) because on Windows Ctrl+C can kill
// child processes before their own cleanup handlers run. Anything this misses — a crash,
// a closed window — is caught by the next start's `sync pull` reconcile.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sync = (mode) => {
  try {
    execFileSync('node', [path.join(ROOT, 'scripts', 'sync.mjs'), mode], { cwd: ROOT, stdio: 'inherit' })
  } catch {
    process.exit(1) // sync pull exits 1 only on divergence — do not start on top of it
  }
}

sync('pull')

const child = spawn('npm', ['run', 'dev:raw'], { cwd: ROOT, stdio: 'inherit', shell: true })

let pushed = false
const finish = (code) => {
  if (pushed) return
  pushed = true
  try {
    execFileSync('node', [path.join(ROOT, 'scripts', 'sync.mjs'), 'push'], { cwd: ROOT, stdio: 'inherit' })
  } catch { /* push warns on its own; never mask the exit */ }
  process.exit(code ?? 0)
}

child.on('exit', (code) => finish(code))
// Ctrl+C reaches the whole console group; wait for the child to die, then push.
for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => { /* child receives it too; finish() runs on its exit */ })
}
