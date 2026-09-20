// تست‌های منطق هر دو قابلیت:
// ۱) ستاره‌دار کردن چند کالا بدون جایگزین‌شدن کالاهای قبلی
// ۲) شخصی‌سازی/ویرایش کالاهای «فهرست کالاها» (کالای پیش‌فرض، شخصی)

import assert from 'node:assert/strict';
import test from 'node:test';

import { addFavorite } from '../src/lib/merge.js';
import {
  BUILTIN_ITEMS,
  overrideKey,
  personalizedBuiltins
} from '../src/lib/catalog.js';
import { normalizeState, STORAGE_KEY } from '../src/lib/storage.js';
import { normKey } from '../src/lib/utils.js';

const milk = () => ({ name: 'شیر', emoji: '🥛', unit: 'لیتر', cat: 'supermarket' });

test('ستاره‌دار کردن چند کالا، کالاهای قبلی را حذف نمی‌کند', () => {
  let favorites = [];
  for (const f of [
    milk(),
    { name: 'نان', emoji: '🥖', unit: 'عدد', cat: 'supermarket' },
    { name: 'موز', emoji: '🍌', unit: 'عدد', cat: 'produce' }
  ]) {
    favorites = addFavorite(favorites, f);
  }
  assert.equal(favorites.length, 3);
  assert.deepEqual(
    favorites.map((f) => f.name),
    ['شیر', 'نان', 'موز']
  );
});

test('هر کالای ستاره‌دار رکورد مستقل با id یکتا دارد', () => {
  const favorites = addFavorite(addFavorite([], milk()), {
    name: 'پنیر',
    emoji: '🧀',
    unit: 'کیلو',
    cat: 'supermarket'
  });
  const ids = favorites.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of favorites) assert.ok(f.id, 'id ندارد');
  // مشخصات سایر کالاها دست‌نخورده می‌ماند
  assert.equal(favorites[0].unit, 'لیتر');
  assert.equal(favorites[1].unit, 'کیلو');
});

test('کالای تکراری دوباره به «کالاهای من» اضافه نمی‌شود', () => {
  const once = addFavorite([], milk());
  const twice = addFavorite(once, { ...milk(), unit: 'بطری' });
  assert.equal(twice, once, 'آرایه نباید با نسخهٔ تکراری عوض شود');
  assert.equal(twice.length, 1);
  // تطبیق نرم: ي/ی و نیم‌فاصله یکسان حساب می‌شوند
  assert.equal(addFavorite(once, { name: 'شير' }).length, 1);
});

test('بدون نام، چیزی اضافه نمی‌شود و آرایهٔ قبلی برمی‌گردد', () => {
  const once = addFavorite([], milk());
  assert.equal(addFavorite(once, { name: '   ' }), once);
  assert.equal(addFavorite(once, null), once);
});

test('مقدار پیش‌فرض و قیمت و یادداشت کالای من حفظ می‌شود', () => {
  const list = addFavorite([], { ...milk(), qty: 2, price: 32000, note: 'کم‌چرب' });
  assert.equal(list[0].qty, 2);
  assert.equal(list[0].price, 32000);
  assert.equal(list[0].note, 'کم‌چرب');
});

test('کالاهای پیش‌فرض بدون Override دست‌نخورده می‌مانند', () => {
  const builtins = personalizedBuiltins({});
  assert.equal(builtins.length, BUILTIN_ITEMS.length);
  const milkBuiltin = builtins.find((b) => b.ovKey === overrideKey('شیر'));
  assert.equal(milkBuiltin.unit, 'لیتر');
  assert.equal(milkBuiltin.overridden, false);
  assert.equal(milkBuiltin.qty, undefined);
});

test('ویرایش کالای پیش‌فرض فقط نسخهٔ شخصی‌شده را عوض می‌کند', () => {
  const overrides = {
    [overrideKey('شیر')]: {
      name: 'شیر',
      emoji: '🥛',
      unit: 'بطری',
      cat: 'supermarket',
      qty: 1
    }
  };
  const builtins = personalizedBuiltins(overrides);
  const personalized = builtins.find((b) => b.ovKey === overrideKey('شیر'));
  assert.equal(personalized.unit, 'بطری');
  assert.equal(personalized.overridden, true);
  // کاتالوگ پیش‌فرض برنامه تغییر نکرده است
  const original = BUILTIN_ITEMS.find((b) => normKey(b.name) === normKey('شیر'));
  assert.equal(original.unit, 'لیتر');
  // سایر کالاها دست‌نخورده‌اند
  const bread = builtins.find((b) => b.ovKey === overrideKey('نان'));
  assert.equal(bread.unit, 'عدد');
});

test('نام شخصی‌شده جای نام پیش‌فرض را می‌گیرد ولی کلید Override ثابت می‌ماند', () => {
  const key = overrideKey('نان');
  const [bread] = personalizedBuiltins({
    [key]: {
      name: 'نان سنگک',
      emoji: '🥖',
      unit: 'عدد',
      cat: 'supermarket',
      qty: 2
    }
  }).filter((b) => b.ovKey === key);
  assert.equal(bread.name, 'نان سنگک');
  assert.equal(bread.defaultName, 'نان');
  assert.equal(bread.qty, 2);
});

test('ذخیره و بازخوانی Override (ماندگاری بعد از Refresh)', () => {
  const raw = {
    favorites: [{ id: 'f1', name: 'شیر', emoji: '🥛', unit: 'بطری', cat: 'supermarket', qty: 1 }],
    customItems: [],
    catalogOverrides: {
      [overrideKey('نان')]: { name: 'نان', emoji: '🥖', unit: 'بسته', cat: 'supermarket', qty: 2 }
    },
    settings: { theme: 'light' }
  };
  const state = normalizeState(raw);
  assert.equal(state.catalogOverrides[overrideKey('نان')].unit, 'بسته');
  assert.equal(state.catalogOverrides[overrideKey('نان')].qty, 2);
  // ذخیره و خواندن دوباره چیزی را از دست نمی‌دهد
  const again = normalizeState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(again.catalogOverrides, state.catalogOverrides);
  assert.equal(again.favorites.length, 1);
});

test('دادهٔ قدیمی کاربران (بدون Override) بدون خطا و بدون از‌دست‌دادن داده خوانده می‌شود', () => {
  const legacy = {
    lists: [
      {
        id: 'l1',
        name: 'خرید هفتگی',
        emoji: '🛒',
        items: [{ id: 'i1', name: 'شیر', emoji: '🥛', unit: 'لیتر', cat: 'supermarket', qty: 2 }]
      }
    ],
    favorites: [{ id: 'f1', name: 'برنج', emoji: '🍚', unit: 'کیلو', cat: 'supermarket', qty: 1 }],
    customItems: [{ id: 'c1', name: 'کرهٔ بادام', emoji: '🥜', unit: 'بسته', cat: 'supermarket' }],
    settings: { theme: 'dark', showPurchased: true }
  };
  const state = normalizeState(legacy);
  assert.deepEqual(state.catalogOverrides, {});
  assert.equal(state.lists[0].items[0].name, 'شیر');
  assert.equal(state.favorites.length, 1);
  // کالای شخصی بدون مقدار پیش‌فرض هم مقدار معتبر می‌گیرد
  assert.equal(state.customItems[0].qty, 1);
});

test('Override ناقص یا بی‌ربط ذخیره نمی‌شود', () => {
  const state = normalizeState({
    favorites: [],
    catalogOverrides: {
      [overrideKey('شیر')]: { name: 'شیر بطری', unit: 'بطری', qty: 9999 },
      broken: null,
      nameless: { unit: 'کیلو' }
    },
    settings: {}
  });
  assert.equal(Object.keys(state.catalogOverrides).length, 1);
  assert.equal(state.catalogOverrides[overrideKey('شیر')].qty, 999);
  assert.equal(state.catalogOverrides[overrideKey('شیر')].emoji, '📦');
});

test('کلید حافظه تغییر نکرده است (دادهٔ کاربران حفظ می‌شود)', () => {
  assert.equal(STORAGE_KEY, 'kharidino.v1');
});
