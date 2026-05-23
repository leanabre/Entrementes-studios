// App.jsx — Componente raíz
import React, { useState } from 'react'
import { useStore } from './lib/store.js'
import Layout from './components/Layout.jsx'
import { Notification } from './components/UI.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Ideas from './pages/Ideas.jsx'
import Copy from './pages/Copy.jsx'
import Design from './pages/Design.jsx'
import { Calendar, Performance } from './pages/CalendarPerformance.jsx'

export default function App() {
  const { activePage } = useStore()
  const [sidebarFilter, setSidebarFilter] = useState('all')
  const [prefillIdea, setPrefillIdea]     = useState('')

  // Cuando se envía una idea desde Ideas → Copy
  const handleSendToCopy = (ideaText) => {
    setPrefillIdea(ideaText)
  }

  const handleSidebarFilter = (filter) => {
    setSidebarFilter(filter)
    // Si el sidebar filtra por estado/formato, ir al dashboard
    const statusKeys  = ['all', 'borrador', 'revision', 'aprobado', 'exportado', 'publicado']
    const formatKeys  = ['carrusel', 'story', 'post']
    if ([...statusKeys, ...formatKeys].includes(filter)) {
      useStore.getState().setPage('dashboard')
    }
  }

  const page = (() => {
    switch (activePage) {
      case 'dashboard':   return <Dashboard filter={sidebarFilter} />
      case 'ideas':       return <Ideas onSendToCopy={handleSendToCopy} />
      case 'copy':        return <Copy prefillIdea={prefillIdea} />
      case 'design':      return <Design />
      case 'calendar':    return <Calendar />
      case 'performance': return <Performance />
      default:            return <Dashboard filter={sidebarFilter} />
    }
  })()

  return (
    <>
      <Layout sidebarFilter={sidebarFilter} onSidebarFilter={handleSidebarFilter}>
        {page}
      </Layout>
      <Notification />
    </>
  )
}
