# Entrementes Studio

Sistema de producción editorial para @psico.entrementes.
Construido con React + Vite. Requiere Node.js 18+.

---

## Setup rápido (5 pasos)

### 1. Instalá las dependencias
```bash
npm install
```

### 2. Creá tu archivo de variables de entorno
```bash
cp .env.example .env
```

### 3. Editá el `.env` y pegá tu API key de Anthropic
```
VITE_ANTHROPIC_API_KEY=sk-ant-TU-KEY-REAL-AQUI
```

Obtenés tu key en: https://console.anthropic.com/settings/keys

### 4. Levantá el servidor de desarrollo
```bash
npm run dev
```

### 5. Abrí en el navegador
```
http://localhost:3000
```

---

## Build para producción
```bash
npm run build
npm run preview
```

---

## Estructura del proyecto
```
entrementes-studio/
├── src/
│   ├── lib/
│   │   ├── anthropic.js   ← Cliente API centralizado
│   │   ├── prompts.js     ← Todos los prompts del sistema
│   │   └── store.js       ← Estado global + persistencia
│   ├── components/
│   │   ├── Layout.jsx     ← Shell, topbar, sidebar
│   │   └── UI.jsx         ← Componentes reutilizables
│   ├── pages/
│   │   ├── Dashboard.jsx          ← Cola editorial
│   │   ├── Ideas.jsx              ← Módulo 1: Banco de ideas
│   │   ├── Copy.jsx               ← Módulo 2: Copy studio
│   │   ├── Design.jsx             ← Módulo 3: Design bridge
│   │   └── CalendarPerformance.jsx ← Calendario + Performance
│   ├── styles/
│   │   └── global.css     ← Sistema de diseño Entrementes
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── .env.example
```

---

## Para modificar los prompts
Editá únicamente `src/lib/prompts.js`. Todos los prompts del sistema están centralizados ahí:
- `buildIdeasPrompt()` — Módulo 1: generador de ideas
- `buildCopyPrompt()`  — Módulo 2: copywriter de carruseles/stories/posts
- `buildBriefPrompt()` — Módulo 3: brief de diseño para Canva
- `buildCaptionPrompt()` — Generador de captions

---

## Plantillas de Canva configuradas
Las 5 plantillas están en `src/lib/store.js` en `CANVA_TEMPLATES`.
Para agregar o cambiar una plantilla, editá ese array.

---

## Notas de seguridad
- La API key está en `.env` y **nunca se commitea** (está en `.gitignore`)
- Para deploy en producción, usá variables de entorno del hosting (Vercel, Netlify, etc.)
- Si deployás, agregá CORS o usá un backend proxy para no exponer la key al cliente

---

## Deploy en Vercel (opcional)
```bash
npm i -g vercel
vercel
# Cuando te pida variables de entorno, agregá VITE_ANTHROPIC_API_KEY
```
