// pages/Ideas.jsx — Módulo 1: Banco de Ideas
import React, { useState, useMemo } from 'react'
import { useStore, uid } from '../lib/store.js'
import { callGeminiJSON } from '../lib/gemini.js'
import { buildIdeasPrompt } from '../lib/prompts.js'
import { LoadingState, EmptyState, FormatTag, Modal } from '../components/UI.jsx'
import clsx from 'clsx'

export default function Ideas({ onSendToCopy }) {
  const { ideas, setIdeas, importIdeas, deleteIdea, clearIdeas, notify, setPage } = useStore()

  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [selected, setSelected]         = useState(new Set())
  const [formatFilter, setFormatFilter] = useState('todos')
  const [focus, setFocus]               = useState('')
  const [avoid, setAvoid]               = useState('')
  const [showImport, setShowImport]     = useState(false)
  const [importText, setImportText]     = useState('')
  const [showNew, setShowNew]           = useState(false)
  const [newIdea, setNewIdea]           = useState({ text: '', format: 'carrusel', block: 'A' })
  const [ranking, setRanking]           = useState([])
  const [expandedId, setExpandedId]     = useState(null)

  const blockA = useMemo(() => ideas.filter(i => i.block === 'A' || i.block === 'importado'), [ideas])
  const blockB = useMemo(() => ideas.filter(i => i.block === 'B'), [ideas])
  const applyFilter = (list) => formatFilter === 'todos' ? list : list.filter(i => i.format === formatFilter)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const prompt = buildIdeasPrompt({ focus, avoid, existingIdeas: ideas, formatFilter })
      const data   = await callGeminiJSON(prompt, { maxTokens: 3200 })
      const newIdeas = [
        ...(data.bloque_a || []).map(i => ({
          id: uid(), text: i.texto,
          format: (i.formato || 'carrusel').split(/[\s—–-]/)[0].toLowerCase().trim(),
          formato_razon: i.formato_razon || '',
          block: 'A',
          angulo: i.angulo || '', potencial: i.potencial || 'save', gancho: i.gancho || '',
        })),
        ...(data.bloque_b || []).map(i => ({
          id: uid(), text: i.texto,
          format: (i.formato || 'carrusel').split(/[\s—–-]/)[0].toLowerCase().trim(),
          formato_razon: i.formato_razon || '',
          block: 'B',
          angulo: i.angulo || '', potencial: i.potencial || 'save', gancho: i.gancho || '',
        })),
      ]
      // Guardar ranking separado en estado local (no persiste — es contextual a esta generación)
      setRanking(data.ranking || [])
      setIdeas(newIdeas)
      setSelected(new Set())
      notify(`✓ ${newIdeas.length} ideas generadas`)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleImport = () => {
    if (!importText.trim()) return
    const count = importIdeas(importText)
    setImportText(''); setShowImport(false); setSelected(new Set())
    notify(`✓ ${count} ideas importadas`)
  }

  const handleAddNew = () => {
    if (!newIdea.text.trim()) return
    setIdeas([{ id: uid(), text: newIdea.text.trim(), format: newIdea.format, block: newIdea.block }])
    setNewIdea({ text: '', format: 'carrusel', block: 'A' })
    setShowNew(false)
    notify('✓ Idea agregada al banco')
  }

  const toggleSelect = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const handleSendToCopy = () => {
    const first = ideas.find(i => selected.has(i.id))
    if (first) { onSendToCopy(first.text); setPage('copy') }
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    deleteIdea(id)
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Módulo 1 — Banco de Ideas</div>
          <div className="page-sub">Generá, importá y rankeá ideas para @psico.entrementes</div>
        </div>
        <div className="page-actions">
          {ideas.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => { clearIdeas(); setSelected(new Set()) }}>
              <i className="ti ti-trash" /> Limpiar banco
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setShowNew(true)}>
            <i className="ti ti-plus" /> Nueva manual
          </button>
          <button className="btn btn-secondary" onClick={() => setShowImport(!showImport)}>
            <i className="ti ti-upload" /> Importar lista
          </button>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            <i className="ti ti-sparkles" /> {loading ? 'Generando...' : 'Generar ideas'}
          </button>
        </div>
      </div>

      {/* Config */}
      <div className="card mb-2">
        <div className="module-badge">
          <div className="module-num">1</div>
          <div>
            <div className="module-title">Generador estratégico de ideas</div>
            <div className="module-sub">Analiza patrones del nicho y genera 20 ideas con ángulo, gancho y potencial algorítmico</div>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Foco temático (opcional)</label>
            <input className="input" value={focus} onChange={e => setFocus(e.target.value)}
              placeholder="Ej: ansiedad, vínculos adultos, autoexigencia..." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Formato preferido</label>
            <div className="format-tabs">
              {['todos', 'carrusel', 'story', 'post'].map(f => (
                <button key={f} className={clsx('format-tab', formatFilter === f && 'active')} onClick={() => setFormatFilter(f)}>
                  {f === 'todos' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="form-group mt-2" style={{ marginBottom: 0 }}>
          <label className="form-label">Temas recientes a evitar</label>
          <textarea className="textarea" style={{ minHeight: 60 }} value={avoid} onChange={e => setAvoid(e.target.value)}
            placeholder="Pegá los títulos de tus últimas publicaciones para no repetir territorio..." />
        </div>
      </div>

      {/* Import panel */}
      {showImport && (
        <div className="card mb-2">
          <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Importar banco existente</div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowImport(false)}><i className="ti ti-x" /></button>
          </div>
          <textarea className="textarea" value={importText} onChange={e => setImportText(e.target.value)}
            style={{ minHeight: 140 }}
            placeholder={'Pegá tu lista — una idea por línea:\n5 verdades sobre el duelo que nadie te prepara para escuchar.\nLo que scrollear dos horas a la noche le está haciendo a tu cabeza.'} />
          <div className="flex-row mt-1">
            <button className="btn btn-primary" onClick={handleImport} disabled={!importText.trim()}>
              <i className="ti ti-check" /> Importar
            </button>
            <button className="btn btn-secondary" onClick={() => setShowImport(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card mb-2" style={{ borderColor: 'rgba(192,57,43,0.3)', background: 'rgba(192,57,43,0.04)' }}>
          <div className="flex-row" style={{ gap: 10 }}>
            <i className="ti ti-alert-circle" style={{ color: '#c0392b', fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#c0392b' }}>Error al generar ideas</div>
              <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 3 }}>{error}</div>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="card mb-2"><LoadingState msg="Analizando patrones del nicho y generando ideas..." /></div>}

      {!loading && ideas.length === 0 && (
        <EmptyState icon="ti-bulb" title="Generá tu primer banco de ideas o importá tu lista existente." />
      )}

      {/* Ranking de producción inmediata */}
      {!loading && ranking.length > 0 && (
        <div className="card mb-2" style={{ borderLeft: '3px solid var(--tc)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <i className="ti ti-trophy" style={{ color: 'var(--tc)', fontSize: 16 }} />
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--txt)', letterSpacing: '0.02em' }}>
              RANKING DE PRODUCCIÓN INMEDIATA
            </div>
            <span style={{ fontSize: 11, color: 'var(--txt3)', marginLeft: 'auto' }}>
              Las 3 apuestas más inteligentes ahora
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranking.map((r, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '10px 14px', borderRadius: 10,
                background: 'var(--surface2)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: 'var(--tc)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
                  color: 'var(--beige)', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--txt)', lineHeight: 1.4, marginBottom: 4 }}>
                    {r.texto}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--txt2)', lineHeight: 1.5 }}>
                    {r.razon}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                  background: r.bloque === 'A' ? 'rgba(143,170,118,0.15)' : 'rgba(198,134,110,0.15)',
                  color: r.bloque === 'A' ? 'var(--green)' : 'var(--tc)',
                  letterSpacing: '0.5px', flexShrink: 0,
                }}>BLOQUE {r.bloque}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && applyFilter(blockA).length > 0 && (
        <IdeaBlock title="Bloque A — Rompe patrones" icon="ti-arrows-shuffle"
          ideas={applyFilter(blockA)} selected={selected} onToggle={toggleSelect} onDelete={handleDelete}
          expandedId={expandedId} onExpand={setExpandedId} />
      )}
      {!loading && applyFilter(blockB).length > 0 && (
        <IdeaBlock title="Bloque B — Alto impacto viral" icon="ti-trending-up"
          ideas={applyFilter(blockB)} selected={selected} onToggle={toggleSelect} onDelete={handleDelete}
          expandedId={expandedId} onExpand={setExpandedId} />
      )}

      {/* Floating action bar */}
      {selected.size > 0 && (
        <div style={{ position: 'sticky', bottom: 20, display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
            <span style={{ fontSize: 13, color: 'var(--txt2)' }}>{selected.size} idea{selected.size > 1 ? 's' : ''} seleccionada{selected.size > 1 ? 's' : ''}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}><i className="ti ti-x" /> Limpiar</button>
            <button className="btn btn-primary btn-sm" onClick={handleSendToCopy}><i className="ti ti-writing" /> Desarrollar en Copy Studio</button>
          </div>
        </div>
      )}

      {/* Nueva idea manual */}
      {showNew && (
        <Modal title="Nueva idea manual" onClose={() => setShowNew(false)} width={500}>
          <div className="form-group">
            <label className="form-label">Idea / hook</label>
            <textarea className="textarea" style={{ minHeight: 90 }} autoFocus
              value={newIdea.text} onChange={e => setNewIdea(p => ({ ...p, text: e.target.value }))}
              placeholder="Escribí el título o hook de la idea..." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Formato</label>
              <div className="format-tabs" style={{ flexWrap: 'wrap' }}>
                {['carrusel', 'story', 'post'].map(f => (
                  <button key={f} className={clsx('format-tab', newIdea.format === f && 'active')} onClick={() => setNewIdea(p => ({ ...p, format: f }))}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bloque</label>
              <div className="format-tabs" style={{ flexWrap: 'wrap' }}>
                {[{ key: 'A', label: 'A — Rompe patrones' }, { key: 'B', label: 'B — Viral' }].map(b => (
                  <button key={b.key} className={clsx('format-tab', newIdea.block === b.key && 'active')} onClick={() => setNewIdea(p => ({ ...p, block: b.key }))}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-row">
            <button className="btn btn-primary" onClick={handleAddNew} disabled={!newIdea.text.trim()}>
              <i className="ti ti-plus" /> Agregar al banco
            </button>
            <button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function IdeaBlock({ title, icon, ideas, selected, onToggle, onDelete, expandedId, onExpand }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="section-title">
        <i className={clsx('ti', icon)} />{title}
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--txt3)' }}>{ideas.length} ideas</span>
      </div>
      <div className="grid-2">
        {ideas.map(idea => (
          <IdeaCard key={idea.id} idea={idea}
            isSelected={selected.has(idea.id)}
            isExpanded={expandedId === idea.id}
            onToggle={() => onToggle(idea.id)}
            onDelete={e => onDelete(idea.id, e)}
            onExpand={() => onExpand(expandedId === idea.id ? null : idea.id)}
          />
        ))}
      </div>
    </div>
  )
}

function IdeaCard({ idea, isSelected, isExpanded, onToggle, onDelete, onExpand }) {
  const potencialIcon  = idea.potencial === 'share' ? '🔁' : '💾'
  const potencialLabel = idea.potencial === 'share' ? 'Alcance / Share' : 'Guardados / Save'
  const hasDetails = idea.angulo || idea.gancho || idea.formato_razon

  return (
    <div className={clsx('idea-card', isSelected && 'selected')} onClick={onToggle}
      style={{ cursor: 'pointer', userSelect: 'none' }}>

      {/* Texto principal */}
      <div className="idea-text">{idea.text}</div>

      {/* Detalles expandibles: formato_razon, ángulo y gancho */}
      {hasDetails && isExpanded && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}
          onClick={e => e.stopPropagation()}>
          {idea.formato_razon && (
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--txt2)',
              background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px',
              borderLeft: '2px solid var(--txt3)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--txt3)', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: 3 }}>Formato recomendado</span>
              {idea.formato_razon}
            </div>
          )}
          {idea.angulo && (
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--txt2)',
              background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px',
              borderLeft: '2px solid var(--tc)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--tc)', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: 3 }}>Ángulo disruptivo</span>
              {idea.angulo}
            </div>
          )}
          {idea.gancho && (
            <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--txt2)',
              background: 'var(--surface2)', borderRadius: 8, padding: '8px 10px',
              borderLeft: '2px solid var(--verde)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--verde-d)', textTransform: 'uppercase',
                letterSpacing: '0.5px', display: 'block', marginBottom: 3 }}>Gancho emocional</span>
              {idea.gancho}
            </div>
          )}
        </div>
      )}

      {/* Meta: tags + acciones */}
      <div className="idea-meta" style={{ marginTop: 10 }}>
        <FormatTag format={idea.format} />
        {idea.block === 'A' && <span className="tag tag-verde">Rompe patrones</span>}
        {idea.block === 'B' && <span className="tag tag-tc">Viral</span>}
        {idea.block === 'importado' && <span className="tag tag-default">Importado</span>}
        {idea.potencial && (
          <span title={potencialLabel} style={{ fontSize: 13 }}>{potencialIcon}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          {hasDetails && (
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}
              onClick={onExpand} title={isExpanded ? 'Ocultar detalles' : 'Ver ángulo, gancho y formato'}>
              <i className={clsx('ti', isExpanded ? 'ti-chevron-up' : 'ti-info-circle')} style={{ fontSize: 11 }} />
            </button>
          )}
          <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={onDelete}>
            <i className="ti ti-x" style={{ fontSize: 11 }} />
          </button>
        </div>
      </div>
    </div>
  )
}
