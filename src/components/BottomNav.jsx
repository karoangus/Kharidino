import React from 'react';
import { useApp } from '../state/store.jsx';

const TABS = [
  { id: 'lists', icon: '🏠', label: 'لیست‌ها' },
  { id: 'items', icon: '🛍️', label: 'کالاها' },
  { id: 'settings', icon: '⚙️', label: 'تنظیمات' }
];

export default function BottomNav() {
  const { route, setTab } = useApp();
  return (
    <nav className="bottom-nav" aria-label="ناوبری اصلی">
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`bn-tab ${
            route.tab === t.id && !route.openListId ? 'active' : ''
          }`}
          onClick={() => setTab(t.id)}
        >
          <span className="bn-icon" aria-hidden="true">
            {t.icon}
          </span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
