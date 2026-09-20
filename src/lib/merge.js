// توابع خالص برای تغییر آرایه‌های state (قابل تست بدون مرورگر)

import { normKey, uid } from './utils.js';

/**
 * افزودن یک کالا به «کالاهای من» ⭐
 *
 * قرارداد:
 * - آیتم جدید به آرایه اضافه می‌شود؛ آرایهٔ قبلی هرگز با یک آرایهٔ تک‌عضوی
 *   جایگزین نمی‌شود، پس کالاهای ستاره‌دار قبلی حذف نمی‌شوند.
 * - هر کالا رکورد مستقل خودش را دارد (id یکتا).
 * - کالای تکراری (با تطبیق نرم نام) دوباره اضافه نمی‌شود.
 * - اگر تغییری لازم نباشد، همان آرایهٔ ورودی برگردانده می‌شود تا state
 *   بی‌دلیل عوض نشود.
 */
export function addFavorite(favorites, fav) {
  const list = Array.isArray(favorites) ? favorites : [];
  const src = fav && typeof fav === 'object' ? fav : {};
  const key = normKey(src.name || '');
  if (!key) return list;
  if (list.some((f) => normKey((f && f.name) || '') === key)) return list;
  // id در انتها می‌آید تا همیشه یکتا بماند
  return [...list, { qty: 1, price: 0, note: '', ...src, id: uid() }];
}
