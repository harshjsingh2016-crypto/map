// Which directory a script operates on. Map's scripts run against Map's own
// repo by default, but every project that keeps a blueprint uses the same
// layout (boards/, wiki/, walkthroughs/), so the same scripts serve it when
// pointed there:  --root <dir>  >  MAP_ROOT  >  Map itself.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const MAP_HOME = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Returns { root, argv, isHome }. `argv` has `--root <dir>` removed, so a
 * script's own parsing (positionals, inline JSON) never sees it.
 */
export function resolveRoot(argv = process.argv.slice(2)) {
  const rest = []
  let flag = null
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') flag = argv[++i]
    else rest.push(argv[i])
  }
  if (flag === undefined) {
    console.error('ERROR: --root needs a directory')
    process.exit(1)
  }
  const chosen = flag || process.env.MAP_ROOT || MAP_HOME
  const root = path.resolve(chosen)
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    console.error(`ERROR: root "${chosen}" is not a directory`)
    process.exit(1)
  }
  return { root, argv: rest, isHome: samePath(root, MAP_HOME) }
}

export function samePath(a, b) {
  // realpath, not just resolve: git reports long names where Windows may hand
  // out 8.3 short ones (LONGNA~1), and the two must compare equal.
  const norm = (p) => {
    let r = path.resolve(p)
    try { r = fs.realpathSync.native(r) } catch { /* not on disk — compare as written */ }
    return process.platform === 'win32' ? r.toLowerCase() : r
  }
  return norm(a) === norm(b)
}
