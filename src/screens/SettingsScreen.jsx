// تنظیمات: تم‌ها، نمایش، نصب PWA، داده‌ها، درباره

import React, { useRef, useState } from 'react';
import { useApp } from '../state/store.jsx';
import { Switch } from '../components/ui.jsx';

const THEMES = [
  { id: 'light', icon: '☀️', name: 'روشن', desc: 'پس‌زمینهٔ روشن و خوانا' },
  { id: 'dark', icon: '🌙', name: 'تاریک', desc: 'مناسب استفادهٔ شبانه' },
  { id: 'neon', icon: '💜', name: 'نئون', desc: 'تیره با نئون ملایم' },
  { id: 'amoled', icon: '🖤', name: 'AMOLED', desc: 'مشکیِ تمام‌و‌کمال' }
];

export default function SettingsScreen() {
  const { state, dispatch, confirm, toast, installEvt, promptInstall } =
    useApp();
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const theme = state.settings?.theme || 'light';

  function clearSamples() {
    confirm({
      title: 'حذف داده‌های نمونه',
      message:
        'لیست‌های نمونهٔ اولیه (مثل «خرید هفتگی») حذف می‌شوند. لیست‌های خودت دست‌نخورده می‌مانند.',
      confirmText: 'حذف نمونه‌ها'
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'CLEAR_SAMPLES' });
        toast('داده‌های نمونه حذف شد ✓');
      }
    });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kharidino-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('فایل پشتیبان دانلود شد 💾');
  }

  function onImportFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setImporting(true);
    file
      .text()
      .then((t) => {
        const d = JSON.parse(t);
        if (!d || !Array.isArray(d.lists)) throw new Error('bad file');
        return confirm({
          title: 'بازیابی داده‌ها',
          message:
            'داده‌های فعلی با محتوای این فایل جایگزین می‌شود. ادامه می‌دهی؟',
          confirmText: 'بازیابی'
        }).then((ok) => {
          if (ok) {
            dispatch({ type: 'IMPORT', data: d });
            toast('بازیابی شد ✓');
          }
        });
      })
      .catch(() => toast('فایل معتبر نبود ⚠️'))
      .finally(() => setImporting(false));
  }

  function clearAll() {
    confirm({
      title: 'پاک کردن همهٔ داده‌ها',
      message:
        'همهٔ لیست‌ها، کالاهای من و کالاهای شخصی حذف می‌شوند. این کار برگشت‌پذیر نیست!',
      confirmText: 'پاک کردن',
      danger: true
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'RESET_ALL' });
        toast('همهٔ داده‌ها پاک شد');
      }
    });
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            ⚙️
          </div>
          <div className="brand-text">
            <h1>تنظیمات</h1>
            <p>ظاهر و داده‌های خریدینو</p>
          </div>
        </div>
      </header>

      <main className="screen">
        <div className="settings-card">
          <h2>🎨 تم برنامه</h2>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-card ${theme === t.id ? 'on' : ''}`}
                onClick={() => dispatch({ type: 'SET_THEME', theme: t.id })}
              >
                <span className={`t-preview ${t.id}`} aria-hidden="true">
                  <i />
                </span>
                <span className="t-name">
                  {t.icon} {t.name}
                </span>
                <span className="t-desc">{t.desc}</span>
                {theme === t.id && <span className="t-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-card">
          <h2>نمایش</h2>
          <Switch
            checked={!!state.settings?.showPurchased}
            onChange={(v) => dispatch({ type: 'SET_SHOW_PURCHASED', v })}
            label="نمایش کالاهای خریداری‌شده در لیست‌ها"
          />
        </div>

        <div className="settings-card">
          <h2>📲 نصب برنامه</h2>
          {installEvt ? (
            <button className="btn primary block" onClick={promptInstall}>
              افزودن به صفحهٔ اصلی
            </button>
          ) : (
            <p className="hint">
              برای نصب روی صفحهٔ اصلی، از منوی مرورگر گزینهٔ «نصب اپلیکیشن» یا
              «Add to Home Screen» را انتخاب کن. بعد از نصب، خریدینو مثل یک
              اپِ واقعی و کاملاً آفلاین اجرا می‌شود.
            </p>
          )}
        </div>

        <div className="settings-card">
          <h2>داده‌ها</h2>
          {(state.sampleListIds || []).length > 0 && (
            <button className="menu-row" onClick={clearSamples}>
              <span aria-hidden="true">🧹</span> حذف داده‌های نمونه
            </button>
          )}
          <button className="menu-row" onClick={exportData}>
            <span aria-hidden="true">💾</span> خروجی از داده‌ها
          </button>
          <button
            className="menu-row"
            onClick={() => fileRef.current && fileRef.current.click()}
          >
            <span aria-hidden="true">{importing ? '⏳' : '📂'}</span>{' '}
            {importing ? 'در حال بررسی فایل…' : 'بازیابی از فایل'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={onImportFile}
          />
          <button className="menu-row danger" onClick={clearAll}>
            <span aria-hidden="true">🗑</span> پاک کردن همهٔ داده‌ها
          </button>
          <p className="hint">
            همهٔ داده‌ها فقط روی همین دستگاه ذخیره می‌شوند؛ خریدینو برای کار
            کردن به اینترنت نیاز ندارد.
          </p>
        </div>

        <div className="settings-card">
          <h2>دربارهٔ خریدینو</h2>
          <div className="about">
            <div className="brand-logo lg" aria-hidden="true">
              🛒
            </div>
            <div>
              <b>خریدینو</b>
              <span className="ver">نسخهٔ ۱٫۰٫۰</span>
              <p>خریدت رو ساده کن</p>
            </div>
          </div>
          <p className="hint">
            قیمت‌ها فقط تخمین خودت است؛ خریدینو قیمت واقعی فروشگاه‌ها را
            نمی‌داند.
          </p>
        </div>
      </main>
    </>
  );
}
