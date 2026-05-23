// pages/Dashboard.jsx
import React from 'react'
import { useStore, STATUS_LABELS, FORMAT_LABELS, STATUS_FLOW } from '../lib/store.js'
import { StatusPill, FormatTag, EmptyState, ConfirmModal } from '../components/UI.jsx'
import clsx from 'clsx'

export default function Dashboard({ filter }) {
  const { queue, advanceStatus, deletePiece, setPage, notify } = useStore()
  const [confirm, setConfirm] = React.useState(null)
  const [viewPiece, setViewPiece] = React.useState(null)

  const filtered = React.useMemo(() => {
    if (filter === 'all') return queue
    return queue.filter(p => p.status === filter || p.format === filter)
  }, [queue, filter])

  const counts = React.useMemo(() => {
    const c = { all: 0, borrador: 0, revision: 0, aprobado: 0, publicado: 0 }
    queue.forEach(p => { c.all++; if (c[p.status] !== undefined) c[p.status]++ })
    return c
  }, [queue])

  const handleDelete = (id) => {
    setConfirm({ id, msg: '¿Eliminar esta pieza de la cola? Esta acción no se puede deshacer.' })
  }
  const confirmDelete = () => {
    deletePiece(confirm.id)
    setConfirm(null)
    notify('Pieza eliminada')
  }

  const handleAdvance = (id) => {
    advanceStatus(id)
    const p = queue.find(q => q.id === id)
    if (!p) return
    const idx = STATUS_FLOW.indexOf(p.status)
    const next = STATUS_FLOW[idx + 1]
    if (next) notify(`Movido a "${STATUS_LABELS[next]}"`)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Sala de redacción</div>
          <div className="page-sub">@psico.entrementes · Sistema de producción editorial</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setPage('ideas')}>
            <i className="ti ti-bulb" /> Nueva idea
          </button>
          <button className="btn btn-primary" onClick={() => setPage('copy')}>
            <i className="ti ti-plus" /> Nueva pieza
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total en cola', value: counts.all, color: 'var(--txt)', sub: 'piezas generadas' },
          { label: 'Para revisar', value: counts.revision, color: '#E6A817', sub: 'esperando aprobación' },
          { label: 'Aprobadas', value: counts.aprobado, color: 'var(--verde)', sub: 'listas para exportar' },
          { label: 'Publicadas', value: counts.publicado, color: 'var(--tc)', sub: 'en Instagram' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Queue table */}
      <div className="col-7-5" style={{ alignItems: 'start' }}>
        <div>
          <div className="section-title">
            <i className="ti ti-stack" /> Cola editorial
            {filter !== 'all' && (
              <span className="tag tag-tc" style={{ marginLeft: 4 }}>
                Filtro: {STATUS_LABELS[filter] || FORMAT_LABELS[filter] || filter}
              </span>
            )}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <EmptyState
                icon="ti-inbox"
                title="La cola está vacía. Generá tu primera pieza en Ideas o Copy."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => setPage('ideas')}>
                    <i className="ti ti-bulb" /> Ir a Ideas
                  </button>
                }
              />
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pieza</th>
                    <th>Formato</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 30).map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', lineHeight: 1.4 }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>
                          {new Date(p.createdAt).toLocaleDateString('es-AR')}
                        </div>
                      </td>
                      <td><FormatTag format={p.format} /></td>
                      <td><StatusPill status={p.status} /></td>
                      <td>
                        <div className="flex-row">
                          {p.status !== 'publicado' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleAdvance(p.id)} title="Avanzar estado">
                              <i className="ti ti-arrow-right" />
                            </button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewPiece(p)} title="Ver copy">
                            <i className="ti ti-eye" />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)} title="Eliminar">
                            <i className="ti ti-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="flex-col">
          {/* Format breakdown */}
          <div>
            <div className="section-title"><i className="ti ti-chart-pie" /> Por formato</div>
            <div className="card">
              {counts.all === 0 ? (
                <div className="text-muted text-sm">Sin piezas aún</div>
              ) : (
                ['carrusel', 'story', 'post'].map(fmt => {
                  const c = queue.filter(p => p.format === fmt).length
                  const pct = counts.all > 0 ? Math.round((c / counts.all) * 100) : 0
                  const colors = { carrusel: 'var(--tc)', story: 'var(--verde)', post: '#6B9EFF' }
                  return (
                    <div key={fmt} style={{ marginBottom: 14 }}>
                      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 5 }}>
                        <span className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{FORMAT_LABELS[fmt]}</span>
                        <span className="text-sm text-muted">{c} piezas</span>
                      </div>
                      <div className="perf-bar-track">
                        <div className="perf-bar-fill" style={{ width: `${pct}%`, background: colors[fmt] }} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <div className="section-title"><i className="ti ti-lightning-bolt" /> Acciones rápidas</div>
            <div className="flex-col" style={{ gap: 7 }}>
              {[
                { label: 'Generar banco de ideas', icon: 'ti-bulb', page: 'ideas' },
                { label: 'Escribir copy', icon: 'ti-writing', page: 'copy' },
                { label: 'Brief de diseño', icon: 'ti-palette', page: 'design' },
                { label: 'Ver calendario', icon: 'ti-calendar', page: 'calendar' },
              ].map(a => (
                <button key={a.page} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setPage(a.page)}>
                  <i className={clsx('ti', a.icon)} /> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {confirm && (
        <ConfirmModal
          msg={confirm.msg}
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        />
      )}

      {viewPiece && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewPiece(null)}>
          <div className="modal-box" style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div className="modal-title">{viewPiece.title}</div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setViewPiece(null)}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--txt)', whiteSpace: 'pre-wrap', lineHeight: 1.8, background: 'var(--surface2)', borderRadius: 10, padding: 16, maxHeight: '60vh', overflowY: 'auto' }}>
              {viewPiece.copy || 'Sin copy guardado.'}
            </div>
            <div className="flex-row" style={{ marginTop: 16 }}>
              <FormatTag format={viewPiece.format} />
              <StatusPill status={viewPiece.status} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
