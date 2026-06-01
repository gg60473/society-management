import React from 'react';
import { X } from 'lucide-react';

// ── BADGE ──────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  owned:       { bg: 'rgba(16,185,129,.15)',  color: '#10b981', label: 'Owned' },
  rented:      { bg: 'rgba(6,182,212,.15)',   color: '#06b6d4', label: 'Rented' },
  unsold:      { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b', label: 'Unsold' },
  pending:     { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b', label: 'Pending' },
  approved:    { bg: 'rgba(16,185,129,.15)',  color: '#10b981', label: 'Approved' },
  denied:      { bg: 'rgba(239,68,68,.15)',   color: '#ef4444', label: 'Denied' },
  checked_out: { bg: 'rgba(100,116,139,.15)', color: '#64748b', label: 'Checked Out' },
  open:        { bg: 'rgba(239,68,68,.15)',   color: '#ef4444', label: 'Open' },
  in_progress: { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b', label: 'In Progress' },
  resolved:    { bg: 'rgba(16,185,129,.15)',  color: '#10b981', label: 'Resolved' },
  critical:    { bg: 'rgba(239,68,68,.15)',   color: '#ef4444', label: 'Critical' },
  high:        { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b', label: 'High' },
  medium:      { bg: 'rgba(6,182,212,.15)',   color: '#06b6d4', label: 'Medium' },
  low:         { bg: 'rgba(100,116,139,.15)', color: '#64748b', label: 'Low' },
  normal:      { bg: 'rgba(100,116,139,.15)', color: '#64748b', label: 'Normal' },
  info:        { bg: 'rgba(6,182,212,.15)',   color: '#06b6d4', label: 'Info' },
};

export const Badge = ({ s, small }) => {
  const c = BADGE_STYLES[s] || { bg: 'rgba(99,102,241,.15)', color: '#6366f1', label: s };
  return (
    <span className="badge" style={{
      background: c.bg, color: c.color,
      padding: small ? '2px 7px' : '3px 10px',
      fontSize: small ? 10 : 11,
    }}>
      {c.label}
    </span>
  );
};

// ── AVATAR ─────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#3b82f6','#10b981','#06b6d4','#f59e0b','#ec4899','#8b5cf6','#f97316'];

export const Avatar = ({ name = '?', size = 36 }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className="avatar" style={{
      width: size, height: size,
      background: color + '22',
      border: `1.5px solid ${color}44`,
      color, fontSize: size * 0.35,
    }}>
      {initials}
    </div>
  );
};

// ── MODAL ──────────────────────────────────────────────────────────────────
export const Modal = ({ title, onClose, children, wide }) => (
  <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`modal ${wide ? 'modal-wide' : ''}`}>
      <div className="modal-header">
        <div className="modal-title">{title}</div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
      </div>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

// ── FORM FIELD ─────────────────────────────────────────────────────────────
export const Field = ({ label, hint, children }) => (
  <div className="form-group">
    {label && <label className="form-label">{label}</label>}
    {children}
    {hint && <div className="form-hint">{hint}</div>}
  </div>
);

// ── BUTTON ─────────────────────────────────────────────────────────────────
export const Btn = ({ children, onClick, variant = 'primary', sm, icon, style: s, disabled }) => (
  <button
    className={`btn btn-${variant}${sm ? ' btn-sm' : ''}${icon ? ' btn-icon' : ''}`}
    onClick={onClick}
    disabled={disabled}
    style={s}
  >
    {children}
  </button>
);

// ── LOADING ────────────────────────────────────────────────────────────────
export const Loading = ({ text = 'Loading...' }) => (
  <div className="loading-center">
    <div className="spinner" />
    <span>{text}</span>
  </div>
);

// ── EMPTY STATE ────────────────────────────────────────────────────────────
export const Empty = ({ icon = '📭', title, sub, action }) => (
  <div className="empty">
    <div className="empty-icon">{icon}</div>
    <div className="empty-title">{title}</div>
    {sub && <p style={{ fontSize: 13, marginTop: 4, marginBottom: 16 }}>{sub}</p>}
    {action}
  </div>
);

// ── STAT CARD ──────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="stat-card">
    {icon && <div style={{ fontSize: 22, marginBottom: 10, lineHeight: 1 }}>{icon}</div>}
    <div className="stat-value" style={{ color }}>{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ── PROGRESS BAR ───────────────────────────────────────────────────────────
export const Progress = ({ value, color = 'var(--accent)', label }) => (
  <div>
    {label && (
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
        <span>{label}</span><span style={{ fontWeight: 700, color: 'var(--text)' }}>{value}%</span>
      </div>
    )}
    <div className="progress">
      <div className="progress-bar" style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);

// ── CONFIRM ────────────────────────────────────────────────────────────────
export const Confirm = ({ message, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal" style={{ maxWidth: 360 }}>
      <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Are you sure?</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant="danger" onClick={onConfirm}>Confirm</Btn>
        </div>
      </div>
    </div>
  </div>
);
