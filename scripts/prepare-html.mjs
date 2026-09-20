// نگهبان فایل index.html
//
// index.html در ریشهٔ پروژه هم «ورودی Vite» است و هم روی شاخهٔ main محل
// انتشار خروجی build برای حالت legacy گیت‌هاب‌پیجز؛ مرحلهٔ انتشار،
// index.html را با نسخهٔ ساخته‌شده جایگزین می‌کند. این اسکریپت قبل از هر
// dev/build اجرا می‌شود تا نسخهٔ سورس هرگز گم نشود:
//
//   • اگر index.html سورس باشد (ورودی ./src/main.jsx را داشته باشد)،
//     نسخهٔ پشتیبان index.source.html به‌روز می‌شود.
//   • اگر index.html خروجی build باشد، از پشتیبان بازسازی می‌شود.
//
// نتیجه: build همیشه کار می‌کند، هم روی دستگاه خودت و هم در CI.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const target = path.join(root, 'index.html');
const backup = path.join(root, 'index.source.html');

/** فایل سورس، ورودی ماژول React را دارد؛ خروجی build فایل هش‌دار دارد */
const SOURCE_ENTRY = /<script[^>]+src=["']\.?\/?src\/main\.jsx["']/;
const isSource = (html) => SOURCE_ENTRY.test(html);

const read = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '');

const targetHtml = read(target);
const backupHtml = read(backup);

if (isSource(targetHtml)) {
  if (targetHtml !== backupHtml) {
    writeFileSync(backup, targetHtml);
    console.log('[خریدینو] نسخهٔ پشتیبان index.source.html به‌روز شد.');
  }
} else if (isSource(backupHtml)) {
  writeFileSync(target, backupHtml);
  console.log(
    '[خریدینو] index.html توسط مرحلهٔ انتشار Pages بازنویسی شده بود و از نسخهٔ پشتیبان بازسازی شد.'
  );
} else {
  console.error(
    '[خریدینو] نسخهٔ سورس index.html پیدا نشد (نه index.html و نه index.source.html ورودی src/main.jsx را ندارند).'
  );
  process.exit(1);
}
