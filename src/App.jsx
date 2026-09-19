// شل برنامه: routing ساده، splash، toast، دیالوگ تأیید

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './state/store.jsx';
import ListsScreen from './screens/ListsScreen.jsx';
import ItemsScreen from './screens/ItemsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import ListDetail from './screens/ListDetail.jsx';
import BottomNav from './components/BottomNav.jsx';

function Splash() {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHide(true), 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`splash ${hide ? 'splash-hide' : ''}`} aria-hidden="true">
      <div className="splash-logo">🛒</div>
      <b>خریدینو</b>
      <span>خریدت رو ساده کن</span>
    </div>
  );
}

function CorruptScreen() {
  const { dispatch } = useApp();
  return (
    <div className="corrupt">
      <div className="corrupt-card">
        <div className="empty-icon" aria-hidden="true">
          ⚠️
        </div>
        <b>حافظهٔ برنامه آسیب دیده</b>
        <p>
          اطلاعات ذخیره‌شدهٔ قبلی قابل خواندن نبود. با «ادامه»، یک نسخهٔ تازه
          ساخته می‌شود و داده‌های خراب جایگزین می‌شوند.
        </p>
        <button className="btn primary block" onClick={() => dispatch({ type: 'DISMISS_CORRUPT' })}>
          ادامه و شروع دوباره
        </button>
      </div>
    </div>
  );
}

function ConfirmHost() {
  const { confirmReq, settleConfirm } = useApp();
  if (!confirmReq) return null;
  const { title, message, confirmText = 'تأیید', danger } = confirmReq.opts;
  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) settleConfirm(false);
      }}
    >
      <div className="dialog" role="alertdialog" aria-modal="true">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="dialog-actions">
          <button
            className={`btn ${danger ? 'danger' : 'primary'}`}
            onClick={() => settleConfirm(true)}
          >
            {confirmText}
          </button>
          <button className="btn ghost" onClick={() => settleConfirm(false)}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

function Toaster() {
  const { toastMsg } = useApp();
  if (!toastMsg) return null;
  return (
    <div className="toast" key={toastMsg.key} role="status">
      {toastMsg.text}
    </div>
  );
}

function Shell() {
  const { state, route } = useApp();

  if (state.corrupted) return <CorruptScreen />;

  return (
    <div className="app">
      <Splash />
      {route.openListId ? (
        <ListDetail id={route.openListId} />
      ) : (
        <>
          {route.tab === 'lists' && <ListsScreen />}
          {route.tab === 'items' && <ItemsScreen />}
          {route.tab === 'settings' && <SettingsScreen />}
          <BottomNav />
        </>
      )}
      <Toaster />
      <ConfirmHost />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
