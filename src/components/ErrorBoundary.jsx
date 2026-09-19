// مرز خطا: اگر روزی رندری خطا داد، به‌جای صفحهٔ سفید یک صفحهٔ راهنما نشان بده

import React from 'react';
import { rawState, clearState, STORAGE_KEY } from '../lib/storage.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
    this.reset = this.reset.bind(this);
    this.backup = this.backup.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('خریدینو — خطای رندر:', error, info?.componentStack);
  }

  retry() {
    this.setState({ error: null });
  }

  backup() {
    const raw = rawState();
    if (!raw) return;
    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kharidino-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  reset() {
    clearState();
    this.setState({ error: null });
    if (typeof location !== 'undefined') location.reload();
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="corrupt">
        <div className="corrupt-card">
          <div className="empty-icon" aria-hidden="true">
            🛠️
          </div>
          <b>مشکلی در نمایش صفحه پیش آمد</b>
          <p>
            لیست‌هایت روی همین دستگاه ذخیره شده‌اند و از بین نرفته‌اند. اول
            «تلاش دوباره» را بزن؛ اگر صفحه باز هم باز نشد، پشتیبان بگیر و بعد
            حافظهٔ برنامه را بازنشانی کن.
          </p>
          <button className="btn primary block" onClick={this.retry}>
            تلاش دوباره
          </button>
          <button className="btn ghost block" onClick={this.backup}>
            💾 گرفتن فایل پشتیبان
          </button>
          <button className="btn ghost danger block" onClick={this.reset}>
            بازنشانی حافظه و شروع دوباره
          </button>
          <p className="hint">
            جزئیات خطا در کنسول مرورگر (کلید <code>{STORAGE_KEY}</code>) ثبت
            شده است.
          </p>
        </div>
      </div>
    );
  }
}
