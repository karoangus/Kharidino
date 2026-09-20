// تب «کالاها»: کالاهای من ⭐ + فهرست کامل کالاها (قابل جست‌وجو، ویرایش و توسعه)

import React, { useMemo, useState } from 'react';
import { useApp } from '../state/store.jsx';
import { CATEGORIES, personalizedBuiltins } from '../lib/catalog.js';
import { faMoney, faNum, normKey } from '../lib/utils.js';
import { Fab, EmptyState } from '../components/ui.jsx';
import FavoriteSheet from './FavoriteSheet.jsx';
import NewCatalogItemSheet from './NewCatalogItemSheet.jsx';
import CatalogItemSheet from './CatalogItemSheet.jsx';

export default function ItemsScreen() {
  const { state, dispatch, confirm, toast } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [favFor, setFavFor] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [customOpen, setCustomOpen] = useState(false);

  // فهرست واحد: کالاهای من ⭐ + شخصی + پیش‌فرض (با نسخهٔ شخصی‌شدهٔ کاربر)
  const catalog = useMemo(() => {
    const map = new Map();
    for (const f of state.favorites) {
      map.set(normKey(f.name), {
        ...f,
        src: 'fav',
        defQty: f.qty > 0 ? f.qty : 1
      });
    }
    for (const c of state.customItems) {
      const k = normKey(c.name);
      if (!map.has(k))
        map.set(k, { ...c, src: 'custom', defQty: c.qty > 0 ? c.qty : 1 });
    }
    for (const b of personalizedBuiltins(state.catalogOverrides)) {
      // اگر کاربر نسخهٔ شخصی‌شده را تغییر نام داده، همان نام ملاک است
      const k = normKey(b.name);
      if (!map.has(k))
        map.set(k, {
          ...b,
          src: 'builtin',
          defQty: b.qty > 0 ? b.qty : b.overridden ? 1 : 0
        });
    }
    return [...map.values()];
  }, [state.favorites, state.customItems, state.catalogOverrides]);

  const keyQ = normKey(q);

  const groups = useMemo(() => {
    let out = catalog;
    if (cat !== 'all') out = out.filter((s) => (s.cat || 'other') === cat);
    if (keyQ) out = out.filter((s) => normKey(s.name).includes(keyQ));
    return CATEGORIES.map((c) => ({
      c,
      items: out.filter((s) => (s.cat || 'other') === c.id)
    })).filter((g) => g.items.length > 0);
  }, [catalog, cat, keyQ]);

  const shownTotal = groups.reduce((s, g) => s + g.items.length, 0);

  const isFavOf = (s) =>
    state.favorites.some((f) => normKey(f.name) === normKey(s.name));

  // لمس ردیف = پنجرهٔ ویرایش · کالاهای «کالاهای من» با شیت خودشان ویرایش می‌شوند
  function openEdit(s) {
    if (s.src === 'fav') setFavFor(s.id);
    else setEditItem(s);
  }

  function toggleFav(s) {
    const ex = state.favorites.find((f) => normKey(f.name) === normKey(s.name));
    if (ex) {
      dispatch({ type: 'DELETE_FAVORITE', id: ex.id });
      toast('از کالاهای من حذف شد');
    } else {
      dispatch({
        type: 'ADD_FAVORITE',
        fav: {
          name: s.name,
          emoji: s.emoji || '📦',
          unit: s.unit || 'عدد',
          cat: s.cat || 'other',
          qty: s.defQty > 0 ? s.defQty : 1
        }
      });
      toast('به کالاهای من اضافه شد ⭐');
    }
  }

  function delCustom(s) {
    confirm({
      title: 'حذف کالای شخصی',
      message: `«${s.name}» از فهرست کالاها حذف شود؟`,
      confirmText: 'حذف',
      danger: true
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'DELETE_CUSTOM', id: s.id });
        toast('حذف شد');
      }
    });
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            🛍️
          </div>
          <div className="brand-text">
            <h1>کالاها</h1>
            <p>کالاهای پرمصرف و فهرست کامل</p>
          </div>
        </div>
      </header>

      <main className="screen">
        <section className="sec">
          <div className="sec-head">
            <h2>⭐ کالاهای من</h2>
            <span className="sec-count">{faNum(state.favorites.length)}</span>
          </div>
          {state.favorites.length === 0 ? (
            <div className="mini-empty">
              هنوز کالای ثابتی نداری. روی ⭐ کنار هر کالا بزن تا اینجا ذخیره
              شود و در خریدهای بعدی با یک لمس اضافه شود.
            </div>
          ) : (
            <div className="fav-grid">
              {state.favorites.map((f) => (
                <button
                  key={f.id}
                  className="fav-card"
                  onClick={() => setFavFor(f.id)}
                >
                  <span className="fc-emoji" aria-hidden="true">
                    {f.emoji}
                  </span>
                  <span className="fc-name">{f.name}</span>
                  <span className="fc-meta">
                    {faNum(f.qty)} {f.unit}
                    {f.price > 0 ? ` · ${faMoney(f.price)}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="sec">
          <div className="sec-head">
            <h2>🗂 فهرست کالاها</h2>
            <button className="btn ghost sm" onClick={() => setCustomOpen(true)}>
              + کالای جدید
            </button>
          </div>

          <div className="search-wrap">
            <span className="sw-icon" aria-hidden="true">
              🔎
            </span>
            <input
              className="search-input"
              placeholder="جست‌وجو در فهرست کالاها…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="جست‌وجو در فهرست کالاها"
            />
            {q && (
              <button className="icon-btn sm" onClick={() => setQ('')} aria-label="پاک کردن">
                ✕
              </button>
            )}
          </div>

          <div className="chip-row">
            <button
              className={`chip ${cat === 'all' ? 'on' : ''}`}
              onClick={() => setCat('all')}
            >
              همه
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                className={`chip ${cat === c.id ? 'on' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>

          {shownTotal === 0 ? (
            <EmptyState
              icon="🔍"
              title="چیزی پیدا نشد"
              text={
                keyQ
                  ? `کالایی با نام «${q.trim()}» در فهرست نیست.`
                  : 'هنوز کالایی در این دسته نیست.'
              }
              action={
                <button className="btn primary" onClick={() => setCustomOpen(true)}>
                  + کالای جدید
                </button>
              }
            />
          ) : (
            groups.map(({ c, items }) => (
              <div key={c.id} className="cat-group">
                <div className="res-head">
                  {c.emoji} {c.name}
                </div>
                {items.map((s) => {
                  const fav = isFavOf(s);
                  return (
                    <div
                      className="cat-row"
                      key={s.name}
                      role="button"
                      tabIndex={0}
                      title="ویرایش کالا"
                      onClick={() => openEdit(s)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openEdit(s);
                        }
                      }}
                    >
                      <span className="cr-emoji" aria-hidden="true">
                        {s.emoji}
                      </span>
                      <div className="cr-main">
                        <span className="cr-name">{s.name}</span>
                        {s.src === 'custom' && <span className="tag">شخصی</span>}
                        {s.src === 'builtin' && s.overridden && (
                          <span className="tag">شخصی‌شده</span>
                        )}
                        <span className="cr-unit">
                          {s.defQty > 0
                            ? `${faNum(s.defQty)} ${s.unit}`
                            : s.unit}
                        </span>
                      </div>
                      <button
                        className={`star-btn ${fav ? 'on' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(s);
                        }}
                        aria-label={
                          fav ? 'حذف از کالاهای من' : 'افزودن به کالاهای من'
                        }
                        title="کالاهای من"
                      >
                        {fav ? '⭐' : '☆'}
                      </button>
                      {s.src === 'custom' && (
                        <button
                          className="icon-btn sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            delCustom(s);
                          }}
                          aria-label="حذف کالا"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </section>
      </main>

      <Fab label="کالای جدید" onClick={() => setCustomOpen(true)} />

      {favFor && <FavoriteSheet id={favFor} onClose={() => setFavFor(null)} />}
      {editItem && (
        <CatalogItemSheet item={editItem} onClose={() => setEditItem(null)} />
      )}
      {customOpen && (
        <NewCatalogItemSheet onClose={() => setCustomOpen(false)} />
      )}
    </>
  );
}
