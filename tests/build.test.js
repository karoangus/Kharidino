import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

// Pages hosts the app below /Kharidino/, not at the origin root.
test('production HTML loads compiled assets inside the deployment subpath', async () => {
  const html = await read('index.html');
  assert.doesNotMatch(html, /\/src\/main\.jsx/);
  const assets = [...html.matchAll(/(?:src|href)="([^" ]+)"/g)].map((m) => m[1]);
  assert.ok(assets.some((url) => /assets\/.*\.js$/.test(url)));
  for (const asset of assets) {
    const url = new URL(asset, 'https://example.org/Kharidino/');
    assert.ok(url.pathname.startsWith('/Kharidino/'), asset);
    await access(new URL(`../dist/${url.pathname.slice('/Kharidino/'.length)}`, import.meta.url));
  }
});

test('production bundle includes actual service worker registration', async () => {
  const files = await readdir(new URL('../dist/assets/', import.meta.url));
  const js = (await Promise.all(files.filter((f) => f.endsWith('.js')).map((f) => read(`assets/${f}`)))).join('\n');
  // A bare import of virtual:pwa-register gets tree-shaken and fails this test.
  assert.match(js, /serviceWorker\.register\(/);
  assert.match(js, /sw\.js/);
  const worker = await read('sw.js');
  assert.match(worker, /precacheAndRoute/);
  assert.match(worker, /index\.html/);
  assert.match(worker, /assets\/index-.*\.js/);
});

test('install manifest and icons work at the Pages subpath', async () => {
  const manifest = JSON.parse(await read('manifest.webmanifest'));
  assert.equal(manifest.start_url, './');
  assert.equal(manifest.scope, './');
  assert.equal(manifest.display, 'standalone');
  for (const icon of manifest.icons) {
    assert.ok(!icon.src.startsWith('/'));
    await access(new URL(`../dist/${icon.src}`, import.meta.url));
  }
});
