// افزودن کالای شخصی به فهرست کالاها (توسعهٔ فهرست)

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { CATEGORIES, ITEM_EMOJIS, UNITS } from '../lib/catalog.js';
import { uid, normKey } from '../lib/utils.js';
import Sheet from '../components/Sheet.jsx';
import { EmojiPicker } from '../components/ListSheets.jsx';

export default function NewCatalogItemSheet({ onClose }) {
  const { state, dispatch, toast } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [unit, setUnit] = useState('عدد');
  const [cat, setCat] = useState('other');

  function save() {
    const n = name.trim();
    if (!n) {
      toast('نام کالا رو بنویس ✏️');
      return;
    }
    const exists =
      state.customItems.some((c) => normKey(c.name) === normKey(n)) ||
      state.favorites.some((f) => normKey(f.name) === normKey(n));
    if (exists) {
      toast('این کالا قبلاً در فهرست است');
      return;
    }
    dispatch({
      type: 'ADD_CUSTOM',
      item: { id: uid(), name: n, emoji, unit: unit.trim() || 'عدد', cat }
    });
    toast(`${emoji} «${n}» به فهرست کالاها اضافه شد`);
    onClose();
  }

  return (
    <Sheet title="کالای جدید" onClose={onClose}>
      <label className="field">
        <span>نام کالا</span>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: کرهٔ بادام‌زمینی"
        />
      </label>

      <div className="field">
        <span>نماد</span>
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={ITEM_EMOJIS} />
      </div>

      <div className="field-row">
        <label className="field">
          <span>واحد</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            list="kharidino-units-new"
          />
          <datalist id="kharidino-units-new">
            {UNITS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
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

      <button className="btn primary block" onClick={save}>
        افزودن به فهرست کالاها
      </button>
      <p className="hint-inline">
        بعد از افزودن، می‌توانی روی ⭐ بزنی و آن را به «کالاهای من» بسپاری.
      </p>
    </Sheet>
  );
}
