// داده‌های نمونهٔ اولیه (قابل حذف از تنظیمات)

import { uid } from './utils.js';

export function seedState() {
  const now = Date.now();
  const weeklyId = uid();
  const monthlyId = uid();

  const item = (name, emoji, unit, cat, qty, price, note, purchased) => ({
    id: uid(),
    name,
    emoji,
    unit,
    cat,
    qty,
    price: price || 0,
    note: note || '',
    purchased: !!purchased,
    createdAt: now
  });

  const lists = [
    {
      id: weeklyId,
      name: 'خرید هفتگی',
      emoji: '🛒',
      createdAt: now - 86400000 * 2,
      updatedAt: now - 1000 * 60 * 35,
      items: [
        item('شیر', '🥛', 'لیتر', 'supermarket', 2, 32000, '', true),
        item('نان', '🥖', 'عدد', 'supermarket', 2, 15000, '', true),
        item('تخم‌مرغ', '🥚', 'بسته', 'supermarket', 1, 95000, ''),
        item('موز', '🍌', 'عدد', 'produce', 6, 38000, 'بلند و نو'),
        item('برنج', '🍚', 'کیلو', 'supermarket', 1, 180000, 'کله‌قند')
      ]
    },
    {
      id: monthlyId,
      name: 'خرید ماهانه',
      emoji: '🧺',
      createdAt: now - 86400000 * 6,
      updatedAt: now - 1000 * 60 * 60 * 26,
      items: [
        item('روغن', '🫙', 'لیتر', 'supermarket', 2, 75000, '', true),
        item('ماکارونی', '🍝', 'بسته', 'supermarket', 3, 35000, '', true),
        item('عدس', '🫘', 'کیلو', 'supermarket', 2, 98000, ''),
        item('چای', '🍵', 'بسته', 'supermarket', 1, 120000, 'اروپایی'),
        item('برنج', '🍚', 'کیلو', 'supermarket', 5, 0, '')
      ]
    }
  ];

  const fav = (name, emoji, unit, cat, qty) => ({
    id: uid(),
    name,
    emoji,
    unit,
    cat,
    qty,
    price: 0,
    note: ''
  });

  const favorites = [
    fav('شیر', '🥛', 'لیتر', 'supermarket', 2),
    fav('نان', '🥖', 'عدد', 'supermarket', 2),
    fav('تخم‌مرغ', '🥚', 'بسته', 'supermarket', 1),
    fav('برنج', '🍚', 'کیلو', 'supermarket', 1),
    fav('موز', '🍌', 'عدد', 'produce', 5)
  ];

  return {
    lists,
    favorites,
    customItems: [],
    recentItems: [],
    sampleListIds: [weeklyId, monthlyId],
    settings: { theme: 'light', showPurchased: true }
  };
}
