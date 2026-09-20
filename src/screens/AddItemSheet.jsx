// افزودن سریع کالا: جست‌وجو، پیشنهادهای سریع، دسته‌بندی‌ها

import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../state/store.jsx';
import { CATEGORIES, catById, personalizedBuiltins } from '../lib/catalog.js';
import { faNum, normKey } from '../lib/utils.js';
import Sheet from '../components/Sheet.jsx';
import { EmptyState } from '../components/ui.jsx';
import ItemEditSheet from './ItemEditSheet.jsx';

/** مقدار پیش‌فرض کالا: اول مقدار شخصی‌شده، بعد مقدار کالای من، در غیر این صورت ۱ */
function defQtyOf(s, fav) {
  const d = Number(s && s.defQty);
  if (Number.isFinite(d) && d > 0) return Math.min(Math.round(d), 999);
  const f = Number(fav && fav.qty);
  return Number.isFinite(f) && f > 0 ? Math.min(Math.round(f), 999) : 1;
}

export default function AddItemSheet({ listId, onClose }) {
  const { state, dispatch, toast } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [detailFor, setDetailFor] = useState(null);
  const searchRef = useRef(null);
  const list = state.lists.find((l) => l.id === listId);

  // همهٔ منابع کالا: کالاهای من ⭐ + کالاهای شخصی + کالاهای پیش‌فرض
  const sources = useMemo(() => {
    const map = new Map();
    for (const f of state.favorites) {
      map.set(normKey(f.name), {
        name: f.name,
        emoji: f.emoji,
        unit: f.unit,
        cat: f.cat,
        isFav: true,
        fav: f,
        defQty: f.qty
      });
    }
    for (const c of state.customItems) {
      const k = normKey(c.name);
      if (!map.has(k)) map.set(k, { ...c, isFav: false, defQty: c.qty });
    }
    // کالاهای پیش‌فرض با نسخهٔ شخصی‌شدهٔ کاربر (Override)
    for (const b of personalizedBuiltins(state.catalogOverrides)) {
      const k = normKey(b.name);
      if (!map.has(k)) map.set(k, { ...b, isFav: false, defQty: b.qty });
    }
    return [...map.values()];
  }, [state.favorites, state.customItems, state.catalogOverrides]);

  const keyQ = normKey(q);

  const results = useMemo(() => {
    if (!keyQ) return [];
    return sources
      .filter((s) => normKey(s.name).includes(keyQ))
      .sort((a, b) => {
        const ak = normKey(a.name);
        const bk = normKey(b.name);
        const as = ak.startsWith(keyQ) ? 0 : 1;
        const bs = bk.startsWith(keyQ) ? 0 : 1;
        if (as !== bs) return as - bs;
        if (a.isFav !== b.isFav) return a.isFav ? -1 : 1;
        return ak.length - bk.length;
      });
  }, [sources, keyQ]);

  // ⚡ پیشنهادهای سریع: کالاهای همین لیست + اخیراً استفاده‌شده + کالاهای من
  const quick = useMemo(() => {
    if (!list) return [];
    const out = [];
    const seen = new Set();
    const push = (s) => {
      const k = normKey(s.name);
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push(s);
    };
    list.items.forEach(push);
    state.recentItems.forEach(push);
    // کالاهای من ⭐ با مقدار پیش‌فرض خودشان پیشنهاد می‌شوند
    state.favorites.forEach((f) => push({ ...f, defQty: f.qty }));
    return out.slice(0, 10);
  }, [list, state.recentItems, state.favorites]);

  const browse = useMemo(() => {
    if (cat === 'all') {
      return CATEGORIES.map((c) => ({
        c,
        items: sources.filter((s) => (s.cat || 'other') === c.id)
      })).filter((g) => g.items.length > 0);
    }
    return [{ c: catById(cat), items: sources.filter((s) => (s.cat || 'other') === cat) }];
  }, [sources, cat]);

  function addSource(s) {
    if (!list) return;
    const fav = s.fav;
    const existed = list.items.find((x) => normKey(x.name) === normKey(s.name));
    const item = {
      name: s.name,
      emoji: s.emoji || '📦',
      unit: s.unit || 'عدد',
      cat: s.cat || 'other',
      // مقدار پیش‌فرض کالای کاتالوگ (کالاهای من / شخصی / شخصی‌شده)
      qty: defQtyOf(s, fav),
      price: fav && fav.price > 0 ? fav.price : 0,
      note: fav ? fav.note || '' : ''
    };
    dispatch({ type: 'ADD_ITEM', listId, item });
    const newQty = (existed ? existed.qty : 0) + item.qty;
    toast(
      existed
        ? `${item.emoji} تعداد «${item.name}» شد ${faNum(newQty)}`
        : `${item.emoji} «${item.name}» به لیست اضافه شد`
    );
    setQ('');
    requestAnimationFrame(() => {
      if (searchRef.current) searchRef.current.focus();
    });
  }

  if (!list) return null;

  return (
    <Sheet title="افزودن کالا" onClose={onClose}>
      <div className="search-wrap">
        <span className="sw-icon" aria-hidden="true">
          🔎
        </span>
        <input
          ref={searchRef}
          className="search-input"
          autoFocus
          placeholder="جست‌وجوی کالا… مثلاً: شیر"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="جست‌وجوی کالا"
        />
        {q && (
          <button className="icon-btn sm" onClick={() => setQ('')} aria-label="پاک کردن">
            ✕
          </button>
        )}
      </div>

      {keyQ ? (
        results.length === 0 ? (
          <div className="no-result">
            <EmptyState
              icon="🔍"
              title="چیزی پیدا نشد"
              text={`«${q.trim()}» در فهرست کالاها نیست.`}
              action={
                <button
                  className="btn primary"
                  onClick={() =>
                    setDetailFor({
                      name: q.trim(),
                      emoji: '📦',
                      unit: 'عدد',
                      cat: 'other'
                    })
                  }
                >
                  «{q.trim()}» رو بساز و اضافه کن
                </button>
              }
            />
          </div>
        ) : (
          <div className="res-list">
            {CATEGORIES.map((c) => {
              const items = results.filter((s) => (s.cat || 'other') === c.id);
              if (!items.length) return null;
              return (
                <div key={c.id}>
                  <div className="res-head">
                    {c.emoji} {c.name}
                  </div>
                  {items.map((s) => (
                    <div
                      key={s.name}
                      className="res-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => addSource(s)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addSource(s);
                      }}
                    >
                      <span className="rr-emoji" aria-hidden="true">
                        {s.emoji}
                      </span>
                      <span className="rr-name">
                        {s.name}
                        {s.isFav && (
                          <i className="rr-star" title="کالاهای من">
                            {' '}⭐
                          </i>
                        )}
                      </span>
                      <span className="rr-unit">{s.unit}</span>
                      <button
                        className="rr-gear"
                        aria-label="تفصیل: قیمت و تعداد و یادداشت"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailFor(s);
                        }}
                      >
                        ⚙️
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <>
          {quick.length > 0 && (
            <>
              <div className="res-head">⚡ پیشنهادهای سریع</div>
              <div className="chip-row">
                {quick.map((s) => {
                  const inList = list.items.find(
                    (x) => normKey(x.name) === normKey(s.name)
                  );
                  return (
                    <button key={s.name} className="chip" onClick={() => addSource(s)}>
                      {s.emoji} {s.name}
                      {inList && <i className="chip-x">×{faNum(inList.qty)}</i>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="res-head">🗂 دسته‌بندی‌ها</div>
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

          {browse.map(({ c, items }) => (
            <div key={c.id}>
              <div className="res-head">
                {c.emoji} {c.name}
              </div>
              {items.length === 0 ? (
                <div className="res-empty">هنوز کالایی در این دسته نیست.</div>
              ) : (
                <div className="grid">
                  {items.map((s) => (
                    <button key={s.name} className="grid-item" onClick={() => addSource(s)}>
                      <span className="gi-emoji" aria-hidden="true">
                        {s.emoji}
                      </span>
                      <span className="gi-name">{s.name}</span>
                      {s.isFav && <i className="gi-star">⭐</i>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <p className="sheet-hint">
        لمس کالا = افزودن سریع · ⚙️ برای قیمت، تعداد و یادداشت
      </p>

      {detailFor && (
        <ItemEditSheet
          listId={listId}
          preset={detailFor}
          onClose={() => setDetailFor(null)}
        />
      )}
    </Sheet>
  );
}
