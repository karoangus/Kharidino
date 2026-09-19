// استोर برنامه: state + reducer + context + پایداری + تم + نصب PWA

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { seedState } from '../lib/sample.js';
import { normKey, uid } from '../lib/utils.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#101318',
  neon: '#120e1d',
  amoled: '#000000'
};

function initState() {
  const stored = loadState();
  if (stored && !stored.corrupted) return stored;
  if (stored && stored.corrupted) return { ...seedState(), corrupted: true };
  return seedState();
}

function touch(list) {
  return { ...list, updatedAt: Date.now() };
}

/** افزودن کالا با ادغام هوشمند: اگر قبلاً بود، تعداد جمع می‌شود */
function withItem(list, item) {
  const key = normKey(item.name);
  const idx = list.items.findIndex((it) => normKey(it.name) === key);
  let items;
  if (idx >= 0) {
    items = list.items.map((it, i) =>
      i === idx
        ? {
            ...it,
            qty: Math.min(it.qty + item.qty, 999),
            price: it.price > 0 ? it.price : item.price > 0 ? item.price : 0,
            note: it.note || item.note || '',
            purchased: false
          }
        : it
    );
  } else {
    items = [...list.items, { ...item, id: uid(), createdAt: Date.now() }];
  }
  return touch({ ...list, items });
}

function pushRecent(recent, item) {
  const key = normKey(item.name);
  const entry = {
    name: item.name,
    emoji: item.emoji,
    unit: item.unit,
    cat: item.cat,
    ts: Date.now()
  };
  const rest = (recent || []).filter((e) => normKey(e.name) !== key);
  return [entry, ...rest].slice(0, 12);
}

function reducer(state, a) {
  switch (a.type) {
    case 'NEW_LIST':
      return {
        ...state,
        lists: [
          {
            id: a.id,
            name: a.name,
            emoji: a.emoji,
            items: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          ...state.lists
        ]
      };
    case 'RENAME_LIST':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === a.id
            ? touch({ ...l, name: a.name, emoji: a.emoji ?? l.emoji })
            : l
        )
      };
    case 'DELETE_LIST':
      return { ...state, lists: state.lists.filter((l) => l.id !== a.id) };
    case 'ADD_ITEM':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === a.listId ? withItem(l, a.item) : l
        ),
        recentItems: pushRecent(state.recentItems, a.item)
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id !== a.listId
            ? l
            : touch({
                ...l,
                items: l.items.map((it) =>
                  it.id === a.itemId ? { ...it, ...a.patch } : it
                )
              })
        )
      };
    case 'TOGGLE_ITEM':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id !== a.listId
            ? l
            : touch({
                ...l,
                items: l.items.map((it) =>
                  it.id === a.itemId ? { ...it, purchased: !it.purchased } : it
                )
              })
        )
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id !== a.listId
            ? l
            : touch({ ...l, items: l.items.filter((it) => it.id !== a.itemId) })
        )
      };
    case 'ADD_FAVORITE':
      if (
        state.favorites.some((f) => normKey(f.name) === normKey(a.fav.name))
      )
        return state;
      return {
        ...state,
        favorites: [{ id: uid(), qty: 1, price: 0, note: '', ...a.fav }]
      };
    case 'UPDATE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.map((f) =>
          f.id === a.id ? { ...f, ...a.patch } : f
        )
      };
    case 'DELETE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter((f) => f.id !== a.id)
      };
    case 'TOGGLE_FAV': {
      const key = normKey(a.item.name);
      const existing = state.favorites.find((f) => normKey(f.name) === key);
      if (existing)
        return {
          ...state,
          favorites: state.favorites.filter((f) => f.id !== existing.id)
        };
      return {
        ...state,
        favorites: [
          {
            id: uid(),
            name: a.item.name,
            emoji: a.item.emoji || '📦',
            unit: a.item.unit || 'عدد',
            cat: a.item.cat || 'other',
            qty: a.item.qty || 1,
            price: a.item.price || 0,
            note: a.item.note || ''
          },
          ...state.favorites
        ]
      };
    }
    case 'ADD_CUSTOM':
      if (
        state.customItems.some(
          (c) => normKey(c.name) === normKey(a.item.name)
        )
      )
        return state;
      return { ...state, customItems: [a.item, ...state.customItems] };
    case 'DELETE_CUSTOM':
      return {
        ...state,
        customItems: state.customItems.filter((c) => c.id !== a.id)
      };
    case 'SET_THEME':
      return {
        ...state,
        settings: { ...state.settings, theme: a.theme }
      };
    case 'SET_SHOW_PURCHASED':
      return {
        ...state,
        settings: { ...state.settings, showPurchased: a.v }
      };
    case 'CLEAR_SAMPLES':
      return {
        ...state,
        lists: state.lists.filter(
          (l) => !(state.sampleListIds || []).includes(l.id)
        ),
        sampleListIds: []
      };
    case 'RESET_ALL':
      return {
        lists: [],
        favorites: [],
        customItems: [],
        recentItems: [],
        sampleListIds: [],
        settings: state.settings,
        corrupted: false
      };
    case 'IMPORT': {
      const d = a.data || {};
      return {
        lists: Array.isArray(d.lists) ? d.lists : [],
        favorites: Array.isArray(d.favorites) ? d.favorites : [],
        customItems: Array.isArray(d.customItems) ? d.customItems : [],
        recentItems: Array.isArray(d.recentItems) ? d.recentItems : [],
        sampleListIds: Array.isArray(d.sampleListIds) ? d.sampleListIds : [],
        settings: { theme: 'light', showPurchased: true, ...(d.settings || {}) },
        corrupted: false
      };
    }
    case 'DISMISS_CORRUPT':
      return { ...state, corrupted: false };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const [route, setRoute] = useState({ tab: 'lists', openListId: null });
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const [confirmReq, setConfirmReq] = useState(null);
  const confirmReqRef = useRef(null);
  const [installEvt, setInstallEvt] = useState(null);

  // پایداری: هر تغییری روی دستگاه ذخیره می‌شود
  useEffect(() => {
    if (!state.corrupted) saveState(state);
  }, [state]);

  // اعمال تم
  useEffect(() => {
    const t = state.settings?.theme || 'light';
    document.documentElement.dataset.theme = t;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[t] || '#16a34a';
  }, [state.settings?.theme]);

  const toast = useCallback((text) => {
    setToastMsg({ text, key: Date.now() });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2100);
  }, []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        confirmReqRef.current = { opts, resolve };
        setConfirmReq({ opts, resolve });
      }),
    []
  );

  const settleConfirm = useCallback((val) => {
    const cur = confirmReqRef.current;
    confirmReqRef.current = null;
    setConfirmReq(null);
    if (cur) cur.resolve(val);
  }, []);

  // رویدادهای نصب PWA
  useEffect(() => {
    const onBip = (e) => {
      e.preventDefault();
      setInstallEvt(e);
    };
    const onInstalled = () => {
      setInstallEvt(null);
      toast('خریدینو نصب شد ✓');
    };
    window.addEventListener('beforeinstallprompt', onBip);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [toast]);

  const promptInstall = useCallback(async () => {
    if (!installEvt) return;
    installEvt.prompt();
    const choice = await installEvt.userChoice;
    if (choice.outcome === 'accepted') toast('خریدینو نصب شد ✓');
    setInstallEvt(null);
  }, [installEvt, toast]);

  const openList = useCallback(
    (id) => setRoute((r) => ({ ...r, openListId: id })),
    []
  );
  const closeList = useCallback(
    () => setRoute((r) => ({ ...r, openListId: null })),
    []
  );
  const setTab = useCallback((tab) => setRoute({ tab, openListId: null }), []);

  const value = {
    state,
    dispatch,
    route,
    openList,
    closeList,
    setTab,
    toast,
    confirm,
    confirmReq,
    settleConfirm,
    installEvt,
    promptInstall
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
