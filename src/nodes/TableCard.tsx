import { memo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { resolveColor, themeDefaults } from '../theme'

export default memo(function TableCard({ data }: NodeProps) {
  const { widget, theme } = data as any
  const td = themeDefaults(theme)
  const border = resolveColor(widget.style?.border, 'border', theme) || td.cardBorder
  const headBg = resolveColor(widget.style?.fill, 'fill', theme) || (theme === 'dark' ? '#262c49' : '#eef2f7')

  return (
    <div className="table-card" style={{ background: td.cardBg, borderColor: border, color: td.text }}>
      <div className="card-title">
        <span className="widget-type-icon">▦</span>{widget.title}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {widget.columns.map((c: any) => (
                <th
                  key={c.id}
                  style={{
                    background: resolveColor(c.style?.fill, 'fill', theme) || headBg,
                    color: resolveColor(c.style?.text, 'text', theme) || td.text,
                    borderColor: border,
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {widget.rowOrder.map((rid: string) => {
              const r = widget.rows[rid]
              const rowBg = resolveColor(r.style?.fill, 'fill', theme)
              const sug = r.kind === 'suggestion'
              return (
                <tr key={rid} className={sug ? 'suggestion-row' : ''} style={{ background: rowBg }}>
                  {widget.columns.map((c: any) => {
                    const cell = r.cells[c.id]
                    return (
                      <td
                        key={c.id}
                        style={{
                          background: resolveColor(cell?.style?.fill, 'fill', theme),
                          color: resolveColor(cell?.style?.text, 'text', theme) || td.text,
                          borderColor: border,
                        }}
                      >
                        {String(cell?.value ?? '')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})
