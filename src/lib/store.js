// lib/store.js — Estado global con persistencia en localStorage
import { create } from 'zustand'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// ─── IDs únicos ───────────────────────────────────────────────────────────────
let _id = Date.now()
export const uid = () => ++_id

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Cola editorial ─────────────────────────────────────────────────────────
  queue: load('em_queue', []),

  addToQueue(piece) {
    const updated = [{ ...piece, id: uid(), createdAt: new Date().toISOString() }, ...get().queue]
    set({ queue: updated })
    save('em_queue', updated)
  },

  updatePiece(id, patch) {
    const updated = get().queue.map(p => p.id === id ? { ...p, ...patch } : p)
    set({ queue: updated })
    save('em_queue', updated)
  },

  deletePiece(id) {
    const updated = get().queue.filter(p => p.id !== id)
    set({ queue: updated })
    save('em_queue', updated)
  },

  advanceStatus(id) {
    const flow = ['borrador', 'revision', 'aprobado', 'exportado', 'publicado']
    const piece = get().queue.find(p => p.id === id)
    if (!piece) return
    const idx = flow.indexOf(piece.status)
    if (idx >= flow.length - 1) return
    const newStatus = flow[idx + 1]
    const patch = { status: newStatus }
    if (newStatus === 'publicado') patch.publishedAt = new Date().toISOString()
    get().updatePiece(id, patch)
  },

  // ── Banco de ideas ──────────────────────────────────────────────────────────
  ideas: load('em_ideas', []),

  setIdeas(ideas) {
    const updated = [...ideas, ...get().ideas]
    set({ ideas: updated })
    save('em_ideas', updated)
  },

  importIdeas(rawText) {
    const lines = rawText.split('\n').map(l => l.trim().replace(/^[\*\-\d\.\)•]+\s*/, '')).filter(Boolean)
    const ideas = lines.map(text => ({
      id: uid(),
      text,
      score: Math.floor(Math.random() * 20) + 68,
      format: detectFormat(text),
      block: 'importado',
    }))
    const updated = [...ideas, ...get().ideas]
    set({ ideas: updated })
    save('em_ideas', updated)
    return ideas.length
  },

  deleteIdea(id) {
    const updated = get().ideas.filter(i => i.id !== id)
    set({ ideas: updated })
    save('em_ideas', updated)
  },

  clearIdeas() {
    set({ ideas: [] })
    save('em_ideas', [])
  },

  // ── Design bridge ───────────────────────────────────────────────────────────
  pendingDesignCopy: null,
  setPendingDesignCopy: (copy) => set({ pendingDesignCopy: copy }),

  // ── UI state ────────────────────────────────────────────────────────────────
  activePage: 'dashboard',
  setPage: (page) => set({ activePage: page }),

  notification: null,
  notify(msg, type = 'success') {
    set({ notification: { msg, type, id: uid() } })
    setTimeout(() => set({ notification: null }), 3200)
  },

}))

// ─── Helpers ──────────────────────────────────────────────────────────────────
function detectFormat(text) {
  const t = text.toLowerCase()
  if (t.match(/^\d+\s+(verdad|señal|cosa|razón|error)/)) return 'carrusel'
  if (t.length < 55) return 'post'
  return 'carrusel'
}

export const STATUS_FLOW = ['borrador', 'revision', 'aprobado', 'exportado', 'publicado']
export const STATUS_LABELS = {
  borrador: 'Borrador', revision: 'En revisión', aprobado: 'Aprobado',
  exportado: 'Exportado', publicado: 'Publicado'
}
export const FORMAT_LABELS = { carrusel: 'Carrusel', story: 'Story', post: 'Post simple' }
export const CANVA_TEMPLATES = [
  { id: 'DAHKTDXUWsU', label: 'Plantilla 1', url: 'https://www.canva.com/design/DAHKTDXUWsU/edit' },
  { id: 'DAHKTDPXnVI', label: 'Plantilla 2', url: 'https://www.canva.com/design/DAHKTDPXnVI/edit' },
  { id: 'DAHKTH4Cn0o', label: 'Plantilla 3', url: 'https://www.canva.com/design/DAHKTH4Cn0o/edit' },
  { id: 'DAHKTFmR17g', label: 'Plantilla 4', url: 'https://www.canva.com/design/DAHKTFmR17g/edit' },
  { id: 'DAHKTAZhV3U', label: 'Plantilla 5', url: 'https://www.canva.com/design/DAHKTAZhV3U/edit' },
]
