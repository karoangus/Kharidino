import React from 'react';

// اجزای کوچک مشترک رابط کاربری

export function Fab({ onClick, label, children }) {
  return (
    <button className="fab" onClick={onClick} aria-label={label}>
      {children ?? <span aria-hidden="true">+</span>}
    </button>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <div
      className="switch-row"
      role="button"
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <span>{label}</span>
      <span
        className={`switch ${checked ? 'on' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-hidden="true"
      >
        <i />
      </span>
    </div>
  );
}

export function EmptyState({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">
        {icon}
      </div>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function Progress({ pct, thin }) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div className={`progress ${thin ? 'thin' : ''}`} aria-hidden="true">
      <i style={{ width: `${w}%` }} />
    </div>
  );
}
