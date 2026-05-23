// pages/Calendar.jsx
import React, { useState } from 'react'
import { useStore } from '../lib/store.js'

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAY_LABELS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export function Calendar() {
  const { queue } = useStore()
  const [date, setDate] = useState(new Date(2026, 4)) // Mayo 2026

  const year  = date.getFullYear()
  const month = date.getMonth()
  const today = new Date()

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const published = queue.filter(p => p.publishedAt)

  const eventsForDay = (day) => {
    return published.filter(p => {
      const d = new Date(p.publishedAt)
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Calendario editorial</div>
          <div className="page-sub">Vista mensual de publicaciones planificadas y publicadas</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{MONTH_NAMES[month]} {year}</div>
          <div className="flex-row">
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month - 1))}>
              <i className="ti ti-chevron-left" />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month + 1))}>
              <i className="ti ti-chevron-right" />
            </button>
          </div>
        </div>

        <div className="cal-grid">
          {DAY_LABELS.map(d => <div key={d} className="cal-day-label">{d}</div>)}
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} className="cal-day empty" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
            const events = eventsForDay(day)
            return (
              <div key={day} className={['cal-day', isToday ? 'today' : ''].join(' ')}>
                <div className="cal-day-num">{day}</div>
                {events.map(p => (
                  <div key={p.id} className={`cal-event cal-event-${p.format}`} title={p.title}>
                    {p.title.substring(0, 12)}…
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Posting schedule */}
      <div className="card">
        <div className="section-title"><i className="ti ti-clock" /> Ventanas óptimas de posteo</div>
        <div className="grid-3">
          {['Martes', 'Miércoles', 'Jueves'].map(day => (
            <div key={day} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--txt2)', marginBottom: 8, fontFamily: 'var(--font-ui)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{day}</div>
              <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--tc)' }}>19–21hs</div>
              <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 6 }}>Argentina (UTC-3)</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', marginTop: 14, lineHeight: 1.6 }}>
          Algoritmo Instagram 2026: Martes–Jueves 19–21hs Argentina tienen la mayor ventana de alcance orgánico inicial para esta audiencia.
          Los sábados 10–12hs son la segunda ventana para carruseles de alto tiempo de lectura.
        </div>
      </div>
    </div>
  )
}


// pages/Performance.jsx
export function Performance() {
  const { queue, updatePiece, notify } = useStore()
  const published = queue.filter(p => p.status === 'publicado')

  const handleRate = (id, rating) => {
    updatePiece(id, { performance: rating })
    notify(`Performance registrada: ${rating}/5`)
  }

  const insights = React.useMemo(() => {
    const rated = published.filter(p => p.performance)
    if (rated.length < 2) return null
    const byFormat = {}
    rated.forEach(p => {
      if (!byFormat[p.format]) byFormat[p.format] = { sum: 0, count: 0 }
      byFormat[p.format].sum += p.performance
      byFormat[p.format].count++
    })
    return Object.entries(byFormat)
      .map(([fmt, d]) => ({ fmt, avg: (d.sum / d.count).toFixed(1) }))
      .sort((a, b) => b.avg - a.avg)
  }, [published])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Performance Tracker</div>
          <div className="page-sub">Registrá qué funcionó para que el sistema aprenda</div>
        </div>
      </div>

      <div className="col-7-5" style={{ alignItems: 'start' }}>
        <div>
          <div className="section-title"><i className="ti ti-award" /> Piezas publicadas</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {published.length === 0 ? (
              <div className="empty-state">
                <i className="ti ti-chart-bar" />
                <p>Cuando muevas piezas a "Publicado", aparecen aquí para registrar su performance.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pieza</th>
                    <th>Formato</th>
                    <th>Performance</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {published.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', lineHeight: 1.4 }}>{p.title}</div>
                      </td>
                      <td>
                        <span className={`tag tag-${p.format === 'carrusel' ? 'tc' : p.format === 'story' ? 'verde' : 'blue'}`}>
                          {p.format}
                        </span>
                      </td>
                      <td>
                        <div className="stars">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={['star', (p.performance || 0) >= n ? 'lit' : ''].join(' ')} onClick={() => handleRate(p.id, n)}>★</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--txt3)' }}>
                        {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('es-AR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex-col">
          {/* Insights */}
          <div>
            <div className="section-title"><i className="ti ti-trending-up" /> Insights del sistema</div>
            <div className="card">
              {!insights ? (
                <div style={{ fontSize: 13, color: 'var(--txt2)' }}>
                  Calificá al menos 2 piezas publicadas para ver insights sobre qué formatos y temas funcionan mejor.
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', marginBottom: 12 }}>Mejor performance por formato</div>
                  {insights.map(({ fmt, avg }) => (
                    <div key={fmt} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--txt)', textTransform: 'capitalize' }}>{fmt}</span>
                      <span style={{ color: 'var(--tc)', fontWeight: 600 }}>{avg}/5</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metric weights */}
          <div>
            <div className="section-title"><i className="ti ti-target" /> Peso de métricas 2026</div>
            <div className="card">
              {[
                { label: 'Guardados', pct: 90, color: 'var(--tc)' },
                { label: 'Compartidos', pct: 75, color: 'var(--verde)' },
                { label: 'Réplicas / respuestas', pct: 60, color: '#6B9EFF' },
                { label: 'Comentarios', pct: 45, color: '#a09590' },
                { label: 'Likes', pct: 25, color: 'var(--border2)' },
              ].map(m => (
                <div key={m.label} className="perf-row">
                  <div className="perf-bar-wrap">
                    <div className="perf-bar-label">{m.label}</div>
                    <div className="perf-bar-track">
                      <div className="perf-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
