// ذخیره‌سازی محلی (کاملاً آفلاین) + پاک‌سازی و مهاجرت داده‌های قدیمی
//
// نکتهٔ مهم: داده‌ای که از localStorage می‌آید «معتبر» فرض نمی‌شود.
// اگر نسخهٔ قبلی برنامه شکل داده را تغییر داده باشد (مثلاً settings نداشته باشد)،
// normalizeState آن را با مقادیر پیش‌فرض کامل می‌کند تا برنامه هرگز وسط رندر crash نکند.

import { uid } from './utils.js';

const KEY = 'kharidino.v1';

export const STORAGE_KEY = KEY;

export const THEMES = ['light', 'dark', 'neon', 'amoled'];

export const DEFAULT_SETTINGS = { theme: 'light', showPurchased: true };

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
const asArr = (v) => (Array.isArray(v) ? v : []);

const str = (v, fallback = '') =>
  typeof v === 'string' && v.trim() ? v.trim() : fallback;

const cleanId = (v, i) =>
  typeof v === 'string' && v.trim() ? v.trim() : `rec_${i}_${uid()}`;

const toInt = (v, { fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
};

const toBool = (v, fallback = false) =>
  typeof v === 'boolean' ? v : fallback;

function normSettings(raw) {
  const s = isObj(raw) ? raw : {};
  return {
    theme: THEMES.includes(s.theme) ? s.theme : DEFAULT_SETTINGS.theme,
    showPurchased: toBool(s.showPurchased, DEFAULT_SETTINGS.showPurchased)
  };
}

function normItem(raw, i) {
  const it = isObj(raw) ? raw : {};
  return {
    id: cleanId(it.id, i),
    name: str(it.name, 'کالای بدون نام'),
    emoji: str(it.emoji, '📦'),
    unit: str(it.unit, 'عدد'),
    cat: str(it.cat, 'other'),
    qty: toInt(it.qty, { fallback: 1, min: 1, max: 999 }),
    price: toInt(it.price, { fallback: 0, min: 0, max: 9999999999 }),
    note: typeof it.note === 'string' ? it.note : '',
    purchased: !!it.purchased,
    createdAt: toInt(it.createdAt, { fallback: Date.now() })
  };
}

function normList(raw, i) {
  const l = isObj(raw) ? raw : {};
  const now = Date.now();
  return {
    id: cleanId(l.id, i),
    name: str(l.name, 'لیست من'),
    emoji: str(l.emoji, '🛒'),
    createdAt: toInt(l.createdAt, { fallback: now }),
    updatedAt: toInt(l.updatedAt, { fallback: now }),
    items: asArr(l.items).map(normItem)
  };
}

function normFavorite(raw, i) {
  const f = isObj(raw) ? raw : {};
  return {
    id: cleanId(f.id, i),
    name: str(f.name, 'کالای بدون نام'),
    emoji: str(f.emoji, '📦'),
    unit: str(f.unit, 'عدد'),
    cat: str(f.cat, 'other'),
    qty: toInt(f.qty, { fallback: 1, min: 1, max: 999 }),
    price: toInt(f.price, { fallback: 0, min: 0, max: 9999999999 }),
    note: typeof f.note === 'string' ? f.note : ''
  };
}

function normCustom(raw, i) {
  const c = isObj(raw) ? raw : {};
  return {
    id: cleanId(c.id, i),
    name: str(c.name, 'کالای بدون نام'),
    emoji: str(c.emoji, '📦'),
    unit: str(c.unit, 'عدد'),
    cat: str(c.cat, 'other')
  };
}

function normRecent(raw) {
  const r = isObj(raw) ? raw : {};
  return {
    name: str(r.name, ''),
    emoji: str(r.emoji, '📦'),
    unit: str(r.unit, 'عدد'),
    cat: str(r.cat, 'other'),
    ts: toInt(r.ts, { fallback: Date.now() })
  };
}

const KNOWN_KEYS = [
  'lists',
  'favorites',
  'customItems',
  'recentItems',
  'sampleListIds',
  'settings'
];

/**
 * هر ورودی JSON را به یک state سالم و کامل تبدیل می‌کند.
 * اگر ورودی اصلاً به دادهٔ خریدینو شبیه نباشد، null برمی‌گرداند.
 */
export function normalizeState(raw) {
  if (!isObj(raw)) return null;
  if (!KNOWN_KEYS.some((k) => k in raw)) return null;

  return {
    lists: asArr(raw.lists).map(normList),
    favorites: asArr(raw.favorites).map(normFavorite),
    customItems: asArr(raw.customItems).map(normCustom),
    recentItems: asArr(raw.recentItems)
      .map(normRecent)
      .filter((r) => r.name),
    sampleListIds: asArr(raw.sampleListIds).filter((id) => typeof id === 'string'),
    settings: normSettings(raw.settings),
    corrupted: false
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const state = normalizeState(data);
    // دادهٔ غیرقابل‌استفاده → صفحهٔ «حافظهٔ آسیب دیده»
    if (!state) return { corrupted: true };
    return state;
  } catch {
    return { corrupted: true };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

/** متن JSON خام ذخیره‌شده (برای پشتیبان‌گیری دستی) */
export function rawState() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
