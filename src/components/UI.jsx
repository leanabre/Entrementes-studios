// components/UI.jsx — Componentes reutilizables
import React from 'react'
import { useStore } from '../lib/store.js'
import clsx from 'clsx'

// ─── Notification ──────────────────────────────────────────────────────────────
export function Notification() {
  const notif = useStore(s => s.notification)
  if (!notif) return null
  return (
    <div className="notification-wrap">
      <div className={clsx('notification', `notification-${notif.type}`)}>
        <i className={clsx('ti', notif.type === 'success' ? 'ti-check' : 'ti-alert-circle')} />
        {notif.msg}
      </div>
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, width = 540 }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Loading state ─────────────────────────────────────────────────────────────
export function LoadingState({ msg = 'Generando...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <span>{msg}</span>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = 'ti-inbox', title, action }) {
  return (
    <div className="empty-state">
      <i className={clsx('ti', icon)} />
      <p>{title}</p>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  )
}

// ─── Status pill ───────────────────────────────────────────────────────────────
const STATUS_LABELS = { borrador: 'Borrador', revision: 'En revisión', aprobado: 'Aprobado', exportado: 'Exportado', publicado: 'Publicado' }
export function StatusPill({ status }) {
  return (
    <span className={clsx('status-pill', `status-${status}`)}>
      <span className={clsx('status-dot', `status-dot-${status}`)} />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ─── Score bar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ score }) {
  const color = score >= 85 ? 'var(--verde)' : score >= 72 ? 'var(--tc)' : 'var(--txt3)'
  return (
    <div className="score-bar">
      <div className="score-track">
        <div className="score-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="score-num">{score}/100</span>
    </div>
  )
}

// ─── Format tag ────────────────────────────────────────────────────────────────
const FORMAT_CONFIG = {
  carrusel: { label: 'Carrusel', icon: 'ti-layout-list', cls: 'tag-tc' },
  story:    { label: 'Story',    icon: 'ti-device-mobile', cls: 'tag-verde' },
  post:     { label: 'Post',     icon: 'ti-photo', cls: 'tag-blue' },
}
export function FormatTag({ format }) {
  const cfg = FORMAT_CONFIG[format] || FORMAT_CONFIG.carrusel
  return (
    <span className={clsx('tag', cfg.cls)}>
      <i className={clsx('ti', cfg.icon)} style={{ fontSize: 11 }} />
      {cfg.label}
    </span>
  )
}

// ─── Confirm dialog ────────────────────────────────────────────────────────────
export function ConfirmModal({ msg, onConfirm, onCancel }) {
  return (
    <Modal title="Confirmar acción" onClose={onCancel} width={380}>
      <p style={{ fontSize: 14, color: 'var(--txt2)', marginBottom: 20, lineHeight: 1.6 }}>{msg}</p>
      <div className="flex-row">
        <button className="btn btn-danger" onClick={onConfirm}>Confirmar</button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </Modal>
  )
}
