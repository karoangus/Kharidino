// ابزارهای مشترک: اعداد فارسی، زمان نسبی، تطبیق نام و...

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** تبدیل اعداد فارسی/عربی به لاتین (برای پردازش ورودی) */
export function toLatinDigits(value) {
  return String(value)
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/−/g, '-');
}

const nf = new Intl.NumberFormat('fa-IR');

/** نمایش عدد با ارقام فارسی و جداکنندهٔ هزارگان */
export const faNum = (n) => nf.format(n);

/** نمایش مبلغ به تومان */
export const faMoney = (n) => `${nf.format(Math.round(n))} تومان`;

/**
 * تطبیق نام برای جست‌وجو:
 * ی/ي و ک/ك یکسان می‌شوند، نیم‌فاصله و فاصله حذف می‌شوند.
 */
export function normKey(s = '') {
  return String(s)
    .replace(/[يی]/g, 'ي')
    .replace(/[كك]/g, 'ك')
    .replace(/‌/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/** «۳۵ دقیقه پیش»، «امروز ۱۴:۳۰»، «دیروز»، «۱۲ مهر» ... */
export function relTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffSec = (now.getTime() - d.getTime()) / 1000;
  if (diffSec < 60) return 'همین حالا';
  if (diffSec < 3600) return `${faNum(Math.floor(diffSec / 60))} دقیقه پیش`;
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'دیروز';
  if (sameDay) {
    const time = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
    return `امروز ${time}`;
  }
  return new Intl.DateTimeFormat('fa-IR', {
    day: 'numeric',
    month: 'numeric'
  }).format(d);
}
