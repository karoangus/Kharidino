// صفحهٔ اصلی: لیست خریدها

import React, { useState } from 'react';
import { useApp } from '../state/store.jsx';
import { faNum, relTime } from '../lib/utils.js';
import { Fab, EmptyState, Progress } from '../components/ui.jsx';
import {
  NewListSheet,
  RenameListSheet,
  ListMenuSheet
} from '../components/ListSheets.jsx';

export default function ListsScreen() {
  const { state, dispatch, openList, toast, confirm } = useApp();
  const [creating, setCreating] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const lists = state.lists;

  function createList(id, name, emoji) {
    dispatch({ type: 'NEW_LIST', id, name, emoji });
    setCreating(false);
    openList(id);
    toast(`لیست «${name}» ساخته شد ✓`);
  }

  function askDelete(l) {
    confirm({
      title: 'حذف لیست',
      message: `لیست «${l.name}» و همهٔ کالاهایش حذف شود؟`,
      confirmText: 'حذف',
      danger: true
    }).then((ok) => {
      if (!ok) return;
      dispatch({ type: 'DELETE_LIST', id: l.id });
      setMenuFor(null);
      toast('لیست حذف شد');
    });
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            🛒
          </div>
          <div className="brand-text">
            <h1>خریدینو</h1>
            <p>خریدت رو ساده کن</p>
          </div>
        </div>
      </header>

      <main className="screen">
        {lists.length === 0 ? (
          <EmptyState
            icon="🛒"
            title="هنوز لیستی نداری"
            text="با دکمهٔ «+» پایین، اولین لیست خریدت رو بساز."
          />
        ) : (
          <div className="stack">
            {lists.map((l) => {
              const total = l.items.length;
              const done = l.items.filter((i) => i.purchased).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={l.id}
                  className="list-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openList(l.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openList(l.id);
                  }}
                >
                  <div className="lc-emoji" aria-hidden="true">
                    {l.emoji}
                  </div>
                  <div className="lc-main">
                    <div className="lc-top">
                      <b className="lc-name">{l.name}</b>
                      <span className="lc-pct">{faNum(pct)}٪ تکمیل</span>
                    </div>
                    <div className="lc-meta">
                      {faNum(done)} / {faNum(total)} کالا
                      {pct === 100 && total > 0
                        ? ' · همه چیز تمام شد 🎉'
                        : total > 0
                          ? ' · در حال خرید'
                          : ''}
                    </div>
                    <Progress pct={pct} thin />
                    <div className="lc-time">آخرین تغییر: {relTime(l.updatedAt)}</div>
                  </div>
                  <button
                    className="icon-btn lc-menu"
                    aria-label="گزینه‌های لیست"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuFor(l.id);
                    }}
                  >
                    ⋮
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Fab label="لیست جدید" onClick={() => setCreating(true)} />

      {creating && (
        <NewListSheet
          onClose={() => setCreating(false)}
          onCreated={createList}
        />
      )}
      {renaming && (
        <RenameListSheet
          list={lists.find((l) => l.id === renaming)}
          onClose={() => setRenaming(null)}
        />
      )}
      {menuFor && (
        <ListMenuSheet
          list={lists.find((l) => l.id === menuFor)}
          onClose={() => setMenuFor(null)}
          onRename={() => {
            setRenaming(menuFor);
            setMenuFor(null);
          }}
          onDelete={() => askDelete(lists.find((l) => l.id === menuFor))}
        />
      )}
    </>
  );
}
