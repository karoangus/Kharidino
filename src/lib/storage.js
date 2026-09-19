// ذخیره‌سازی محلی (کاملاً آفلاین)

const KEY = 'kharidino.v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') throw new Error('bad shape');
    if (!Array.isArray(data.lists) || !Array.isArray(data.favorites)) {
      throw new Error('bad shape');
    }
    return data;
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
