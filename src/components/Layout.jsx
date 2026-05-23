// components/Layout.jsx
import React, { useState } from 'react'
import { useStore } from '../lib/store.js'
import clsx from 'clsx'

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   icon: 'ti-layout-dashboard' },
  { id: 'ideas',       label: 'Ideas',        icon: 'ti-bulb' },
  { id: 'copy',        label: 'Copy',         icon: 'ti-writing' },
  { id: 'design',      label: 'Diseño',       icon: 'ti-palette' },
  { id: 'calendar',    label: 'Calendario',   icon: 'ti-calendar' },
  { id: 'performance', label: 'Stats',        icon: 'ti-chart-bar' },
]

const SIDEBAR_STATUSES = [
  { key: 'all',       label: 'Todos',        icon: 'ti-stack' },
  { key: 'borrador',  label: 'Borrador',     icon: 'ti-file' },
  { key: 'revision',  label: 'En revisión',  icon: 'ti-eye' },
  { key: 'aprobado',  label: 'Aprobado',     icon: 'ti-check' },
  { key: 'exportado', label: 'Exportado',    icon: 'ti-external-link' },
  { key: 'publicado', label: 'Publicado',    icon: 'ti-brand-instagram' },
]

const SIDEBAR_FORMATS = [
  { key: 'carrusel', label: 'Carrusel',    icon: 'ti-layout-list' },
  { key: 'story',    label: 'Story',       icon: 'ti-device-mobile' },
  { key: 'post',     label: 'Post simple', icon: 'ti-photo' },
]

export default function Layout({ children, sidebarFilter, onSidebarFilter }) {
  const { activePage, setPage, queue } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const counts = React.useMemo(() => {
    const c = { all: queue.length, borrador: 0, revision: 0, aprobado: 0, exportado: 0, publicado: 0, carrusel: 0, story: 0, post: 0 }
    queue.forEach(p => {
      if (c[p.status] !== undefined) c[p.status]++
      if (c[p.format] !== undefined) c[p.format]++
    })
    return c
  }, [queue])

  const handleSidebarFilter = (key) => {
    onSidebarFilter(key)
    setDrawerOpen(false)
  }

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="Entrementes" className="brand-logo" />
          <span className="brand-studio">studio</span>
        </div>

        <nav className="top-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={clsx('nav-item', activePage === item.id && 'active')}
              onClick={() => setPage(item.id)}
            >
              <i className={clsx('ti', item.icon)} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="topbar-right">
          <span className="queue-badge">{counts.all} en cola</span>
          <button className="btn-filter-mobile" onClick={() => setDrawerOpen(true)} title="Filtros">
            <i className="ti ti-adjustments-horizontal" />
          </button>
        </div>
      </header>

      <div className="app-body">
        {/* Sidebar — desktop only */}
        <aside className="sidebar">
          <div className="sb-section">
            <div className="sb-label">Estado</div>
            {SIDEBAR_STATUSES.map(({ key, label, icon }) => (
              <button
                key={key}
                className={clsx('sb-item', sidebarFilter === key && 'active')}
                onClick={() => handleSidebarFilter(key)}
              >
                <i className={clsx('ti', icon)} />
                {label}
                <span className="sb-count">{key === 'all' ? counts.all : counts[key] ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="sb-section">
            <div className="sb-label">Formato</div>
            {SIDEBAR_FORMATS.map(({ key, label, icon }) => (
              <button
                key={key}
                className={clsx('sb-item', sidebarFilter === key && 'active')}
                onClick={() => handleSidebarFilter(key)}
              >
                <i className={clsx('ti', icon)} />
                {label}
                <span className="sb-count">{counts[key] ?? 0}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={clsx('bottom-nav-item', activePage === item.id && 'active')}
            onClick={() => setPage(item.id)}
          >
            <i className={clsx('ti', item.icon)} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Filter drawer — mobile only */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-title">Filtros</span>
              <button className="btn-ghost btn-icon" onClick={() => setDrawerOpen(false)}>
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="sb-section">
              <div className="sb-label">Estado</div>
              {SIDEBAR_STATUSES.map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={clsx('sb-item', sidebarFilter === key && 'active')}
                  onClick={() => handleSidebarFilter(key)}
                >
                  <i className={clsx('ti', icon)} />
                  {label}
                  <span className="sb-count">{key === 'all' ? counts.all : counts[key] ?? 0}</span>
                </button>
              ))}
            </div>
            <div className="sb-section">
              <div className="sb-label">Formato</div>
              {SIDEBAR_FORMATS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  className={clsx('sb-item', sidebarFilter === key && 'active')}
                  onClick={() => handleSidebarFilter(key)}
                >
                  <i className={clsx('ti', icon)} />
                  {label}
                  <span className="sb-count">{counts[key] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
