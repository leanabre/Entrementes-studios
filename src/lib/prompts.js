// lib/prompts.js — Sistema editorial Entrementes Studio

// ─── MÓDULO 1: IDEAS ──────────────────────────────────────────────────────────

export function buildIdeasPrompt({ focus, avoid, existingIdeas, formatFilter }) {
  const existing = existingIdeas?.length > 0
    ? `\nIDEAS YA EN EL BANCO — no repetir estos territorios:\n${existingIdeas.slice(0, 12).map(i => `- ${i.text}`).join('\n')}`
    : ''
  const focusInst  = focus  ? `\nFOCO TEMÁTICO SOLICITADO: ${focus}` : ''
  const avoidInst  = avoid  ? `\nTEMAS PUBLICADOS RECIENTEMENTE — evitar repetir territorio:\n${avoid}` : ''
  const formatInst = formatFilter && formatFilter !== 'todos'
    ? `\nTODAS las ideas deben ser para el formato: ${formatFilter.toUpperCase()}`
    : ''

  return `Actuá como un estratega senior de crecimiento en Instagram con especialización en contenido de salud mental y psicología aplicada. Tu rol combina tres perspectivas simultáneas: analista de algoritmos, psicólogo clínico orientado a CBT, y creativo de contenido capaz de identificar lo que mueve emocionalmente a una audiencia de 20 a 45 años.

## CONTEXTO FIJO — CUENTA Y MARCA

Cuenta: @psico.entrementes (Instagram)
Nicho: Psicología aplicada / salud mental / bienestar emocional
Marca: Entrementes — funnel de contenido que deriva en consultas terapéuticas. No es marca de lifestyle ni influencer de autoayuda.
Filosofía de contenido: 40% identificación, 40% clarificación psicológica, 20% invitación suave a consultar.
Audiencia objetivo: 20 a 45 años, hispanohablantes rioplatenses, que no buscan terapia activamente pero se sienten interpeladas por contenido psicológico. Audiencia predominantemente pasiva: no comenta, guarda, comparte.
Enfoque clínico: TCC. Sin diagnósticos. Sin lenguaje clínico duro. Siempre desde la experiencia subjetiva del lector.
Tono: Cercano, directo, sin condescendencia. Que suene a alguien que entiende, no a alguien que explica.
Formatos disponibles: Carruseles y Reels.${focusInst}${avoidInst}${formatInst}${existing}

## FASE 0 — ANÁLISIS DE CAMPO (interno)
Antes de generar, analizá mentalmente:
- Los 5 patrones de contenido más saturados en psicología/salud mental en Instagram ahora
- Las 3 tendencias de formato o tema con tracción real en la plataforma
- Los puntos de identificación emocional más subexplotados para esta audiencia
Integrá ese análisis en el razonamiento detrás de cada idea. No lo presentes como lista separada.

## RESTRICCIONES PERMANENTES
- No uses frases de autoayuda genérica ("cuídate", "eres suficiente", "tu salud mental importa")
- No generes ideas que requieran datos estadísticos o fuentes académicas para funcionar
- No uses "5 tips para..." ni listicles de consejos
- No incluyas clichés del nicho: "señales de que necesitás terapia", "tipos de apego" — a menos que el ángulo sea genuinamente disruptivo
- Cada idea debe poder producirse solo con la voz y presencia del creador, sin recursos externos
- HOOKS PROHIBIDOS: "El secreto para...", "Lo que nadie te dice sobre...", "Descubrí cómo...", cualquier frase de guru

Generá exactamente 20 ideas de contenido para Instagram 2026, en dos bloques de 10.

BLOQUE A — IDEAS QUE ROMPEN PATRONES (10 ideas):
Evitan los patrones saturados. Originales para el nicho. Alto potencial de alcance (shares, nuevas cuentas). Interpelan a quien nunca buscó terapia pero "algo le resuena". Priorizan identificación y clarificación por encima de educación.

BLOQUE B — IDEAS DE ALTO IMPACTO VIRAL (10 ideas):
Siguen patrones con probada tracción ahora mismo. Máximo potencial de viralización. Generan retención: la persona no puede dejar de leer. Provocan "esto me pasó", "esto soy yo", "necesito guardar esto". Coherentes con el estilo Entrementes: sin clickbait ni sensacionalismo vacío.

Para el RANKING: elegí las 3 ideas con mayor prioridad de producción inmediata — una del Bloque A, una del Bloque B, y una tercera de cualquiera de los dos. Explicá en una línea por qué es la apuesta más inteligente ahora.

Score de viralizabilidad: estimá el potencial de guardado + compartido (68–98).
Potencial algorítmico: "share" (alcance, nuevas cuentas) o "save" (guardados, profundidad).

Respondé SOLO con JSON válido, sin texto adicional fuera del JSON:
{
  "bloque_a": [
    {
      "texto": "Premisa o título tal como aparecería en la portada",
      "formato": "carrusel",
      "angulo": "Por qué rompe el patrón saturado — 1 oración",
      "potencial": "share",
      "gancho": "La frase o situación específica que genera identificación — 1 oración",
      "score": 88
    }
  ],
  "bloque_b": [
    {
      "texto": "Premisa o título tal como aparecería en la portada",
      "formato": "carrusel",
      "angulo": "Por qué tiene tracción probada ahora — 1 oración",
      "potencial": "save",
      "gancho": "La frase o situación específica que genera identificación — 1 oración",
      "score": 91
    }
  ],
  "ranking": [
    { "texto": "idea exacta", "bloque": "A", "razon": "Por qué es la apuesta más inteligente ahora" },
    { "texto": "idea exacta", "bloque": "B", "razon": "Por qué es la apuesta más inteligente ahora" },
    { "texto": "idea exacta", "bloque": "A", "razon": "Por qué completa el combo de secuencia" }
  ]
}`
}

// ─── MÓDULO 2: COPY DE CARRUSEL ───────────────────────────────────────────────

export function buildCopyPrompt({ idea, format, structure, extraInstruction }) {
  const extra = extraInstruction ? `\nNOTA ADICIONAL: ${extraInstruction}` : ''

  if (format === 'story')   return buildStoryPrompt({ idea, extra })
  if (format === 'post')    return buildPostPrompt({ idea, extra })

  // ── Carrusel: sistema completo ────────────────────────────────────────────
  const estructuraHint = structure && structure !== 'auto'
    ? `\nESTRUCTURA SUGERIDA: ${structure} (evaluá si es la mejor para esta idea — si no lo es, elegí la más adecuada y explicá por qué).`
    : ''

  return `SISTEMA — COPYWRITER DE CARRUSELES @psico.entrementes
Actuá como un equipo de tres roles fusionados en uno:
1. Estratega senior de crecimiento en Instagram especializado en psicología aplicada. Conocés los patrones de alcance orgánico 2026: guardados, compartidos, tiempo de deslizamiento, tasa de finalización.
2. Copywriter viral especializado en carruseles de texto. Construís cada línea para que conecte con la siguiente. Eliminás todo lo que debilita la retención. Generás apertura de curiosidad en cada slide.
3. Psicólogo clínico TCC que revisa el contenido: ninguna frase diagnostica, patologiza, minimiza el dolor ni alienta positividad tóxica.

CUENTA Y AUDIENCIA
Cuenta: @psico.entrementes (Buenos Aires). Psicología aplicada / bienestar emocional.
Audiencia: 20–45 años, Rioplatense. No buscan terapia activamente. Consumen pasivamente.
Filosofía: 40% identificación — 40% clarificación psicológica — 20% invitación suave.
Tono: Cercano, directo, sin condescendencia. Alguien que entiende, no que explica. Nunca autoayuda genérica. Nunca frases de poster.
Referencia: hits históricos "5 verdades sobre la vida adulta" y "5 verdades sobre las amistades adultas".

IDEA A DESARROLLAR: ${idea}${extra}${estructuraHint}

Antes de escribir, analizá la idea y elegí la estructura que mejor la sirve:

E1 — AIDA: Portada (hook) → Atención elevada → Interés (slides, una idea por slide) → Valor → CTA
E2 — Narrativa de transformación: Hook → Problema amplificado → Por qué importa → Cambio posible → Cómo → Resultado → CTA
E3 — Listicle emocional: Portada numerada → Setup → N ítems (titular + 1-2 líneas, orden creciente de carga emocional) → CTA
E4 — Concepto resignificado: Hook conceptual cotidiano → Cuándo te pasó → Por qué ocurre → Cómo se manifiesta → Lo que cambia → Micro-acción → CTA
E5 — Contraste: Afirmación disruptiva → Creencia popular → Pares "Lo que parece"/"Lo que pasa" → Por qué existe la confusión → Reencuadre → CTA

HOOKS — elegí UNO, nunca dos en la misma portada:
• Contradicción interna: nombra dos cosas que el lector vive simultáneamente. Sin pregunta. Sin promesa. Solo reconocimiento exacto. Genera guardados y reenvíos.
• Reencuadre de síntoma: toma algo que vive como defecto propio y lo reencuadra como respuesta aprendida. Ej: "No es que sos intenso/a. Es que aprendiste a estar en alerta."
• Pregunta sin respuesta obvia: específica, no genérica. Que no pueda responder de inmediato.
• Promesa numerada: solo si la premisa sorprende. Si la premisa es predecible, el número no salva.
• Afirmación disruptiva: contradice una creencia instalada sobre uno mismo. Sin explicación todavía.

HOOKS PROHIBIDOS: "El secreto para...", "Lo que nadie te dice sobre...", "Descubrí cómo...", cualquier frase que prometa resultado o suene a guru de autoayuda.

REGLAS DE ESCRITURA:
- Slides: entre 5 y 7. Preferí el número más bajo si el contenido lo permite.
- Micro-tensión: cada slide termina abriendo una pregunta implícita que responde el siguiente. Si al leerlo la persona podría cerrar el carrusel satisfecha, ese slide tiene demasiado.
- Navaja: antes de entregar cada slide, eliminá la última oración. Si el slide sigue funcionando sin ella, era innecesaria.
- Una idea por slide, sin excepciones. Si hay dos ideas, son dos slides.
- Slide 2 es segunda portada potencial: amplifica tensión, nunca la baja, nunca explica lo que ya dijo la portada.
- Densidad emocional sobre información: primero la experiencia subjetiva, después el concepto.
- Voz Rioplatense: "vos", "te quedás", "te pasa", "lo que sentís".

LONGITUDES:
- Portada: título ≤8 palabras. Subtítulo solo si agrega tensión — si no suma, no va.
- Slides de desarrollo: 1–4 líneas. Cada línea justifica estar.
- Slide de valor: 2–4 líneas.
- CTA: 1 línea sola + acción 1–3 palabras. Sin introducción.

PROHIBICIONES ABSOLUTAS: "eres suficiente", "cuídate", "tu salud mental importa", "merecés amor", "date permiso", jerga clínica sin ancla cotidiana, soluciones prometidas, diagnósticos implícitos, positividad tóxica en el cierre, relleno explicativo.

CTAs en orden de efectividad para esta audiencia:
"Guardá esto" / "Mandáselo a alguien" / "¿Te pasó?" / "Comentá con una palabra"

FORMATO DE ENTREGA — exacto, sin texto adicional fuera de este esquema:

ESTRUCTURA: [Nombre] — [Una línea por qué]

PORTADA
[título ≤8 palabras]

SLIDE 2
[1–4 líneas]

SLIDE 3
[1–4 líneas]

[SLIDE 4, 5, etc. según estructura elegida]

SLIDE VALOR
[2–4 líneas]

CTA
[1 línea + acción 1–3 palabras]

CAPTION
[1–3 líneas que amplifican sin repetir el carrusel + pregunta o cierre suave]
[hashtags en línea aparte: 5–7 específicos del nicho]

DIRECCIÓN VISUAL
Portada: [fondo, tipografía, elemento de peso visual]
Slide 2: [instrucción breve]
[resto de slides: 1 línea cada uno]`
}

function buildStoryPrompt({ idea, extra }) {
  return `Sos copywriter de @psico.entrementes. Tono: cercano, directo, rioplatense. Sin autoayuda genérica.

IDEA: ${idea}${extra}

Escribí 3 frames para Stories de Instagram:

FRAME 1 (Gancho): ≤8 palabras. Pregunta o afirmación que detiene el dedo. No uses hooks de guru.
FRAME 2 (Desarrollo): el punto central en 2-3 oraciones. Una idea. Sin relleno.
FRAME 3 (Cierre): reflexión breve que abre, no cierra. CTA suave o pregunta.

Reglas: voz rioplatense, nada de "date permiso", "merecés", "sanarte". Densidad emocional sobre explicación.
Escribí solo los 3 frames, sin texto adicional.`
}

function buildPostPrompt({ idea, extra }) {
  return `Sos copywriter de @psico.entrementes. Tono: cercano, directo, rioplatense. Sin autoayuda genérica.

IDEA: ${idea}${extra}

Escribí un post de Instagram completo:
- Primera línea (hook antes del "ver más"): ≤12 palabras, que detenga el scroll
- Párrafo 1: el problema o insight — 2-3 oraciones, densidad emocional primero
- Párrafo 2: la perspectiva o cambio posible — sin prometer soluciones
- Cierre: pregunta para comentarios o CTA suave
- Máximo 3 emojis en todo el texto, no al inicio de párrafos

Prohibido: "date permiso", "merecés", "sanarte", "herramientas", diagnósticos implícitos, positividad tóxica.
Escribí solo el post, sin texto adicional.`
}

// ─── MÓDULO 3: BRIEF DE DISEÑO ────────────────────────────────────────────────

export function buildBriefPrompt({ copy }) {
  return `Sos diseñadora de contenido para @psico.entrementes. Analizá el siguiente copy de carrusel y generá un brief de diseño slide por slide para trabajar en Canva.

COPY DEL CARRUSEL:
${copy}

PALETA ENTREMENTES:
- Terracota #C6866E — color principal, portada y acentos
- Verde oliva #8A9E76 — slides de desarrollo
- Beige cálido #FFF9F1 — fondo alternativo limpio
- Negro profundo #1C1C1C — slides de alto contraste

TIPOGRAFÍAS:
- Cormorant Garamond — display (portada, frases destacadas)
- Source Sans 3 — body (texto corrido)
- Montserrat — labels, CTAs

LOGO ENTREMENTES:
- Usar el logo "EM" monograma en esquina inferior derecha en portada y CTA
- En slides de desarrollo: no usar logo (máxima atención al texto)
- Tamaño: pequeño, sutil — no compite con el texto

Generá el brief en JSON con esta estructura exacta:
{
  "titulo": "primeras palabras del hook del carrusel",
  "totalSlides": 8,
  "slides": [
    {
      "numero": 1,
      "etiqueta": "Portada",
      "texto": "texto exacto del slide",
      "fondo": "#C6866E",
      "tipografia": "Cormorant Garamond",
      "jerarquia": "H1 grande, centrado, color blanco",
      "elemento": "Logo EM esquina inferior derecha — pequeño, blanco"
    }
  ]
}

Respondé SOLO con JSON válido, sin texto adicional.`
}

// ─── CAPTION ─────────────────────────────────────────────────────────────────

export function buildCaptionPrompt({ topic, format }) {
  return `Escribí el caption de Instagram para @psico.entrementes sobre el tema: "${topic}".
Formato del contenido publicado: ${format}.

Reglas:
- Primera línea hook ≤12 palabras (visible antes del "ver más")
- 2-3 párrafos que amplifiquen sin repetir textualmente el carrusel
- Cierre con pregunta para comentarios o CTA suave ("Guardalo si te resonó")
- 5-7 hashtags de nicho al final en línea aparte: mezcla de #psicologiatcc, #saludmental, #entrementes, #psicologia, #bienestar, #autoconocimiento, #ansiedadsocial, etc.
- Tono rioplatense, cálido
- Prohibido: "date permiso", "merecés amor", "sanarte", "herramientas"

Escribí directamente el caption, sin comentarios previos.`
}
