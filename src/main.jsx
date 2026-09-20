import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// به اسکریپت محافظ صفحهٔ بارگذاری (index.html) خبر می‌دهیم که برنامه بالا آمد
window.__kharidinoMounted = true;

// فراخوانی صریح لازم است؛ import تنها سرویس‌ورکر را ثبت نمی‌کند.
registerSW({
  onRegisterError(error) {
    console.error('Service worker registration failed:', error);
  }
});
