// pages/Design.jsx — Módulo 3: Slides Visuales v2
// Brand system: Entrementes 2026 — matchea Instagram real de psico.entrementes
import React, { useState, useEffect, useCallback } from 'react'
import { useStore } from '../lib/store.js'

// ─── Constantes ───────────────────────────────────────────────────────────────
const W = 1080
const H = 1350
const PREVIEW_SCALE = 0.43
const MARGIN = 130 // ~12% de seguridad

// Paleta exacta del brand system — SOLO estos 4 colores, sin excepciones
const C = {
  beige: '#FFF9F1', // fondo obligatorio
  tc:    '#C6866E', // terracota (acento cálido)
  olive: '#BFC5A1', // verde oliva pastel (acento frío)
  text:  '#646464', // gris piedra (texto principal)
}

// Font stacks
const DISPLAY = "'The Seasons', 'Cormorant Garamond', Georgia, serif"
const UI      = "'Montserrat', system-ui, sans-serif"

// ─── Parser de copy ───────────────────────────────────────────────────────────
function parseCopySlides(raw) {
  if (!raw) return []
  const SKIP = /^(ESTRUCTURA|CAPTION|DIRECCI[OÓ]N\s+VISUAL)/i
  const HEAD = /^(PORTADA|SLIDE\s+VALOR|SLIDE\s+(\d+)|CTA)$/i
  const slides = []
  let cur = null, buf = [], num = 1

  const flush = () => {
    if (!cur) return
    const content = buf.join('\n').trim()
    if (content) slides.push({ ...cur, content })
    buf = []
  }

  for (const line of raw.split('\n')) {
    // Strip markdown bold (**texto** o *texto*)
    const t = line.trim().replace(/^\*{1,2}|\*{1,2}$/g, '').trim()
    if (SKIP.test(t)) { flush(); cur = null; continue }
    if (HEAD.test(t)) {
      flush()
      if      (/^PORTADA$/i.test(t))            { num = 1; cur = { type: 'portada', num } }
      else if (/^SLIDE\s+(\d+)$/i.test(t))      { num = +t.match(/\d+/)[0]; cur = { type: 'slide', num } }
      else if (/^SLIDE\s+VALOR$/i.test(t))      { num++; cur = { type: 'valor', num } }
      else if (/^CTA$/i.test(t))                 cur = { type: 'cta', num: 99 }
    } else if (cur) buf.push(line)
  }
  flush()
  return slides
}

// ─── Tamaño adaptivo de texto ─────────────────────────────────────────────────
const textSize = (text = '', large = false) => {
  const n = text.length
  if (large) {
    if (n < 25)  return 110
    if (n < 50)  return 92
    if (n < 90)  return 76
    if (n < 140) return 64
    return 52
  }
  if (n < 40)  return 90
  if (n < 80)  return 76
  if (n < 140) return 62
  if (n < 230) return 50
  if (n < 350) return 42
  return 36
}

// ─── Decorativos SVG ──────────────────────────────────────────────────────────

// Estrellas de 4 puntas (top-left, como en la referencia)
const Sparkle = ({ top = 48, left = 48, size = 28, color = C.text, opacity = 0.6 }) => (
  <svg style={{ position: 'absolute', top, left, overflow: 'visible', pointerEvents: 'none' }}
    width={size * 3} height={size * 3} viewBox={`0 0 ${size * 3} ${size * 3}`} fill="none">
    {/* Estrella grande */}
    <path
      d={`M${size},${size * 0.18} L${size * 1.18},${size * 0.82} L${size * 1.82},${size} L${size * 1.18},${size * 1.18} L${size},${size * 1.82} L${size * 0.82},${size * 1.18} L${size * 0.18},${size} L${size * 0.82},${size * 0.82}Z`}
      fill={color} opacity={opacity} />
    {/* Estrella chica */}
    <path
      d={`M${size * 2.15},${size * 0.55} L${size * 2.22},${size * 0.78} L${size * 2.45},${size * 0.85} L${size * 2.22},${size * 0.92} L${size * 2.15},${size * 1.15} L${size * 2.08},${size * 0.92} L${size * 1.85},${size * 0.85} L${size * 2.08},${size * 0.78}Z`}
      fill={color} opacity={opacity} />
  </svg>
)

// Curva orgánica terracota (portada, top-right)
const CurveTR = () => (
  <svg style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }}
    width={460} height={440} viewBox="0 0 460 440" fill="none">
    <path d="M460,0 C430,70 370,30 350,150 C330,250 390,310 460,330"
      stroke={C.tc} strokeWidth="2.8" fill="none" strokeLinecap="round" opacity="0.65" />
  </svg>
)

// Mancha oliva (portada, top-right corner)
const OliveBlob = () => (
  <svg style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none' }}
    width={230} height={270} viewBox="0 0 230 270" fill="none">
    <path d="M230,0 C210,0 125,-12 115,88 C105,178 175,205 230,195 Z"
      fill={C.olive} opacity="0.72" />
  </svg>
)

// Líneas onduladas horizontales terracota (portada, lado izquierdo)
const WavesLeft = ({ top = 460 }) => (
  <svg style={{ position: 'absolute', top, left: 0, pointerEvents: 'none' }}
    width={620} height={150} viewBox="0 0 620 150" fill="none">
    <path d="M0,32 C90,12 190,54 290,32 C390,10 470,52 600,30"
      stroke={C.tc} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55" />
    <path d="M0,72 C90,52 190,92 290,72 C390,52 490,88 600,68"
      stroke={C.tc} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.35" />
    <path d="M0,110 C90,90 180,124 290,104"
      stroke={C.tc} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.2" />
  </svg>
)

// Líneas onduladas terracota (slides con card, top-right exterior)
const WavesTR = () => (
  <svg style={{ position: 'absolute', top: 18, right: 18, pointerEvents: 'none' }}
    width={230} height={120} viewBox="0 0 230 120" fill="none">
    <path d="M230,22 C195,12 165,32 130,22 C95,12 65,30 35,22 C18,16 6,22 0,30"
      stroke={C.tc} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.5" />
    <path d="M230,58 C195,48 165,68 130,56 C95,44 65,62 30,54"
      stroke={C.tc} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.32" />
    <path d="M230,92 C195,82 165,100 130,90"
      stroke={C.tc} strokeWidth="1.0" fill="none" strokeLinecap="round" opacity="0.18" />
  </svg>
)

// Líneas onduladas (bottom-left exterior, slides con card)
const WavesBL = () => (
  <svg style={{ position: 'absolute', bottom: 18, left: 18, pointerEvents: 'none' }}
    width={260} height={120} viewBox="0 0 260 120" fill="none">
    <path d="M0,90 C50,78 110,102 160,88 C200,76 230,94 260,84"
      stroke={C.tc} strokeWidth="2.0" fill="none" strokeLinecap="round" opacity="0.42" />
    <path d="M0,115 C50,102 100,118 160,108"
      stroke={C.tc} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.25" />
  </svg>
)

// Círculo con flecha "¡Deslizá!" (bottom-right)
const ArrowCircle = () => (
  <svg style={{ position: 'absolute', bottom: 44, right: 44, pointerEvents: 'none' }}
    width={78} height={78} viewBox="0 0 78 78" fill="none">
    <circle cx="39" cy="39" r="37" fill={C.text} opacity="0.8" />
    <path d="M25,39 L51,39 M43,30 L52,39 L43,48"
      stroke={C.white} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ─── Componentes de UI del slide (solo 4 colores del brand) ──────────────────

// Footer: @PSICO.ENTREMENTES - LIC. LEAN ABREVAYA — Montserrat, CAPS, tracking
const Footer = ({ size = 19 }) => (
  <p style={{
    fontFamily: UI, fontSize: size, fontWeight: 400,
    color: C.text, letterSpacing: '0.17em', textTransform: 'uppercase',
    textAlign: 'center', margin: 0, lineHeight: 1,
  }}>
    @PSICO.ENTREMENTES - LIC. LEAN ABREVAYA
  </p>
)

// Línea separadora terracota
const Divider = ({ width = 180, opacity = 0.4 }) => (
  <div style={{ width, height: 1, background: C.tc, opacity, flexShrink: 0 }} />
)

// Logo EM
const Logo = ({ size = 72 }) => (
  <img src="/logo.png" alt="EM"
    style={{ height: size, width: size, objectFit: 'contain', display: 'block' }} />
)

// ─── PORTADA: Full bleed sobre beige, sin card ───────────────────────────────
function PortadaSlide({ id, slide }) {
  const fs = textSize(slide.content, true)
  return (
    <div id={id} style={{
      position: 'relative', width: W, height: H,
      background: C.beige, overflow: 'hidden', flexShrink: 0,
    }}>
      <OliveBlob />
      <CurveTR />
      <WavesLeft top={Math.round(H * 0.40)} />
      <Sparkle top={48} left={48} size={28} color={C.text} opacity={0.62} />
      <ArrowCircle />

      {/* Logo top-left */}
      <div style={{ position: 'absolute', top: MARGIN, left: MARGIN }}>
        <Logo size={74} />
      </div>

      {/* Título centrado */}
      <div style={{
        position: 'absolute',
        top: MARGIN + 110, left: MARGIN, right: MARGIN, bottom: MARGIN + 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: DISPLAY, fontSize: fs, fontWeight: 400,
          color: C.text, textAlign: 'center',
          lineHeight: 1.08, letterSpacing: '-0.025em', margin: 0,
        }}>
          {slide.content}
        </p>
      </div>

      {/* Footer bottom-center */}
      <div style={{
        position: 'absolute', bottom: MARGIN - 8, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>
        <Divider width={160} />
        <Footer />
      </div>
    </div>
  )
}

// ─── SLIDE INTERMEDIO: Full bleed beige, número terracota, texto centrado ────
// Sin card blanca — solo los 4 colores del brand system
function MiddleSlide({ id, slide, circleNum }) {
  const fs = textSize(slide.content)
  return (
    <div id={id} style={{
      position: 'relative', width: W, height: H,
      background: C.beige, overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Decorativos */}
      <Sparkle top={48} left={48} size={26} color={C.text} opacity={0.52} />
      <WavesTR />
      <WavesBL />
      <ArrowCircle />

      {/* Número — círculo terracota, texto beige */}
      <div style={{
        position: 'absolute', top: MARGIN + 30, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          width: 66, height: 66, borderRadius: '50%', background: C.tc,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: UI, fontSize: 26, fontWeight: 500,
          color: C.beige, letterSpacing: '-0.5px',
        }}>
          {circleNum}
        </div>
      </div>

      {/* Texto principal centrado */}
      <div style={{
        position: 'absolute',
        top: MARGIN + 140, left: MARGIN, right: MARGIN, bottom: MARGIN + 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: DISPLAY, fontSize: fs, fontWeight: 400,
          color: C.text, textAlign: 'center',
          lineHeight: 1.12, letterSpacing: '-0.02em', margin: 0,
        }}>
          {slide.content}
        </p>
      </div>

      {/* Footer bottom-center */}
      <div style={{
        position: 'absolute', bottom: MARGIN - 8, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      }}>
        <Divider width={210} opacity={0.35} />
        <Footer size={18} />
      </div>
    </div>
  )
}

// ─── CTA / ÚLTIMO SLIDE: ola terracota desde abajo, logo en área beige ───────
function CTASlide({ id, slide }) {
  const fs = textSize(slide.content, true)
  const waveH = Math.round(H * 0.40)

  return (
    <div id={id} style={{
      position: 'relative', width: W, height: H,
      background: C.beige, overflow: 'hidden', flexShrink: 0,
    }}>
      <CurveTR />
      <Sparkle top={48} left={48} size={26} color={C.text} opacity={0.5} />

      {/* Ola terracota desde el borde inferior */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, pointerEvents: 'none' }}
        width={W} height={waveH + 100} viewBox={`0 0 ${W} ${waveH + 100}`}
        preserveAspectRatio="none" fill="none">
        <path
          d={`M0,100 C${W * 0.15},55 ${W * 0.35},105 ${W * 0.5},68 C${W * 0.65},30 ${W * 0.85},80 ${W},55 L${W},${waveH + 100} L0,${waveH + 100}Z`}
          fill={C.tc} />
      </svg>

      {/* Footer top */}
      <div style={{
        position: 'absolute', top: MARGIN, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <Footer />
        <Divider width={160} />
      </div>

      {/* Logo en área beige, justo sobre la ola */}
      <div style={{
        position: 'absolute',
        bottom: waveH + 36,
        left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <Logo size={88} />
      </div>

      {/* Texto de cierre */}
      <div style={{
        position: 'absolute',
        top: MARGIN + 90, left: MARGIN, right: MARGIN,
        bottom: waveH + 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: DISPLAY, fontSize: fs, fontWeight: 400,
          color: C.text, textAlign: 'center',
          lineHeight: 1.1, letterSpacing: '-0.025em', margin: 0,
        }}>
          {slide.content}
        </p>
      </div>
    </div>
  )
}

// ─── Router de slides ─────────────────────────────────────────────────────────
function SlideEl({ id, slide, isFirst, isLast, idx }) {
  if (isFirst) return <PortadaSlide id={id} slide={slide} />
  if (isLast)  return <CTASlide    id={id} slide={slide} />
  return <MiddleSlide id={id} slide={slide} circleNum={idx} />
}

// ─── Captura PNG con html2canvas ──────────────────────────────────────────────
async function captureSlide(slideId, filename) {
  const el = document.getElementById(slideId)
  if (!el) return

  const { default: html2canvas } = await import('html2canvas')

  // Clonar sin transform de escala
  const clone = el.cloneNode(true)
  clone.style.cssText = `position:fixed;top:-99999px;left:-99999px;width:${W}px;height:${H}px;transform:none;`
  document.body.appendChild(clone)

  // Esperar fuentes e imágenes
  await document.fonts.ready
  await Promise.all(
    Array.from(clone.querySelectorAll('img')).map(img =>
      img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r })
    )
  )

  try {
    const canvas = await html2canvas(clone, {
      scale: 1, useCORS: true, allowTaint: false,
      backgroundColor: C.beige, width: W, height: H, logging: false,
    })
    const a = document.createElement('a')
    a.download = filename
    a.href = canvas.toDataURL('image/png')
    a.click()
  } finally {
    document.body.removeChild(clone)
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Design() {
  const { queue, pendingDesignCopy, setPendingDesignCopy, updatePiece, notify } = useStore()

  const [copy, setCopy]       = useState('')
  const [slides, setSlides]   = useState([])
  const [dlIdx, setDlIdx]     = useState(null)
  const [dlAll, setDlAll]     = useState(false)
  const [showFonts, setShowFonts] = useState(false)

  // Auto-carga desde Copy Studio
  useEffect(() => {
    if (pendingDesignCopy) {
      setCopy(pendingDesignCopy)
      setSlides(parseCopySlides(pendingDesignCopy))
      setPendingDesignCopy(null)
    }
  }, [pendingDesignCopy])

  // Auto-carga la pieza aprobada más reciente (solo al montar)
  useEffect(() => {
    if (!pendingDesignCopy) {
      const latest = queue.find(p => p.status === 'aprobado' && p.copy)
      if (latest) setCopy(latest.copy)
    }
  }, [])

  const handleParse = () => {
    const parsed = parseCopySlides(copy)
    if (!parsed.length) { notify('No se encontraron slides en el copy', 'error'); return }
    setSlides(parsed)
    notify(`✓ ${parsed.length} slides generados`)
  }

  const handleDownload = useCallback(async (i, slide) => {
    setDlIdx(i)
    try {
      await captureSlide(`slide-${i}`, `${String(i + 1).padStart(2, '0')}-${slide.type}.png`)
    } catch {
      notify('Error al generar PNG — intentá de nuevo', 'error')
    }
    setDlIdx(null)
  }, [notify])

  const handleDownloadAll = useCallback(async () => {
    setDlAll(true)
    for (let i = 0; i < slides.length; i++) {
      setDlIdx(i)
      await captureSlide(`slide-${i}`, `${String(i + 1).padStart(2, '0')}-${slides[i].type}.png`)
      await new Promise(r => setTimeout(r, 700))
    }
    setDlIdx(null)
    setDlAll(false)
    notify(`✓ ${slides.length} slides descargados`)
  }, [slides, notify])

  const approvedPieces = queue.filter(p => p.status === 'aprobado' && p.copy)
  const PW = Math.round(W * PREVIEW_SCALE)
  const PH = Math.round(H * PREVIEW_SCALE)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Módulo 3 — Slides Visuales</div>
          <div className="page-sub">Generación automática · 1080 × 1350 px · Estilo Entrementes 2026</div>
        </div>
        {slides.length > 0 && (
          <button className="btn btn-primary" onClick={handleDownloadAll} disabled={dlAll}>
            <i className="ti ti-download" />
            {dlAll ? 'Descargando...' : `Descargar ${slides.length} slides`}
          </button>
        )}
      </div>

      <div className="col-6-4" style={{ alignItems: 'start' }}>

        {/* ── Panel izquierdo ── */}
        <div className="flex-col">

          {/* Piezas aprobadas */}
          {approvedPieces.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 11, fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Piezas listas para diseñar
              </div>
              <div className="flex-col" style={{ gap: 6 }}>
                {approvedPieces.slice(0, 5).map(p => (
                  <button key={p.id} className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                    onClick={() => { setCopy(p.copy); setSlides(parseCopySlides(p.copy)) }}>
                    <i className="ti ti-file-text" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Editor de copy */}
          <div className="card">
            <div className="module-badge">
              <div className="module-num">3</div>
              <div>
                <div className="module-title">Design Studio</div>
                <div className="module-sub">Copy → slides 1080×1350 para Instagram</div>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Copy del carrusel</label>
              <textarea className="textarea" style={{ minHeight: 220 }} value={copy}
                onChange={e => setCopy(e.target.value)}
                placeholder={'Viene automáticamente desde Copy Studio.\nO pegá el output del Módulo 2 acá...'} />
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleParse} disabled={!copy.trim()}>
            <i className="ti ti-sparkles" /> Generar slides visuales
          </button>

          {/* Info de tipografías (colapsable) */}
          {slides.length > 0 && (
            <div className="card" style={{ padding: '12px 16px' }}>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => setShowFonts(f => !f)}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--txt2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipografías activas</span>
                <i className={`ti ${showFonts ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: 13 }} />
              </button>
              {showFonts && (
                <div style={{ marginTop: 10 }}>
                  {[
                    { name: 'The Seasons', note: 'Display — colocar en /public/fonts/TheSeasons-Regular.woff2', ok: false },
                    { name: 'Cormorant Garamond', note: 'Fallback display (cargada vía Google Fonts)', ok: true },
                    { name: 'Source Sans 3', note: 'Body (cargada)', ok: true },
                    { name: 'Montserrat', note: 'UI, footer, números (cargada)', ok: true },
                    { name: 'Poppins', note: 'Alternativa body (cargada)', ok: true },
                  ].map(f => (
                    <div key={f.name} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                      <span style={{ color: f.ok ? 'var(--green)' : 'var(--tc)', fontSize: 12, marginTop: 1 }}>
                        {f.ok ? '✓' : '○'}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--txt)' }}>{f.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--txt3)' }}>{f.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Panel derecho — previews ── */}
        <div>
          {slides.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--txt2)' }}>
              <i className="ti ti-layout-cards" style={{ fontSize: 38, display: 'block', marginBottom: 16, color: 'var(--border2)' }} />
              <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Los slides aparecen aquí.<br />
                Vienen automáticamente desde Copy Studio,<br />
                o pegá el copy y hacé clic en "Generar".
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {slides.map((slide, i) => {
                const isFirst = i === 0
                const isLast  = i === slides.length - 1
                const busy    = dlIdx === i || dlAll

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    {/* Etiqueta del slide */}
                    <div style={{ fontSize: 10, color: 'var(--txt3)', letterSpacing: '2.5px', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
                      {String(i + 1).padStart(2, '0')} —{' '}
                      {isFirst ? 'Portada' : isLast ? 'CTA' : slide.type === 'valor' ? 'Valor' : `Slide ${i}`}
                    </div>

                    {/* Preview a escala */}
                    <div style={{
                      width: PW, height: PH,
                      overflow: 'hidden', borderRadius: 8,
                      boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
                      position: 'relative', flexShrink: 0,
                    }}>
                      <div style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: W, height: H }}>
                        <SlideEl id={`slide-${i}`} slide={slide} isFirst={isFirst} isLast={isLast} idx={i} />
                      </div>
                    </div>

                    {/* Botón descargar */}
                    <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => handleDownload(i, slide)}>
                      {busy
                        ? <><i className="ti ti-loader" /> Generando PNG...</>
                        : <><i className="ti ti-download" /> Descargar PNG</>}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
