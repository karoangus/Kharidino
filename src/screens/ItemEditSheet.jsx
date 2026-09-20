// افزودن (با پیش‌فرض دلخواه) و ویرایش یک کالا داخل لیست

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import {
  CATEGORIES,
  ITEM_EMOJIS,
  UNITS
} from '../lib/catalog.js';
import { normKey, toLatinDigits } from '../lib/utils.js';
import Sheet from '../components/Sheet.jsx';
import { EmojiPicker } from '../components/ListSheets.jsx';

export default function ItemEditSheet({ listId, itemId, preset, onClose }) {
  const { state, dispatch, confirm, toast } = useApp();
  const list = state.lists.find((l) => l.id === listId);
  const existing = itemId
    ? list
      ? list.items.find((i) => i.id === itemId)
      : null
    : null;

  const [name, setName] = useState(existing?.name || preset?.name || '');
  const [emoji, setEmoji] = useState(existing?.emoji || preset?.emoji || '📦');
  const [unit, setUnit] = useState(existing?.unit || preset?.unit || 'عدد');
  const [cat, setCat] = useState(existing?.cat || preset?.cat || 'other');
  const [qty, setQty] = useState(
    String(existing?.qty || preset?.qty || preset?.defQty || 1)
  );
  const [price, setPrice] = useState(
    existing && existing.price > 0
      ? String(existing.price)
      : preset && preset.price > 0
        ? String(preset.price)
        : ''
  );
  const [note, setNote] = useState(existing?.note || preset?.note || '');

  if (!list) return null;

  const isFav = name.trim()
    ? state.favorites.some((f) => normKey(f.name) === normKey(name.trim()))
    : false;

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
    const v = parsed();
    if (existing) {
      dispatch({ type: 'UPDATE_ITEM', listId, itemId: existing.id, patch: v });
      toast('تغییرات ذخیره شد ✓');
    } else {
      dispatch({ type: 'ADD_ITEM', listId, item: v });
      toast(`${v.emoji} «${v.name}» به لیست اضافه شد`);
    }
    onClose();
  }

  function del() {
    if (!existing) return;
    confirm({
      title: 'حذف کالا',
      message: `«${existing.name}» رو از لیست حذف کنم؟`,
      confirmText: 'حذف',
      danger: true
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'DELETE_ITEM', listId, itemId: existing.id });
        toast('حذف شد');
        onClose();
      }
    });
  }

  function toggleFav() {
    if (!name.trim()) {
      toast('اول نام کالا رو بنویس ✏️');
      return;
    }
    dispatch({ type: 'TOGGLE_FAV', item: parsed() });
    toast(isFav ? 'از کالاهای من حذف شد' : 'به کالاهای من اضافه شد ⭐');
  }

  return (
    <Sheet title={existing ? 'ویرایش کالا' : 'افزودن کالا'} onClose={onClose}>
      <label className="field">
        <span>نام کالا</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus={!existing}
          placeholder="مثلاً: سیب"
        />
      </label>

      <div className="field">
        <span>نماد</span>
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={ITEM_EMOJIS} />
      </div>

      <div className="field-row">
        <label className="field">
          <span>تعداد</span>
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
            list="kharidino-units"
          />
          <datalist id="kharidino-units">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>قیمت واحد (تومان)</span>
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
        <span>یادداشت</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="اختیاری — مثلاً: کم‌چرب"
        />
      </label>
      <p className="hint-inline">قیمت فقط تخمین خودت است و قیمت واقعی فروشگاه نیست.</p>

      <div className="sheet-actions">
        <button className="btn primary block" onClick={save}>
          {existing ? 'ذخیره' : 'افزودن به لیست'}
        </button>
        <div className="btn-row">
          <button className="btn ghost" onClick={toggleFav}>
            {isFav ? '⭐ در کالاهای من — حذف' : '⭐ به کالاهای من اضافه کن'}
          </button>
          {existing && (
            <button className="btn ghost danger" onClick={del}>
              حذف کالا
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}
