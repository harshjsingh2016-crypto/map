// Board summaries: one-line post-apply summary, compact outline for cold
// starts, and full markdown export. Used by apply-ops.mjs and outline.mjs.

function countPending(state) {
  let suggestions = 0
  let flags = 0
  for (const wid of state.widgetOrder) {
    const w = state.widgets[wid]
    if (w.nodes) for (const nid of w.nodeOrder) {
      const n = w.nodes[nid]
      if (n.kind === 'suggestion') suggestions++
      if (n.flag) flags++
    }
    if (w.edges) for (const eid of w.edgeOrder) if (w.edges[eid].kind === 'suggestion') suggestions++
    if (w.rows) for (const rid of w.rowOrder) if (w.rows[rid].kind === 'suggestion') suggestions++
  }
  return { suggestions, flags }
}

function widgetCounts(w) {
  if (w.type === 'table') return `${w.rowOrder.length} rows`
  if (w.type === 'note') return `${w.content.split(/\s+/).filter(Boolean).length} words`
  const parts = [`${w.nodeOrder.length} nodes`]
  if (w.edges && w.edgeOrder.length) parts.push(`${w.edgeOrder.length} edges`)
  if (w.groups && Object.keys(w.groups).length) parts.push(`${Object.keys(w.groups).length} groups`)
  return parts.join(', ')
}

/** One-line summary printed after every successful apply. */
export function summarize(state, boardName) {
  const { suggestions, flags } = countPending(state)
  const widgets = state.widgetOrder
    .map((id) => {
      const w = state.widgets[id]
      return `${w.title || id} [${w.type}: ${widgetCounts(w)}]`
    })
    .join(' | ')
  const pending = []
  if (suggestions) pending.push(`${suggestions} pending suggestion${suggestions > 1 ? 's' : ''}`)
  if (flags) pending.push(`${flags} open flag${flags > 1 ? 's' : ''}`)
  return `board "${boardName}": ${widgets || '(empty)'}${pending.length ? ` — ${pending.join(', ')}` : ''}`
}

/** Compact outline for cold starts: widget titles + element labels. */
export function outline(state, boardName) {
  const lines = [`Board: ${state.title || boardName}`]
  if (state.style.theme || state.style.background) {
    lines.push(`  style: ${JSON.stringify(state.style)}`)
  }
  for (const wid of state.widgetOrder) {
    const w = state.widgets[wid]
    lines.push(`\n${w.type} "${w.title}" (id: ${wid})`)
    if (w.type === 'note') {
      const preview = w.content.replace(/\s+/g, ' ').slice(0, 120)
      lines.push(`  ${preview}${w.content.length > 120 ? '…' : ''}`)
    } else if (w.type === 'table') {
      lines.push(`  columns: ${w.columns.map((c) => `${c.label} (${c.id})`).join(', ')}`)
      for (const rid of w.rowOrder) {
        const r = w.rows[rid]
        const first = w.columns[0] ? (r.cells[w.columns[0].id]?.value ?? '') : ''
        lines.push(`  row ${rid}: ${first}${r.kind === 'suggestion' ? ' [suggestion]' : ''}`)
      }
    } else if (w.type === 'mindmap') {
      const children = (pid) => w.nodeOrder.filter((nid) => (w.nodes[nid].parentId || null) === pid)
      const walk = (pid, depth) => {
        for (const nid of children(pid)) {
          const n = w.nodes[nid]
          lines.push(`  ${'  '.repeat(depth)}- ${n.label} (${nid})${n.kind === 'suggestion' ? ' [suggestion]' : ''}${n.flag ? ` [? ${n.flag.question}]` : ''}${n.collapsed ? ' [collapsed]' : ''}`)
          walk(nid, depth + 1)
        }
      }
      walk(null, 0)
    } else {
      if (w.type === 'quadrant') lines.push(`  axes: x=${w.axes.xLabel || '?'} y=${w.axes.yLabel || '?'}`)
      if (w.groups && Object.keys(w.groups).length) {
        lines.push(`  groups: ${Object.values(w.groups).map((g) => `${g.label} (${g.id})`).join(', ')}`)
      }
      for (const nid of w.nodeOrder) {
        const n = w.nodes[nid]
        const extra = [
          n.shape, n.cell, n.marker,
          n.groupId ? `group:${n.groupId}` : null,
          n.kind === 'suggestion' ? 'suggestion' : null,
          n.flag ? `? ${n.flag.question}` : null,
        ].filter(Boolean).join(', ')
        lines.push(`  - ${n.label} (${nid})${extra ? ` [${extra}]` : ''}`)
      }
      if (w.edges) {
        for (const eid of w.edgeOrder) {
          const e = w.edges[eid]
          lines.push(`  edge: ${e.source} → ${e.target}${e.label ? ` "${e.label}"` : ''}${e.kind === 'suggestion' ? ' [suggestion]' : ''}`)
        }
      }
    }
  }
  return lines.join('\n')
}

/** Full markdown export (`outline.mjs --md`). */
export function toMarkdown(state, boardName) {
  const md = [`# ${state.title || boardName}`, '']
  const sug = (kind) => (kind === 'suggestion' ? '\n> [suggestion]' : '')

  for (const wid of state.widgetOrder) {
    const w = state.widgets[wid]
    md.push(`## ${w.title}`, '')
    if (w.type === 'note') {
      md.push(w.content, '')
    } else if (w.type === 'table') {
      md.push(`| ${w.columns.map((c) => c.label).join(' | ')} |`)
      md.push(`| ${w.columns.map(() => '---').join(' | ')} |`)
      for (const rid of w.rowOrder) {
        const r = w.rows[rid]
        const cells = w.columns.map((c) => String(r.cells[c.id]?.value ?? ''))
        md.push(`| ${cells.join(' | ')} |${r.kind === 'suggestion' ? ' <!-- suggestion -->' : ''}`)
      }
      const sugRows = w.rowOrder.filter((rid) => w.rows[rid].kind === 'suggestion')
      if (sugRows.length) md.push('', `> [suggestion] rows: ${sugRows.join(', ')}`)
      md.push('')
    } else if (w.type === 'mindmap') {
      const children = (pid) => w.nodeOrder.filter((nid) => (w.nodes[nid].parentId || null) === pid)
      const walk = (pid, depth) => {
        for (const nid of children(pid)) {
          const n = w.nodes[nid]
          md.push(`${'  '.repeat(depth)}- ${n.label}${n.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
          if (n.flag) md.push(`${'  '.repeat(depth + 1)}> [question] ${n.flag.question}`)
          walk(nid, depth + 1)
        }
      }
      walk(null, 0)
      md.push('')
    } else if (w.type === 'flowchart') {
      // Ordered step list with branches: walk from start nodes in insertion order.
      const outgoing = {}
      for (const eid of w.edgeOrder) {
        const e = w.edges[eid]
        ;(outgoing[e.source] ||= []).push(e)
      }
      let step = 1
      for (const nid of w.nodeOrder) {
        const n = w.nodes[nid]
        const group = n.groupId && w.groups[n.groupId] ? ` _(${w.groups[n.groupId].label})_` : ''
        md.push(`${step}. ${n.label}${group}${n.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
        if (n.flag) md.push(`   > [question] ${n.flag.question}`)
        for (const e of outgoing[nid] || []) {
          const t = w.nodes[e.target]
          md.push(`   - ${e.label ? `**${e.label}** → ` : '→ '}${t ? t.label : e.target}${e.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
        }
        step++
      }
      md.push('')
    } else if (w.type === 'timeline') {
      const items = [...w.nodeOrder].sort((a, b) => (w.nodes[a].order ?? 1e9) - (w.nodes[b].order ?? 1e9))
      items.forEach((nid, i) => {
        const n = w.nodes[nid]
        md.push(`${i + 1}. ${n.marker ? `**${n.marker}** — ` : ''}${n.label}${n.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
        if (n.flag) md.push(`   > [question] ${n.flag.question}`)
      })
      md.push('')
    } else if (w.type === 'quadrant') {
      const cellNames = {
        tl: `high ${w.axes.yLabel || 'y'} / low ${w.axes.xLabel || 'x'}`,
        tr: `high ${w.axes.yLabel || 'y'} / high ${w.axes.xLabel || 'x'}`,
        bl: `low ${w.axes.yLabel || 'y'} / low ${w.axes.xLabel || 'x'}`,
        br: `low ${w.axes.yLabel || 'y'} / high ${w.axes.xLabel || 'x'}`,
      }
      md.push(`Axes: **${w.axes.xLabel || '?'}** (x) × **${w.axes.yLabel || '?'}** (y)`, '')
      for (const cell of ['tl', 'tr', 'bl', 'br']) {
        const items = w.nodeOrder.filter((nid) => w.nodes[nid].cell === cell)
        if (!items.length) continue
        md.push(`**${cellNames[cell]}**`)
        for (const nid of items) {
          const n = w.nodes[nid]
          md.push(`- ${n.label}${n.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
          if (n.flag) md.push(`  > [question] ${n.flag.question}`)
        }
        md.push('')
      }
    } else if (w.type === 'schema') {
      for (const nid of w.nodeOrder) {
        const n = w.nodes[nid]
        md.push(`**${n.label}**${n.kind === 'suggestion' ? ' *[suggestion]*' : ''}`)
        for (const f of n.fields || []) {
          md.push(`- ${f.key ? `\`${f.key}\` ` : ''}${f.name}${f.type ? `: ${f.type}` : ''}`)
        }
        if (n.flag) md.push(`> [question] ${n.flag.question}`)
        md.push('')
      }
      if (w.edgeOrder.length) {
        md.push('Relations:')
        for (const eid of w.edgeOrder) {
          const e = w.edges[eid]
          md.push(`- ${w.nodes[e.source]?.label || e.source} → ${w.nodes[e.target]?.label || e.target}${e.label ? ` (${e.label})` : ''}`)
        }
        md.push('')
      }
    }
  }
  return md.join('\n')
}
