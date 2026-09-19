// داخل یک لیست خرید: کالاهای کارت‌ای، حالت خرید، جمع تقریبی

import React, { useEffect, useState } from 'react';
import { useApp } from '../state/store.jsx';
import { faNum, faMoney, toLatinDigits } from '../lib/utils.js';
import { Fab, EmptyState, Progress } from '../components/ui.jsx';
import { RenameListSheet, ListMenuSheet } from '../components/ListSheets.jsx';
import AddItemSheet from './AddItemSheet.jsx';
import ItemEditSheet from './ItemEditSheet.jsx';

function ItemCard({ item, onToggle, onInc, onDec, onSetQty, onOpen }) {
  const [editQty, setEditQty] = useState(false);
  const [val, setVal] = useState('');

  useEffect(() => {
    if (editQty) setVal(String(item.qty));
  }, [editQty]);

  function commit() {
    const n = parseInt(toLatinDigits(val), 10);
    if (Number.isFinite(n) && n >= 1) onSetQty(Math.min(n, 999));
    setEditQty(false);
  }

  return (
    <div
      className={`item-card ${item.purchased ? 'done' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
    >
      <button
        className={`check ${item.purchased ? 'on' : ''}`}
        aria-label={item.purchased ? 'نشانه‌زدن کالا' : 'علامت خریداری شد'}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {item.purchased ? '✓' : ''}
      </button>

      <div className="ic-body">
        <div className="ic-title">
          <span className="ic-emoji" aria-hidden="true">
            {item.emoji}
          </span>
          <span className="ic-name">{item.name}</span>
        </div>
        <div className="ic-sub">
          <span className="ic-qty">
            {faNum(item.qty)} {item.unit}
          </span>
          {item.note && <span className="ic-note">📝 {item.note}</span>}
          {item.price > 0 && (
            <span className="ic-price">{faMoney(item.price * item.qty)}</span>
          )}
        </div>
      </div>

      <div className="stepper" onClick={(e) => e.stopPropagation()}>
        <button className="st-btn" onClick={onDec} aria-label="کاهش تعداد">
          −
        </button>
        {editQty ? (
          <input
            className="st-input"
            inputMode="numeric"
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
            }}
            aria-label="تعداد"
          />
        ) : (
          <button
            className="st-val"
            onClick={() => setEditQty(true)}
            aria-label="ورود مستقیم تعداد"
          >
            {faNum(item.qty)}
          </button>
        )}
        <button className="st-btn" onClick={onInc} aria-label="افزایش تعداد">
          +
        </button>
      </div>
    </div>
  );
}

export default function ListDetail({ id }) {
  const { state, dispatch, closeList, confirm, toast } = useApp();
  const list = state.lists.find((l) => l.id === id);
  const [adding, setAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);

  if (!list) {
    return (
      <div className="detail">
        <header className="detail-header">
          <button className="icon-btn" onClick={closeList} aria-label="بازگشت">
            →
          </button>
          <b className="dh-static">لیست پیدا نشد</b>
          <span />
        </header>
        <main className="screen">
          <EmptyState
            icon="🤔"
            title="این لیست وجود ندارد"
            text="شاید قبلاً حذف شده است."
          />
        </main>
      </div>
    );
  }

  const total = list.items.length;
  const done = list.items.filter((i) => i.purchased).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const pricedCount = list.items.filter((i) => i.price > 0).length;
  const unpricedCount = total - pricedCount;
  const totalMoney = list.items.reduce(
    (s, i) => s + (i.price > 0 ? i.price * i.qty : 0),
    0
  );
  const shown = state.settings.showPurchased
    ? list.items
    : list.items.filter((i) => !i.purchased);

  function inc(it) {
    dispatch({
      type: 'UPDATE_ITEM',
      listId: id,
      itemId: it.id,
      patch: { qty: Math.min(it.qty + 1, 999) }
    });
  }

  function dec(it) {
    if (it.qty <= 1) {
      confirm({
        title: 'حذف کالا',
        message: `«${it.name}» رو از لیست حذف کنم؟`,
        confirmText: 'حذف',
        danger: true
      }).then((ok) => {
        if (ok) {
          dispatch({ type: 'DELETE_ITEM', listId: id, itemId: it.id });
          toast('حذف شد');
        }
      });
    } else {
      dispatch({
        type: 'UPDATE_ITEM',
        listId: id,
        itemId: it.id,
        patch: { qty: it.qty - 1 }
      });
    }
  }

  function askDeleteList() {
    confirm({
      title: 'حذف لیست',
      message: `لیست «${list.name}» و همهٔ کالاهایش حذف شود؟`,
      confirmText: 'حذف',
      danger: true
    }).then((ok) => {
      if (ok) {
        dispatch({ type: 'DELETE_LIST', id: list.id });
        closeList();
        toast('لیست حذف شد');
      }
    });
  }

  return (
    <div className="detail">
      <header className="detail-header">
        <button className="icon-btn" onClick={closeList} aria-label="بازگشت">
          →
        </button>
        <button
          className="dh-title"
          onClick={() => setRenaming(true)}
          title="تغییر نام لیست"
        >
          <b>
            {list.emoji} {list.name}
          </b>
        </button>
        <button
          className="icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="گزینه‌های لیست"
        >
          ⋮
        </button>
      </header>

      <div className="detail-progress">
        <div className="dp-row">
          <span>
            {total === 0
              ? 'هنوز کالایی اضافه نشده'
              : `${faNum(done)} از ${faNum(total)} کالا خریداری شده`}
          </span>
          <b>{faNum(pct)}٪</b>
        </div>
        <Progress pct={pct} />
        <label className="dp-toggle">
          <input
            type="checkbox"
            checked={state.settings.showPurchased}
            onChange={(e) =>
              dispatch({ type: 'SET_SHOW_PURCHASED', v: e.target.checked })
            }
          />
          <span>نمایش کالاهای خریداری‌شده</span>
        </label>
      </div>

      <main className="detail-list">
        {total === 0 ? (
          <EmptyState
            icon="🛍️"
            title="لیست خالیه"
            text="با «+» پایین کالا اضافه کن یا سریع جست‌وجو کن."
          />
        ) : shown.length === 0 ? (
          <EmptyState
            icon="✅"
            title="همه خرید شد!"
            text="برای دیدن کالاهای خریداری‌شده، گزینهٔ بالای صفحه رو روشن کن."
          />
        ) : (
          shown.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              onToggle={() =>
                dispatch({ type: 'TOGGLE_ITEM', listId: id, itemId: it.id })
              }
              onInc={() => inc(it)}
              onDec={() => dec(it)}
              onSetQty={(v) =>
                dispatch({
                  type: 'UPDATE_ITEM',
                  listId: id,
                  itemId: it.id,
                  patch: { qty: v }
                })
              }
              onOpen={() => setEditingItem(it.id)}
            />
          ))
        )}
      </main>

      <div className="summary-bar">
        <div className="sb-main">
          <span className="sb-label">مجموع تقریبی</span>
          <b className="sb-value">
            {pricedCount > 0 ? faMoney(totalMoney) : '—'}
          </b>
        </div>
        <div className="sb-note">
          {pricedCount === 0
            ? 'برای محاسبهٔ مجموع، قیمت حداقل یک کالا رو ثبت کن'
            : unpricedCount > 0
              ? `فقط روی ${faNum(pricedCount)} کالا با قیمت · ${faNum(
                  unpricedCount
                )} کالا بدون قیمت`
              : 'قیمت‌ها تخمینی است؛ قیمت واقعی فروشگاه نیست'}
        </div>
      </div>

      <Fab label="افزودن کالا" onClick={() => setAdding(true)} />

      {adding && <AddItemSheet listId={id} onClose={() => setAdding(false)} />}
      {editingItem && (
        <ItemEditSheet
          listId={id}
          itemId={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
      {menuOpen && (
        <ListMenuSheet
          list={list}
          onClose={() => setMenuOpen(false)}
          onRename={() => {
            setRenaming(true);
            setMenuOpen(false);
          }}
          onDelete={askDeleteList}
        />
      )}
      {renaming && (
        <RenameListSheet list={list} onClose={() => setRenaming(false)} />
      )}
    </div>
  );
}
