import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  server: {
    host: true,
    allowedHosts: true
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        id: './',
        name: 'خریدینو — Kharidino',
        short_name: 'خریدینو',
        description: 'لیست خرید سریع و ساده؛ خریدت رو ساده کن.',
        lang: 'fa',
        dir: 'rtl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f4f6f8',
        theme_color: '#16a34a',
        prefer_related_applications: false,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/apple-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico,json}'],
        navigateFallback: 'index.html',
        clientsClaim: true,
        skipWaiting: true
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 900
  }
});
