// شیت‌های مرتبط با خود لیست‌ها: ساخت جدید، تغییر نام، منو

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { uid } from '../lib/utils.js';
import { LIST_EMOJIS } from '../lib/catalog.js';
import Sheet from './Sheet.jsx';

export function EmojiPicker({ value, onChange, emojis }) {
  return (
    <div className="emoji-row">
      {emojis.map((e) => (
        <button
          type="button"
          key={e}
          className={`emoji-pick ${value === e ? 'on' : ''}`}
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

export function NewListSheet({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛒');

  function submit(e) {
    e.preventDefault();
    const id = uid();
    onCreated(id, name.trim() || 'لیست جدید', emoji);
  }

  return (
    <Sheet title="لیست جدید" onClose={onClose}>
      <form onSubmit={submit}>
        <label className="field">
          <span>نام لیست</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: خرید هفتگی"
          />
        </label>
        <div className="field">
          <span>نماد</span>
          <EmojiPicker value={emoji} onChange={setEmoji} emojis={LIST_EMOJIS} />
        </div>
        <button className="btn primary block" type="submit">
          ساختن لیست
        </button>
      </form>
    </Sheet>
  );
}

export function RenameListSheet({ list, onClose }) {
  const { dispatch, toast } = useApp();
  const [name, setName] = useState(list.name);
  const [emoji, setEmoji] = useState(list.emoji);

  function save() {
    const n = name.trim() || list.name;
    dispatch({ type: 'RENAME_LIST', id: list.id, name: n, emoji });
    onClose();
    toast('لیست تغییر کرد ✓');
  }

  return (
    <Sheet title="تغییر لیست" onClose={onClose}>
      <label className="field">
        <span>نام لیست</span>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="field">
        <span>نماد</span>
        <EmojiPicker value={emoji} onChange={setEmoji} emojis={LIST_EMOJIS} />
      </div>
      <button className="btn primary block" onClick={save}>
        ذخیره
      </button>
    </Sheet>
  );
}

export function ListMenuSheet({ list, onClose, onRename, onDelete }) {
  return (
    <Sheet title={list.name} onClose={onClose}>
      <button className="menu-row" onClick={onRename}>
        <span aria-hidden="true">✏️</span> تغییر نام
      </button>
      <button className="menu-row danger" onClick={onDelete}>
        <span aria-hidden="true">🗑</span> حذف لیست
      </button>
    </Sheet>
  );
}
