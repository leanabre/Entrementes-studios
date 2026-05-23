// lib/gemini.js — Cliente de IA vía Groq (gratis, sin tarjeta)
// Conseguí tu key gratis en: https://console.groq.com → API Keys

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const MODEL   = 'llama-3.3-70b-versatile'
const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions'

if (!API_KEY || API_KEY.includes('REEMPLAZAR')) {
  console.warn('[Entrementes Studio] ⚠️  VITE_GROQ_API_KEY no configurada en .env')
}

export async function callGemini(prompt, { maxTokens = 1500 } = {}) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.85,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Respuesta vacía')
  return text
}

export async function callGeminiJSON(prompt, opts = {}) {
  const text  = await callGemini(prompt, { ...opts, maxTokens: opts.maxTokens || 2000 })
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch {
    const match = clean.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (match) return JSON.parse(match[0])
    throw new Error('La respuesta no es JSON válido. Intentá de nuevo.')
  }
}
