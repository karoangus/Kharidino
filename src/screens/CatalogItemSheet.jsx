// ویرایش مشخصات یک کالای «فهرست کالاها»
//
// - کالای شخصی: تغییرات مستقیماً روی همان آیتم ذخیره می‌شود.
// - کالای پیش‌فرض: تغییرات به‌صورت Override محلی ذخیره می‌شود و فایل
//   کاتالوگ پیش‌فرض برنامه دست‌نخورده می‌ماند.
// کالاهای «کالاهای من» ⭐ با شیت خودشان (FavoriteSheet) ویرایش می‌شوند.

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import {
  CATEGORIES,
  ITEM_EMOJIS,
  UNITS,
  personalizedBuiltins
} from '../lib/catalog.js';
import { faNum, normKey, toLatinDigits } from '../lib/utils.js';
import Sheet from '../components/Sheet.jsx';
import { EmojiPicker } from '../components/ListSheets.jsx';

export default function CatalogItemSheet({ item, onClose }) {
  const { state, dispatch, toast } = useApp();
  const isBuiltin = item.src === 'builtin';

  const [name, setName] = useState(item.name || '');
  const [emoji, setEmoji] = useState(item.emoji || '📦');
  const [unit, setUnit] = useState(item.unit || 'عدد');
  const [cat, setCat] = useState(item.cat || 'other');
  const [qty, setQty] = useState(String(item.qty || item.defQty || 1));

  const overridden = isBuiltin && !!item.overridden;

  function parsed() {
    const q = parseInt(toLatinDigits(qty), 10);
    return {
      name: name.trim(),
      emoji,
      unit: unit.trim() || 'عدد',
      cat,
      qty: Number.isFinite(q) && q > 0 ? Math.min(q, 999) : 1
    };
  }

  /** نام تکراری در فهرست کالاها مجاز نیست (به‌جز خودِ همین کالا) */
  function nameTaken(n) {
    const key = normKey(n);
    const names = [
      ...state.favorites.map((f) => f.name),
      ...state.customItems
        .filter((c) => c.id !== item.id)
        .map((c) => c.name),
      ...personalizedBuiltins(state.catalogOverrides)
        .filter((b) => b.ovKey !== item.ovKey)
        .map((b) => b.name)
    ];
    return names.some((x) => normKey(x) === key);
  }

  function save() {
    const n = name.trim();
    if (!n) {
      toast('نام کالا رو بنویس ✏️');
      return;
    }
    if (nameTaken(n)) {
      toast('کالایی با این نام از قبل در فهرست هست');
      return;
    }
    const patch = parsed();
    if (isBuiltin) {
      dispatch({ type: 'SET_CATALOG_OVERRIDE', key: item.ovKey, patch });
    } else {
      dispatch({ type: 'UPDATE_CUSTOM', id: item.id, patch });
    }
    toast('تغییرات ذخیره شد ✓');
    onClose();
  }

  function resetToDefault() {
    dispatch({ type: 'CLEAR_CATALOG_OVERRIDE', key: item.ovKey });
    toast('به نسخهٔ پیش‌فرض برگشت');
    onClose();
  }

  const preview = parsed();

  return (
    <Sheet title="ویرایش کالا" onClose={onClose}>
      <div className="cat-preview">
        <span className="cp-emoji" aria-hidden="true">
          {emoji}
        </span>
        <span className="cp-text">
          {name.trim() || 'بدون نام'} — {faNum(preview.qty)} {preview.unit}
        </span>
        <span className="cp-tag">
          {isBuiltin ? (overridden ? 'شخصی‌شده' : 'پیش‌فرض') : 'شخصی'}
        </span>
      </div>

      <label className="field">
        <span>نام کالا</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: شیر"
        />
      </label>

      <div className="field">
        <span>نماد کالا</span>
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={ITEM_EMOJIS} />
      </div>

      <div className="field-row">
        <label className="field">
          <span>مقدار پیش‌فرض</span>
          <input
            inputMode="numeric"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="۱"
          />
        </label>
        <label className="field">
          <span>واحد کالا</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="kharidino-units-catalog"
            placeholder="مثلاً: بطری"
          />
          <datalist id="kharidino-units-catalog">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="field">
        <span>دسته‌بندی</span>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="sheet-actions">
        <button className="btn primary block" onClick={save}>
          ذخیره تغییرات
        </button>
        {isBuiltin && (
          <div className="btn-row">
            {overridden ? (
              <button className="btn ghost" onClick={resetToDefault}>
                بازگشت به پیش‌فرض
              </button>
            ) : (
              <button className="btn ghost" onClick={onClose}>
                انصراف
              </button>
            )}
          </div>
        )}
      </div>

      <p className="hint-inline">
        {isBuiltin
          ? 'این کالا از فهرست پیش‌فرض برنامه است؛ تغییرات فقط روی همین دستگاه و به‌صورت نسخهٔ شخصی‌شده ذخیره می‌شود.'
          : 'این کالای شخصی خودت است؛ تغییرات مستقیماً روی همان ذخیره می‌شود.'}
      </p>
    </Sheet>
  );
}
