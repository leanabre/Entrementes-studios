// pages/Copy.jsx — Módulo 2: Copy Studio
import React, { useState } from 'react'
import { useStore } from '../lib/store.js'
import { callGemini } from '../lib/gemini.js'
import { buildCopyPrompt, buildCaptionPrompt } from '../lib/prompts.js'
import { LoadingState, FormatTag, Modal } from '../components/UI.jsx'
import clsx from 'clsx'

const STRUCTURES = [
  { id: 'auto',           label: 'Auto',       desc: 'modelo elige' },
  { id: 'AIDA',           label: 'AIDA',       desc: 'detención + scroll' },
  { id: 'transformacion', label: 'Transf.',    desc: 'problema → cambio' },
  { id: 'listicle',       label: 'Listicle',   desc: 'verdades / señales' },
  { id: 'resignificado',  label: 'Resignific.', desc: 'concepto cotidiano' },
  { id: 'contraste',      label: 'Contraste',  desc: 'creencia vs realidad' },
]

export default function Copy({ prefillIdea }) {
  const { addToQueue, setPage, notify, setPendingDesignCopy } = useStore()

  const [format, setFormat]               = useState('carrusel')
  const [idea, setIdea]                   = useState(prefillIdea || '')
  const [structure, setStructure]         = useState('auto')
  const [extraNote, setExtraNote]         = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [output, setOutput]               = useState(null)
  const [editMode, setEditMode]           = useState(false)
  const [editedOutput, setEditedOutput]   = useState('')
  const [captionModal, setCaptionModal]   = useState(false)
  const [captionLoading, setCaptionLoading] = useState(false)
  const [captionOutput, setCaptionOutput] = useState('')

  React.useEffect(() => { if (prefillIdea) setIdea(prefillIdea) }, [prefillIdea])

  const handleGenerate = async () => {
    if (!idea.trim()) { notify('Escribí o seleccioná una idea primero', 'error'); return }
    setLoading(true); setError(null); setOutput(null); setEditMode(false)
    try {
      const prompt = buildCopyPrompt({ idea, format, structure, extraInstruction: extraNote })
      const text   = await callGemini(prompt, { maxTokens: 1600 })
      setOutput(text); setEditedOutput(text)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleApprove = () => {
    const finalText = editMode ? editedOutput : output
    if (!finalText) return
    addToQueue({ title: idea.substring(0, 70) + (idea.length > 70 ? '...' : ''), format, status: 'revision', copy: finalText })
    notify('✓ Pieza agregada a la cola en "En revisión"')
    setOutput(null); setEditMode(false); setIdea('')
  }

  const handleSendToDesign = () => {
    const finalText = editMode ? editedOutput : output
    addToQueue({ title: idea.substring(0, 70) + (idea.length > 70 ? '...' : ''), format, status: 'aprobado', copy: finalText })
    setPendingDesignCopy(finalText)
    notify('✓ Aprobado y enviado a Diseño')
    setPage('design')
  }

  const handleCaption = async () => {
    setCaptionModal(true); setCaptionLoading(true); setCaptionOutput('')
    try {
      const prompt = buildCaptionPrompt({ topic: idea, format })
      const text   = await callGemini(prompt, { maxTokens: 500 })
      setCaptionOutput(text)
    } catch (e) { setCaptionOutput(`Error: ${e.message}`) }
    setCaptionLoading(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Módulo 2 — Copy Studio</div>
          <div className="page-sub">Copywriting viral por formato · TCC · Rioplatense · 2026</div>
        </div>
      </div>

      <div className="col-6-4" style={{ alignItems: 'start' }}>
        {/* Config */}
        <div className="flex-col">
          <div className="card">
            <div className="module-badge">
              <div className="module-num">2</div>
              <div>
                <div className="module-title">Configuración del copy</div>
                <div className="module-sub">Elegí el formato, la idea y la estructura</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Formato</label>
              <div className="format-tabs">
                {[
                  { id: 'carrusel', label: 'Carrusel', icon: 'ti-layout-list' },
                  { id: 'story',    label: 'Story',    icon: 'ti-device-mobile' },
                  { id: 'post',     label: 'Post',     icon: 'ti-photo' },
                ].map(f => (
                  <button key={f.id} className={clsx('format-tab', format === f.id && 'active')} onClick={() => setFormat(f.id)}>
                    <i className={clsx('ti', f.icon)} /> {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Idea / tema a desarrollar</label>
              <textarea className="textarea" style={{ minHeight: 80 }} value={idea} onChange={e => setIdea(e.target.value)}
                placeholder={'Escribí la idea o pegala desde el banco.\nEj: Por qué elegís personas que no están del todo disponibles.'} />
            </div>

            {format === 'carrusel' && (
              <div className="form-group">
                <label className="form-label">Estructura <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— o dejá que el modelo elija</span></label>
                <div className="structure-grid">
                  {STRUCTURES.map(s => (
                    <button key={s.id} className={clsx('structure-btn', structure === s.id && 'active')} onClick={() => setStructure(s.id)}>
                      <strong>{s.label}</strong>{s.desc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Nota adicional (opcional)</label>
              <input className="input" value={extraNote} onChange={e => setExtraNote(e.target.value)}
                placeholder="Ej: enfocate en quien evita, no en quien lo sufre" />
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !idea.trim()}>
            <i className="ti ti-sparkles" /> {loading ? 'Escribiendo...' : 'Generar copy'}
          </button>
          {output && (
            <button className="btn btn-secondary" onClick={handleCaption}>
              <i className="ti ti-message" /> Generar caption + hashtags
            </button>
          )}
        </div>

        {/* Output */}
        <div>
          {loading && <div className="card"><LoadingState msg="Escribiendo el copy..." /></div>}

          {error && !loading && (
            <div className="card" style={{ borderColor: 'rgba(192,57,43,0.3)' }}>
              <div className="flex-row" style={{ gap: 10, marginBottom: 10 }}>
                <i className="ti ti-alert-circle" style={{ color: '#c0392b', fontSize: 18, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#c0392b' }}>Error al generar copy</div>
                  <div style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 3 }}>{error}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleGenerate}><i className="ti ti-refresh" /> Reintentar</button>
            </div>
          )}

          {!loading && !error && !output && (
            <div className="card" style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--txt2)' }}>
              <i className="ti ti-writing" style={{ fontSize: 36, display: 'block', marginBottom: 14, color: 'var(--border2)' }} />
              <p style={{ fontSize: 13 }}>El output aparece aquí.<br />Podés editarlo antes de aprobar.</p>
            </div>
          )}

          {output && !loading && (
            <div className="output-block">
              <div className="output-header">
                <div className="flex-row" style={{ gap: 8 }}>
                  <span className="tag tag-verde"><i className="ti ti-check" style={{ fontSize: 11 }} /> Copy generado</span>
                  <FormatTag format={format} />
                </div>
                <div className="flex-row">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditMode(!editMode); if (!editMode) setEditedOutput(output) }}>
                    <i className={clsx('ti', editMode ? 'ti-eye' : 'ti-edit')} /> {editMode ? 'Ver' : 'Editar'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleGenerate} title="Regenerar">
                    <i className="ti ti-refresh" />
                  </button>
                </div>
              </div>

              {editMode ? (
                <textarea className="textarea"
                  style={{ borderRadius: 0, border: 'none', borderTop: '1px solid var(--border)', minHeight: 400, padding: 20 }}
                  value={editedOutput} onChange={e => setEditedOutput(e.target.value)} />
              ) : (
                <div className="output-body">{output}</div>
              )}

              <div className="output-header" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', justifyContent: 'flex-end' }}>
                <div className="flex-row">
                  <button className="btn btn-secondary" onClick={handleApprove}>
                    <i className="ti ti-check" /> Aprobar → En revisión
                  </button>
                  <button className="btn btn-primary" onClick={handleSendToDesign}>
                    <i className="ti ti-palette" /> Aprobar → Ir a Diseño
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caption modal */}
      {captionModal && (
        <Modal title="Caption + Hashtags" onClose={() => setCaptionModal(false)} width={520}>
          {captionLoading ? (
            <LoadingState msg="Generando caption..." />
          ) : (
            <>
              <div style={{ fontSize: 13, color: 'var(--txt)', whiteSpace: 'pre-wrap', lineHeight: 1.8, background: 'var(--surface2)', borderRadius: 10, padding: 16, maxHeight: '50vh', overflowY: 'auto' }}>
                {captionOutput}
              </div>
              <div className="flex-row mt-2">
                <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(captionOutput); notify('Caption copiado') }}>
                  <i className="ti ti-copy" /> Copiar
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleCaption}>
                  <i className="ti ti-refresh" /> Regenerar
                </button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}
