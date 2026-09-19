// ویرایش کالای ثابت (کالاهای من ⭐) + افزودن سریع به یک لیست

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { CATEGORIES, ITEM_EMOJIS, UNITS } from '../lib/catalog.js';
import { toLatinDigits } from '../lib/utils.js';
import Sheet from '../components/Sheet.jsx';
import { EmojiPicker } from '../components/ListSheets.jsx';

export default function FavoriteSheet({ id, onClose }) {
  const { state, dispatch, confirm, toast } = useApp();
  const fav = state.favorites.find((f) => f.id === id);

  const [name, setName] = useState(fav?.name || '');
  const [emoji, setEmoji] = useState(fav?.emoji || '📦');
  const [unit, setUnit] = useState(fav?.unit || 'عدد');
  const [cat, setCat] = useState(fav?.cat || 'other');
  const [qty, setQty] = useState(String(fav?.qty || 1));
  const [price, setPrice] = useState(fav && fav.price > 0 ? String(fav.price) : '');
  const [note, setNote] = useState(fav?.note || '');
  const [listId, setListId] = useState(state.lists[0]?.id || '');

  if (!fav) return null;

  function parsed() {
    const q = parseInt(toLatinDigits(qty), 10);
    const p = parseInt(toLatinDigits(price), 10);
    return {
      name: name.trim(),
      emoji,
      unit: unit.trim() || 'عدد',
      cat,
      qty: Number.isFinite(q) && q > 0 ? Math.min(q, 999) : 1,
      price: Number.isFinite(p) && p > 0 ? Math.min(p, 9999999999) : 0,
      note: note.trim()
    };
  }

  function save() {
    if (!name.trim()) {
      toast('نام کالا رو بنویس ✏️');
      return;
    }
    dispatch({ type: 'UPDATE_FAVORITE', id: fav.id, patch: parsed() });
    toast('پیش‌فرض‌ها ذخیره شد ✓');
    onClose();
  }

  function addToList() {
    if (!listId) {
      toast('اول یک لیست انتخاب کن');
      return;
    }
    const v = parsed();
    dispatch({ type: 'ADD_ITEM', listId, item: v });
    toast(`${v.emoji} «${v.name}» به لیست اضافه شد`);
    onClose();
  }

  function del() {
    confirm({
      title: 'حذف کالای ثابت',
      message: `«${fav.name}» از کالاهای من حذف شود؟`,
      confirmText: 'حذف',
      danger: true
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'DELETE_FAVORITE', id: fav.id });
        toast('حذف شد');
        onClose();
      }
    });
  }

  return (
    <Sheet title="کالای من ⭐" onClose={onClose}>
      <label className="field">
        <span>نام کالا</span>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <div className="field">
        <span>نماد</span>
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={ITEM_EMOJIS} />
      </div>

      <div className="field-row">
        <label className="field">
          <span>تعداد پیش‌فرض</span>
          <input
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </label>
        <label className="field">
          <span>واحد</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="kharidino-units-fav"
          />
          <datalist id="kharidino-units-fav">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>قیمت پیش‌فرض (تومان)</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="اختیاری"
          />
        </label>
        <label className="field">
          <span>دسته</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>یادداشت پیش‌فرض</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="اختیاری"
        />
      </label>

      <label className="field">
        <span>افزودن به لیست</span>
        <select
          value={listId}
          onChange={(e) => setListId(e.target.value)}
          disabled={state.lists.length === 0}
        >
          {state.lists.length === 0 ? (
            <option value="">اول یک لیست بساز</option>
          ) : (
            state.lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.emoji} {l.name}
              </option>
            ))
          )}
        </select>
      </label>

      <div className="sheet-actions">
        <button className="btn primary block" onClick={addToList}>
          به لیست اضافه کن
        </button>
        <div className="btn-row">
          <button className="btn ghost" onClick={save}>
            ذخیره پیش‌فرض‌ها
          </button>
          <button className="btn ghost danger" onClick={del}>
            حذف
          </button>
        </div>
      </div>
    </Sheet>
  );
}
